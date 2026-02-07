/**
 * Tests for VideoCallService.handleToolCall method
 */

import VideoCallService from '../videoCallService';

// Mock dependencies
jest.mock('../geminiLiveService');
jest.mock('../../utils/videoHelpers');
jest.mock('../../utils/audioHelpers');
jest.mock('../../utils/sentry');

describe('VideoCallService - handleToolCall', () => {
  let service;

  beforeEach(() => {
    // Create service instance
    service = new VideoCallService('test-api-key', 'Test User');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('lookup_price tool', () => {
    it('should handle lookup_price tool call with product and region', async () => {
      const toolCall = {
        id: 'tool-1',
        name: 'lookup_price',
        args: {
          product: 'lúa',
          region: 'Đồng bằng sông Cửu Long'
        }
      };

      const responses = await service.handleToolCall(toolCall);

      expect(responses).toHaveLength(1);
      expect(responses[0]).toEqual({
        id: 'tool-1',
        name: 'lookup_price',
        response: {
          result: expect.stringContaining('Giá lúa')
        }
      });
      expect(responses[0].response.result).toContain('Đồng bằng sông Cửu Long');
    });

    it('should handle lookup_price without region', async () => {
      const toolCall = {
        id: 'tool-2',
        name: 'lookup_price',
        args: {
          product: 'cà phê'
        }
      };

      const responses = await service.handleToolCall(toolCall);

      expect(responses).toHaveLength(1);
      expect(responses[0].response.result).toContain('Giá cà phê');
    });

    it('should handle unknown product', async () => {
      const toolCall = {
        id: 'tool-3',
        name: 'lookup_price',
        args: {
          product: 'sản phẩm không tồn tại'
        }
      };

      const responses = await service.handleToolCall(toolCall);

      expect(responses).toHaveLength(1);
      expect(responses[0].response.result).toContain('Không có thông tin giá');
    });
  });

  describe('diagnose_disease tool', () => {
    it('should handle diagnose_disease tool call', async () => {
      const toolCall = {
        id: 'tool-4',
        name: 'diagnose_disease',
        args: {
          crop: 'lúa',
          symptoms: 'lá vàng, có đốm nâu'
        }
      };

      const responses = await service.handleToolCall(toolCall);

      expect(responses).toHaveLength(1);
      expect(responses[0]).toEqual({
        id: 'tool-4',
        name: 'diagnose_disease',
        response: {
          result: expect.stringContaining('lúa')
        }
      });
      expect(responses[0].response.result).toContain('lá vàng, có đốm nâu');
    });
  });

  describe('find_agri_store tool', () => {
    it('should handle find_agri_store with productType and location', async () => {
      const toolCall = {
        id: 'tool-5',
        name: 'find_agri_store',
        args: {
          productType: 'phân bón',
          location: 'Quận 1, TP.HCM'
        }
      };

      const responses = await service.handleToolCall(toolCall);

      expect(responses).toHaveLength(1);
      expect(responses[0].response.result).toContain('phân bón');
      expect(responses[0].response.result).toContain('Quận 1, TP.HCM');
      expect(responses[0].response.result).toContain('Cửa hàng');
    });

    it('should handle find_agri_store without location', async () => {
      const toolCall = {
        id: 'tool-6',
        name: 'find_agri_store',
        args: {
          productType: 'thuốc trừ sâu'
        }
      };

      const responses = await service.handleToolCall(toolCall);

      expect(responses).toHaveLength(1);
      expect(responses[0].response.result).toContain('thuốc trừ sâu');
    });
  });

  describe('unknown tool', () => {
    it('should handle unknown tool call gracefully', async () => {
      const toolCall = {
        id: 'tool-7',
        name: 'unknown_tool',
        args: {}
      };

      const responses = await service.handleToolCall(toolCall);

      expect(responses).toHaveLength(1);
      expect(responses[0]).toEqual({
        id: 'tool-7',
        name: 'unknown_tool',
        response: {
          result: 'Xin lỗi, tôi không thể thực hiện yêu cầu này.'
        }
      });
    });
  });

  describe('callback notification', () => {
    it('should notify onToolCall callback when tool is called', async () => {
      const onToolCall = jest.fn();
      service.callbacks.onToolCall = onToolCall;

      const toolCall = {
        id: 'tool-8',
        name: 'lookup_price',
        args: {
          product: 'lúa'
        }
      };

      await service.handleToolCall(toolCall);

      expect(onToolCall).toHaveBeenCalledWith('lookup_price');
    });
  });

  describe('response format', () => {
    it('should return array of responses with correct structure', async () => {
      const toolCall = {
        id: 'tool-9',
        name: 'lookup_price',
        args: {
          product: 'tiêu'
        }
      };

      const responses = await service.handleToolCall(toolCall);

      expect(Array.isArray(responses)).toBe(true);
      expect(responses[0]).toHaveProperty('id');
      expect(responses[0]).toHaveProperty('name');
      expect(responses[0]).toHaveProperty('response');
      expect(responses[0].response).toHaveProperty('result');
    });
  });
});
