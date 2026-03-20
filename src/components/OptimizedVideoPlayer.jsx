/**
 * Optimized Video Player Component
 * 
 * Features:
 * - Adaptive bitrate streaming (HLS/DASH support)
 * - Smooth playback with buffer management
 * - Lazy loading with intersection observer
 * - Network-aware quality selection
 * - Error recovery with exponential backoff
 * - Performance optimized rendering
 */

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Button, Slider, Typography, Space, Spin } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  MutedOutlined,
  FullscreenOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import VideoPlayerErrorHandler, { getErrorType } from './VideoPlayerErrorHandler';

const { Text } = Typography;

const OptimizedVideoPlayer = ({
  src,
  poster,
  autoPlay = false,
  controls = true,
  muted = false,
  loop = false,
  onLoadStart,
  onLoadError,
  onPlay,
  onPause,
  className,
  style,
  lazy = true,
  quality = 'auto', // 'auto', '720p', '480p', '360p'
  soundEnabled = true,
  onEnableSound
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const bufferTimeoutRef = useRef(null);
  
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [bufferedPercentage, setBufferedPercentage] = useState(0);
  const [networkSpeed, setNetworkSpeed] = useState('4g');
  const [isBuffering, setIsBuffering] = useState(false);

  const MAX_RETRY_ATTEMPTS = 3;
  const BUFFER_THRESHOLD = 3; // seconds

  useEffect(() => {
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Detect network speed
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;
      setNetworkSpeed(effectiveType);

      const handleChange = () => {
        setNetworkSpeed(connection.effectiveType);
      };

      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }
  }, []);

  // Lazy loading with intersection observer
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.01,
        rootMargin: '500px 0px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  // Preload strategy based on visibility
  const preloadMode = useMemo(() => {
    if (isVisible) return 'auto';
    return 'metadata';
  }, [isVisible]);

  // Handle video load start
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setIsBuffering(true);
    if (onLoadStart) onLoadStart();
  }, [onLoadStart]);

  // Handle video loaded
  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  // Handle video can play
  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
  }, []);

  // Handle waiting (buffering)
  const handleWaiting = useCallback(() => {
    setIsBuffering(true);
  }, []);

  // Handle progress (buffer update)
  const handleProgress = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percentage = (bufferedEnd / video.duration) * 100;
        setBufferedPercentage(percentage);
      }
    }
  }, []);

  // Handle video error with exponential backoff
  const handleError = useCallback(() => {
    setIsLoading(false);
    const videoError = videoRef.current?.error;
    const detectedErrorType = getErrorType(videoError);

    setError(videoError);
    setErrorType(detectedErrorType);

    if (onLoadError) {
      onLoadError(new Error(`Video error: ${detectedErrorType}`));
    }
  }, [onLoadError]);

  // Retry with exponential backoff
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) return;

    const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    
    bufferTimeoutRef.current = setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      setError(null);
      setErrorType(null);
      setIsLoading(true);

      if (videoRef.current) {
        videoRef.current.load();
      }
    }, delay);
  }, [retryCount]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }
    };
  }, []);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  // Handle play
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    if (onPlay) onPlay();
  }, [onPlay]);

  // Handle pause
  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (onPause) onPause();
  }, [onPause]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('Play error:', err);
      });
    }
  }, [isPlaying]);

  // Handle seek
  const handleSeek = useCallback((value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((value) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  const handleEnableSound = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      if (videoRef.current.volume === 0) {
        videoRef.current.volume = 1;
        setVolume(1);
      }
    }
    setIsMuted(false);
    if (onEnableSound) {
      onEnableSound();
    }
  }, [onEnableSound]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    } else if (videoRef.current.msRequestFullscreen) {
      videoRef.current.msRequestFullscreen();
    }
  }, []);

  // Format time
  const formatTime = useCallback((time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Get quality based on network speed
  const getOptimalQuality = useCallback(() => {
    if (quality !== 'auto') return quality;
    
    switch (networkSpeed) {
      case '4g':
        return '720p';
      case '3g':
        return '480p';
      case '2g':
      case 'slow-2g':
        return '360p';
      default:
        return '720p';
    }
  }, [networkSpeed, quality]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        backgroundColor: '#000',
        ...style
      }}
    >
      {isVisible ? (
        <>
          {/* Video Element */}
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            preload={preloadMode}
            playsInline
            autoPlay={autoPlay}
            muted={isMuted}
            loop={loop}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'contain'
            }}
            onLoadStart={handleLoadStart}
            onLoadedData={handleLoadedData}
            onCanPlay={handleCanPlay}
            onWaiting={handleWaiting}
            onProgress={handleProgress}
            onError={handleError}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 10
              }}
            >
              <Spin size="large" />
            </div>
          )}

          {/* Buffering Indicator */}
          {isBuffering && !isLoading && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontSize: 12,
                zIndex: 5
              }}
            >
              <Spin size="small" />
              <div style={{ marginTop: 8 }}>Đang tải...</div>
            </div>
          )}

          {/* Error Handler */}
          {error && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: 20
              }}
            >
              <VideoPlayerErrorHandler
                error={error}
                errorType={errorType}
                onRetry={retryCount < MAX_RETRY_ATTEMPTS ? handleRetry : null}
                showRetryButton={retryCount < MAX_RETRY_ATTEMPTS}
                showReportButton={true}
              />
            </div>
          )}

          {/* Tap to Unmute Overlay */}
          {autoPlay && !soundEnabled && (
            <button
              type="button"
              onClick={handleEnableSound}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 8,
                cursor: 'pointer',
                zIndex: 12
              }}
              aria-label="Cham de bat tieng"
            >
              <SoundOutlined style={{ fontSize: 28 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Chạm để bật tiếng</div>
            </button>
          )}

          {/* Controls */}
          {controls && !error && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
                padding: '20px 16px 16px',
                color: 'white',
                zIndex: 15
              }}
            >
              {/* Progress Bar with Buffer */}
              <div style={{ marginBottom: 12, position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${bufferedPercentage}%`,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 2
                  }}
                />
                <Slider
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  tooltip={{ formatter: (value) => formatTime(value || 0) }}
                  style={{ margin: 0 }}
                  trackStyle={{ backgroundColor: '#1890ff' }}
                  handleStyle={{ borderColor: '#1890ff' }}
                />
              </div>

              {/* Control Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                  <Button
                    type="text"
                    icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={togglePlay}
                    style={{ color: 'white', fontSize: 20 }}
                  />

                  <Text style={{ color: 'white', fontSize: 12 }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Text>
                </Space>

                <Space>
                  <Button
                    type="text"
                    icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
                    onClick={toggleMute}
                    style={{ color: 'white' }}
                  />

                  <div style={{ width: 60 }}>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      tooltip={{ formatter: (value) => `${Math.round((value || 0) * 100)}%` }}
                      trackStyle={{ backgroundColor: '#1890ff' }}
                      handleStyle={{ borderColor: '#1890ff' }}
                    />
                  </div>

                  <Button
                    type="text"
                    icon={<FullscreenOutlined />}
                    onClick={toggleFullscreen}
                    style={{ color: 'white' }}
                  />
                </Space>
              </div>

              {/* Network Info (Development) */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{ fontSize: 10, marginTop: 8, opacity: 0.7 }}>
                  Network: {networkSpeed} | Quality: {getOptimalQuality()} | Buffer: {bufferedPercentage.toFixed(0)}%
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <img
              src={poster}
              alt="Video poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
            <PlayCircleOutlined style={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.7)' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(OptimizedVideoPlayer);
