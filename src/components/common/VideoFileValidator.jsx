/**
 * VideoFileValidator Component
 * 
 * A React component that provides comprehensive video file validation
 * following the design document specifications. This component integrates
 * with the existing Ant Design framework and validation patterns.
 * 
 * Requirements: 1.1, 1.2, 5.1, 5.2, 5.4
 */

import React, { useState, useCallback } from 'react';
import { Alert, Typography, Space, Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  VideoCameraAddOutlined 
} from '@ant-design/icons';
import { 
  validateVideoFile, 
  sanitizeFilename,
  getFileExtension,
  validateFormatConsistency,
  isFileSizeValid
} from '../../utils/videoValidation';
import { DEFAULT_VIDEO_VALIDATION } from '../../types/video';

const { Text } = Typography;

/**
 * VideoFileValidator Component Props
 */
const VideoFileValidator = ({
  file,
  onValidationComplete,
  onValidationError,
  validationOptions = {},
  showDetails = true,
  className = ''
}) => {
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Merge validation options with defaults
  const options = { ...DEFAULT_VIDEO_VALIDATION, ...validationOptions };

  /**
   * Validates the provided video file
   */
  const validateFile = useCallback(async (videoFile) => {
    if (!videoFile) {
      const error = {
        isValid: false,
        errors: [{
          field: 'file',
          message: 'Không có file được chọn',
          code: 'FILE_REQUIRED'
        }]
      };
      setValidationResult(error);
      onValidationError?.(error);
      return;
    }

    setIsValidating(true);
    
    try {
      // Perform comprehensive validation
      const result = await validateVideoFile(videoFile, options);
      
      // Add sanitized filename to result
      const sanitizedName = sanitizeFilename(videoFile.name);
      const enhancedResult = {
        ...result,
        sanitizedFilename: sanitizedName,
        originalFilename: videoFile.name
      };
      
      setValidationResult(enhancedResult);
      
      if (result.isValid) {
        onValidationComplete?.(enhancedResult);
      } else {
        onValidationError?.(enhancedResult);
      }
      
    } catch (error) {
      const errorResult = {
        isValid: false,
        errors: [{
          field: 'validation',
          message: `Lỗi xác thực file: ${error.message}`,
          code: 'VALIDATION_ERROR'
        }]
      };
      
      setValidationResult(errorResult);
      onValidationError?.(errorResult);
    } finally {
      setIsValidating(false);
    }
  }, [options, onValidationComplete, onValidationError]);

  // Auto-validate when file changes
  React.useEffect(() => {
    if (file) {
      validateFile(file);
    }
  }, [file, validateFile]);

  /**
   * Renders validation status indicator
   */
  const renderValidationStatus = () => {
    if (isValidating) {
      return (
        <Tag color="processing" icon={<VideoCameraAddOutlined />}>
          Đang xác thực...
        </Tag>
      );
    }

    if (!validationResult) {
      return null;
    }

    if (validationResult.isValid) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          File hợp lệ
        </Tag>
      );
    }

    return (
      <Tag color="error" icon={<ExclamationCircleOutlined />}>
        File không hợp lệ
      </Tag>
    );
  };

  /**
   * Renders file information
   */
  const renderFileInfo = () => {
    if (!file || !showDetails) return null;

    const extension = getFileExtension(file.name);
    const isFormatConsistent = validateFormatConsistency(file);
    const isSizeValid = isFileSizeValid(file, options.maxSize);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(0);

    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div>
          <Text strong>Tên file: </Text>
          <Text>{file.name}</Text>
        </div>
        
        {validationResult?.sanitizedFilename && (
          <div>
            <Text strong>Tên file đã làm sạch: </Text>
            <Text code>{validationResult.sanitizedFilename}</Text>
          </div>
        )}
        
        <div>
          <Text strong>Định dạng: </Text>
          <Tag color={isFormatConsistent ? 'green' : 'red'}>
            {extension.toUpperCase()}
          </Tag>
        </div>
        
        <div>
          <Text strong>Kích thước: </Text>
          <Tag color={isSizeValid ? 'green' : 'red'}>
            {fileSizeMB}MB / {maxSizeMB}MB
          </Tag>
        </div>
        
        <div>
          <Text strong>MIME Type: </Text>
          <Text code>{file.type}</Text>
        </div>

        {validationResult?.fileInfo && (
          <>
            <div>
              <Text strong>Thời lượng: </Text>
              <Text>{Math.round(validationResult.fileInfo.duration)}s</Text>
            </div>
            
            <div>
              <Text strong>Độ phân giải: </Text>
              <Text>
                {validationResult.fileInfo.resolution.width} x {validationResult.fileInfo.resolution.height}
              </Text>
            </div>
          </>
        )}
      </Space>
    );
  };

  /**
   * Renders validation errors
   */
  const renderValidationErrors = () => {
    if (!validationResult?.errors || validationResult.errors.length === 0) {
      return null;
    }

    return (
      <Alert
        type="error"
        showIcon
        message="Lỗi xác thực file"
        description={
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationResult.errors.map((error, index) => (
              <li key={index}>
                <Text strong>{error.field}: </Text>
                {error.message}
              </li>
            ))}
          </ul>
        }
      />
    );
  };

  /**
   * Renders supported formats information
   */
  const renderSupportedFormats = () => {
    if (!showDetails) return null;

    return (
      <div>
        <Text strong>Định dạng được hỗ trợ: </Text>
        <Space wrap>
          {options.allowedFormats.map(format => (
            <Tag key={format} color="blue">
              {format.toUpperCase()}
            </Tag>
          ))}
        </Space>
      </div>
    );
  };

  return (
    <div className={`video-file-validator ${className}`}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Validation Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <VideoCameraAddOutlined />
          <Text strong>Xác thực file video</Text>
          {renderValidationStatus()}
        </div>

        {/* File Information */}
        {renderFileInfo()}

        {/* Supported Formats */}
        {renderSupportedFormats()}

        {/* Validation Errors */}
        {renderValidationErrors()}

        {/* Success Message */}
        {validationResult?.isValid && (
          <Alert
            type="success"
            showIcon
            message="File video hợp lệ"
            description="File đã được xác thực thành công và sẵn sàng để tải lên."
          />
        )}
      </Space>
    </div>
  );
};

export default VideoFileValidator;

/**
 * Utility function to validate a video file without rendering UI
 * Useful for programmatic validation
 */
export const validateVideoFileOnly = async (file, options = {}) => {
  if (!file) {
    return null;
  }
  
  const validationOptions = { ...DEFAULT_VIDEO_VALIDATION, ...options };
  
  try {
    const result = await validateVideoFile(file, validationOptions);
    return {
      ...result,
      sanitizedFilename: sanitizeFilename(file.name),
      originalFilename: file.name
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        field: 'validation',
        message: `Validation error: ${error.message}`,
        code: 'VALIDATION_ERROR'
      }]
    };
  }
};

/**
 * Hook for using video file validation in functional components
 */
export const useVideoFileValidation = (options = {}) => {
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = useCallback(async (file) => {
    if (!file) {
      setValidationResult(null);
      return null;
    }

    setIsValidating(true);
    
    try {
      const result = await validateVideoFileOnly(file, options);
      setValidationResult(result);
      return result;
    } catch (error) {
      const errorResult = {
        isValid: false,
        errors: [{
          field: 'validation',
          message: `Validation error: ${error.message}`,
          code: 'VALIDATION_ERROR'
        }]
      };
      setValidationResult(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [options]);

  return {
    validationResult,
    isValidating,
    validateFile
  };
};