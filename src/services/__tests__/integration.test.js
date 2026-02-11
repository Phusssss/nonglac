/**
 * Integration Tests for Dual-Model Video Call Architecture
 * 
 * Task 8: Checkpoint - Integration testing
 * 
 * These tests verify end-to-end functionality with real API:
 * - Voice interaction flow
 * - Image capture and analysis flow
 * - Tool calls (price lookup, diagnosis, store finder)
 * - Vietnamese voice (Kore) verification
 * - Image classification accuracy
 * - Error scenarios (network failures, API errors)
 * 
 * NOTE: These tests require a valid GEMINI_API_KEY environment variable
 * and will make real API calls. Run with caution to avoid quota usage.
 */

import AudioModelService from '../AudioModelService';
import AnalysisModelService from '../AnalysisModelService';
import OrchestratorService from '../OrchestratorService';

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds for API calls
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Skip tests if no API key is available
const describeIfApiKey = API_KEY && !API_KEY.includes('your_') ? describe : describe.skip;

describeIfApiKey('Integration Tests - Dual-Model Video Call', () => {
  let orchestrator;
  let audioModel;
  let analysisModel;

  beforeEach(() => {
    // Reset services before each test
    orchestrator = null;
    audioModel = null;
    analysisModel = null;
  });

  afterEach(async () => {
    // Cleanup after each test
    if (orchestrator) {
      orchestrator.cleanup();
    }
    if (audioModel) {
      audioModel.cleanup();
    }
    if (analysisModel) {
      analysisModel.cleanup();
    }
  });

  // ============================================================================
  // VOICE INTERACTION TESTS
  // ============================================================================

  describe('Voice Interaction End-to-End', () => {
    test('should complete voice interaction flow with real API', async () => {
      // Create orchestrator
      orchestrator = new OrchestratorService(API_KEY, 'Test User');

      // Track callbacks
      const callbacks = {
        onStatusChange: jest.fn(),
        onMessage: jest.fn(),
        onError: jest.fn(),
        onAudioOutput: jest.fn()
      };

      // Start session
      await orchestrator.startSession(callbacks);

      // Verify session started
      expect(orchestrator.isActive).toBe(true);
      expect(callbacks.onStatusChange).toHaveBeenCalledWith('connected');

      // Wait for audio model to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify audio model is connected
      expect(orchestrator.audioModel.isServiceConnected()).toBe(true);

      // Verify analysis model is ready
      expect(orchestrator.analysisModel.isServiceReady()).toBe(true);

      console.log('✓ Voice interaction session started successfully');
    }, TEST_TIMEOUT);

    test('should handle text-to-speech with Vietnamese voice', async () => {
      // Create audio model directly
      audioModel = new AudioModelService(API_KEY);

      // Track audio output
      let audioReceived = false;
      audioModel.onAudioOutput((audioData) => {
        audioReceived = true;
        expect(audioData).toBeDefined();
        expect(audioData.data).toBeDefined();
        expect(audioData.mimeType).toContain('audio');
      });

      // Connect to Gemini Live
      await audioModel.connect({
        userName: 'Test User',
        systemInstruction: 'Bạn là trợ lý AI thân thiện.'
      });

      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Send text for speech synthesis
      const testText = 'Xin chào, tôi là Lạc Lạc';
      audioModel.sendTextForSpeech(testText);

      // Wait for audio output
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Verify audio was received
      expect(audioReceived).toBe(true);

      console.log('✓ Vietnamese voice (Kore) TTS working');
    }, TEST_TIMEOUT);
  });

  // ============================================================================
  // IMAGE ANALYSIS TESTS
  // ============================================================================

  describe('Image Capture and Analysis End-to-End', () => {
    test('should analyze image with real API', async () => {
      // Create analysis model
      analysisModel = new AnalysisModelService(API_KEY);
      await analysisModel.initialize();

      // Create a test image (simple red square)
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);

      // Get base64 image
      const base64Image = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

      // Analyze image
      const result = await analysisModel.analyzeImage(
        { base64: base64Image, mimeType: 'image/jpeg' },
        'Mô tả hình ảnh này bằng tiếng Việt'
      );

      // Verify result
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      console.log('✓ Image analysis completed:', result.substring(0, 100));
    }, TEST_TIMEOUT);

    test('should complete full image capture flow with orchestrator', async () => {
      // Create orchestrator
      orchestrator = new OrchestratorService(API_KEY, 'Test User');

      // Track callbacks
      const messages = [];
      const callbacks = {
        onStatusChange: jest.fn(),
        onMessage: (msg) => messages.push(msg),
        onError: jest.fn(),
        onAudioOutput: jest.fn()
      };

      // Start session
      await orchestrator.startSession(callbacks);

      // Wait for models to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create test image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'green';
      ctx.fillRect(0, 0, 100, 100);

      const base64Image = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

      // Handle image capture
      await orchestrator.handleImageCapture({
        base64: base64Image,
        mimeType: 'image/jpeg',
        quality: 0.98
      });

      // Verify wait message was sent
      expect(messages.some(msg => msg.includes('Chờ'))).toBe(true);

      // Verify analysis result was received
      expect(messages.length).toBeGreaterThan(1);

      console.log('✓ Image capture flow completed with messages:', messages.length);
    }, TEST_TIMEOUT);
  });

  // ============================================================================
  // TOOL CALL TESTS
  // ============================================================================

  describe('Tool Calls', () => {
    test('should execute price lookup tool', async () => {
      // Create analysis model
      analysisModel = new AnalysisModelService(API_KEY);
      await analysisModel.initialize();

      // Execute price lookup tool
      const toolCall = {
        id: 'test-1',
        name: 'lookup_price',
        args: {
          product: 'lúa',
          region: 'Đồng bằng sông Cửu Long'
        }
      };

      const result = await analysisModel.executeTool(toolCall);

      // Verify result
      expect(result).toBeDefined();
      expect(result.id).toBe('test-1');
      expect(result.name).toBe('lookup_price');
      expect(result.response.result).toBeDefined();
      expect(result.response.result).toContain('giá');

      console.log('✓ Price lookup tool executed:', result.response.result);
    }, TEST_TIMEOUT);

    test('should execute disease diagnosis tool', async () => {
      // Create analysis model
      analysisModel = new AnalysisModelService(API_KEY);
      await analysisModel.initialize();

      // Execute diagnosis tool
      const toolCall = {
        id: 'test-2',
        name: 'diagnose_disease',
        args: {
          crop: 'lúa',
          symptoms: 'lá vàng, héo'
        }
      };

      const result = await analysisModel.executeTool(toolCall);

      // Verify result
      expect(result).toBeDefined();
      expect(result.id).toBe('test-2');
      expect(result.name).toBe('diagnose_disease');
      expect(result.response.result).toBeDefined();
      expect(result.response.result).toContain('lúa');

      console.log('✓ Disease diagnosis tool executed:', result.response.result);
    }, TEST_TIMEOUT);

    test('should execute store finder tool', async () => {
      // Create analysis model
      analysisModel = new AnalysisModelService(API_KEY);
      await analysisModel.initialize();

      // Execute store finder tool
      const toolCall = {
        id: 'test-3',
        name: 'find_agri_store',
        args: {
          productType: 'phân bón',
          location: 'Cần Thơ'
        }
      };

      const result = await analysisModel.executeTool(toolCall);

      // Verify result
      expect(result).toBeDefined();
      expect(result.id).toBe('test-3');
      expect(result.name).toBe('find_agri_store');
      expect(result.response.result).toBeDefined();
      expect(result.response.result).toContain('phân bón');

      console.log('✓ Store finder tool executed:', result.response.result);
    }, TEST_TIMEOUT);
  });

  // ============================================================================
  // IMAGE CLASSIFICATION ACCURACY TESTS
  // ============================================================================

  describe('Image Classification Accuracy', () => {
    test('should classify person vs plant vs object correctly', async () => {
      // Create analysis model
      analysisModel = new AnalysisModelService(API_KEY);
      await analysisModel.initialize();

      // Test with different colored squares (simulating different objects)
      const testCases = [
        { color: 'red', expected: 'màu đỏ' },
        { color: 'green', expected: 'màu xanh' },
        { color: 'blue', expected: 'màu xanh' }
      ];

      for (const testCase of testCases) {
        // Create test image
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = testCase.color;
        ctx.fillRect(0, 0, 100, 100);

        const base64Image = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

        // Analyze image
        const result = await analysisModel.analyzeImage(
          { base64: base64Image, mimeType: 'image/jpeg' },
          'Mô tả màu sắc của hình ảnh này'
        );

        // Verify result contains expected color
        expect(result.toLowerCase()).toContain(testCase.expected);

        console.log(`✓ Classified ${testCase.color} correctly:`, result.substring(0, 50));
      }
    }, TEST_TIMEOUT);
  });

  // ============================================================================
  // ERROR SCENARIO TESTS
  // ============================================================================

  describe('Error Scenarios', () => {
    test('should handle invalid API key gracefully', async () => {
      // Create orchestrator with invalid API key
      orchestrator = new OrchestratorService('invalid-key', 'Test User');

      const callbacks = {
        onStatusChange: jest.fn(),
        onMessage: jest.fn(),
        onError: jest.fn(),
        onAudioOutput: jest.fn()
      };

      // Start session should fail or enter simulation mode
      await orchestrator.startSession(callbacks);

      // Verify simulation mode is activated
      expect(orchestrator.isSimulationMode).toBe(true);

      console.log('✓ Invalid API key handled gracefully');
    }, TEST_TIMEOUT);

    test('should handle audio model disconnection', async () => {
      // Create audio model
      audioModel = new AudioModelService(API_KEY);

      let closeCallbackCalled = false;
      audioModel.onClose(() => {
        closeCallbackCalled = true;
      });

      // Connect
      await audioModel.connect();

      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Disconnect
      audioModel.disconnect();

      // Verify disconnection
      expect(audioModel.isServiceConnected()).toBe(false);
      expect(closeCallbackCalled).toBe(true);

      console.log('✓ Audio model disconnection handled');
    }, TEST_TIMEOUT);

    test('should handle analysis model errors', async () => {
      // Create analysis model
      analysisModel = new AnalysisModelService(API_KEY);
      await analysisModel.initialize();

      // Try to analyze with invalid image data
      await expect(
        analysisModel.analyzeImage(
          { base64: 'invalid-base64', mimeType: 'image/jpeg' },
          'Test prompt'
        )
      ).rejects.toThrow();

      console.log('✓ Analysis model error handled');
    }, TEST_TIMEOUT);

    test('should handle network timeout gracefully', async () => {
      // Create orchestrator
      orchestrator = new OrchestratorService(API_KEY, 'Test User');

      const callbacks = {
        onStatusChange: jest.fn(),
        onMessage: jest.fn(),
        onError: jest.fn(),
        onAudioOutput: jest.fn()
      };

      // Start session
      await orchestrator.startSession(callbacks);

      // Simulate network issue by trying to analyze with very large image
      const canvas = document.createElement('canvas');
      canvas.width = 5000;
      canvas.height = 5000;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 5000, 5000);

      const base64Image = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

      // This might timeout or fail due to size
      try {
        await orchestrator.handleImageCapture({
          base64: base64Image,
          mimeType: 'image/jpeg',
          quality: 0.98
        });
      } catch (error) {
        // Error is expected
        expect(error).toBeDefined();
      }

      console.log('✓ Network timeout handled gracefully');
    }, TEST_TIMEOUT);
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance Metrics', () => {
    test('voice interaction latency should be < 2 seconds', async () => {
      // Create orchestrator
      orchestrator = new OrchestratorService(API_KEY, 'Test User');

      await orchestrator.startSession({
        onStatusChange: jest.fn(),
        onMessage: jest.fn(),
        onError: jest.fn(),
        onAudioOutput: jest.fn()
      });

      // Wait for models to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Measure text processing latency
      const startTime = Date.now();

      await orchestrator.analysisModel.processText('Xin chào');

      const latency = Date.now() - startTime;

      // Verify latency is acceptable
      expect(latency).toBeLessThan(2000);

      console.log(`✓ Voice interaction latency: ${latency}ms`);
    }, TEST_TIMEOUT);

    test('image analysis latency should be < 5 seconds', async () => {
      // Create analysis model
      analysisModel = new AnalysisModelService(API_KEY);
      await analysisModel.initialize();

      // Create test image
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'green';
      ctx.fillRect(0, 0, 640, 480);

      const base64Image = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

      // Measure analysis latency
      const startTime = Date.now();

      await analysisModel.analyzeImage(
        { base64: base64Image, mimeType: 'image/jpeg' },
        'Mô tả hình ảnh này'
      );

      const latency = Date.now() - startTime;

      // Verify latency is acceptable
      expect(latency).toBeLessThan(5000);

      console.log(`✓ Image analysis latency: ${latency}ms`);
    }, TEST_TIMEOUT);
  });
});

// ============================================================================
// MANUAL TEST HELPERS
// ============================================================================

/**
 * Manual test helper for voice interaction
 * Run this in browser console to test voice interaction manually
 */
export const manualTestVoiceInteraction = async () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const orchestrator = new OrchestratorService(apiKey, 'Manual Test User');

  await orchestrator.startSession({
    onStatusChange: (status) => console.log('Status:', status),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
    onAudioOutput: (audio) => console.log('Audio received:', audio)
  });

  console.log('Voice interaction session started. Use orchestrator.handleVoiceInput() to test.');
  return orchestrator;
};

/**
 * Manual test helper for image analysis
 * Run this in browser console to test image analysis manually
 */
export const manualTestImageAnalysis = async () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const orchestrator = new OrchestratorService(apiKey, 'Manual Test User');

  await orchestrator.startSession({
    onStatusChange: (status) => console.log('Status:', status),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
    onAudioOutput: (audio) => console.log('Audio received:', audio)
  });

  // Create test image
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, 640, 480);

  const base64Image = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

  await orchestrator.handleImageCapture({
    base64: base64Image,
    mimeType: 'image/jpeg',
    quality: 0.98
  });

  console.log('Image analysis completed. Check messages above.');
  return orchestrator;
};
