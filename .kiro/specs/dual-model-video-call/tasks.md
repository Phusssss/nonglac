# Implementation Plan: Dual-Model Video Call Architecture

## Overview

This implementation plan refactors the existing video call feature to separate audio and analysis into two independent AI models. The approach follows a phased migration strategy to minimize risk and ensure backward compatibility.

## Tasks

- [x] 1. Create AudioModelService
  - Create `src/services/AudioModelService.js` that wraps Gemini Live API
  - Implement connection management (connect, disconnect, reconnect)
  - Implement audio input handling (sendAudioInput for PCM data)
  - Implement text-to-speech (sendTextForSpeech)
  - Add event handlers (onAudioOutput, onTranscript, onError, onClose)
  - Configure Vietnamese voice (Kore) for TTS
  - Ensure no vision processing capabilities
  - _Requirements: 1.2, 1.3, 1.4, 1.7, 3.1_

- [ ]* 1.1 Write property test for AudioModelService isolation
  - **Property 1: Audio Model Isolation**
  - **Validates: Requirements 3.1**
  - Test that Audio Model only accepts audio/text data, never images
  - Use fast-check to generate random request types
  - Verify Audio Model rejects image data

- [ ]* 1.2 Write unit tests for AudioModelService
  - Test connection to Gemini Live API
  - Test PCM audio data sending
  - Test text-to-speech conversion
  - Test error handling and reconnection
  - Test event callbacks
  - _Requirements: 1.2, 1.3, 1.4, 1.7_

- [x] 2. Create AnalysisModelService
  - Create `src/services/AnalysisModelService.js` that wraps Gemini API
  - Implement initialization (initialize method)
  - Implement image analysis (analyzeImage with vision)
  - Implement text reasoning (processText)
  - Implement tool execution (executeTool)
  - Define tool schemas (lookup_price, diagnose_disease, find_agri_store)
  - Ensure no audio streaming capabilities
  - _Requirements: 2.4, 2.5, 2.6, 3.2_

- [ ]* 2.1 Write property test for AnalysisModelService isolation
  - **Property 2: Analysis Model Isolation**
  - **Validates: Requirements 3.2**
  - Test that Analysis Model only accepts image/text data, never audio streams
  - Use fast-check to generate random request types
  - Verify Analysis Model rejects audio stream data

- [ ]* 2.2 Write property test for image classification accuracy
  - **Property 5: Image Classification Accuracy**
  - **Validates: Requirements 2.5**
  - Test with known images of people, plants, and objects
  - Verify classification accuracy >95%
  - Use multiple test images per category

- [ ]* 2.3 Write unit tests for AnalysisModelService
  - Test image analysis with vision
  - Test text reasoning
  - Test tool call execution (all three tools)
  - Test error handling
  - _Requirements: 2.4, 2.5, 2.6_

- [x] 3. Create OrchestratorService
  - Create `src/services/OrchestratorService.js` as main coordinator
  - Implement session lifecycle (startSession, stopSession)
  - Implement voice interaction flow (handleVoiceInput)
  - Implement image capture flow (handleImageCapture)
  - Implement tool call flow (handleToolCall)
  - Implement routing logic (determineTargetModel)
  - Implement error handling with fallback to simulation mode
  - Manage callbacks (onStatusChange, onMessage, onError, onAudioOutput)
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write property test for orchestrator routing
  - **Property 6: Orchestrator Routing Correctness**
  - **Validates: Requirements 3.3**
  - Test routing of audio, image, and text requests
  - Use fast-check to generate random request types
  - Verify correct model is selected for each request type

- [ ]* 3.2 Write property test for session independence
  - **Property 7: Session Independence**
  - **Validates: Requirements 3.4, 3.5**
  - Simulate errors in one model
  - Verify other model continues operating
  - Test with both audio and analysis model failures

- [ ]* 3.3 Write property test for voice interaction pipeline
  - **Property 3: Voice Interaction Pipeline Completeness**
  - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**
  - Test complete voice interaction flow
  - Verify all steps execute in correct order
  - Use mock audio data

- [ ]* 3.4 Write property test for image analysis pipeline
  - **Property 4: Image Analysis Pipeline Completeness**
  - **Validates: Requirements 2.2, 2.3, 2.4, 2.6, 2.7, 2.8**
  - Test complete image capture flow
  - Verify wait message is sent
  - Verify analysis completes and result is spoken

- [ ]* 3.5 Write unit tests for OrchestratorService
  - Test session initialization (both models start)
  - Test voice interaction flow end-to-end
  - Test image capture flow end-to-end
  - Test tool call execution
  - Test error handling for each model
  - Test fallback to simulation mode
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all service tests pass
  - Run all unit tests and property tests
  - Verify test coverage >80%
  - Fix any failing tests
  - Ask the user if questions arise

- [x] 5. Create useVideoCallV2 hook
  - Create `src/hooks/useVideoCallV2.js` using OrchestratorService
  - Replace VideoCallService with OrchestratorService
  - Maintain same interface as existing useVideoCall
  - Implement startSession using orchestrator
  - Implement captureAndAnalyze using orchestrator
  - Implement toggleMic functionality
  - Handle callbacks (onStatusChange, onMessage, onError, onAudioOutput)
  - Maintain backward compatibility with existing components
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ]* 5.1 Write integration tests for useVideoCallV2
  - Test complete voice interaction flow
  - Test complete image capture flow
  - Test error handling and recovery
  - Test simulation mode fallback
  - _Requirements: 1.1, 2.1_

- [x] 6. Add feature flag for gradual rollout
  - Create feature flag `USE_DUAL_MODEL_VIDEO_CALL` in environment config
  - Add flag check in VideoCallContainer component
  - Implement conditional hook selection (useVideoCall vs useVideoCallV2)
  - Add logging for which implementation is active
  - Default to old implementation (flag = false)
  - _Requirements: Migration Phase 2_

- [x] 7. Update VideoCallContainer component
  - Modify `src/components/video-call/VideoCallContainer.jsx`
  - Add feature flag check to select hook implementation
  - Ensure UI controls work with both implementations
  - Add error boundary for new implementation
  - Maintain fallback to old implementation on errors
  - Test Mic button functionality
  - Test Capture button functionality
  - _Requirements: 1.1, 2.1_

- [ ]* 7.1 Write component tests for VideoCallContainer
  - Test rendering with new implementation
  - Test Mic button interaction
  - Test Capture button interaction
  - Test error handling and fallback
  - _Requirements: 1.1, 2.1_

- [x] 8. Checkpoint - Integration testing
  - Test voice interaction end-to-end with real API
  - Test image capture end-to-end with real API
  - Test tool calls (price lookup, diagnosis, store finder)
  - Verify Vietnamese voice (Kore) is used
  - Verify image classification accuracy
  - Test error scenarios (network failures, API errors)
  - Ensure all tests pass, ask the user if questions arise

- [ ] 9. Add monitoring and logging
  - Add structured logging to OrchestratorService
  - Log model routing decisions
  - Log latency metrics (voice interaction, image analysis)
  - Log accuracy metrics (classification results)
  - Log error rates per model
  - Add Sentry error tracking for new services
  - _Requirements: Monitoring section_

- [ ] 10. Update documentation
  - Update README with new architecture diagram
  - Document feature flag usage
  - Document migration plan
  - Add troubleshooting guide
  - Update API documentation
  - _Requirements: Documentation_

- [ ] 11. Performance optimization
  - Implement audio buffering in AudioModelService
  - Optimize image compression (quality 0.98)
  - Add request batching where applicable
  - Implement connection pooling
  - Monitor memory usage in long sessions
  - _Requirements: Performance section_

- [ ]* 11.1 Write property test for image quality
  - **Property 9: High-Quality Image Capture**
  - **Validates: Requirements 2.2**
  - Test that all captured images have quality 0.98
  - Use fast-check to generate random video dimensions
  - Verify image format is JPEG

- [ ] 12. Security hardening
  - Validate audio format and size limits
  - Validate image format and size limits (max 10MB)
  - Sanitize text inputs
  - Implement rate limiting per user
  - Add API key rotation support
  - _Requirements: Security section_

- [ ] 13. Final checkpoint - Production readiness
  - Run full test suite (unit + property + integration)
  - Verify all acceptance criteria are met
  - Test with real users (UAT)
  - Monitor error rates and latency
  - Verify rollback plan is ready
  - Ensure all tests pass, ask the user if questions arise

- [ ] 14. Gradual rollout
  - Enable feature flag for 10% of users
  - Monitor metrics (accuracy, latency, errors)
  - Increase to 50% if metrics are good
  - Increase to 100% after validation
  - _Requirements: Migration Phase 3_

- [ ] 15. Cleanup old implementation
  - Remove old VideoCallService.js (after 2 release cycles)
  - Rename useVideoCallV2.js to useVideoCall.js
  - Remove feature flag code
  - Update all references
  - Archive old implementation for reference
  - _Requirements: Migration Phase 4_

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Feature flag enables safe gradual rollout with easy rollback
- Old implementation remains available during migration for safety

## Testing Configuration

**Property-Based Testing**
- Framework: fast-check (JavaScript)
- Minimum iterations: 100 per property test
- Each test must reference design document property number
- Tag format: `Feature: dual-model-video-call, Property {N}: {description}`

**Unit Testing**
- Framework: Jest + React Testing Library
- Coverage target: >80%
- Focus on specific examples, edge cases, error conditions

**Integration Testing**
- Test complete user flows end-to-end
- Use real API in staging environment
- Verify latency and accuracy metrics

## Success Criteria

- [ ] All property tests pass (100+ iterations each)
- [ ] All unit tests pass (>80% coverage)
- [ ] Voice interaction latency < 2 seconds
- [ ] Image analysis latency < 5 seconds
- [ ] Image classification accuracy > 95%
- [ ] Error rate < 1% per model
- [ ] Successful gradual rollout to 100% users
- [ ] Zero critical bugs in production
