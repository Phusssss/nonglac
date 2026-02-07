/**
 * Video Helper Utilities for AI Video Call Feature
 * 
 * This module provides utility functions for:
 * - Capturing frames from video elements
 * - Managing camera constraints
 * - Handling advanced camera capabilities
 */

/**
 * Captures a frame from a video element and converts it to base64 JPEG
 * 
 * @param {HTMLVideoElement} videoElement - The video element to capture from
 * @param {number} quality - JPEG quality (0-1), default 0.8
 * @returns {string} Base64 encoded JPEG image
 */
export const captureFrame = (videoElement, quality = 0.8) => {
  if (!videoElement) {
    throw new Error('Video element is required');
  }

  if (videoElement.readyState < 2) {
    throw new Error('Video element is not ready');
  }

  // Create canvas element
  const canvas = document.createElement('canvas');
  
  // Set canvas dimensions to match video dimensions
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Get 2D context
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Enhance image before capturing for better AI recognition
  // Using image smoothing and proper scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw video frame to canvas
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Convert to base64 JPEG with higher quality for analysis
  const base64String = canvas.toDataURL('image/jpeg', Math.max(quality, 0.9));

  return base64String;
};

/**
 * Gets camera constraints for getUserMedia based on facing mode
 * 
 * @param {string} facingMode - 'user' for front camera or 'environment' for back camera
 * @returns {MediaStreamConstraints} Constraints object for getUserMedia
 */
export const getCameraConstraints = (facingMode) => {
  return {
    video: {
      facingMode: facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  };
};

/**
 * Builds advanced constraints array based on camera capabilities
 * 
 * This function checks for support of advanced camera features like
 * continuous focus, exposure, and white balance modes. These are typically
 * used for the back camera ('environment' facing mode) to improve image quality.
 * 
 * @param {MediaTrackCapabilities} capabilities - Camera capabilities object from track.getCapabilities()
 * @returns {Array} Array of advanced constraint objects
 * 
 * @example
 * const track = stream.getVideoTracks()[0];
 * const capabilities = track.getCapabilities();
 * const constraints = getAdvancedConstraints(capabilities);
 * // Returns: [{ focusMode: 'continuous', exposureMode: 'continuous', whiteBalanceMode: 'continuous' }]
 */
export const getAdvancedConstraints = (capabilities) => {
  if (!capabilities) {
    return [];
  }

  const advancedConstraints = {};

  // Check for focus mode support
  if (capabilities.focusMode && Array.isArray(capabilities.focusMode)) {
    if (capabilities.focusMode.includes('continuous')) {
      advancedConstraints.focusMode = 'continuous';
    }
  }

  // Check for exposure mode support
  if (capabilities.exposureMode && Array.isArray(capabilities.exposureMode)) {
    if (capabilities.exposureMode.includes('continuous')) {
      advancedConstraints.exposureMode = 'continuous';
    }
  }

  // Check for white balance support
  if (capabilities.whiteBalanceMode && Array.isArray(capabilities.whiteBalanceMode)) {
    if (capabilities.whiteBalanceMode.includes('continuous')) {
      advancedConstraints.whiteBalanceMode = 'continuous';
    }
  }

  // Build advanced constraints array
  // Return empty array if no advanced constraints are supported
  if (Object.keys(advancedConstraints).length === 0) {
    return [];
  }

  // Return as array with single constraint object
  return [advancedConstraints];
};
