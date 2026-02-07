/**
 * Unit tests for Video Helper Utilities
 * 
 * Tests frame capture, constraint generation, and advanced camera capabilities
 */

import { captureFrame, getCameraConstraints, getAdvancedConstraints } from '../videoHelpers';

describe('videoHelpers', () => {
  describe('captureFrame', () => {
    let mockVideoElement;
    let mockCanvas;
    let mockContext;

    beforeEach(() => {
      // Mock canvas context
      mockContext = {
        drawImage: jest.fn()
      };

      // Mock canvas element
      mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => mockContext),
        toDataURL: jest.fn(() => 'data:image/jpeg;base64,/9j/4AAQSkZJRg==')
      };

      // Mock document.createElement for canvas
      global.document.createElement = jest.fn((tagName) => {
        if (tagName === 'canvas') {
          return mockCanvas;
        }
        return {};
      });

      // Mock video element
      mockVideoElement = {
        readyState: 4, // HAVE_ENOUGH_DATA
        videoWidth: 1920,
        videoHeight: 1080
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should capture frame from video element', () => {
      const result = captureFrame(mockVideoElement);

      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.width).toBe(1920);
      expect(mockCanvas.height).toBe(1080);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockVideoElement, 0, 0, 1920, 1080);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
      expect(result).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
    });

    it('should use custom quality parameter', () => {
      captureFrame(mockVideoElement, 0.95);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.95);
    });

    it('should use default quality of 0.8', () => {
      captureFrame(mockVideoElement);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    });

    it('should throw error if video element is null', () => {
      expect(() => captureFrame(null)).toThrow('Video element is required');
    });

    it('should throw error if video element is undefined', () => {
      expect(() => captureFrame(undefined)).toThrow('Video element is required');
    });

    it('should throw error if video is not ready (readyState < 2)', () => {
      mockVideoElement.readyState = 1; // HAVE_METADATA

      expect(() => captureFrame(mockVideoElement)).toThrow('Video element is not ready');
    });

    it('should work when video readyState is 2 (HAVE_CURRENT_DATA)', () => {
      mockVideoElement.readyState = 2;

      const result = captureFrame(mockVideoElement);

      expect(result).toBeTruthy();
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should work when video readyState is 3 (HAVE_FUTURE_DATA)', () => {
      mockVideoElement.readyState = 3;

      const result = captureFrame(mockVideoElement);

      expect(result).toBeTruthy();
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should throw error if canvas context is null', () => {
      mockCanvas.getContext = jest.fn(() => null);

      expect(() => captureFrame(mockVideoElement)).toThrow('Failed to get canvas context');
    });

    it('should handle different video dimensions', () => {
      mockVideoElement.videoWidth = 640;
      mockVideoElement.videoHeight = 480;

      captureFrame(mockVideoElement);

      expect(mockCanvas.width).toBe(640);
      expect(mockCanvas.height).toBe(480);
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockVideoElement, 0, 0, 640, 480);
    });

    it('should handle HD video dimensions', () => {
      mockVideoElement.videoWidth = 1280;
      mockVideoElement.videoHeight = 720;

      captureFrame(mockVideoElement);

      expect(mockCanvas.width).toBe(1280);
      expect(mockCanvas.height).toBe(720);
    });

    it('should handle 4K video dimensions', () => {
      mockVideoElement.videoWidth = 3840;
      mockVideoElement.videoHeight = 2160;

      captureFrame(mockVideoElement);

      expect(mockCanvas.width).toBe(3840);
      expect(mockCanvas.height).toBe(2160);
    });

    it('should handle portrait video orientation', () => {
      mockVideoElement.videoWidth = 1080;
      mockVideoElement.videoHeight = 1920;

      captureFrame(mockVideoElement);

      expect(mockCanvas.width).toBe(1080);
      expect(mockCanvas.height).toBe(1920);
    });

    it('should handle minimum quality (0)', () => {
      captureFrame(mockVideoElement, 0);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0);
    });

    it('should handle maximum quality (1)', () => {
      captureFrame(mockVideoElement, 1);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 1);
    });

    it('should return base64 string with correct format', () => {
      const result = captureFrame(mockVideoElement);

      expect(result).toMatch(/^data:image\/jpeg;base64,/);
    });
  });

  describe('getCameraConstraints', () => {
    it('should return constraints for front camera (user)', () => {
      const constraints = getCameraConstraints('user');

      expect(constraints).toEqual({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
    });

    it('should return constraints for back camera (environment)', () => {
      const constraints = getCameraConstraints('environment');

      expect(constraints).toEqual({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
    });

    it('should always set audio to false', () => {
      const userConstraints = getCameraConstraints('user');
      const envConstraints = getCameraConstraints('environment');

      expect(userConstraints.audio).toBe(false);
      expect(envConstraints.audio).toBe(false);
    });

    it('should set ideal resolution to 1920x1080', () => {
      const constraints = getCameraConstraints('user');

      expect(constraints.video.width.ideal).toBe(1920);
      expect(constraints.video.height.ideal).toBe(1080);
    });

    it('should preserve facingMode value exactly', () => {
      const customMode = 'left';
      const constraints = getCameraConstraints(customMode);

      expect(constraints.video.facingMode).toBe('left');
    });

    it('should handle undefined facingMode', () => {
      const constraints = getCameraConstraints(undefined);

      expect(constraints.video.facingMode).toBeUndefined();
      expect(constraints.video.width).toEqual({ ideal: 1920 });
      expect(constraints.video.height).toEqual({ ideal: 1080 });
    });

    it('should handle null facingMode', () => {
      const constraints = getCameraConstraints(null);

      expect(constraints.video.facingMode).toBeNull();
    });

    it('should return new object on each call', () => {
      const constraints1 = getCameraConstraints('user');
      const constraints2 = getCameraConstraints('user');

      expect(constraints1).not.toBe(constraints2);
      expect(constraints1).toEqual(constraints2);
    });
  });

  describe('getAdvancedConstraints', () => {
    it('should return empty array for null capabilities', () => {
      const result = getAdvancedConstraints(null);

      expect(result).toEqual([]);
    });

    it('should return empty array for undefined capabilities', () => {
      const result = getAdvancedConstraints(undefined);

      expect(result).toEqual([]);
    });

    it('should return empty array for empty capabilities object', () => {
      const result = getAdvancedConstraints({});

      expect(result).toEqual([]);
    });

    it('should add continuous focus mode when supported', () => {
      const capabilities = {
        focusMode: ['manual', 'continuous', 'single-shot']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        { focusMode: 'continuous' }
      ]);
    });

    it('should add continuous exposure mode when supported', () => {
      const capabilities = {
        exposureMode: ['manual', 'continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        { exposureMode: 'continuous' }
      ]);
    });

    it('should add continuous white balance mode when supported', () => {
      const capabilities = {
        whiteBalanceMode: ['manual', 'continuous', 'auto']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        { whiteBalanceMode: 'continuous' }
      ]);
    });

    it('should combine all supported continuous modes', () => {
      const capabilities = {
        focusMode: ['manual', 'continuous'],
        exposureMode: ['manual', 'continuous'],
        whiteBalanceMode: ['manual', 'continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        {
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      ]);
    });

    it('should only include modes that support continuous', () => {
      const capabilities = {
        focusMode: ['manual', 'single-shot'], // No continuous
        exposureMode: ['manual', 'continuous'],
        whiteBalanceMode: ['manual', 'auto'] // No continuous
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        { exposureMode: 'continuous' }
      ]);
    });

    it('should return empty array when no continuous modes are supported', () => {
      const capabilities = {
        focusMode: ['manual', 'single-shot'],
        exposureMode: ['manual', 'auto'],
        whiteBalanceMode: ['manual', 'auto']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([]);
    });

    it('should handle capabilities with non-array values', () => {
      const capabilities = {
        focusMode: 'continuous', // Not an array
        exposureMode: ['continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        { exposureMode: 'continuous' }
      ]);
    });

    it('should handle capabilities with empty arrays', () => {
      const capabilities = {
        focusMode: [],
        exposureMode: [],
        whiteBalanceMode: []
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([]);
    });

    it('should handle partial capabilities object', () => {
      const capabilities = {
        focusMode: ['continuous'],
        zoom: [1, 2, 3], // Other capability
        torch: true // Other capability
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        { focusMode: 'continuous' }
      ]);
    });

    it('should handle capabilities with only focus mode', () => {
      const capabilities = {
        focusMode: ['continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        { focusMode: 'continuous' }
      ]);
    });

    it('should handle capabilities with only exposure mode', () => {
      const capabilities = {
        exposureMode: ['continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        { exposureMode: 'continuous' }
      ]);
    });

    it('should handle capabilities with only white balance mode', () => {
      const capabilities = {
        whiteBalanceMode: ['continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        { whiteBalanceMode: 'continuous' }
      ]);
    });

    it('should handle capabilities with focus and exposure only', () => {
      const capabilities = {
        focusMode: ['continuous'],
        exposureMode: ['continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        {
          focusMode: 'continuous',
          exposureMode: 'continuous'
        }
      ]);
    });

    it('should handle capabilities with focus and white balance only', () => {
      const capabilities = {
        focusMode: ['continuous'],
        whiteBalanceMode: ['continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        {
          focusMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      ]);
    });

    it('should handle capabilities with exposure and white balance only', () => {
      const capabilities = {
        exposureMode: ['continuous'],
        whiteBalanceMode: ['continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        {
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      ]);
    });

    it('should return array with single object (not multiple objects)', () => {
      const capabilities = {
        focusMode: ['continuous'],
        exposureMode: ['continuous']
      };

      const result = getAdvancedConstraints(capabilities);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(typeof result[0]).toBe('object');
    });

    it('should handle real-world mobile camera capabilities', () => {
      const capabilities = {
        aspectRatio: { max: 1920, min: 0.0005208333333333333 },
        deviceId: 'abc123',
        facingMode: ['environment'],
        focusMode: ['manual', 'continuous', 'single-shot'],
        exposureMode: ['manual', 'continuous'],
        whiteBalanceMode: ['manual', 'continuous'],
        zoom: { max: 10, min: 1 }
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([
        {
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      ]);
    });

    it('should handle desktop camera capabilities (typically no advanced modes)', () => {
      const capabilities = {
        aspectRatio: { max: 1920, min: 0.5625 },
        deviceId: 'desktop123',
        facingMode: ['user'],
        frameRate: { max: 30, min: 1 }
      };

      const result = getAdvancedConstraints(capabilities);

      expect(result).toEqual([]);
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle video element with zero dimensions', () => {
      const mockVideoElement = {
        readyState: 4,
        videoWidth: 0,
        videoHeight: 0
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => ({
          drawImage: jest.fn()
        })),
        toDataURL: jest.fn(() => 'data:image/jpeg;base64,')
      };

      global.document.createElement = jest.fn(() => mockCanvas);

      const result = captureFrame(mockVideoElement);

      expect(mockCanvas.width).toBe(0);
      expect(mockCanvas.height).toBe(0);
      expect(result).toBeTruthy();
    });

    it('should handle constraints for typical mobile front camera', () => {
      const constraints = getCameraConstraints('user');

      expect(constraints.video.facingMode).toBe('user');
      expect(constraints.video.width.ideal).toBe(1920);
      expect(constraints.video.height.ideal).toBe(1080);
    });

    it('should handle constraints for typical mobile back camera', () => {
      const constraints = getCameraConstraints('environment');

      expect(constraints.video.facingMode).toBe('environment');
      expect(constraints.video.width.ideal).toBe(1920);
      expect(constraints.video.height.ideal).toBe(1080);
    });

    it('should work with advanced constraints in typical workflow', () => {
      // Step 1: Get basic constraints
      const basicConstraints = getCameraConstraints('environment');
      
      // Step 2: Simulate getting capabilities after stream is created
      const mockCapabilities = {
        focusMode: ['manual', 'continuous'],
        exposureMode: ['continuous'],
        whiteBalanceMode: ['continuous']
      };
      
      // Step 3: Get advanced constraints
      const advancedConstraints = getAdvancedConstraints(mockCapabilities);
      
      expect(basicConstraints.video.facingMode).toBe('environment');
      expect(advancedConstraints).toEqual([
        {
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      ]);
    });
  });
});
