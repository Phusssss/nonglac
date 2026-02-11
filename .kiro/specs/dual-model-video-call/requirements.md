# Requirements: Dual-Model Video Call Architecture

## Overview
Tách biệt chức năng audio và phân tích thành 2 model riêng biệt để tối ưu độ chính xác.

## Problem Statement
Hiện tại Gemini Live API xử lý cả audio và vision trong cùng 1 session, dẫn đến:
- Nhận dạng hình ảnh không chính xác (nhầm người với cây)
- Audio và vision can thiệp lẫn nhau
- Không kiểm soát được luồng xử lý

## Proposed Solution
Tách thành 2 model độc lập:
1. **Audio Model** (Gemini Live): Chỉ xử lý audio input/output
2. **Analysis Model** (Gemini Vision/Text): Xử lý phân tích hình ảnh và text

## User Stories

### 1. Voice Interaction
**As a** nông dân  
**I want to** nói chuyện với Lạc Lạc bằng giọng nói  
**So that** tôi có thể hỏi đáp về nông nghiệp tự nhiên

**Acceptance Criteria:**
- [ ] 1.1 Có nút Mic để bật/tắt voice interaction
- [ ] 1.2 Khi bấm Mic, kết nối đến Audio Model (Gemini Live)
- [ ] 1.3 Thu âm input từ user
- [ ] 1.4 Chuyển audio thành text
- [ ] 1.5 Gửi text đến Analysis Model để xử lý
- [ ] 1.6 Nhận kết quả text từ Analysis Model
- [ ] 1.7 Chuyển text thành audio qua Audio Model
- [ ] 1.8 Phát audio cho user nghe

### 2. Image Analysis
**As a** nông dân  
**I want to** chụp ảnh cây trồng để AI phân tích  
**So that** tôi biết tình trạng cây và cách chăm sóc

**Acceptance Criteria:**
- [ ] 2.1 Có nút Capture để chụp ảnh
- [ ] 2.2 Khi bấm Capture, chụp ảnh chất lượng cao (0.98)
- [ ] 2.3 Audio Model nói "Chờ Lạc Lạc 1 xíu nhé"
- [ ] 2.4 Gửi ảnh đến Analysis Model (Gemini Vision)
- [ ] 2.5 Analysis Model phân tích chính xác (người vs cây vs vật)
- [ ] 2.6 Nhận kết quả text từ Analysis Model
- [ ] 2.7 Gửi kết quả đến Audio Model
- [ ] 2.8 Audio Model nói kết quả cho user nghe

### 3. Model Separation
**As a** developer  
**I want to** tách biệt Audio Model và Analysis Model  
**So that** mỗi model làm việc độc lập, không can thiệp lẫn nhau

**Acceptance Criteria:**
- [ ] 3.1 Audio Model chỉ xử lý audio (speech-to-text, text-to-speech)
- [ ] 3.2 Analysis Model chỉ xử lý phân tích (vision, text reasoning)
- [ ] 3.3 Có orchestrator để điều phối giữa 2 models
- [ ] 3.4 Mỗi model có session riêng, không chia sẻ context
- [ ] 3.5 Có error handling riêng cho từng model

## Architecture Flow

### Voice Interaction Flow
```
User bấm Mic
  ↓
Audio Model (Gemini Live)
  ↓ (speech-to-text)
Text Input
  ↓
Analysis Model (Gemini Text)
  ↓ (reasoning)
Text Output
  ↓
Audio Model (Gemini Live)
  ↓ (text-to-speech)
User nghe audio
```

### Image Analysis Flow
```
User bấm Capture
  ↓
Capture ảnh (quality 0.98)
  ↓
Audio Model nói "Chờ 1 xíu nhé"
  ↓
Analysis Model (Gemini Vision)
  ↓ (image analysis)
Text Result
  ↓
Audio Model (Gemini Live)
  ↓ (text-to-speech)
User nghe kết quả
```

## Technical Requirements

### Audio Model (Gemini Live)
- **Purpose**: Audio input/output only
- **API**: Gemini Live API
- **Capabilities**:
  - Speech-to-text (realtime)
  - Text-to-speech (realtime)
  - Voice: Kore (Vietnamese)
- **No Vision**: Không nhận ảnh, không phân tích

### Analysis Model (Gemini Vision/Text)
- **Purpose**: Analysis only (vision + text reasoning)
- **API**: Gemini API (standard, not Live)
- **Capabilities**:
  - Image analysis (vision)
  - Text reasoning
  - Tool calling (price lookup, diagnosis, etc.)
- **No Audio**: Không xử lý audio

### Orchestrator Service
- **Purpose**: Điều phối giữa 2 models
- **Responsibilities**:
  - Quản lý lifecycle của 2 models
  - Route requests đến đúng model
  - Transform data giữa models
  - Handle errors từ cả 2 models
  - Maintain state consistency

## UI Changes

### New Controls
1. **Mic Button** (Push-to-talk)
   - Icon: Microphone
   - States: Idle, Recording, Processing
   - Action: Bật/tắt voice interaction

2. **Capture Button** (Existing, enhanced)
   - Icon: Camera
   - States: Ready, Capturing, Analyzing
   - Action: Chụp và phân tích ảnh

### Status Indicators
- **Audio Model Status**: Connected, Speaking, Listening
- **Analysis Model Status**: Idle, Analyzing, Complete
- **Overall Status**: Ready, Processing, Error

## Data Flow

### Voice Interaction
```typescript
interface VoiceInteraction {
  // Step 1: Audio Input
  audioInput: AudioBuffer;
  
  // Step 2: Speech-to-Text (Audio Model)
  transcribedText: string;
  
  // Step 3: Analysis (Analysis Model)
  analysisRequest: {
    type: 'text';
    content: string;
  };
  
  // Step 4: Analysis Result
  analysisResult: {
    type: 'text';
    content: string;
  };
  
  // Step 5: Text-to-Speech (Audio Model)
  audioOutput: AudioBuffer;
}
```

### Image Analysis
```typescript
interface ImageAnalysis {
  // Step 1: Image Capture
  imageData: {
    base64: string;
    quality: 0.98;
    timestamp: number;
  };
  
  // Step 2: Wait Message (Audio Model)
  waitMessage: {
    text: "Chờ Lạc Lạc 1 xíu nhé";
    audio: AudioBuffer;
  };
  
  // Step 3: Analysis (Analysis Model)
  analysisRequest: {
    type: 'vision';
    image: string;
    prompt: string;
  };
  
  // Step 4: Analysis Result
  analysisResult: {
    type: 'text';
    content: string;
    confidence: number;
  };
  
  // Step 5: Result Speech (Audio Model)
  resultAudio: AudioBuffer;
}
```

## Performance Requirements

### Latency
- Voice interaction: < 2 seconds end-to-end
- Image analysis: < 5 seconds end-to-end
- Model switching: < 100ms

### Accuracy
- Image recognition: > 99% (người vs cây vs vật)
- Voice transcription: > 95%
- Text-to-speech quality: Natural, clear

### Reliability
- Model availability: 99.9%
- Error recovery: Automatic retry with fallback
- Session persistence: Maintain state across interactions

## Security & Privacy

### Data Handling
- Audio data: Không lưu trữ, chỉ streaming
- Image data: Không lưu trữ, chỉ gửi để phân tích
- Text data: Log cho debugging, không chứa PII

### API Keys
- Separate API keys cho Audio và Analysis models
- Rate limiting per model
- Cost tracking per model

## Success Metrics

### Accuracy Metrics
- Image recognition accuracy: Target 99%+
- Voice transcription accuracy: Target 95%+
- User satisfaction: Target 4.5/5 stars

### Performance Metrics
- Average response time: < 3 seconds
- Model uptime: > 99%
- Error rate: < 1%

## Out of Scope (Phase 1)
- Multi-language support (chỉ tiếng Việt)
- Offline mode
- Video streaming analysis
- Multiple concurrent users per session

## Dependencies

### External Services
- Google Gemini Live API (Audio Model)
- Google Gemini API (Analysis Model)
- Audio processing libraries (Web Audio API)

### Internal Services
- VideoCallService (existing, to be refactored)
- AudioProcessor (existing)
- MediaStream (existing)

## Migration Plan

### Phase 1: Architecture Design ✅
- Define dual-model architecture
- Create requirements document
- Design API interfaces

### Phase 2: Implementation
- Create AudioModelService
- Create AnalysisModelService
- Create OrchestratorService
- Update UI components

### Phase 3: Testing
- Unit tests for each service
- Integration tests for orchestrator
- End-to-end tests for user flows
- Performance testing

### Phase 4: Deployment
- Deploy to staging
- User acceptance testing
- Deploy to production
- Monitor metrics

## Questions & Decisions

### Q1: Có nên cache kết quả phân tích không?
**Decision**: Không cache. Mỗi lần phân tích là độc lập để đảm bảo chính xác.

### Q2: Có nên cho phép voice và image cùng lúc không?
**Decision**: Không. Xử lý tuần tự để tránh conflict và đảm bảo UX rõ ràng.

### Q3: Có nên fallback về single model nếu dual model fail?
**Decision**: Có. Fallback về Gemini Live (single model) nếu Analysis Model không available.

### Q4: Có nên hiển thị transcript của voice interaction không?
**Decision**: Có (optional). Hiển thị transcript để user biết AI hiểu đúng không.

## Next Steps

1. Review requirements với team
2. Create design document
3. Create implementation tasks
4. Start development
