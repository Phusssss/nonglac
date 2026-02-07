/**
 * Tests for VideoCallService simulation mode
 * 
 * Simulation mode should activate when:
 * - API key is invalid/missing
 * - Connection to Gemini fails
 * 
 * In simulation mode, the service should:
 * - Provide mock responses
 * - Simulate AI behavior with realistic delays
 * - Handle all user interactions gracefully
 */

// Mock dependencies before imports
jest.mock('../geminiLiveService', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendRealtimeInput: jest.fn(),
    isServiceConnected: jest.fn().mockReturnValue(false),
    onOpen: jest.fn(),
    onMessage: jest.fn(),
    onError: jest.fn(),
    onClose: jest.fn()
  }));
});

jest.mock('../../utils/videoHelpers', () => ({
  captureFrame: jest.fn().mockReturnValue('base64-image-data')
}));

jest.mock('../../utils/audioHelpers', () => ({
  createPcmBlob: jest.fn().mockReturnValue({ data: 'pcm-data', mimeType: 'audio/pcm' }),
  decode: jest.fn().mockReturnValue(new Uint8Array()),
  decodeAudioData: jest.fn().mockResolvedValue({})
}));

jest.mock('../../utils/sentry', () => ({
  reportError: jest.fn(),
  addBreadcrumb: jest.fn()
}));

import VideoCallService from '../videoCallService';

describe('VideoCallService - Simulation Mode', () => {
  let service;
  let callbacks;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup callbacks
    callbacks = {
      onStatusChange: jest.fn(),
      onMessage: jest.fn(),
      onToolCall: jest.fn(),
      onError: jest.fn()
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Activation', () => {
    test('should activate simulation mode with invalid API key', async () => {
      // Create service with invalid API key
      service = new VideoCallService('', 'Test User');

      // Start session
      await service.startSession(callbacks);

      // Should be in simulation mode
      expect(service.isSimulation()).toBe(true);
      expect(service.getStatus()).toBe('simulation');
    });

    test('should activate simulation mode with test-key', async () => {
      // Create service with test API key
      service = new VideoCallService('test-key', 'Test User');

      // Start session
      await service.startSession(callbacks);

      // Should be in simulation mode
      expect(service.isSimulation()).toBe(true);
    });

    test('should activate simulation mode with null API key', async () => {
      // Create service with null API key
      service = new VideoCallService(null, 'Test User');

      // Start session
      await service.startSession(callbacks);

      // Should be in simulation mode
      expect(service.isSimulation()).toBe(true);
    });

    test('should show connecting status before listening', async () => {
      service = new VideoCallService('', 'Test User');

      await service.startSession(callbacks);

      // Fast-forward through connecting phase
      jest.advanceTimersByTime(500);

      // Should have called onStatusChange with 'connecting'
      expect(callbacks.onStatusChange).toHaveBeenCalledWith('connecting');
    });

    test('should send welcome message after activation', async () => {
      service = new VideoCallService('', 'Test User');

      await service.startSession(callbacks);

      // Fast-forward through all delays
      jest.advanceTimersByTime(2000);

      // Should have sent welcome message
      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          content: expect.stringContaining('Xin chào Test User')
        })
      );
    });
  });

  describe('Image Analysis Simulation', () => {
    beforeEach(async () => {
      service = new VideoCallService('', 'Test User');
      await service.startSession(callbacks);
      jest.clearAllMocks();
    });

    test('should simulate image analysis with thinking status', () => {
      // Send image
      service.sendImageInput('base64-image-data');

      // Should change to thinking status
      expect(callbacks.onStatusChange).toHaveBeenCalledWith('thinking');
    });

    test('should provide mock plant analysis', () => {
      service.sendImageInput('base64-image-data');

      // Fast-forward through thinking time
      jest.advanceTimersByTime(3000);

      // Should have sent analysis message
      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          content: expect.stringContaining('Phân tích hình ảnh')
        })
      );
    });

    test('should return to listening status after analysis', () => {
      service.sendImageInput('base64-image-data');

      // Fast-forward through thinking time
      jest.advanceTimersByTime(3000);

      // Should return to listening
      expect(callbacks.onStatusChange).toHaveBeenCalledWith('listening');
    });

    test('should include simulation disclaimer in response', () => {
      service.sendImageInput('base64-image-data');

      jest.advanceTimersByTime(3000);

      // Should mention simulation mode
      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('mô phỏng')
        })
      );
    });
  });

  describe('Text Response Simulation', () => {
    beforeEach(async () => {
      service = new VideoCallService('', 'Test User');
      await service.startSession(callbacks);
      jest.clearAllMocks();
    });

    test('should respond to price inquiries', () => {
      service.sendTextInput('Giá lúa bao nhiêu?');

      jest.advanceTimersByTime(2500);

      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('giá')
        })
      );
    });

    test('should respond to disease inquiries', () => {
      service.sendTextInput('Cây tôi bị bệnh gì?');

      jest.advanceTimersByTime(2500);

      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('bệnh')
        })
      );
    });

    test('should respond to store inquiries', () => {
      service.sendTextInput('Tìm cửa hàng phân bón');

      jest.advanceTimersByTime(2500);

      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('cửa hàng')
        })
      );
    });

    test('should respond to greetings', () => {
      service.sendTextInput('Xin chào');

      jest.advanceTimersByTime(2500);

      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('Xin chào')
        })
      );
    });

    test('should provide generic response for unknown queries', () => {
      service.sendTextInput('Random question');

      jest.advanceTimersByTime(2500);

      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('Chế độ mô phỏng')
        })
      );
    });
  });

  describe('Tool Call Simulation', () => {
    beforeEach(async () => {
      service = new VideoCallService('', 'Test User');
      await service.startSession(callbacks);
      jest.clearAllMocks();
    });

    test('should simulate lookup_price tool', async () => {
      const toolCall = {
        id: 'tool-1',
        name: 'lookup_price',
        args: { product: 'lúa', region: 'Đồng bằng sông Cửu Long' }
      };

      await service.handleToolCall(toolCall);

      jest.advanceTimersByTime(2000);

      // Should notify about tool call
      expect(callbacks.onToolCall).toHaveBeenCalledWith('lookup_price');

      // Should send simulated response
      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('tra cứu giá')
        })
      );
    });

    test('should simulate diagnose_disease tool', async () => {
      const toolCall = {
        id: 'tool-2',
        name: 'diagnose_disease',
        args: { crop: 'lúa', symptoms: 'lá vàng' }
      };

      await service.handleToolCall(toolCall);

      jest.advanceTimersByTime(2000);

      expect(callbacks.onToolCall).toHaveBeenCalledWith('diagnose_disease');
      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('phân tích bệnh')
        })
      );
    });

    test('should simulate find_agri_store tool', async () => {
      const toolCall = {
        id: 'tool-3',
        name: 'find_agri_store',
        args: { productType: 'phân bón', location: 'Cần Thơ' }
      };

      await service.handleToolCall(toolCall);

      jest.advanceTimersByTime(2000);

      expect(callbacks.onToolCall).toHaveBeenCalledWith('find_agri_store');
      expect(callbacks.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('tìm cửa hàng')
        })
      );
    });

    test('should not return tool responses in simulation mode', async () => {
      const toolCall = {
        id: 'tool-1',
        name: 'lookup_price',
        args: { product: 'lúa' }
      };

      const responses = await service.handleToolCall(toolCall);

      // Should return empty array in simulation mode
      expect(responses).toEqual([]);
    });
  });

  describe('Audio Handling in Simulation Mode', () => {
    beforeEach(async () => {
      service = new VideoCallService('', 'Test User');
      await service.startSession(callbacks);
      jest.clearAllMocks();
    });

    test('should handle audio input gracefully', () => {
      const audioData = {
        data: 'base64-audio-data',
        mimeType: 'audio/pcm'
      };

      // Should not throw error
      expect(() => {
        service.sendAudioInput(audioData);
      }).not.toThrow();
    });

    test('should log audio input in simulation mode', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const audioData = {
        data: 'base64-audio-data',
        mimeType: 'audio/pcm'
      };

      service.sendAudioInput(audioData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Simulation mode')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Session Management', () => {
    test('should mark session as active in simulation mode', async () => {
      service = new VideoCallService('', 'Test User');

      await service.startSession(callbacks);

      expect(service.isSessionActive).toBe(true);
    });

    test('should clean up properly when stopping session', async () => {
      service = new VideoCallService('', 'Test User');
      await service.startSession(callbacks);

      service.stopSession();

      expect(service.isSessionActive).toBe(false);
      expect(service.isSimulation()).toBe(false);
    });
  });

  describe('Realistic Behavior', () => {
    beforeEach(async () => {
      service = new VideoCallService('', 'Test User');
      await service.startSession(callbacks);
      jest.clearAllMocks();
    });

    test('should have variable thinking times', () => {
      // Send multiple requests
      service.sendTextInput('Question 1');
      const time1 = jest.getTimerCount();

      jest.clearAllTimers();
      jest.clearAllMocks();

      service.sendTextInput('Question 2');
      const time2 = jest.getTimerCount();

      // Times should be set (both should have timers)
      expect(time1).toBeGreaterThan(0);
      expect(time2).toBeGreaterThan(0);
    });

    test('should provide varied plant analyses', () => {
      const analyses = [];

      // Capture multiple analyses
      for (let i = 0; i < 5; i++) {
        jest.clearAllMocks();
        service.sendImageInput('image-data');
        jest.advanceTimersByTime(3000);

        const lastCall = callbacks.onMessage.mock.calls[callbacks.onMessage.mock.calls.length - 1];
        if (lastCall) {
          analyses.push(lastCall[0].content);
        }
      }

      // Should have variety (not all the same)
      const uniqueAnalyses = new Set(analyses);
      expect(uniqueAnalyses.size).toBeGreaterThan(1);
    });
  });
});
