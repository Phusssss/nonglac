/**
 * Unit tests for Audio Helper Utilities
 * 
 * Tests PCM encoding/decoding, edge cases, and round-trip conversions
 */

import { createPcmBlob, decode, decodeAudioData } from '../audioHelpers';

describe('audioHelpers', () => {
  describe('createPcmBlob', () => {
    it('should convert Float32Array to base64 PCM blob', () => {
      const float32Data = new Float32Array([0.5, -0.5, 0.0, 1.0, -1.0]);
      const result = createPcmBlob(float32Data);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('mimeType');
      expect(typeof result.data).toBe('string');
      expect(result.mimeType).toBe('audio/pcm;rate=16000');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle empty Float32Array', () => {
      const float32Data = new Float32Array([]);
      const result = createPcmBlob(float32Data);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('mimeType');
      expect(result.data).toBe('');
    });

    it('should clamp values outside [-1, 1] range', () => {
      const float32Data = new Float32Array([2.0, -3.0, 0.5]);
      const result = createPcmBlob(float32Data);
      
      // Should not throw and should produce valid base64
      expect(result.data).toBeTruthy();
      expect(() => atob(result.data)).not.toThrow();
    });

    it('should handle maximum positive value (1.0)', () => {
      const float32Data = new Float32Array([1.0]);
      const result = createPcmBlob(float32Data);
      
      expect(result.data).toBeTruthy();
      const decoded = decode(result.data);
      const int16 = new Int16Array(decoded.buffer);
      expect(int16[0]).toBe(32767); // 0x7FFF
    });

    it('should handle maximum negative value (-1.0)', () => {
      const float32Data = new Float32Array([-1.0]);
      const result = createPcmBlob(float32Data);
      
      expect(result.data).toBeTruthy();
      const decoded = decode(result.data);
      const int16 = new Int16Array(decoded.buffer);
      expect(int16[0]).toBe(-32768); // -0x8000
    });

    it('should handle zero value', () => {
      const float32Data = new Float32Array([0.0]);
      const result = createPcmBlob(float32Data);
      
      expect(result.data).toBeTruthy();
      const decoded = decode(result.data);
      const int16 = new Int16Array(decoded.buffer);
      expect(int16[0]).toBe(0);
    });
  });

  describe('decode', () => {
    it('should decode valid base64 string to Uint8Array', () => {
      const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
      const result = decode(base64);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty base64 string', () => {
      const base64 = '';
      const result = decode(base64);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });

    it('should throw error for invalid base64', () => {
      const invalidBase64 = 'This is not valid base64!!!';
      
      expect(() => decode(invalidBase64)).toThrow();
    });

    it('should decode base64 with padding', () => {
      const base64 = 'AQIDBA==';
      const result = decode(base64);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(4);
    });

    it('should decode base64 without padding', () => {
      const base64 = 'AQID';
      const result = decode(base64);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(3);
    });
  });

  describe('decodeAudioData', () => {
    let mockAudioContext;

    beforeEach(() => {
      // Mock AudioContext
      mockAudioContext = {
        sampleRate: 24000,
        createBuffer: jest.fn((channels, length, sampleRate) => {
          const buffer = {
            numberOfChannels: channels,
            length: length,
            sampleRate: sampleRate,
            duration: length / sampleRate,
            _channelData: new Float32Array(length),
            getChannelData: jest.fn((channel) => buffer._channelData)
          };
          return buffer;
        })
      };
    });

    it('should create AudioBuffer from Uint8Array', async () => {
      const int16Array = new Int16Array([16383, -16384, 0]);
      const uint8Array = new Uint8Array(int16Array.buffer);
      
      const audioBuffer = await decodeAudioData(uint8Array, mockAudioContext);
      
      expect(mockAudioContext.createBuffer).toHaveBeenCalledWith(1, 3, 24000);
      expect(audioBuffer).toBeDefined();
      expect(audioBuffer.length).toBe(3);
    });

    it('should normalize Int16 values to Float32 range', async () => {
      const int16Array = new Int16Array([32767, -32768, 0]);
      const uint8Array = new Uint8Array(int16Array.buffer);
      
      const audioBuffer = await decodeAudioData(uint8Array, mockAudioContext);
      const channelData = audioBuffer.getChannelData(0);
      
      expect(channelData[0]).toBeCloseTo(1.0, 5);
      expect(channelData[1]).toBeCloseTo(-1.0, 5);
      expect(channelData[2]).toBe(0);
    });

    it('should handle empty Uint8Array', async () => {
      const uint8Array = new Uint8Array([]);
      
      const audioBuffer = await decodeAudioData(uint8Array, mockAudioContext);
      
      expect(mockAudioContext.createBuffer).toHaveBeenCalledWith(1, 0, 24000);
      expect(audioBuffer.length).toBe(0);
    });

    it('should use correct sample rate from context', async () => {
      mockAudioContext.sampleRate = 16000;
      const int16Array = new Int16Array([100, 200]);
      const uint8Array = new Uint8Array(int16Array.buffer);
      
      await decodeAudioData(uint8Array, mockAudioContext);
      
      expect(mockAudioContext.createBuffer).toHaveBeenCalledWith(1, 2, 16000);
    });
  });

  describe('PCM encoding/decoding round-trip', () => {
    let mockAudioContext;

    beforeEach(() => {
      mockAudioContext = {
        sampleRate: 16000,
        createBuffer: jest.fn((channels, length, sampleRate) => {
          const buffer = {
            numberOfChannels: channels,
            length: length,
            sampleRate: sampleRate,
            duration: length / sampleRate,
            _channelData: new Float32Array(length),
            getChannelData: jest.fn((channel) => buffer._channelData)
          };
          return buffer;
        })
      };
    });

    it('should preserve data through encode-decode cycle', async () => {
      const originalData = new Float32Array([0.5, -0.5, 0.0, 0.25, -0.75]);
      
      // Encode
      const encoded = createPcmBlob(originalData);
      
      // Decode
      const decodedBytes = decode(encoded.data);
      const audioBuffer = await decodeAudioData(decodedBytes, mockAudioContext);
      const decodedData = audioBuffer.getChannelData(0);
      
      // Verify length
      expect(decodedData.length).toBe(originalData.length);
      
      // Verify values (with tolerance for Int16 quantization)
      for (let i = 0; i < originalData.length; i++) {
        expect(decodedData[i]).toBeCloseTo(originalData[i], 4);
      }
    });

    it('should handle round-trip with extreme values', async () => {
      const originalData = new Float32Array([1.0, -1.0, 0.0]);
      
      const encoded = createPcmBlob(originalData);
      const decodedBytes = decode(encoded.data);
      const audioBuffer = await decodeAudioData(decodedBytes, mockAudioContext);
      const decodedData = audioBuffer.getChannelData(0);
      
      expect(decodedData[0]).toBeCloseTo(1.0, 4);
      expect(decodedData[1]).toBeCloseTo(-1.0, 4);
      expect(decodedData[2]).toBe(0.0);
    });

    it('should handle round-trip with large array', async () => {
      const size = 1000;
      const originalData = new Float32Array(size);
      for (let i = 0; i < size; i++) {
        originalData[i] = Math.sin(i * 0.1); // Generate sine wave
      }
      
      const encoded = createPcmBlob(originalData);
      const decodedBytes = decode(encoded.data);
      const audioBuffer = await decodeAudioData(decodedBytes, mockAudioContext);
      const decodedData = audioBuffer.getChannelData(0);
      
      expect(decodedData.length).toBe(size);
      
      // Verify a few sample points
      expect(decodedData[0]).toBeCloseTo(originalData[0], 4);
      expect(decodedData[500]).toBeCloseTo(originalData[500], 4);
      expect(decodedData[999]).toBeCloseTo(originalData[999], 4);
    });

    it('should handle round-trip with empty array', async () => {
      const originalData = new Float32Array([]);
      
      const encoded = createPcmBlob(originalData);
      const decodedBytes = decode(encoded.data);
      const audioBuffer = await decodeAudioData(decodedBytes, mockAudioContext);
      const decodedData = audioBuffer.getChannelData(0);
      
      expect(decodedData.length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle NaN values in Float32Array', () => {
      const float32Data = new Float32Array([NaN, 0.5, -0.5]);
      const result = createPcmBlob(float32Data);
      
      expect(result.data).toBeTruthy();
      // NaN should be clamped to valid range
      expect(() => decode(result.data)).not.toThrow();
    });

    it('should handle Infinity values in Float32Array', () => {
      const float32Data = new Float32Array([Infinity, -Infinity, 0.5]);
      const result = createPcmBlob(float32Data);
      
      expect(result.data).toBeTruthy();
      const decoded = decode(result.data);
      const int16 = new Int16Array(decoded.buffer);
      
      // Infinity should be clamped to max/min values
      expect(int16[0]).toBe(32767);
      expect(int16[1]).toBe(-32768);
    });

    it('should handle very small Float32 values', () => {
      const float32Data = new Float32Array([0.0001, -0.0001, 0.00001]);
      const result = createPcmBlob(float32Data);
      
      expect(result.data).toBeTruthy();
      expect(() => decode(result.data)).not.toThrow();
    });

    it('should handle base64 with special characters', () => {
      const base64 = 'AQID+/=='; // Contains + and /
      const result = decode(base64);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle single sample', () => {
      const float32Data = new Float32Array([0.5]);
      const result = createPcmBlob(float32Data);
      
      expect(result.data).toBeTruthy();
      const decoded = decode(result.data);
      expect(decoded.length).toBe(2); // Int16 is 2 bytes
    });
  });
});
