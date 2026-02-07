import { useState, useRef, useCallback, useEffect } from 'react';
import { getCameraConstraints, getAdvancedConstraints } from '../utils/videoHelpers';

/**
 * Custom hook for managing media streams (camera and microphone)
 * 
 * This hook provides functionality to:
 * - Start/stop video stream with camera selection
 * - Start/stop audio stream
 * - Switch between front and back cameras
 * - Apply advanced camera constraints
 * - Handle permission errors
 * 
 * @returns {Object} Media stream state and control functions
 */
export const useMediaStream = () => {
  // State for video and audio streams
  const [videoStream, setVideoStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [error, setError] = useState(null);
  
  // Refs to store current facing mode
  const currentFacingMode = useRef('user');

  /**
   * Start video stream with specified facing mode
   * 
   * @param {string} facingMode - 'user' for front camera or 'environment' for back camera
   * @returns {Promise<MediaStream>} The video stream
   */
  const startVideo = useCallback(async (facingMode = 'user') => {
    try {
      setError(null);
      
      // Get camera constraints
      const constraints = getCameraConstraints(facingMode);
      
      // Request video stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Apply advanced constraints for environment (back) camera
      if (facingMode === 'environment') {
        const videoTrack = stream.getVideoTracks()[0];
        
        if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
          const capabilities = videoTrack.getCapabilities();
          const advancedConstraints = getAdvancedConstraints(capabilities);
          
          // Apply advanced constraints if available
          if (advancedConstraints.length > 0) {
            try {
              await videoTrack.applyConstraints({
                advanced: advancedConstraints
              });
            } catch (constraintError) {
              // Log but don't fail if advanced constraints can't be applied
              console.warn('Could not apply advanced constraints:', constraintError);
            }
          }
        }
      }
      
      // Update state and ref
      currentFacingMode.current = facingMode;
      setVideoStream(stream);
      
      return stream;
    } catch (err) {
      console.error('Error starting video:', err);
      
      // Handle specific error types
      let errorMessage = 'Không thể truy cập camera';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Vui lòng cho phép truy cập camera trong cài đặt trình duyệt';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Không tìm thấy camera trên thiết bị';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera không hỗ trợ cài đặt yêu cầu';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Stop video stream and release camera
   */
  const stopVideo = useCallback(() => {
    if (videoStream) {
      // Stop all video tracks
      videoStream.getTracks().forEach(track => {
        track.stop();
      });
      
      // Clear stream state
      setVideoStream(null);
    }
  }, [videoStream]);

  /**
   * Start audio stream (microphone)
   * 
   * @returns {Promise<MediaStream>} The audio stream
   */
  const startAudio = useCallback(async () => {
    try {
      setError(null);
      
      // Request audio stream with specific constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setAudioStream(stream);
      
      return stream;
    } catch (err) {
      console.error('Error starting audio:', err);
      
      // Handle specific error types
      let errorMessage = 'Không thể truy cập microphone';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Vui lòng cho phép truy cập microphone trong cài đặt trình duyệt';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Không tìm thấy microphone trên thiết bị';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Microphone đang được sử dụng bởi ứng dụng khác';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Stop audio stream and release microphone
   */
  const stopAudio = useCallback(() => {
    if (audioStream) {
      // Stop all audio tracks
      audioStream.getTracks().forEach(track => {
        track.stop();
      });
      
      // Clear stream state
      setAudioStream(null);
    }
  }, [audioStream]);

  /**
   * Switch between front and back cameras
   * 
   * @returns {Promise<MediaStream>} The new video stream
   */
  const switchCamera = useCallback(async () => {
    try {
      // Stop current video stream
      stopVideo();
      
      // Toggle facing mode
      const newFacingMode = currentFacingMode.current === 'user' ? 'environment' : 'user';
      
      // Start new video stream with toggled facing mode
      const newStream = await startVideo(newFacingMode);
      
      return newStream;
    } catch (err) {
      console.error('Error switching camera:', err);
      throw err;
    }
  }, [startVideo, stopVideo]);

  /**
   * Apply constraints to existing video track
   * 
   * @param {MediaTrackConstraints} constraints - Constraints to apply
   * @returns {Promise<void>}
   */
  const applyConstraints = useCallback(async (constraints) => {
    if (!videoStream) {
      throw new Error('No active video stream');
    }
    
    const videoTrack = videoStream.getVideoTracks()[0];
    
    if (!videoTrack) {
      throw new Error('No video track found');
    }
    
    try {
      await videoTrack.applyConstraints(constraints);
    } catch (err) {
      console.error('Error applying constraints:', err);
      throw err;
    }
  }, [videoStream]);

  /**
   * Cleanup effect - stops all streams on unmount
   * This ensures no media tracks are left running when the component unmounts
   */
  useEffect(() => {
    return () => {
      // Stop video stream if active
      if (videoStream) {
        videoStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // Stop audio stream if active
      if (audioStream) {
        audioStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, [videoStream, audioStream]);

  return {
    // State
    videoStream,
    audioStream,
    error,
    
    // Actions
    startVideo,
    stopVideo,
    startAudio,
    stopAudio,
    switchCamera,
    applyConstraints,
  };
};
