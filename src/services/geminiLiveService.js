import { GoogleGenAI } from '@google/genai';
import { reportError, addBreadcrumb } from '../utils/sentry';
import { generateLacLacSystemPrompt } from '../config/lacLacVoiceConfig';

/**
 * Tool declarations for Gemini Live API function calling
 * These tools allow the AI to interact with the app's features
 */
const APP_TOOLS = [
  {
    name: 'lookup_price',
    description: 'Tra cứu giá nông sản hiện tại theo loại cây trồng và khu vực',
    parameters: {
      type: 'object',
      properties: {
        product: {
          type: 'string',
          description: 'Tên nông sản cần tra cứu (ví dụ: lúa, cà phê, tiêu)'
        },
        region: {
          type: 'string',
          description: 'Khu vực tra cứu (ví dụ: Đồng bằng sông Cửu Long, Tây Nguyên)'
        }
      },
      required: ['product']
    }
  },
  {
    name: 'diagnose_disease',
    description: 'Chẩn đoán bệnh cây trồng dựa trên mô tả triệu chứng',
    parameters: {
      type: 'object',
      properties: {
        crop: {
          type: 'string',
          description: 'Loại cây trồng (ví dụ: lúa, cà phê, tiêu)'
        },
        symptoms: {
          type: 'string',
          description: 'Mô tả triệu chứng bệnh (ví dụ: lá vàng, héo, đốm nâu)'
        }
      },
      required: ['crop', 'symptoms']
    }
  },
  {
    name: 'find_agri_store',
    description: 'Tìm cửa hàng nông nghiệp gần nhất theo loại sản phẩm',
    parameters: {
      type: 'object',
      properties: {
        productType: {
          type: 'string',
          description: 'Loại sản phẩm cần tìm (ví dụ: phân bón, thuốc trừ sâu, giống cây)'
        },
        location: {
          type: 'string',
          description: 'Vị trí hiện tại hoặc khu vực cần tìm'
        }
      },
      required: ['productType']
    }
  }
];

/**
 * Generate system instruction for the AI assistant
 * @param {string} userName - User's name for personalization
 * @returns {string} System instruction text
 */
const getSystemInstruction = (userName) => {
  // Use Lạc Lạc voice configuration for authentic Vietnamese agricultural assistant
  const lacLacPrompt = generateLacLacSystemPrompt(userName);
  
  // Add visual analysis rules for video call feature
  const visualAnalysisRules = `

## QUY TRÌNH PHÂN TÍCH HÌNH ẢNH (QUAN TRỌNG NHẤT):

### LUỒNG ĐƠN GIẢN:
1. **Lạc Lạc chào** → Kêu bà con bật camera và chụp ảnh
2. **Bà con chụp** → Lạc Lạc nói "Chờ tí nhé"
3. **Phân tích** → Đưa kết quả chính xác

### KHI NHẬN ĐƯỢC HÌNH ẢNH:
Đây là ảnh chụp chất lượng cao từ bà con, PHẢI phân tích KỸ LƯỠNG và trả lời NGAY.

**BƯỚC 1 - NHẬN DẠNG**:
- Nếu là CÂY TRỒNG: Nói CHÍNH XÁC "Đây là cây [tên cây]" (ví dụ: "Đây là cây sầu riêng", "Đây là cây lúa")
- Nếu là NGƯỜI: "Lạc Lạc thấy bà con đang đứng trước camera. Hãy chụp cây trồng để Lạc Lạc phân tích nhé!"
- Nếu là VẬT KHÁC: "Đây là [tên vật]. Bà con hãy chụp cây trồng để Lạc Lạc phân tích nhé!"

**BƯỚC 2 - ĐÁNH GIÁ** (chỉ với cây trồng):
- Tình trạng: Lá xanh/vàng, có bệnh không, phát triển tốt không
- Ngắn gọn 1 câu

**BƯỚC 3 - TƯ VẤN** (nếu cần):
- Nếu cây khỏe: "Bà con tiếp tục chăm sóc như vậy là tốt rồi!"
- Nếu có vấn đề: Đưa 1-2 lời khuyên cụ thể (bón phân, xử lý bệnh)

### YÊU CẦU QUAN TRỌNG:
- ✅ Trả lời NGAY khi nhận được ảnh
- ✅ Nói tên cây CHÍNH XÁC ngay từ đầu
- ✅ Ngắn gọn 3-4 câu
- ✅ Tiếng Việt tự nhiên, không dùng *, #, -, emoji
- ✅ Phong cách Lạc Lạc: thân thiện, chuyên nghiệp

### VÍ DỤ PHẢN HỒI TỐT:
"Chào bà con! Đây là cây sầu riêng đang phát triển tốt. Lá xanh bóng, không có dấu hiệu bệnh. Bà con tiếp tục chăm sóc như vậy là ưng ý rồi!"

### VÍ DỤ PHẢN HỒI KHÔNG TỐT:
"Tôi thấy một cây trong hình ảnh..." ❌ (quá chung chung)
"Có vẻ như đây là..." ❌ (không chắc chắn)
"*Đây là cây lúa*" ❌ (có ký hiệu)

### LƯU Ý:
- KHÔNG có realtime analysis nữa
- CHỈ phân tích khi bà con chụp ảnh
- Mỗi ảnh là một lần phân tích độc lập
- Phải chính xác 100% ngay từ lần đầu`;

  return lacLacPrompt + visualAnalysisRules;
};

/**
 * GeminiLiveService - Service for managing Gemini Live API connections
 * Handles real-time audio/video interactions with Google's Gemini AI
 */
class GeminiLiveService {
  /**
   * Create a new GeminiLiveService instance
   * @param {string} apiKey - Google Gemini API key
   */
  constructor(apiKey) {
    console.log('GeminiLiveService constructor - API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
    
    if (!apiKey || apiKey.trim() === '') {
      console.warn('GeminiLiveService: No API key provided');
      this.apiKey = null;
      this.genAI = null;
    } else {
      try {
        this.apiKey = apiKey;
        this.genAI = new GoogleGenAI({ apiKey: apiKey });
        console.log('GeminiLiveService: GoogleGenAI initialized successfully');
      } catch (error) {
        // Silently fail - will use simulation mode
        this.apiKey = null;
        this.genAI = null;
      }
    }
    
    this.session = null;
    this.isConnected = false;
    
    // Callback handlers
    this.callbacks = {
      onOpen: null,
      onMessage: null,
      onError: null,
      onClose: null
    };
    
    addBreadcrumb('GeminiLiveService initialized', 'service', 'info');
  }

  /**
   * Connect to Gemini Live API
   * @param {Object} config - Connection configuration
   * @param {string} config.userName - User's name for personalization
   * @param {string} config.model - Model name (default: gemini-2.5-flash-native-audio-preview-09-2025)
   * @returns {Promise<Object>} Session object
   */
  async connect(config = {}) {
    try {
      if (!this.genAI) {
        throw new Error('API key not configured');
      }

      if (this.isConnected) {
        console.warn('Already connected to Gemini Live');
        return this.session;
      }

      const {
        userName = 'Bạn',
        model = 'gemini-2.5-flash-native-audio-preview-09-2025'
      } = config;

      addBreadcrumb('Connecting to Gemini Live API', 'service', 'info');

      // Start live session using live.connect() API
      const session = await this.genAI.live.connect({
        model,
        config: {
          systemInstruction: getSystemInstruction(userName),
          responseModalities: ['AUDIO'],
          tools: [{ functionDeclarations: APP_TOOLS }],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore'
              }
            }
          }
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
            addBreadcrumb('Live session opened', 'service', 'info');
            if (this.callbacks.onOpen) this.callbacks.onOpen();
          },
          onmessage: (message) => {
            // Log reduced for production stability
            if (this.callbacks.onMessage) this.callbacks.onMessage(message);
          },
          onerror: (error) => {
            console.error('Gemini Live session error:', error);
            reportError(error, { component: 'GeminiLiveService', action: 'session_error' });
            if (this.callbacks.onError) this.callbacks.onError(error);
          },
          onclose: () => {
            console.log('Gemini Live session closed');
            addBreadcrumb('Live session closed', 'service', 'info');
            this.isConnected = false;
            if (this.callbacks.onClose) this.callbacks.onClose();
          }
        }
      });
      
      // Store resolved session (not Promise)
      this.session = session;
      this.isConnected = true;

      addBreadcrumb('Connected to Gemini Live API', 'service', 'info');
      
      return this.session;
    } catch (error) {
      console.error('Failed to connect to Gemini Live:', error);
      reportError(error, {
        component: 'GeminiLiveService',
        action: 'connect',
        model: config.model
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
        addBreadcrumb('Disconnecting from Gemini Live', 'service', 'info');
        this.session.close();
        this.session = null;
        this.isConnected = false;
      }
    } catch (error) {
      console.error('Error disconnecting from Gemini Live:', error);
      reportError(error, {
        component: 'GeminiLiveService',
        action: 'disconnect'
      });
    }
  }

  /**
   * Send real-time input to Gemini
   * @param {Object} input - Input data (audio, image, or text)
   * @param {string} input.type - Input type: 'audio', 'image', or 'text'
   * @param {*} input.data - Input data (base64 string, audio blob, or text)
   * @param {string} input.mimeType - MIME type of the input
   */
  sendRealtimeInput(input) {
    try {
      if (!this.session || !this.isConnected) {
        console.warn('Not connected to Gemini Live, skipping input');
        return;
      }

      if (!input || typeof input !== 'object') {
        console.warn('Invalid input: must be an object');
        return;
      }

      const { type, data, mimeType } = input;

      if (!type || !data) {
        console.warn('Input type and data are required');
        return;
      }

      // Session is already resolved, use directly
      switch (type) {
        case 'audio':
          this.session.sendRealtimeInput({
            media: {
              data,
              mimeType: mimeType || 'audio/pcm;rate=16000'
            }
          });
          break;

        case 'image':
          this.session.sendRealtimeInput({
            media: {
              data,
              mimeType: mimeType || 'image/jpeg'
            }
          });
          break;

        case 'text':
          this.session.sendRealtimeInput({
            text: data
          });
          break;

        default:
          console.warn(`Unsupported input type: ${type}`);
          return;
      }

      addBreadcrumb(`Sent ${type} input to Gemini`, 'service', 'info');
    } catch (error) {
      console.error('Error sending realtime input:', error);
      // Don't throw - just log and continue
    }
  }

  /**
   * Register callback for connection opened event
   * @param {Function} callback - Callback function
   */
  onOpen(callback) {
    try {
      if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
      }
      this.callbacks.onOpen = callback;
    } catch (error) {
      console.error('Error registering onOpen callback:', error);
      reportError(error, {
        component: 'GeminiLiveService',
        action: 'onOpen_registration'
      });
      throw error;
    }
  }

  /**
   * Register callback for message received event
   * @param {Function} callback - Callback function
   */
  onMessage(callback) {
    try {
      if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
      }
      this.callbacks.onMessage = callback;
    } catch (error) {
      console.error('Error registering onMessage callback:', error);
      reportError(error, {
        component: 'GeminiLiveService',
        action: 'onMessage_registration'
      });
      throw error;
    }
  }

  /**
   * Register callback for error event
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    try {
      if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
      }
      this.callbacks.onError = callback;
    } catch (error) {
      console.error('Error registering onError callback:', error);
      reportError(error, {
        component: 'GeminiLiveService',
        action: 'onError_registration'
      });
      throw error;
    }
  }

  /**
   * Register callback for connection closed event
   * @param {Function} callback - Callback function
   */
  onClose(callback) {
    try {
      if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
      }
      this.callbacks.onClose = callback;
    } catch (error) {
      console.error('Error registering onClose callback:', error);
      reportError(error, {
        component: 'GeminiLiveService',
        action: 'onClose_registration'
      });
      throw error;
    }
  }

  /**
   * Check if service is connected
   * @returns {boolean} Connection status
   */
  isServiceConnected() {
    try {
      return this.isConnected && this.session !== null;
    } catch (error) {
      console.error('Error checking connection status:', error);
      reportError(error, {
        component: 'GeminiLiveService',
        action: 'isServiceConnected'
      });
      return false;
    }
  }

  /**
   * Get current session
   * @returns {Object|null} Current session or null
   */
  getSession() {
    try {
      return this.session;
    } catch (error) {
      console.error('Error getting session:', error);
      reportError(error, {
        component: 'GeminiLiveService',
        action: 'getSession'
      });
      return null;
    }
  }

  /**
   * Clean up all resources
   * Should be called when service is no longer needed
   */
  cleanup() {
    try {
      addBreadcrumb('Cleaning up GeminiLiveService', 'service', 'info');
      
      // Disconnect if connected
      if (this.isConnected) {
        this.disconnect();
      }
      
      // Clear callbacks
      this.callbacks = {
        onOpen: null,
        onMessage: null,
        onError: null,
        onClose: null
      };
      
      // Clear session reference
      this.session = null;
      
      addBreadcrumb('GeminiLiveService cleanup complete', 'service', 'info');
    } catch (error) {
      console.error('Error during cleanup:', error);
      reportError(error, {
        component: 'GeminiLiveService',
        action: 'cleanup'
      });
    }
  }
}

export default GeminiLiveService;
export { APP_TOOLS, getSystemInstruction };
