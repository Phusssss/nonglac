/**
 * Video Notification System
 * 
 * Comprehensive error notification system using Ant Design notification components
 * for video upload errors, success feedback, and specific error messages.
 */

import React, { useCallback } from 'react';
import { notification, message, Modal } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  WarningOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Video-specific error codes
export const VIDEO_ERROR_CODES = {
  // Upload errors
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FORMAT: 'INVALID_FORMAT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_FULL: 'STORAGE_FULL',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Validation errors
  DURATION_TOO_LONG: 'DURATION_TOO_LONG',
  DURATION_TOO_SHORT: 'DURATION_TOO_SHORT',
  RESOLUTION_TOO_HIGH: 'RESOLUTION_TOO_HIGH',
  INVALID_FILENAME: 'INVALID_FILENAME',
  
  // Playback errors
  PLAYBACK_FAILED: 'PLAYBACK_FAILED',
  CODEC_NOT_SUPPORTED: 'CODEC_NOT_SUPPORTED',
  STREAMING_ERROR: 'STREAMING_ERROR',
  
  // Processing errors
  THUMBNAIL_GENERATION_FAILED: 'THUMBNAIL_GENERATION_FAILED',
  METADATA_EXTRACTION_FAILED: 'METADATA_EXTRACTION_FAILED'
};

// Error messages configuration
const ERROR_MESSAGES = {
  [VIDEO_ERROR_CODES.UPLOAD_FAILED]: {
    title: 'Tải video thất bại',
    description: 'Không thể tải video lên. Vui lòng kiểm tra kết nối mạng và thử lại.',
    type: NOTIFICATION_TYPES.ERROR,
    icon: <UploadOutlined style={{ color: '#ff4d4f' }} />
  },
  [VIDEO_ERROR_CODES.FILE_TOO_LARGE]: {
    title: 'File quá lớn',
    description: 'Video vượt quá giới hạn 100MB. Vui lòng nén video hoặc chọn file khác.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <WarningOutlined style={{ color: '#faad14' }} />
  },
  [VIDEO_ERROR_CODES.INVALID_FORMAT]: {
    title: 'Định dạng không hỗ trợ',
    description: 'Chỉ hỗ trợ các định dạng: MP4, MOV, AVI, WMV, MKV.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <VideoCameraOutlined style={{ color: '#faad14' }} />
  },
  [VIDEO_ERROR_CODES.NETWORK_ERROR]: {
    title: 'Lỗi kết nối mạng',
    description: 'Không thể kết nối đến server. Vui lòng kiểm tra internet và thử lại.',
    type: NOTIFICATION_TYPES.ERROR,
    icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
  },
  [VIDEO_ERROR_CODES.STORAGE_FULL]: {
    title: 'Hết dung lượng lưu trữ',
    description: 'Không đủ dung lượng để lưu video. Vui lòng xóa bớt file cũ.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <WarningOutlined style={{ color: '#faad14' }} />
  },
  [VIDEO_ERROR_CODES.PERMISSION_DENIED]: {
    title: 'Không có quyền truy cập',
    description: 'Bạn không có quyền tải video lên. Vui lòng liên hệ quản trị viên.',
    type: NOTIFICATION_TYPES.ERROR,
    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
  },
  [VIDEO_ERROR_CODES.DURATION_TOO_LONG]: {
    title: 'Video quá dài',
    description: 'Video không được vượt quá 10 phút. Vui lòng cắt ngắn video.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <WarningOutlined style={{ color: '#faad14' }} />
  },
  [VIDEO_ERROR_CODES.DURATION_TOO_SHORT]: {
    title: 'Video quá ngắn',
    description: 'Video phải dài ít nhất 1 giây.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <WarningOutlined style={{ color: '#faad14' }} />
  },
  [VIDEO_ERROR_CODES.RESOLUTION_TOO_HIGH]: {
    title: 'Độ phân giải quá cao',
    description: 'Video không được vượt quá 1920x1080. Vui lòng giảm độ phân giải.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <WarningOutlined style={{ color: '#faad14' }} />
  },
  [VIDEO_ERROR_CODES.INVALID_FILENAME]: {
    title: 'Tên file không hợp lệ',
    description: 'Tên file chứa ký tự không được phép. Vui lòng đổi tên file.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <WarningOutlined style={{ color: '#faad14' }} />
  },
  [VIDEO_ERROR_CODES.PLAYBACK_FAILED]: {
    title: 'Không thể phát video',
    description: 'Video không thể phát được. Có thể file bị hỏng hoặc định dạng không hỗ trợ.',
    type: NOTIFICATION_TYPES.ERROR,
    icon: <PlayCircleOutlined style={{ color: '#ff4d4f' }} />
  },
  [VIDEO_ERROR_CODES.CODEC_NOT_SUPPORTED]: {
    title: 'Codec không được hỗ trợ',
    description: 'Trình duyệt không hỗ trợ codec của video này.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <VideoCameraOutlined style={{ color: '#faad14' }} />
  },
  [VIDEO_ERROR_CODES.STREAMING_ERROR]: {
    title: 'Lỗi streaming',
    description: 'Không thể stream video. Vui lòng kiểm tra kết nối mạng.',
    type: NOTIFICATION_TYPES.ERROR,
    icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
  },
  [VIDEO_ERROR_CODES.THUMBNAIL_GENERATION_FAILED]: {
    title: 'Không tạo được thumbnail',
    description: 'Không thể tạo ảnh xem trước cho video. Video vẫn được tải lên thành công.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <WarningOutlined style={{ color: '#faad14' }} />
  },
  [VIDEO_ERROR_CODES.METADATA_EXTRACTION_FAILED]: {
    title: 'Không đọc được thông tin video',
    description: 'Không thể đọc thông tin chi tiết của video. Video vẫn được tải lên thành công.',
    type: NOTIFICATION_TYPES.WARNING,
    icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
  }
};

// Success messages
const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: {
    title: 'Tải video thành công!',
    description: 'Video đã được tải lên và sẵn sàng để chia sẻ.',
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
  },
  UPLOAD_PROGRESS: {
    title: 'Đang tải video...',
    description: 'Video đang được xử lý. Vui lòng đợi trong giây lát.',
    icon: <UploadOutlined style={{ color: '#1890ff' }} />
  },
  THUMBNAIL_GENERATED: {
    title: 'Đã tạo thumbnail',
    description: 'Ảnh xem trước video đã được tạo thành công.',
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
  }
};

/**
 * Video Notification System Hook
 */
export const useVideoNotifications = () => {
  // Show error notification
  const showError = useCallback((errorCode, customMessage = null, duration = 4.5) => {
    const errorConfig = ERROR_MESSAGES[errorCode];
    
    if (!errorConfig) {
      // Fallback for unknown errors
      notification.error({
        message: 'Lỗi không xác định',
        description: customMessage || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration,
        placement: 'topRight'
      });
      return;
    }

    notification[errorConfig.type]({
      message: errorConfig.title,
      description: customMessage || errorConfig.description,
      icon: errorConfig.icon,
      duration,
      placement: 'topRight'
    });
  }, []);

  // Show success notification
  const showSuccess = useCallback((messageKey, customMessage = null, duration = 3) => {
    const successConfig = SUCCESS_MESSAGES[messageKey];
    
    if (!successConfig) {
      notification.success({
        message: 'Thành công!',
        description: customMessage || 'Thao tác đã hoàn thành thành công.',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration,
        placement: 'topRight'
      });
      return;
    }

    notification.success({
      message: successConfig.title,
      description: customMessage || successConfig.description,
      icon: successConfig.icon,
      duration,
      placement: 'topRight'
    });
  }, []);

  // Show progress notification
  const showProgress = useCallback((messageKey, progress = null, duration = 0) => {
    const progressConfig = SUCCESS_MESSAGES[messageKey];
    
    let description = progressConfig?.description || 'Đang xử lý...';
    if (progress !== null) {
      description += ` (${progress}%)`;
    }

    notification.info({
      message: progressConfig?.title || 'Đang xử lý...',
      description,
      icon: progressConfig?.icon || <UploadOutlined style={{ color: '#1890ff' }} />,
      duration,
      placement: 'topRight'
    });
  }, []);

  // Show warning notification
  const showWarning = useCallback((title, description, duration = 4) => {
    notification.warning({
      message: title,
      description,
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
      duration,
      placement: 'topRight'
    });
  }, []);

  // Show info notification
  const showInfo = useCallback((title, description, duration = 3) => {
    notification.info({
      message: title,
      description,
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      duration,
      placement: 'topRight'
    });
  }, []);

  // Show quick message
  const showMessage = useCallback((content, type = 'info', duration = 2) => {
    message[type](content, duration);
  }, []);

  // Show confirmation modal
  const showConfirm = useCallback((title, content, onOk, onCancel) => {
    Modal.confirm({
      title,
      content,
      icon: <ExclamationCircleOutlined />,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk,
      onCancel
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    notification.destroy();
    message.destroy();
  }, []);

  return {
    showError,
    showSuccess,
    showProgress,
    showWarning,
    showInfo,
    showMessage,
    showConfirm,
    clearAll
  };
};

/**
 * Video Upload Progress Component
 */
export const VideoUploadProgress = ({ 
  progress, 
  fileName, 
  onCancel,
  status = 'uploading' // 'uploading', 'processing', 'success', 'error'
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          title: 'Đang tải video...',
          description: `Đang tải "${fileName}" (${progress}%)`,
          icon: <UploadOutlined style={{ color: '#1890ff' }} />
        };
      case 'processing':
        return {
          title: 'Đang xử lý video...',
          description: `Đang tạo thumbnail và xử lý "${fileName}"`,
          icon: <VideoCameraOutlined style={{ color: '#1890ff' }} />
        };
      case 'success':
        return {
          title: 'Tải video thành công!',
          description: `"${fileName}" đã được tải lên thành công`,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        };
      case 'error':
        return {
          title: 'Tải video thất bại',
          description: `Không thể tải "${fileName}". Vui lòng thử lại.`,
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        };
      default:
        return {
          title: 'Đang xử lý...',
          description: fileName,
          icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
        };
    }
  };

  const statusConfig = getStatusConfig();

  return {
    message: statusConfig.title,
    description: statusConfig.description,
    icon: statusConfig.icon,
    duration: status === 'success' ? 3 : (status === 'error' ? 5 : 0),
    placement: 'topRight',
    onClose: onCancel
  };
};

export default useVideoNotifications;