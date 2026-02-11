/**
 * useVideoCall Hook
 * 
 * Main hook for managing AI video call functionality.
 * Integrates media streams, audio processing, and AI session management.
 * 
 * This hook coordinates:
 * - Video and audio stream management (via useMediaStream)
 * - Audio processing and visualization (via useAudioProcessor)
 * - AI session lifecycle and interactions
 * - UI state management (status, errors, controls)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useMediaStream } from './useMediaStream';
import useAudioProcessor from './useAudioProcessor';
import { captureFrame } from '../utils/videoHelpers';

/**
 * Main video call hook
 * 
 * @param {string} userName - Name of the user for personalized AI interactions
 * @param {Function} onUsage - Callback when AI usage occurs (for tracking)
 * @returns {Object} Video call state and control functions
 */
export const useVideoCall = (userName, onUsage) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Call status and UI state
  const [status, setStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [isMicOn, setIsMicOn] = useState(true);
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
  
  // Service instance refs (will be initialized when services are implemented)
  const videoCallServiceRef = useRef(null);
  const sessionRef = useRef(null);
  
  // Realtime analysis timer ref
  const realtimeTimerRef = useRef(null);
  
  // Keep-alive timer for AudioContext
  const keepAliveTimerRef = useRef(null);
  
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
   * Start video call session
   * Initializes AI connection, audio processing, and media streams
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
        console.log('Auto-starting camera...');
        const videoStream = await mediaStream.startVideo('environment');
        console.log('Camera stream obtained:', videoStream);
        
        // Set state immediately
        setIsCameraOn(true);
        setFacingMode('environment');
        
        if (videoRef.current && videoStream) {
          videoRef.current.srcObject = videoStream;
          console.log('Stream attached to video element');
          
          // Play video
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current.play()
              .then(() => console.log('Video playing successfully'))
              .catch(e => console.error('Video play error:', e));
          };
        }
      } catch (cameraError) {
        console.warn('Camera not available:', cameraError);
        // Continue without camera
      }
      
      // Step 2: Validate API key
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      console.log('useVideoCall - API key from env:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
      
      if (!isValidApiKey(apiKey)) {
        console.warn('Invalid or missing API key, starting simulation mode');
        setIsSimulationMode(true);
        setStatus('listening');
        setMascotMessage('Chế độ mô phỏng - API key không hợp lệ');
        
        // In simulation mode, still try to start audio for testing
        try {
          const audioStream = await mediaStream.startAudio();
          const cleanup = audioProcessor.processInput(audioStream, () => {
            // No-op in simulation mode
          });
          audioProcessingCleanupRef.current = cleanup;
        } catch (audioError) {
          console.warn('Audio initialization failed in simulation mode:', audioError);
        }
        
        return;
      }
      
      // Step 3: Initialize VideoCallService
      try {
        const VideoCallService = (await import('../services/videoCallService')).default;
        
        if (!VideoCallService) {
          console.warn('VideoCallService not yet implemented, using simulation mode');
          throw new Error('SERVICE_NOT_IMPLEMENTED');
        }
        
        videoCallServiceRef.current = new VideoCallService(apiKey, userName);
        
      } catch (serviceError) {
        console.warn('VideoCallService error, starting simulation mode:', serviceError.message);
        setIsSimulationMode(true);
        setStatus('listening');
        setMascotMessage('Chế độ mô phỏng - Dịch vụ đang phát triển');
        return;
      }
      
      // Step 4: Start audio stream
      if (!isSimulationMode) {
        try {
          const audioStream = await mediaStream.startAudio();
          
          const cleanup = audioProcessor.processInput(audioStream, (audioData) => {
            if (videoCallServiceRef.current && isMicOn) {
              try {
                videoCallServiceRef.current.sendAudioInput(audioData);
              } catch (sendError) {
                console.error('Failed to send audio input:', sendError);
              }
            }
          });
          
          audioProcessingCleanupRef.current = cleanup;
          
        } catch (audioError) {
          console.error('Audio initialization failed:', audioError);
          
          if (audioError.name === 'NotAllowedError') {
            setErrorMessage('Vui lòng cho phép truy cập microphone để sử dụng tính năng này');
          } else if (audioError.name === 'NotFoundError') {
            setErrorMessage('Không tìm thấy microphone. Vui lòng kiểm tra thiết bị của bạn');
          } else {
            setErrorMessage('Không thể khởi tạo audio. Tiếp tục mà không có âm thanh');
          }
          
          console.warn('Continuing session without audio');
        }
      }
      
      // Step 5: Connect to Gemini Live API
      if (!videoCallServiceRef.current) {
        console.warn('VideoCallService not initialized, using simulation mode');
        setIsSimulationMode(true);
        setStatus('listening');
        setMascotMessage('Chế độ mô phỏng');
        return;
      }
      
      try {
        const session = await videoCallServiceRef.current.startSession({
          onStatusChange: (newStatus) => {
            setStatus(newStatus);
          },
          onMessage: (message) => {
            // Logic handled by onAudioOutput for voice calls
            // We only keep console log for debugging
            const messageText = typeof message === 'string' ? message : message?.content || '';
            console.log('AI Response:', messageText);
          },
          onToolCall: (tool) => {
            setActiveTool(tool);
            setStatus('thinking');
          },
          onAudioOutput: (base64Audio) => {
            try {
              // useAudioProcessor.playOutput handles the timing queue for seamless playback
              audioProcessor.playOutput(base64Audio);
              setStatus('speaking');
            } catch (playError) {
              console.error('Failed to play audio output:', playError);
            }
          },
          onError: (error) => {
            console.error('Session error:', error);
            setErrorMessage(error.message || 'Đã xảy ra lỗi trong phiên gọi');
            setStatus('error');
          },
          onOpen: async () => {
            console.log('Gemini Live connection established');
            setStatus('connecting'); // Still connecting until setupComplete
            
            // Ensure audio contexts are active (browsers often suspend them)
            if (audioProcessor.inputContext?.state === 'suspended') {
              await audioProcessor.inputContext.resume();
            }
            if (audioProcessor.outputContext?.state === 'suspended') {
              await audioProcessor.outputContext.resume();
            }
          },
          onReady: () => {
            console.log('Gemini Live is ready to talk');
            setStatus('listening');
            
            // SIMPLIFIED FLOW: Just greeting, no realtime analysis
            if (videoCallServiceRef.current) {
              videoCallServiceRef.current.sendTextInput('Chào bà con thật nồng nhiệt và nhắc họ bật camera rồi chụp ảnh cây trồng để Lạc Lạc phân tích nhé. Nói ngắn gọn 2-3 câu bằng tiếng Việt tự nhiên.');
            }

            // REMOVED: startRealtimeAnalysis() - No background analysis
            startAudioKeepAlive();
          },
          onClose: () => {
            console.log('Gemini Live connection closed');
          }
        });
        
        sessionRef.current = session;
        setStatus('listening');
        
      } catch (connectionError) {
        console.warn('Failed to connect to Gemini Live API, using simulation mode');
        setIsSimulationMode(true);
        setStatus('listening');
        setMascotMessage('Chế độ mô phỏng - Bạn vẫn có thể trải nghiệm các tính năng cơ bản');
      }
      
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsSimulationMode(true);
      setStatus('listening');
      setErrorMessage('Đã xảy ra lỗi. Đang chạy ở chế độ mô phỏng');
      
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: { feature: 'video-call', action: 'startSession' },
          extra: { userName, isMicOn }
        });
      }
    }
  }, [userName, mediaStream, audioProcessor, isMicOn]);

  /**
   * Stop video call session
   * Cleans up all resources, streams, and connections
   */
  const stopSession = useCallback(() => {
    try {
      console.log('Stopping video call session...');
      
      // Step 1: Close AI session
      if (videoCallServiceRef.current) {
        try {
          videoCallServiceRef.current.stopSession();
          console.log('AI session stopped');
        } catch (serviceError) {
          console.error('Error stopping AI service:', serviceError);
        }
        videoCallServiceRef.current = null;
      }
      
      // Clear session reference
      if (sessionRef.current) {
        sessionRef.current = null;
      }
      
      // Step 2: Clean up audio processing
      if (audioProcessingCleanupRef.current) {
        try {
          audioProcessingCleanupRef.current();
          console.log('Audio processing cleanup completed');
        } catch (audioCleanupError) {
          console.error('Error cleaning up audio processing:', audioCleanupError);
        }
        audioProcessingCleanupRef.current = null;
      }
      
      // Step 3: Stop camera and audio streams
      try {
        stopRealtimeAnalysis();
        stopAudioKeepAlive();
        mediaStream.stopVideo();
        mediaStream.stopAudio();
        console.log('Media streams stopped');
      } catch (mediaError) {
        console.error('Error stopping media streams:', mediaError);
      }
      
      // Step 4: Clean up audio contexts
      try {
        audioProcessor.cleanup();
        console.log('Audio contexts cleaned up');
      } catch (contextError) {
        console.error('Error cleaning up audio contexts:', contextError);
      }
      
      // Step 5: Cancel animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        console.log('Animation frames cancelled');
      }
      
      // Step 6: Clear video element source ONLY if it exists
      if (videoRef.current && videoRef.current.srcObject) {
        console.log('Clearing video srcObject');
        videoRef.current.srcObject = null;
      }
      
      // Step 7: Reset all state to initial values
      setStatus('connecting');
      setIsCameraOn(false);
      setIsMicOn(true);
      setMascotMessage(null);
      setActiveTool(null);
      setErrorMessage('');
      setIsSimulationMode(false);
      setFlash(false);
      
      console.log('Video call session stopped successfully');
      
    } catch (error) {
      console.error('Error stopping session:', error);
      
      // Log to Sentry if available
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: { feature: 'video-call', action: 'stopSession' },
          extra: { 
            hadVideoService: !!videoCallServiceRef.current,
            hadSession: !!sessionRef.current,
            hadAudioCleanup: !!audioProcessingCleanupRef.current
          }
        });
      }
      
      // Even if there's an error, try to reset state
      try {
        setStatus('connecting');
        setIsCameraOn(false);
        setIsMicOn(true);
        setMascotMessage(null);
        setActiveTool(null);
        setErrorMessage('');
        setIsSimulationMode(false);
        setFlash(false);
      } catch (stateError) {
        console.error('Error resetting state:', stateError);
      }
    }
  }, []); // Empty deps - uses refs only

  // ============================================================================
  // REALTIME ANALYSIS - REMOVED FOR SIMPLICITY
  // ============================================================================
  
  // Realtime analysis has been removed to optimize accuracy
  // Now only analyzes when user explicitly captures an image
  
  const startRealtimeAnalysis = useCallback(() => {
    // Disabled - no background analysis
    console.log('Realtime analysis disabled for optimal accuracy');
  }, []);

  const stopRealtimeAnalysis = useCallback(() => {
    // No-op since realtime is disabled
  }, []);

  /**
   * Keep AudioContext alive and active
   */
  const startAudioKeepAlive = useCallback(() => {
    if (keepAliveTimerRef.current) return;
    
    keepAliveTimerRef.current = setInterval(() => {
      // Check and resume input context
      if (audioProcessor.inputContext && audioProcessor.inputContext.state === 'suspended') {
        audioProcessor.inputContext.resume().catch(console.warn);
      }
      // Check and resume output context
      if (audioProcessor.outputContext && audioProcessor.outputContext.state === 'suspended') {
        audioProcessor.outputContext.resume().catch(console.warn);
      }
    }, 1000);
  }, [audioProcessor]);

  const stopAudioKeepAlive = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
  }, []);

  // ============================================================================
  // CAMERA CONTROLS
  // ============================================================================
  
  /**
   * Toggle camera on/off
   */
  const toggleCamera = useCallback(async () => {
    try {
      console.log('toggleCamera called, isCameraOn:', isCameraOn);
      
      if (isCameraOn) {
        // Turn camera off
        mediaStream.stopVideo();
        
        // Clear video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        setIsCameraOn(false);
        console.log('Camera turned off');
      } else {
        // Turn camera on
        console.log('Starting camera with facingMode:', facingMode);
        const stream = await mediaStream.startVideo(facingMode);
        console.log('Camera stream obtained:', stream);
        
        // Set state immediately
        setIsCameraOn(true);
        console.log('Camera turned on');
        
        // Attach stream to video element
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          console.log('Stream attached to video element');
          
          // Play video
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, attempting to play');
            videoRef.current.play()
              .then(() => console.log('Video playing'))
              .catch(e => console.error('Video play error:', e));
          };
        }
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
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
      console.error('Error switching camera:', error);
      setErrorMessage(error.message || 'Không thể chuyển camera');
      setStatus('error');
    }
  }, [facingMode, mediaStream]);

  // ============================================================================
  // IMAGE CAPTURE & ANALYSIS
  // ============================================================================
  
  /**
   * Capture current video frame and send to AI for analysis
   * OPTIMIZED: AI says "wait" first, then analyzes carefully
   */
  const captureAndAnalyze = useCallback(async () => {
    try {
      if (!isCameraOn || !videoRef.current) {
        console.warn('Camera is not active');
        return;
      }
      
      console.log('=== CAPTURE AND ANALYZE START ===');
      
      // Step 1: Trigger flash effect
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
      
      // Step 2: Update status
      setStatus('thinking');
      setMascotMessage('Chờ Lạc Lạc 1 xíu nhé...');
      
      // Step 3: Wait for video to stabilize after flash
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 4: Capture HIGHEST QUALITY frame (0.98 for maximum detail)
      const base64Image = captureFrame(videoRef.current, 0.98);
      
      if (!base64Image) {
        throw new Error('Failed to capture video frame');
      }
      
      const imageSizeKB = (base64Image.length * 3 / 4 / 1024).toFixed(2);
      console.log('Captured image size:', imageSizeKB, 'KB');
      
      // Step 5: Send to AI with TWO-PHASE approach
      try {
        if (videoCallServiceRef.current && !isSimulationMode) {
          // PHASE 1: Tell AI to say "wait" message first
          console.log('Phase 1: Sending wait instruction...');
          videoCallServiceRef.current.sendTextInput(
            'Hãy nói với bà con: "Chờ Lạc Lạc 1 xíu nhé bà con, để Lạc Lạc xem kỹ hình ảnh này." ' +
            'Chỉ nói câu này thôi, KHÔNG phân tích gì cả. Nói ngắn gọn bằng tiếng Việt.'
          );
          
          // Wait for AI to say the wait message (2 seconds)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // PHASE 2: Now send image for CAREFUL analysis
          console.log('Phase 2: Sending image for analysis...');
          
          const analysisPrompt = `Bây giờ hãy QUAN SÁT KỸ LƯỠNG hình ảnh này và phân tích CHÍNH XÁC.

QUAN TRỌNG - Hãy xem thật kỹ trước khi trả lời:
- Nếu là NGƯỜI (có mặt người, tay, chân): Nói "Lạc Lạc thấy bà con đang đứng trước camera. Hãy chụp cây trồng để Lạc Lạc phân tích nhé!"
- Nếu là CÂY TRỒNG (có lá, cành, thân cây): Nói CHÍNH XÁC tên cây + đánh giá tình trạng
- Nếu là VẬT KHÁC (điện thoại, bàn, ghế, v.v.): Nói "Đây là [tên vật]. Bà con hãy chụp cây trồng để Lạc Lạc phân tích nhé!"

Hãy chắc chắn 100% trước khi trả lời. Nếu thấy mặt người, tay người, chân người thì đó là NGƯỜI, không phải cây.

Trả lời ngắn gọn 2-3 câu bằng tiếng Việt tự nhiên, phong cách Lạc Lạc.`;
          
          await videoCallServiceRef.current.sendImageInput(base64Image, analysisPrompt);
          
          console.log('Image sent successfully, waiting for AI analysis...');
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
        console.error('AI analysis error:', analysisError);
        
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
            tags: { feature: 'video-call', action: 'captureAndAnalyze' },
            extra: { 
              isSimulationMode,
              hasVideoService: !!videoCallServiceRef.current,
              imageSizeKB
            }
          });
        }
        
        return;
      }
      
      // Step 6: Track AI usage
      if (onUsage && typeof onUsage === 'function') {
        try {
          onUsage();
        } catch (usageError) {
          console.error('Error calling onUsage callback:', usageError);
        }
      }
      
      console.log('=== CAPTURE AND ANALYZE END ===');
      
    } catch (error) {
      console.error('Error capturing and analyzing:', error);
      
      if (error.message?.includes('capture')) {
        setErrorMessage('Không thể chụp hình ảnh từ camera');
      } else {
        setErrorMessage('Không thể chụp và phân tích hình ảnh');
      }
      
      setStatus('error');
      
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: { feature: 'video-call', action: 'captureAndAnalyze' },
          extra: { 
            isCameraOn,
            hasVideoRef: !!videoRef.current,
            isSimulationMode
          }
        });
      }
    }
  }, [isCameraOn, onUsage, isSimulationMode]);

  // ============================================================================
  // AUDIO CONTROLS
  // ============================================================================
  
  /**
   * Toggle microphone on/off
   */
  const toggleMic = useCallback(async () => {
    const newValue = !isMicOn;
    setIsMicOn(newValue);
    
    // Ensure context is active when turning mic back on
    if (newValue && audioProcessor.inputContext?.state === 'suspended') {
      await audioProcessor.inputContext.resume();
    }
    
    // Mute/unmute audio input
    if (mediaStream.audioStream) {
      const audioTrack = mediaStream.audioStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newValue;
      }
    }
    
    console.log('Microphone toggled:', newValue ? 'ON' : 'OFF');
  }, [isMicOn, mediaStream.audioStream, audioProcessor.inputContext]);

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
      if (videoCallServiceRef.current || audioProcessingCleanupRef.current) {
        console.log('Cleanup on unmount');
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
    isMicOn,
    isSimulationMode,
    mascotMessage,
    activeTool,
    flash,
    aiResponse,
    
    // Refs
    videoRef,
    canvasRef,
    visualizerRef,
    
    // Audio processor nodes (for visualizer)
    inputAnalyser: audioProcessor.inputAnalyser,
    outputAnalyser: audioProcessor.outputAnalyser,
    
    // Actions
    startSession,
    stopSession,
    toggleCamera,
    switchCamera,
    captureAndAnalyze,
    uploadAndAnalyze: captureAndAnalyze, // Alias for backward compatibility
    toggleMic,
    
    // Computed properties
    canCapture: isCameraOn && status !== 'error',
  };
};

export default useVideoCall;
