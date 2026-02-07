// Mock @google/genai before importing
jest.mock('@google/genai', () => ({
  GoogleGenerativeAI: jest.fn()
}));

// Mock other dependencies
jest.mock('../../utils/sentry', () => ({
  reportError: jest.fn(),
  addBreadcrumb: jest.fn()
}));

jest.mock('../../utils/videoHelpers', () => ({
  captureFrame: jest.fn()
}));

jest.mock('../../utils/audioHelpers', () => ({
  createPcmBlob: jest.fn(),
  decode: jest.fn(),
  decodeAudioData: jest.fn()
}));

import VideoCallService from '../videoCallService';

describe('VideoCallService - sendImageInput', () => {
  let service;
  let mockSendRealtimeInput;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create service instance
    service = new VideoCallService('test-api-key', 'Test User');
    
    // Mock the geminiService methods
    mockSendRealtimeInput = jest.fn();
    service.geminiService = {
      sendRealtimeInput: mockSendRealtimeInput,
      isServiceConnected: jest.fn().mockReturnValue(true),
      connect: jest.fn(),
      disconnect: jest.fn(),
      onOpen: jest.fn(),
      onMessage: jest.fn(),
      onError: jest.fn(),
      onClose: jest.fn()
    };
    
    service.isSessionActive = true;
    service.isSimulationMode = false;
  });

  afterEach(() => {
    if (service) {
      service.stopSession();
    }
  });

  test('should send image with default prompt', () => {
    const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

    service.sendImageInput(base64Image);

    // Should send image
    expect(mockSendRealtimeInput).toHaveBeenCalledWith({
      type: 'image',
      data: '/9j/4AAQSkZJRg==',
      mimeType: 'image/jpeg'
    });

    // Should send default prompt
    expect(mockSendRealtimeInput).toHaveBeenCalledWith({
      type: 'text',
      data: 'Hãy phân tích hình ảnh này và cho tôi biết về cây trồng, bệnh hại nếu có.'
    });

    expect(mockSendRealtimeInput).toHaveBeenCalledTimes(2);
  });

  test('should send image with custom prompt', () => {
    const base64Image = '/9j/4AAQSkZJRg==';
    const customPrompt = 'Đây là cây gì?';

    service.sendImageInput(base64Image, customPrompt);

    // Should send image
    expect(mockSendRealtimeInput).toHaveBeenCalledWith({
      type: 'image',
      data: '/9j/4AAQSkZJRg==',
      mimeType: 'image/jpeg'
    });

    // Should send custom prompt
    expect(mockSendRealtimeInput).toHaveBeenCalledWith({
      type: 'text',
      data: customPrompt
    });
  });

  test('should handle base64 with data URI prefix', () => {
    const base64WithPrefix = 'data:image/jpeg;base64,ABC123';

    service.sendImageInput(base64WithPrefix);

    // Should extract base64 data without prefix
    expect(mockSendRealtimeInput).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'image',
        data: 'ABC123'
      })
    );
  });

  test('should handle base64 without data URI prefix', () => {
    const base64WithoutPrefix = 'XYZ789';

    service.sendImageInput(base64WithoutPrefix);

    // Should use data as-is
    expect(mockSendRealtimeInput).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'image',
        data: 'XYZ789'
      })
    );
  });

  test('should throw error when not connected', () => {
    service.geminiService.isServiceConnected.mockReturnValue(false);

    expect(() => {
      service.sendImageInput('base64data');
    }).toThrow('Not connected to Gemini Live');
  });

  test('should handle simulation mode', () => {
    service.isSimulationMode = true;
    const mockOnStatusChange = jest.fn();
    const mockOnMessage = jest.fn();
    
    service.callbacks = {
      onStatusChange: mockOnStatusChange,
      onMessage: mockOnMessage
    };

    service.sendImageInput('base64data');

    // Should not call Gemini service
    expect(mockSendRealtimeInput).not.toHaveBeenCalled();

    // Should trigger simulation
    expect(mockOnStatusChange).toHaveBeenCalledWith('thinking');
  });
});
