/**
 * Video Loading States Component
 * 
 * Comprehensive loading state indicators for video operations including
 * upload progress, video player loading, and consistent loading UX.
 */

import React from 'react';
import { Spin, Progress, Card, Typography, Space, Skeleton, Alert, Button } from 'antd';
import { 
  LoadingOutlined, 
  UploadOutlined, 
  VideoCameraOutlined,
  PlayCircleOutlined,
  CloudUploadOutlined,
  VideoCameraAddOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * Video Upload Loading Component
 */
export const VideoUploadLoading = ({ 
  progress = 0, 
  fileName = '', 
  stage = 'uploading', // 'uploading', 'processing', 'generating-thumbnail'
  size = 'default' // 'small', 'default', 'large'
}) => {
  const getStageConfig = () => {
    switch (stage) {
      case 'uploading':
        return {
          icon: <UploadOutlined />,
          title: 'Đang tải video lên...',
          description: fileName ? `Đang tải "${fileName}"` : 'Đang tải video',
          color: '#1890ff'
        };
      case 'processing':
        return {
          icon: <VideoCameraOutlined />,
          title: 'Đang xử lý video...',
          description: 'Đang tối ưu hóa video cho phát trực tuyến',
          color: '#52c41a'
        };
      case 'generating-thumbnail':
        return {
          icon: <VideoCameraAddOutlined />,
          title: 'Đang tạo thumbnail...',
          description: 'Đang tạo ảnh xem trước cho video',
          color: '#faad14'
        };
      default:
        return {
          icon: <LoadingOutlined />,
          title: 'Đang xử lý...',
          description: 'Vui lòng đợi',
          color: '#1890ff'
        };
    }
  };

  const config = getStageConfig();
  const cardSize = size === 'small' ? 'small' : 'default';

  return (
    <Card size={cardSize} style={{ textAlign: 'center' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 24 : 32, color: config.color }}>
          {config.icon}
        </div>
        
        <div>
          <Title level={size === 'small' ? 5 : 4} style={{ margin: 0, color: config.color }}>
            {config.title}
          </Title>
          <Text type="secondary" style={{ fontSize: size === 'small' ? 12 : 14 }}>
            {config.description}
          </Text>
        </div>

        <Progress
          percent={progress}
          status="active"
          strokeColor={config.color}
          size={size === 'small' ? 'small' : 'default'}
          format={(percent) => `${percent}%`}
        />

        {progress > 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {progress < 100 ? `${progress}% hoàn thành` : 'Hoàn thành!'}
          </Text>
        )}
      </Space>
    </Card>
  );
};

/**
 * Video Player Loading Component
 */
export const VideoPlayerLoading = ({ 
  message = 'Đang tải video...', 
  size = 'default',
  showSpinner = true,
  height = 300 
}) => {
  const spinSize = size === 'large' ? 'large' : 'default';
  const iconSize = size === 'large' ? 48 : size === 'small' ? 24 : 32;

  return (
    <div 
      style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        border: '1px solid #d9d9d9'
      }}
    >
      <Space direction="vertical" align="center" size="middle">
        {showSpinner ? (
          <Spin 
            size={spinSize}
            indicator={<LoadingOutlined style={{ fontSize: iconSize }} spin />}
          />
        ) : (
          <PlayCircleOutlined style={{ fontSize: iconSize, color: '#d9d9d9' }} />
        )}
        
        <Text type="secondary" style={{ fontSize: size === 'small' ? 12 : 14 }}>
          {message}
        </Text>
      </Space>
    </div>
  );
};

/**
 * Video Feed Loading Component
 */
export const VideoFeedLoading = ({ 
  count = 3, 
  showTitle = true,
  compact = false 
}) => {
  const itemHeight = compact ? 200 : 300;
  const titleRows = compact ? 1 : 2;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} bodyStyle={{ padding: compact ? 12 : 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Video Thumbnail Skeleton */}
            <Skeleton.Image 
              style={{ 
                width: '100%', 
                height: itemHeight,
                borderRadius: 8
              }} 
            />
            
            {/* Video Info Skeleton */}
            <div style={{ padding: compact ? '8px 0' : '12px 0' }}>
              <Skeleton 
                active 
                title={showTitle}
                paragraph={{ 
                  rows: titleRows,
                  width: ['80%', '60%']
                }}
              />
            </div>
          </Space>
        </Card>
      ))}
    </Space>
  );
};

/**
 * Video Thumbnail Loading Component
 */
export const VideoThumbnailLoading = ({ 
  width = '100%', 
  height = 200,
  showPlayButton = true 
}) => {
  return (
    <div 
      style={{ 
        width, 
        height, 
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: '1px solid #d9d9d9'
      }}
    >
      <Space direction="vertical" align="center">
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Đang tải thumbnail...
        </Text>
      </Space>
      
      {showPlayButton && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.3
        }}>
          <PlayCircleOutlined style={{ fontSize: 48, color: '#fff' }} />
        </div>
      )}
    </div>
  );
};

/**
 * Video Processing Loading Component
 */
export const VideoProcessingLoading = ({ 
  steps = ['Tải lên', 'Xử lý', 'Tạo thumbnail', 'Hoàn thành'],
  currentStep = 0,
  fileName = ''
}) => {
  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>Đang xử lý video</Title>
          {fileName && (
            <Text type="secondary">"{fileName}"</Text>
          )}
        </div>

        <div>
          {steps.map((step, index) => (
            <div 
              key={index}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 12,
                opacity: index <= currentStep ? 1 : 0.5
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: index < currentStep ? '#52c41a' : index === currentStep ? '#1890ff' : '#d9d9d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              
              <Text 
                style={{ 
                  fontWeight: index === currentStep ? 'bold' : 'normal',
                  color: index <= currentStep ? '#262626' : '#8c8c8c'
                }}
              >
                {step}
              </Text>
              
              {index === currentStep && (
                <Spin 
                  size="small" 
                  style={{ marginLeft: 8 }}
                  indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />}
                />
              )}
            </div>
          ))}
        </div>
      </Space>
    </Card>
  );
};

/**
 * Video Error Loading Component
 */
export const VideoErrorLoading = ({ 
  message = 'Không thể tải video',
  description = 'Vui lòng thử lại sau',
  onRetry,
  height = 300 
}) => {
  return (
    <div 
      style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fff2f0',
        borderRadius: 8,
        border: '1px solid #ffccc7'
      }}
    >
      <Alert
        message={message}
        description={description}
        type="error"
        showIcon
        action={onRetry && (
          <Button size="small" onClick={onRetry}>
            Thử lại
          </Button>
        )}
      />
    </div>
  );
};

/**
 * Inline Video Loading Component (for small spaces)
 */
export const InlineVideoLoading = ({ 
  message = 'Đang tải...', 
  size = 'small' 
}) => {
  return (
    <Space size="small">
      <Spin 
        size={size}
        indicator={<LoadingOutlined style={{ fontSize: size === 'small' ? 12 : 16 }} spin />}
      />
      <Text type="secondary" style={{ fontSize: size === 'small' ? 12 : 14 }}>
        {message}
      </Text>
    </Space>
  );
};

/**
 * Video Loading Overlay Component
 */
export const VideoLoadingOverlay = ({ 
  visible = true,
  message = 'Đang tải video...',
  progress,
  onCancel 
}) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      borderRadius: 8
    }}>
      <Card style={{ minWidth: 300, textAlign: 'center' }}>
        <Space direction="vertical" size="middle">
          <Spin 
            size="large"
            indicator={<LoadingOutlined style={{ fontSize: 32, color: '#1890ff' }} spin />}
          />
          
          <div>
            <Text strong style={{ color: '#262626' }}>{message}</Text>
          </div>

          {typeof progress === 'number' && (
            <Progress 
              percent={progress} 
              status="active"
              strokeColor="#1890ff"
            />
          )}

          {onCancel && (
            <Button size="small" onClick={onCancel}>
              Hủy
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default {
  VideoUploadLoading,
  VideoPlayerLoading,
  VideoFeedLoading,
  VideoThumbnailLoading,
  VideoProcessingLoading,
  VideoErrorLoading,
  InlineVideoLoading,
  VideoLoadingOverlay
};