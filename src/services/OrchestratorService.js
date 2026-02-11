import AudioModelService from './AudioModelService';
import AnalysisModelService from './AnalysisModelService';
import { reportError, addBreadcrumb } from '../utils/sentry';

/**
 * OrchestratorService - Main coordinator for dual-model video call architecture
 * 
 * This service coordinates communication between:
 * - AudioModelService (Gemini Live): Handles speech-to-text and text-to-speech
 * - AnalysisModelService (Gemini API): Handles image analysis and text reasoning
 * 
 * Responsibilities:
 * - Manage session lifecycle for both models
 * - Route requests to appropriate model
 * - Transform data between models
 * - Handle errors with fallback to simulation mode
 * - Maintain state consistency
 * 
 * @class OrchestratorService
 */
class OrchestratorService {
  /**
   * Create a new OrchestratorService instance
   * 
   * @param {string} apiKey - Google Gemini API key
   * @param {string} userName - User's name for personalization
   */
  constructor(apiKey, userName = 'Bạn') {
    console.log('OrchestratorService constructor - API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
    
    this.apiKey = apiKey;
    this.userName = userName;
    
    // Initialize both model services
    this.audioModel = null;
    this.analysisModel = null;
    
    // Session state
    this.isActive = false;
    this.isSimulationMode = false;
    this.currentMode = 'idle'; // 'idle' | 'listening' | 'analyzing' | 'speaking'
    
    // Callbacks
    this.callbacks = {
      onStatusChange: null,
      onMessage: null,
      onError: null,
      onAudioOutput: null
    };
    
    // Pending transcript for voice interaction flow
    this.pendingTranscript = null;
    
    // Flag to pause transcript processing during image analysis
    this.isProcessingImage = false;
    
    addBreadcrumb('OrchestratorService initialized', 'service', 'info');
  }

  /**
   * Start session - Initialize and connect both models
   * 
   * @param {Object} callbacks - Event callbacks
   * @param {Function} callbacks.onStatusChange - Status change callback
   * @param {Function} callbacks.onMessage - Message callback
   * @param {Function} callbacks.onError - Error callback
   * @param {Function} callbacks.onAudioOutput - Audio output callback
   * @returns {Promise<void>}
   */
  async startSession(callbacks = {}) {
    try {
      addBreadcrumb('Starting orchestrator session', 'service', 'info');
      console.log('OrchestratorService: Starting session...');
      
      // Store callbacks
      this.callbacks = {
        onStatusChange: callbacks.onStatusChange || null,
        onMessage: callbacks.onMessage || null,
        onError: callbacks.onError || null,
        onAudioOutput: callbacks.onAudioOutput || null
      };
      
      // Check if API key is available
      if (!this.apiKey || this.apiKey.trim() === '') {
        console.warn('OrchestratorService: No API key, entering simulation mode');
        this.isSimulationMode = true;
        this._notifyStatusChange('simulation');
        this._notifyMessage('Chế độ mô phỏng: API key không khả dụng');
        return;
      }
      
      // Initialize both models
      this._notifyStatusChange('connecting');
      
      try {
        // Initialize Audio Model
        this.audioModel = new AudioModelService(this.apiKey);
        
        // Set up audio model callbacks
        this.audioModel.onOpen(() => {
          console.log('OrchestratorService: Audio model connected');
          addBreadcrumb('Audio model connected', 'service', 'info');
        });
        
        this.audioModel.onAudioOutput((audioData) => {
          this._handleAudioOutput(audioData);
        });
        
        this.audioModel.onTranscript((text) => {
          this._handleTranscript(text);
        });
        
        this.audioModel.onError((error) => {
          this._handleAudioModelError(error);
        });
        
        this.audioModel.onClose(() => {
          console.log('OrchestratorService: Audio model disconnected');
          addBreadcrumb('Audio model disconnected', 'service', 'info');
        });
        
        // Connect audio model
        await this.audioModel.connect({
          userName: this.userName,
          systemInstruction: `Bạn là Lạc Lạc, trợ lý AI giọng nói dễ thương và thân thiện cho nông dân Việt Nam. 

TÍNH CÁCH:
- Giọng nói nhẹ nhàng, dễ thương như một người em gái/cháu gái đang tư vấn cho anh chị/bác
- Luôn lễ phép, kính trọng người dùng
- Nhiệt tình, chu đáo trong mọi câu trả lời
- Dùng từ ngữ ấm áp, gần gũi

CÁCH NÓI CHUYỆN:
- Xưng hô: "em" (cho Lạc Lạc), "anh/chị/bác" (cho người dùng tùy ngữ cảnh)
- Thêm "ạ" ở cuối câu để tỏ sự lễ phép
- Dùng "nhé", "nha" để tạo sự gần gũi

QUY TẮC QUAN TRỌNG:
- Khi được yêu cầu đọc CHÍNH XÁC một đoạn văn: Hãy đọc Y CHANG NGUYÊN VĂN, KHÔNG được thay đổi, thêm bớt, hoặc diễn giải lại
- Khi được yêu cầu ĐỌC TOÀN BỘ kết quả: Đọc HẾT nội dung, KHÔNG được bỏ sót. Đọc chậm rãi, rõ ràng, nhẹ nhàng
- Khi trả lời câu hỏi tự do: Trả lời ngắn gọn nhưng vẫn giữ giọng điệu dễ thương, lễ phép
- Luôn thể hiện sự quan tâm và sẵn sàng giúp đỡ`
        });
        
        console.log('OrchestratorService: Audio model connected successfully');
      } catch (audioError) {
        console.error('OrchestratorService: Failed to connect audio model:', audioError);
        reportError(audioError, {
          component: 'OrchestratorService',
          action: 'startSession_audioModel',
          severity: 'error'
        });
        
        // Continue without audio model (analysis only)
        this._notifyError('Audio model không khả dụng, chỉ hỗ trợ phân tích hình ảnh');
      }
      
      try {
        // Initialize Analysis Model
        this.analysisModel = new AnalysisModelService(this.apiKey);
        
        await this.analysisModel.initialize({
          systemInstruction: `Bạn là chuyên gia nông nghiệp AI. Phân tích hình ảnh cây trồng chính xác và đưa ra lời khuyên hữu ích bằng tiếng Việt. Hãy phân biệt rõ ràng giữa người, cây trồng, và các vật thể khác.`
        });
        
        console.log('OrchestratorService: Analysis model initialized successfully');
      } catch (analysisError) {
        console.error('OrchestratorService: Failed to initialize analysis model:', analysisError);
        reportError(analysisError, {
          component: 'OrchestratorService',
          action: 'startSession_analysisModel',
          severity: 'error'
        });
        
        // Continue without analysis model (audio only)
        this._notifyError('Analysis model không khả dụng, chỉ hỗ trợ tương tác giọng nói');
      }
      
      // Check if at least one model is available
      if (!this.audioModel?.isServiceConnected() && !this.analysisModel?.isServiceReady()) {
        console.error('OrchestratorService: Both models failed to initialize, entering simulation mode');
        this.isSimulationMode = true;
        this._notifyStatusChange('simulation');
        this._notifyError('Không thể kết nối đến AI models, chuyển sang chế độ mô phỏng');
        return;
      }
      
      // Session started successfully
      this.isActive = true;
      this._notifyStatusChange('connected');
      
      // Send greeting message via Audio Model
      if (this.audioModel?.isServiceConnected()) {
        const greetingText = `Dạ, xin chào ${this.userName} ạ! Em là Lạc Lạc, trợ lý AI nông nghiệp của anh chị đây ạ. Anh chị có thể bấm nút camera để chụp ảnh cây trồng, hoặc bấm nút hình ảnh để gửi ảnh có sẵn nhé. Em sẽ giúp anh chị phân tích và tư vấn về cây trồng ạ!`;
        
        this._notifyMessage(greetingText);
        
        // Send as a direct instruction to read exactly
        const greetingInstruction = `Hãy đọc CHÍNH XÁC câu chào sau đây, KHÔNG được thay đổi hay thêm bớt bất kỳ từ nào: "${greetingText}"`;
        this.audioModel.sendTextForSpeech(greetingInstruction);
      } else {
        this._notifyMessage('Kết nối thành công! Bạn có thể bắt đầu chụp ảnh.');
      }
      
      addBreadcrumb('Orchestrator session started successfully', 'service', 'info');
      console.log('OrchestratorService: Session started successfully');
    } catch (error) {
      console.error('OrchestratorService: Failed to start session:', error);
      reportError(error, {
        component: 'OrchestratorService',
        action: 'startSession',
        severity: 'error'
      });
      
      // Fallback to simulation mode
      this.isSimulationMode = true;
      this._notifyStatusChange('simulation');
      this._notifyError('Không thể khởi động session, chuyển sang chế độ mô phỏng');
      throw error;
    }
  }

  /**
   * Stop session - Disconnect both models and clean up
   */
  stopSession() {
    try {
      addBreadcrumb('Stopping orchestrator session', 'service', 'info');
      console.log('OrchestratorService: Stopping session...');
      
      // Disconnect audio model
      if (this.audioModel) {
        this.audioModel.cleanup();
        this.audioModel = null;
      }
      
      // Clean up analysis model
      if (this.analysisModel) {
        this.analysisModel.cleanup();
        this.analysisModel = null;
      }
      
      // Reset state
      this.isActive = false;
      this.isSimulationMode = false;
      this.currentMode = 'idle';
      this.pendingTranscript = null;
      this.isProcessingImage = false;
      
      this._notifyStatusChange('disconnected');
      
      addBreadcrumb('Orchestrator session stopped', 'service', 'info');
      console.log('OrchestratorService: Session stopped successfully');
    } catch (error) {
      console.error('OrchestratorService: Error stopping session:', error);
      reportError(error, {
        component: 'OrchestratorService',
        action: 'stopSession',
        severity: 'warning'
      });
    }
  }

  /**
   * Handle voice input - Complete voice interaction pipeline
   * 
   * Flow:
   * 1. Send audio to AudioModel
   * 2. AudioModel returns transcribed text
  /**
   * Handle image capture - Complete image analysis pipeline
   * 
   * Flow:
   * 1. Send a "user request" to Audio Model asking it to say wait message
   * 2. Audio Model responds with wait message naturally
   * 3. Send image to AnalysisModel
   * 4. AnalysisModel returns analysis text
   * 5. Send analysis result as a "user request" to Audio Model
   * 6. Audio Model reads the result naturally
   * 
   * @param {Object} imageData - Image data
   * @param {string} imageData.base64 - Base64 encoded image
   * @param {string} imageData.mimeType - MIME type
   * @param {number} imageData.quality - Image quality
   * @returns {Promise<void>}
   */
  async handleImageCapture(imageData) {
    try {
      if (this.isSimulationMode) {
        console.log('OrchestratorService: Simulation mode, returning mock analysis');
        this._notifyMessage('Chế độ mô phỏng: Đây là cây lúa đang phát triển tốt.');
        return;
      }
      
      if (!this.analysisModel?.isServiceReady()) {
        console.warn('OrchestratorService: Analysis model not ready');
        this._notifyError('Analysis model không khả dụng');
        return;
      }
      
      addBreadcrumb('Starting image capture flow', 'service', 'info');
      
      // Set flag to pause transcript processing
      this.isProcessingImage = true;
      
      // Update mode
      this.currentMode = 'analyzing';
      this._notifyStatusChange('analyzing');
      
      // Step 1: Ask Audio Model to say wait message
      if (this.audioModel?.isServiceConnected()) {
        const waitRequest = 'Người dùng vừa gửi ảnh cây trồng. Hãy nói: "Chờ Lạc Lạc phân tích 1 xíu nhé"';
        this._notifyMessage('Đang phân tích hình ảnh...');
        this.audioModel.sendTextForSpeech(waitRequest);
        addBreadcrumb('Wait message request sent to audio model', 'service', 'info');
        
        // Wait a bit for Audio Model to speak
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Step 2: Send image to Analysis Model
      const analysisPrompt = `Bạn là chuyên gia nông nghiệp. Hãy phân tích hình ảnh này và trả lời bằng văn bản thuần túy (KHÔNG dùng markdown, KHÔNG dùng ký tự đặc biệt như *, **, #).

Hãy cho biết:
- Đây là cây trồng gì? (hoặc vật thể gì nếu không phải cây trồng)
- Tình trạng hiện tại như thế nào?
- Có vấn đề gì cần lưu ý không?
- Lời khuyên chăm sóc (nếu cần)

Trả lời ngắn gọn, tự nhiên như đang tư vấn trực tiếp cho nông dân. Đi thẳng vào vấn đề, không cần giải thích dài dòng.`;
      
      const analysisResult = await this.analysisModel.analyzeImage(imageData, analysisPrompt);
      
      addBreadcrumb('Image analysis completed', 'service', 'info');
      console.log('OrchestratorService: Image analysis result:', analysisResult);
      
      // Clean up markdown formatting for voice output
      const cleanedResult = analysisResult
        .replace(/\*\*/g, '') // Remove bold **
        .replace(/\*/g, '')   // Remove italic *
        .replace(/#/g, '')    // Remove headers #
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links [text](url) -> text
        .replace(/`/g, '')    // Remove code backticks
        .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
        .trim();
      
      // Step 3: Send analysis result to Audio Model
      this._notifyMessage(`Kết quả phân tích:\n\n${analysisResult}`); // Show original with formatting in UI
      
      if (this.audioModel?.isServiceConnected()) {
        // Split long text into smaller chunks to avoid interruption
        // Each chunk should be ~100-150 characters for natural speech pacing
        const chunks = this._splitTextIntoChunks(cleanedResult, 150);
        
        // Send chunks with small delays to ensure complete delivery
        for (let i = 0; i < chunks.length; i++) {
          setTimeout(() => {
            this.audioModel.sendTextForSpeech(chunks[i]);
          }, i * 100); // 100ms delay between chunks
        }
        
        addBreadcrumb(`Analysis result sent in ${chunks.length} chunks`, 'service', 'info');
      }
      
      // Update mode
      this.currentMode = 'speaking';
      this._notifyStatusChange('speaking');
      
      // Clear flag after analysis complete
      this.isProcessingImage = false;
      
      addBreadcrumb('Image capture flow completed', 'service', 'info');
    } catch (error) {
      console.error('OrchestratorService: Error handling image capture:', error);
      reportError(error, {
        component: 'OrchestratorService',
        action: 'handleImageCapture',
        severity: 'error'
      });
      
      // Clear flag on error
      this.isProcessingImage = false;
      
      this._handleError(error, 'analysis');
    }
  }

  /**
   * Handle tool call - Execute tool and return result
   * 
   * Flow:
   * 1. AnalysisModel triggers tool call
   * 2. Execute tool (price lookup, diagnosis, etc.)
   * 3. Return result to AnalysisModel
   * 4. AnalysisModel processes result
   * 5. Send final response to AudioModel for TTS
   * 
   * @param {Object} toolCall - Tool call object
   * @param {string} toolCall.id - Tool call ID
   * @param {string} toolCall.name - Tool name
   * @param {Object} toolCall.args - Tool arguments
   * @returns {Promise<Object>} Tool response
   */
  async handleToolCall(toolCall) {
    try {
      if (this.isSimulationMode) {
        console.log('OrchestratorService: Simulation mode, returning mock tool result');
        return {
          id: toolCall.id,
          name: toolCall.name,
          response: {
            result: 'Chế độ mô phỏng: Kết quả tool call'
          }
        };
      }
      
      if (!this.analysisModel?.isServiceReady()) {
        throw new Error('Analysis model not ready for tool execution');
      }
      
      addBreadcrumb(`Executing tool: ${toolCall.name}`, 'service', 'info');
      
      // Execute tool via Analysis Model
      const toolResponse = await this.analysisModel.executeTool(toolCall);
      
      addBreadcrumb(`Tool execution completed: ${toolCall.name}`, 'service', 'info');
      console.log('OrchestratorService: Tool execution result:', toolResponse);
      
      // Send tool result to Audio Model for TTS
      if (this.audioModel?.isServiceConnected() && toolResponse.response?.result) {
        this.audioModel.sendTextForSpeech(toolResponse.response.result);
      }
      
      return toolResponse;
    } catch (error) {
      console.error('OrchestratorService: Error handling tool call:', error);
      reportError(error, {
        component: 'OrchestratorService',
        action: 'handleToolCall',
        toolName: toolCall?.name,
        severity: 'error'
      });
      
      this._handleError(error, 'analysis');
      throw error;
    }
  }

  /**
   * Determine target model for a request
   * 
   * @param {Object} request - Request object
   * @param {string} request.type - Request type ('audio' | 'image' | 'text')
   * @param {string} request.context - Context for text requests ('voice' | 'analysis')
   * @returns {string} Target model ('audio' | 'analysis')
   */
  determineTargetModel(request) {
    try {
      if (!request || typeof request !== 'object') {
        throw new Error('Invalid request - must be an object');
      }
      
      const { type, context } = request;
      
      // Route based on request type
      switch (type) {
        case 'audio':
          return 'audio';
        
        case 'image':
          return 'analysis';
        
        case 'text':
          // Text can go to either model depending on context
          if (context === 'voice') {
            return 'audio';
          } else if (context === 'analysis') {
            return 'analysis';
          } else {
            // Default to analysis for text reasoning
            return 'analysis';
          }
        
        default:
          throw new Error(`Unknown request type: ${type}`);
      }
    } catch (error) {
      console.error('OrchestratorService: Error determining target model:', error);
      reportError(error, {
        component: 'OrchestratorService',
        action: 'determineTargetModel',
        requestType: request?.type,
        severity: 'warning'
      });
      
      // Default to analysis model
      return 'analysis';
    }
  }

  /**
   * Handle transcript from Audio Model
   * 
   * @private
   * @param {string} text - Transcribed text
   */
  /**
   * Handle transcript from Audio Model
   * 
   * NOTE: Audio Model handles its own responses via Gemini Live.
   * We only log transcripts here for debugging/monitoring.
   * DO NOT send transcripts to Analysis Model - that breaks the flow!
   * 
   * @private
   * @param {string} text - Transcribed text
   */
  async _handleTranscript(text) {
    try {
      console.log('OrchestratorService: Received transcript:', text);
      addBreadcrumb('Transcript received from audio model', 'service', 'info');
      
      // Skip transcript processing if we're analyzing an image
      if (this.isProcessingImage) {
        console.log('OrchestratorService: Skipping transcript - image analysis in progress');
        return;
      }
      
      // Just notify the transcript for display purposes
      // Audio Model will handle the response automatically
      this._notifyMessage(`Bạn: ${text}`);
      
      // Update mode to show we're processing
      this.currentMode = 'thinking';
      this._notifyStatusChange('thinking');
      
      // Audio Model will automatically generate response and speak it
      // We don't need to do anything else here
      
    } catch (error) {
      console.error('OrchestratorService: Error handling transcript:', error);
      reportError(error, {
        component: 'OrchestratorService',
        action: '_handleTranscript',
        severity: 'error'
      });
    }
  }

  /**
   * Handle audio output from Audio Model
   * 
   * @private
   * @param {Object} audioData - Audio data
   */
  _handleAudioOutput(audioData) {
    try {
      addBreadcrumb('Audio output received from audio model', 'service', 'debug');
      
      // Forward to callback
      if (this.callbacks.onAudioOutput) {
        this.callbacks.onAudioOutput(audioData);
      }
      
      // Update mode back to idle after speaking
      this.currentMode = 'idle';
      this._notifyStatusChange('idle');
    } catch (error) {
      console.error('OrchestratorService: Error handling audio output:', error);
      reportError(error, {
        component: 'OrchestratorService',
        action: '_handleAudioOutput',
        severity: 'warning'
      });
    }
  }

  /**
   * Handle error from Audio Model
   * 
   * @private
   * @param {Error} error - Error object
   */
  _handleAudioModelError(error) {
    console.error('OrchestratorService: Audio model error:', error);
    reportError(error, {
      component: 'OrchestratorService',
      action: '_handleAudioModelError',
      severity: 'error'
    });
    
    this._handleError(error, 'audio');
  }

  /**
   * Handle error with fallback logic
   * 
   * @private
   * @param {Error} error - Error object
   * @param {string} source - Error source ('audio' | 'analysis' | 'orchestrator')
   */
  _handleError(error, source) {
    try {
      console.error(`OrchestratorService: Error from ${source}:`, error);
      
      // Determine error severity
      const isCritical = this._isErrorCritical(error, source);
      
      if (isCritical) {
        // Critical error - fallback to simulation mode
        console.error('OrchestratorService: Critical error, entering simulation mode');
        this.isSimulationMode = true;
        this._notifyStatusChange('simulation');
        this._notifyError('Lỗi nghiêm trọng, chuyển sang chế độ mô phỏng');
      } else {
        // Non-critical error - continue with available model
        const errorMessage = this._getErrorMessage(error, source);
        this._notifyError(errorMessage);
      }
      
      // Reset mode
      this.currentMode = 'idle';
      this._notifyStatusChange('idle');
    } catch (handlerError) {
      console.error('OrchestratorService: Error in error handler:', handlerError);
    }
  }

  /**
   * Check if error is critical
   * 
   * @private
   * @param {Error} error - Error object
   * @param {string} source - Error source
   * @returns {boolean} True if error is critical
   */
  _isErrorCritical(error, source) {
    // Critical if both models are unavailable
    const audioAvailable = this.audioModel?.isServiceConnected();
    const analysisAvailable = this.analysisModel?.isServiceReady();
    
    if (!audioAvailable && !analysisAvailable) {
      return true;
    }
    
    // Critical if error is API key related
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return true;
    }
    
    return false;
  }

  /**
   * Get user-friendly error message
   * 
   * @private
   * @param {Error} error - Error object
   * @param {string} source - Error source
   * @returns {string} Error message
   */
  _getErrorMessage(error, source) {
    if (source === 'audio') {
      return 'Lỗi audio model, chỉ hỗ trợ phân tích hình ảnh';
    } else if (source === 'analysis') {
      return 'Lỗi analysis model, chỉ hỗ trợ tương tác giọng nói';
    } else {
      return 'Đã xảy ra lỗi, vui lòng thử lại';
    }
  }

  /**
   * Notify status change
   * 
   * @private
   * @param {string} status - New status
   */
  _notifyStatusChange(status) {
    if (this.callbacks.onStatusChange) {
      try {
        this.callbacks.onStatusChange(status);
      } catch (error) {
        console.error('Error in onStatusChange callback:', error);
      }
    }
  }

  /**
   * Notify message
   * 
   * @private
   * @param {string} message - Message text
   */
  _notifyMessage(message) {
    if (this.callbacks.onMessage) {
      try {
        this.callbacks.onMessage(message);
      } catch (error) {
        console.error('Error in onMessage callback:', error);
      }
    }
  }

  /**
   * Notify error
   * 
   * @private
   * @param {string} errorMessage - Error message
   */
  _notifyError(errorMessage) {
    if (this.callbacks.onError) {
      try {
        this.callbacks.onError(errorMessage);
      } catch (error) {
        console.error('Error in onError callback:', error);
      }
    }
  }

  /**
   * Split text into smaller chunks for better speech delivery
   * Splits at sentence boundaries when possible
   * 
   * @private
   * @param {string} text - Text to split
   * @param {number} maxLength - Maximum chunk length
   * @returns {string[]} Array of text chunks
   */
  _splitTextIntoChunks(text, maxLength = 150) {
    if (!text || text.length <= maxLength) {
      return [text];
    }

    const chunks = [];
    const sentences = text.split(/([.!?]\s+)/); // Split but keep delimiters
    let currentChunk = '';

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      
      // If adding this sentence would exceed max length
      if (currentChunk.length + sentence.length > maxLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    // Add remaining chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Get current session state
   * 
   * @returns {Object} Session state
   */
  getSessionState() {
    return {
      isActive: this.isActive,
      audioModelConnected: this.audioModel?.isServiceConnected() || false,
      analysisModelReady: this.analysisModel?.isServiceReady() || false,
      currentMode: this.currentMode,
      isSimulationMode: this.isSimulationMode
    };
  }

  /**
   * Clean up all resources
   */
  cleanup() {
    try {
      addBreadcrumb('Cleaning up OrchestratorService', 'service', 'info');
      
      // Stop session if active
      if (this.isActive) {
        this.stopSession();
      }
      
      // Clear callbacks
      this.callbacks = {
        onStatusChange: null,
        onMessage: null,
        onError: null,
        onAudioOutput: null
      };
      
      addBreadcrumb('OrchestratorService cleanup complete', 'service', 'info');
      console.log('OrchestratorService: Cleanup complete');
    } catch (error) {
      console.error('OrchestratorService: Error during cleanup:', error);
      reportError(error, {
        component: 'OrchestratorService',
        action: 'cleanup',
        severity: 'warning'
      });
    }
  }
}

export default OrchestratorService;
