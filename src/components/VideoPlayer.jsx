/**
 * Video Player Component
 * 
 * HTML5 video player with Ant Design Card wrapper, standard playback controls,
 * loading states, error handling, and lazy loading functionality.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Slider, Typography, Space } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  SoundOutlined, 
  MutedOutlined,
  FullscreenOutlined
} from '@ant-design/icons';
import { VideoPlayerProps } from '../types/video';
import VideoPlayerErrorHandler, { getErrorType } from './VideoPlayerErrorHandler';
import { VideoPlayerLoading, VideoLoadingOverlay } from './VideoLoadingStates';

const { Text } = Typography;

const VideoPlayer = ({
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
  lazy = true
}) => {
  const videoRef = useRef(null);
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

  // Maximum retry attempts
  const MAX_RETRY_ATTEMPTS = 3;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const videoElement = videoRef.current;
    if (videoElement) {
      observer.observe(videoElement);
    }

    return () => observer.disconnect();
  }, [lazy]);

  // Video event handlers
  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
    if (onLoadStart) onLoadStart();
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleError = (e) => {
    setIsLoading(false);
    const videoError = videoRef.current?.error;
    const detectedErrorType = getErrorType(videoError);
    
    setError(videoError);
    setErrorType(detectedErrorType);
    
    if (onLoadError) {
      onLoadError(new Error(`Video error: ${detectedErrorType}`));
    }
  };

  const handleRetry = () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      return;
    }

    setRetryCount(prev => prev + 1);
    setError(null);
    setErrorType(null);
    setIsLoading(true);
    
    // Reload video
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleReportError = (errorDetails) => {
    // In a real app, this would send error details to a logging service
    console.error('Video error reported:', errorDetails);
    
    // Could integrate with error tracking services like Sentry
    if (window.Sentry) {
      window.Sentry.captureException(new Error('Video playback error'), {
        extra: errorDetails
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlay) onPlay();
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (onPause) onPause();
  };

  // Control handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (value) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  // Format time display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render loading state
  if (!isVisible && lazy) {
    return (
      <Card className={className} style={style}>
        <VideoPlayerLoading 
          message="Video sẽ tải khi cuộn đến..."
          height={300}
          showSpinner={false}
        />
      </Card>
    );
  }

  return (
    <Card 
      className={className} 
      style={style}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ position: 'relative' }}>
        {/* Video Element */}
        <video
          ref={videoRef}
          src={isVisible ? src : undefined}
          poster={poster}
          autoPlay={autoPlay}
          muted={isMuted}
          loop={loop}
          style={{ 
            width: '100%', 
            height: 'auto',
            display: 'block'
          }}
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadedData}
          onError={handleError}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <VideoLoadingOverlay
            visible={isLoading}
            message="Đang tải video..."
          />
        )}

        {/* Error Overlay */}
        {error && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white'
          }}>
            <VideoPlayerErrorHandler
              error={error}
              errorType={errorType}
              onRetry={retryCount < MAX_RETRY_ATTEMPTS ? handleRetry : null}
              onReportError={handleReportError}
              showRetryButton={retryCount < MAX_RETRY_ATTEMPTS}
              showReportButton={true}
            />
          </div>
        )}

        {/* Custom Controls */}
        {controls && !error && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
            padding: '20px 16px 16px',
            color: 'white'
          }}>
            {/* Progress Bar */}
            <div style={{ marginBottom: 12 }}>
              <Slider
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                tooltip={{
                  formatter: (value) => formatTime(value || 0)
                }}
                style={{
                  margin: 0,
                }}
                trackStyle={{ backgroundColor: '#1890ff' }}
                handleStyle={{ borderColor: '#1890ff' }}
              />
            </div>

            {/* Control Buttons */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <Space>
                {/* Play/Pause Button */}
                <Button
                  type="text"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={togglePlay}
                  style={{ color: 'white', fontSize: 20 }}
                />

                {/* Time Display */}
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
              </Space>

              <Space>
                {/* Volume Control */}
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

                {/* Fullscreen Button */}
                <Button
                  type="text"
                  icon={<FullscreenOutlined />}
                  onClick={toggleFullscreen}
                  style={{ color: 'white' }}
                />
              </Space>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoPlayer;