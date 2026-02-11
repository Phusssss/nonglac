/**
 * Browser Console Integration Tests
 * 
 * Run these tests directly in the browser console on the /ai-video-call page
 * to verify dual-model architecture functionality.
 * 
 * Usage:
 * 1. Navigate to http://localhost:3000/ai-video-call
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire file into console
 * 4. Run: await runAllIntegrationTests()
 */

// Test configuration
const TEST_CONFIG = {
  apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
  userName: 'Integration Test User',
  timeout: 10000
};

// Test results tracker
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper: Log test result
function logTest(name, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    console.error(`❌ FAIL: ${name} - ${message}`);
  }
  testResults.tests.push({ name, passed, message });
}

// Helper: Wait for condition
async function waitFor(condition, timeout = 5000) {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// ============================================================================
// TEST SUITE 1: SERVICE INITIALIZATION
// ============================================================================

async function testServiceInitialization() {
  console.log('\n📋 TEST SUITE 1: Service Initialization\n');

  try {
    // Test 1.1: Import services
    const { default: AudioModelService } = await import('../AudioModelService.js');
    const { default: AnalysisModelService } = await import('../AnalysisModelService.js');
    const { default: OrchestratorService } = await import('../OrchestratorService.js');
    
    logTest('Import services', true);

    // Test 1.2: Create AudioModelService
    const audioModel = new AudioModelService(TEST_CONFIG.apiKey);
    logTest('Create AudioModelService', audioModel !== null);

    // Test 1.3: Create AnalysisModelService
    const analysisModel = new AnalysisModelService(TEST_CONFIG.apiKey);
    logTest('Create AnalysisModelService', analysisModel !== null);

    // Test 1.4: Create OrchestratorService
    const orchestrator = new OrchestratorService(TEST_CONFIG.apiKey, TEST_CONFIG.userName);
    logTest('Create OrchestratorService', orchestrator !== null);

    // Cleanup
    audioModel.cleanup();
    analysisModel.cleanup();
    orchestrator.cleanup();

    return { AudioModelService, AnalysisModelService, OrchestratorService };
  } catch (error) {
    logTest('Service initialization', false, error.message);
    throw error;
  }
}

// ============================================================================
// TEST SUITE 2: AUDIO MODEL TESTS
// ============================================================================

async function testAudioModel(AudioModelService) {
  console.log('\n📋 TEST SUITE 2: Audio Model Tests\n');

  const audioModel = new AudioModelService(TEST_CONFIG.apiKey);

  try {
    // Test 2.1: Connect to Gemini Live
    await audioModel.connect({
      userName: TEST_CONFIG.userName,
      systemInstruction: 'Bạn là trợ lý AI thân thiện.'
    });

    await waitFor(() => audioModel.isServiceConnected(), 5000);
    logTest('Audio model connection', audioModel.isServiceConnected());

    // Test 2.2: Send text for speech
    let audioReceived = false;
    audioModel.onAudioOutput(() => {
      audioReceived = true;
    });

    audioModel.sendTextForSpeech('Xin chào');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    logTest('Text-to-speech (Vietnamese)', audioReceived, 
      audioReceived ? '' : 'No audio output received');

    // Test 2.3: Disconnect
    audioModel.disconnect();
    await new Promise(resolve => setTimeout(resolve, 500));
    logTest('Audio model disconnection', !audioModel.isServiceConnected());

  } catch (error) {
    logTest('Audio model tests', false, error.message);
  } finally {
    audioModel.cleanup();
  }
}

// ============================================================================
// TEST SUITE 3: ANALYSIS MODEL TESTS
// ============================================================================

async function testAnalysisModel(AnalysisModelService) {
  console.log('\n📋 TEST SUITE 3: Analysis Model Tests\n');

  const analysisModel = new AnalysisModelService(TEST_CONFIG.apiKey);

  try {
    // Test 3.1: Initialize model
    await analysisModel.initialize();
    logTest('Analysis model initialization', analysisModel.isServiceReady());

    // Test 3.2: Process text
    const textResult = await analysisModel.processText('Xin chào, bạn là ai?');
    logTest('Text processing', 
      textResult && textResult.length > 0,
      textResult ? '' : 'No response received');

    // Test 3.3: Analyze image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, 100, 100);
    const base64Image = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

    const imageResult = await analysisModel.analyzeImage(
      { base64: base64Image, mimeType: 'image/jpeg' },
      'Mô tả hình ảnh này'
    );
    logTest('Image analysis', 
      imageResult && imageResult.length > 0,
      imageResult ? '' : 'No analysis result');

    // Test 3.4: Execute tool - price lookup
    const priceResult = await analysisModel.executeTool({
      id: 'test-1',
      name: 'lookup_price',
      args: { product: 'lúa', region: 'Đồng bằng sông Cửu Long' }
    });
    logTest('Tool: Price lookup', 
      priceResult && priceResult.response.result.includes('giá'));

    // Test 3.5: Execute tool - disease diagnosis
    const diagnosisResult = await analysisModel.executeTool({
      id: 'test-2',
      name: 'diagnose_disease',
      args: { crop: 'lúa', symptoms: 'lá vàng' }
    });
    logTest('Tool: Disease diagnosis', 
      diagnosisResult && diagnosisResult.response.result.length > 0);

    // Test 3.6: Execute tool - store finder
    const storeResult = await analysisModel.executeTool({
      id: 'test-3',
      name: 'find_agri_store',
      args: { productType: 'phân bón', location: 'Cần Thơ' }
    });
    logTest('Tool: Store finder', 
      storeResult && storeResult.response.result.includes('phân bón'));

  } catch (error) {
    logTest('Analysis model tests', false, error.message);
  } finally {
    analysisModel.cleanup();
  }
}

// ============================================================================
// TEST SUITE 4: ORCHESTRATOR TESTS
// ============================================================================

async function testOrchestrator(OrchestratorService) {
  console.log('\n📋 TEST SUITE 4: Orchestrator Tests\n');

  const orchestrator = new OrchestratorService(TEST_CONFIG.apiKey, TEST_CONFIG.userName);

  try {
    // Test 4.1: Start session
    const messages = [];
    const statuses = [];

    await orchestrator.startSession({
      onStatusChange: (status) => statuses.push(status),
      onMessage: (message) => messages.push(message),
      onError: (error) => console.error('Orchestrator error:', error),
      onAudioOutput: () => {}
    });

    await waitFor(() => orchestrator.isActive, 5000);
    logTest('Orchestrator session start', orchestrator.isActive);

    // Test 4.2: Check both models are ready
    const sessionState = orchestrator.getSessionState();
    logTest('Audio model connected', sessionState.audioModelConnected);
    logTest('Analysis model ready', sessionState.analysisModelReady);

    // Test 4.3: Handle image capture
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 640, 480);
    const base64Image = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

    await orchestrator.handleImageCapture({
      base64: base64Image,
      mimeType: 'image/jpeg',
      quality: 0.98
    });

    await new Promise(resolve => setTimeout(resolve, 3000));
    
    logTest('Image capture flow', 
      messages.some(msg => msg.includes('Chờ')),
      'Wait message not found');

    // Test 4.4: Model routing
    const audioRequest = { type: 'audio', data: 'test' };
    const imageRequest = { type: 'image', data: 'test' };
    const textRequest = { type: 'text', data: 'test', context: 'analysis' };

    logTest('Route audio to audio model', 
      orchestrator.determineTargetModel(audioRequest) === 'audio');
    logTest('Route image to analysis model', 
      orchestrator.determineTargetModel(imageRequest) === 'analysis');
    logTest('Route text to correct model', 
      orchestrator.determineTargetModel(textRequest) === 'analysis');

    // Test 4.5: Stop session
    orchestrator.stopSession();
    await new Promise(resolve => setTimeout(resolve, 500));
    logTest('Orchestrator session stop', !orchestrator.isActive);

  } catch (error) {
    logTest('Orchestrator tests', false, error.message);
  } finally {
    orchestrator.cleanup();
  }
}

// ============================================================================
// TEST SUITE 5: ERROR HANDLING
// ============================================================================

async function testErrorHandling(OrchestratorService, AnalysisModelService) {
  console.log('\n📋 TEST SUITE 5: Error Handling\n');

  try {
    // Test 5.1: Invalid API key
    const invalidOrchestrator = new OrchestratorService('invalid-key', 'Test');
    await invalidOrchestrator.startSession({
      onStatusChange: () => {},
      onMessage: () => {},
      onError: () => {},
      onAudioOutput: () => {}
    });
    
    logTest('Invalid API key handling', invalidOrchestrator.isSimulationMode);
    invalidOrchestrator.cleanup();

    // Test 5.2: Invalid image data
    const analysisModel = new AnalysisModelService(TEST_CONFIG.apiKey);
    await analysisModel.initialize();

    try {
      await analysisModel.analyzeImage(
        { base64: 'invalid', mimeType: 'image/jpeg' },
        'Test'
      );
      logTest('Invalid image data handling', false, 'Should have thrown error');
    } catch (error) {
      logTest('Invalid image data handling', true);
    }

    analysisModel.cleanup();

  } catch (error) {
    logTest('Error handling tests', false, error.message);
  }
}

// ============================================================================
// TEST SUITE 6: PERFORMANCE
// ============================================================================

async function testPerformance(AnalysisModelService) {
  console.log('\n📋 TEST SUITE 6: Performance Tests\n');

  const analysisModel = new AnalysisModelService(TEST_CONFIG.apiKey);

  try {
    await analysisModel.initialize();

    // Test 6.1: Text processing latency
    const textStart = Date.now();
    await analysisModel.processText('Xin chào');
    const textLatency = Date.now() - textStart;
    
    logTest('Text processing latency < 2s', 
      textLatency < 2000,
      `Latency: ${textLatency}ms`);

    // Test 6.2: Image analysis latency
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 640, 480);
    const base64Image = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

    const imageStart = Date.now();
    await analysisModel.analyzeImage(
      { base64: base64Image, mimeType: 'image/jpeg' },
      'Mô tả hình ảnh'
    );
    const imageLatency = Date.now() - imageStart;
    
    logTest('Image analysis latency < 5s', 
      imageLatency < 5000,
      `Latency: ${imageLatency}ms`);

  } catch (error) {
    logTest('Performance tests', false, error.message);
  } finally {
    analysisModel.cleanup();
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllIntegrationTests() {
  console.clear();
  console.log('🚀 Starting Integration Tests for Dual-Model Video Call\n');
  console.log('=' .repeat(60));

  const startTime = Date.now();

  try {
    // Check API key
    if (!TEST_CONFIG.apiKey || TEST_CONFIG.apiKey.includes('your_')) {
      console.error('❌ No valid API key found. Please set REACT_APP_GEMINI_API_KEY');
      return;
    }

    // Run test suites
    const services = await testServiceInitialization();
    await testAudioModel(services.AudioModelService);
    await testAnalysisModel(services.AnalysisModelService);
    await testOrchestrator(services.OrchestratorService);
    await testErrorHandling(services.OrchestratorService, services.AnalysisModelService);
    await testPerformance(services.AnalysisModelService);

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY\n');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`📈 Pass Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  // Print failed tests
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`  - ${t.name}: ${t.message}`));
  }

  // Return results
  return testResults;
}

// Export for use
window.runAllIntegrationTests = runAllIntegrationTests;
window.testResults = testResults;

console.log('✅ Integration test suite loaded!');
console.log('📝 Run: await runAllIntegrationTests()');
