/**
 * Property-Based Tests for Video Validation
 * 
 * This file contains property-based tests using fast-check to validate
 * the video upload system's correctness properties as defined in the design document.
 */

const fc = require('fast-check');
const {
  validateVideoFile,
  getFileExtension,
  sanitizeFilename,
  generateUniqueFilename,
  validateFormatConsistency,
  isFileSizeValid,
  isDurationValid
} = require('../videoValidation.ts');

const { 
  DEFAULT_VIDEO_VALIDATION,
  SUPPORTED_VIDEO_MIME_TYPES,
  VIDEO_FORMAT_MIME_MAP
} = require('../../types/video.ts');

// Test utilities for creating mock files
const createMockFile = (name, type, size, content = 'mock video content') => {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
};

// Generators for property-based testing
const supportedExtensions = Object.keys(VIDEO_FORMAT_MIME_MAP);
const unsupportedExtensions = ['txt', 'jpg', 'png', 'pdf', 'doc'];
const validMimeTypes = Object.values(VIDEO_FORMAT_MIME_MAP);
const invalidMimeTypes = ['text/plain', 'image/jpeg', 'application/pdf'];

describe('Video Validation Property-Based Tests', () => {
  
  // Feature: video-upload-feature, Property 1: File Format Validation
  // For any uploaded file, the Video_Upload_System should accept the file if and only if 
  // it has both a supported extension (MP4, MOV, AVI, WMV, MKV) and matching MIME type
  // **Validates: Requirements 1.1, 5.1, 5.2**
  test('Property 1: File Format Validation', () => {
    fc.assert(fc.property(
      fc.record({
        extension: fc.oneof(
          fc.constantFrom(...supportedExtensions),
          fc.constantFrom(...unsupportedExtensions)
        ),
        mimeType: fc.oneof(
          fc.constantFrom(...validMimeTypes),
          fc.constantFrom(...invalidMimeTypes)
        ),
        size: fc.integer({ min: 1, max: 50 * 1024 * 1024 }) // Valid size range
      }),
      async (fileData) => {
        const fileName = `test.${fileData.extension}`;
        const mockFile = createMockFile(fileName, fileData.mimeType, fileData.size);
        
        const isValidExtension = supportedExtensions.includes(fileData.extension);
        const isValidMimeType = validMimeTypes.includes(fileData.mimeType);
        const isConsistentFormat = VIDEO_FORMAT_MIME_MAP[fileData.extension] === fileData.mimeType;
        
        // File should be accepted if and only if it has both valid extension and matching MIME type
        const shouldAccept = isValidExtension && isValidMimeType && isConsistentFormat;
        
        const result = await validateVideoFile(mockFile);
        
        // Check if validation result matches expected acceptance
        const hasFormatErrors = result.errors.some(error => 
          ['INVALID_FORMAT', 'MIME_TYPE_MISMATCH', 'UNSUPPORTED_MIME_TYPE'].includes(error.code)
        );
        
        if (shouldAccept) {
          expect(hasFormatErrors).toBe(false);
        } else {
          expect(hasFormatErrors).toBe(true);
        }
      }
    ), { numRuns: 50 }); // Reduced runs for faster testing
  });

  // Feature: video-upload-feature, Property 2: File Size Validation
  // For any uploaded video file, the File_Validator should reject files exceeding 100MB 
  // and accept files within the limit
  // **Validates: Requirements 1.2**
  test('Property 2: File Size Validation', () => {
    fc.assert(fc.property(
      fc.record({
        size: fc.integer({ min: 0, max: 200 * 1024 * 1024 }),
        extension: fc.constantFrom(...supportedExtensions)
      }),
      async (fileData) => {
        const fileName = `test.${fileData.extension}`;
        const mimeType = VIDEO_FORMAT_MIME_MAP[fileData.extension];
        const mockFile = createMockFile(fileName, mimeType, fileData.size);
        
        const maxSize = DEFAULT_VIDEO_VALIDATION.maxSize;
        const shouldAccept = fileData.size <= maxSize;
        
        const result = await validateVideoFile(mockFile);
        const hasSizeError = result.errors.some(error => error.code === 'FILE_TOO_LARGE');
        
        if (shouldAccept) {
          expect(hasSizeError).toBe(false);
        } else {
          expect(hasSizeError).toBe(true);
        }
      }
    ), { numRuns: 50 });
  });

  // Feature: video-upload-feature, Property 16: Filename Sanitization
  // For any uploaded file, the Video_Upload_System should sanitize the filename 
  // to remove potentially dangerous characters
  // **Validates: Requirements 5.4**
  test('Property 16: Filename Sanitization', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 200 }),
      (originalFilename) => {
        const sanitized = sanitizeFilename(originalFilename);
        
        // Sanitized filename should not contain dangerous characters
        const dangerousChars = /[<>:"/\\|?*]/;
        expect(dangerousChars.test(sanitized)).toBe(false);
        
        // Should not contain multiple consecutive underscores
        expect(sanitized.includes('__')).toBe(false);
        
        // Should not start or end with underscores
        expect(sanitized.startsWith('_')).toBe(false);
        expect(sanitized.endsWith('_')).toBe(false);
        
        // Should be lowercase
        expect(sanitized).toBe(sanitized.toLowerCase());
        
        // Should not exceed 100 characters
        expect(sanitized.length).toBeLessThanOrEqual(100);
      }
    ), { numRuns: 50 });
  });

  // Feature: video-upload-feature, Property 6: Unique Filename Generation
  // For any video upload, the Video_Upload_System should generate a unique filename 
  // that doesn't conflict with existing files
  // **Validates: Requirements 2.1, 5.5**
  test('Property 6: Unique Filename Generation', () => {
    fc.assert(fc.property(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 50 }),
        userId: fc.string({ minLength: 1, maxLength: 20 }),
        extension: fc.constantFrom(...supportedExtensions)
      }),
      (data) => {
        const originalFilename = `${data.filename}.${data.extension}`;
        
        // Generate multiple filenames for the same input
        const filename1 = generateUniqueFilename(originalFilename, data.userId);
        const filename2 = generateUniqueFilename(originalFilename, data.userId);
        
        // Filenames should be different (unique)
        expect(filename1).not.toBe(filename2);
        
        // Both should follow the expected pattern
        const expectedPattern = new RegExp(`^videos/user-${data.userId}/\\d+_.*\\.${data.extension}$`);
        expect(expectedPattern.test(filename1)).toBe(true);
        expect(expectedPattern.test(filename2)).toBe(true);
        
        // Should contain timestamp and random suffix
        expect(filename1).toMatch(/\d+_.*_[a-z0-9]{6}\./);
        expect(filename2).toMatch(/\d+_.*_[a-z0-9]{6}\./);
      }
    ), { numRuns: 50 });
  });

  // Test helper functions with property-based testing
  describe('Helper Function Properties', () => {
    
    test('getFileExtension should correctly extract extensions', () => {
      fc.assert(fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          extension: fc.string({ minLength: 1, maxLength: 10 })
        }),
        (data) => {
          const filename = `${data.name}.${data.extension}`;
          const extracted = getFileExtension(filename);
          expect(extracted).toBe(data.extension);
        }
      ), { numRuns: 25 });
    });

    test('isFileSizeValid should correctly validate file sizes', () => {
      fc.assert(fc.property(
        fc.record({
          fileSize: fc.integer({ min: 0, max: 200 * 1024 * 1024 }),
          maxSize: fc.integer({ min: 1, max: 150 * 1024 * 1024 })
        }),
        (data) => {
          const mockFile = { size: data.fileSize };
          const result = isFileSizeValid(mockFile, data.maxSize);
          const expected = data.fileSize <= data.maxSize;
          expect(result).toBe(expected);
        }
      ), { numRuns: 25 });
    });

    test('isDurationValid should correctly validate durations', () => {
      fc.assert(fc.property(
        fc.record({
          duration: fc.float({ min: 0, max: 1200 }),
          minDuration: fc.option(fc.float({ min: 0, max: 60 })),
          maxDuration: fc.option(fc.float({ min: 60, max: 1200 }))
        }),
        (data) => {
          const result = isDurationValid(data.duration, data.minDuration, data.maxDuration);
          
          let expected = true;
          if (data.minDuration && data.duration < data.minDuration) expected = false;
          if (data.maxDuration && data.duration > data.maxDuration) expected = false;
          
          expect(result).toBe(expected);
        }
      ), { numRuns: 25 });
    });

    test('validateFormatConsistency should validate format-MIME consistency', () => {
      fc.assert(fc.property(
        fc.record({
          extension: fc.oneof(
            fc.constantFrom(...supportedExtensions),
            fc.constantFrom(...unsupportedExtensions)
          ),
          mimeType: fc.oneof(
            fc.constantFrom(...validMimeTypes),
            fc.constantFrom(...invalidMimeTypes)
          )
        }),
        (data) => {
          const filename = `test.${data.extension}`;
          const mockFile = createMockFile(filename, data.mimeType, 1024);
          
          const result = validateFormatConsistency(mockFile);
          const expected = VIDEO_FORMAT_MIME_MAP[data.extension] === data.mimeType;
          
          expect(result).toBe(expected);
        }
      ), { numRuns: 25 });
    });
  });
});

// Unit tests for specific edge cases and examples
describe('Video Validation Unit Tests', () => {
  
  test('should reject empty file', async () => {
    const emptyFile = createMockFile('test.mp4', 'video/mp4', 0);
    const result = await validateVideoFile(emptyFile);
    expect(result.isValid).toBe(false);
  });

  test('should accept valid MP4 file within size limit', async () => {
    const validFile = createMockFile('test.mp4', 'video/mp4', 50 * 1024 * 1024); // 50MB
    const result = await validateVideoFile(validFile);
    
    // Should not have format or size errors
    const hasFormatOrSizeErrors = result.errors.some(error => 
      ['INVALID_FORMAT', 'MIME_TYPE_MISMATCH', 'UNSUPPORTED_MIME_TYPE', 'FILE_TOO_LARGE'].includes(error.code)
    );
    expect(hasFormatOrSizeErrors).toBe(false);
  });

  test('should reject file exactly at 100MB + 1 byte', async () => {
    const oversizedFile = createMockFile('test.mp4', 'video/mp4', 100 * 1024 * 1024 + 1);
    const result = await validateVideoFile(oversizedFile);
    
    const hasSizeError = result.errors.some(error => error.code === 'FILE_TOO_LARGE');
    expect(hasSizeError).toBe(true);
  });

  test('should accept file exactly at 100MB', async () => {
    const maxSizeFile = createMockFile('test.mp4', 'video/mp4', 100 * 1024 * 1024);
    const result = await validateVideoFile(maxSizeFile);
    
    const hasSizeError = result.errors.some(error => error.code === 'FILE_TOO_LARGE');
    expect(hasSizeError).toBe(false);
  });

  test('should sanitize dangerous filename characters', () => {
    const dangerousFilename = '<script>alert("xss")</script>.mp4';
    const sanitized = sanitizeFilename(dangerousFilename);
    
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
    expect(sanitized).not.toContain('"');
    expect(sanitized).toContain('_');
  });

  test('should generate unique filenames for same input', () => {
    const filename = 'test.mp4';
    const userId = 'user123';
    
    const unique1 = generateUniqueFilename(filename, userId);
    const unique2 = generateUniqueFilename(filename, userId);
    
    expect(unique1).not.toBe(unique2);
    expect(unique1).toMatch(/^videos\/user-user123\/\d+_test_[a-z0-9]{6}\.mp4$/);
    expect(unique2).toMatch(/^videos\/user-user123\/\d+_test_[a-z0-9]{6}\.mp4$/);
  });
});