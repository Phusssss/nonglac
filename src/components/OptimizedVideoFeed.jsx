/**
 * Optimized Video Feed Component
 * 
 * Advanced video feed with progressive loading strategies, viewport detection,
 * and performance monitoring for optimal performance.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, Button, Typography, Space, Skeleton, Alert } from 'antd';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import VideoPlayer from './VideoPlayer';

const { Text } = Typography;

/**
 * Performance Monitor Hook
 */
const usePerformanceMonitor = () => {
  const metricsRef = useRef({
    videoLoads: 0,
    videoErrors: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  const recordVideoLoad = useCallback(() => {
    metricsRef.current.videoLoads++;
  }, []);

  const recordVideoError = useCallback(() => {
    metricsRef.current.videoErrors++;
  }, []);

  const recordRenderTime = useCallback((time) => {
    metricsRef.current.renderTime = time;
  }, []);

  const getMetrics = useCallback(() => {
    return {
      ...metricsRef.current,
      errorRate: metricsRef.current.videoLoads > 0 
        ? (metricsRef.current.videoErrors / metricsRef.current.videoLoads) * 100 
        : 0
    };
  }, []);

  return {
    recordVideoLoad,
    recordVideoError,
    recordRenderTime,
    getMetrics
  };
};

/**
 * Progressive Loading Strategy
 */
const useProgressiveLoading = (items, batchSize = 5) => {
  const [loadedItems, setLoadedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadNextBatch = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const currentLength = loadedItems.length;
      const nextBatch = items.slice(currentLength, currentLength + batchSize);
      
      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setLoadedItems(prev => [...prev, ...nextBatch]);
      }
      
      setIsLoading(false);
    }, 100); // Simulate async loading
  }, [items, loadedItems.length, batchSize, isLoading, hasMore]);

  useEffect(() => {
    if (loadedItems.length === 0 && items.length > 0) {
      loadNextBatch();
    }
  }, [items, loadedItems.length, loadNextBatch]);

  return {
    loadedItems,
    isLoading,
    hasMore,
    loadNextBatch
  };
};

/**
 * Viewport Detection Hook
 */
const useViewportDetection = () => {
  const [visibleVideos, setVisibleVideos] = useState(new Set());
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.dataset.videoId;
          if (entry.isIntersecting) {
            setVisibleVideos(prev => new Set([...prev, videoId]));
          } else {
            setVisibleVideos(prev => {
              const newSet = new Set(prev);
              newSet.delete(videoId);
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '50px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const observeVideo = useCallback((element, videoId) => {
    if (observerRef.current && element) {
      element.dataset.videoId = videoId;
      observerRef.current.observe(element);
    }
  }, []);

  const unobserveVideo = useCallback((element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
    }
  }, []);

  return {
    visibleVideos,
    observeVideo,
    unobserveVideo
  };
};

/**
 * Optimized Video Item Component
 */
const OptimizedVideoItem = React.memo(({ 
  video, 
  isVisible, 
  onLoad, 
  onError, 
  onPlay, 
  onPause,
  style 
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const itemRef = useRef(null);
  const [inViewRef, inView] = useIntersectionObserver({
    threshold: 0.3,
    triggerOnce: false
  });

  const handleLoad = useCallback(() => {
    setHasLoaded(true);
    if (onLoad) onLoad(video);
  }, [video, onLoad]);

  const handleError = useCallback((error) => {
    setHasError(true);
    if (onError) onError(video, error);
  }, [video, onError]);

  const handlePlay = useCallback(() => {
    if (onPlay) onPlay(video);
  }, [video, onPlay]);

  const handlePause = useCallback(() => {
    if (onPause) onPause(video);
  }, [video, onPause]);

  if (hasError) {
    return (
      <div style={style} ref={inViewRef}>
        <Card style={{ marginBottom: 16 }}>
          <Alert
            message="Lỗi tải video"
            description="Không thể tải video này"
            type="error"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={style} ref={inViewRef}>
      <Card styles={{ body: { padding: 0 } }} style={{ marginBottom: 16 }}>
        {inView ? (
          <VideoPlayer
            src={video.url}
            poster={video.thumbnailUrl}
            controls={true}
            lazy={false}
            onLoadStart={handleLoad}
            onLoadError={handleError}
            onPlay={handlePlay}
            onPause={handlePause}
          />
        ) : (
          <div style={{ height: 300, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text type="secondary">Video sẽ tải khi cuộn đến...</Text>
          </div>
        )}
        
        <div style={{ padding: 16 }}>
          <Text strong>{video.fileName || 'Video'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {video.duration && `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`}
            {video.fileSize && ` • ${(video.fileSize / (1024 * 1024)).toFixed(1)}MB`}
          </Text>
        </div>
      </Card>
    </div>
  );
});

/**
 * Main Optimized Video Feed Component
 */
const OptimizedVideoFeed = ({
  videos = [],
  enableProgressiveLoading = true,
  batchSize = 5,
  onVideoPlay,
  onVideoPause,
  onLoadMore,
  className,
  style
}) => {
  const { recordVideoLoad, recordVideoError, recordRenderTime, getMetrics } = usePerformanceMonitor();
  const { visibleVideos, observeVideo, unobserveVideo } = useViewportDetection();
  const { loadedItems, isLoading, hasMore, loadNextBatch } = useProgressiveLoading(
    videos, 
    enableProgressiveLoading ? batchSize : videos.length
  );

  const [playingVideo, setPlayingVideo] = useState(null);
  const renderStartTime = useRef(Date.now());
  const feedRef = useRef(null);

  // Record render time
  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    recordRenderTime(renderTime);
  }, [loadedItems, recordRenderTime]);

  // Handle video play (pause others)
  const handleVideoPlay = useCallback((video) => {
    if (playingVideo && playingVideo.id !== video.id) {
      setPlayingVideo(null);
    }
    setPlayingVideo(video);
    if (onVideoPlay) onVideoPlay(video);
  }, [playingVideo, onVideoPlay]);

  const handleVideoPause = useCallback((video) => {
    if (playingVideo && playingVideo.id === video.id) {
      setPlayingVideo(null);
    }
    if (onVideoPause) onVideoPause(video);
  }, [playingVideo, onVideoPause]);

  const handleVideoLoad = useCallback((video) => {
    recordVideoLoad();
  }, [recordVideoLoad]);

  const handleVideoError = useCallback((video, error) => {
    recordVideoError();
    console.error('Video load error:', video, error);
  }, [recordVideoError]);

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!feedRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage > 0.8 && hasMore && !isLoading) {
        if (enableProgressiveLoading) {
          loadNextBatch();
        } else if (onLoadMore) {
          onLoadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, enableProgressiveLoading, loadNextBatch, onLoadMore]);

  const displayVideos = enableProgressiveLoading ? loadedItems : videos;

  // Performance metrics display (development only)
  const metrics = useMemo(() => getMetrics(), [getMetrics, loadedItems]);

  if (displayVideos.length === 0 && !isLoading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: 40, ...style }}>
        <Text type="secondary">Chưa có video nào</Text>
      </div>
    );
  }

  return (
    <div className={className} style={style} ref={feedRef}>
      {/* Performance Metrics (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card size="small" style={{ marginBottom: 16, fontSize: 12 }}>
          <Space>
            <Text>Videos: {displayVideos.length}</Text>
            <Text>Loads: {metrics.videoLoads}</Text>
            <Text>Errors: {metrics.videoErrors}</Text>
            <Text>Error Rate: {metrics.errorRate.toFixed(1)}%</Text>
            <Text>Render: {metrics.renderTime}ms</Text>
          </Space>
        </Card>
      )}

      {/* Video List */}
      <div>
        {displayVideos.map((video) => (
          <OptimizedVideoItem
            key={video.id}
            video={video}
            isVisible={visibleVideos.has(video.id)}
            onLoad={handleVideoLoad}
            onError={handleVideoError}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
          />
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Space direction="vertical">
            <Skeleton active />
            <Text type="secondary">Đang tải thêm video...</Text>
          </Space>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button 
            type="primary" 
            onClick={enableProgressiveLoading ? loadNextBatch : onLoadMore}
          >
            Tải thêm video
          </Button>
        </div>
      )}

      {/* End of Feed Message */}
      {!hasMore && displayVideos.length > 0 && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Text type="secondary">Đã hiển thị tất cả video</Text>
        </div>
      )}
    </div>
  );
};

export default OptimizedVideoFeed;