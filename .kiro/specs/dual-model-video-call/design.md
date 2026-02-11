# Design Document: Dual-Model Video Call Architecture

## Overview

This design refactors the existing video call feature to separate audio and analysis capabilities into two independent AI models. The current implementation uses Gemini Live API for both audio and vision processing in a single session, which causes accuracy issues (e.g., mistaking people for plants). The new architecture introduces:

1. **Audio Model** (Gemini Live API): Handles only speech-to-text and text-to-speech
2. **Analysis Model** (Gemini API): Handles only image recognition and text reasoning
3. **Orchestrator Service**: Coordinates communication between the two models

This separation ensures each model focuses on its specialized task, improving accuracy and maintainability.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VideoCallContainer                       │
│                    (React Component)                         │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             ▼                                ▼
┌────────────────────────┐      ┌────────────────────────────┐
│   useVideoCall Hook    │      │   useAudioProcessor Hook   │
│  (UI State & Logic)    │      │   (Audio Processing)       │
└────────────┬───────────┘      └────────────┬───────────────┘
             │                                │
             ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  OrchestratorService                         │
│              (Coordinates Both Models)                       │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             ▼                                ▼
┌────────────────────────┐      ┌────────────────────────────┐
│  AudioModelService     │      │  AnalysisModelService      │
│  (Gemini Live API)     │      │  (Gemini API)              │
│  - Speech-to-text      │      │  - Image recognition       │
│  - Text-to-speech      │      │  - Text reasoning          │
│  - Voice: Kore (VN)    │      │  - Tool calling            │
└────────────────────────┘      └────────────────────────────┘
```

### Component Responsibilities

**VideoCallContainer (React Component)**
- Renders video stream, controls, and mascot
- Manages camera and UI state
- Delegates business logic to hooks

**useVideoCall Hook**
- Manages video call lifecycle
- Coordinates with OrchestratorService
- Handles user interactions (capture, mic toggle)
- Maintains UI state (status, messages, errors)

**useAudioProcessor Hook**
- Manages Web Audio API contexts
- Processes microphone input (PCM encoding)
- Plays audio output from AI
- Provides audio visualizers

**OrchestratorService**
- Central coordinator for both models
- Routes requests to appropriate model
- Transforms data between models
- Manages session lifecycle
- Handles errors and fallbacks

**AudioModelService**
- Wraps Gemini Live API
- Handles real-time audio streaming
- Converts speech to text
- Converts text to speech (Vietnamese voice)
- No vision processing

**AnalysisModelService**
- Wraps Gemini API (standard, not Live)
- Analyzes images (vision)
- Processes text reasoning
- Executes tool calls (price lookup, diagnosis, store finder)
- No audio processing

## Components and Interfaces

### OrchestratorService

```javascript
class OrchestratorService {
  constructor(apiKey, userName) {
    this.apiKey = apiKey;
    this.userName = userName;
    this.audioModel = null;
    this.analysisModel = null;
    this.isActive = false;
    this.callbacks = {};
  }

  // Lifecycle Management
  async startSession(callbacks) {
    // Initialize both models
    // Set up event handlers
    // Connect audio model
    // Initialize analysis model
  }

  stopSession() {
    // Disconnect both models
    // Clean up resources
    // Reset state
  }

  // Voice Interaction Flow
  async handleVoiceInput(audioData) {
    // 1. Send audio to AudioModel
    // 2. AudioModel returns transcribed text
    // 3. Send text to AnalysisModel for reasoning
    // 4. AnalysisModel returns response text
    // 5. Send response text to AudioModel for TTS
    // 6. AudioModel returns audio output
  }

  // Image Analysis Flow
  async handleImageCapture(imageData) {
    // 1. Send "wait message" to AudioModel
    // 2. AudioModel speaks "Chờ Lạc Lạc 1 xíu nhé"
    // 3. Send image to AnalysisModel
    // 4. AnalysisModel returns analysis text
    // 5. Send analysis text to AudioModel for TTS
    // 6. AudioModel speaks the result
  }

  // Tool Call Flow
  async handleToolCall(toolCall) {
    // 1. AnalysisModel triggers tool call
    // 2. Execute tool (price lookup, diagnosis, etc.)
    // 3. Return result to AnalysisModel
    // 4. AnalysisModel processes result
    // 5. Send final response to AudioModel for TTS
  }

  // Error Handling
  handleError(error, source) {
    // Determine error severity
    // Attempt recovery if possible
    // Fallback to simulation mode if needed
    // Notify callbacks
  }
}
```

### AudioModelService

```javascript
class AudioModelService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.geminiLive = null;
    this.session = null;
    this.isConnected = false;
  }

  // Connection Management
  async connect(config) {
    // Initialize Gemini Live API
    // Configure for audio-only mode
    // Set voice to Kore (Vietnamese)
    // Establish WebSocket connection
  }

  disconnect() {
    // Close WebSocket
    // Clean up session
    // Reset state
  }

  // Audio Input (Speech-to-Text)
  sendAudioInput(pcmData) {
    // Send PCM audio data to Gemini Live
    // Real-time streaming
  }

  // Text Input (for TTS)
  sendTextForSpeech(text) {
    // Send text to Gemini Live
    // Request audio output
  }

  // Event Handlers
  onAudioOutput(callback) {
    // Called when Gemini returns audio
  }

  onTranscript(callback) {
    // Called when speech is transcribed
  }

  onError(callback) {
    // Called on errors
  }
}
```

### AnalysisModelService

```javascript
class AnalysisModelService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.genAI = null;
    this.model = null;
  }

  // Initialization
  async initialize() {
    // Initialize Gemini API (standard)
    // Configure model for vision + text
    // Set up tool definitions
  }

  // Image Analysis
  async analyzeImage(imageData, prompt) {
    // Send image + prompt to Gemini
    // Wait for analysis result
    // Return text response
  }

  // Text Reasoning
  async processText(text) {
    // Send text to Gemini
    // Process reasoning
    // Return response
  }

  // Tool Execution
  async executeTool(toolCall) {
    // Parse tool call
    // Execute appropriate tool
    // Return result
  }

  // Tool Definitions
  getToolDefinitions() {
    return [
      {
        name: 'lookup_price',
        description: 'Tra cứu giá nông sản',
        parameters: { product: 'string', region: 'string' }
      },
      {
        name: 'diagnose_disease',
        description: 'Chẩn đoán bệnh cây trồng',
        parameters: { crop: 'string', symptoms: 'string' }
      },
      {
        name: 'find_agri_store',
        description: 'Tìm cửa hàng nông nghiệp',
        parameters: { productType: 'string', location: 'string' }
      }
    ];
  }
}
```

### Integration with Existing Hooks

**useVideoCall Hook (Modified)**

```javascript
function useVideoCall(userName, onUsage) {
  const [status, setStatus] = useState('disconnected');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [mascotMessage, setMascotMessage] = useState('');
  
  // Replace VideoCallService with OrchestratorService
  const orchestratorRef = useRef(null);
  
  const startSession = async () => {
    const orchestrator = new OrchestratorService(apiKey, userName);
    orchestratorRef.current = orchestrator;
    
    await orchestrator.startSession({
      onStatusChange: setStatus,
      onMessage: handleMessage,
      onError: handleError,
      onAudioOutput: handleAudioOutput
    });
  };
  
  const captureAndAnalyze = async () => {
    const imageData = captureFrame(videoRef.current, 0.98);
    await orchestratorRef.current.handleImageCapture(imageData);
  };
  
  // ... rest of hook logic
}
```

## Data Models

### Audio Data Format

```typescript
interface AudioData {
  data: string;        // Base64 encoded PCM data
  mimeType: string;    // 'audio/pcm;rate=16000'
  timestamp: number;   // Capture timestamp
}
```

### Image Data Format

```typescript
interface ImageData {
  base64: string;      // Base64 encoded JPEG
  quality: number;     // 0.98 for high quality
  timestamp: number;   // Capture timestamp
  mimeType: string;    // 'image/jpeg'
}
```

### Message Format

```typescript
interface Message {
  type: 'text' | 'audio' | 'image' | 'tool_call';
  content: string | AudioData | ImageData;
  timestamp: number;
  source: 'user' | 'audio_model' | 'analysis_model';
}
```

### Tool Call Format

```typescript
interface ToolCall {
  id: string;
  name: 'lookup_price' | 'diagnose_disease' | 'find_agri_store';
  args: Record<string, any>;
}

interface ToolResponse {
  id: string;
  name: string;
  response: {
    result: string;
  };
}
```

### Session State

```typescript
interface SessionState {
  isActive: boolean;
  audioModelConnected: boolean;
  analysisModelReady: boolean;
  currentMode: 'idle' | 'listening' | 'analyzing' | 'speaking';
  lastError: Error | null;
  isSimulationMode: boolean;
}
```

## Interaction Flows

### Voice Interaction Flow

```
User speaks into microphone
  ↓
useAudioProcessor captures audio → PCM encoding
  ↓
OrchestratorService.handleVoiceInput(audioData)
  ↓
AudioModelService.sendAudioInput(audioData)
  ↓
[Gemini Live API processes audio]
  ↓
AudioModelService.onTranscript(text) → "Giá lúa hôm nay bao nhiêu?"
  ↓
OrchestratorService receives transcript
  ↓
AnalysisModelService.processText(text)
  ↓
[Gemini API processes text, may trigger tool call]
  ↓
AnalysisModelService returns response → "Giá lúa hôm nay là 6,500 đồng/kg"
  ↓
OrchestratorService receives response
  ↓
AudioModelService.sendTextForSpeech(response)
  ↓
[Gemini Live API converts to speech]
  ↓
AudioModelService.onAudioOutput(audioData)
  ↓
useAudioProcessor plays audio → User hears response
```

### Image Capture Flow

```
User clicks Capture button
  ↓
useVideoCall.captureAndAnalyze()
  ↓
Capture frame from video element (quality 0.98)
  ↓
OrchestratorService.handleImageCapture(imageData)
  ↓
AudioModelService.sendTextForSpeech("Chờ Lạc Lạc 1 xíu nhé")
  ↓
[Audio plays while analysis happens]
  ↓
AnalysisModelService.analyzeImage(imageData, prompt)
  ↓
[Gemini API analyzes image]
  ↓
AnalysisModelService returns result → "Đây là cây lúa, đang phát triển tốt..."
  ↓
OrchestratorService receives result
  ↓
AudioModelService.sendTextForSpeech(result)
  ↓
[Gemini Live API converts to speech]
  ↓
AudioModelService.onAudioOutput(audioData)
  ↓
useAudioProcessor plays audio → User hears analysis
```

### Tool Call Flow

```
User asks: "Giá cà phê hôm nay bao nhiêu?"
  ↓
[Voice interaction flow processes question]
  ↓
AnalysisModelService.processText(text)
  ↓
[Gemini API determines tool call needed]
  ↓
AnalysisModelService triggers tool call
  ↓
OrchestratorService.handleToolCall({
  name: 'lookup_price',
  args: { product: 'cà phê', region: null }
})
  ↓
Execute tool → Fetch real-time price from internet
  ↓
Return tool response → { result: "Giá cà phê: 45,000 đ/kg" }
  ↓
AnalysisModelService processes tool response
  ↓
Returns final answer → "Giá cà phê hôm nay là 45,000 đồng/kg..."
  ↓
[Continue with TTS flow]
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Audio Model Isolation
*For any* request sent to the Audio Model, the request should only contain audio data (PCM format) or text data, never image data.

**Validates: Requirements 3.1**

### Property 2: Analysis Model Isolation
*For any* request sent to the Analysis Model, the request should only contain image data or text data, never audio stream data.

**Validates: Requirements 3.2**

### Property 3: Voice Interaction Pipeline Completeness
*For any* audio input captured from the microphone, the system should complete the full pipeline: (1) capture audio, (2) send to Audio Model for transcription, (3) send transcribed text to Analysis Model, (4) receive response from Analysis Model, (5) send response to Audio Model for TTS, (6) play audio output.

**Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**

### Property 4: Image Analysis Pipeline Completeness
*For any* image captured from the video stream, the system should complete the full pipeline: (1) capture image at quality 0.98, (2) send wait message to Audio Model, (3) send image to Analysis Model, (4) receive analysis from Analysis Model, (5) send analysis to Audio Model for TTS, (6) play audio output.

**Validates: Requirements 2.2, 2.3, 2.4, 2.6, 2.7, 2.8**

### Property 5: Image Classification Accuracy
*For any* image sent to the Analysis Model, the classification should correctly distinguish between people, plants, and other objects with high accuracy (>95%).

**Validates: Requirements 2.5**

### Property 6: Orchestrator Routing Correctness
*For any* request type (audio, image, text), the orchestrator should route it to the correct model: audio data to Audio Model, image data to Analysis Model, and text data to the appropriate model based on context.

**Validates: Requirements 3.3**

### Property 7: Session Independence
*For any* error or state change in one model, the other model's session should remain unaffected and continue operating independently.

**Validates: Requirements 3.4, 3.5**

### Property 8: Tool Call Execution
*For any* tool call triggered by the Analysis Model, the orchestrator should execute the tool, return the result to the Analysis Model, and route the final response through the Audio Model for speech output.

**Validates: Requirements (implicit in tool calling flow)**

### Property 9: High-Quality Image Capture
*For any* image capture operation, the captured image should have a quality setting of 0.98 and be in JPEG format.

**Validates: Requirements 2.2**

### Property 10: Audio Model Text-to-Speech
*For any* text sent to the Audio Model for speech synthesis, the Audio Model should return audio data in the correct format (PCM, 24kHz) with Vietnamese voice (Kore).

**Validates: Requirements 1.7**

## Error Handling

### Error Categories

**Audio Model Errors**
- Connection failures (WebSocket disconnect)
- Audio processing errors (invalid PCM data)
- TTS failures (text too long, unsupported characters)
- API rate limiting

**Analysis Model Errors**
- Image processing errors (invalid format, too large)
- Vision API failures (quota exceeded, network timeout)
- Tool execution errors (external service unavailable)
- Invalid responses

**Orchestrator Errors**
- Model coordination failures (both models unavailable)
- State synchronization errors
- Routing errors (invalid message type)

### Error Handling Strategy

**Graceful Degradation**
```javascript
// If Audio Model fails, continue with text-only mode
if (audioModelError) {
  displayTextResponse(response);
  showNotification('Audio unavailable, showing text');
}

// If Analysis Model fails, fallback to Audio Model only
if (analysisModelError) {
  useAudioModelForBasicQuestions();
  disableImageCapture();
}

// If both models fail, enter simulation mode
if (audioModelError && analysisModelError) {
  enterSimulationMode();
}
```

**Retry Logic**
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

**Error Recovery**
```javascript
// Automatic reconnection for Audio Model
audioModel.onDisconnect(() => {
  setTimeout(() => {
    audioModel.reconnect();
  }, 5000);
});

// Analysis Model retry on timeout
try {
  result = await analysisModel.analyzeImage(image);
} catch (error) {
  if (error.code === 'TIMEOUT') {
    result = await retryWithBackoff(() => 
      analysisModel.analyzeImage(image)
    );
  }
}
```

**User Feedback**
- Display clear error messages in Vietnamese
- Show retry options when applicable
- Indicate which model is unavailable
- Provide fallback options (simulation mode)

### Error Logging

```javascript
// Structured error logging
function logError(error, context) {
  reportError(error, {
    component: context.component,
    action: context.action,
    model: context.model, // 'audio' | 'analysis' | 'orchestrator'
    severity: getErrorSeverity(error),
    isRetryable: isRetryableError(error),
    timestamp: Date.now()
  });
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
**Property Tests**: Verify universal properties across all inputs

Together, these approaches ensure both concrete correctness (unit tests) and general correctness (property tests).

### Unit Testing

**Component Tests**
```javascript
describe('OrchestratorService', () => {
  test('should initialize both models on startSession', async () => {
    const orchestrator = new OrchestratorService(apiKey, userName);
    await orchestrator.startSession(callbacks);
    
    expect(orchestrator.audioModel).toBeDefined();
    expect(orchestrator.analysisModel).toBeDefined();
  });
  
  test('should handle audio model connection failure', async () => {
    // Mock audio model to fail
    const orchestrator = new OrchestratorService(invalidKey, userName);
    await orchestrator.startSession(callbacks);
    
    expect(callbacks.onError).toHaveBeenCalled();
    expect(orchestrator.isSimulationMode).toBe(true);
  });
});

describe('AudioModelService', () => {
  test('should connect to Gemini Live API', async () => {
    const audioModel = new AudioModelService(apiKey);
    await audioModel.connect({ userName: 'Test' });
    
    expect(audioModel.isConnected).toBe(true);
  });
  
  test('should send PCM audio data', () => {
    const audioModel = new AudioModelService(apiKey);
    const pcmData = { data: 'base64...', mimeType: 'audio/pcm;rate=16000' };
    
    expect(() => audioModel.sendAudioInput(pcmData)).not.toThrow();
  });
});

describe('AnalysisModelService', () => {
  test('should analyze image and return text', async () => {
    const analysisModel = new AnalysisModelService(apiKey);
    await analysisModel.initialize();
    
    const result = await analysisModel.analyzeImage(imageData, prompt);
    
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
  
  test('should execute tool calls', async () => {
    const analysisModel = new AnalysisModelService(apiKey);
    const toolCall = {
      id: '123',
      name: 'lookup_price',
      args: { product: 'lúa', region: 'Đồng bằng sông Cửu Long' }
    };
    
    const result = await analysisModel.executeTool(toolCall);
    
    expect(result.id).toBe('123');
    expect(result.response.result).toContain('giá');
  });
});
```

**Integration Tests**
```javascript
describe('Voice Interaction Flow', () => {
  test('should complete full voice interaction pipeline', async () => {
    const orchestrator = new OrchestratorService(apiKey, userName);
    await orchestrator.startSession(callbacks);
    
    // Simulate voice input
    const audioData = createMockAudioData('Giá lúa hôm nay bao nhiêu?');
    await orchestrator.handleVoiceInput(audioData);
    
    // Verify callbacks were called in correct order
    expect(callbacks.onStatusChange).toHaveBeenCalledWith('listening');
    expect(callbacks.onStatusChange).toHaveBeenCalledWith('thinking');
    expect(callbacks.onMessage).toHaveBeenCalled();
    expect(callbacks.onAudioOutput).toHaveBeenCalled();
  });
});

describe('Image Capture Flow', () => {
  test('should complete full image analysis pipeline', async () => {
    const orchestrator = new OrchestratorService(apiKey, userName);
    await orchestrator.startSession(callbacks);
    
    // Simulate image capture
    const imageData = createMockImageData();
    await orchestrator.handleImageCapture(imageData);
    
    // Verify wait message was sent
    expect(callbacks.onMessage).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('Chờ') })
    );
    
    // Verify analysis result was returned
    expect(callbacks.onMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'text' })
    );
  });
});
```

### Property-Based Testing

**Configuration**: Each property test should run a minimum of 100 iterations to ensure comprehensive coverage through randomization.

**Test Framework**: Use `fast-check` for JavaScript property-based testing.

**Property Test 1: Audio Model Isolation**
```javascript
// Feature: dual-model-video-call, Property 1: Audio Model Isolation
test('Audio Model should only receive audio or text data, never images', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.record({ type: fc.constant('audio'), data: fc.string() }),
        fc.record({ type: fc.constant('text'), data: fc.string() })
      ),
      (request) => {
        const audioModel = new AudioModelService(apiKey);
        // Verify request is valid for audio model
        expect(['audio', 'text']).toContain(request.type);
        expect(request.type).not.toBe('image');
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test 2: Analysis Model Isolation**
```javascript
// Feature: dual-model-video-call, Property 2: Analysis Model Isolation
test('Analysis Model should only receive image or text data, never audio streams', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.record({ type: fc.constant('image'), data: fc.string() }),
        fc.record({ type: fc.constant('text'), data: fc.string() })
      ),
      (request) => {
        const analysisModel = new AnalysisModelService(apiKey);
        // Verify request is valid for analysis model
        expect(['image', 'text']).toContain(request.type);
        expect(request.type).not.toBe('audio');
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test 3: Orchestrator Routing**
```javascript
// Feature: dual-model-video-call, Property 6: Orchestrator Routing Correctness
test('Orchestrator should route requests to correct model', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.record({ type: fc.constant('audio'), data: fc.string() }),
        fc.record({ type: fc.constant('image'), data: fc.string() }),
        fc.record({ type: fc.constant('text'), data: fc.string(), context: fc.constant('voice') }),
        fc.record({ type: fc.constant('text'), data: fc.string(), context: fc.constant('analysis') })
      ),
      async (request) => {
        const orchestrator = new OrchestratorService(apiKey, userName);
        const routedModel = orchestrator.determineTargetModel(request);
        
        if (request.type === 'audio') {
          expect(routedModel).toBe('audio');
        } else if (request.type === 'image') {
          expect(routedModel).toBe('analysis');
        } else if (request.type === 'text') {
          // Text can go to either model depending on context
          expect(['audio', 'analysis']).toContain(routedModel);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test 4: Session Independence**
```javascript
// Feature: dual-model-video-call, Property 7: Session Independence
test('Error in one model should not affect the other model', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('audio', 'analysis'),
      fc.record({ code: fc.string(), message: fc.string() }),
      async (failingModel, error) => {
        const orchestrator = new OrchestratorService(apiKey, userName);
        await orchestrator.startSession(callbacks);
        
        // Simulate error in one model
        if (failingModel === 'audio') {
          orchestrator.audioModel.simulateError(error);
          // Analysis model should still be operational
          expect(orchestrator.analysisModel.isReady).toBe(true);
        } else {
          orchestrator.analysisModel.simulateError(error);
          // Audio model should still be operational
          expect(orchestrator.audioModel.isConnected).toBe(true);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test 5: Image Quality**
```javascript
// Feature: dual-model-video-call, Property 9: High-Quality Image Capture
test('All captured images should have quality 0.98', () => {
  fc.assert(
    fc.property(
      fc.record({
        width: fc.integer({ min: 640, max: 1920 }),
        height: fc.integer({ min: 480, max: 1080 })
      }),
      (dimensions) => {
        const videoElement = createMockVideoElement(dimensions);
        const imageData = captureFrame(videoElement, 0.98);
        
        // Verify image quality setting
        expect(imageData).toContain('quality=0.98');
        expect(imageData).toMatch(/^data:image\/jpeg/);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Manual Testing Checklist

- [ ] Voice interaction works end-to-end
- [ ] Image capture produces accurate analysis
- [ ] Tool calls execute correctly (price lookup, diagnosis, store finder)
- [ ] Error handling works for each model independently
- [ ] Simulation mode activates when API unavailable
- [ ] Vietnamese voice (Kore) is used for TTS
- [ ] Audio quality is clear and natural
- [ ] Image recognition accuracy is >95%
- [ ] UI controls respond correctly (Mic, Capture buttons)
- [ ] Camera switching works properly

### Performance Testing

- Voice interaction latency: < 2 seconds end-to-end
- Image analysis latency: < 5 seconds end-to-end
- Model switching overhead: < 100ms
- Memory usage: Monitor for leaks in long sessions
- Audio quality: No distortion or clipping

## Migration from Current Implementation

### Phase 1: Create New Services (No Breaking Changes)

1. Create `AudioModelService.js` - wraps Gemini Live for audio only
2. Create `AnalysisModelService.js` - wraps Gemini API for vision/text
3. Create `OrchestratorService.js` - coordinates both models
4. Add unit tests for each service

### Phase 2: Update Hooks (Parallel Implementation)

1. Create `useVideoCallV2.js` - new hook using OrchestratorService
2. Keep existing `useVideoCall.js` unchanged
3. Add feature flag to switch between implementations
4. Test new implementation in isolation

### Phase 3: Update Components (Gradual Rollout)

1. Update `VideoCallContainer.jsx` to use `useVideoCallV2`
2. Keep fallback to old implementation if errors occur
3. Monitor error rates and accuracy metrics
4. Gradually increase rollout percentage

### Phase 4: Cleanup (After Validation)

1. Remove old `VideoCallService.js`
2. Rename `useVideoCallV2.js` to `useVideoCall.js`
3. Remove feature flags
4. Update documentation

### Backward Compatibility

- Maintain same callback interface for components
- Keep same UI controls and interactions
- Preserve simulation mode functionality
- Ensure error messages remain user-friendly

### Data Migration

No data migration needed - this is a runtime architecture change only.

### Rollback Plan

If issues arise:
1. Disable feature flag to revert to old implementation
2. Investigate errors in new implementation
3. Fix issues and re-enable gradually
4. Keep old implementation available for 2 release cycles

## Security Considerations

### API Key Management

- Store API keys securely (environment variables)
- Never expose keys in client-side code
- Use separate keys for Audio and Analysis models
- Implement key rotation policy

### Data Privacy

- Audio data: Stream only, never persist
- Image data: Send for analysis only, don't store
- Text data: Log for debugging without PII
- User data: Follow GDPR/privacy regulations

### Rate Limiting

- Implement per-user rate limits
- Track API usage per model
- Alert on unusual usage patterns
- Implement cost controls

### Input Validation

- Validate audio format and size
- Validate image format and size (max 10MB)
- Sanitize text inputs
- Prevent injection attacks

## Performance Optimizations

### Audio Processing

- Use Web Audio API for efficient PCM encoding
- Implement audio buffering to reduce latency
- Optimize sample rate (16kHz for input, 24kHz for output)
- Use AudioWorklet for better performance (future enhancement)

### Image Processing

- Compress images before sending (quality 0.98 is optimal)
- Use canvas for efficient frame capture
- Implement image caching for repeated analysis
- Lazy load image processing libraries

### Network Optimization

- Use WebSocket for Audio Model (persistent connection)
- Use HTTP/2 for Analysis Model (multiplexing)
- Implement request batching where possible
- Add connection pooling

### Memory Management

- Clean up audio contexts when not in use
- Release video streams properly
- Implement garbage collection for old messages
- Monitor memory usage in long sessions

## Monitoring and Observability

### Metrics to Track

**Accuracy Metrics**
- Image classification accuracy (target: >95%)
- Voice transcription accuracy (target: >95%)
- Tool call success rate (target: >99%)

**Performance Metrics**
- Voice interaction latency (target: <2s)
- Image analysis latency (target: <5s)
- Model switching overhead (target: <100ms)

**Reliability Metrics**
- Audio Model uptime (target: >99%)
- Analysis Model uptime (target: >99%)
- Error rate per model (target: <1%)

**Usage Metrics**
- Voice interactions per session
- Image captures per session
- Tool calls per session
- Session duration

### Logging Strategy

```javascript
// Structured logging
logger.info('Voice interaction started', {
  userId: user.id,
  sessionId: session.id,
  model: 'audio',
  timestamp: Date.now()
});

logger.info('Image analysis completed', {
  userId: user.id,
  sessionId: session.id,
  model: 'analysis',
  latency: 3200,
  accuracy: 0.98,
  classification: 'plant',
  timestamp: Date.now()
});
```

### Alerting

- Alert on error rate > 5%
- Alert on latency > 10s
- Alert on accuracy < 90%
- Alert on API quota near limit

## Future Enhancements

### Phase 2 Features

- Multi-language support (English, Chinese)
- Offline mode with cached responses
- Video streaming analysis (real-time)
- Multiple concurrent users per session

### Advanced Features

- Custom voice training for better accuracy
- Fine-tuned vision model for specific crops
- Integration with IoT sensors
- AR overlay for plant information

### Performance Improvements

- Edge computing for faster response
- Model quantization for efficiency
- Caching layer for common queries
- CDN for static assets

## Appendix

### API References

**Gemini Live API**
- Documentation: https://ai.google.dev/gemini-api/docs/live
- Voice options: https://ai.google.dev/gemini-api/docs/models/gemini#voice
- Rate limits: https://ai.google.dev/gemini-api/docs/quota

**Gemini API (Vision)**
- Documentation: https://ai.google.dev/gemini-api/docs/vision
- Image requirements: https://ai.google.dev/gemini-api/docs/vision#image-requirements
- Best practices: https://ai.google.dev/gemini-api/docs/vision#best-practices

### Code Examples

**Creating Orchestrator**
```javascript
import OrchestratorService from './services/OrchestratorService';

const orchestrator = new OrchestratorService(apiKey, userName);

await orchestrator.startSession({
  onStatusChange: (status) => console.log('Status:', status),
  onMessage: (message) => console.log('Message:', message),
  onError: (error) => console.error('Error:', error),
  onAudioOutput: (audio) => playAudio(audio)
});
```

**Handling Voice Input**
```javascript
// Capture audio from microphone
const audioData = await captureAudio();

// Send to orchestrator
await orchestrator.handleVoiceInput(audioData);

// Orchestrator handles the rest:
// 1. Audio Model transcribes
// 2. Analysis Model processes
// 3. Audio Model speaks response
```

**Handling Image Capture**
```javascript
// Capture frame from video
const imageData = captureFrame(videoElement, 0.98);

// Send to orchestrator
await orchestrator.handleImageCapture(imageData);

// Orchestrator handles the rest:
// 1. Audio Model says "wait"
// 2. Analysis Model analyzes
// 3. Audio Model speaks result
```

### Glossary

- **Audio Model**: Gemini Live API instance handling speech-to-text and text-to-speech
- **Analysis Model**: Gemini API instance handling image recognition and text reasoning
- **Orchestrator**: Service coordinating communication between Audio and Analysis models
- **PCM**: Pulse Code Modulation, audio format for streaming
- **TTS**: Text-to-Speech conversion
- **STT**: Speech-to-Text conversion
- **Tool Call**: Function call triggered by AI to execute external actions
- **Session**: Active connection period between user and AI models
- **Simulation Mode**: Fallback mode when API is unavailable
