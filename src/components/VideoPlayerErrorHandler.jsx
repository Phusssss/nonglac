/**
 * Video Player Error Handler
 * 
 * Provides fallback content for playback failures, network error handling,
 * and user-friendly error messages for the video player.
 */

import React from 'react';
import { Alert, Button, Space, Typography, Card } from 'antd';
import { 
  ReloadOutlined, 
  ExclamationCircleOutlined,
  WifiOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

// Error types and their corresponding messages
export const VIDEO_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DECODE_ERROR: 'DECODE_ERROR',
  SRC_NOT_SUPPORTED: 'SRC_NOT_SUPPORTED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  LOADING_TIMEOUT: 'LOADING_TIMEOUT',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
};

export const ERROR_MESSAGES = {
  [VIDEO_ERROR_TYPES.NETWORK_ERROR]: {
    title: 'Lỗi kết nối mạng',
    description: 'Không thể tải video do lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại.',
    icon: <WifiOutlined />,
    type: 'warning'
  },
  [VIDEO_ERROR_TYPES.DECODE_ERROR]: {
    title: 'Lỗi giải mã video',
    description: 'Video không thể phát được do lỗi định dạng hoặc file bị hỏng.',
    icon: <ExclamationCircleOutlined />,
    type: 'error'
  },
  [VIDEO_ERROR_TYPES.SRC_NOT_SUPPORTED]: {
    title: 'Định dạng không được hỗ trợ',
    description: 'Trình duyệt không hỗ trợ định dạng video này. Vui lòng thử với trình duyệt khác.',
    icon: <PlayCircleOutlined />,
    type: 'warning'
  },
  [VIDEO_ERROR_TYPES.LOADING_TIMEOUT]: {
    title: 'Hết thời gian tải',
    description: 'Video tải quá lâu. Vui lòng kiểm tra kết nối internet và thử lại.',
    icon: <WifiOutlined />,
    type: 'warning'
  },
  [VIDEO_ERROR_TYPES.PERMISSION_DENIED]: {
    title: 'Không có quyền truy cập',
    description: 'Không thể truy cập video này. Vui lòng kiểm tra quyền truy cập.',
    icon: <ExclamationCircleOutlined />,
    type: 'error'
  },
  [VIDEO_ERROR_TYPES.UNKNOWN_ERROR]: {
    title: 'Lỗi không xác định',
    description: 'Đã xảy ra lỗi không xác định khi phát video. Vui lòng thử lại sau.',
    icon: <ExclamationCircleOutlined />,
    type: 'error'
  }
};

/**
 * Determines error type based on HTML5 video error
 * @param {MediaError} error - HTML5 MediaError object
 * @returns {string} - Error type constant
 */
export const getErrorType = (error) => {
  if (!error) return VIDEO_ERROR_TYPES.UNKNOWN_ERROR;

  switch (error.code) {
    case MediaError.MEDIA_ERR_NETWORK:
      return VIDEO_ERROR_TYPES.NETWORK_ERROR;
    case MediaError.MEDIA_ERR_DECODE:
      return VIDEO_ERROR_TYPES.DECODE_ERROR;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return VIDEO_ERROR_TYPES.SRC_NOT_SUPPORTED;
    case MediaError.MEDIA_ERR_ABORTED:
      return VIDEO_ERROR_TYPES.LOADING_TIMEOUT;
    default:
      return VIDEO_ERROR_TYPES.UNKNOWN_ERROR;
  }
};

/**
 * Video Player Error Handler Component
 */
const VideoPlayerErrorHandler = ({
  error,
  errorType,
  onRetry,
  onReportError,
  showRetryButton = true,
  showReportButton = false,
  style,
  className
}) => {
  // Determine error type if not provided
  const finalErrorType = errorType || getErrorType(error);
  const errorConfig = ERROR_MESSAGES[finalErrorType] || ERROR_MESSAGES[VIDEO_ERROR_TYPES.UNKNOWN_ERROR];

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleReportError = () => {
    if (onReportError) {
      onReportError({
        errorType: finalErrorType,
        error: error,
        timestamp: new Date(),
        userAgent: navigator.userAgent
      });
    }
  };

  return (
    <Card 
      className={className}
      style={{ 
        minHeight: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style 
      }}
      bodyStyle={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: 40
      }}
    >
      <Space direction="vertical" size="large" align="center">
        {/* Error Icon */}
        <div style={{ fontSize: 48, color: '#ff4d4f' }}>
          {errorConfig.icon}
        </div>

        {/* Error Message */}
        <div>
          <Title level={4} style={{ marginBottom: 8, color: '#262626' }}>
            {errorConfig.title}
          </Title>
          <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
            {errorConfig.description}
          </Text>
        </div>

        {/* Action Buttons */}
        <Space>
          {showRetryButton && (
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={handleRetry}
            >
              Thử lại
            </Button>
          )}
          
          {showReportButton && (
            <Button 
              type="default"
              icon={<ExclamationCircleOutlined />}
              onClick={handleReportError}
            >
              Báo lỗi
            </Button>
          )}
        </Space>

        {/* Technical Details (for debugging) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details style={{ marginTop: 16, fontSize: 12, color: '#8c8c8c' }}>
            <summary style={{ cursor: 'pointer' }}>Chi tiết kỹ thuật</summary>
            <pre style={{ 
              marginTop: 8, 
              padding: 8, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 4,
              textAlign: 'left',
              fontSize: 11
            }}>
              {JSON.stringify({
                errorType: finalErrorType,
                code: error.code,
                message: error.message,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </details>
        )}
      </Space>
    </Card>
  );
};

/**
 * Network Error Fallback Component
 */
export const NetworkErrorFallback = ({ onRetry, style, className }) => (
  <VideoPlayerErrorHandler
    errorType={VIDEO_ERROR_TYPES.NETWORK_ERROR}
    onRetry={onRetry}
    showRetryButton={true}
    style={style}
    className={className}
  />
);

/**
 * Unsupported Format Fallback Component
 */
export const UnsupportedFormatFallback = ({ onReportError, style, className }) => (
  <VideoPlayerErrorHandler
    errorType={VIDEO_ERROR_TYPES.SRC_NOT_SUPPORTED}
    onReportError={onReportError}
    showRetryButton={false}
    showReportButton={true}
    style={style}
    className={className}
  />
);

/**
 * Generic Error Fallback Component
 */
export const GenericErrorFallback = ({ error, onRetry, onReportError, style, className }) => (
  <VideoPlayerErrorHandler
    error={error}
    onRetry={onRetry}
    onReportError={onReportError}
    showRetryButton={true}
    showReportButton={true}
    style={style}
    className={className}
  />
);

export default VideoPlayerErrorHandler;