import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useVideoCall } from '../../hooks/useVideoCall';
import useVideoCallV2 from '../../hooks/useVideoCallV2';
import VideoCallHeader from './VideoCallHeader';
import VideoCallControls from './VideoCallControls';
import LacLacMascot from '../LacLacMascot';

// Feature flag for dual-model video call architecture
const USE_DUAL_MODEL = process.env.REACT_APP_USE_DUAL_MODEL_VIDEO_CALL === 'true';

/**
 * Error Boundary Component for Dual-Model Implementation
 * Catches errors in the new implementation and falls back to legacy
 */
class DualModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DualModelErrorBoundary] Caught error in dual-model implementation:', error, errorInfo);
    
    this.setState({
      errorInfo
    });
    
    // Log to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { 
          feature: 'video-call',
          implementation: 'dual-model',
          component: 'VideoCallContainer'
        },
        extra: { 
          errorInfo,
          componentStack: errorInfo?.componentStack 
        }
      });
    }
    
    // Notify parent to fallback
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 bg-[#1A1C1E] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-red-500 text-xl mb-4">
              Lỗi trong phiên bản mới
            </div>
            <div className="text-white/70 mb-6">
              Đang chuyển về phiên bản cũ...
            </div>
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

/**
 * VideoCallContainer Component
 * 
 * Main container component for AI video call feature.
 * Manages the complete video call lifecycle and coordinates all child components.
 * 
 * Features:
 * - Real-time video streaming with camera control
 * - Audio input/output with AI voice responses
 * - Image capture and AI analysis
 * - Interactive mascot with status feedback
 * - Error handling with simulation mode fallback
 * - Tool calling integration (price lookup, diagnosis, store finder)
 * - Feature flag support for dual-model architecture
 * - Error boundary with automatic fallback to legacy implementation
 * 
 * @component
 * @param {Object} props
 * @param {string} props.userName - User's name for personalized AI interactions
 * @param {Function} props.onClose - Handler for closing the video call
 * @param {Function} props.onUsage - Callback when AI usage occurs (for tracking)
 */
const VideoCallContainer = ({ userName, onClose, onUsage = () => {} }) => {
  // ============================================================================
  // FEATURE FLAG & ERROR HANDLING
  // ============================================================================
  
  // State for fallback management
  const [useLegacy, setUseLegacy] = useState(false);
  
  // Determine which implementation to use
  const shouldUseDualModel = USE_DUAL_MODEL && !useLegacy;
  
  // Log which implementation is active
  useEffect(() => {
    const implementation = shouldUseDualModel ? 'DUAL-MODEL' : 'LEGACY';
    console.log(`[VideoCallContainer] Using ${implementation} implementation`);
    console.log(`[VideoCallContainer] Feature flag REACT_APP_USE_DUAL_MODEL_VIDEO_CALL=${process.env.REACT_APP_USE_DUAL_MODEL_VIDEO_CALL}`);
    
    if (useLegacy && USE_DUAL_MODEL) {
      console.warn('[VideoCallContainer] Fell back to LEGACY due to error in DUAL-MODEL');
    }
  }, [shouldUseDualModel, useLegacy]);
  
  // Handle error from dual-model implementation
  const handleDualModelError = (error) => {
    console.error('[VideoCallContainer] Dual-model implementation failed, falling back to legacy:', error);
    setUseLegacy(true);
    
    // Log to Sentry
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { 
          feature: 'video-call',
          implementation: 'dual-model',
          action: 'fallback-to-legacy'
        },
        extra: { 
          userName,
          errorMessage: error?.message 
        }
      });
    }
  };
  
  // ============================================================================
  // HOOK SELECTION
  // ============================================================================
  
  // Select hook based on feature flag and fallback state
  const hookToUse = shouldUseDualModel ? useVideoCallV2 : useVideoCall;
  
  // ============================================================================
  // HOOK INTEGRATION
  // ============================================================================
  
  const {
    // State
    status,
    isCameraOn,
    facingMode,
    // Note: isMicOn removed - no voice input
    isSimulationMode,
    flash,
    
    // Refs
    videoRef,
    canvasRef,
    
    // Actions
    startSession,
    stopSession,
    toggleCamera,
    switchCamera,
    captureAndAnalyze,
    uploadAndAnalyze,
    // Note: toggleMic removed - no voice input
    
    // Computed
    canCapture,
  } = hookToUse(userName, onUsage);

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================
  
  /**
   * Initialize video call session on mount
   */
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
    
    // Cleanup on unmount
    return () => {
      mounted = false;
      // Only stop if session was actually started
      if (sessionStarted) {
        console.log('VideoCallContainer unmounting, stopping session');
        stopSession();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle close button click
   * Stops session and calls parent onClose handler
   */
  const handleClose = () => {
    stopSession();
    onClose();
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  // Wrap dual-model implementation with error boundary
  const content = (
    <div className="fixed inset-0 z-50 bg-[#1A1C1E] flex flex-col font-sans">
      {/* Implementation indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-16 right-4 z-50 px-3 py-1 bg-black/50 text-white/70 text-xs rounded">
          {shouldUseDualModel ? '🔄 Dual-Model' : '📡 Legacy'}
          {useLegacy && USE_DUAL_MODEL && ' (Fallback)'}
        </div>
      )}
      
      {/* Header */}
      <VideoCallHeader
        status={status}
        isSimulationMode={isSimulationMode}
        onClose={handleClose}
      />

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1C1E] to-[#0D0E0F]"></div>

        {/* Video */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            opacity: isCameraOn ? 1 : 0,
            transition: 'opacity 0.5s'
          }}
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {/* Flash */}
        <div className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150 ${flash ? 'opacity-80' : 'opacity-0'}`}></div>

        {/* Reticle */}
        {isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-72 h-72 border border-white/20 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        )}

        {/* Mascot */}
        {!isCameraOn && (
          <div className="relative z-20 flex flex-col items-center">
            <LacLacMascot status={status} size="large" />
          </div>
        )}
      </div>

      {/* Controls */}
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
  
  // Wrap with error boundary if using dual-model
  if (shouldUseDualModel) {
    return (
      <DualModelErrorBoundary onError={handleDualModelError}>
        {content}
      </DualModelErrorBoundary>
    );
  }
  
  return content;
};

VideoCallContainer.propTypes = {
  userName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onUsage: PropTypes.func,
};

export default VideoCallContainer;
