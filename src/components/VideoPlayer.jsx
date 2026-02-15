/**
 * Video Player Component
 *
 * HTML5 video player with Ant Design Card wrapper, standard playback controls,
 * loading states, error handling, and lazy loading functionality.
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef(null);
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
  const [isNearViewport, setIsNearViewport] = useState(!lazy);

  const MAX_RETRY_ATTEMPTS = 3;

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.01,
        rootMargin: '700px 0px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  const preloadMode = useMemo(() => {
    if (isVisible) return 'auto';
    if (isNearViewport) return 'metadata';
    return 'none';
  }, [isVisible, isNearViewport]);

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

  const handleError = () => {
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
    if (retryCount >= MAX_RETRY_ATTEMPTS) return;

    setRetryCount((prev) => prev + 1);
    setError(null);
    setErrorType(null);
    setIsLoading(true);

    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleReportError = (errorDetails) => {
    console.error('Video error reported:', errorDetails);

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

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
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
    if (!videoRef.current) return;

    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    } else if (videoRef.current.msRequestFullscreen) {
      videoRef.current.msRequestFullscreen();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      className={className}
      style={style}
      styles={{ body: { padding: 0 } }}
    >
      <div ref={containerRef} style={{ position: 'relative' }}>
        {isVisible ? (
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
        ) : (
          <VideoPlayerLoading
            message="Video se tai khi cuon den..."
            height={300}
            showSpinner={false}
          />
        )}

        {isVisible && isLoading && (
          <VideoLoadingOverlay
            visible={isLoading}
            message="Dang tai video..."
          />
        )}

        {isVisible && error && (
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

        {isVisible && controls && !error && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
            padding: '20px 16px 16px',
            color: 'white'
          }}>
            <div style={{ marginBottom: 12 }}>
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
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoPlayer;
