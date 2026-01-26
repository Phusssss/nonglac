/**
 * Video Integration Component
 * 
 * This component wires all video components together:
 * - Upload interface with video service
 * - Video player with feed display
 * - Error handling across all components
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Space, Typography, Divider, message } from 'antd';
import { VideoCameraOutlined, UploadOutlined, PlayCircleOutlined } from '@ant-design/icons';
import VideoPlayer from './VideoPlayer';
import VideoFeed from './VideoFeed';
import OptimizedVideoFeed from './OptimizedVideoFeed';
import { useVideoNotifications, VIDEO_ERROR_CODES } from './VideoNotificationSystem';
import { videoUploadService, UploadError } from '../services/videoUploadService';
import { VideoFileValidator } from './common/VideoFileValidator';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

/**
 * Video Upload Integration Component
 */
const VideoUploadIntegration = ({ 
  onUploadSuccess, 
  onUploadError,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  acceptedFormats = ['mp4', 'mov', 'avi', 'wmv', 'mkv']
}) => {
  const { user } = useAuth();
  const { showError, showSuccess, showProgress } = useVideoNotifications();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = useCallback(async (file) => {
    if (!user) {
      showError(VIDEO_ERROR_CODES.PERMISSION_DENIED, 'Vui lòng đăng nhập để tải video');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Show progress notification
      showProgress('UPLOAD_PROGRESS', 0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          showProgress('UPLOAD_PROGRESS', newProgress);
          return newProgress;
        });
      }, 500);

      // Upload video
      const videoMetadata = await videoUploadService.uploadVideo(file, {
        userId: user.uid
      });

      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show success notification
      showSuccess('UPLOAD_SUCCESS', `Video "${file.name}" đã được tải lên thành công!`);

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(videoMetadata);
      }

    } catch (error) {
      console.error('Video upload error:', error);
      
      let errorCode = VIDEO_ERROR_CODES.UPLOAD_FAILED;
      let errorMessage = 'Không thể tải video lên. Vui lòng thử lại.';

      if (error instanceof UploadError && error.videoErrorCode) {
        errorCode = error.videoErrorCode;
        errorMessage = error.message;
      }

      showError(errorCode, errorMessage);

      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [user, showError, showSuccess, showProgress, onUploadSuccess, onUploadError]);

  return (
    <Card 
      title={
        <Space>
          <UploadOutlined />
          <span>Tải video lên</span>
        </Space>
      }
    >
      <VideoFileValidator
        onFileSelect={handleFileSelect}
        maxFileSize={maxFileSize}
        acceptedFormats={acceptedFormats}
        disabled={uploading}
        progress={uploadProgress}
      />
    </Card>
  );
};

/**
 * Video Player Integration Component
 */
const VideoPlayerIntegration = ({ 
  videoData, 
  onPlay, 
  onPause, 
  onError,
  autoPlay = false,
  controls = true 
}) => {
  const { showError } = useVideoNotifications();

  const handleError = useCallback((error) => {
    console.error('Video player error:', error);
    showError(VIDEO_ERROR_CODES.PLAYBACK_FAILED, 'Không thể phát video này');
    
    if (onError) {
      onError(error);
    }
  }, [showError, onError]);

  const handlePlay = useCallback(() => {
    if (onPlay) {
      onPlay(videoData);
    }
  }, [onPlay, videoData]);

  const handlePause = useCallback(() => {
    if (onPause) {
      onPause(videoData);
    }
  }, [onPause, videoData]);

  if (!videoData) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">Chưa có video để phát</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <PlayCircleOutlined />
          <span>{videoData.fileName || 'Video Player'}</span>
        </Space>
      }
    >
      <VideoPlayer
        src={videoData.url || videoData.githubUrl}
        poster={videoData.thumbnailUrl}
        autoPlay={autoPlay}
        controls={controls}
        onPlay={handlePlay}
        onPause={handlePause}
        onLoadError={handleError}
      />
    </Card>
  );
};

/**
 * Video Feed Integration Component
 */
const VideoFeedIntegration = ({ 
  videos = [], 
  loading = false,
  optimized = true,
  onVideoPlay,
  onVideoPause,
  onLoadMore 
}) => {
  const { showError, showInfo } = useVideoNotifications();
  const [playingVideo, setPlayingVideo] = useState(null);

  const handleVideoPlay = useCallback((video) => {
    setPlayingVideo(video);
    showInfo('Đang phát video', `Phát "${video.fileName}"`);
    
    if (onVideoPlay) {
      onVideoPlay(video);
    }
  }, [showInfo, onVideoPlay]);

  const handleVideoPause = useCallback((video) => {
    if (playingVideo && playingVideo.id === video.id) {
      setPlayingVideo(null);
    }
    
    if (onVideoPause) {
      onVideoPause(video);
    }
  }, [playingVideo, onVideoPause]);

  const handleVideoError = useCallback((video, error) => {
    console.error('Video feed error:', video, error);
    showError(VIDEO_ERROR_CODES.PLAYBACK_FAILED, `Không thể phát video "${video.fileName}"`);
  }, [showError]);

  const FeedComponent = optimized ? OptimizedVideoFeed : VideoFeed;

  return (
    <Card 
      title={
        <Space>
          <VideoCameraOutlined />
          <span>Video Feed</span>
        </Space>
      }
    >
      <FeedComponent
        videos={videos}
        loading={loading}
        onVideoPlay={handleVideoPlay}
        onVideoPause={handleVideoPause}
        onVideoError={handleVideoError}
        onLoadMore={onLoadMore}
        hasMore={videos.length > 0}
      />
    </Card>
  );
};

/**
 * Complete Video Integration Component
 */
const VideoIntegration = ({
  // Upload props
  enableUpload = true,
  onUploadSuccess,
  onUploadError,
  maxFileSize = 100 * 1024 * 1024,
  acceptedFormats = ['mp4', 'mov', 'avi', 'wmv', 'mkv'],
  
  // Player props
  enablePlayer = true,
  currentVideo = null,
  onVideoPlay,
  onVideoPause,
  onPlayerError,
  
  // Feed props
  enableFeed = true,
  videos = [],
  feedLoading = false,
  optimizedFeed = true,
  onLoadMoreVideos,
  
  // General props
  className,
  style
}) => {
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(currentVideo);

  // Handle successful upload
  const handleUploadSuccess = useCallback((videoMetadata) => {
    setUploadedVideos(prev => [videoMetadata, ...prev]);
    setSelectedVideo(videoMetadata);
    
    if (onUploadSuccess) {
      onUploadSuccess(videoMetadata);
    }
  }, [onUploadSuccess]);

  // Handle video selection from feed
  const handleFeedVideoPlay = useCallback((video) => {
    setSelectedVideo(video);
    
    if (onVideoPlay) {
      onVideoPlay(video);
    }
  }, [onVideoPlay]);

  // Combine uploaded videos with feed videos
  const allVideos = [...uploadedVideos, ...videos];

  return (
    <div className={className} style={style}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Upload Section */}
        {enableUpload && (
          <VideoUploadIntegration
            onUploadSuccess={handleUploadSuccess}
            onUploadError={onUploadError}
            maxFileSize={maxFileSize}
            acceptedFormats={acceptedFormats}
          />
        )}

        {/* Player Section */}
        {enablePlayer && selectedVideo && (
          <VideoPlayerIntegration
            videoData={selectedVideo}
            onPlay={onVideoPlay}
            onPause={onVideoPause}
            onError={onPlayerError}
          />
        )}

        {/* Feed Section */}
        {enableFeed && (
          <VideoFeedIntegration
            videos={allVideos}
            loading={feedLoading}
            optimized={optimizedFeed}
            onVideoPlay={handleFeedVideoPlay}
            onVideoPause={onVideoPause}
            onLoadMore={onLoadMoreVideos}
          />
        )}

        {/* No Content Message */}
        {allVideos.length === 0 && !feedLoading && (
          <Card>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <VideoCameraOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Title level={4} type="secondary">Chưa có video nào</Title>
              <Text type="secondary">
                {enableUpload ? 'Tải video đầu tiên của bạn lên!' : 'Chưa có video để hiển thị'}
              </Text>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default VideoIntegration;
export { 
  VideoUploadIntegration, 
  VideoPlayerIntegration, 
  VideoFeedIntegration 
};