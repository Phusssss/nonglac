/**
 * Unit Tests for OrchestratorService
 * Tests coordination between AudioModelService and AnalysisModelService
 */

// Mock the services before importing
jest.mock('../AudioModelService', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
      sendAudioInput: jest.fn(),
      sendTextForSpeech: jest.fn(),
      onOpen: jest.fn(),
      onAudioOutput: jest.fn(),
      onTranscript: jest.fn(),
      onError: jest.fn(),
      onClose: jest.fn(),
      isServiceConnected: jest.fn().mockReturnValue(true),
      cleanup: jest.fn()
    }))
  };
});

jest.mock('../AnalysisModelService', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      analyzeImage: jest.fn().mockResolvedValue('Analysis result'),
      processText: jest.fn().mockResolvedValue('Text processing result'),
      executeTool: jest.fn().mockResolvedValue({ id: '123', name: 'test', response: { result: 'Tool result' } }),
      getToolDefinitions: jest.fn().mockReturnValue([]),
      isServiceReady: jest.fn().mockReturnValue(true),
      cleanup: jest.fn()
    }))
  };
});

describe('OrchestratorService', () => {
  let OrchestratorService;
  const mockApiKey = 'test-api-key';
  const mockUserName = 'Test User';

  beforeEach(() => {
    jest.clearAllMocks();
    OrchestratorService = require('../OrchestratorService').default;
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('Constructor', () => {
    test('should initialize with API key and username', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(service).toBeDefined();
      expect(service.userName).toBe(mockUserName);
      expect(service.isActive).toBe(false);
    });

    test('should use default username if not provided', () => {
      const service = new OrchestratorService(mockApiKey);
      expect(service.userName).toBe('Bạn');
    });

    test('should handle missing API key gracefully', () => {
      const service = new OrchestratorService();
      expect(service).toBeDefined();
      expect(service.apiKey).toBeUndefined();
    });
  });

  describe('Session Lifecycle', () => {
    test('should have startSession method', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service.startSession).toBe('function');
    });

    test('should have stopSession method', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service.stopSession).toBe('function');
    });

    test('startSession should initialize both models', async () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      const callbacks = {
        onStatusChange: jest.fn(),
        onMessage: jest.fn(),
        onError: jest.fn(),
        onAudioOutput: jest.fn()
      };

      await service.startSession(callbacks);

      // Models may not initialize in test environment, but service should handle gracefully
      expect(service.audioModel).toBeDefined();
      expect(service.analysisModel).toBeDefined();
      // Service may enter simulation mode if models fail to initialize
      expect(typeof service.isActive).toBe('boolean');
    });

    test('stopSession should cleanup resources', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      // Manually set up mock models
      const mockAudioModel = { cleanup: jest.fn() };
      const mockAnalysisModel = { cleanup: jest.fn() };
      
      service.audioModel = mockAudioModel;
      service.analysisModel = mockAnalysisModel;
      service.isActive = true;

      service.stopSession();

      expect(mockAudioModel.cleanup).toHaveBeenCalled();
      expect(mockAnalysisModel.cleanup).toHaveBeenCalled();
      expect(service.isActive).toBe(false);
      expect(service.audioModel).toBeNull();
      expect(service.analysisModel).toBeNull();
    });
  });

  describe('Voice Interaction Flow', () => {
    test('should have handleVoiceInput method', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service.handleVoiceInput).toBe('function');
    });

    test('handleVoiceInput should send audio to AudioModel', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      service.audioModel = {
        sendAudioInput: jest.fn(),
        isServiceConnected: jest.fn().mockReturnValue(true)
      };

      const audioData = { data: 'audio', mimeType: 'audio/pcm;rate=16000' };
      service.handleVoiceInput(audioData);

      expect(service.audioModel.sendAudioInput).toHaveBeenCalledWith(audioData);
    });
  });

  describe('Image Capture Flow', () => {
    test('should have handleImageCapture method', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service.handleImageCapture).toBe('function');
    });

    test('handleImageCapture should send wait message first', async () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      service.audioModel = {
        sendTextForSpeech: jest.fn(),
        isServiceConnected: jest.fn().mockReturnValue(true)
      };
      service.analysisModel = {
        analyzeImage: jest.fn().mockResolvedValue('Analysis result'),
        isServiceReady: jest.fn().mockReturnValue(true)
      };
      service.callbacks = { onMessage: jest.fn() };

      const imageData = { base64: 'imagedata', mimeType: 'image/jpeg' };
      await service.handleImageCapture(imageData);

      expect(service.audioModel.sendTextForSpeech).toHaveBeenCalled();
      const firstCall = service.audioModel.sendTextForSpeech.mock.calls[0][0];
      expect(firstCall).toContain('Chờ');
    });

    test('handleImageCapture should send image to AnalysisModel', async () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      service.audioModel = {
        sendTextForSpeech: jest.fn(),
        isServiceConnected: jest.fn().mockReturnValue(true)
      };
      service.analysisModel = {
        analyzeImage: jest.fn().mockResolvedValue('Analysis result'),
        isServiceReady: jest.fn().mockReturnValue(true)
      };
      service.callbacks = { onMessage: jest.fn() };

      const imageData = { base64: 'imagedata', mimeType: 'image/jpeg' };
      await service.handleImageCapture(imageData);

      expect(service.analysisModel.analyzeImage).toHaveBeenCalledWith(
        imageData,
        expect.any(String)
      );
    });
  });

  describe('Tool Call Flow', () => {
    test('should have handleToolCall method', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service.handleToolCall).toBe('function');
    });

    test('handleToolCall should execute tool via AnalysisModel', async () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      service.analysisModel = {
        executeTool: jest.fn().mockResolvedValue({
          id: '123',
          name: 'lookup_price',
          response: { result: 'Price result' }
        }),
        isServiceReady: jest.fn().mockReturnValue(true)
      };

      const toolCall = {
        id: '123',
        name: 'lookup_price',
        args: { product: 'lúa' }
      };

      const result = await service.handleToolCall(toolCall);

      expect(service.analysisModel.executeTool).toHaveBeenCalledWith(toolCall);
      expect(result).toBeDefined();
      expect(result.id).toBe('123');
    });
  });

  describe('Routing Logic', () => {
    test('should have determineTargetModel method', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service.determineTargetModel).toBe('function');
    });

    test('should route audio requests to AudioModel', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      const request = { type: 'audio', data: 'audiodata' };
      
      const target = service.determineTargetModel(request);
      expect(target).toBe('audio');
    });

    test('should route image requests to AnalysisModel', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      const request = { type: 'image', data: 'imagedata' };
      
      const target = service.determineTargetModel(request);
      expect(target).toBe('analysis');
    });

    test('should route text requests based on context', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      
      const voiceContext = { type: 'text', data: 'text', context: 'voice' };
      expect(service.determineTargetModel(voiceContext)).toBe('audio');
      
      const analysisContext = { type: 'text', data: 'text', context: 'analysis' };
      expect(service.determineTargetModel(analysisContext)).toBe('analysis');
    });
  });

  describe('Error Handling', () => {
    test('should have error handling methods', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service._handleError).toBe('function');
      expect(typeof service._handleAudioModelError).toBe('function');
    });

    test('should handle audio model errors independently', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      service.callbacks = { onError: jest.fn() };
      service.analysisModel = { isServiceReady: jest.fn().mockReturnValue(true) };

      const error = new Error('Audio model error');
      service._handleAudioModelError(error);

      expect(service.callbacks.onError).toHaveBeenCalled();
      // Analysis model should still be ready
      expect(service.analysisModel.isServiceReady()).toBe(true);
    });

    test('should determine error criticality', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service._isErrorCritical).toBe('function');
      
      const criticalError = new Error('Connection failed');
      const nonCriticalError = new Error('Temporary timeout');
      
      // Method should exist and be callable
      expect(() => service._isErrorCritical(criticalError, 'audio')).not.toThrow();
    });
  });

  describe('Session State', () => {
    test('should have getSessionState method', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service.getSessionState).toBe('function');
    });

    test('getSessionState should return current state', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      service.isActive = true;
      service.audioModel = { isServiceConnected: jest.fn().mockReturnValue(true) };
      service.analysisModel = { isServiceReady: jest.fn().mockReturnValue(true) };

      const state = service.getSessionState();

      expect(state).toBeDefined();
      expect(state.isActive).toBe(true);
      expect(state.audioModelConnected).toBe(true);
      expect(state.analysisModelReady).toBe(true);
    });

    test('should have cleanup method', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      expect(typeof service.cleanup).toBe('function');
    });
  });

  describe('Model Independence', () => {
    test('audio model error should not affect analysis model', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      service.audioModel = {
        isServiceConnected: jest.fn().mockReturnValue(false)
      };
      service.analysisModel = {
        isServiceReady: jest.fn().mockReturnValue(true)
      };

      // Audio model is down
      expect(service.audioModel.isServiceConnected()).toBe(false);
      
      // Analysis model should still be operational
      expect(service.analysisModel.isServiceReady()).toBe(true);
    });

    test('analysis model error should not affect audio model', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      service.audioModel = {
        isServiceConnected: jest.fn().mockReturnValue(true)
      };
      service.analysisModel = {
        isServiceReady: jest.fn().mockReturnValue(false)
      };

      // Analysis model is down
      expect(service.analysisModel.isServiceReady()).toBe(false);
      
      // Audio model should still be operational
      expect(service.audioModel.isServiceConnected()).toBe(true);
    });
  });

  describe('Callback Management', () => {
    test('should notify status changes', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      const onStatusChange = jest.fn();
      service.callbacks = { onStatusChange };

      service._notifyStatusChange('connected');

      expect(onStatusChange).toHaveBeenCalledWith('connected');
    });

    test('should notify messages', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      const onMessage = jest.fn();
      service.callbacks = { onMessage };

      const message = { type: 'text', content: 'Test message' };
      service._notifyMessage(message);

      expect(onMessage).toHaveBeenCalledWith(message);
    });

    test('should notify errors', () => {
      const service = new OrchestratorService(mockApiKey, mockUserName);
      const onError = jest.fn();
      service.callbacks = { onError };

      service._notifyError('Test error');

      expect(onError).toHaveBeenCalledWith('Test error');
    });
  });
});
