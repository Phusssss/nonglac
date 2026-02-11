import { GoogleGenAI } from '@google/genai';
import { reportError, addBreadcrumb } from '../utils/sentry';

/**
 * AudioModelService - Service for managing audio-only interactions with Gemini Live API
 * 
 * This service is responsible for:
 * - Speech-to-text (realtime audio transcription)
 * - Text-to-speech (Vietnamese voice synthesis)
 * - Audio streaming (PCM format)
 * - Connection management (connect, disconnect, reconnect)
 * 
 * IMPORTANT: This service does NOT handle vision/image processing.
 * All image analysis should be handled by AnalysisModelService.
 * 
 * @class AudioModelService
 */
class AudioModelService {
  /**
   * Create a new AudioModelService instance
   * 
   * @param {string} apiKey - Google Gemini API key
   */
  constructor(apiKey) {
    console.log('AudioModelService constructor - API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
    
    if (!apiKey || apiKey.trim() === '') {
      console.warn('AudioModelService: No API key provided');
      this.apiKey = null;
      this.genAI = null;
    } else {
      try {
        this.apiKey = apiKey;
        this.genAI = new GoogleGenAI({ apiKey: apiKey });
        console.log('AudioModelService: GoogleGenAI initialized successfully');
      } catch (error) {
        console.error('AudioModelService: Failed to initialize GoogleGenAI:', error);
        this.apiKey = null;
        this.genAI = null;
      }
    }
    
    this.session = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 2000; // 2 seconds
    
    // Callback handlers
    this.callbacks = {
      onOpen: null,
      onAudioOutput: null,
      onTranscript: null,
      onError: null,
      onClose: null
    };
    
    addBreadcrumb('AudioModelService initialized', 'service', 'info');
  }

  /**
   * Connect to Gemini Live API for audio-only mode
   * 
   * @param {Object} config - Connection configuration
   * @param {string} config.userName - User's name for personalization
   * @param {string} config.systemInstruction - System instruction for the AI
   * @param {string} config.model - Model name (default: gemini-2.5-flash-native-audio-preview-09-2025)
   * @returns {Promise<Object>} Session object
   */
  async connect(config = {}) {
    try {
      if (!this.genAI) {
        throw new Error('API key not configured');
      }

      if (this.isConnected) {
        console.warn('AudioModelService: Already connected to Gemini Live');
        return this.session;
      }

      const {
        userName = 'Bạn',
        systemInstruction = `Bạn là trợ lý AI giọng nói thân thiện. Hãy trả lời ngắn gọn và tự nhiên bằng tiếng Việt.`,
        model = 'gemini-2.5-flash-native-audio-preview-09-2025'
      } = config;

      addBreadcrumb('Connecting to Gemini Live API (audio-only)', 'service', 'info');

      // Start live session using live.connect() API
      // Configure for AUDIO-ONLY mode (no vision)
      const session = await this.genAI.live.connect({
        model,
        config: {
          systemInstruction,
          responseModalities: ['AUDIO'], // Audio output only
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore' // Vietnamese voice
              }
            }
          }
          // NOTE: No tools or vision capabilities configured
          // This ensures audio model stays isolated
        },
        callbacks: {
          onopen: () => {
            console.log('AudioModelService: Gemini Live session opened');
            addBreadcrumb('Audio model session opened', 'service', 'info');
            this.isConnected = true;
            this.reconnectAttempts = 0; // Reset reconnect counter on successful connection
            
            if (this.callbacks.onOpen) {
              try {
                this.callbacks.onOpen();
              } catch (callbackError) {
                console.error('Error in onOpen callback:', callbackError);
                reportError(callbackError, {
                  component: 'AudioModelService',
                  action: 'onOpen_callback',
                  severity: 'warning'
                });
              }
            }
          },
          onmessage: (message) => {
            this._handleMessage(message);
          },
          onerror: (error) => {
            console.error('AudioModelService: Gemini Live session error:', error);
            reportError(error, {
              component: 'AudioModelService',
              action: 'session_error',
              severity: 'error'
            });
            
            if (this.callbacks.onError) {
              try {
                this.callbacks.onError(error);
              } catch (callbackError) {
                console.error('Error in onError callback:', callbackError);
              }
            }
          },
          onclose: () => {
            console.log('AudioModelService: Gemini Live session closed');
            addBreadcrumb('Audio model session closed', 'service', 'info');
            this.isConnected = false;
            
            if (this.callbacks.onClose) {
              try {
                this.callbacks.onClose();
              } catch (callbackError) {
                console.error('Error in onClose callback:', callbackError);
              }
            }
          }
        }
      });
      
      // Store resolved session
      this.session = session;
      this.isConnected = true;

      addBreadcrumb('Connected to Gemini Live API (audio-only)', 'service', 'info');
      
      return this.session;
    } catch (error) {
      console.error('AudioModelService: Failed to connect to Gemini Live:', error);
      reportError(error, {
        component: 'AudioModelService',
        action: 'connect',
        model: config.model,
        severity: 'error'
      });
      
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from Gemini Live API
   */
  disconnect() {
    try {
      if (this.session && this.isConnected) {
        addBreadcrumb('Disconnecting from Gemini Live (audio model)', 'service', 'info');
        this.session.close();
        this.session = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
      }
    } catch (error) {
      console.error('AudioModelService: Error disconnecting from Gemini Live:', error);
      reportError(error, {
        component: 'AudioModelService',
        action: 'disconnect',
        severity: 'warning'
      });
      
      // Force reset state even on error
      this.session = null;
      this.isConnected = false;
    }
  }

  /**
   * Reconnect to Gemini Live API with exponential backoff
   * 
   * @param {Object} config - Connection configuration (same as connect)
   * @returns {Promise<Object>} Session object
   */
  async reconnect(config = {}) {
    try {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        const error = new Error(`Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
        reportError(error, {
          component: 'AudioModelService',
          action: 'reconnect',
          attempts: this.reconnectAttempts,
          severity: 'error'
        });
        throw error;
      }

      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

      console.log(`AudioModelService: Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
      addBreadcrumb(`Reconnecting audio model (attempt ${this.reconnectAttempts})`, 'service', 'info');

      // Wait before reconnecting
      await new Promise(resolve => setTimeout(resolve, delay));

      // Disconnect existing session if any
      if (this.session) {
        this.disconnect();
      }

      // Attempt to reconnect
      return await this.connect(config);
    } catch (error) {
      console.error('AudioModelService: Reconnect failed:', error);
      reportError(error, {
        component: 'AudioModelService',
        action: 'reconnect',
        attempt: this.reconnectAttempts,
        severity: 'error'
      });
      throw error;
    }
  }

  /**
   * Send audio input to Gemini (PCM format)
   * 
   * @param {Object} audioData - PCM audio data
   * @param {string} audioData.data - Base64 encoded PCM data
   * @param {string} audioData.mimeType - MIME type (e.g., 'audio/pcm;rate=16000')
   */
  sendAudioInput(audioData) {
    try {
      if (!this.session || !this.isConnected) {
        console.warn('AudioModelService: Not connected to Gemini Live, skipping audio input');
        return;
      }

      if (!audioData || typeof audioData !== 'object') {
        console.warn('AudioModelService: Invalid audio data - must be an object');
        return;
      }

      const { data, mimeType } = audioData;

      if (!data) {
        console.warn('AudioModelService: Audio data is required');
        return;
      }

      // Send PCM audio data to Gemini
      this.session.sendRealtimeInput({
        media: {
          data,
          mimeType: mimeType || 'audio/pcm;rate=16000'
        }
      });

      addBreadcrumb('Sent audio input to Gemini', 'service', 'debug');
    } catch (error) {
      console.error('AudioModelService: Error sending audio input:', error);
      reportError(error, {
        component: 'AudioModelService',
        action: 'sendAudioInput',
        severity: 'warning'
      });
      // Don't throw - audio errors shouldn't break the session
    }
  }

  /**
   * Send text for speech synthesis (Text-to-Speech)
   * 
   * @param {string} text - Text to convert to speech
   */
  sendTextForSpeech(text) {
    try {
      if (!this.session || !this.isConnected) {
        console.warn('AudioModelService: Not connected to Gemini Live, skipping text input');
        return;
      }

      if (!text || typeof text !== 'string' || text.trim() === '') {
        console.warn('AudioModelService: Invalid text - must be a non-empty string');
        return;
      }

      // Send text to Gemini for TTS
      this.session.sendRealtimeInput({
        text: text.trim()
      });

      addBreadcrumb('Sent text for speech synthesis', 'service', 'info');
    } catch (error) {
      console.error('AudioModelService: Error sending text for speech:', error);
      reportError(error, {
        component: 'AudioModelService',
        action: 'sendTextForSpeech',
        severity: 'warning'
      });
      // Don't throw - text errors shouldn't break the session
    }
  }

  /**
   * Send tool response or model output (for TTS without triggering AI response)
   * This sends text as a "model turn" instead of "user turn"
   * 
   * @param {Object} response - Response object
   * @param {string} response.text - Text to speak
   */
  sendToolResponse(response) {
    try {
      if (!this.session || !this.isConnected) {
        console.warn('AudioModelService: Not connected to Gemini Live, skipping tool response');
        return;
      }

      if (!response || !response.text || typeof response.text !== 'string') {
        console.warn('AudioModelService: Invalid response - must have text property');
        return;
      }

      // Send as model turn (server content) to avoid triggering another response
      this.session.sendRealtimeInput({
        text: response.text.trim(),
        // Mark as model output to prevent AI from responding
        turnComplete: true
      });

      addBreadcrumb('Sent tool response for TTS', 'service', 'info');
    } catch (error) {
      console.error('AudioModelService: Error sending tool response:', error);
      reportError(error, {
        component: 'AudioModelService',
        action: 'sendToolResponse',
        severity: 'warning'
      });
    }
  }

  /**
   * Handle incoming messages from Gemini
   * 
   * @private
   * @param {Object} message - Message from Gemini Live API
   */
  _handleMessage(message) {
    try {
      // Handle audio output
      if (message.serverContent?.modelTurn?.parts) {
        for (const part of message.serverContent.modelTurn.parts) {
          // Audio output
          if (part.inlineData?.mimeType?.startsWith('audio/')) {
            if (this.callbacks.onAudioOutput) {
              try {
                this.callbacks.onAudioOutput({
                  data: part.inlineData.data,
                  mimeType: part.inlineData.mimeType
                });
              } catch (callbackError) {
                console.error('Error in onAudioOutput callback:', callbackError);
                reportError(callbackError, {
                  component: 'AudioModelService',
                  action: 'onAudioOutput_callback',
                  severity: 'warning'
                });
              }
            }
          }
          
          // Text transcript
          if (part.text) {
            if (this.callbacks.onTranscript) {
              try {
                this.callbacks.onTranscript(part.text);
              } catch (callbackError) {
                console.error('Error in onTranscript callback:', callbackError);
                reportError(callbackError, {
                  component: 'AudioModelService',
                  action: 'onTranscript_callback',
                  severity: 'warning'
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('AudioModelService: Error handling message:', error);
      reportError(error, {
        component: 'AudioModelService',
        action: '_handleMessage',
        severity: 'warning'
      });
    }
  }

  /**
   * Register callback for connection opened event
   * 
   * @param {Function} callback - Callback function
   */
  onOpen(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callbacks.onOpen = callback;
  }

  /**
   * Register callback for audio output event
   * 
   * @param {Function} callback - Callback function (receives audio data object)
   */
  onAudioOutput(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callbacks.onAudioOutput = callback;
  }

  /**
   * Register callback for transcript event
   * 
   * @param {Function} callback - Callback function (receives transcript text)
   */
  onTranscript(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callbacks.onTranscript = callback;
  }

  /**
   * Register callback for error event
   * 
   * @param {Function} callback - Callback function (receives error object)
   */
  onError(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callbacks.onError = callback;
  }

  /**
   * Register callback for connection closed event
   * 
   * @param {Function} callback - Callback function
   */
  onClose(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callbacks.onClose = callback;
  }

  /**
   * Check if service is connected
   * 
   * @returns {boolean} Connection status
   */
  isServiceConnected() {
    return this.isConnected && this.session !== null;
  }

  /**
   * Get current session
   * 
   * @returns {Object|null} Current session or null
   */
  getSession() {
    return this.session;
  }

  /**
   * Clean up all resources
   * Should be called when service is no longer needed
   */
  cleanup() {
    try {
      addBreadcrumb('Cleaning up AudioModelService', 'service', 'info');
      
      // Disconnect if connected
      if (this.isConnected) {
        this.disconnect();
      }
      
      // Clear callbacks
      this.callbacks = {
        onOpen: null,
        onAudioOutput: null,
        onTranscript: null,
        onError: null,
        onClose: null
      };
      
      // Clear session reference
      this.session = null;
      this.reconnectAttempts = 0;
      
      addBreadcrumb('AudioModelService cleanup complete', 'service', 'info');
    } catch (error) {
      console.error('AudioModelService: Error during cleanup:', error);
      reportError(error, {
        component: 'AudioModelService',
        action: 'cleanup',
        severity: 'warning'
      });
    }
  }
}

export default AudioModelService;
