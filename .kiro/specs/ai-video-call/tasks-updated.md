# AI Video Call Feature - Implementation Tasks (Updated)

## Overview

This is an updated task list focusing on completing the remaining ~20% of the AI Video Call feature. Most core functionality is already implemented and working. This plan focuses on:

1. **Integration** - Connect existing components (AudioVisualizer, ErrorDisplay)
2. **Testing** - Complete unit and integration tests
3. **Polish** - UI improvements and accessibility
4. **Documentation** - Update guides and comments

**Current Status:** ~80% complete
**Estimated Time:** 4-7 days
**Priority:** High (feature is nearly production-ready)

---

## Phase 1: Complete Core Features (1-2 days)

### Task 1: Integrate AudioVisualizer Component

**Status:** ⚠️ Component exists but not integrated

- [ ] 1.1 Update VideoCallContainer to import AudioVisualizer
  - Add import statement: `import AudioVisualizer from './AudioVisualizer';`
  - _Requirements: 2.2, 2.4_

- [ ] 1.2 Expose audio analyser nodes from useVideoCall hook
  - Verify `inputAnalyserRef` and `outputAnalyserRef` exist in hook
  - Add to return statement: `inputAnalyser: inputAnalyserRef.current`
  - Add to return statement: `outputAnalyser: outputAnalyserRef.current`
  - _Requirements: 3.2_

- [ ] 1.3 Add input AudioVisualizer to VideoCallContainer JSX
  - Place after video element, before flash effect
  - Props: `analyserNode={inputAnalyser}`, `isActive={status === 'listening' || status === 'speaking'}`, `type="input"`
  - Add className: `"absolute inset-0 pointer-events-none z-10"`
  - Conditional rendering: only show when `isMicOn && inputAnalyser`
  - _Requirements: 2.2, 2.4_

- [ ] 1.4 Add output AudioVisualizer to VideoCallContainer JSX
  - Place after input visualizer
  - Props: `analyserNode={outputAnalyser}`, `isActive={status === 'speaking'}`, `type="output"`
  - Add className: `"absolute inset-0 pointer-events-none z-10"`
  - Conditional rendering: only show when `outputAnalyser` exists
  - _Requirements: 2.2, 2.4_

- [ ]* 1.5 Test audio visualizer integration
  - Start video call session
  - Verify cyan waveform appears when speaking into microphone
  - Capture image and wait for AI response
  - Verify green waveform appears when AI speaks
  - Check visualizer fades out when inactive
  - _Requirements: 2.2, 2.4_

---

### Task 2: Add ErrorDisplay Rendering

**Status:** ⚠️ Component imported but not rendered

- [ ] 2.1 Implement retry handler in VideoCallContainer
  - Add function: `const handleRetry = () => { startSession(); };`
  - Place after `handleClose` function
  - _Requirements: 2.5_

- [ ] 2.2 Add ErrorDisplay to VideoCallContainer JSX
  - Place after AI response overlay, before controls
  - Conditional rendering: `{status === 'error' && errorMessage && ...}`
  - Wrap in backdrop div: `className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"`
  - _Requirements: 2.5_

- [ ] 2.3 Configure ErrorDisplay props
  - title: `"Sự cố kết nối"`
  - message: `{errorMessage}`
  - actions array with two buttons:
    - Close: `{ label: 'Đóng', onClick: handleClose, type: 'default' }`
    - Retry: `{ label: 'Thử lại', onClick: handleRetry, type: 'primary' }`
  - _Requirements: 2.5_

- [ ]* 2.4 Test error display functionality
  - Trigger permission error (deny camera access)
  - Verify error display appears with correct message
  - Click "Đóng" button, verify video call closes
  - Trigger error again, click "Thử lại", verify retry works
  - Test with different error types (network, API, etc.)
  - _Requirements: 2.5_

---

### Task 3: Verify Audio Analyser Setup

**Status:** ⚠️ Needs verification

- [ ] 3.1 Check useVideoCall hook audio context initialization
  - Open `src/hooks/useVideoCall.js`
  - Find audio context setup code
  - Verify `inputAnalyserRef` is created: `inputAudioContext.createAnalyser()`
  - Verify `outputAnalyserRef` is created: `outputAudioContext.createAnalyser()`
  - Verify FFT size is set: `analyser.fftSize = 256`
  - _Requirements: 3.2_

- [ ] 3.2 Connect input analyser to audio pipeline
  - Find audio source creation code
  - Verify analyser is connected: `audioSource.connect(inputAnalyserRef.current)`
  - Ensure analyser is between source and destination
  - _Requirements: 3.2_

- [ ] 3.3 Connect output analyser to audio pipeline
  - Find audio playback code (in `_playAudioResponse`)
  - Verify analyser is connected to output context
  - Ensure analyser receives audio data before playback
  - _Requirements: 3.2_

- [ ]* 3.4 Test audio analyser data flow
  - Add console.log to verify analyser receives data
  - Start session, speak into microphone
  - Check console for input analyser activity
  - Trigger AI response, check output analyser activity
  - Remove console.log after verification
  - _Requirements: 3.2_

---

## Phase 2: Testing & Quality (2-3 days)

### Task 4: Complete Unit Tests - Audio Helpers

**Status:** ⚠️ Partially complete

- [ ] 4.1 Complete decode function tests
  - Create test file: `src/utils/__tests__/audioHelpers.test.js` (if not exists)
  - Test valid base64 decoding
  - Test invalid base64 handling
  - Test empty string input
  - _Requirements: 3.1_

- [ ] 4.2 Complete decodeAudioData function tests
  - Mock AudioContext
  - Test buffer creation with valid data
  - Test sample rate conversion (16kHz → 24kHz)
  - Test error handling for invalid data
  - _Requirements: 3.1_

- [ ] 4.3 Add edge case tests for createPcmBlob
  - Test with empty Float32Array
  - Test with very large arrays
  - Test with NaN values
  - Test with Infinity values
  - _Requirements: 3.1_

- [ ] 4.4 Run audio helpers test suite
  - Execute: `npm test audioHelpers.test.js`
  - Verify all tests pass
  - Check code coverage (target: >80%)
  - _Requirements: 3.1_

---

### Task 5: Add Component Tests

**Status:** ❌ Not started

- [ ] 5.1 Create AudioVisualizer test file
  - Create: `src/components/video-call/__tests__/AudioVisualizer.test.jsx`
  - Set up test utilities (React Testing Library)
  - Mock canvas context
  - Mock AnalyserNode
  - _Requirements: 2.2_

- [ ]* 5.2 Write AudioVisualizer component tests
  - Test component renders without errors
  - Test canvas is created
  - Test analyser node connection
  - Test type prop affects color (input=cyan, output=green)
  - Test isActive prop controls visibility
  - Test cleanup on unmount (cancelAnimationFrame)
  - _Requirements: 2.2_

- [ ] 5.3 Create VideoCallContainer test file
  - Create: `src/components/video-call/__tests__/VideoCallContainer.test.jsx`
  - Mock useVideoCall hook
  - Mock child components
  - _Requirements: 2.1_

- [ ]* 5.4 Write VideoCallContainer component tests
  - Test component mounts successfully
  - Test error display appears when status='error'
  - Test retry button calls startSession
  - Test close button calls onClose
  - Test audio visualizers render when analysers present
  - Test mascot shows when camera off
  - _Requirements: 2.1, 2.5_

- [ ] 5.5 Run component test suite
  - Execute: `npm test -- --testPathPattern=video-call`
  - Verify all tests pass
  - Check coverage report
  - _Requirements: 2.1, 2.2_

---

### Task 6: Add Integration Tests

**Status:** ❌ Not started

- [ ] 6.1 Create integration test file
  - Create: `src/__tests__/integration/videoCall.integration.test.js`
  - Set up test environment
  - Mock getUserMedia API
  - Mock Gemini API responses
  - _Requirements: All_

- [ ]* 6.2 Write complete video call flow test
  - Test: Start session → Camera on → Capture image → AI response → End session
  - Verify status transitions: connecting → listening → thinking → speaking → listening
  - Verify camera stream is created
  - Verify image capture works
  - Verify AI response is displayed
  - Verify cleanup on session end
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 6.3 Write error recovery flow test
  - Test: Trigger permission error → Display error → Retry → Success
  - Mock permission denial
  - Verify error display appears
  - Click retry button
  - Mock permission granted
  - Verify session starts successfully
  - _Requirements: 2.5_

- [ ]* 6.4 Write simulation mode fallback test
  - Test: Invalid API key → Fallback to simulation mode
  - Set API key to invalid value
  - Start session
  - Verify simulation mode activates
  - Verify mock responses work
  - Capture image, verify simulated analysis
  - _Requirements: 2.5_

- [ ] 6.5 Run integration test suite
  - Execute: `npm test -- --testPathPattern=integration`
  - Verify all tests pass
  - Check for flaky tests
  - _Requirements: All_

---

### Task 7: Manual Testing Across Browsers

**Status:** ⚠️ Partially complete

- [ ] 7.1 Test on Chrome Desktop (Windows/Mac)
  - Open /ai-video-call route
  - Test camera permission request
  - Test microphone permission request
  - Test camera switching (front/back)
  - Test image capture with flash effect
  - Test AI text response display
  - Test AI voice response playback
  - Test audio visualizer (input - cyan waveform)
  - Test audio visualizer (output - green waveform)
  - Test error display with retry
  - Test simulation mode
  - Document any issues
  - _Requirements: All_

- [ ] 7.2 Test on Chrome Mobile (Android)
  - Repeat all tests from 7.1
  - Test touch interactions
  - Test responsive layout
  - Test camera switching (front/back)
  - Test portrait/landscape orientation
  - Check performance (frame rate, latency)
  - Document any issues
  - _Requirements: All_

- [ ] 7.3 Test on Safari Desktop (Mac)
  - Repeat all tests from 7.1
  - Pay special attention to getUserMedia API
  - Test audio playback (Safari has restrictions)
  - Document any Safari-specific issues
  - _Requirements: All_

- [ ] 7.4 Test on Safari Mobile (iOS)
  - Repeat all tests from 7.1
  - Test camera access (iOS permissions)
  - Test audio playback (iOS restrictions)
  - Test fullscreen behavior
  - Test home button interruption
  - Document any iOS-specific issues
  - _Requirements: All_

- [ ] 7.5 Test on Edge (Windows)
  - Repeat all tests from 7.1
  - Verify compatibility
  - Document any Edge-specific issues
  - _Requirements: All_

- [ ] 7.6 Create browser compatibility matrix
  - Document test results in table format
  - List known issues per browser
  - Add workarounds if needed
  - Update README with compatibility info
  - _Requirements: 4.3_

---

## Phase 3: Polish & Optimization (1-2 days)

### Task 8: Performance Optimization

**Status:** ⚠️ Needs verification

- [ ] 8.1 Profile component render performance
  - Install React DevTools Profiler
  - Record video call session
  - Identify unnecessary re-renders
  - Add React.memo where beneficial
  - Add useMemo for expensive computations
  - Add useCallback for event handlers
  - _Requirements: 3.4_

- [ ] 8.2 Optimize audio processing
  - Review ScriptProcessor usage (deprecated)
  - Consider migrating to AudioWorklet (future enhancement)
  - Verify buffer sizes are optimal (4096)
  - Check for audio processing bottlenecks
  - _Requirements: 3.2_

- [ ] 8.3 Measure and optimize bundle size
  - Run: `npm run build`
  - Analyze bundle with webpack-bundle-analyzer
  - Check video-call chunk size
  - Verify lazy loading is working
  - Target: <500KB for video-call chunk
  - _Requirements: 3.4_

- [ ] 8.4 Performance testing
  - Test video stream frame rate (target: 30fps)
  - Measure audio latency (target: <500ms)
  - Monitor memory usage over 5-minute session
  - Check for memory leaks after session end
  - Use Chrome DevTools Performance tab
  - Document results
  - _Requirements: 3.4_

---

### Task 9: Accessibility Improvements

**Status:** ⚠️ Partially complete

- [ ] 9.1 Add ARIA labels to all interactive elements
  - Camera toggle button: `aria-label="Bật/tắt camera"`, `aria-pressed={isCameraOn}`
  - Mic toggle button: `aria-label="Bật/tắt microphone"`, `aria-pressed={isMicOn}`
  - Capture button: `aria-label="Chụp ảnh để phân tích"`, `disabled={!canCapture}`
  - Camera switch button: `aria-label="Chuyển camera trước/sau"`
  - End call button: `aria-label="Kết thúc cuộc gọi"`
  - _Requirements: 4.2_

- [ ] 9.2 Implement keyboard navigation
  - Add keyboard event listener to VideoCallContainer
  - Escape key: Close video call
  - Space key: Capture image
  - C key: Toggle camera
  - M key: Toggle microphone
  - Tab key: Navigate between controls
  - Test keyboard-only navigation
  - _Requirements: 4.2_

- [ ] 9.3 Add screen reader announcements
  - Use aria-live regions for status changes
  - Announce: "Đang kết nối..." when connecting
  - Announce: "Đang nghe..." when listening
  - Announce: "AI đang suy nghĩ..." when thinking
  - Announce: "AI đang nói..." when speaking
  - Announce error messages
  - Announce AI text responses
  - _Requirements: 4.2_

- [ ] 9.4 Test with screen reader
  - Test with NVDA (Windows)
  - Test with VoiceOver (Mac/iOS)
  - Verify all announcements are clear
  - Verify all controls are accessible
  - Document any issues
  - _Requirements: 4.2_

- [ ] 9.5 Color contrast audit
  - Check all text meets WCAG AA standards (4.5:1)
  - Check button states have sufficient contrast
  - Check error messages are readable
  - Use Chrome DevTools Lighthouse
  - Fix any contrast issues
  - _Requirements: 4.2_

---

### Task 10: ChatBot Integration

**Status:** ❌ Not started

- [ ] 10.1 Open ChatBot component
  - File: `src/components/ChatBot.js`
  - Review current structure
  - Identify where to add video call button
  - _Requirements: 2.6_

- [ ] 10.2 Add video call button to ChatBot
  - Import VideoCameraOutlined icon from @ant-design/icons
  - Add button in chat header or actions area
  - Use Ant Design Button component
  - Icon: VideoCameraOutlined
  - Tooltip: "Chuyển sang gọi video"
  - _Requirements: 2.6_

- [ ] 10.3 Implement navigation handler
  - Import useNavigate from react-router-dom
  - Add click handler: `const handleVideoCall = () => { navigate('/ai-video-call'); }`
  - Attach to button onClick
  - _Requirements: 2.6_

- [ ] 10.4 Add conditional rendering
  - Only show button if user is authenticated
  - Check AI usage limit (if applicable)
  - Hide button if limit exceeded
  - _Requirements: 2.6_

- [ ]* 10.5 Test ChatBot integration
  - Open ChatBot
  - Verify video call button appears
  - Click button
  - Verify navigation to /ai-video-call
  - Verify video call starts successfully
  - Test back navigation to ChatBot
  - _Requirements: 2.6_

---

### Task 11: Documentation Updates

**Status:** ⚠️ Needs updates

- [ ] 11.1 Update component JSDoc comments
  - Add comprehensive JSDoc to VideoCallContainer
  - Add JSDoc to AudioVisualizer
  - Add JSDoc to all hooks
  - Document all props with @param
  - Document return values with @returns
  - Add usage examples
  - _Requirements: 4.4_

- [ ] 11.2 Create user guide
  - Create: `docs/USER_GUIDE_VIDEO_CALL.md`
  - How to start a video call
  - How to use camera controls
  - How to capture images
  - How to interpret AI responses
  - Troubleshooting common issues
  - _Requirements: 4.4_

- [ ] 11.3 Create developer guide
  - Create: `docs/DEVELOPER_GUIDE_VIDEO_CALL.md`
  - Architecture overview
  - Component structure
  - Service layer explanation
  - How to extend features
  - How to add new tools
  - Testing guidelines
  - _Requirements: 4.4_

- [ ] 11.4 Update main README
  - Add AI Video Call feature to features list
  - Add link to user guide
  - Add link to developer guide
  - Update screenshots (if applicable)
  - _Requirements: 4.4_

---

## Phase 4: Final Verification & Deployment (1 day)

### Task 12: Final Testing & QA

**Status:** ❌ Not started

- [ ] 12.1 Run complete test suite
  - Execute: `npm test`
  - Verify all unit tests pass
  - Verify all integration tests pass
  - Check code coverage (target: >80%)
  - Fix any failing tests
  - _Requirements: All_

- [ ] 12.2 Manual regression testing
  - Test all features end-to-end
  - Test on all target browsers
  - Test on mobile devices
  - Test error scenarios
  - Test simulation mode
  - Document any issues
  - _Requirements: All_

- [ ] 12.3 Performance verification
  - Run Lighthouse audit
  - Check Performance score (target: >90)
  - Check Accessibility score (target: >90)
  - Check Best Practices score (target: >90)
  - Fix any issues
  - _Requirements: 3.4, 4.2_

- [ ] 12.4 Security audit
  - Verify API key is not exposed
  - Check for XSS vulnerabilities
  - Verify user permissions are handled correctly
  - Check error messages don't leak sensitive info
  - Review Sentry error logs
  - _Requirements: 3.5_

- [ ] 12.5 Create deployment checklist
  - List all environment variables needed
  - Document API key setup
  - List browser compatibility requirements
  - Document known limitations
  - Create rollback plan
  - _Requirements: All_

---

### Task 13: Deployment Preparation

**Status:** ❌ Not started

- [ ] 13.1 Update environment configuration
  - Verify REACT_APP_GEMINI_API_KEY is set
  - Check all environment variables
  - Test with production API key
  - Verify simulation mode fallback works
  - _Requirements: 3.5_

- [ ] 13.2 Build production bundle
  - Run: `npm run build`
  - Verify build succeeds
  - Check bundle size
  - Test production build locally
  - _Requirements: 3.4_

- [ ] 13.3 Deploy to staging
  - Deploy to staging environment
  - Run smoke tests
  - Test all features in staging
  - Verify analytics tracking works
  - Verify error logging works
  - _Requirements: All_

- [ ] 13.4 Monitor staging
  - Monitor Sentry for errors
  - Check analytics dashboard
  - Review performance metrics
  - Test with real users (if possible)
  - Document any issues
  - _Requirements: 4.4_

- [ ] 13.5 Deploy to production
  - Get approval from stakeholders
  - Deploy to production
  - Monitor for errors
  - Track usage metrics
  - Be ready for hotfixes
  - _Requirements: All_

---

## Summary

### Completion Checklist

**Phase 1: Core Features**
- [ ] AudioVisualizer integrated (Task 1)
- [ ] ErrorDisplay rendered (Task 2)
- [ ] Audio analysers verified (Task 3)

**Phase 2: Testing**
- [ ] Unit tests complete (Tasks 4-5)
- [ ] Integration tests complete (Task 6)
- [ ] Manual testing complete (Task 7)

**Phase 3: Polish**
- [ ] Performance optimized (Task 8)
- [ ] Accessibility improved (Task 9)
- [ ] ChatBot integrated (Task 10)
- [ ] Documentation updated (Task 11)

**Phase 4: Deployment**
- [ ] Final QA complete (Task 12)
- [ ] Deployed to production (Task 13)

### Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 1-3 | 1-2 days |
| Phase 2 | 4-7 | 2-3 days |
| Phase 3 | 8-11 | 1-2 days |
| Phase 4 | 12-13 | 1 day |
| **Total** | **13 tasks** | **5-8 days** |

### Priority Order

**High Priority (Must Complete):**
1. Task 1: AudioVisualizer integration
2. Task 2: ErrorDisplay rendering
3. Task 3: Audio analyser verification
4. Task 7: Manual browser testing
5. Task 12: Final QA

**Medium Priority (Should Complete):**
6. Task 4-5: Unit tests
7. Task 6: Integration tests
8. Task 9: Accessibility
9. Task 11: Documentation

**Low Priority (Nice to Have):**
10. Task 8: Performance optimization
11. Task 10: ChatBot integration
12. Task 13: Deployment

### Success Criteria

✅ **Feature Complete When:**
- Audio visualizer shows real-time waveforms
- Error display appears and retry works
- All tests passing (>80% coverage)
- Works on Chrome, Safari, Edge (desktop + mobile)
- Accessibility audit passes
- Documentation complete
- Deployed to production

### Notes

- Tasks marked with `*` are optional test tasks (can be skipped for faster MVP)
- Most core functionality already works - focus is on integration and polish
- Simulation mode provides good fallback for testing without API key
- Feature is production-ready after Phase 1-2 completion
- Phase 3-4 are polish and deployment preparation

---

## Quick Start for Developers

**To complete Phase 1 (Core Features):**

1. **Integrate AudioVisualizer:**
   ```bash
   # Edit src/components/video-call/VideoCallContainer.jsx
   # Add import, add components to JSX
   # Test with: npm start, navigate to /ai-video-call
   ```

2. **Add ErrorDisplay:**
   ```bash
   # Edit src/components/video-call/VideoCallContainer.jsx
   # Add retry handler, add ErrorDisplay to JSX
   # Test by denying camera permission
   ```

3. **Verify Audio Analysers:**
   ```bash
   # Check src/hooks/useVideoCall.js
   # Ensure analysers are created and returned
   # Test with console.log
   ```

**To run tests:**
```bash
npm test                                    # Run all tests
npm test audioHelpers.test.js              # Run specific test
npm test -- --coverage                     # Run with coverage
npm test -- --testPathPattern=video-call   # Run video-call tests
```

**To test manually:**
```bash
npm start
# Navigate to http://localhost:3000/ai-video-call
# Test all features
```

---

## Contact & Support

**Questions?** Contact the development team
**Issues?** Create a ticket in project management system
**Documentation?** See `/docs` folder

**Good luck! 🚀**
