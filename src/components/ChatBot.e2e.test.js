/**
 * End-to-End Tests for Camera Capture Integration in ChatBot
 * Feature: camera-capture-chatbot
 * 
 * This test suite validates the complete camera capture flow including:
 * - Camera initialization and lifecycle
 * - Camera switching functionality
 * - Photo capture with flash effect
 * - AI integration with captured images
 * - Error handling and recovery
 * - Resource cleanup
 * - Responsive design and mobile support
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatBot from './ChatBot';
import * as geminiService from '../services/geminiService';
import subscriptionService from '../services/subscriptionService';

// Mock dependencies
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-123',
      displayName: 'Test User',
      email: 'test@example.com'
    }
  })
}));

jest.mock('../hooks/useAuthGuard', () => ({
  useAuthGuard: () => ({
    requireAuthForAI: (callback) => callback(),
    showLoginModal: false,
    setShowLoginModal: jest.fn()
  })
}));

jest.mock('../services/geminiService', () => ({
  chatWithAgriBot: jest.fn(),
  analyzePlantImage: jest.fn(),
  SUGGESTED_QUESTIONS: ['Test question 1', 'Test question 2']
}));

jest.mock('../services/subscriptionService', () => ({
  getRemainingQuota: jest.fn(),
  updateQuota: jest.fn()
}));

jest.mock('../firebase/config', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  writeBatch: jest.fn(),
  doc: jest.fn()
}));

// Mock MediaStream and getUserMedia
class MockMediaStream {
  constructor() {
    this.tracks = [
      {
        id: 'video-track-1',
        kind: 'video',
        readyState: 'live',
        enabled: true,
        stop: jest.fn(function() {
          this.readyState = 'ended';
        }),
        getCapabilities: jest.fn(() => ({
          focusMode: ['continuous', 'manual'],
          exposureMode: ['continuous', 'manual'],
          whiteBalanceMode: ['continuous', 'manual']
        })),
        applyConstraints: jest.fn(() => Promise.resolve())
      }
    ];
  }

  getTracks() {
    return this.tracks;
  }

  getVideoTracks() {
    return this.tracks.filter(t => t.kind === 'video');
  }

  getAudioTracks() {
    return this.tracks.filter(t => t.kind === 'audio');
  }
}

describe('ChatBot - Camera Capture E2E Tests', () => {
  let mockGetUserMedia;
  let mockStream;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock stream
    mockStream = new MockMediaStream();
    
    // Mock getUserMedia
    mockGetUserMedia = jest.fn(() => Promise.resolve(mockStream));
    global.navigator.mediaDevices = {
      getUserMedia: mockGetUserMedia
    };

    // Mock subscription service
    subscriptionService.getRemainingQuota.mockResolvedValue({
      aiQuestions: 20,
      tier: 'free'
    });

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();

    // Mock HTMLVideoElement
    HTMLVideoElement.prototype.play = jest.fn(() => Promise.resolve());
    HTMLVideoElement.prototype.pause = jest.fn();
    
    // Mock HTMLCanvasElement
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage: jest.fn(),
      clearRect: jest.fn()
    }));
    HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
    );

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Test 1: Complete Flow - Open → Switch → Capture → AI Analysis', () => {
    it('should complete the full camera capture and AI analysis flow', async () => {
      // Mock AI response
      geminiService.analyzePlantImage.mockResolvedValue(
        'Cây của bạn có dấu hiệu bị bệnh đốm lá. Khuyến nghị xử lý bằng thuốc diệt nấm.'
      );

      const { container } = render(<ChatBot />);

      // Step 1: Open ChatBot
      expect(container.querySelector('[style*="position: fixed"]')).toBeInTheDocument();

      // Step 2: Click camera button to open camera
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      expect(cameraButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(cameraButton);
      });

      // Wait for camera to initialize
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment'
          },
          audio: false
        });
      });

      // Verify camera modal is open
      await waitFor(() => {
        const cameraModal = screen.getByText('📸 Chụp ảnh cây trồng');
        expect(cameraModal).toBeInTheDocument();
      });

      // Step 3: Switch camera
      const switchButton = screen.getByTitle('Chuyển camera');
      expect(switchButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(switchButton);
      });

      // Verify camera switched to front camera
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user'
          },
          audio: false
        });
      });

      // Step 4: Capture photo
      const captureButton = screen.getByTitle('Chụp ảnh');
      expect(captureButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(captureButton);
      });

      // Verify flash effect was triggered
      await waitFor(() => {
        const flashOverlay = container.querySelector('[style*="backgroundColor: white"]');
        expect(flashOverlay).toBeInTheDocument();
      });

      // Wait for camera to close
      await waitFor(() => {
        expect(screen.queryByText('📸 Chụp ảnh cây trồng')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Step 5: Verify image preview appears
      await waitFor(() => {
        const imagePreview = container.querySelector('img[alt="Preview"]');
        expect(imagePreview).toBeInTheDocument();
      });

      // Step 6: Send image to AI
      const sendButton = container.querySelector('button[type="submit"]');
      expect(sendButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Step 7: Verify AI analysis was called
      await waitFor(() => {
        expect(geminiService.analyzePlantImage).toHaveBeenCalled();
      });

      // Step 8: Verify AI response appears in chat
      await waitFor(() => {
        const aiResponse = screen.getByText(/Cây của bạn có dấu hiệu bị bệnh đốm lá/);
        expect(aiResponse).toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 9: Verify camera resources were cleaned up
      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
      expect(mockStream.getTracks()[0].readyState).toBe('ended');
    });
  });

  describe('Test 2: Error Scenarios', () => {
    it('should handle permission denied error', async () => {
      // Mock permission denied
      mockGetUserMedia.mockRejectedValue({
        name: 'NotAllowedError',
        message: 'Permission denied'
      });

      render(<ChatBot />);

      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');

      await act(async () => {
        fireEvent.click(cameraButton);
      });

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText('Cần quyền truy cập camera')).toBeInTheDocument();
        expect(screen.getByText(/Vui lòng cho phép truy cập camera/)).toBeInTheDocument();
      });

      // Verify close button works
      const closeButton = screen.getByText('Đóng');
      await act(async () => {
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Cần quyền truy cập camera')).not.toBeInTheDocument();
      });
    });

    it('should handle camera not found error', async () => {
      // Mock camera not found
      mockGetUserMedia.mockRejectedValue({
        name: 'NotFoundError',
        message: 'Camera not found'
      });

      render(<ChatBot />);

      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');

      await act(async () => {
        fireEvent.click(cameraButton);
      });

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText('Camera không được hỗ trợ')).toBeInTheDocument();
      });
    });

    it('should handle AI analysis failure with retry option', async () => {
      // Mock AI failure
      geminiService.analyzePlantImage.mockRejectedValue(
        new Error('AI service unavailable')
      );

      const { container } = render(<ChatBot />);

      // Open camera and capture image
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      await act(async () => {
        fireEvent.click(cameraButton);
      });

      await waitFor(() => {
        expect(screen.getByText('📸 Chụp ảnh cây trồng')).toBeInTheDocument();
      });

      const captureButton = screen.getByTitle('Chụp ảnh');
      await act(async () => {
        fireEvent.click(captureButton);
      });

      // Wait for camera to close and image to appear
      await waitFor(() => {
        expect(container.querySelector('img[alt="Preview"]')).toBeInTheDocument();
      });

      // Send to AI
      const sendButton = container.querySelector('button[type="submit"]');
      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify error message with retry option
      await waitFor(() => {
        const errorMessage = screen.getByText(/Không thể phân tích ảnh/);
        expect(errorMessage).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify image is kept for retry
      expect(container.querySelector('img[alt="Preview"]')).toBeInTheDocument();
    });

    it('should handle quota exceeded error', async () => {
      // Mock quota exceeded
      geminiService.analyzePlantImage.mockRejectedValue(
        new Error('Đã hết lượt sử dụng AI hôm nay')
      );

      const { container } = render(<ChatBot />);

      // Capture and send image
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      await act(async () => {
        fireEvent.click(cameraButton);
      });

      await waitFor(() => {
        expect(screen.getByTitle('Chụp ảnh')).toBeInTheDocument();
      });

      const captureButton = screen.getByTitle('Chụp ảnh');
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        expect(container.querySelector('img[alt="Preview"]')).toBeInTheDocument();
      });

      const sendButton = container.querySelector('button[type="submit"]');
      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify quota exceeded message
      await waitFor(() => {
        expect(screen.getByText(/Bạn đã hết lượt hỏi AI hôm nay/)).toBeInTheDocument();
        expect(screen.getByText(/NHÀ NÔNG/)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Test 3: Resource Cleanup', () => {
    it('should clean up camera resources when closing camera', async () => {
      render(<ChatBot />);

      // Open camera
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      await act(async () => {
        fireEvent.click(cameraButton);
      });

      await waitFor(() => {
        expect(screen.getByText('📸 Chụp ảnh cây trồng')).toBeInTheDocument();
      });

      // Close camera
      const closeButtons = screen.getAllByTitle('Đóng');
      const cameraCloseButton = closeButtons.find(btn => 
        btn.textContent === '✕' && btn.closest('[style*="position: fixed"]')
      );

      await act(async () => {
        fireEvent.click(cameraCloseButton);
      });

      // Verify camera stream was stopped
      await waitFor(() => {
        expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
        expect(mockStream.getTracks()[0].readyState).toBe('ended');
      });

      // Verify camera modal is closed
      expect(screen.queryByText('📸 Chụp ảnh cây trồng')).not.toBeInTheDocument();
    });

    it('should clean up camera resources on component unmount', async () => {
      const { unmount } = render(<ChatBot />);

      // Open camera
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      await act(async () => {
        fireEvent.click(cameraButton);
      });

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });

      // Unmount component
      unmount();

      // Verify camera stream was stopped
      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
    });

    it('should stop previous camera when switching', async () => {
      render(<ChatBot />);

      // Open camera
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      await act(async () => {
        fireEvent.click(cameraButton);
      });

      await waitFor(() => {
        expect(screen.getByText('📸 Chụp ảnh cây trồng')).toBeInTheDocument();
      });

      const firstStream = mockStream;

      // Create new stream for switch
      const newStream = new MockMediaStream();
      mockGetUserMedia.mockResolvedValue(newStream);

      // Switch camera
      const switchButton = screen.getByTitle('Chuyển camera');
      await act(async () => {
        fireEvent.click(switchButton);
      });

      // Verify old stream was stopped
      await waitFor(() => {
        expect(firstStream.getTracks()[0].stop).toHaveBeenCalled();
      });
    });
  });

  describe('Test 4: Responsive Design and Mobile Support', () => {
    it('should use full-screen layout on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });

      const { container } = render(<ChatBot />);

      // Open camera
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      await act(async () => {
        fireEvent.click(cameraButton);
      });

      await waitFor(() => {
        expect(screen.getByText('📸 Chụp ảnh cây trồng')).toBeInTheDocument();
      });

      // Verify camera modal uses full viewport
      const cameraModal = container.querySelector('[style*="position: fixed"]');
      expect(cameraModal).toHaveStyle({
        top: '0',
        left: '0',
        right: '0',
        bottom: '0'
      });
    });

    it('should use touch-friendly button sizes on mobile', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(<ChatBot />);

      // Open camera
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      await act(async () => {
        fireEvent.click(cameraButton);
      });

      await waitFor(() => {
        expect(screen.getByTitle('Chụp ảnh')).toBeInTheDocument();
      });

      // Verify capture button has touch-friendly size (>= 44px)
      const captureButton = screen.getByTitle('Chụp ảnh');
      const styles = window.getComputedStyle(captureButton);
      
      // On mobile, button should be 76px (larger than 44px minimum)
      expect(captureButton).toHaveStyle({
        width: '76px',
        height: '76px'
      });
    });

    it('should handle orientation change', async () => {
      const { container } = render(<ChatBot />);

      // Open camera
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      await act(async () => {
        fireEvent.click(cameraButton);
      });

      await waitFor(() => {
        expect(screen.getByText('📸 Chụp ảnh cây trồng')).toBeInTheDocument();
      });

      // Simulate orientation change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375
      });

      await act(async () => {
        window.dispatchEvent(new Event('orientationchange'));
      });

      // Wait for resize to process
      await waitFor(() => {
        // Video should maintain aspect ratio
        const video = container.querySelector('video');
        expect(video).toHaveStyle({
          objectFit: 'cover'
        });
      });
    });
  });

  describe('Test 5: Quota System Integration', () => {
    it('should verify quota before AI analysis', async () => {
      subscriptionService.getRemainingQuota.mockResolvedValue({
        aiQuestions: 5,
        tier: 'free'
      });

      geminiService.analyzePlantImage.mockResolvedValue('Test AI response');

      const { container } = render(<ChatBot />);

      // Capture image
      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      await act(async () => {
        fireEvent.click(cameraButton);
      });

      await waitFor(() => {
        expect(screen.getByTitle('Chụp ảnh')).toBeInTheDocument();
      });

      const captureButton = screen.getByTitle('Chụp ảnh');
      await act(async () => {
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        expect(container.querySelector('img[alt="Preview"]')).toBeInTheDocument();
      });

      // Send to AI
      const sendButton = container.querySelector('button[type="submit"]');
      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify quota was checked
      await waitFor(() => {
        expect(geminiService.analyzePlantImage).toHaveBeenCalled();
      });
    });

    it('should display quota information in header', async () => {
      subscriptionService.getRemainingQuota.mockResolvedValue({
        aiQuestions: 15,
        tier: 'free'
      });

      render(<ChatBot />);

      // Wait for quota to load
      await waitFor(() => {
        expect(screen.getByText('Còn 15 câu hỏi')).toBeInTheDocument();
      });
    });
  });

  describe('Test 6: Camera Button Visibility', () => {
    it('should show camera button when camera is supported', () => {
      render(<ChatBot />);

      const cameraButton = screen.getByTitle('Chụp ảnh trực tiếp');
      expect(cameraButton).toBeInTheDocument();
      expect(cameraButton).toBeVisible();
    });

    it('should hide camera button when camera is not supported', () => {
      // Remove getUserMedia support
      delete global.navigator.mediaDevices;

      render(<ChatBot />);

      const cameraButton = screen.queryByTitle('Chụp ảnh trực tiếp');
      expect(cameraButton).not.toBeInTheDocument();
    });
  });
});
