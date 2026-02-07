/**
 * Tests for VideoCallService error handling
 */

// Mock dependencies BEFORE imports
jest.mock('@google/genai', () => ({
  GoogleGenerativeAI: jest.fn()
}));

jest.mock('../geminiLiveService', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({}),
    disconnect: jest.fn(),
    sendRealtimeInput: jest.fn(),
    onOpen: jest.fn(),
    onMessage: jest.fn(),
    onError: jest.fn(),
    onClose: jest.fn(),
    isServiceConnected: jest.fn().mockReturnValue(true),
    session: {
      send: jest.fn()
    }
  }));
});

jest.mock('../../utils/videoHelpers', () => ({
  captureFrame: jest.fn().mockReturnValue('data:image/jpeg;base64,mockimage'),
  getCameraConstraints: jest.fn(),
  getAdvancedConstraints: jest.fn()
}));

jest.mock('../../utils/audioHelpers', () => ({
  createPcmBlob: jest.fn().mockReturnValue({ data: 'mockdata', mimeType: 'audio/pcm' }),
  decode: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
  decodeAudioData: jest.fn().mockResolvedValue({})
}));

jest.mock('../../utils/sentry', () => ({
  reportError: jest.fn(),
  addBreadcrumb: jest.fn()
}));

import VideoCallService from '../videoCallService';
import {
  getVideoCallErrorMessage,
  isPermissionError,
  isNetworkError,
  isAPIError,
  shouldFallbackToSimulation,
  isRetryableError
} from '../../constants/videoCallErrors';

describe('VideoCallService - Error Handling', () => {
  let service;
  const mockApiKey = 'test-api-key-12345';
  const mockUserName = 'Test User';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create service instance
    service = new VideoCallService(mockApiKey, mockUserName);
  });

  afterEach(() => {
    // Clean up
    if (service) {
      service.stopSession();
    }
  });

  describe('Permission Errors', () => {
    test('should handle camera permission denied error', async () => {
      const permissionError = new Error('Permission denied');
      permissionError.name = 'NotAllowedError';

      // Mock getUserMedia to throw permission error
      global.navigator.mediaDevices = {
        getUserMedia: jest.fn().mockRejectedValue(permissionError)
      };

      await expect(service.startCamera('user')).rejects.toThrow();
      
      // Verify error is recognized as permission error
      expect(isPermissionError(permissionError)).toBe(true);
    });

    test('should handle microphone permission denied error', async () => {
      const permissionError = new Error('Permission denied');
      permissionError.name = 'NotAllowedError';

      global.navigator.mediaDevices = {
        getUserMedia: jest.fn().mockRejectedValue(permissionError)
      };

      const mockCallbacks = {
        onError: jest.fn()
      };

      await expect(service.startSession(mockCallbacks)).rejects.toThrow();
      
      // Verify error callback was called
      expect(mockCallbacks.onError).toHaveBeenCalled();
    });

    test('should handle device not found error', async () => {
      const notFoundError = new Error('Device not found');
      notFoundError.name = 'NotFoundError';

      global.navigator.mediaDevices = {
        getUserMedia: jest.fn().mockRejectedValue(notFoundError)
      };

      await expect(service.startCamera('user')).rejects.toThrow();
      
      // Verify error message is user-friendly
      const message = getVideoCallErrorMessage(notFoundError);
      expect(message).toContain('thiết bị');
    });
  });

  describe('Network Errors', () => {
    test('should detect network errors', () => {
      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';

      expect(isNetworkError(networkError)).toBe(true);
    });

    test('should detect timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      expect(isNetworkError(timeoutError)).toBe(true);
    });

    test('should fallback to simulation on network errors', () => {
      const networkError = new Error('Network failed');
      networkError.name = 'NetworkError';

      expect(shouldFallbackToSimulation(networkError)).toBe(true);
    });
  });

  describe('API Errors', () => {
    test('should detect API errors', () => {
      const apiError = new Error('API connection failed');
      apiError.code = 'api/connection-failed';

      expect(isAPIError(apiError)).toBe(true);
    });

    test('should handle invalid API key', async () => {
      const invalidKeyService = new VideoCallService('', mockUserName);
      
      const mockCallbacks = {
        onStatusChange: jest.fn()
      };

      await invalidKeyService.startSession(mockCallbacks);
      
      // Should start in simulation mode
      expect(invalidKeyService.isSimulation()).toBe(true);
    });

    test('should fallback to simulation on API errors', () => {
      const apiError = new Error('API unavailable');
      apiError.code = 'api/service-unavailable';

      expect(shouldFallbackToSimulation(apiError)).toBe(true);
    });
  });

  describe('Audio Processing Errors', () => {
    test('should handle audio context creation failure', () => {
      // Mock AudioContext to throw error
      const originalAudioContext = global.AudioContext;
      const originalWebkitAudioContext = global.webkitAudioContext;
      
      global.AudioContext = undefined;
      global.webkitAudioContext = undefined;

      const newService = new VideoCallService(mockApiKey, mockUserName);

      expect(() => {
        newService._initializeAudioContexts();
      }).toThrow();

      // Restore
      global.AudioContext = originalAudioContext;
      global.webkitAudioContext = originalWebkitAudioContext;
    });

    test('should handle invalid audio data', () => {
      // Should not throw, just log error
      expect(() => {
        service.sendAudioInput(null);
      }).not.toThrow();
    });
  });

  describe('Video Capture Errors', () => {
    test('should handle null video element', () => {
      expect(() => {
        service.captureImage(null);
      }).toThrow();
    });

    test('should handle video not ready', () => {
      const mockVideo = {
        readyState: 0,
        HAVE_ENOUGH_DATA: 4
      };

      expect(() => {
        service.captureImage(mockVideo);
      }).toThrow();
    });
  });

  describe('Error Message Localization', () => {
    test('should return Vietnamese error messages', () => {
      const permissionError = new Error('Permission denied');
      permissionError.name = 'NotAllowedError';

      const message = getVideoCallErrorMessage(permissionError);
      
      // Should be in Vietnamese
      expect(message).toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i);
    });

    test('should provide user-friendly messages', () => {
      const errors = [
        { name: 'NotAllowedError' },
        { name: 'NetworkError' },
        { code: 'api/timeout' }
      ];

      errors.forEach(error => {
        const message = getVideoCallErrorMessage(error);
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Retryable Errors', () => {
    test('should identify retryable errors', () => {
      const retryableErrors = [
        { name: 'NetworkError' },
        { name: 'TimeoutError' },
        { code: 'api/service-unavailable' }
      ];

      retryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    test('should not retry permission errors', () => {
      const permissionError = new Error('Permission denied');
      permissionError.name = 'NotAllowedError';

      expect(isRetryableError(permissionError)).toBe(false);
    });
  });

  describe('Error Recovery', () => {
    test('should clean up resources on error', async () => {
      const mockStream = {
        getTracks: jest.fn(() => [
          { stop: jest.fn() }
        ])
      };

      service.audioStream = mockStream;
      service.videoStream = mockStream;

      service.stopSession();

      // Verify streams were stopped
      expect(mockStream.getTracks).toHaveBeenCalled();
    });

    test('should reset state on session stop error', () => {
      // Force an error during stop
      service.geminiService = {
        disconnect: jest.fn(() => {
          throw new Error('Disconnect failed');
        })
      };

      // Should not throw
      expect(() => {
        service.stopSession();
      }).not.toThrow();

      // State should still be reset
      expect(service.isSessionActive).toBe(false);
    });
  });

  describe('Tool Call Error Handling', () => {
    test('should handle invalid tool call', async () => {
      const invalidToolCall = null;

      const responses = await service.handleToolCall(invalidToolCall);

      // Should return empty array instead of throwing
      expect(Array.isArray(responses)).toBe(true);
    });

    test('should handle tool execution failure', async () => {
      const toolCall = {
        id: 'test-id',
        name: 'unknown_tool',
        args: {}
      };

      const responses = await service.handleToolCall(toolCall);

      // Should return error response
      expect(responses).toHaveLength(1);
      expect(responses[0].response.result).toContain('không thể');
    });
  });
});
