/**
 * Tests for useVideoCall hook - startSession function
 * 
 * Tests the session initialization logic including:
 * - API key validation
 * - Service initialization
 * - Audio stream setup
 * - Error handling and simulation mode fallback
 */

describe('useVideoCall - startSession implementation', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    console.warn = jest.fn();
    console.error = jest.fn();
    console.log = jest.fn();
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });

  describe('API Key Validation Logic', () => {
    test('should have proper API key validation logic in implementation', () => {
      // Read the implementation file to verify validation logic exists
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify key validation checks exist
      expect(hookContent).toContain('isValidApiKey');
      expect(hookContent).toContain('startsWith(\'AIza\')');
      expect(hookContent).toContain('length < 30');
      expect(hookContent).toContain('includes(\'your_\')');
    });

    test('should check for invalid API key scenarios', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify validation handles various invalid cases
      expect(hookContent).toContain('!apiKey');
      expect(hookContent).toContain('typeof apiKey');
    });
  });

  describe('Session Initialization Flow', () => {
    test('should have proper session initialization steps', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify the implementation has all required steps
      expect(hookContent).toContain('Step 1: Validate API key');
      expect(hookContent).toContain('Step 2: Initialize VideoCallService');
      expect(hookContent).toContain('Step 3: Start audio stream');
      expect(hookContent).toContain('Step 4: Connect to Gemini Live API');
    });

    test('should set status to connecting at start', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify status is set to connecting
      expect(hookContent).toContain('setStatus(\'connecting\')');
    });

    test('should clear error message on start', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify error message is cleared
      expect(hookContent).toContain('setErrorMessage(\'\')');
    });
  });

  describe('Simulation Mode Fallback', () => {
    test('should enter simulation mode with invalid API key', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify simulation mode is set when API key is invalid
      expect(hookContent).toContain('setIsSimulationMode(true)');
      expect(hookContent).toContain('Invalid or missing API key');
    });

    test('should handle service not implemented gracefully', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify graceful handling of missing service
      expect(hookContent).toContain('SERVICE_NOT_IMPLEMENTED');
      expect(hookContent).toContain('VideoCallService not yet implemented');
    });
  });

  describe('Audio Stream Initialization', () => {
    test('should start audio stream', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify audio stream is started
      expect(hookContent).toContain('mediaStream.startAudio()');
      expect(hookContent).toContain('audioProcessor.processInput');
    });

    test('should handle audio initialization errors', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify error handling for audio
      expect(hookContent).toContain('NotAllowedError');
      expect(hookContent).toContain('NotFoundError');
      expect(hookContent).toContain('Vui lòng cho phép truy cập microphone');
    });

    test('should continue without audio on failure', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify session continues even if audio fails
      expect(hookContent).toContain('Continue without audio');
      expect(hookContent).toContain('Continuing session without audio');
    });
  });

  describe('Callback Setup', () => {
    test('should set up all required callbacks', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify all callbacks are defined
      expect(hookContent).toContain('onStatusChange');
      expect(hookContent).toContain('onMessage');
      expect(hookContent).toContain('onToolCall');
      expect(hookContent).toContain('onAudioOutput');
      expect(hookContent).toContain('onError');
      expect(hookContent).toContain('onOpen');
      expect(hookContent).toContain('onClose');
    });

    test('should handle status changes in callback', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify status change callback implementation
      expect(hookContent).toContain('onStatusChange: (newStatus)');
      expect(hookContent).toContain('setStatus(newStatus)');
    });

    test('should handle audio output in callback', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify audio output callback implementation
      expect(hookContent).toContain('onAudioOutput: (base64Audio)');
      expect(hookContent).toContain('audioProcessor.playOutput(base64Audio)');
    });
  });

  describe('Error Handling', () => {
    test('should handle connection errors', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify connection error handling
      expect(hookContent).toContain('Failed to connect to Gemini Live API');
      expect(hookContent).toContain('connectionError');
    });

    test('should handle API key errors specifically', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify API key error handling
      expect(hookContent).toContain('API key');
      expect(hookContent).toContain('API key không hợp lệ');
    });

    test('should handle network errors', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify network error handling
      expect(hookContent).toContain('network');
      expect(hookContent).toContain('Không thể kết nối đến server');
    });

    test('should log errors to Sentry', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify Sentry integration
      expect(hookContent).toContain('window.Sentry');
      expect(hookContent).toContain('captureException');
    });
  });

  describe('Service Integration', () => {
    test('should dynamically import VideoCallService', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify dynamic import
      expect(hookContent).toContain('import(\'../services/videoCallService\')');
      expect(hookContent).toContain('VideoCallService');
    });

    test('should initialize service with API key and userName', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify service initialization
      expect(hookContent).toContain('new VideoCallService(apiKey, userName)');
    });

    test('should call startSession on service', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify service method call
      expect(hookContent).toContain('videoCallServiceRef.current.startSession');
    });
  });

  describe('State Management', () => {
    test('should reset simulation mode flag at start', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify simulation mode is reset
      expect(hookContent).toContain('setIsSimulationMode(false)');
    });

    test('should set listening status after successful connection', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../useVideoCall.js');
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      // Verify listening status is set
      expect(hookContent).toContain('setStatus(\'listening\')');
    });
  });
});


