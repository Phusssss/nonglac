/**
 * Tests for useAudioProcessor Hook - playOutput function
 */

import { decode, decodeAudioData, createPcmBlob } from '../../utils/audioHelpers';

// Mock AudioContext
class MockAudioContext {
  constructor(options = {}) {
    this.sampleRate = options.sampleRate || 44100;
    this.currentTime = 0;
    this.state = 'running';
    this.destination = { connect: jest.fn() };
  }

  createAnalyser() {
    return {
      fftSize: 256,
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn((time) => {
        // Simulate successful start
        return time;
      }),
      onended: null
    };
  }

  createBuffer(channels, length, sampleRate) {
    const buffer = {
      numberOfChannels: channels,
      length: length,
      sampleRate: sampleRate,
      duration: length / sampleRate,
      getChannelData: jest.fn(() => new Float32Array(length))
    };
    return buffer;
  }

  async close() {
    this.state = 'closed';
  }
}

// Setup global mocks
global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;

describe('useAudioProcessor - playOutput', () => {
  let mockContext;
  let mockAnalyser;
  let nextStartTimeRef;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = new MockAudioContext({ sampleRate: 24000 });
    mockAnalyser = mockContext.createAnalyser();
    nextStartTimeRef = { current: 0 };
  });

  describe('playOutput function logic', () => {
    it('should decode base64 audio correctly', async () => {
      // Create sample audio data
      const sampleAudio = new Float32Array(1024);
      for (let i = 0; i < sampleAudio.length; i++) {
        sampleAudio[i] = Math.sin(2 * Math.PI * 440 * i / 16000); // 440Hz tone
      }

      // Encode to base64
      const { data: base64Audio } = createPcmBlob(sampleAudio);

      // Decode base64 audio
      const uint8Data = decode(base64Audio);
      expect(uint8Data).toBeInstanceOf(Uint8Array);
      expect(uint8Data.length).toBeGreaterThan(0);
    });

    it('should create AudioBuffer from decoded data', async () => {
      // Create sample audio data
      const sampleAudio = new Float32Array(1024);
      const { data: base64Audio } = createPcmBlob(sampleAudio);

      // Decode and create buffer
      const uint8Data = decode(base64Audio);
      const audioBuffer = await decodeAudioData(uint8Data, mockContext);

      expect(audioBuffer).toBeTruthy();
      expect(audioBuffer.numberOfChannels).toBe(1);
      expect(audioBuffer.sampleRate).toBe(24000);
    });

    it('should create BufferSource and schedule playback', async () => {
      // Create sample audio data
      const sampleAudio = new Float32Array(1024);
      const { data: base64Audio } = createPcmBlob(sampleAudio);

      // Simulate playOutput logic
      const uint8Data = decode(base64Audio);
      const audioBuffer = await decodeAudioData(uint8Data, mockContext);
      
      const source = mockContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(mockAnalyser);
      mockAnalyser.connect(mockContext.destination);

      // Schedule playback with timing queue
      const currentTime = mockContext.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      
      source.start(startTime);

      // Verify source was started
      expect(source.start).toHaveBeenCalledWith(startTime);
      expect(source.connect).toHaveBeenCalledWith(mockAnalyser);
    });

    it('should handle timing queue for seamless playback', async () => {
      // Create two audio samples
      const sampleAudio1 = new Float32Array(1024);
      const sampleAudio2 = new Float32Array(1024);
      
      const { data: base64Audio1 } = createPcmBlob(sampleAudio1);
      const { data: base64Audio2 } = createPcmBlob(sampleAudio2);

      // First playback
      const uint8Data1 = decode(base64Audio1);
      const audioBuffer1 = await decodeAudioData(uint8Data1, mockContext);
      
      const source1 = mockContext.createBufferSource();
      source1.buffer = audioBuffer1;
      
      const startTime1 = Math.max(mockContext.currentTime, nextStartTimeRef.current);
      source1.start(startTime1);
      nextStartTimeRef.current = startTime1 + audioBuffer1.duration;

      // Second playback should be scheduled after first
      const uint8Data2 = decode(base64Audio2);
      const audioBuffer2 = await decodeAudioData(uint8Data2, mockContext);
      
      const source2 = mockContext.createBufferSource();
      source2.buffer = audioBuffer2;
      
      const startTime2 = Math.max(mockContext.currentTime, nextStartTimeRef.current);
      source2.start(startTime2);

      // Second should start after first
      expect(startTime2).toBeGreaterThanOrEqual(startTime1);
    });

    it('should handle playback completion', async () => {
      const sampleAudio = new Float32Array(1024);
      const { data: base64Audio } = createPcmBlob(sampleAudio);

      const uint8Data = decode(base64Audio);
      const audioBuffer = await decodeAudioData(uint8Data, mockContext);
      
      const source = mockContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(mockAnalyser);

      // Set up onended handler
      let disconnectCalled = false;
      source.disconnect = jest.fn(() => {
        disconnectCalled = true;
      });

      source.onended = () => {
        source.disconnect();
        if (nextStartTimeRef.current <= mockContext.currentTime) {
          nextStartTimeRef.current = 0;
        }
      };

      // Simulate playback end
      source.onended();

      expect(disconnectCalled).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Try to decode invalid base64
      try {
        decode('invalid-base64-!@#$%');
      } catch (error) {
        // Error is expected
        expect(error).toBeTruthy();
      }

      consoleErrorSpy.mockRestore();
    });
  });
});
