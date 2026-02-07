import GeminiLiveService from './geminiLiveService';
import { captureFrame } from '../utils/videoHelpers';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audioHelpers';
import { reportError, addBreadcrumb } from '../utils/sentry';
import {
  getVideoCallErrorMessage,
  isPermissionError,
  isNetworkError,
  isAPIError,
  shouldFallbackToSimulation,
  isRetryableError,
  getErrorSeverity,
  createVideoCallError
} from '../constants/videoCallErrors';

/**
 * VideoCallService - Main service for managing AI video call sessions
 * 
 * This service orchestrates:
 * - Gemini Live API connection
 * - Audio input/output processing
 * - Camera management
 * - Image capture and analysis
 * - Tool call handling (price lookup, disease diagnosis, store finder)
 * - Simulation mode fallback
 * 
 * @class VideoCallService
 */
class VideoCallService {
  /**
   * Create a new VideoCallService instance
   * 
   * @param {string} apiKey - Google Gemini API key
   * @param {string} userName - User's name for personalization
   */
  constructor(apiKey, userName) {
    this.apiKey = apiKey;
    this.userName = userName || 'Bạn';
    
    // Initialize Gemini Live Service with error handling
    try {
      this.geminiService = new GeminiLiveService(apiKey);
      
      // Check if GeminiLiveService initialized successfully
      if (!this.geminiService.genAI) {
        console.warn('VideoCallService: GeminiLiveService failed to initialize, will use simulation mode');
        this.geminiService = null;
      }
    } catch (error) {
      // Silently fail - will use simulation mode
      this.geminiService = null;
    }
    
    // Session state
    this.isSessionActive = false;
    this.isSimulationMode = false;
    
    // Audio contexts
    this.inputAudioContext = null;
    this.outputAudioContext = null;
    
    // Media streams
    this.audioStream = null;
    this.videoStream = null;
    
    // Audio processing nodes
    this.audioSource = null;
    this.scriptProcessor = null;
    
    // Callbacks
    this.callbacks = {
      onStatusChange: null,
      onMessage: null,
      onToolCall: null,
      onAudioOutput: null,
      onReady: null,
      onError: null
    };
    
    addBreadcrumb('VideoCallService initialized', 'service', 'info');
  }

  /**
   * Start video call session
   * 
   * @param {Object} callbacks - Event callbacks
   * @param {Function} callbacks.onStatusChange - Called when status changes
   * @param {Function} callbacks.onMessage - Called when AI message received
   * @param {Function} callbacks.onToolCall - Called when AI requests tool execution
   * @param {Function} callbacks.onError - Called when error occurs
   * @returns {Promise<void>}
   */
  async startSession(callbacks = {}) {
    try {
      addBreadcrumb('Starting video call session', 'service', 'info');
      
      // Store callbacks
      this.callbacks = {
        onStatusChange: callbacks.onStatusChange || null,
        onMessage: callbacks.onMessage || null,
        onToolCall: callbacks.onToolCall || null,
        onAudioOutput: callbacks.onAudioOutput || null,
        onReady: callbacks.onReady || null,
        onError: callbacks.onError || null
      };
      
      // Check if API key is valid
      if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey === 'test-key') {
        const error = createVideoCallError(
          'api/invalid-key',
          'API key không hợp lệ',
          { apiKeyLength: this.apiKey?.length || 0 }
        );
        console.warn('Invalid API key, starting in simulation mode');
        addBreadcrumb('Invalid API key - starting simulation mode', 'service', 'warning');
        
        this.isSimulationMode = true;
        this._startSimulationMode();
        return;
      }
      
      // Check if GeminiLiveService is available
      if (!this.geminiService || !this.geminiService.genAI) {
        console.warn('GeminiLiveService not available, starting in simulation mode');
        addBreadcrumb('GeminiLiveService unavailable - starting simulation mode', 'service', 'warning');
        
        this.isSimulationMode = true;
        this._startSimulationMode();
        return;
      }
      
      // Audio management is now handled by useVideoCall hook via useAudioProcessor
      // for better stability and synchronization.
      
      // Connect to Gemini Live API
      try {
        await this._connectToGemini();
      } catch (apiError) {
        const error = createVideoCallError(
          isNetworkError(apiError) ? 'api/network-error' : 'api/connection-failed',
          getVideoCallErrorMessage(apiError),
          { originalError: apiError.message }
        );
        
        reportError(error, {
          component: 'VideoCallService',
          action: 'startSession',
          step: 'connectToGemini',
          severity: getErrorSeverity(apiError)
        });
        
        // Fallback to simulation mode for API errors
        if (shouldFallbackToSimulation(apiError)) {
          console.warn('Falling back to simulation mode due to API error');
          addBreadcrumb('API connection failed - starting simulation mode', 'service', 'warning');
          this.isSimulationMode = true;
          this._startSimulationMode();
          return;
        }
        
        throw error;
      }
      
      // Set session as active
      this.isSessionActive = true;
      
      addBreadcrumb('Video call session started successfully', 'service', 'info');
    } catch (error) {
      console.error('Failed to start session:', error);
      
      // Report error with full context
      reportError(error, {
        component: 'VideoCallService',
        action: 'startSession',
        severity: getErrorSeverity(error),
        isRetryable: isRetryableError(error),
        shouldFallback: shouldFallbackToSimulation(error)
      });
      
      // Notify error callback
      if (this.callbacks.onError) {
        this.callbacks.onError({
          message: getVideoCallErrorMessage(error),
          code: error.code,
          isRetryable: isRetryableError(error),
          originalError: error
        });
      }
      
      // Fallback to simulation mode for recoverable errors
      if (shouldFallbackToSimulation(error) && !isPermissionError(error)) {
        console.warn('Falling back to simulation mode due to error');
        addBreadcrumb('Session start failed - starting simulation mode', 'service', 'warning');
        this.isSimulationMode = true;
        this._startSimulationMode();
        return;
      }
      
      // Re-throw for non-recoverable errors
      throw error;
    }
  }

  /**
   * Stop video call session
   */
  stopSession() {
    try {
      addBreadcrumb('Stopping video call session', 'service', 'info');
      
      // Disconnect from Gemini
      try {
        if (this.geminiService && typeof this.geminiService.disconnect === 'function') {
          this.geminiService.disconnect();
        }
      } catch (disconnectError) {
        console.error('Error disconnecting from Gemini:', disconnectError);
        reportError(disconnectError, {
          component: 'VideoCallService',
          action: 'stopSession',
          step: 'disconnectGemini',
          severity: 'warning'
        });
      }
      
      // Close audio contexts
      try {
        if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
          this.inputAudioContext.close();
        }
        
        if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
          this.outputAudioContext.close();
        }
      } catch (audioError) {
        console.error('Error closing audio contexts:', audioError);
        reportError(audioError, {
          component: 'VideoCallService',
          action: 'stopSession',
          step: 'closeAudioContexts',
          severity: 'warning'
        });
      }
      
      // Stop audio stream
      try {
        if (this.audioStream) {
          this.audioStream.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (trackError) {
              console.error('Error stopping audio track:', trackError);
            }
          });
          this.audioStream = null;
        }
      } catch (streamError) {
        console.error('Error stopping audio stream:', streamError);
        reportError(streamError, {
          component: 'VideoCallService',
          action: 'stopSession',
          step: 'stopAudioStream',
          severity: 'warning'
        });
      }
      
      // Stop video stream
      try {
        if (this.videoStream) {
          this.videoStream.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (trackError) {
              console.error('Error stopping video track:', trackError);
            }
          });
          this.videoStream = null;
        }
      } catch (streamError) {
        console.error('Error stopping video stream:', streamError);
        reportError(streamError, {
          component: 'VideoCallService',
          action: 'stopSession',
          step: 'stopVideoStream',
          severity: 'warning'
        });
      }
      
      // Disconnect audio nodes
      try {
        if (this.audioSource) {
          this.audioSource.disconnect();
          this.audioSource = null;
        }
        
        if (this.scriptProcessor) {
          this.scriptProcessor.disconnect();
          this.scriptProcessor = null;
        }
      } catch (nodeError) {
        console.error('Error disconnecting audio nodes:', nodeError);
        reportError(nodeError, {
          component: 'VideoCallService',
          action: 'stopSession',
          step: 'disconnectAudioNodes',
          severity: 'warning'
        });
      }
      
      // Reset state
      this.isSessionActive = false;
      this.isSimulationMode = false;
      
      addBreadcrumb('Video call session stopped', 'service', 'info');
    } catch (error) {
      console.error('Error stopping session:', error);
      const wrappedError = createVideoCallError(
        'session/stop-failed',
        getVideoCallErrorMessage(error),
        { originalError: error.message }
      );
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: 'stopSession',
        severity: 'error'
      });
      
      // Force reset state even on error
      this.isSessionActive = false;
      this.isSimulationMode = false;
    }
  }

  /**
   * Start camera with specified facing mode
   * 
   * @param {string} facingMode - 'user' or 'environment'
   * @returns {Promise<MediaStream>} Video stream
   */
  async startCamera(facingMode = 'user') {
    try {
      addBreadcrumb(`Starting camera with facing mode: ${facingMode}`, 'service', 'info');
      
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      try {
        this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        addBreadcrumb('Camera started successfully', 'service', 'info');
        return this.videoStream;
      } catch (mediaError) {
        // Create detailed error based on error type
        let errorCode = 'video/stream-failed';
        
        if (isPermissionError(mediaError)) {
          errorCode = 'permission/camera-denied';
        } else if (mediaError.name === 'NotFoundError') {
          errorCode = 'permission/not-found';
        } else if (mediaError.name === 'NotReadableError') {
          errorCode = 'permission/not-readable';
        } else if (mediaError.name === 'OverconstrainedError') {
          errorCode = 'video/constraints-failed';
        }
        
        const error = createVideoCallError(
          errorCode,
          getVideoCallErrorMessage(mediaError),
          { 
            facingMode, 
            constraints,
            originalError: mediaError.message,
            errorName: mediaError.name
          }
        );
        
        throw error;
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      reportError(error, {
        component: 'VideoCallService',
        action: 'startCamera',
        facingMode,
        severity: getErrorSeverity(error),
        isPermissionError: isPermissionError(error)
      });
      throw error;
    }
  }

  /**
   * Stop camera
   */
  stopCamera() {
    try {
      if (this.videoStream) {
        this.videoStream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (trackError) {
            console.error('Error stopping video track:', trackError);
            reportError(trackError, {
              component: 'VideoCallService',
              action: 'stopCamera',
              step: 'stopTrack',
              severity: 'warning'
            });
          }
        });
        this.videoStream = null;
        addBreadcrumb('Camera stopped', 'service', 'info');
      }
    } catch (error) {
      console.error('Error stopping camera:', error);
      const wrappedError = createVideoCallError(
        'video/stream-failed',
        'Lỗi khi dừng camera',
        { originalError: error.message }
      );
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: 'stopCamera',
        severity: 'warning'
      });
      
      // Force clear stream even on error
      this.videoStream = null;
    }
  }

  /**
   * Capture image from video element
   * 
   * @param {HTMLVideoElement} videoElement - Video element to capture from
   * @returns {string} Base64 encoded image
   */
  captureImage(videoElement) {
    try {
      addBreadcrumb('Capturing image from video', 'service', 'info');
      
      if (!videoElement) {
        throw createVideoCallError(
          'video/capture-failed',
          'Video element không hợp lệ',
          { videoElement: null }
        );
      }
      
      if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
        throw createVideoCallError(
          'video/capture-failed',
          'Video chưa sẵn sàng để chụp',
          { readyState: videoElement.readyState }
        );
      }
      
      const base64Image = captureFrame(videoElement, 0.8);
      
      if (!base64Image) {
        throw createVideoCallError(
          'video/capture-failed',
          'Không thể tạo ảnh từ video',
          { result: null }
        );
      }
      
      addBreadcrumb('Image captured successfully', 'service', 'info');
      return base64Image;
    } catch (error) {
      console.error('Error capturing image:', error);
      
      const wrappedError = error.code ? error : createVideoCallError(
        'video/capture-failed',
        getVideoCallErrorMessage(error),
        { originalError: error.message }
      );
      
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: 'captureImage',
        severity: 'error'
      });
      throw wrappedError;
    }
  }

  /**
   * Send audio input to Gemini
   * 
   * @param {Object} audioData - PCM audio data with base64 and mimeType
   */
  sendAudioInput(audioData) {
    try {
      if (this.isSimulationMode) {
        // In simulation mode, just log
        return;
      }
      
      if (!audioData || !audioData.data || !audioData.mimeType) {
        console.warn('Invalid audio data');
        return;
      }
      
      if (!this.geminiService || !this.geminiService.isServiceConnected()) {
        console.warn('Not connected to Gemini Live');
        return;
      }
      
      this.geminiService.sendRealtimeInput({
        type: 'audio',
        data: audioData.data,
        mimeType: audioData.mimeType
      });
    } catch (error) {
      // Don't throw - audio errors shouldn't break the session
      console.warn('Error sending audio input:', error.message);
    }
  }

  /**
   * Send image input to Gemini
   * 
   * @param {string} base64Image - Base64 encoded image
   * @param {string} prompt - Optional prompt for image analysis
   */
  sendImageInput(base64Image, prompt = 'Hãy xem kỹ hình ảnh này. Nếu đây là cây trồng, hãy cho biết tên cây và tình trạng sức khỏe của nó kèm lời khuyên ngắn gọn. Nếu đây không phải là cây trồng, hãy nói cho bà con biết đây không phải cây và nhờ bà con chụp lại cây nhé. Trả lời ngắn gọn 2-3 câu bằng tiếng Việt tự nhiên.') {
    try {
      addBreadcrumb('Sending image to Gemini', 'service', 'info');
      
      if (!base64Image || typeof base64Image !== 'string') {
        throw createVideoCallError(
          'video/capture-failed',
          'Dữ liệu hình ảnh không hợp lệ',
          { imageType: typeof base64Image }
        );
      }
      
      if (this.isSimulationMode) {
        // In simulation mode, simulate response
        this._simulateImageAnalysis();
        return;
      }
      
      if (!this.geminiService || !this.geminiService.isServiceConnected()) {
        throw createVideoCallError(
          'api/not-connected',
          'Chưa kết nối đến Gemini Live',
          { isSimulationMode: this.isSimulationMode }
        );
      }
      
      // Extract base64 data (remove data:image/jpeg;base64, prefix if present)
      const base64Data = base64Image.includes(',') 
        ? base64Image.split(',')[1] 
        : base64Image;
      
      if (!base64Data) {
        throw createVideoCallError(
          'video/capture-failed',
          'Không thể trích xuất dữ liệu hình ảnh',
          { hasComma: base64Image.includes(',') }
        );
      }
      
      // Send image with prompt
      this.geminiService.sendRealtimeInput({
        type: 'image',
        data: base64Data,
        mimeType: 'image/jpeg'
      });
      
      // Send prompt as text
      this.geminiService.sendRealtimeInput({
        type: 'text',
        data: prompt
      });
      
      addBreadcrumb('Image sent to Gemini successfully', 'service', 'info');
    } catch (error) {
      console.error('Error sending image input:', error);
      
      const wrappedError = error.code ? error : createVideoCallError(
        isAPIError(error) ? 'api/connection-failed' : 'video/capture-failed',
        getVideoCallErrorMessage(error),
        { originalError: error.message }
      );
      
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: 'sendImageInput',
        severity: getErrorSeverity(error)
      });
      
      // Notify error callback
      if (this.callbacks.onError) {
        this.callbacks.onError({
          message: getVideoCallErrorMessage(wrappedError),
          code: wrappedError.code,
          isRetryable: isRetryableError(wrappedError)
        });
      }
      
      throw wrappedError;
    }
  }

  /**
   * Send text input to Gemini
   * 
   * @param {string} text - Text message
   */
  sendTextInput(text) {
    try {
      addBreadcrumb('Sending text to Gemini', 'service', 'info');
      
      if (!text || typeof text !== 'string' || text.trim() === '') {
        throw createVideoCallError(
          'api/bad-request',
          'Văn bản không hợp lệ',
          { textLength: text?.length || 0 }
        );
      }
      
      if (this.isSimulationMode) {
        // In simulation mode, simulate response
        this._simulateTextResponse(text);
        return;
      }
      
      if (!this.geminiService || !this.geminiService.isServiceConnected()) {
        throw createVideoCallError(
          'api/not-connected',
          'Chưa kết nối đến Gemini Live',
          { isSimulationMode: this.isSimulationMode }
        );
      }
      
      this.geminiService.sendRealtimeInput({
        type: 'text',
        data: text
      });
      
      addBreadcrumb('Text sent to Gemini successfully', 'service', 'info');
    } catch (error) {
      console.error('Error sending text input:', error);
      
      const wrappedError = error.code ? error : createVideoCallError(
        isAPIError(error) ? 'api/connection-failed' : 'api/bad-request',
        getVideoCallErrorMessage(error),
        { originalError: error.message }
      );
      
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: 'sendTextInput',
        severity: 'warning'
      });
      
      // Don't throw - text errors shouldn't break the session
    }
  }

  /**
   * Handle tool call from Gemini
   * 
   * @param {Object} toolCall - Tool call object from Gemini
   * @returns {Promise<Array>} Array of tool responses
   */
  async handleToolCall(toolCall) {
    try {
      addBreadcrumb(`Handling tool call: ${toolCall.name}`, 'service', 'info');
      
      if (!toolCall || !toolCall.name) {
        throw createVideoCallError(
          'tool/invalid-params',
          'Tool call không hợp lệ',
          { toolCall: toolCall ? 'missing name' : 'null' }
        );
      }
      
      // In simulation mode, simulate tool execution
      if (this.isSimulationMode) {
        this._simulateToolCall(toolCall.name);
        return [];
      }
      
      const responses = [];
      
      // Notify callback about tool call
      if (this.callbacks.onToolCall) {
        try {
          this.callbacks.onToolCall(toolCall.name);
        } catch (callbackError) {
          console.error('Error in onToolCall callback:', callbackError);
          reportError(callbackError, {
            component: 'VideoCallService',
            action: 'handleToolCall',
            step: 'callback',
            severity: 'warning'
          });
        }
      }
      
      try {
        switch (toolCall.name) {
          case 'lookup_price':
            responses.push(await this._handleLookupPrice(toolCall));
            break;
            
          case 'diagnose_disease':
            responses.push(await this._handleDiagnoseDisease(toolCall));
            break;
            
          case 'find_agri_store':
            responses.push(await this._handleFindAgriStore(toolCall));
            break;
            
          default:
            console.warn(`Unknown tool call: ${toolCall.name}`);
            addBreadcrumb(`Unknown tool: ${toolCall.name}`, 'service', 'warning');
            responses.push({
              id: toolCall.id,
              name: toolCall.name,
              response: {
                result: 'Xin lỗi, tôi không thể thực hiện yêu cầu này.'
              }
            });
        }
      } catch (toolError) {
        console.error(`Error executing tool ${toolCall.name}:`, toolError);
        
        const wrappedError = createVideoCallError(
          'tool/execution-failed',
          `Lỗi khi thực hiện ${toolCall.name}`,
          { toolName: toolCall.name, originalError: toolError.message }
        );
        
        reportError(wrappedError, {
          component: 'VideoCallService',
          action: 'handleToolCall',
          toolName: toolCall.name,
          severity: 'error'
        });
        
        // Return error response instead of throwing
        responses.push({
          id: toolCall.id,
          name: toolCall.name,
          response: {
            result: 'Xin lỗi, có lỗi xảy ra khi thực hiện yêu cầu này.'
          }
        });
      }
      
      return responses;
    } catch (error) {
      console.error('Error handling tool call:', error);
      
      const wrappedError = error.code ? error : createVideoCallError(
        'tool/execution-failed',
        getVideoCallErrorMessage(error),
        { toolName: toolCall?.name, originalError: error.message }
      );
      
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: 'handleToolCall',
        toolName: toolCall?.name,
        severity: 'error'
      });
      
      // Return empty array instead of throwing to prevent session break
      return [];
    }
  }

  /**
   * Send tool response back to Gemini
   * 
   * @param {Array} responses - Array of tool responses
   */
  sendToolResponse(responses) {
    try {
      if (!responses || !Array.isArray(responses)) {
        console.warn('Tool responses must be an array');
        return;
      }
      
      if (this.isSimulationMode) {
        console.log('Simulation mode: Tool response sent');
        return;
      }
      
      if (!this.geminiService || !this.geminiService.isServiceConnected()) {
        console.warn('Not connected to Gemini Live');
        return;
      }
      
      if (!this.geminiService.session) {
        console.warn('Gemini session does not exist');
        return;
      }
      
      // Session is already resolved, use directly
      this.geminiService.session.sendToolResponse({ 
        functionResponses: responses 
      });
      
      addBreadcrumb('Tool responses sent to Gemini', 'service', 'info');
    } catch (error) {
      console.error('Error sending tool response:', error);
      // Don't throw - tool response errors shouldn't break the session
    }
  }

  /**
   * Get current status
   * 
   * @returns {string} Current status
   */
  getStatus() {
    if (!this.isSessionActive) {
      return 'disconnected';
    }
    
    if (this.isSimulationMode) {
      return 'simulation';
    }
    
    return 'connected';
  }

  /**
   * Check if in simulation mode
   * 
   * @returns {boolean} True if in simulation mode
   */
  isSimulation() {
    return this.isSimulationMode;
  }

  // ==================== Private Methods ====================

  /**
   * Initialize audio contexts
   * @private
   */
  _initializeAudioContexts() {
    try {
      // Check browser support
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      
      if (!AudioContextClass) {
        throw createVideoCallError(
          'audio/not-supported',
          'Trình duyệt không hỗ trợ Web Audio API',
          { hasAudioContext: false }
        );
      }
      
      // Input context for microphone (16kHz)
      try {
        this.inputAudioContext = new AudioContextClass({
          sampleRate: 16000
        });
      } catch (inputError) {
        throw createVideoCallError(
          'audio/context-failed',
          'Không thể tạo input audio context',
          { sampleRate: 16000, originalError: inputError.message }
        );
      }
      
      // Output context for AI voice (24kHz)
      try {
        this.outputAudioContext = new AudioContextClass({
          sampleRate: 24000
        });
      } catch (outputError) {
        // Clean up input context if output fails
        if (this.inputAudioContext) {
          this.inputAudioContext.close();
        }
        
        throw createVideoCallError(
          'audio/context-failed',
          'Không thể tạo output audio context',
          { sampleRate: 24000, originalError: outputError.message }
        );
      }
      
      addBreadcrumb('Audio contexts initialized', 'service', 'info');
    } catch (error) {
      console.error('Error initializing audio contexts:', error);
      
      const wrappedError = error.code ? error : createVideoCallError(
        'audio/context-failed',
        getVideoCallErrorMessage(error),
        { originalError: error.message }
      );
      
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: '_initializeAudioContexts',
        severity: 'critical'
      });
      
      throw wrappedError;
    }
  }

  /**
   * Request microphone access
   * @private
   */
  async _requestMicrophoneAccess() {
    try {
      addBreadcrumb('Requesting microphone access', 'service', 'info');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw createVideoCallError(
          'browser/media-not-supported',
          'Trình duyệt không hỗ trợ truy cập microphone',
          { hasMediaDevices: !!navigator.mediaDevices }
        );
      }
      
      try {
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
      } catch (mediaError) {
        // Create detailed error based on error type
        let errorCode = 'audio/stream-failed';
        
        if (isPermissionError(mediaError)) {
          errorCode = 'permission/microphone-denied';
        } else if (mediaError.name === 'NotFoundError') {
          errorCode = 'permission/not-found';
        } else if (mediaError.name === 'NotReadableError') {
          errorCode = 'permission/not-readable';
        }
        
        throw createVideoCallError(
          errorCode,
          getVideoCallErrorMessage(mediaError),
          { 
            originalError: mediaError.message,
            errorName: mediaError.name,
            constraints: { audio: true, video: false }
          }
        );
      }
      
      // Set up audio processing
      try {
        this._setupAudioProcessing();
      } catch (processingError) {
        // Clean up audio stream if processing setup fails
        if (this.audioStream) {
          this.audioStream.getTracks().forEach(track => track.stop());
          this.audioStream = null;
        }
        
        throw createVideoCallError(
          'audio/processing-failed',
          'Không thể thiết lập xử lý âm thanh',
          { originalError: processingError.message }
        );
      }
      
      addBreadcrumb('Microphone access granted', 'service', 'info');
    } catch (error) {
      console.error('Error requesting microphone access:', error);
      
      const wrappedError = error.code ? error : createVideoCallError(
        'audio/stream-failed',
        getVideoCallErrorMessage(error),
        { originalError: error.message }
      );
      
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: '_requestMicrophoneAccess',
        severity: getErrorSeverity(error),
        isPermissionError: isPermissionError(error)
      });
      
      throw wrappedError;
    }
  }

  /**
   * Set up audio processing pipeline
   * @private
   */
  _setupAudioProcessing() {
    try {
      if (!this.audioStream) {
        throw createVideoCallError(
          'audio/stream-failed',
          'Audio stream không tồn tại',
          { hasStream: false }
        );
      }
      
      if (!this.inputAudioContext) {
        throw createVideoCallError(
          'audio/context-failed',
          'Input audio context không tồn tại',
          { hasContext: false }
        );
      }
      
      // Check if context is closed (can happen in React Strict Mode)
      if (this.inputAudioContext.state === 'closed') {
        console.warn('Audio context is closed, skipping audio processing setup');
        return;
      }
      
      // Create audio source from stream
      try {
        this.audioSource = this.inputAudioContext.createMediaStreamSource(this.audioStream);
      } catch (sourceError) {
        throw createVideoCallError(
          'audio/processing-failed',
          'Không thể tạo audio source',
          { originalError: sourceError.message }
        );
      }
      
      // Create script processor for audio chunks
      // Note: ScriptProcessorNode is deprecated but still widely supported
      // TODO: Migrate to AudioWorkletNode in future update
      try {
        this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
      } catch (processorError) {
        throw createVideoCallError(
          'audio/processing-failed',
          'Không thể tạo script processor',
          { originalError: processorError.message }
        );
      }
      
      // Process audio chunks
      this.scriptProcessor.onaudioprocess = (event) => {
        try {
          if (!this.isSessionActive) return;
          
          const inputData = event.inputBuffer.getChannelData(0);
          const pcmData = createPcmBlob(inputData);
          
          // Send to Gemini
          this.sendAudioInput(pcmData);
        } catch (processError) {
          console.error('Error processing audio chunk:', processError);
          reportError(processError, {
            component: 'VideoCallService',
            action: '_setupAudioProcessing',
            step: 'onaudioprocess',
            severity: 'warning'
          });
        }
      };
      
      // Connect nodes
      try {
        this.audioSource.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.inputAudioContext.destination);
      } catch (connectionError) {
        throw createVideoCallError(
          'audio/processing-failed',
          'Không thể kết nối audio nodes',
          { originalError: connectionError.message }
        );
      }
      
      addBreadcrumb('Audio processing pipeline set up', 'service', 'info');
    } catch (error) {
      console.error('Error setting up audio processing:', error);
      
      // Clean up on error
      if (this.audioSource) {
        try {
          this.audioSource.disconnect();
        } catch (e) {}
        this.audioSource = null;
      }
      
      if (this.scriptProcessor) {
        try {
          this.scriptProcessor.disconnect();
        } catch (e) {}
        this.scriptProcessor = null;
      }
      
      const wrappedError = error.code ? error : createVideoCallError(
        'audio/processing-failed',
        getVideoCallErrorMessage(error),
        { originalError: error.message }
      );
      
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: '_setupAudioProcessing',
        severity: 'error'
      });
      
      throw wrappedError;
    }
  }

  /**
   * Connect to Gemini Live API
   * @private
   */
  async _connectToGemini() {
    try {
      addBreadcrumb('Connecting to Gemini Live API', 'service', 'info');
      
      if (!this.geminiService) {
        throw createVideoCallError(
          'api/connection-failed',
          'Gemini service chưa được khởi tạo',
          { hasService: false }
        );
      }
      
      // Set up callbacks with error handling
      this.geminiService.onOpen(() => {
        try {
          console.log('Connected to Gemini Live');
          addBreadcrumb('Gemini Live connection opened', 'service', 'info');
          
          if (this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange('listening');
          }
        } catch (callbackError) {
          console.error('Error in onOpen callback:', callbackError);
          reportError(callbackError, {
            component: 'VideoCallService',
            action: '_connectToGemini',
            step: 'onOpen',
            severity: 'warning'
          });
        }
      });
      
      this.geminiService.onMessage((message) => {
        try {
          this._handleGeminiMessage(message);
        } catch (messageError) {
          console.error('Error handling Gemini message:', messageError);
          reportError(messageError, {
            component: 'VideoCallService',
            action: '_connectToGemini',
            step: 'onMessage',
            severity: 'error'
          });
        }
      });
      
      this.geminiService.onError((error) => {
        console.error('Gemini Live error:', error);
        addBreadcrumb('Gemini Live error occurred', 'service', 'error');
        
        const wrappedError = createVideoCallError(
          isNetworkError(error) ? 'api/network-error' : 'api/connection-failed',
          getVideoCallErrorMessage(error),
          { originalError: error.message || error }
        );
        
        reportError(wrappedError, {
          component: 'VideoCallService',
          action: '_connectToGemini',
          step: 'geminiError',
          severity: getErrorSeverity(error)
        });
        
        if (this.callbacks.onError) {
          try {
            this.callbacks.onError({
              message: getVideoCallErrorMessage(wrappedError),
              code: wrappedError.code,
              isRetryable: isRetryableError(wrappedError)
            });
          } catch (callbackError) {
            console.error('Error in onError callback:', callbackError);
          }
        }
      });
      
      this.geminiService.onClose(() => {
        try {
          console.log('Disconnected from Gemini Live');
          addBreadcrumb('Gemini Live connection closed', 'service', 'info');
          
          if (this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange('disconnected');
          }
        } catch (callbackError) {
          console.error('Error in onClose callback:', callbackError);
          reportError(callbackError, {
            component: 'VideoCallService',
            action: '_connectToGemini',
            step: 'onClose',
            severity: 'warning'
          });
        }
      });
      
      // Connect with timeout
      try {
        const connectPromise = this.geminiService.connect({
          userName: this.userName
        });
        
        // Add 30 second timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(createVideoCallError(
              'api/timeout',
              'Kết nối đến Gemini Live bị timeout',
              { timeout: 30000 }
            ));
          }, 30000);
        });
        
        await Promise.race([connectPromise, timeoutPromise]);
      } catch (connectError) {
        throw createVideoCallError(
          isNetworkError(connectError) ? 'api/network-error' : 
          connectError.code || 'api/connection-failed',
          getVideoCallErrorMessage(connectError),
          { originalError: connectError.message }
        );
      }
      
      addBreadcrumb('Connected to Gemini Live API', 'service', 'info');
    } catch (error) {
      console.error('Error connecting to Gemini:', error);
      
      const wrappedError = error.code ? error : createVideoCallError(
        isNetworkError(error) ? 'api/network-error' : 'api/connection-failed',
        getVideoCallErrorMessage(error),
        { originalError: error.message }
      );
      
      reportError(wrappedError, {
        component: 'VideoCallService',
        action: '_connectToGemini',
        severity: getErrorSeverity(error),
        isNetworkError: isNetworkError(error),
        isAPIError: isAPIError(error)
      });
      
      throw wrappedError;
    }
  }

  /**
   * Handle message from Gemini
   * @private
   */
  _handleGeminiMessage(message) {
    try {
      // Handle setup complete - session is ready
      if (message.setupComplete) {
        console.log('Gemini Live setup complete');
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange('listening');
        }
        if (this.callbacks.onReady) {
          this.callbacks.onReady();
        }
        return;
      }
      
      // Handle different message types
      if (message.serverContent) {
        // Handle server content (text, audio, etc.)
        if (message.serverContent.modelTurn) {
          const parts = message.serverContent.modelTurn.parts;
          
          parts.forEach(part => {
            if (part.text) {
              // Text response
              if (this.callbacks.onMessage) {
                this.callbacks.onMessage({ type: 'text', content: part.text });
              }
            }
            
            if (part.inlineData) {
              // Audio response - send to callback for seamless playback
              if (this.callbacks.onAudioOutput) {
                this.callbacks.onAudioOutput(part.inlineData.data);
              } else {
                this._playAudioResponse(part.inlineData.data);
              }
            }
          });
        }
        
        // Handle turn complete
        if (message.serverContent.turnComplete) {
          if (this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange('listening');
          }
        }
      }
      
      // Handle tool calls
      if (message.toolCall) {
        this.handleToolCall(message.toolCall).then(responses => {
          this.sendToolResponse(responses);
        });
      }
    } catch (error) {
      console.error('Error handling Gemini message:', error);
      reportError(error, {
        component: 'VideoCallService',
        action: '_handleGeminiMessage'
      });
    }
  }

  /**
   * Play audio response from Gemini
   * @private
   */
  async _playAudioResponse(base64Audio) {
    // Legacy method - audio playback is now handled via onAudioOutput callback
    // which routes to useAudioProcessor for seamless playback
    if (this.callbacks.onAudioOutput) {
      this.callbacks.onAudioOutput(base64Audio);
    }
  }

  /**
   * Handle lookup_price tool call
   * @private
   */
  async _handleLookupPrice(toolCall) {
    try {
      const { product, region } = toolCall.args;
      
      // Mock price data (in real app, fetch from API)
      const mockPrices = {
        'lúa': '6,500 - 7,000 đồng/kg',
        'cà phê': '45,000 - 50,000 đồng/kg',
        'tiêu': '120,000 - 130,000 đồng/kg',
        'cao su': '35,000 - 40,000 đồng/kg'
      };
      
      const price = mockPrices[product.toLowerCase()] || 'Không có thông tin giá';
      const regionText = region ? ` tại ${region}` : '';
      
      return {
        id: toolCall.id,
        name: 'lookup_price',
        response: {
          result: `Giá ${product}${regionText} hiện tại: ${price}`
        }
      };
    } catch (error) {
      console.error('Error in lookup_price:', error);
      return {
        id: toolCall.id,
        name: 'lookup_price',
        response: {
          result: 'Xin lỗi, không thể tra cứu giá lúc này.'
        }
      };
    }
  }

  /**
   * Handle diagnose_disease tool call
   * @private
   */
  async _handleDiagnoseDisease(toolCall) {
    try {
      const { crop, symptoms } = toolCall.args;
      
      // Mock diagnosis (in real app, use AI service)
      const diagnosis = `Dựa trên triệu chứng "${symptoms}" trên cây ${crop}, có thể là bệnh đốm lá. Khuyến nghị: Sử dụng thuốc diệt nấm và cải thiện thoát nước.`;
      
      return {
        id: toolCall.id,
        name: 'diagnose_disease',
        response: {
          result: diagnosis
        }
      };
    } catch (error) {
      console.error('Error in diagnose_disease:', error);
      return {
        id: toolCall.id,
        name: 'diagnose_disease',
        response: {
          result: 'Xin lỗi, không thể chẩn đoán bệnh lúc này.'
        }
      };
    }
  }

  /**
   * Handle find_agri_store tool call
   * @private
   */
  async _handleFindAgriStore(toolCall) {
    try {
      const { productType, location } = toolCall.args;
      
      // Mock store data (in real app, fetch from database)
      const locationText = location ? ` gần ${location}` : '';
      const productText = productType ? ` bán ${productType}` : '';
      const stores = `Cửa hàng nông nghiệp${productText}${locationText}:\n1. Cửa hàng Nông Sản Xanh - 123 Đường ABC\n2. Cửa hàng Phân Bón Việt - 456 Đường XYZ`;
      
      return {
        id: toolCall.id,
        name: 'find_agri_store',
        response: {
          result: stores
        }
      };
    } catch (error) {
      console.error('Error in find_agri_store:', error);
      return {
        id: toolCall.id,
        name: 'find_agri_store',
        response: {
          result: 'Xin lỗi, không thể tìm cửa hàng lúc này.'
        }
      };
    }
  }

  /**
   * Start simulation mode
   * @private
   */
  _startSimulationMode() {
    try {
      console.log('Starting simulation mode');
      addBreadcrumb('Simulation mode activated', 'service', 'info');
      
      this.isSessionActive = true;
      this.isSimulationMode = true;
      
      // Simulate connecting status
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange('connecting');
      }
      
      // Simulate connection delay
      setTimeout(() => {
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange('listening');
        }
        
        // Simulate welcome message with slight delay
        setTimeout(() => {
          if (this.callbacks.onMessage) {
            this.callbacks.onMessage({
              type: 'text',
              content: `Xin chào ${this.userName}! Tôi là Lạc Lạc, trợ lý AI nông nghiệp của bạn. 🌾\n\nHiện tại đang chạy ở chế độ mô phỏng do không có kết nối API. Bạn vẫn có thể trải nghiệm các tính năng cơ bản:\n\n• Chụp ảnh cây trồng để phân tích\n• Hỏi về giá nông sản\n• Tìm cửa hàng nông nghiệp\n• Chẩn đoán bệnh hại\n\nHãy thử chụp ảnh hoặc hỏi tôi điều gì đó nhé!`
            });
          }
        }, 500);
      }, 800);
    } catch (error) {
      console.error('Error starting simulation mode:', error);
      reportError(error, {
        component: 'VideoCallService',
        action: '_startSimulationMode'
      });
    }
  }

  /**
   * Simulate image analysis response
   * @private
   */
  _simulateImageAnalysis() {
    try {
      addBreadcrumb('Simulating image analysis', 'service', 'info');
      
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange('thinking');
      }
      
      // Simulate AI thinking time (1.5-2.5 seconds)
      const thinkingTime = 1500 + Math.random() * 1000;
      
      setTimeout(() => {
        // Random plant analysis responses for variety
        const mockAnalyses = [
          {
            plant: 'lúa',
            condition: 'khỏe mạnh',
            details: 'Lá có màu xanh đậm, không có dấu hiệu bệnh rõ ràng. Cây đang trong giai đoạn phát triển tốt. Khuyến nghị tiếp tục chăm sóc như hiện tại và theo dõi độ ẩm đất.'
          },
          {
            plant: 'cà phê',
            condition: 'cần chú ý',
            details: 'Lá có một số đốm vàng nhỏ, có thể do thiếu dinh dưỡng hoặc sâu bệnh. Khuyến nghị kiểm tra pH đất và bón phân bổ sung. Nếu đốm lan rộng, cần xử lý sâu bệnh.'
          },
          {
            plant: 'tiêu',
            condition: 'khỏe mạnh',
            details: 'Cây tiêu phát triển tốt, lá xanh mướt. Thân cây chắc khỏe. Đây là thời điểm tốt để tỉa cành và bón phân để chuẩn bị cho mùa thu hoạch.'
          },
          {
            plant: 'rau xanh',
            condition: 'khỏe mạnh',
            details: 'Rau đang phát triển tốt, lá xanh tươi. Không thấy dấu hiệu sâu bệnh. Có thể thu hoạch trong 1-2 tuần nữa khi lá đạt kích thước mong muốn.'
          }
        ];
        
        // Pick a random analysis
        const analysis = mockAnalyses[Math.floor(Math.random() * mockAnalyses.length)];
        
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage({
            type: 'text',
            content: `🌱 Phân tích hình ảnh (Chế độ mô phỏng):\n\nTôi thấy đây có vẻ là cây ${analysis.plant}. Tình trạng: ${analysis.condition}.\n\n${analysis.details}\n\n💡 Lưu ý: Đây là phân tích mô phỏng. Để có kết quả chính xác hơn, vui lòng cấu hình API key.`
          });
        }
        
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange('listening');
        }
      }, thinkingTime);
    } catch (error) {
      console.error('Error simulating image analysis:', error);
      reportError(error, {
        component: 'VideoCallService',
        action: '_simulateImageAnalysis'
      });
    }
  }

  /**
   * Simulate text response
   * @private
   */
  _simulateTextResponse(text) {
    try {
      addBreadcrumb('Simulating text response', 'service', 'info');
      
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange('thinking');
      }
      
      // Simulate AI thinking time (1-2 seconds)
      const thinkingTime = 1000 + Math.random() * 1000;
      
      setTimeout(() => {
        let response = '';
        const lowerText = text.toLowerCase();
        
        // Intelligent response based on keywords
        if (lowerText.includes('giá') || lowerText.includes('bao nhiêu')) {
          response = `📊 Về giá nông sản:\n\nTôi có thể giúp bạn tra cứu giá các sản phẩm như lúa, cà phê, tiêu, cao su, v.v.\n\nVí dụ:\n• Lúa: 6,500 - 7,000 đồng/kg\n• Cà phê: 45,000 - 50,000 đồng/kg\n• Tiêu: 120,000 - 130,000 đồng/kg\n\n💡 Đây là giá mô phỏng. Với API key, tôi sẽ cung cấp giá thực tế theo thời gian thực.`;
        } else if (lowerText.includes('bệnh') || lowerText.includes('sâu') || lowerText.includes('hại')) {
          response = `🔬 Về chẩn đoán bệnh hại:\n\nTôi có thể giúp bạn nhận diện và xử lý các bệnh phổ biến:\n\n• Bệnh đốm lá\n• Bệnh khô vằn\n• Sâu đục thân\n• Rệp sáp\n\nHãy chụp ảnh cây bị bệnh để tôi phân tích chi tiết hơn!\n\n💡 Trong chế độ mô phỏng, kết quả chỉ mang tính tham khảo.`;
        } else if (lowerText.includes('cửa hàng') || lowerText.includes('mua') || lowerText.includes('bán')) {
          response = `🏪 Về cửa hàng nông nghiệp:\n\nTôi có thể giúp bạn tìm:\n\n• Cửa hàng phân bón\n• Cửa hàng thuốc trừ sâu\n• Cửa hàng giống cây trồng\n• Đại lý nông sản\n\nVới API key, tôi sẽ tìm các cửa hàng gần vị trí của bạn với thông tin chi tiết.`;
        } else if (lowerText.includes('chào') || lowerText.includes('hello') || lowerText.includes('hi')) {
          response = `Xin chào ${this.userName}! 👋\n\nTôi là Lạc Lạc, trợ lý AI nông nghiệp. Tôi có thể giúp bạn:\n\n🌾 Phân tích cây trồng qua hình ảnh\n💰 Tra cứu giá nông sản\n🏥 Chẩn đoán bệnh hại\n🏪 Tìm cửa hàng nông nghiệp\n\nBạn cần tôi giúp gì không?`;
        } else if (lowerText.includes('cảm ơn') || lowerText.includes('thanks')) {
          response = `Rất vui được giúp đỡ bạn! 😊\n\nNếu bạn cần thêm thông tin gì về nông nghiệp, cứ hỏi tôi nhé. Chúc bạn mùa màng bội thu! 🌾`;
        } else {
          response = `Tôi đã nhận được câu hỏi của bạn: "${text}"\n\n🤖 Chế độ mô phỏng:\nTrong chế độ này, tôi chỉ có thể cung cấp thông tin cơ bản. Để nhận được câu trả lời chi tiết và chính xác hơn, vui lòng:\n\n1. Cấu hình API key trong settings\n2. Hoặc thử chụp ảnh để tôi phân tích\n3. Hoặc hỏi về giá nông sản, bệnh hại, cửa hàng\n\nTôi luôn sẵn sàng hỗ trợ bạn! 🌱`;
        }
        
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage({
            type: 'text',
            content: response
          });
        }
        
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange('listening');
        }
      }, thinkingTime);
    } catch (error) {
      console.error('Error simulating text response:', error);
      reportError(error, {
        component: 'VideoCallService',
        action: '_simulateTextResponse'
      });
    }
  }

  /**
   * Simulate tool call execution in simulation mode
   * @private
   */
  _simulateToolCall(toolName) {
    try {
      addBreadcrumb(`Simulating tool call: ${toolName}`, 'service', 'info');
      
      if (this.callbacks.onToolCall) {
        this.callbacks.onToolCall(toolName);
      }
      
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange('thinking');
      }
      
      setTimeout(() => {
        let response = '';
        
        switch (toolName) {
          case 'lookup_price':
            response = '📊 Đang tra cứu giá nông sản...\n\nGiá tham khảo (mô phỏng):\n• Lúa: 6,500 - 7,000 đ/kg\n• Cà phê: 45,000 - 50,000 đ/kg\n• Tiêu: 120,000 - 130,000 đ/kg';
            break;
          case 'diagnose_disease':
            response = '🔬 Đang phân tích bệnh hại...\n\nKết quả mô phỏng: Có thể là bệnh đốm lá. Khuyến nghị sử dụng thuốc diệt nấm và cải thiện thoát nước.';
            break;
          case 'find_agri_store':
            response = '🏪 Đang tìm cửa hàng...\n\nCác cửa hàng gần bạn (mô phỏng):\n1. Cửa hàng Nông Sản Xanh\n2. Cửa hàng Phân Bón Việt';
            break;
          default:
            response = `Đang thực hiện: ${toolName}...`;
        }
        
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage({
            type: 'text',
            content: response
          });
        }
        
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange('listening');
        }
      }, 1500);
    } catch (error) {
      console.error('Error simulating tool call:', error);
      reportError(error, {
        component: 'VideoCallService',
        action: '_simulateToolCall'
      });
    }
  }
}

export default VideoCallService;
