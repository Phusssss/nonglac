/**
 * Video Upload Feature - Type Definitions
 * 
 * This file contains TypeScript interfaces for video metadata, upload services,
 * and validation utilities as specified in the design document.
 */

// Core video metadata interface
export interface VideoMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  duration: number; // in seconds
  githubUrl: string;
  uploadTimestamp: Date;
  userId: string;
  thumbnailUrl?: string;
  format: string;
  resolution: {
    width: number;
    height: number;
  };
  uploadPath: string; // GitHub storage path
}

// Video media interface for posts (extends existing media structure)
export interface VideoMedia {
  type: 'video';
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  duration: number; // in seconds
  format: string;
  resolution: {
    width: number;
    height: number;
  };
  uploadPath: string; // GitHub storage path
}

// Image media interface (for consistency with existing structure)
export interface ImageMedia {
  type: 'image';
  url: string;
  fileName: string;
  fileSize: number;
  uploadPath: string;
}

// Union type for mixed media support
export type MediaItem = ImageMedia | VideoMedia;

// Extended Post interface to support mixed media
export interface Post {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'mixed'; // Extended to support mixed media
  media?: MediaItem[]; // Extended from single image to media array
  likes: number;
  comments: Comment[];
  title?: string;
  category?: string;
  authorName?: string;
  authorReputation?: number;
}

// Video upload component props
export interface VideoUploadProps {
  onUploadSuccess: (videoData: VideoMetadata) => void;
  onUploadError: (error: UploadError) => void;
  maxFileSize?: number; // Default: 100MB
  acceptedFormats?: string[]; // Default: ['mp4', 'mov', 'avi', 'wmv', 'mkv']
  showPreview?: boolean; // Default: true
}

// Video player component props
export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  onLoadStart?: () => void;
  onLoadError?: (error: Error) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

// Video preview component props
export interface VideoPreviewProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
  maxDuration?: number; // seconds
}

// Upload error interface
export interface UploadError {
  code: string;
  message: string;
  details?: any;
}

// File validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  fileInfo?: {
    format: string;
    duration: number;
    resolution: { width: number; height: number };
    bitrate: number;
  };
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Video upload service interface
export interface VideoUploadService {
  uploadVideo(file: File, metadata: Partial<VideoMetadata>): Promise<VideoMetadata>;
  validateVideoFile(file: File): Promise<ValidationResult>;
  generateThumbnail(file: File): Promise<string>;
  deleteVideo(videoId: string): Promise<void>;
}

// Extended GitHub storage service interface
export interface GitHubStorageService {
  // Existing image methods
  uploadImage(file: File, folder?: string): Promise<string>;
  deleteImage(fileName: string): Promise<boolean>;
  
  // New video methods
  uploadVideo(file: File, path: string): Promise<string>;
  getVideoUrl(path: string): Promise<string>;
  deleteVideo(path: string): Promise<void>;
}

// Video file validation options
export interface VideoValidationOptions {
  maxSize: number; // in bytes
  allowedFormats: string[];
  maxDuration?: number; // in seconds
  minDuration?: number; // in seconds
  maxResolution?: {
    width: number;
    height: number;
  };
}

// Default video validation options
export const DEFAULT_VIDEO_VALIDATION: VideoValidationOptions = {
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedFormats: ['mp4', 'mov', 'avi', 'wmv', 'mkv'],
  maxDuration: 600, // 10 minutes
  minDuration: 1, // 1 second
  maxResolution: {
    width: 1920,
    height: 1080
  }
};

// Supported video MIME types
export const SUPPORTED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-ms-wmv', // .wmv
  'video/x-matroska' // .mkv
];

// Video format to MIME type mapping
export const VIDEO_FORMAT_MIME_MAP: Record<string, string> = {
  'mp4': 'video/mp4',
  'mov': 'video/quicktime',
  'avi': 'video/x-msvideo',
  'wmv': 'video/x-ms-wmv',
  'mkv': 'video/x-matroska'
};