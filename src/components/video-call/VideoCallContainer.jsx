import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useVideoCall } from '../../hooks/useVideoCall';
import useVideoCallV2 from '../../hooks/useVideoCallV2';
import VideoCallHeader from './VideoCallHeader';
import VideoCallControls from './VideoCallControls';
import LacLacMascot from '../LacLacMascot';

const USE_DUAL_MODEL = process.env.REACT_APP_USE_DUAL_MODEL_VIDEO_CALL === 'true';
const WAVE_BARS = 9;

const SpeakingWave = ({ className = '', analyserNode = null }) => {
  const [levels, setLevels] = useState(() => Array.from({ length: WAVE_BARS }, () => 0.12));

  useEffect(() => {
    let frameId;
    let fallbackTimer;

    if (!analyserNode) {
      fallbackTimer = setInterval(() => {
        setLevels((prev) => prev.map((_, index) => 0.12 + (Math.sin(Date.now() / 220 + index) + 1) * 0.14));
      }, 120);

      return () => clearInterval(fallbackTimer);
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const bandSize = Math.max(1, Math.floor(bufferLength / WAVE_BARS));

    const updateLevels = () => {
      analyserNode.getByteFrequencyData(dataArray);

      const next = [];
      for (let i = 0; i < WAVE_BARS; i += 1) {
        const start = i * bandSize;
        const end = Math.min(start + bandSize, bufferLength);
        let sum = 0;

        for (let j = start; j < end; j += 1) {
          sum += dataArray[j];
        }

        const avg = end > start ? sum / (end - start) : 0;
        const normalized = Math.min(1, avg / 180);
        next.push(Math.max(0.1, normalized));
      }

      setLevels(next);
      frameId = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [analyserNode]);

  return (
    <div
      className={`rounded-2xl border border-cyan-200/40 bg-[#09111b]/78 px-4 py-2 backdrop-blur-md shadow-[0_0_28px_rgba(42,206,221,0.3)] ${className}`}
    >
      <p className="text-[11px] text-cyan-100/90 text-center mb-1">AI đang nói...</p>
      <div className="flex items-end gap-1.5 h-8">
        {levels.map((level, index) => (
          <motion.span
            key={`bar-${index}`}
            className="w-1.5 rounded-full bg-cyan-200/90"
            animate={{
              height: `${8 + level * 24}px`,
              opacity: 0.55 + level * 0.45,
            }}
            transition={{
              duration: 0.12,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};

SpeakingWave.propTypes = {
  className: PropTypes.string,
  analyserNode: PropTypes.object,
};

class DualModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DualModelErrorBoundary] Caught error in dual-model implementation:', error, errorInfo);

    this.setState({ errorInfo });

    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          feature: 'video-call',
          implementation: 'dual-model',
          component: 'VideoCallContainer',
        },
        extra: {
          errorInfo,
          componentStack: errorInfo?.componentStack,
        },
      });
    }

    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 bg-[#1A1C1E] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-red-500 text-xl mb-4">Lỗi trong phiên bản mới</div>
            <div className="text-white/70 mb-6">Đang chuyển về phiên bản cũ...</div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const VideoCallContainer = ({ userName, onClose, onUsage = () => {} }) => {
  const [useLegacy, setUseLegacy] = useState(false);
  const shouldUseDualModel = USE_DUAL_MODEL && !useLegacy;

  useEffect(() => {
    const implementation = shouldUseDualModel ? 'DUAL-MODEL' : 'LEGACY';
    console.log(`[VideoCallContainer] Using ${implementation} implementation`);
    console.log(
      `[VideoCallContainer] Feature flag REACT_APP_USE_DUAL_MODEL_VIDEO_CALL=${process.env.REACT_APP_USE_DUAL_MODEL_VIDEO_CALL}`,
    );

    if (useLegacy && USE_DUAL_MODEL) {
      console.warn('[VideoCallContainer] Fell back to LEGACY due to error in DUAL-MODEL');
    }
  }, [shouldUseDualModel, useLegacy]);

  const handleDualModelError = (error) => {
    console.error('[VideoCallContainer] Dual-model implementation failed, falling back to legacy:', error);
    setUseLegacy(true);

    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          feature: 'video-call',
          implementation: 'dual-model',
          action: 'fallback-to-legacy',
        },
        extra: {
          userName,
          errorMessage: error?.message,
        },
      });
    }
  };

  const hookToUse = shouldUseDualModel ? useVideoCallV2 : useVideoCall;

  const {
    status,
    isCameraOn,
    facingMode,
    isSimulationMode,
    flash,
    videoRef,
    canvasRef,
    startSession,
    stopSession,
    toggleCamera,
    switchCamera,
    captureAndAnalyze,
    uploadAndAnalyze,
    outputAnalyser,
    canCapture,
  } = hookToUse(userName, onUsage);

  useEffect(() => {
    let mounted = true;
    let sessionStarted = false;

    const initSession = async () => {
      if (mounted) {
        await startSession();
        sessionStarted = true;
      }
    };

    initSession();

    return () => {
      mounted = false;
      if (sessionStarted) {
        console.log('VideoCallContainer unmounting, stopping session');
        stopSession();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    stopSession();
    onClose();
  };

  const content = (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif',
        background: 'radial-gradient(circle at 12% 0%, #213649 0%, #0a1018 38%, #05080d 100%)',
      }}
    >
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-24 right-5 z-50 px-3 py-1 rounded-full border border-white/20 bg-black/50 text-white/70 text-xs">
          {shouldUseDualModel ? 'Dual-Model' : 'Legacy'}
          {useLegacy && USE_DUAL_MODEL && ' (Fallback)'}
        </div>
      )}

      <div className="pointer-events-none absolute -top-16 -left-12 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 -right-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

      <VideoCallHeader
        status={status}
        userName={userName}
        isSimulationMode={isSimulationMode}
        onClose={handleClose}
      />

      <div className="relative flex-1 px-3 pt-[88px] sm:px-5 sm:pt-[104px] pb-2">
        <div className="relative h-full overflow-hidden rounded-[1.8rem] border border-white/15 bg-black/30 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#101a26]/20 via-[#070b11]/10 to-[#04060a]/80" />

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              opacity: isCameraOn ? 1 : 0,
              transition: 'opacity 0.45s ease',
            }}
          />

          <canvas ref={canvasRef} className="hidden" />

          <div
            className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150 ${
              flash ? 'opacity-80' : 'opacity-0'
            }`}
          />

          {!isCameraOn && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 text-center px-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <LacLacMascot status={status} size="large" />
                <SpeakingWave analyserNode={outputAnalyser} />
              </div>
              <div>
                <p className="text-white text-base sm:text-lg font-semibold">Camera đang tắt</p>
                <p className="text-white/70 text-sm mt-1">Bật camera hoặc tải ảnh lên để AI phân tích.</p>
              </div>
            </div>
          )}

          {isCameraOn && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-6">
                <div className="w-[min(70vw,22rem)] aspect-square border border-cyan-200/35 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-cyan-200 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-cyan-200 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-cyan-200 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-cyan-200 rounded-br-xl" />
                  <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-cyan-100/70 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="absolute left-4 bottom-4 z-20 rounded-xl border border-white/20 bg-[#0b121c]/65 px-3 py-2 backdrop-blur-md">
                <p className="text-[11px] text-white/60 uppercase tracking-wide">Hướng dẫn</p>
                <p className="text-xs text-white/85 mt-1">Đặt nông sản vào khung để nhận diện nhanh hơn.</p>
              </div>
            </>
          )}

          {isCameraOn && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <SpeakingWave className="translate-y-24" analyserNode={outputAnalyser} />
            </div>
          )}
        </div>
      </div>

      <VideoCallControls
        isCameraOn={isCameraOn}
        canCapture={canCapture}
        onToggleCamera={toggleCamera}
        onSwitchCamera={switchCamera}
        onCapture={captureAndAnalyze}
        onUploadImage={uploadAndAnalyze}
        onEndCall={handleClose}
      />
    </div>
  );

  if (shouldUseDualModel) {
    return <DualModelErrorBoundary onError={handleDualModelError}>{content}</DualModelErrorBoundary>;
  }

  return content;
};

VideoCallContainer.propTypes = {
  userName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onUsage: PropTypes.func,
};

export default VideoCallContainer;
