import { auth } from '../firebase/config';
import { handleError, handleNetworkError } from '../utils/errorHandler';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// AI Service class
class AIService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/ai`;
  }

  // Get auth headers
  async getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Bạn cần đăng nhập để sử dụng dịch vụ AI');
    }

    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Generic API call method
  async apiCall(endpoint, data, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error(errorData.error || 'Bạn đã sử dụng hết lượt AI. Vui lòng thử lại sau.');
        }
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorData.error || `Lỗi API: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }
      throw error;
    }
  }

  // Text-based AI analysis
  async analyzeText(prompt, type = 'general') {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Bạn cần đăng nhập');

      const data = {
        prompt: prompt.trim(),
        userId: user.uid,
        type: type
      };

      const response = await this.apiCall('/text', data);
      
      return {
        success: true,
        result: this.formatAIResponse(response.result),
        type: response.type,
        timestamp: response.timestamp,
        usage: response.usage
      };
    } catch (error) {
      handleError(error, { 
        component: 'AIService', 
        action: 'analyzeText',
        type: type 
      });
      throw error;
    }
  }

  // Image analysis (Plant Doctor)
  async analyzePlantImage(base64Image, prompt = "Hãy chẩn đoán bệnh cho cây này và đề xuất cách điều trị.") {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Bạn cần đăng nhập');

      // Validate image size
      const imageSizeKB = (base64Image.length * 3) / 4 / 1024;
      if (imageSizeKB > 4096) {
        throw new Error('Hình ảnh quá lớn. Kích thước tối đa: 4MB');
      }

      const data = {
        image: base64Image,
        prompt: prompt.trim(),
        userId: user.uid
      };

      const response = await this.apiCall('/image', data);
      
      return {
        success: true,
        result: this.formatAIResponse(response.result),
        confidence: response.confidence,
        type: response.type,
        timestamp: response.timestamp,
        usage: response.usage
      };
    } catch (error) {
      handleError(error, { 
        component: 'AIService', 
        action: 'analyzePlantImage' 
      });
      throw error;
    }
  }

  // Market analysis
  async analyzeMarket(product, timeframe = '1month', additionalContext = '') {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Bạn cần đăng nhập');

      const data = {
        product: product.trim(),
        timeframe,
        additionalContext: additionalContext.trim(),
        userId: user.uid
      };

      const response = await this.apiCall('/market-analysis', data);
      
      return {
        success: true,
        result: this.formatAIResponse(response.result),
        product: response.product,
        timeframe: response.timeframe,
        type: response.type,
        timestamp: response.timestamp
      };
    } catch (error) {
      handleError(error, { 
        component: 'AIService', 
        action: 'analyzeMarket',
        product: product 
      });
      throw error;
    }
  }

  // Format AI response for display
  formatAIResponse(text) {
    if (!text) return '';
    
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-800 font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-gray-600">$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc marker:text-green-500">$1</li>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-green-700 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-green-800 mt-5 mb-3 border-b border-green-100 pb-1">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-green-900 mt-6 mb-4">$1</h1>')
      .replace(/\n\n/g, '<br /><br />')
      .replace(/\n/g, '<br />');
    
    // Wrap lists in ul tags
    formatted = formatted.replace(
      /(<li class="ml-4 list-disc marker:text-green-500">.*?<\/li>)(?:\s*<br\s*\/?>)*(?=<li|$)/gs,
      '<ul class="my-2">$1</ul>'
    );
    
    return formatted;
  }

  // Get AI usage statistics (for user dashboard)
  async getUsageStats() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Bạn cần đăng nhập');

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/usage/${user.uid}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Không thể lấy thống kê sử dụng');
      }

      return await response.json();
    } catch (error) {
      handleError(error, { 
        component: 'AIService', 
        action: 'getUsageStats' 
      });
      return {
        totalRequests: 0,
        requestsToday: 0,
        remainingQuota: 10,
        resetTime: new Date(Date.now() + 60 * 60 * 1000)
      };
    }
  }

  // Check service health
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const aiService = new AIService();

// Export individual methods for backward compatibility
export const analyzePlantImage = (base64Image, prompt) => 
  aiService.analyzePlantImage(base64Image, prompt);

export const analyzeText = (prompt, type) => 
  aiService.analyzeText(prompt, type);

export const analyzeMarket = (product, timeframe, context) => 
  aiService.analyzeMarket(product, timeframe, context);

export const formatAIResponse = (text) => 
  aiService.formatAIResponse(text);

export const getAIUsageStats = () => 
  aiService.getUsageStats();

export const checkAIHealth = () => 
  aiService.checkHealth();

// Export service instance
export default aiService;

// Specialized functions for different use cases
export const plantDoctorService = {
  async diagnose(imageFile, symptoms = '') {
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const prompt = symptoms 
        ? `Chẩn đoán bệnh cây với các triệu chứng: ${symptoms}`
        : 'Chẩn đoán bệnh cây và đưa ra cách điều trị';

      return await aiService.analyzePlantImage(base64, prompt);
    } catch (error) {
      handleError(error, { 
        component: 'PlantDoctorService', 
        action: 'diagnose' 
      });
      throw error;
    }
  },

  async getPreventionTips(cropType) {
    const prompt = `Đưa ra các biện pháp phòng ngừa bệnh cho cây ${cropType}`;
    return await aiService.analyzeText(prompt, 'general');
  }
};

export const marketAnalysisService = {
  async getPriceForcast(product, region = 'Việt Nam') {
    const prompt = `Dự báo giá ${product} tại ${region} trong 3 tháng tới`;
    return await aiService.analyzeText(prompt, 'market_analysis');
  },

  async getSeasonalTrends(product) {
    const prompt = `Phân tích xu hướng theo mùa của ${product}`;
    return await aiService.analyzeText(prompt, 'market_analysis');
  },

  async getMarketOpportunities(region = 'Việt Nam') {
    const prompt = `Phân tích cơ hội thị trường nông sản tại ${region}`;
    return await aiService.analyzeText(prompt, 'market_analysis');
  }
};

export const agriChatService = {
  async askQuestion(question) {
    return await aiService.analyzeText(question, 'general');
  },

  async getTechnicalAdvice(crop, issue) {
    const prompt = `Tư vấn kỹ thuật cho cây ${crop} về vấn đề: ${issue}`;
    return await aiService.analyzeText(prompt, 'general');
  },

  async getGrowingTips(crop, stage) {
    const prompt = `Hướng dẫn chăm sóc cây ${crop} ở giai đoạn ${stage}`;
    return await aiService.analyzeText(prompt, 'general');
  }
};