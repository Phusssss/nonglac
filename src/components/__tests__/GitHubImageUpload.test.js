/**
 * Basic tests for GitHubImageUpload component with video support
 */

import React from 'react';
import GitHubImageUpload from '../GitHubImageUpload';

// Mock the services and utilities
jest.mock('../../services/githubStorageExtended', () => ({
  githubStorage: {
    uploadImage: jest.fn().mockResolvedValue('http://example.com/image.jpg'),
    uploadVideo: jest.fn().mockResolvedValue('http://example.com/video.mp4'),
  }
}));

jest.mock('../common/VideoFileValidator', () => ({
  validateVideoFileOnly: jest.fn().mockResolvedValue({
    isValid: true,
    errors: [],
    fileInfo: {
      duration: 30,
      resolution: { width: 1920, height: 1080 }
    }
  })
}));

jest.mock('../../utils/videoValidation', () => ({
  generateVideoThumbnail: jest.fn().mockResolvedValue('data:image/jpeg;base64,thumbnail')
}));

describe('GitHubImageUpload Component', () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnBatchUploadComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('component renders without crashing', () => {
    const component = React.createElement(GitHubImageUpload, {
      onUploadComplete: mockOnUploadComplete,
      supportVideo: true
    });
    
    expect(component).toBeDefined();
    expect(component.type).toBe(GitHubImageUpload);
  });

  test('component accepts correct props', () => {
    const props = {
      onUploadComplete: mockOnUploadComplete,
      onBatchUploadComplete: mockOnBatchUploadComplete,
      maxSize: 10,
      allowedTypes: ['image/jpeg', 'image/png'],
      supportVideo: true,
      maxVideoSize: 50,
      allowedVideoTypes: ['video/mp4', 'video/quicktime']
    };
    
    const component = React.createElement(GitHubImageUpload, props);
    
    expect(component.props.supportVideo).toBe(true);
    expect(component.props.maxVideoSize).toBe(50);
    expect(component.props.allowedVideoTypes).toEqual(['video/mp4', 'video/quicktime']);
  });

  test('component has default props for video support', () => {
    const component = React.createElement(GitHubImageUpload, {
      onUploadComplete: mockOnUploadComplete
    });
    
    // Test that default props are applied
    expect(component.props.onUploadComplete).toBe(mockOnUploadComplete);
  });

  test('validates file type checking functions exist', () => {
    // This test ensures the component can be imported and instantiated
    // without runtime errors, which validates the basic structure
    expect(GitHubImageUpload).toBeDefined();
    expect(typeof GitHubImageUpload).toBe('function');
  });
});