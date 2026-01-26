/**
 * Video Feed Component
 * 
 * Optimized component for displaying video posts in feed/timeline with
 * lazy loading, video thumbnails with play buttons, and performance optimization.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Space, Skeleton } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, SoundOutlined, MutedOutlined } from '@ant-design/icons';
import VideoPlayer from './VideoPlayer';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const { Text, Title } = Typography;

/**
 * Video Thumbnail with Play Button
 */
const VideoThumbnail = ({ 
  src, 
  poster, 
  title, 
  duration, 
  onPlay, 
  className, 
  style 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={className}
      style={{ 
        position: 'relative', 
        cursor: 'pointer',
        borderRadius: 8,
        overflow: 'hidden',
        ...style 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlay}
    >
      {/* Thumbnail Image */}
      <img
        src={poster}
        alt={title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.3s ease'
        }}
        onError={(e) => {
          // Fallback to a default video thumbnail
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMzAgMTEwTDE3MCA5MEwxNzAgMTMwTDEzMCAxMTBaIiBmaWxsPSIjOEM4QzhDIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOEM4QzhDIiBmb250LXNpemU9IjEyIj5WaWRlbzwvdGV4dD4KPC9zdmc+';
        }}
      />

      {/* Play Button Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
        transition: 'background-color 0.3s ease'
      }}>
        <PlayCircleOutlined 
          style={{ 
            fontSize: isHovered ? 64 : 48, 
            color: 'white',
            transition: 'font-size 0.3s ease'
          }} 
        />
      </div>

      {/* Duration Badge */}
      {duration && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500
        }}>
          {formatDuration(duration)}
        </div>
      )}
    </div>
  );
};

/**
 * Video Feed Item Component
 */
const VideoFeedItem = ({ 
  videoData, 
  autoPlay = false, 
  muted = true,
  onPlay,
  onPause,
  lazy = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const videoRef = useRef(null);

  // Intersection Observer for lazy loading
  const [inViewRef, inView] = useIntersectionObserver({
    threshold: 0.5,
    triggerOnce: false
  });

  useEffect(() => {
    if (lazy && inView && !isVisible) {
      setIsVisible(true);
    }
  }, [inView, lazy, isVisible]);

  // Auto-pause when out of view
  useEffect(() => {
    if (lazy && !inView && isPlaying) {
      setIsPlaying(false);
    }
  }, [inView, lazy, isPlaying]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    if (onPlay) onPlay(videoData);
  }, [videoData, onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (onPause) onPause(videoData);
  }, [videoData, onPause]);

  const handleThumbnailPlay = useCallback(() => {
    setIsPlaying(true);
    if (onPlay) onPlay(videoData);
  }, [videoData, onPlay]);

  return (
    <div ref={inViewRef} style={{ marginBottom: 16 }}>
      <Card
        bodyStyle={{ padding: 0 }}
        style={{ 
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Video Content */}
        <div style={{ position: 'relative' }}>
          {isPlaying && isVisible ? (
            <VideoPlayer
              src={videoData.url}
              poster={videoData.thumbnailUrl}
              autoPlay={autoPlay}
              muted={muted}
              controls={true}
              lazy={false}
              onPlay={handlePlay}
              onPause={handlePause}
              style={{ borderRadius: 0 }}
            />
          ) : (
            <VideoThumbnail
              src={videoData.url}
              poster={videoData.thumbnailUrl}
              title={videoData.fileName}
              duration={videoData.duration}
              onPlay={handleThumbnailPlay}
              style={{ height: 300 }}
            />
          )}
        </div>

        {/* Video Info */}
        <div style={{ padding: 16 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0, lineHeight: 1.4 }}>
              {videoData.fileName || 'Video không có tiêu đề'}
            </Title>
            
            <Space size={16}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {videoData.format?.toUpperCase() || 'VIDEO'}
              </Text>
              
              {videoData.resolution && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {videoData.resolution.width}x{videoData.resolution.height}
                </Text>
              )}
              
              {videoData.fileSize && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {(videoData.fileSize / (1024 * 1024)).toFixed(1)}MB
                </Text>
              )}
            </Space>
          </Space>
        </div>
      </Card>
    </div>
  );
};

/**
 * Video Feed Component
 */
const VideoFeed = ({ 
  videos = [], 
  loading = false,
  autoPlay = false,
  muted = true,
  onVideoPlay,
  onVideoPause,
  onLoadMore,
  hasMore = false,
  lazy = true,
  className,
  style 
}) => {
  const [playingVideo, setPlayingVideo] = useState(null);

  const handleVideoPlay = useCallback((videoData) => {
    // Pause other videos when one starts playing
    if (playingVideo && playingVideo.id !== videoData.id) {
      setPlayingVideo(null);
    }
    setPlayingVideo(videoData);
    if (onVideoPlay) onVideoPlay(videoData);
  }, [playingVideo, onVideoPlay]);

  const handleVideoPause = useCallback((videoData) => {
    if (playingVideo && playingVideo.id === videoData.id) {
      setPlayingVideo(null);
    }
    if (onVideoPause) onVideoPause(videoData);
  }, [playingVideo, onVideoPause]);

  if (loading && videos.length === 0) {
    return (
      <div className={className} style={style}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} style={{ marginBottom: 16 }}>
            <Skeleton.Image style={{ width: '100%', height: 300 }} />
            <div style={{ padding: 16 }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: 40, ...style }}>
        <Text type="secondary">Chưa có video nào</Text>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {videos.map((video) => (
        <VideoFeedItem
          key={video.id}
          videoData={video}
          autoPlay={autoPlay}
          muted={muted}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          lazy={lazy}
        />
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button 
            type="primary" 
            loading={loading}
            onClick={onLoadMore}
          >
            {loading ? 'Đang tải...' : 'Tải thêm video'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoFeed;