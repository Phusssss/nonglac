/**
 * Extended GitHub Storage Service
 * 
 * This extends the existing GitHub storage service to support video uploads
 * while maintaining backward compatibility with image uploads.
 */

import { GitHubStorageService } from '../types/video';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN || '';
const GITHUB_OWNER = 'Phusssss';
const GITHUB_REPO = 'task-files';

class GitHubStorageServiceImpl implements GitHubStorageService {
  
  /**
   * Uploads an image file (existing functionality)
   * @param file - The image file to upload
   * @param folder - The folder to upload to
   * @returns Promise<string> - The download URL
   */
  async uploadImage(file: File, folder: string = 'images'): Promise<string> {
    try {
      const base64 = await this.fileToBase64(file);
      const fileName = `${folder}/${Date.now()}_${file.name || 'image.jpg'}`;
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Upload image: ${file.name}`,
            content: base64.split(',')[1],
            branch: 'main'
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API Response:', response.status, errorText);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      await response.json();
      const downloadURL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${fileName}`;
      console.log('GitHub upload success, returning URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('GitHub upload error:', error);
      throw error;
    }
  }

  /**
   * Deletes an image file (existing functionality)
   * @param fileName - The file name to delete
   * @returns Promise<boolean> - Success status
   */
  async deleteImage(fileName: string): Promise<boolean> {
    try {
      const getResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!getResponse.ok) {
        throw new Error('File not found');
      }

      const fileData = await getResponse.json();
      
      const deleteResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Delete image: ${fileName}`,
            sha: fileData.sha,
            branch: 'main'
          })
        }
      );

      return deleteResponse.ok;
    } catch (error) {
      console.error('GitHub delete error:', error);
      return false;
    }
  }

  /**
   * Uploads a video file (new functionality)
   * @param file - The video file to upload
   * @param path - The full path including filename
   * @returns Promise<string> - The download URL
   */
  async uploadVideo(file: File, path: string): Promise<string> {
    try {
      // For large video files, we might need to implement chunked uploads
      // For now, we'll use the same approach as images but with size validation
      
      const maxSize = 100 * 1024 * 1024; // 100MB GitHub file size limit
      if (file.size > maxSize) {
        throw new Error(`File too large: ${file.size} bytes. Maximum allowed: ${maxSize} bytes`);
      }

      // Generate unique filename if not provided in path
      const uniquePath = this.generateUniqueVideoPath(path, file.name);
      
      const base64 = await this.fileToBase64(file);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${uniquePath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Upload video: ${file.name}`,
            content: base64.split(',')[1],
            branch: 'main'
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API Response:', response.status, errorText);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      await response.json();
      const downloadURL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${uniquePath}`;
      console.log('GitHub video upload success, returning URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('GitHub video upload error:', error);
      throw error;
    }
  }

  /**
   * Gets a video URL (new functionality)
   * @param path - The path to the video file
   * @returns Promise<string> - The download URL
   */
  async getVideoUrl(path: string): Promise<string> {
    return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${path}`;
  }

  /**
   * Deletes a video file (new functionality)
   * @param path - The path to the video file
   */
  async deleteVideo(path: string): Promise<void> {
    try {
      const getResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!getResponse.ok) {
        throw new Error('Video file not found');
      }

      const fileData = await getResponse.json();
      
      const deleteResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Delete video: ${path}`,
            sha: fileData.sha,
            branch: 'main'
          })
        }
      );

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete video file');
      }
    } catch (error) {
      console.error('GitHub video delete error:', error);
      throw error;
    }
  }

  /**
   * Converts file to base64 (utility method)
   * @param file - The file to convert
   * @returns Promise<string> - Base64 encoded file
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Gets raw GitHub URL for better performance (utility method)
   * @param downloadUrl - The GitHub download URL
   * @returns string - Raw GitHub URL
   */
  getRawUrl(downloadUrl: string): string {
    return downloadUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  /**
   * Generates unique video path following the storage structure
   * @param basePath - Base path for the video
   * @param fileName - Original filename
   * @returns string - Unique path for video storage
   */
  private generateUniqueVideoPath(basePath: string, fileName: string): string {
    // Extract user ID from path if present, or use timestamp
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    
    // Sanitize filename to prevent security issues
    const sanitizedFileName = this.sanitizeFileName(fileName);
    
    // If basePath already includes a filename, use it as is
    if (basePath.includes('.')) {
      return basePath;
    }
    
    // Otherwise, generate unique filename
    const uniqueFileName = `${timestamp}_${randomId}_${sanitizedFileName}`;
    return basePath.endsWith('/') ? `${basePath}${uniqueFileName}` : `${basePath}/${uniqueFileName}`;
  }

  /**
   * Sanitizes filename to prevent security vulnerabilities
   * @param fileName - Original filename
   * @returns string - Sanitized filename
   */
  private sanitizeFileName(fileName: string): string {
    // Remove or replace dangerous characters
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .toLowerCase(); // Convert to lowercase for consistency
  }
}

// Create singleton instance
const githubStorageExtended = new GitHubStorageServiceImpl();

// Extend the existing githubStorage service with video methods
export const githubStorage = {
  // Existing methods from the original service
  uploadImage: githubStorageExtended.uploadImage.bind(githubStorageExtended),
  deleteImage: githubStorageExtended.deleteImage.bind(githubStorageExtended),
  fileToBase64: githubStorageExtended['fileToBase64'].bind(githubStorageExtended),
  getRawUrl: githubStorageExtended.getRawUrl.bind(githubStorageExtended),
  
  // New video methods
  uploadVideo: githubStorageExtended.uploadVideo.bind(githubStorageExtended),
  getVideoUrl: githubStorageExtended.getVideoUrl.bind(githubStorageExtended),
  deleteVideo: githubStorageExtended.deleteVideo.bind(githubStorageExtended),
  
  // Utility methods for video storage paths
  generateVideoStoragePath: (userId: string, fileName: string): string => {
    const timestamp = Date.now();
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
    return `videos/user-${userId}/${timestamp}_${sanitizedFileName}`;
  },
  
  generateThumbnailStoragePath: (userId: string, videoFileName: string): string => {
    const timestamp = Date.now();
    const baseName = videoFileName.replace(/\.[^.]+$/, '');
    const sanitizedBaseName = baseName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
    return `thumbnails/user-${userId}/${timestamp}_${sanitizedBaseName}_thumb.jpg`;
  }
};

export default githubStorage;