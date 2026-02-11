/**
 * useVideoCallV2 Hook
 * 
 * Enhanced video call hook using dual-model architecture (OrchestratorService).
 * Maintains same interface as useVideoCall for backward compatibility.
 * 
 * This hook coordinates:
 * - Video and audio stream management (via useMediaStream)
 * - Audio processing and visualization (via useAudioProcessor)
 * - Dual-model AI session lifecycle (Audio Model + Analysis Model)
 * - UI state management (status, errors, controls)
 * 
 * Key differences from useVideoCall:
 * - Uses OrchestratorService instead of VideoCallService
 * - Separates audio and analysis into two independent models
 * - Improved accuracy for image recognition
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useMediaStream } from './useMediaStream';
import useAudioProcessor from './useAudioProcessor';
import { captureFrame } from '../utils/videoHelpers';
import OrchestratorService from '../services/OrchestratorService';

/**
 * Main video call hook (V2 - Dual Model Architecture)
 * 
 * @param {string} userName - Name of the user for personalized AI interactions
 * @param {Function} onUsage - Callback when AI usage occurs (for tracking)
 * @returns {Object} Video call state and control functions
 */
export const useVideoCallV2 = (userName, onUsage) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Call status and UI state
  const [status, setStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  // Note: isMicOn removed - no voice input support
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [mascotMessage, setMascotMessage] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [flash, setFlash] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // ============================================================================
  // REFS
  // ============================================================================
  
  // DOM element refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const visualizerRef = useRef(null);
  
  // Service instance refs - using OrchestratorService
  const orchestratorRef = useRef(null);
  
  // Note: keepAliveTimerRef removed - no audio input to keep alive
  
  // Animation frame ref for cleanup
  const animationFrameRef = useRef(null);

  // ============================================================================
  // CUSTOM HOOKS INTEGRATION
  // ============================================================================
  
  // Media stream management
  const mediaStream = useMediaStream();
  
  // Audio processing (16kHz input, 24kHz output)
  const audioProcessor = useAudioProcessor(16000, 24000);
  
  // Audio processing cleanup ref
  const audioProcessingCleanupRef = useRef(null);

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================
  
  /**
   * Validate API key format and presence
   * 
   * @param {string} apiKey - The API key to validate
   * @returns {boolean} True if valid, false otherwise
   */
  const isValidApiKey = (apiKey) => {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }
    
    // Check if it's a placeholder or empty
    if (apiKey.includes('your_') || apiKey.trim().length === 0) {
      return false;
    }
    
    // Basic format check for Gemini API keys (starts with AIza)
    if (!apiKey.startsWith('AIza')) {
      return false;
    }
    
    // Check minimum length
    if (apiKey.length < 30) {
      return false;
    }
    
    return true;
  };

  /**
   * Start video call session using OrchestratorService
   * Initializes dual-model AI connection, audio processing, and media streams
   * 
   * @returns {Promise<void>}
   */
  const startSession = useCallback(async () => {
    try {
      setStatus('connecting');
      setErrorMessage('');
      setIsSimulationMode(false);
      
      // Step 1: Auto-start camera
      try {
        console.log('useVideoCallV2: Auto-starting camera...');
        const videoStream = await mediaStream.startVideo('environment');
        console.log('useVideoCallV2: Camera stream obtained:', videoStream);
        
        // Set state immediately
        setIsCameraOn(true);
        setFacingMode('environment');
        
        if (videoRef.current && videoStream) {
          videoRef.current.srcObject = videoStream;
          console.log('useVideoCallV2: Stream attached to video element');
          
          // Play video
          videoRef.current.onloadedmetadata = () => {
            console.log('useVideoCallV2: Video metadata loaded');
            videoRef.current.play()
              .then(() => console.log('useVideoCallV2: Video playing successfully'))
              .catch(e => console.error('useVideoCallV2: Video play error:', e));
          };
        }
      } catch (cameraError) {
        console.warn('useVideoCallV2: Camera not available:', cameraError);
        // Continue without camera
      }
      
      // Step 2: Validate API key
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      console.log('useVideoCallV2: API key from env:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
      
      if (!isValidApiKey(apiKey)) {
        console.warn('useVideoCallV2: Invalid or missing API key, starting simulation mode');
        setIsSimulationMode(true);
        setStatus('listening');
        setMascotMessage('Chế độ mô phỏng - API key không hợp lệ');
        return;
      }
      
      // Step 3: Initialize OrchestratorService
      try {
        console.log('useVideoCallV2: Initializing OrchestratorService...');
        orchestratorRef.current = new OrchestratorService(apiKey, userName);
        
      } catch (serviceError) {
        console.warn('useVideoCallV2: OrchestratorService error, starting simulation mode:', serviceError.message);
        setIsSimulationMode(true);
        setStatus('listening');
        setMascotMessage('Chế độ mô phỏng - Dịch vụ đang phát triển');
        return;
      }
      
      // Step 4: Start OrchestratorService session (audio output only for TTS)
      if (!orchestratorRef.current) {
        console.warn('useVideoCallV2: OrchestratorService not initialized, using simulation mode');
        setIsSimulationMode(true);
        setStatus('listening');
        setMascotMessage('Chế độ mô phỏng');
        return;
      }
      
      try {
        console.log('useVideoCallV2: Starting orchestrator session...');
        
        await orchestratorRef.current.startSession({
          onStatusChange: (newStatus) => {
            console.log('useVideoCallV2: Status changed to:', newStatus);
            setStatus(newStatus);
            
            // Handle simulation mode status
            if (newStatus === 'simulation') {
              setIsSimulationMode(true);
            }
          },
          onMessage: (message) => {
            console.log('useVideoCallV2: Message received:', message);
            setMascotMessage(message);
            setAiResponse(message);
          },
          onError: (error) => {
            console.error('useVideoCallV2: Session error:', error);
            setErrorMessage(error || 'Đã xảy ra lỗi trong phiên gọi');
            setStatus('error');
          },
          onAudioOutput: (audioData) => {
            try {
              // IMPORTANT: Temporarily pause audio input to prevent feedback loop
              if (audioProcessingCleanupRef.current) {
                console.log('useVideoCallV2: Pausing audio input during AI speech');
                // Stop sending audio to prevent echo/feedback
                audioProcessor.pauseInput?.();
              }
              
              // Play audio output through audioProcessor
              audioProcessor.playOutput(audioData.data);
              setStatus('speaking');
              
              // Resume audio input after a short delay (when AI finishes speaking)
              // This prevents the "rè rè" sound from audio feedback
              setTimeout(() => {
                if (audioProcessor.resumeInput) {
                  console.log('useVideoCallV2: Resuming audio input after AI speech');
                  audioProcessor.resumeInput();
                }
              }, 500); // 500ms delay to ensure audio output is done
              
            } catch (playError) {
              console.error('useVideoCallV2: Failed to play audio output:', playError);
            }
          }
        });
        
        console.log('useVideoCallV2: Orchestrator session started successfully');
        
        // Ensure audio contexts are active for TTS output only
        if (audioProcessor.outputContext?.state === 'suspended') {
          await audioProcessor.outputContext.resume();
        }
        
        // Set status to listening (ready for image capture)
        if (!isSimulationMode) {
          setStatus('listening');
        }
        
      } catch (connectionError) {
        console.warn('useVideoCallV2: Failed to start orchestrator session, using simulation mode');
        console.error('useVideoCallV2: Connection error:', connectionError);
        setIsSimulationMode(true);
        setStatus('listening');
        setMascotMessage('Chế độ mô phỏng - Bạn vẫn có thể trải nghiệm các tính năng cơ bản');
      }
      
    } catch (error) {
      console.error('useVideoCallV2: Failed to start session:', error);
      setIsSimulationMode(true);
      setStatus('listening');
      setErrorMessage('Đã xảy ra lỗi. Đang chạy ở chế độ mô phỏng');
      
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: { feature: 'video-call-v2', action: 'startSession' },
          extra: { userName, isSimulationMode }
        });
      }
    }
  }, [userName, mediaStream, audioProcessor, isSimulationMode]);

  /**
   * Stop video call session
   * Cleans up all resources, streams, and connections
   */
  const stopSession = useCallback(() => {
    try {
      console.log('useVideoCallV2: Stopping video call session...');
      
      // Step 1: Stop orchestrator session
      if (orchestratorRef.current) {
        try {
          orchestratorRef.current.stopSession();
          console.log('useVideoCallV2: Orchestrator session stopped');
        } catch (serviceError) {
          console.error('useVideoCallV2: Error stopping orchestrator:', serviceError);
        }
        orchestratorRef.current = null;
      }
      
      // Step 2: Clean up audio processing
      if (audioProcessingCleanupRef.current) {
        try {
          audioProcessingCleanupRef.current();
          console.log('useVideoCallV2: Audio processing cleanup completed');
        } catch (audioCleanupError) {
          console.error('useVideoCallV2: Error cleaning up audio processing:', audioCleanupError);
        }
        audioProcessingCleanupRef.current = null;
      }
      
      // Step 3: Stop camera stream only (no audio stream to stop)
      try {
        mediaStream.stopVideo();
        console.log('useVideoCallV2: Media streams stopped');
      } catch (mediaError) {
        console.error('useVideoCallV2: Error stopping media streams:', mediaError);
      }
      
      // Step 4: Clean up audio contexts
      try {
        audioProcessor.cleanup();
        console.log('useVideoCallV2: Audio contexts cleaned up');
      } catch (contextError) {
        console.error('useVideoCallV2: Error cleaning up audio contexts:', contextError);
      }
      
      // Step 5: Cancel animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        console.log('useVideoCallV2: Animation frames cancelled');
      }
      
      // Step 6: Clear video element source
      if (videoRef.current && videoRef.current.srcObject) {
        console.log('useVideoCallV2: Clearing video srcObject');
        videoRef.current.srcObject = null;
      }
      
      // Step 7: Reset all state to initial values
      setStatus('connecting');
      setIsCameraOn(false);
      // Note: setIsMicOn removed - no voice input
      setMascotMessage(null);
      setActiveTool(null);
      setErrorMessage('');
      setIsSimulationMode(false);
      setFlash(false);
      setAiResponse('');
      
      console.log('useVideoCallV2: Video call session stopped successfully');
      
    } catch (error) {
      console.error('useVideoCallV2: Error stopping session:', error);
      
      // Log to Sentry if available
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: { feature: 'video-call-v2', action: 'stopSession' },
          extra: { 
            hadOrchestrator: !!orchestratorRef.current,
            hadAudioCleanup: !!audioProcessingCleanupRef.current
          }
        });
      }
      
      // Even if there's an error, try to reset state
      try {
        setStatus('connecting');
        setIsCameraOn(false);
        // Note: setIsMicOn removed - no voice input
        setMascotMessage(null);
        setActiveTool(null);
        setErrorMessage('');
        setIsSimulationMode(false);
        setFlash(false);
        setAiResponse('');
      } catch (stateError) {
        console.error('useVideoCallV2: Error resetting state:', stateError);
      }
    }
  }, []); // Empty deps - uses refs only

  // ============================================================================
  // AUDIO KEEP-ALIVE
  // ============================================================================
  
  /**
  // ============================================================================
  // CAMERA CONTROLS
  // ============================================================================
  
  /**
   * Toggle camera on/off
   */
  const toggleCamera = useCallback(async () => {
    try {
      console.log('useVideoCallV2: toggleCamera called, isCameraOn:', isCameraOn);
      
      if (isCameraOn) {
        // Turn camera off
        mediaStream.stopVideo();
        
        // Clear video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        setIsCameraOn(false);
        console.log('useVideoCallV2: Camera turned off');
      } else {
        // Turn camera on
        console.log('useVideoCallV2: Starting camera with facingMode:', facingMode);
        const stream = await mediaStream.startVideo(facingMode);
        console.log('useVideoCallV2: Camera stream obtained:', stream);
        
        // Set state immediately
        setIsCameraOn(true);
        console.log('useVideoCallV2: Camera turned on');
        
        // Attach stream to video element
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          console.log('useVideoCallV2: Stream attached to video element');
          
          // Play video
          videoRef.current.onloadedmetadata = () => {
            console.log('useVideoCallV2: Video metadata loaded, attempting to play');
            videoRef.current.play()
              .then(() => console.log('useVideoCallV2: Video playing'))
              .catch(e => console.error('useVideoCallV2: Video play error:', e));
          };
        }
      }
    } catch (error) {
      console.error('useVideoCallV2: Error toggling camera:', error);
      setErrorMessage(error.message || 'Không thể bật/tắt camera');
      setStatus('error');
    }
  }, [isCameraOn, facingMode, mediaStream]);

  /**
   * Switch between front and back cameras
   */
  const switchCamera = useCallback(async () => {
    try {
      const newStream = await mediaStream.switchCamera();
      
      // Update facing mode state
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);
      
      // Attach new stream to video element
      if (videoRef.current && newStream) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
      
    } catch (error) {
      console.error('useVideoCallV2: Error switching camera:', error);
      setErrorMessage(error.message || 'Không thể chuyển camera');
      setStatus('error');
    }
  }, [facingMode, mediaStream]);

  // ============================================================================
  // IMAGE CAPTURE & ANALYSIS
  // ============================================================================
  
  /**
   * Capture current video frame and send to AI for analysis
   * Uses OrchestratorService.handleImageCapture for dual-model processing
   */
  const captureAndAnalyze = useCallback(async () => {
    try {
      if (!isCameraOn || !videoRef.current) {
        console.warn('useVideoCallV2: Camera is not active');
        return;
      }
      
      console.log('useVideoCallV2: === CAPTURE AND ANALYZE START ===');
      
      // Step 1: Trigger flash effect
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
      
      // Step 2: Update status
      setStatus('analyzing');
      setMascotMessage('Chờ Lạc Lạc 1 xíu nhé...');
      
      // Step 3: Wait for video to stabilize after flash
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 4: Capture HIGHEST QUALITY frame (0.98 for maximum detail)
      const dataUri = captureFrame(videoRef.current, 0.98);
      
      if (!dataUri) {
        throw new Error('Failed to capture video frame');
      }
      
      // Remove data URI prefix (e.g., "data:image/jpeg;base64,")
      const base64Image = dataUri.split(',')[1];
      
      if (!base64Image) {
        throw new Error('Failed to extract base64 from captured frame');
      }
      
      // Continue with analysis
      await analyzeImage(base64Image);
      
    } catch (error) {
      console.error('useVideoCallV2: Error capturing and analyzing:', error);
      
      if (error.message?.includes('capture')) {
        setErrorMessage('Không thể chụp hình ảnh từ camera');
      } else {
        setErrorMessage('Không thể chụp và phân tích hình ảnh');
      }
      
      setStatus('error');
      
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: { feature: 'video-call-v2', action: 'captureAndAnalyze' },
          extra: { 
            isCameraOn,
            hasVideoRef: !!videoRef.current,
            isSimulationMode
          }
        });
      }
    }
  }, [isCameraOn, isSimulationMode]);

  /**
   * Upload and analyze image from file
   * Uses same dual-model processing as camera capture
   */
  const uploadAndAnalyze = useCallback(async (file) => {
    try {
      if (!file) {
        console.warn('useVideoCallV2: No file provided');
        return;
      }

      console.log('useVideoCallV2: === UPLOAD AND ANALYZE START ===');
      console.log('useVideoCallV2: File:', file.name, file.type, file.size);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Vui lòng chọn file ảnh (JPG, PNG, etc.)');
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrorMessage('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB');
        return;
      }

      // Update status
      setStatus('analyzing');
      setMascotMessage('Chờ Lạc Lạc 1 xíu nhé...');

      // Convert file to base64
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('useVideoCallV2: File converted to base64');

      // Continue with analysis
      await analyzeImage(base64Image);

    } catch (error) {
      console.error('useVideoCallV2: Error uploading and analyzing:', error);
      
      if (error.message?.includes('FileReader')) {
        setErrorMessage('Không thể đọc file ảnh');
      } else {
        setErrorMessage('Không thể phân tích ảnh');
      }
      
      setStatus('error');
      
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: { feature: 'video-call-v2', action: 'uploadAndAnalyze' },
          extra: { 
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type,
            isSimulationMode
          }
        });
      }
    }
  }, [isSimulationMode]);

  /**
   * Common image analysis logic for both capture and upload
   * @private
   */
  const analyzeImage = useCallback(async (base64Image) => {
    try {
      const imageSizeKB = (base64Image.length * 3 / 4 / 1024).toFixed(2);
      console.log('useVideoCallV2: Image size:', imageSizeKB, 'KB');
      
      // Send to OrchestratorService for dual-model processing
      try {
        if (orchestratorRef.current && !isSimulationMode) {
          console.log('useVideoCallV2: Sending image to orchestrator...');
          
          // Prepare image data object
          const imageData = {
            base64: base64Image,
            mimeType: 'image/jpeg',
            quality: 0.98,
            timestamp: Date.now()
          };
          
          // Use orchestrator's handleImageCapture method
          await orchestratorRef.current.handleImageCapture(imageData);
          
          console.log('useVideoCallV2: Image sent successfully, orchestrator handling analysis...');
        } else {
          // Fallback to aiService in simulation mode
          const { analyzePlantImage } = await import('../services/aiService');
          
          const result = await analyzePlantImage(
            base64Image,
            'Phân tích hình ảnh này và cho tôi biết về cây trồng, tình trạng sức khỏe, và bất kỳ vấn đề nào bạn nhìn thấy.'
          );
          
          if (result && result.success) {
            setMascotMessage(result.result);
            setStatus('listening');
          } else {
            throw new Error('AI analysis returned no result');
          }
        }
      } catch (analysisError) {
        console.error('useVideoCallV2: AI analysis error:', analysisError);
        
        if (analysisError.message?.includes('hết lượt AI')) {
          setErrorMessage('Bạn đã sử dụng hết lượt AI. Vui lòng thử lại sau.');
        } else if (analysisError.message?.includes('đăng nhập')) {
          setErrorMessage('Vui lòng đăng nhập để sử dụng tính năng này');
        } else {
          setErrorMessage('Không thể phân tích hình ảnh. Vui lòng thử lại.');
        }
        
        setStatus('error');
        
        if (window.Sentry) {
          window.Sentry.captureException(analysisError, {
            tags: { feature: 'video-call-v2', action: 'analyzeImage' },
            extra: { 
              isSimulationMode,
              hasOrchestrator: !!orchestratorRef.current,
              imageSizeKB
            }
          });
        }
        
        return;
      }
      
      // Track AI usage
      if (onUsage && typeof onUsage === 'function') {
        try {
          onUsage();
        } catch (usageError) {
          console.error('useVideoCallV2: Error calling onUsage callback:', usageError);
        }
      }
      
      console.log('useVideoCallV2: === IMAGE ANALYSIS END ===');
      
    } catch (error) {
      console.error('useVideoCallV2: Error in analyzeImage:', error);
      throw error;
    }
  }, [isSimulationMode, onUsage]);

  // ============================================================================
  // LIFECYCLE & CLEANUP
  // ============================================================================
  
  /**
   * Cleanup effect - ensures all resources are released on unmount
   */
  useEffect(() => {
    // Return cleanup function that will be called on unmount
    return () => {
      // Only cleanup if session is actually active
      if (orchestratorRef.current || audioProcessingCleanupRef.current) {
        console.log('useVideoCallV2: Cleanup on unmount');
        stopSession();
      }
    };
    // Empty deps - only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // RETURN API
  // ============================================================================
  
  return {
    // State
    status,
    errorMessage,
    isCameraOn,
    facingMode,
    // Note: isMicOn removed - no voice input support
    isSimulationMode,
    mascotMessage,
    activeTool,
    flash,
    aiResponse,
    
    // Refs
    videoRef,
    canvasRef,
    visualizerRef,
    
    // Audio processor nodes (output only for TTS)
    outputAnalyser: audioProcessor.outputAnalyser,
    
    // Actions
    startSession,
    stopSession,
    toggleCamera,
    switchCamera,
    captureAndAnalyze,
    uploadAndAnalyze,
    
    // Computed properties
    canCapture: isCameraOn && status !== 'error',
  };
};

export default useVideoCallV2;
