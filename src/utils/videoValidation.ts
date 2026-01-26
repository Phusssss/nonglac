/**
 * Video File Validation Utilities
 * 
 * This module provides comprehensive video file validation following the design
 * document specifications and integrating with existing validation patterns.
 */

import { 
  VideoValidationOptions, 
  ValidationResult, 
  ValidationError, 
  DEFAULT_VIDEO_VALIDATION,
  SUPPORTED_VIDEO_MIME_TYPES,
  VIDEO_FORMAT_MIME_MAP
} from '../types/video';

/**
 * Validates a video file against specified criteria
 * @param file - The video file to validate
 * @param options - Validation options (uses defaults if not provided)
 * @returns Promise<ValidationResult> - Validation result with errors and file info
 */
export const validateVideoFile = async (
  file: File, 
  options: Partial<VideoValidationOptions> = {}
): Promise<ValidationResult> => {
  const validationOptions = { ...DEFAULT_VIDEO_VALIDATION, ...options };
  const errors: ValidationError[] = [];

  // Basic file validation
  if (!file) {
    errors.push({
      field: 'file',
      message: 'Không có file được chọn',
      code: 'FILE_REQUIRED'
    });
    return { isValid: false, errors };
  }

  // File size validation
  if (file.size > validationOptions.maxSize) {
    const maxSizeMB = Math.round(validationOptions.maxSize / (1024 * 1024));
    errors.push({
      field: 'fileSize',
      message: `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`,
      code: 'FILE_TOO_LARGE'
    });
  }

  // File extension validation
  const fileExtension = getFileExtension(file.name).toLowerCase();
  if (!validationOptions.allowedFormats.includes(fileExtension)) {
    errors.push({
      field: 'format',
      message: `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${validationOptions.allowedFormats.join(', ')}`,
      code: 'INVALID_FORMAT'
    });
  }

  // MIME type validation
  const expectedMimeType = VIDEO_FORMAT_MIME_MAP[fileExtension];
  if (expectedMimeType && file.type !== expectedMimeType) {
    errors.push({
      field: 'mimeType',
      message: 'Loại file không khớp với phần mở rộng',
      code: 'MIME_TYPE_MISMATCH'
    });
  }

  // Additional MIME type check
  if (!SUPPORTED_VIDEO_MIME_TYPES.includes(file.type)) {
    errors.push({
      field: 'mimeType',
      message: `Loại MIME không được hỗ trợ: ${file.type}`,
      code: 'UNSUPPORTED_MIME_TYPE'
    });
  }

  // Get video metadata for additional validation
  let fileInfo;
  try {
    fileInfo = await getVideoMetadata(file);
    
    // Duration validation
    if (validationOptions.maxDuration && fileInfo.duration > validationOptions.maxDuration) {
      const maxMinutes = Math.floor(validationOptions.maxDuration / 60);
      errors.push({
        field: 'duration',
        message: `Video quá dài. Thời lượng tối đa: ${maxMinutes} phút`,
        code: 'DURATION_TOO_LONG'
      });
    }

    if (validationOptions.minDuration && fileInfo.duration < validationOptions.minDuration) {
      errors.push({
        field: 'duration',
        message: `Video quá ngắn. Thời lượng tối thiểu: ${validationOptions.minDuration} giây`,
        code: 'DURATION_TOO_SHORT'
      });
    }

    // Resolution validation
    if (validationOptions.maxResolution) {
      const { width, height } = validationOptions.maxResolution;
      if (fileInfo.resolution.width > width || fileInfo.resolution.height > height) {
        errors.push({
          field: 'resolution',
          message: `Độ phân giải quá cao. Tối đa: ${width}x${height}px`,
          code: 'RESOLUTION_TOO_HIGH'
        });
      }
    }
  } catch (error) {
    errors.push({
      field: 'metadata',
      message: 'Không thể đọc thông tin video',
      code: 'METADATA_READ_ERROR'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo
  };
};

/**
 * Extracts file extension from filename
 * @param filename - The filename to extract extension from
 * @returns string - The file extension without the dot
 */
export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1) : '';
};

/**
 * Sanitizes filename to prevent security vulnerabilities
 * @param filename - The original filename
 * @returns string - Sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) {
    return 'untitled';
  }
  
  // Remove or replace dangerous characters
  let sanitized = filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace dangerous characters with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase(); // Convert to lowercase for consistency
  
  // If the result is empty after sanitization, provide a default
  if (!sanitized) {
    sanitized = 'untitled';
  }
  
  // Limit length to prevent issues
  sanitized = sanitized.slice(0, 100);
  
  // Remove trailing underscores that might have been created by truncation
  sanitized = sanitized.replace(/^_+|_+$/g, '');
  
  // If empty after final cleanup, provide default
  if (!sanitized) {
    sanitized = 'untitled';
  }
  
  return sanitized;
};

/**
 * Generates unique filename with timestamp
 * @param originalFilename - The original filename
 * @param userId - User ID for path organization
 * @returns string - Unique filename with path
 */
export const generateUniqueFilename = (originalFilename: string, userId: string): string => {
  const originalExtension = getFileExtension(originalFilename);
  const sanitizedName = sanitizeFilename(originalFilename);
  
  // Remove extension from sanitized name if it exists
  const extensionPattern = new RegExp(`\\.${originalExtension.toLowerCase()}$`, 'i');
  const nameWithoutExt = sanitizedName.replace(extensionPattern, '');
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `videos/user-${userId}/${timestamp}_${nameWithoutExt}_${randomSuffix}.${originalExtension.toLowerCase()}`;
};

/**
 * Gets video metadata using HTML5 video element
 * @param file - The video file to analyze
 * @returns Promise with video metadata
 */
export const getVideoMetadata = (file: File): Promise<{
  format: string;
  duration: number;
  resolution: { width: number; height: number };
  bitrate: number;
}> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const metadata = {
        format: getFileExtension(file.name),
        duration: video.duration,
        resolution: {
          width: video.videoWidth,
          height: video.videoHeight
        },
        bitrate: Math.round(file.size * 8 / video.duration) // Approximate bitrate
      };
      
      URL.revokeObjectURL(url);
      resolve(metadata);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = url;
  });
};

/**
 * Validates video file format and MIME type consistency
 * @param file - The video file to validate
 * @returns boolean - True if format and MIME type are consistent
 */
export const validateFormatConsistency = (file: File): boolean => {
  const extension = getFileExtension(file.name).toLowerCase();
  const expectedMimeType = VIDEO_FORMAT_MIME_MAP[extension];
  
  return expectedMimeType ? file.type === expectedMimeType : false;
};

/**
 * Checks if file size is within limits
 * @param file - The file to check
 * @param maxSizeBytes - Maximum allowed size in bytes
 * @returns boolean - True if file size is within limits
 */
export const isFileSizeValid = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

/**
 * Validates video duration
 * @param duration - Video duration in seconds
 * @param minDuration - Minimum allowed duration
 * @param maxDuration - Maximum allowed duration
 * @returns boolean - True if duration is within limits
 */
export const isDurationValid = (
  duration: number, 
  minDuration?: number, 
  maxDuration?: number
): boolean => {
  if (minDuration && duration < minDuration) return false;
  if (maxDuration && duration > maxDuration) return false;
  return true;
};

/**
 * Creates a video thumbnail from the first frame
 * @param file - The video file
 * @param timeOffset - Time offset in seconds for thumbnail (default: 1)
 * @returns Promise<string> - Base64 encoded thumbnail image
 */
export const generateVideoThumbnail = (file: File, timeOffset: number = 1): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    video.preload = 'metadata';
    video.currentTime = timeOffset;
    
    video.onloadeddata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(video.src);
      resolve(thumbnail);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to generate thumbnail'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Batch validates multiple video files
 * @param files - Array of files to validate
 * @param options - Validation options
 * @returns Promise<ValidationResult[]> - Array of validation results
 */
export const validateVideoFiles = async (
  files: File[], 
  options: Partial<VideoValidationOptions> = {}
): Promise<ValidationResult[]> => {
  const validationPromises = files.map(file => validateVideoFile(file, options));
  return Promise.all(validationPromises);
};