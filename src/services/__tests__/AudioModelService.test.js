/**
 * Unit Tests for AudioModelService
 * Tests audio-only model for speech-to-text and text-to-speech
 */

describe('AudioModelService', () => {
  let AudioModelService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    // Mock the @google/genai module
    jest.mock('@google/genai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        models: {
          generateContent: jest.fn()
        }
      }))
    }));

    // Clear all mocks
    jest.clearAllMocks();
    
    // Import after mocking
    AudioModelService = require('../AudioModelService').default;
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('Constructor', () => {
    test('should initialize with API key', () => {
      const service = new AudioModelService(mockApiKey);
      expect(service).toBeDefined();
      expect(service.isConnected).toBe(false);
    });

    test('should handle missing API key gracefully', () => {
      const service = new AudioModelService();
      expect(service).toBeDefined();
      expect(service.apiKey).toBeNull();
    });
  });

  describe('Connection Management', () => {
    test('should have connect method', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.connect).toBe('function');
    });

    test('should have disconnect method', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.disconnect).toBe('function');
    });

    test('should have reconnect method', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.reconnect).toBe('function');
    });
  });

  describe('Audio Input/Output', () => {
    test('should have sendAudioInput method', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.sendAudioInput).toBe('function');
    });

    test('should have sendTextForSpeech method', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.sendTextForSpeech).toBe('function');
    });

    test('sendAudioInput should accept PCM data format', () => {
      const service = new AudioModelService(mockApiKey);
      const pcmData = {
        data: 'base64encodeddata',
        mimeType: 'audio/pcm;rate=16000'
      };
      
      // Should not throw when called with proper format
      expect(() => service.sendAudioInput(pcmData)).not.toThrow();
    });
  });

  describe('Event Handlers', () => {
    test('should have onOpen callback setter', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.onOpen).toBe('function');
      
      const callback = jest.fn();
      service.onOpen(callback);
      expect(service.callbacks.onOpen).toBe(callback);
    });

    test('should have onAudioOutput callback setter', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.onAudioOutput).toBe('function');
      
      const callback = jest.fn();
      service.onAudioOutput(callback);
      expect(service.callbacks.onAudioOutput).toBe(callback);
    });

    test('should have onTranscript callback setter', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.onTranscript).toBe('function');
      
      const callback = jest.fn();
      service.onTranscript(callback);
      expect(service.callbacks.onTranscript).toBe(callback);
    });

    test('should have onError callback setter', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.onError).toBe('function');
      
      const callback = jest.fn();
      service.onError(callback);
      expect(service.callbacks.onError).toBe(callback);
    });

    test('should have onClose callback setter', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.onClose).toBe('function');
      
      const callback = jest.fn();
      service.onClose(callback);
      expect(service.callbacks.onClose).toBe(callback);
    });
  });

  describe('Service State', () => {
    test('should have isServiceConnected method', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.isServiceConnected).toBe('function');
      expect(service.isServiceConnected()).toBe(false);
    });

    test('should have getSession method', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.getSession).toBe('function');
    });

    test('should have cleanup method', () => {
      const service = new AudioModelService(mockApiKey);
      expect(typeof service.cleanup).toBe('function');
    });
  });

  describe('Audio Model Isolation', () => {
    test('should not have image processing methods', () => {
      const service = new AudioModelService(mockApiKey);
      expect(service.analyzeImage).toBeUndefined();
      expect(service.processImage).toBeUndefined();
      expect(service.sendImageInput).toBeUndefined();
    });

    test('should only handle audio and text data types', () => {
      const service = new AudioModelService(mockApiKey);
      
      // Audio data should be accepted
      const audioData = { data: 'audio', mimeType: 'audio/pcm;rate=16000' };
      expect(() => service.sendAudioInput(audioData)).not.toThrow();
      
      // Text data should be accepted
      const textData = 'Hello world';
      expect(() => service.sendTextForSpeech(textData)).not.toThrow();
    });
  });
});
