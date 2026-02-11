# Integration Testing Guide - Dual-Model Video Call Architecture

## Overview

This guide provides step-by-step instructions for manually testing the dual-model video call architecture with real APIs. These tests verify end-to-end functionality as specified in Task 8.

**Test Date:** _____________  
**Tester:** _____________  
**API Key Status:** ☐ Valid ☐ Invalid  
**Environment:** ☐ Development ☐ Staging ☐ Production

---

## Prerequisites

### 1. API Key Setup
- [ ] Valid `REACT_APP_GEMINI_API_KEY` in `.env` file
- [ ] API key starts with `AIza` and is at least 30 characters
- [ ] API key has quota available for testing

### 2. Browser Requirements
- [ ] Chrome/Edge (recommended) or Firefox
- [ ] Microphone permission granted
- [ ] Camera permission granted
- [ ] Stable internet connection

### 3. Test Environment
- [ ] Development server running (`npm start`)
- [ ] Browser console open (F12) for logs
- [ ] Network tab open for monitoring API calls

---

## Test Suite 1: Voice Interaction End-to-End

### Test 1.1: Session Initialization
**Objective:** Verify both models start successfully

**Steps:**
1. Navigate to `/ai-video-call` page
2. Click "Bắt đầu" button
3. Grant microphone permission if prompted
4. Wait for connection (max 5 seconds)

**Expected Results:**
- [ ] Status changes to "connected" or "listening"
- [ ] Console shows: "Audio model connected"
- [ ] Console shows: "Analysis model initialized"
- [ ] No error messages displayed
- [ ] Lạc Lạc mascot appears

**Actual Results:**
```
Status: _______________
Audio Model: ☐ Connected ☐ Failed
Analysis Model: ☐ Ready ☐ Failed
Errors: _______________
```

---

### Test 1.2: Vietnamese Voice (Kore) Verification
**Objective:** Verify Vietnamese TTS is working

**Steps:**
1. Complete Test 1.1 (session started)
2. Speak into microphone: "Xin chào Lạc Lạc"
3. Wait for AI response (max 5 seconds)
4. Listen to audio output

**Expected Results:**
- [ ] Audio output is in Vietnamese
- [ ] Voice sounds natural (Kore voice)
- [ ] Audio is clear without distortion
- [ ] Response is relevant to greeting

**Actual Results:**
```
Voice Quality: ☐ Excellent ☐ Good ☐ Poor
Language: ☐ Vietnamese ☐ Other
Response Time: _______ seconds
Response Text: _______________
```

---

### Test 1.3: Voice Interaction Latency
**Objective:** Verify latency < 2 seconds

**Steps:**
1. Complete Test 1.1 (session started)
2. Speak: "Giá lúa hôm nay bao nhiêu?"
3. Start timer when you finish speaking
4. Stop timer when AI starts responding

**Expected Results:**
- [ ] Total latency < 2 seconds
- [ ] Response is relevant to question
- [ ] No timeout errors

**Actual Results:**
```
Latency: _______ seconds
Pass: ☐ Yes ☐ No
Response: _______________
```

---

## Test Suite 2: Image Capture and Analysis

### Test 2.1: Camera Initialization
**Objective:** Verify camera starts automatically

**Steps:**
1. Navigate to `/ai-video-call` page
2. Click "Bắt đầu" button
3. Grant camera permission if prompted
4. Observe video preview

**Expected Results:**
- [ ] Camera starts automatically
- [ ] Video preview shows live feed
- [ ] Back camera is selected by default (mobile)
- [ ] No camera errors

**Actual Results:**
```
Camera Status: ☐ Started ☐ Failed
Facing Mode: ☐ Environment ☐ User
Video Quality: ☐ Good ☐ Poor
Errors: _______________
```

---

### Test 2.2: Image Capture Flow
**Objective:** Verify complete image analysis pipeline

**Steps:**
1. Complete Test 2.1 (camera active)
2. Point camera at a plant or object
3. Click "Chụp ảnh" button
4. Observe flash effect
5. Wait for analysis (max 10 seconds)

**Expected Results:**
- [ ] Flash effect appears briefly
- [ ] Status changes to "analyzing"
- [ ] Wait message: "Chờ Lạc Lạc 1 xíu nhé" (audio)
- [ ] Analysis result appears as text
- [ ] Analysis result is spoken (audio)
- [ ] Status returns to "listening"

**Actual Results:**
```
Flash Effect: ☐ Yes ☐ No
Wait Message: ☐ Heard ☐ Not heard
Analysis Time: _______ seconds
Analysis Text: _______________
Audio Output: ☐ Yes ☐ No
```

---

### Test 2.3: Image Classification Accuracy
**Objective:** Verify >95% accuracy for person/plant/object

**Test Cases:**

#### Test 2.3a: Plant Recognition
**Steps:**
1. Point camera at a plant (real or photo)
2. Click "Chụp ảnh"
3. Review analysis result

**Expected:** AI correctly identifies it as a plant

**Actual Results:**
```
Identified As: _______________
Correct: ☐ Yes ☐ No
Confidence: _______________
```

#### Test 2.3b: Person Recognition
**Steps:**
1. Point camera at a person (or selfie)
2. Click "Chụp ảnh"
3. Review analysis result

**Expected:** AI correctly identifies it as a person

**Actual Results:**
```
Identified As: _______________
Correct: ☐ Yes ☐ No
Confidence: _______________
```

#### Test 2.3c: Object Recognition
**Steps:**
1. Point camera at an object (book, cup, etc.)
2. Click "Chụp ảnh"
3. Review analysis result

**Expected:** AI correctly identifies the object type

**Actual Results:**
```
Identified As: _______________
Correct: ☐ Yes ☐ No
Confidence: _______________
```

**Overall Accuracy:**
```
Total Tests: 3
Correct: _______
Accuracy: _______% (Target: >95%)
Pass: ☐ Yes ☐ No
```

---

### Test 2.4: Image Quality Verification
**Objective:** Verify images are captured at quality 0.98

**Steps:**
1. Open browser DevTools → Network tab
2. Click "Chụp ảnh" button
3. Find the API request with image data
4. Check image size and quality

**Expected Results:**
- [ ] Image format is JPEG
- [ ] Image quality setting is 0.98
- [ ] Image size is reasonable (100KB - 2MB)

**Actual Results:**
```
Format: _______________
Quality: _______________
Size: _______ KB
Pass: ☐ Yes ☐ No
```

---

## Test Suite 3: Tool Calls

### Test 3.1: Price Lookup Tool
**Objective:** Verify price lookup works correctly

**Steps:**
1. Complete Test 1.1 (session started)
2. Speak: "Giá cà phê hôm nay bao nhiêu?"
3. Wait for response
4. Review response content

**Expected Results:**
- [ ] AI recognizes price lookup intent
- [ ] Tool call is executed
- [ ] Response contains price information
- [ ] Response is spoken in Vietnamese

**Actual Results:**
```
Tool Called: ☐ Yes ☐ No
Response Contains Price: ☐ Yes ☐ No
Response: _______________
Pass: ☐ Yes ☐ No
```

---

### Test 3.2: Disease Diagnosis Tool
**Objective:** Verify disease diagnosis works correctly

**Steps:**
1. Complete Test 1.1 (session started)
2. Speak: "Cây lúa của tôi bị lá vàng, làm sao?"
3. Wait for response
4. Review diagnosis

**Expected Results:**
- [ ] AI recognizes diagnosis intent
- [ ] Tool call is executed
- [ ] Response contains diagnosis
- [ ] Response contains treatment advice

**Actual Results:**
```
Tool Called: ☐ Yes ☐ No
Diagnosis Provided: ☐ Yes ☐ No
Treatment Advice: ☐ Yes ☐ No
Response: _______________
Pass: ☐ Yes ☐ No
```

---

### Test 3.3: Store Finder Tool
**Objective:** Verify store finder works correctly

**Steps:**
1. Complete Test 1.1 (session started)
2. Speak: "Tìm cửa hàng phân bón gần đây"
3. Wait for response
4. Review store information

**Expected Results:**
- [ ] AI recognizes store finder intent
- [ ] Tool call is executed
- [ ] Response contains store names
- [ ] Response contains locations

**Actual Results:**
```
Tool Called: ☐ Yes ☐ No
Stores Listed: ☐ Yes ☐ No
Locations Provided: ☐ Yes ☐ No
Response: _______________
Pass: ☐ Yes ☐ No
```

---

## Test Suite 4: Error Scenarios

### Test 4.1: Invalid API Key
**Objective:** Verify graceful handling of invalid API key

**Steps:**
1. Set `REACT_APP_GEMINI_API_KEY=invalid-key` in `.env`
2. Restart development server
3. Navigate to `/ai-video-call`
4. Click "Bắt đầu"

**Expected Results:**
- [ ] App enters simulation mode
- [ ] Error message displayed
- [ ] No crash or blank screen
- [ ] UI remains functional

**Actual Results:**
```
Mode: ☐ Simulation ☐ Error ☐ Crash
Error Message: _______________
UI Functional: ☐ Yes ☐ No
Pass: ☐ Yes ☐ No
```

---

### Test 4.2: Network Failure
**Objective:** Verify handling of network issues

**Steps:**
1. Complete Test 1.1 (session started)
2. Open DevTools → Network tab
3. Enable "Offline" mode
4. Try to capture image or speak

**Expected Results:**
- [ ] Error message displayed
- [ ] App doesn't crash
- [ ] Can retry after network restored
- [ ] Fallback to simulation mode

**Actual Results:**
```
Error Handling: ☐ Good ☐ Poor
Crash: ☐ Yes ☐ No
Recovery: ☐ Yes ☐ No
Pass: ☐ Yes ☐ No
```

---

### Test 4.3: Audio Model Disconnection
**Objective:** Verify handling of audio model failure

**Steps:**
1. Complete Test 1.1 (session started)
2. Monitor console for audio model status
3. If audio model disconnects, observe behavior

**Expected Results:**
- [ ] Analysis model continues working
- [ ] Image capture still functional
- [ ] Error message displayed
- [ ] Automatic reconnection attempted

**Actual Results:**
```
Analysis Model Status: ☐ Working ☐ Failed
Image Capture: ☐ Working ☐ Failed
Reconnection: ☐ Attempted ☐ Not attempted
Pass: ☐ Yes ☐ No
```

---

### Test 4.4: Analysis Model Failure
**Objective:** Verify handling of analysis model failure

**Steps:**
1. Complete Test 1.1 (session started)
2. Monitor console for analysis model status
3. If analysis model fails, observe behavior

**Expected Results:**
- [ ] Audio model continues working
- [ ] Voice interaction still functional
- [ ] Error message displayed
- [ ] Image capture disabled

**Actual Results:**
```
Audio Model Status: ☐ Working ☐ Failed
Voice Interaction: ☐ Working ☐ Failed
Image Capture: ☐ Disabled ☐ Still enabled
Pass: ☐ Yes ☐ No
```

---

## Test Suite 5: Performance Metrics

### Test 5.1: Voice Interaction Latency
**Objective:** Measure end-to-end latency < 2 seconds

**Test Cases (run 5 times):**

| Test # | Question | Start Time | End Time | Latency | Pass |
|--------|----------|------------|----------|---------|------|
| 1 | "Xin chào" | | | | ☐ |
| 2 | "Giá lúa?" | | | | ☐ |
| 3 | "Thời tiết?" | | | | ☐ |
| 4 | "Cảm ơn" | | | | ☐ |
| 5 | "Tạm biệt" | | | | ☐ |

**Average Latency:** _______ seconds  
**Target:** < 2 seconds  
**Pass:** ☐ Yes ☐ No

---

### Test 5.2: Image Analysis Latency
**Objective:** Measure analysis latency < 5 seconds

**Test Cases (run 5 times):**

| Test # | Subject | Start Time | End Time | Latency | Pass |
|--------|---------|------------|----------|---------|------|
| 1 | Plant | | | | ☐ |
| 2 | Person | | | | ☐ |
| 3 | Object | | | | ☐ |
| 4 | Complex scene | | | | ☐ |
| 5 | Low light | | | | ☐ |

**Average Latency:** _______ seconds  
**Target:** < 5 seconds  
**Pass:** ☐ Yes ☐ No

---

### Test 5.3: Memory Usage
**Objective:** Monitor memory usage in long sessions

**Steps:**
1. Open DevTools → Performance → Memory
2. Start recording
3. Use app for 10 minutes (voice + image)
4. Stop recording
5. Check memory graph

**Expected Results:**
- [ ] No significant memory leaks
- [ ] Memory usage stabilizes
- [ ] No continuous growth

**Actual Results:**
```
Initial Memory: _______ MB
Peak Memory: _______ MB
Final Memory: _______ MB
Memory Leak: ☐ Yes ☐ No
Pass: ☐ Yes ☐ No
```

---

## Test Suite 6: Model Isolation

### Test 6.1: Audio Model Isolation
**Objective:** Verify audio model never receives images

**Steps:**
1. Open DevTools → Console
2. Enable verbose logging
3. Complete Test 2.2 (image capture)
4. Review console logs for audio model

**Expected Results:**
- [ ] Audio model logs show no image data
- [ ] Only audio/text data sent to audio model
- [ ] Image data only sent to analysis model

**Actual Results:**
```
Audio Model Received Images: ☐ Yes ☐ No
Pass: ☐ Yes ☐ No
```

---

### Test 6.2: Analysis Model Isolation
**Objective:** Verify analysis model never receives audio streams

**Steps:**
1. Open DevTools → Console
2. Enable verbose logging
3. Complete Test 1.2 (voice interaction)
4. Review console logs for analysis model

**Expected Results:**
- [ ] Analysis model logs show no audio stream data
- [ ] Only text/image data sent to analysis model
- [ ] Audio streams only sent to audio model

**Actual Results:**
```
Analysis Model Received Audio Streams: ☐ Yes ☐ No
Pass: ☐ Yes ☐ No
```

---

## Test Suite 7: Session Independence

### Test 7.1: Independent Model Sessions
**Objective:** Verify models operate independently

**Steps:**
1. Complete Test 1.1 (session started)
2. Simulate audio model error (disconnect network briefly)
3. Try image capture while audio model is down
4. Restore network
5. Try voice interaction

**Expected Results:**
- [ ] Image capture works when audio model is down
- [ ] Voice interaction works when analysis model is down
- [ ] Models recover independently
- [ ] No cascading failures

**Actual Results:**
```
Image Capture During Audio Failure: ☐ Works ☐ Fails
Voice After Recovery: ☐ Works ☐ Fails
Independent Recovery: ☐ Yes ☐ No
Pass: ☐ Yes ☐ No
```

---

## Console Debugging Commands

Use these commands in browser console for debugging:

```javascript
// Check orchestrator state
window.orchestrator = orchestratorRef.current;
console.log(window.orchestrator.getSessionState());

// Check audio model status
console.log(window.orchestrator.audioModel?.isServiceConnected());

// Check analysis model status
console.log(window.orchestrator.analysisModel?.isServiceReady());

// Manual voice input test
window.orchestrator.handleVoiceInput({
  data: 'base64-audio-data',
  mimeType: 'audio/pcm;rate=16000'
});

// Manual image capture test
const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'green';
ctx.fillRect(0, 0, 640, 480);
const base64 = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

window.orchestrator.handleImageCapture({
  base64: base64,
  mimeType: 'image/jpeg',
  quality: 0.98
});
```

---

## Test Summary

### Overall Results

**Test Suites Completed:**
- [ ] Suite 1: Voice Interaction (3 tests)
- [ ] Suite 2: Image Capture (4 tests)
- [ ] Suite 3: Tool Calls (3 tests)
- [ ] Suite 4: Error Scenarios (4 tests)
- [ ] Suite 5: Performance (3 tests)
- [ ] Suite 6: Model Isolation (2 tests)
- [ ] Suite 7: Session Independence (1 test)

**Total Tests:** 20  
**Passed:** _______  
**Failed:** _______  
**Pass Rate:** _______% (Target: >95%)

### Critical Issues Found
```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

### Non-Critical Issues Found
```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

### Recommendations
```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

### Sign-Off

**Tester Signature:** _____________  
**Date:** _____________  
**Status:** ☐ PASS ☐ FAIL ☐ CONDITIONAL PASS

**Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## Appendix: Known Issues

### Issue 1: Jest ES Module Support
- **Description:** Integration tests cannot run via Jest due to ES module issues with @google/genai
- **Workaround:** Use manual testing guide instead
- **Status:** Open
- **Priority:** Low (manual testing is sufficient)

### Issue 2: Camera Permission on iOS
- **Description:** iOS Safari may require additional user interaction for camera
- **Workaround:** User must tap screen after granting permission
- **Status:** Known limitation
- **Priority:** Low

---

## Quick Reference: Expected Behaviors

### Status Flow
```
connecting → connected → listening → thinking → speaking → listening
                    ↓
              simulation (if API unavailable)
```

### Audio Model States
- `connected`: WebSocket connection active
- `disconnected`: No connection
- `reconnecting`: Attempting to reconnect

### Analysis Model States
- `ready`: Model initialized and ready
- `analyzing`: Processing image or text
- `error`: Model failed to initialize

### Error Messages (Vietnamese)
- "Chế độ mô phỏng": Simulation mode active
- "Audio model không khả dụng": Audio model unavailable
- "Analysis model không khả dụng": Analysis model unavailable
- "Không thể chụp hình ảnh": Image capture failed
- "Không thể phân tích hình ảnh": Image analysis failed
