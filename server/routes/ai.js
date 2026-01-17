import express from 'express';
import { GoogleGenAI } from '@google/genai';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { verifyFirebaseToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY environment variable is missing - AI features will be disabled');
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Rate limiting middleware
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour per IP
  message: {
    error: 'Quá nhiều yêu cầu AI. Vui lòng thử lại sau 1 giờ.',
    resetTime: new Date(Date.now() + 60 * 60 * 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// User-specific rate limiting (more restrictive)
const userAIRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour per user
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Bạn đã sử dụng hết lượt AI trong giờ. Vui lòng thử lại sau.',
    resetTime: new Date(Date.now() + 60 * 60 * 1000)
  }
});

// Input validation middleware
const validateAIRequest = [
  body('prompt')
    .isString()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Prompt phải từ 5-2000 ký tự'),
  body('userId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('User ID là bắt buộc'),
  body('type')
    .isIn(['text', 'image', 'plant_diagnosis', 'market_analysis'])
    .withMessage('Loại yêu cầu không hợp lệ')
];

// System instructions for different AI tasks
const SYSTEM_INSTRUCTIONS = {
  plant_diagnosis: `
    Bạn là chuyên gia nông nghiệp AI của NôngLạc, chuyên chẩn đoán bệnh cây trồng.
    Nhiệm vụ: Phân tích hình ảnh cây trồng và đưa ra chẩn đoán bệnh cùng cách điều trị.
    
    Quy tắc trả lời:
    1. Chẩn đoán bệnh cụ thể (nếu có)
    2. Nguyên nhân gây bệnh
    3. Cách điều trị chi tiết
    4. Biện pháp phòng ngừa
    5. Độ tin cậy của chẩn đoán (%)
    
    Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu cho nông dân.
  `,
  
  market_analysis: `
    Bạn là chuyên gia phân tích thị trường nông sản của NôngLạc.
    Nhiệm vụ: Phân tích xu hướng giá, dự báo thị trường, tư vấn kinh doanh.
    
    Quy tắc trả lời:
    1. Phân tích xu hướng giá hiện tại
    2. Dự báo ngắn hạn (1-3 tháng)
    3. Khuyến nghị cho nông dân
    4. Rủi ro cần lưu ý
    
    Trả lời bằng tiếng Việt, dựa trên dữ liệu thực tế.
  `,
  
  general: `
    Bạn là AgriBot, trợ lý AI của NôngLạc - mạng xã hội nông nghiệp Việt Nam.
    Nhiệm vụ: Hỗ trợ nông dân về kỹ thuật trồng trọt, chăn nuôi, thị trường.
    
    Quy tắc trả lời:
    1. Trả lời ngắn gọn, súc tích (tối đa 200 từ)
    2. Sử dụng thuật ngữ nông nghiệp phổ biến tại Việt Nam
    3. Đưa ra lời khuyên thực tế, khả thi
    4. Nếu không chắc chắn, khuyên tham khảo chuyên gia địa phương
    
    Trả lời bằng tiếng Việt.
  `
};

// Text-based AI endpoint
router.post('/text', 
  verifyFirebaseToken, // Add authentication
  aiRateLimit,
  userAIRateLimit,
  validateAIRequest,
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: errors.array()
        });
      }

      const { prompt, type = 'general' } = req.body;
      const userId = req.user.uid; // Get from authenticated user

      // Get system instruction
      const systemInstruction = SYSTEM_INSTRUCTIONS[type] || SYSTEM_INSTRUCTIONS.general;

      // Call Gemini AI
      if (!ai) {
        return res.status(503).json({
          error: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng cấu hình GEMINI_API_KEY.',
          code: 'AI_SERVICE_UNAVAILABLE'
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [{ text: `${systemInstruction}\n\nCâu hỏi: ${prompt}` }]
        },
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      });

      const result = response.text;

      // Log usage for analytics
      await logAIUsage(userId, type, 'text', prompt.length, result.length);

      res.json({
        success: true,
        result: result,
        type: type,
        timestamp: new Date().toISOString(),
        usage: {
          inputTokens: prompt.length,
          outputTokens: result.length
        }
      });

    } catch (error) {
      console.error('AI Text Error:', error);
      
      // Handle specific Gemini errors
      if (error.message?.includes('quota')) {
        return res.status(429).json({
          error: 'Dịch vụ AI tạm thời quá tải. Vui lòng thử lại sau.',
          retryAfter: 300 // 5 minutes
        });
      }

      if (error.message?.includes('safety')) {
        return res.status(400).json({
          error: 'Nội dung không phù hợp với chính sách an toàn của AI.'
        });
      }

      res.status(500).json({
        error: 'Lỗi dịch vụ AI. Vui lòng thử lại sau.',
        code: 'AI_SERVICE_ERROR'
      });
    }
  }
);

// Image analysis endpoint
router.post('/image',
  verifyFirebaseToken, // Add authentication
  aiRateLimit,
  userAIRateLimit,
  [
    body('image')
      .isString()
      .isLength({ min: 100 })
      .withMessage('Dữ liệu hình ảnh không hợp lệ'),
    body('prompt')
      .isString()
      .isLength({ min: 5, max: 500 })
      .withMessage('Mô tả phải từ 5-500 ký tự')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: errors.array()
        });
      }

      const { image, prompt } = req.body;
      const userId = req.user.uid; // Get from authenticated user

      // Validate image size (base64)
      const imageSizeKB = (image.length * 3) / 4 / 1024;
      if (imageSizeKB > 4096) { // 4MB limit
        return res.status(400).json({
          error: 'Hình ảnh quá lớn. Kích thước tối đa: 4MB'
        });
      }

      // System instruction for plant diagnosis
      const systemInstruction = SYSTEM_INSTRUCTIONS.plant_diagnosis;

      // Call Gemini AI with image
      if (!ai) {
        return res.status(503).json({
          error: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng cấu hình GEMINI_API_KEY.',
          code: 'AI_SERVICE_UNAVAILABLE'
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: image
              }
            },
            {
              text: `${systemInstruction}\n\nYêu cầu cụ thể: ${prompt}`
            }
          ]
        },
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.5,
        }
      });

      const result = response.text;

      // Extract confidence score if mentioned
      const confidenceMatch = result.match(/độ tin cậy[:\s]*(\d+)%/i);
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;

      // Log usage
      await logAIUsage(userId, 'plant_diagnosis', 'image', imageSizeKB, result.length);

      res.json({
        success: true,
        result: result,
        confidence: confidence,
        type: 'plant_diagnosis',
        timestamp: new Date().toISOString(),
        usage: {
          imageSizeKB: Math.round(imageSizeKB),
          outputTokens: result.length
        }
      });

    } catch (error) {
      console.error('AI Image Error:', error);
      
      if (error.message?.includes('quota')) {
        return res.status(429).json({
          error: 'Dịch vụ phân tích hình ảnh tạm thời quá tải.',
          retryAfter: 600 // 10 minutes
        });
      }

      res.status(500).json({
        error: 'Lỗi phân tích hình ảnh. Vui lòng thử lại.',
        code: 'AI_IMAGE_ERROR'
      });
    }
  }
);

// Market analysis endpoint
router.post('/market-analysis',
  aiRateLimit,
  userAIRateLimit,
  [
    body('product')
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên sản phẩm phải từ 2-100 ký tự'),
    body('timeframe')
      .isIn(['1week', '1month', '3months', '6months'])
      .withMessage('Khung thời gian không hợp lệ'),
    body('userId')
      .isString()
      .isLength({ min: 1 })
      .withMessage('User ID là bắt buộc')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: errors.array()
        });
      }

      const { product, timeframe, userId, additionalContext = '' } = req.body;

      const timeframeText = {
        '1week': '1 tuần',
        '1month': '1 tháng', 
        '3months': '3 tháng',
        '6months': '6 tháng'
      }[timeframe];

      const prompt = `
        Phân tích thị trường cho sản phẩm: ${product}
        Khung thời gian dự báo: ${timeframeText}
        Thông tin bổ sung: ${additionalContext}
        
        Vui lòng phân tích:
        1. Xu hướng giá hiện tại
        2. Dự báo cho ${timeframeText} tới
        3. Các yếu tố ảnh hưởng
        4. Khuyến nghị cho nông dân
      `;

      const systemInstruction = SYSTEM_INSTRUCTIONS.market_analysis;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [{ text: `${systemInstruction}\n\n${prompt}` }]
        },
        generationConfig: {
          maxOutputTokens: 1200,
          temperature: 0.6,
        }
      });

      const result = response.text;

      // Log usage
      await logAIUsage(userId, 'market_analysis', 'text', prompt.length, result.length);

      res.json({
        success: true,
        result: result,
        product: product,
        timeframe: timeframe,
        type: 'market_analysis',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Market Analysis Error:', error);
      res.status(500).json({
        error: 'Lỗi phân tích thị trường. Vui lòng thử lại.',
        code: 'MARKET_ANALYSIS_ERROR'
      });
    }
  }
);

// Usage logging function
async function logAIUsage(userId, type, format, inputSize, outputSize) {
  try {
    // In a real app, this would save to database
    const usage = {
      userId,
      type,
      format,
      inputSize,
      outputSize,
      timestamp: new Date().toISOString(),
      cost: calculateCost(type, format, inputSize, outputSize)
    };

    console.log('AI Usage:', usage);
    
    // TODO: Save to database for analytics and billing
    // await saveToDatabase('ai_usage', usage);
    
  } catch (error) {
    console.error('Failed to log AI usage:', error);
  }
}

// Cost calculation (approximate)
function calculateCost(type, format, inputSize, outputSize) {
  const rates = {
    text: { input: 0.00001, output: 0.00003 }, // per character
    image: { input: 0.001, output: 0.00003 }   // per KB for input, per character for output
  };
  
  const rate = rates[format] || rates.text;
  return (inputSize * rate.input) + (outputSize * rate.output);
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Proxy',
    timestamp: new Date().toISOString(),
    geminiApiKey: GEMINI_API_KEY ? 'configured' : 'missing'
  });
});

// Usage statistics endpoint (admin only)
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement admin authentication
    // const isAdmin = await verifyAdminToken(req.headers.authorization);
    // if (!isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const stats = {
      totalRequests: 0, // TODO: Get from database
      requestsByType: {}, // TODO: Get from database
      averageResponseTime: 0, // TODO: Calculate from logs
      errorRate: 0, // TODO: Calculate from logs
      topUsers: [] // TODO: Get from database
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;