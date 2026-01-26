/**
 * VideoFileValidator Component Tests
 * 
 * Unit tests for the VideoFileValidator component covering:
 * - File format validation
 * - File size validation  
 * - MIME type verification
 * - Filename sanitization
 * - Utility functions
 */

import { validateVideoFileOnly } from '../VideoFileValidator';

// Mock the video validation utilities
jest.mock('../../../utils/videoValidation', () => ({
  validateVideoFile: jest.fn(),
  sanitizeFilename: jest.fn(),
  getFileExtension: jest.fn(),
  validateFormatConsistency: jest.fn(),
  isFileSizeValid: jest.fn()
}));

const {
  validateVideoFile,
  sanitizeFilename,
  getFileExtension,
  validateFormatConsistency,
  isFileSizeValid
} = require('../../../utils/videoValidation');

describe('VideoFileValidator Component', () => {
  // Helper function to create mock video files
  const createMockVideoFile = (name, size, type) => {
    return new File(['mock video content'], name, { 
      type: type || 'video/mp4',
      size: size || 1024 * 1024 // 1MB default
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    validateVideoFile.mockResolvedValue({
      isValid: true,
      errors: [],
      fileInfo: {
        format: 'mp4',
        duration: 30,
        resolution: { width: 1920, height: 1080 },
        bitrate: 1000
      }
    });
    
    sanitizeFilename.mockImplementation(name => {
      if (!name) return 'untitled';
      return name.toLowerCase().replace(/[^a-z0-9.]/g, '_');
    });
    getFileExtension.mockImplementation(name => name.split('.').pop());
    validateFormatConsistency.mockReturnValue(true);
    isFileSizeValid.mockReturnValue(true);
  });

  describe('File Format Validation', () => {
    test('should validate supported video formats', async () => {
      const supportedFormats = [
        { ext: 'mp4', mime: 'video/mp4' },
        { ext: 'mov', mime: 'video/quicktime' },
        { ext: 'avi', mime: 'video/x-msvideo' },
        { ext: 'wmv', mime: 'video/x-ms-wmv' },
        { ext: 'mkv', mime: 'video/x-matroska' }
      ];

      for (const format of supportedFormats) {
        const file = createMockVideoFile(`test.${format.ext}`, 1024 * 1024, format.mime);
        const result = await validateVideoFileOnly(file);
        
        expect(validateVideoFile).toHaveBeenCalledWith(file, expect.any(Object));
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('sanitizedFilename');
      }
    });

    test('should reject invalid file format', async () => {
      validateVideoFile.mockResolvedValue({
        isValid: false,
        errors: [{
          field: 'format',
          message: 'Định dạng file không được hỗ trợ',
          code: 'INVALID_FORMAT'
        }]
      });

      const file = createMockVideoFile('test.txt', 1024, 'text/plain');
      const result = await validateVideoFileOnly(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
    });
  });

  describe('File Size Validation', () => {
    test('should accept file within size limit', async () => {
      const file = createMockVideoFile('test.mp4', 50 * 1024 * 1024); // 50MB
      const result = await validateVideoFileOnly(file);
      
      expect(result.isValid).toBe(true);
    });

    test('should reject file exceeding size limit', async () => {
      validateVideoFile.mockResolvedValue({
        isValid: false,
        errors: [{
          field: 'fileSize',
          message: 'File quá lớn. Kích thước tối đa: 100MB',
          code: 'FILE_TOO_LARGE'
        }]
      });

      const file = createMockVideoFile('test.mp4', 150 * 1024 * 1024); // 150MB
      const result = await validateVideoFileOnly(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('FILE_TOO_LARGE');
    });

    test('should handle exactly 100MB file', async () => {
      const file = createMockVideoFile('test.mp4', 100 * 1024 * 1024); // Exactly 100MB
      const result = await validateVideoFileOnly(file);
      
      expect(validateVideoFile).toHaveBeenCalledWith(file, expect.any(Object));
    });
  });

  describe('MIME Type Verification', () => {
    test('should validate MIME type consistency', async () => {
      const file = createMockVideoFile('test.mp4', 1024 * 1024, 'video/mp4');
      await validateVideoFileOnly(file);
      
      expect(validateVideoFile).toHaveBeenCalledWith(file, expect.any(Object));
    });

    test('should reject MIME type mismatch', async () => {
      validateVideoFile.mockResolvedValue({
        isValid: false,
        errors: [{
          field: 'mimeType',
          message: 'Loại file không khớp với phần mở rộng',
          code: 'MIME_TYPE_MISMATCH'
        }]
      });

      const file = createMockVideoFile('test.mp4', 1024 * 1024, 'video/avi');
      const result = await validateVideoFileOnly(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MIME_TYPE_MISMATCH');
    });
  });

  describe('Filename Sanitization', () => {
    test('should sanitize filename with special characters', async () => {
      sanitizeFilename.mockReturnValue('test_video_file.mp4');
      
      const file = createMockVideoFile('test video file!@#.mp4', 1024 * 1024);
      const result = await validateVideoFileOnly(file);
      
      expect(sanitizeFilename).toHaveBeenCalledWith('test video file!@#.mp4');
      expect(result.sanitizedFilename).toBe('test_video_file.mp4');
    });

    test('should handle empty filename', async () => {
      sanitizeFilename.mockReturnValue('untitled.mp4');
      
      const file = createMockVideoFile('', 1024 * 1024);
      const result = await validateVideoFileOnly(file);
      
      expect(sanitizeFilename).toHaveBeenCalledWith('');
      expect(result.sanitizedFilename).toBe('untitled.mp4');
    });

    test('should handle very long filename', async () => {
      const longName = 'a'.repeat(200) + '.mp4';
      sanitizeFilename.mockReturnValue('a'.repeat(96) + '.mp4'); // Truncated to 100 chars
      
      const file = createMockVideoFile(longName, 1024 * 1024);
      const result = await validateVideoFileOnly(file);
      
      expect(sanitizeFilename).toHaveBeenCalledWith(longName);
      expect(result.sanitizedFilename).toBe('a'.repeat(96) + '.mp4');
    });
  });

  describe('Error Handling', () => {
    test('should handle validation errors gracefully', async () => {
      validateVideoFile.mockRejectedValue(new Error('Validation failed'));
      
      const file = createMockVideoFile('test.mp4', 1024 * 1024);
      const result = await validateVideoFileOnly(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });

    test('should handle missing file', async () => {
      const result = await validateVideoFileOnly(null);
      
      expect(result).toBeNull();
    });
  });
});

describe('validateVideoFileOnly utility', () => {
  test('should validate file without UI', async () => {
    // Reset mocks to ensure clean state
    validateVideoFile.mockResolvedValue({
      isValid: true,
      errors: [],
      fileInfo: {
        format: 'mp4',
        duration: 30,
        resolution: { width: 1920, height: 1080 },
        bitrate: 1000
      }
    });
    
    sanitizeFilename.mockReturnValue('test.mp4');
    
    const file = createMockVideoFile('test.mp4', 1024 * 1024);
    
    const result = await validateVideoFileOnly(file);
    
    expect(result).toHaveProperty('isValid', true);
    expect(result).toHaveProperty('sanitizedFilename', 'test.mp4');
    expect(result).toHaveProperty('originalFilename', 'test.mp4');
    expect(sanitizeFilename).toHaveBeenCalledWith('test.mp4');
  });

  test('should handle validation errors', async () => {
    validateVideoFile.mockRejectedValue(new Error('Test error'));
    
    const file = createMockVideoFile('test.mp4', 1024 * 1024);
    
    const result = await validateVideoFileOnly(file);
    
    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('VALIDATION_ERROR');
  });

  test('should return null for null file', async () => {
    const result = await validateVideoFileOnly(null);
    expect(result).toBeNull();
  });
});

// Helper function for creating mock video files in tests
const createMockVideoFile = (name, size, type) => {
  return new File(['mock video content'], name, { 
    type: type || 'video/mp4',
    size: size || 1024 * 1024
  });
};

export { createMockVideoFile };