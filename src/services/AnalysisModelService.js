import { GoogleGenerativeAI } from '@google/generative-ai';
import { reportError, addBreadcrumb } from '../utils/sentry';

/**
 * Tool declarations for Analysis Model function calling
 * These tools allow the AI to interact with external services
 */
const ANALYSIS_TOOLS = [
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
 * AnalysisModelService - Service for managing analysis-only interactions with Gemini API
 * 
 * This service is responsible for:
 * - Image analysis (vision processing)
 * - Text reasoning (complex text processing)
 * - Tool execution (price lookup, disease diagnosis, store finder)
 * 
 * IMPORTANT: This service does NOT handle audio streaming.
 * All audio processing should be handled by AudioModelService.
 * 
 * @class AnalysisModelService
 */
class AnalysisModelService {
  /**
   * Create a new AnalysisModelService instance
   * 
   * @param {string} apiKey - Google Gemini API key
   */
  constructor(apiKey) {
    console.log('AnalysisModelService constructor - API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
    
    if (!apiKey || apiKey.trim() === '') {
      console.warn('AnalysisModelService: No API key provided');
      this.apiKey = null;
      this.genAI = null;
    } else {
      try {
        this.apiKey = apiKey;
        this.genAI = new GoogleGenerativeAI(apiKey);
        console.log('AnalysisModelService: GoogleGenerativeAI initialized successfully');
      } catch (error) {
        console.error('AnalysisModelService: Failed to initialize GoogleGenerativeAI:', error);
        this.apiKey = null;
        this.genAI = null;
      }
    }
    
    this.model = null;
    this.isReady = false;
    
    addBreadcrumb('AnalysisModelService initialized', 'service', 'info');
  }

  /**
   * Initialize the Analysis Model with vision and tool capabilities
   * 
   * @param {Object} config - Initialization configuration
   * @param {string} config.modelName - Model name (default: gemini-1.5-flash)
   * @param {string} config.systemInstruction - System instruction for the AI
   * @returns {Promise<void>}
   */
  async initialize(config = {}) {
    try {
      if (!this.genAI) {
        throw new Error('API key not configured');
      }

      if (this.isReady) {
        console.warn('AnalysisModelService: Already initialized');
        return;
      }

      const {
        modelName = 'gemini-2.5-flash',
        systemInstruction = `Bạn là chuyên gia nông nghiệp AI. Phân tích hình ảnh cây trồng chính xác và đưa ra lời khuyên hữu ích bằng tiếng Việt.`
      } = config;

      addBreadcrumb('Initializing Analysis Model', 'service', 'info');

      // Initialize model with vision and tool capabilities
      this.model = this.genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        tools: [{ functionDeclarations: ANALYSIS_TOOLS }]
      });

      this.isReady = true;

      addBreadcrumb('Analysis Model initialized successfully', 'service', 'info');
      console.log('AnalysisModelService: Model initialized successfully');
    } catch (error) {
      console.error('AnalysisModelService: Failed to initialize model:', error);
      reportError(error, {
        component: 'AnalysisModelService',
        action: 'initialize',
        model: config.modelName,
        severity: 'error'
      });
      
      this.isReady = false;
      throw error;
    }
  }

  /**
   * Analyze an image with vision capabilities
   * 
   * @param {Object} imageData - Image data to analyze
   * @param {string} imageData.base64 - Base64 encoded image data
   * @param {string} imageData.mimeType - MIME type (e.g., 'image/jpeg')
   * @param {string} prompt - Analysis prompt/question
   * @returns {Promise<string>} Analysis result text
   */
  async analyzeImage(imageData, prompt) {
    try {
      if (!this.model || !this.isReady) {
        throw new Error('Analysis Model not initialized');
      }

      if (!imageData || typeof imageData !== 'object') {
        throw new Error('Invalid image data - must be an object');
      }

      const { base64, mimeType } = imageData;

      if (!base64) {
        throw new Error('Image base64 data is required');
      }

      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        throw new Error('Prompt is required');
      }

      addBreadcrumb('Analyzing image with vision', 'service', 'info');

      // Prepare image part for Gemini
      const imagePart = {
        inlineData: {
          data: base64,
          mimeType: mimeType || 'image/jpeg'
        }
      };

      // Generate content with image and prompt
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      addBreadcrumb('Image analysis completed', 'service', 'info');
      console.log('AnalysisModelService: Image analysis completed');

      return text;
    } catch (error) {
      console.error('AnalysisModelService: Error analyzing image:', error);
      reportError(error, {
        component: 'AnalysisModelService',
        action: 'analyzeImage',
        severity: 'error'
      });
      throw error;
    }
  }

  /**
   * Process text with reasoning capabilities
   * 
   * @param {string} text - Text to process
   * @returns {Promise<string>} Response text
   */
  async processText(text) {
    try {
      if (!this.model || !this.isReady) {
        throw new Error('Analysis Model not initialized');
      }

      if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error('Text is required');
      }

      addBreadcrumb('Processing text with reasoning', 'service', 'info');

      // Generate content with text
      const result = await this.model.generateContent(text.trim());
      const response = await result.response;
      const responseText = response.text();

      addBreadcrumb('Text processing completed', 'service', 'info');
      console.log('AnalysisModelService: Text processing completed');

      return responseText;
    } catch (error) {
      console.error('AnalysisModelService: Error processing text:', error);
      reportError(error, {
        component: 'AnalysisModelService',
        action: 'processText',
        severity: 'error'
      });
      throw error;
    }
  }

  /**
   * Execute a tool call
   * 
   * @param {Object} toolCall - Tool call object
   * @param {string} toolCall.id - Tool call ID
   * @param {string} toolCall.name - Tool name
   * @param {Object} toolCall.args - Tool arguments
   * @returns {Promise<Object>} Tool response
   */
  async executeTool(toolCall) {
    try {
      if (!toolCall || typeof toolCall !== 'object') {
        throw new Error('Invalid tool call - must be an object');
      }

      const { id, name, args } = toolCall;

      if (!id || !name || !args) {
        throw new Error('Tool call must have id, name, and args');
      }

      addBreadcrumb(`Executing tool: ${name}`, 'service', 'info');

      let result;

      switch (name) {
        case 'lookup_price':
          result = await this._lookupPrice(args);
          break;

        case 'diagnose_disease':
          result = await this._diagnoseDisease(args);
          break;

        case 'find_agri_store':
          result = await this._findAgriStore(args);
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      addBreadcrumb(`Tool execution completed: ${name}`, 'service', 'info');
      console.log(`AnalysisModelService: Tool ${name} executed successfully`);

      return {
        id,
        name,
        response: {
          result
        }
      };
    } catch (error) {
      console.error('AnalysisModelService: Error executing tool:', error);
      reportError(error, {
        component: 'AnalysisModelService',
        action: 'executeTool',
        toolName: toolCall?.name,
        severity: 'error'
      });
      throw error;
    }
  }

  /**
   * Get tool definitions
   * 
   * @returns {Array} Array of tool definitions
   */
  getToolDefinitions() {
    return ANALYSIS_TOOLS;
  }

  /**
   * Lookup agricultural product price
   * 
   * @private
   * @param {Object} args - Tool arguments
   * @param {string} args.product - Product name
   * @param {string} args.region - Region (optional)
   * @returns {Promise<string>} Price information
   */
  async _lookupPrice(args) {
    try {
      const { product, region } = args;

      // TODO: Implement actual price lookup from external API
      // For now, return simulated data
      const mockPrices = {
        'lúa': '6,500 đồng/kg',
        'cà phê': '45,000 đồng/kg',
        'tiêu': '120,000 đồng/kg',
        'cao su': '35,000 đồng/kg',
        'sầu riêng': '80,000 đồng/kg'
      };

      const price = mockPrices[product.toLowerCase()] || 'Chưa có thông tin giá';
      const regionText = region ? ` tại ${region}` : '';

      return `Giá ${product}${regionText} hiện tại là ${price}. Giá có thể thay đổi theo thời điểm và chất lượng sản phẩm.`;
    } catch (error) {
      console.error('Error in _lookupPrice:', error);
      throw error;
    }
  }

  /**
   * Diagnose plant disease
   * 
   * @private
   * @param {Object} args - Tool arguments
   * @param {string} args.crop - Crop name
   * @param {string} args.symptoms - Disease symptoms
   * @returns {Promise<string>} Diagnosis information
   */
  async _diagnoseDisease(args) {
    try {
      const { crop, symptoms } = args;

      // TODO: Implement actual disease diagnosis from external API or ML model
      // For now, return simulated diagnosis
      const mockDiagnoses = {
        'lá vàng': {
          disease: 'Thiếu dinh dưỡng (Nitơ)',
          treatment: 'Bón phân đạm, tưới nước đều đặn'
        },
        'lá héo': {
          disease: 'Thiếu nước hoặc bệnh héo xanh',
          treatment: 'Tưới nước đầy đủ, kiểm tra rễ cây'
        },
        'đốm nâu': {
          disease: 'Bệnh đốm lá',
          treatment: 'Phun thuốc diệt nấm, cắt bỏ lá bệnh'
        }
      };

      // Find matching diagnosis
      let diagnosis = null;
      for (const [symptom, info] of Object.entries(mockDiagnoses)) {
        if (symptoms.toLowerCase().includes(symptom)) {
          diagnosis = info;
          break;
        }
      }

      if (diagnosis) {
        return `Cây ${crop} có triệu chứng ${symptoms}. Chẩn đoán: ${diagnosis.disease}. Cách xử lý: ${diagnosis.treatment}.`;
      } else {
        return `Cây ${crop} có triệu chứng ${symptoms}. Cần kiểm tra kỹ hơn để chẩn đoán chính xác. Bà con nên chụp ảnh cây để Lạc Lạc phân tích chi tiết hơn.`;
      }
    } catch (error) {
      console.error('Error in _diagnoseDisease:', error);
      throw error;
    }
  }

  /**
   * Find agricultural store
   * 
   * @private
   * @param {Object} args - Tool arguments
   * @param {string} args.productType - Product type
   * @param {string} args.location - Location (optional)
   * @returns {Promise<string>} Store information
   */
  async _findAgriStore(args) {
    try {
      const { productType, location } = args;

      // TODO: Implement actual store finder from external API
      // For now, return simulated data
      const mockStores = {
        'phân bón': [
          'Cửa hàng Nông Nghiệp Xanh - 123 Đường Lê Lợi',
          'Cửa hàng Phân Bón Việt - 456 Đường Trần Hưng Đạo'
        ],
        'thuốc trừ sâu': [
          'Cửa hàng Bảo Vệ Thực Vật - 789 Đường Nguyễn Huệ',
          'Cửa hàng Nông Dược An Toàn - 321 Đường Hai Bà Trưng'
        ],
        'giống cây': [
          'Trung Tâm Giống Cây Trồng - 654 Đường Lý Thường Kiệt',
          'Cửa hàng Giống Cây Chất Lượng - 987 Đường Phan Chu Trinh'
        ]
      };

      const stores = mockStores[productType.toLowerCase()] || [
        'Cửa hàng Nông Nghiệp Tổng Hợp - Liên hệ: 1900-xxxx'
      ];

      const locationText = location ? ` gần ${location}` : '';
      const storeList = stores.join(', ');

      return `Các cửa hàng ${productType}${locationText}: ${storeList}. Bà con nên gọi điện trước để kiểm tra hàng còn không nhé.`;
    } catch (error) {
      console.error('Error in _findAgriStore:', error);
      throw error;
    }
  }

  /**
   * Check if service is ready
   * 
   * @returns {boolean} Ready status
   */
  isServiceReady() {
    return this.isReady && this.model !== null;
  }

  /**
   * Clean up all resources
   * Should be called when service is no longer needed
   */
  cleanup() {
    try {
      addBreadcrumb('Cleaning up AnalysisModelService', 'service', 'info');
      
      // Clear model reference
      this.model = null;
      this.isReady = false;
      
      addBreadcrumb('AnalysisModelService cleanup complete', 'service', 'info');
      console.log('AnalysisModelService: Cleanup complete');
    } catch (error) {
      console.error('AnalysisModelService: Error during cleanup:', error);
      reportError(error, {
        component: 'AnalysisModelService',
        action: 'cleanup',
        severity: 'warning'
      });
    }
  }
}

export default AnalysisModelService;
export { ANALYSIS_TOOLS };
