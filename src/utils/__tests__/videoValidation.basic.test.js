/**
 * Basic Unit Tests for Video Validation
 * 
 * These are simple unit tests to verify the video validation functionality
 * before running the more complex property-based tests.
 */

import {
  getFileExtension,
  sanitizeFilename,
  generateUniqueFilename,
  isFileSizeValid,
  isDurationValid,
  validateFormatConsistency
} from '../videoValidation.ts';

// Mock File constructor for testing
const createMockFile = (name, type, size) => {
  const blob = new Blob(['mock content'], { type });
  return new File([blob], name, { type });
};

describe('Video Validation Basic Tests', () => {
  
  describe('getFileExtension', () => {
    test('should extract file extension correctly', () => {
      expect(getFileExtension('video.mp4')).toBe('mp4');
      expect(getFileExtension('movie.MOV')).toBe('MOV');
      expect(getFileExtension('test.file.avi')).toBe('avi');
      expect(getFileExtension('noextension')).toBe('');
    });
  });

  describe('sanitizeFilename', () => {
    test('should remove dangerous characters', () => {
      const dangerous = '<script>alert("xss")</script>.mp4';
      const sanitized = sanitizeFilename(dangerous);
      
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('"');
      expect(sanitized).toContain('_');
    });

    test('should convert to lowercase', () => {
      const mixed = 'MyVideoFile.MP4';
      const sanitized = sanitizeFilename(mixed);
      expect(sanitized).toBe(sanitized.toLowerCase());
    });

    test('should limit length to 100 characters', () => {
      const longName = 'a'.repeat(150);
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(100);
    });
  });

  describe('generateUniqueFilename', () => {
    test('should generate unique filenames', () => {
      const filename1 = generateUniqueFilename('test.mp4', 'user123');
      const filename2 = generateUniqueFilename('test.mp4', 'user123');
      
      expect(filename1).not.toBe(filename2);
      expect(filename1).toMatch(/^videos\/user-user123\/\d+_test_[a-z0-9]{6}\.mp4$/);
      expect(filename2).toMatch(/^videos\/user-user123\/\d+_test_[a-z0-9]{6}\.mp4$/);
    });
  });

  describe('isFileSizeValid', () => {
    test('should validate file sizes correctly', () => {
      // Test with direct size values instead of creating large files
      const smallSize = 1024; // 1KB
      const largeSize = 200 * 1024 * 1024; // 200MB
      const maxSize = 100 * 1024 * 1024; // 100MB
      
      // Create mock files with size property
      const smallFile = { size: smallSize };
      const largeFile = { size: largeSize };
      
      expect(isFileSizeValid(smallFile, maxSize)).toBe(true); // Under 100MB limit
      expect(isFileSizeValid(largeFile, maxSize)).toBe(false); // Over 100MB limit
    });
  });

  describe('isDurationValid', () => {
    test('should validate durations correctly', () => {
      expect(isDurationValid(30)).toBe(true); // No limits
      expect(isDurationValid(30, 10, 60)).toBe(true); // Within limits
      expect(isDurationValid(5, 10, 60)).toBe(false); // Below minimum
      expect(isDurationValid(120, 10, 60)).toBe(false); // Above maximum
    });
  });

  describe('validateFormatConsistency', () => {
    test('should validate format consistency', () => {
      const consistentFile = createMockFile('test.mp4', 'video/mp4', 1024);
      const inconsistentFile = createMockFile('test.mp4', 'video/avi', 1024);
      
      expect(validateFormatConsistency(consistentFile)).toBe(true);
      expect(validateFormatConsistency(inconsistentFile)).toBe(false);
    });
  });
});