/**
 * Video Upload Service
 * 
 * This service extends the existing GitHub storage service to support video uploads
 * while maintaining consistency with the current image upload architecture.
 */

import { 
  VideoUploadService, 
  VideoMetadata, 
  ValidationResult 
} from '../types/video';
import { githubStorage } from './githubStorageExtended';
import { 
  validateVideoFile, 
  generateVideoThumbnail 
} from '../utils/videoValidation';
import { VIDEO_ERROR_CODES } from '../components/VideoNotificationSystem';

class VideoUploadServiceImpl implements VideoUploadService {
  
  /**
   * Uploads a video file to GitHub storage and creates metadata
   * @param file - The video file to upload
   * @param metadata - Partial metadata (will be completed during upload)
   * @returns Promise<VideoMetadata> - Complete video metadata
   */
  async uploadVideo(file: File, metadata: Partial<VideoMetadata>): Promise<VideoMetadata> {
    try {
      // Validate the video file first
      const validationResult = await this.validateVideoFile(file);
      if (!validationResult.isValid) {
        const errorCode = this.getVideoErrorCode(validationResult.errors[0]);
        throw new UploadError({
          code: 'VALIDATION_FAILED',
          message: 'Video validation failed',
          details: validationResult.errors,
          videoErrorCode: errorCode
        });
      }

      // Generate unique filename using the storage service utility
      const userId = metadata.userId || 'anonymous';
      const uniquePath = githubStorage.generateVideoStoragePath(userId, file.name);
      
      // Upload video to GitHub storage
      const githubUrl = await githubStorage.uploadVideo(file, uniquePath);
      
      // Generate thumbnail
      let thumbnailUrl: string | undefined;
      try {
        const thumbnailBase64 = await this.generateThumbnail(file);
        
        // Convert base64 to blob for thumbnail upload
        const thumbnailBlob = this.base64ToBlob(thumbnailBase64, 'image/jpeg');
        const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
        
        thumbnailUrl = await githubStorage.uploadImage(thumbnailFile, 'thumbnails');
      } catch (thumbnailError) {
        console.warn('Failed to generate thumbnail:', thumbnailError);
        // Continue without thumbnail - it's optional
      }

      // Create complete metadata
      const completeMetadata: VideoMetadata = {
        id: this.generateVideoId(),
        fileName: file.name,
        fileSize: file.size,
        duration: validationResult.fileInfo?.duration || 0,
        githubUrl,
        uploadTimestamp: new Date(),
        userId,
        thumbnailUrl,
        format: validationResult.fileInfo?.format || 'unknown',
        resolution: validationResult.fileInfo?.resolution || { width: 0, height: 0 },
        uploadPath: uniquePath,
        ...metadata
      };

      return completeMetadata;
      
    } catch (error) {
      // Clean up any partially uploaded files
      await this.cleanupFailedUpload(file, metadata);
      
      if (error instanceof UploadError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const videoErrorCode = this.determineVideoErrorCode(error);
      throw new UploadError({
        code: 'UPLOAD_FAILED',
        message: `Video upload failed: ${errorMessage}`,
        details: error,
        videoErrorCode
      });
    }
  }

  /**
   * Validates a video file using the validation utilities
   * @param file - The video file to validate
   * @returns Promise<ValidationResult> - Validation result
   */
  async validateVideoFile(file: File): Promise<ValidationResult> {
    return validateVideoFile(file);
  }

  /**
   * Generates a thumbnail from the video file
   * @param file - The video file
   * @returns Promise<string> - Base64 encoded thumbnail
   */
  async generateThumbnail(file: File): Promise<string> {
    return generateVideoThumbnail(file, 1); // Generate thumbnail at 1 second
  }

  /**
   * Deletes a video and its associated files
   * @param videoId - The video ID to delete
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Look up the video metadata from Firebase
      // 2. Delete the video file from GitHub storage
      // 3. Delete the thumbnail if it exists
      // 4. Remove the metadata from Firebase
      
      // For now, this is a placeholder implementation
      console.log(`Deleting video with ID: ${videoId}`);
      
      // TODO: Implement actual deletion logic when Firebase integration is added
      throw new Error('Video deletion not yet implemented - requires Firebase integration');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new UploadError({
        code: 'DELETE_FAILED',
        message: `Failed to delete video: ${errorMessage}`,
        details: error,
        videoErrorCode: VIDEO_ERROR_CODES.UPLOAD_FAILED
      });
    }
  }

  /**
   * Generates a unique video ID
   * @returns string - Unique video ID
   */
  private generateVideoId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Converts base64 string to Blob
   * @param base64 - Base64 encoded string
   * @param mimeType - MIME type for the blob
   * @returns Blob - The converted blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Cleans up any partially uploaded files in case of failure
   * @param file - The original file
   * @param metadata - The partial metadata
   */
  private async cleanupFailedUpload(file: File, metadata: Partial<VideoMetadata>): Promise<void> {
    try {
      // In a real implementation, you would clean up any partially uploaded files
      // This might include removing files from GitHub storage and Firebase entries
      console.log('Cleaning up failed upload for:', file.name);
      
      // If we have a partial upload path, attempt to delete it
      if (metadata.uploadPath) {
        try {
          await githubStorage.deleteVideo(metadata.uploadPath);
        } catch (deleteError) {
          console.warn('Failed to delete partial video upload:', deleteError);
        }
      }
      
      // TODO: Implement actual cleanup logic for Firebase metadata
    } catch (cleanupError) {
      console.error('Failed to cleanup after upload failure:', cleanupError);
      // Don't throw here - we don't want cleanup failures to mask the original error
    }
  }

  /**
   * Determines video error code based on validation errors
   * @param error - Validation error
   * @returns string - Video error code
   */
  private getVideoErrorCode(error: any): string {
    if (!error) return VIDEO_ERROR_CODES.UPLOAD_FAILED;

    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('file too large') || errorMessage.includes('size')) {
      return VIDEO_ERROR_CODES.FILE_TOO_LARGE;
    }
    if (errorMessage.includes('format') || errorMessage.includes('type')) {
      return VIDEO_ERROR_CODES.INVALID_FORMAT;
    }
    if (errorMessage.includes('duration') && errorMessage.includes('long')) {
      return VIDEO_ERROR_CODES.DURATION_TOO_LONG;
    }
    if (errorMessage.includes('duration') && errorMessage.includes('short')) {
      return VIDEO_ERROR_CODES.DURATION_TOO_SHORT;
    }
    if (errorMessage.includes('resolution')) {
      return VIDEO_ERROR_CODES.RESOLUTION_TOO_HIGH;
    }
    if (errorMessage.includes('filename') || errorMessage.includes('name')) {
      return VIDEO_ERROR_CODES.INVALID_FILENAME;
    }

    return VIDEO_ERROR_CODES.UPLOAD_FAILED;
  }

  /**
   * Determines video error code based on general errors
   * @param error - General error
   * @returns string - Video error code
   */
  private determineVideoErrorCode(error: any): string {
    if (!error) return VIDEO_ERROR_CODES.UPLOAD_FAILED;

    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return VIDEO_ERROR_CODES.NETWORK_ERROR;
    }
    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return VIDEO_ERROR_CODES.PERMISSION_DENIED;
    }
    if (errorMessage.includes('storage') || errorMessage.includes('space')) {
      return VIDEO_ERROR_CODES.STORAGE_FULL;
    }
    if (errorMessage.includes('thumbnail')) {
      return VIDEO_ERROR_CODES.THUMBNAIL_GENERATION_FAILED;
    }
    if (errorMessage.includes('metadata')) {
      return VIDEO_ERROR_CODES.METADATA_EXTRACTION_FAILED;
    }

    return VIDEO_ERROR_CODES.UPLOAD_FAILED;
  }
}

// Custom error class for upload errors
class UploadError extends Error {
  public code: string;
  public details?: any;
  public videoErrorCode?: string;

  constructor({ code, message, details, videoErrorCode }: { 
    code: string; 
    message: string; 
    details?: any;
    videoErrorCode?: string;
  }) {
    super(message);
    this.name = 'UploadError';
    this.code = code;
    this.details = details;
    this.videoErrorCode = videoErrorCode;
  }
}

// Export singleton instance
export const videoUploadService = new VideoUploadServiceImpl();

// Export the error class for use in components
export { UploadError };