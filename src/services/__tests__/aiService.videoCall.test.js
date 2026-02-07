/**
 * Tests for AI Service - Video Call Extensions
 */

// Mock Firebase auth
jest.mock('../../firebase/config', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-123',
      getIdToken: jest.fn().mockResolvedValue('mock-token')
    }
  }
}));

// Mock error handler
jest.mock('../../utils/errorHandler', () => ({
  handleError: jest.fn(),
  handleNetworkError: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

import aiService, { analyzeVideoFrame, processToolCall } from '../aiService';

describe('AI Service - Video Call Extensions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('analyzeVideoFrame', () => {
    test('should analyze video frame with context', async () => {
      const mockResponse = {
        result: 'Đây là cây lúa khỏe mạnh',
        confidence: 0.95,
        type: 'video_frame',
        timestamp: new Date().toISOString(),
        usage: { tokens: 100 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const base64Image = 'base64encodedimage';
      const context = 'Người dùng đang hỏi về tình trạng cây lúa';

      const result = await analyzeVideoFrame(base64Image, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.type).toBe('video_frame');
      expect(global.fetch).toHaveBeenCalled();
      
      // Verify the call was made with correct endpoint
      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[0]).toContain('/api/ai/image');
      expect(fetchCall[1].method).toBe('POST');
    });

    test('should handle video frame without context', async () => {
      const mockResponse = {
        result: 'Phân tích cây trồng',
        confidence: 0.85,
        type: 'video_frame',
        timestamp: new Date().toISOString(),
        usage: { tokens: 80 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const base64Image = 'base64encodedimage';

      const result = await analyzeVideoFrame(base64Image);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    test('should reject oversized video frames', async () => {
      // Create a large base64 string (> 2MB)
      const largeImage = 'a'.repeat(3 * 1024 * 1024); // ~3MB

      await expect(analyzeVideoFrame(largeImage)).rejects.toThrow(
        'Khung hình quá lớn'
      );
    });

    test('should return null when user not authenticated', async () => {
      // Mock no user
      const { auth } = require('../../firebase/config');
      auth.currentUser = null;

      const result = await analyzeVideoFrame('base64image');

      expect(result).toBeNull();

      // Restore
      auth.currentUser = {
        uid: 'test-user-123',
        getIdToken: jest.fn().mockResolvedValue('mock-token')
      };
    });
  });

  describe('processToolCall', () => {
    test('should process lookup_price tool call', async () => {
      const mockResponse = {
        product: 'Lúa',
        region: 'Đồng bằng sông Cửu Long',
        price: '6,500 đồng/kg',
        priceRange: { min: 6000, max: 7000 },
        unit: 'kg',
        lastUpdated: new Date().toISOString(),
        source: 'Sở Nông nghiệp'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const toolCall = {
        name: 'lookup_price',
        args: {
          product: 'Lúa',
          region: 'Đồng bằng sông Cửu Long'
        }
      };

      const result = await processToolCall(toolCall);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.tool).toBe('lookup_price');
      expect(result.result.product).toBe('Lúa');
      expect(result.result.price).toBeDefined();
    });

    test('should process diagnose_disease tool call', async () => {
      const mockResponse = {
        crop: 'Lúa',
        disease: 'Bệnh đạo ôn',
        confidence: 0.9,
        symptoms: ['Lá vàng', 'Đốm nâu'],
        treatment: 'Sử dụng thuốc diệt nấm',
        prevention: 'Cải thiện thoát nước',
        severity: 'medium'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const toolCall = {
        name: 'diagnose_disease',
        args: {
          crop: 'Lúa',
          symptoms: 'Lá vàng, có đốm nâu'
        }
      };

      const result = await processToolCall(toolCall);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.tool).toBe('diagnose_disease');
      expect(result.result.disease).toBe('Bệnh đạo ôn');
      expect(result.result.treatment).toBeDefined();
    });

    test('should process find_agri_store tool call', async () => {
      const mockResponse = {
        stores: [
          {
            name: 'Cửa hàng Nông Sản Xanh',
            address: '123 Đường ABC',
            phone: '0123456789',
            distance: 2.5
          },
          {
            name: 'Cửa hàng Phân Bón Việt',
            address: '456 Đường XYZ',
            phone: '0987654321',
            distance: 3.2
          }
        ],
        location: 'TP. Hồ Chí Minh',
        productType: 'Phân bón',
        totalResults: 2
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const toolCall = {
        name: 'find_agri_store',
        args: {
          productType: 'Phân bón',
          location: 'TP. Hồ Chí Minh'
        }
      };

      const result = await processToolCall(toolCall);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.tool).toBe('find_agri_store');
      expect(result.result.stores).toHaveLength(2);
      expect(result.result.totalResults).toBe(2);
    });

    test('should handle invalid tool call', async () => {
      const toolCall = {
        name: 'unknown_tool',
        args: {}
      };

      await expect(processToolCall(toolCall)).rejects.toThrow(
        'Tool không được hỗ trợ'
      );
    });

    test('should handle missing tool name', async () => {
      const toolCall = {
        args: { product: 'Lúa' }
      };

      await expect(processToolCall(toolCall)).rejects.toThrow(
        'Tool call không hợp lệ'
      );
    });

    test('should return fallback data on API error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const toolCall = {
        name: 'lookup_price',
        args: {
          product: 'Lúa',
          region: 'Việt Nam'
        }
      };

      const result = await processToolCall(toolCall);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.result.error).toBeDefined();
      expect(result.result.product).toBe('Lúa');
    });

    test('should return null when user not authenticated', async () => {
      // Mock no user
      const { auth } = require('../../firebase/config');
      auth.currentUser = null;

      const toolCall = {
        name: 'lookup_price',
        args: { product: 'Lúa' }
      };

      const result = await processToolCall(toolCall);

      expect(result).toBeNull();

      // Restore
      auth.currentUser = {
        uid: 'test-user-123',
        getIdToken: jest.fn().mockResolvedValue('mock-token')
      };
    });
  });

  describe('Integration with existing methods', () => {
    test('should maintain backward compatibility with analyzePlantImage', async () => {
      const mockResponse = {
        result: 'Cây bị bệnh đốm lá',
        confidence: 0.88,
        type: 'plant_diagnosis',
        timestamp: new Date().toISOString(),
        usage: { tokens: 120 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await aiService.analyzePlantImage('base64image');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    test('should handle API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' })
      });

      await expect(analyzeVideoFrame('base64image')).rejects.toThrow();
    });
  });
});
