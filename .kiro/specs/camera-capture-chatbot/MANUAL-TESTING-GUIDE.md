# Manual Testing Guide: Camera Capture Integration

## Overview

This guide provides step-by-step instructions for manually testing the camera capture feature in the ChatBot component. Follow these tests to ensure all functionality works correctly across different devices and scenarios.

---

## Prerequisites

### Required Setup
- ✅ Application running locally or deployed
- ✅ User account with active quota
- ✅ Device with camera (or virtual camera for desktop testing)
- ✅ Modern browser (Chrome, Firefox, Safari, Edge)
- ✅ Internet connection for AI analysis

### Test Devices (Recommended)
1. **Desktop**: Windows/Mac with webcam
2. **Mobile iOS**: iPhone with Safari
3. **Mobile Android**: Android phone with Chrome
4. **Tablet**: iPad or Android tablet

---

## Quick Start Test (5 minutes)

This is a rapid smoke test to verify basic functionality:

### Steps:
1. Open the application
2. Click the floating chat button or navigate to ChatBot
3. Click the camera button (📸) next to the file picker
4. Grant camera permission when prompted
5. Verify live video preview appears
6. Click the large white capture button
7. Verify flash effect and camera closes
8. Verify image preview appears in chat input
9. Click send button (➤)
10. Verify AI analysis response appears

### Expected Result:
✅ Complete flow works without errors in under 1 minute

---

## Detailed Test Scenarios

### Test 1: First-Time Camera Access

**Purpose**: Verify camera permission flow for new users

**Steps**:
1. Open application in incognito/private browsing mode
2. Navigate to ChatBot
3. Click camera button (📸)
4. **Observe**: Browser shows permission prompt
5. Click "Allow" or "Grant"
6. **Verify**: Camera preview opens immediately
7. **Verify**: Video shows live feed from back camera
8. **Verify**: Focus reticle (corner markers + center dot) is visible

**Expected Results**:
- ✅ Permission prompt appears
- ✅ Camera initializes after granting permission
- ✅ Video preview is clear and responsive
- ✅ Focus reticle is centered and visible

**Common Issues**:
- ❌ Permission denied: Check browser settings
- ❌ Black screen: Check camera is not in use by another app
- ❌ No permission prompt: Check browser supports getUserMedia

---

### Test 2: Camera Switching

**Purpose**: Verify front/back camera toggle functionality

**Steps**:
1. Open camera (should default to back camera)
2. **Verify**: Video shows environment (not mirrored)
3. Click switch camera button (🔄)
4. **Verify**: Video switches to front camera
5. **Verify**: Video is now horizontally mirrored (selfie mode)
6. **Verify**: Switch happens smoothly (< 1 second)
7. Click switch button again
8. **Verify**: Returns to back camera
9. **Verify**: Video is no longer mirrored
10. Repeat switching 5 times rapidly
11. **Verify**: Each switch works correctly

**Expected Results**:
- ✅ Smooth camera switching
- ✅ Correct mirroring behavior (front = mirrored, back = normal)
- ✅ No errors or frozen video
- ✅ Previous camera stops before new one starts

**Common Issues**:
- ❌ Switch button disabled: Wait for previous switch to complete
- ❌ Video freezes: Check browser console for errors
- ❌ Wrong camera: Some devices may have multiple cameras

---

### Test 3: Photo Capture

**Purpose**: Verify image capture with flash effect

**Steps**:
1. Open camera
2. Point camera at a plant or object
3. Frame subject within focus reticle
4. Click large white capture button
5. **Observe**: White flash effect appears
6. **Measure**: Flash duration (should be ~150ms)
7. **Verify**: Camera closes automatically
8. **Verify**: Captured image appears as thumbnail in chat input
9. **Verify**: Image shows what was in the frame
10. Click X on image thumbnail
11. **Verify**: Image is removed
12. Capture another image
13. **Verify**: Can capture multiple times

**Expected Results**:
- ✅ Flash effect is visible and brief (~150ms)
- ✅ Camera closes immediately after capture
- ✅ Image quality is good (not blurry or pixelated)
- ✅ Image matches what was in the frame
- ✅ Can remove and recapture images

**Common Issues**:
- ❌ No flash: Check CSS animations are enabled
- ❌ Blurry image: Ensure camera has time to focus
- ❌ Wrong orientation: Check device orientation handling

---

### Test 4: AI Integration

**Purpose**: Verify captured images are analyzed by AI

**Steps**:
1. Capture an image of a plant (real or photo)
2. **Verify**: Image appears in chat input
3. Click send button (➤)
4. **Verify**: Loading message appears: "Lạc Lạc đang suy nghĩ..."
5. **Wait**: For AI response (typically 2-5 seconds)
6. **Verify**: AI response appears in chat
7. **Verify**: Response is relevant to the image
8. **Verify**: Quota count decreases by 1
9. **Verify**: Image preview is removed from input
10. Scroll up in chat history
11. **Verify**: User message shows captured image
12. **Verify**: AI response is below user message

**Expected Results**:
- ✅ AI receives and analyzes the image
- ✅ Response is relevant and helpful
- ✅ Quota system updates correctly
- ✅ Chat history shows image and response

**Common Issues**:
- ❌ AI error: Check internet connection and API key
- ❌ Quota exceeded: Check user has remaining quota
- ❌ Slow response: Normal for large images or slow connection

---

### Test 5: Error Handling - Permission Denied

**Purpose**: Verify graceful handling of denied camera permission

**Steps**:
1. Open application in new incognito window
2. Navigate to ChatBot
3. Click camera button (📸)
4. **In permission prompt**: Click "Block" or "Deny"
5. **Verify**: Error overlay appears
6. **Verify**: Error message: "Cần quyền truy cập camera"
7. **Verify**: Instructions shown about enabling in browser settings
8. **Verify**: "Đóng" button is visible
9. Click "Đóng"
10. **Verify**: Error closes
11. **Verify**: Can still use file picker button (📷)
12. **Verify**: No console errors

**Expected Results**:
- ✅ Clear error message displayed
- ✅ Instructions for fixing the issue
- ✅ Can close error and continue
- ✅ File picker still works as fallback

**Recovery Test**:
1. Go to browser settings
2. Allow camera permission for the site
3. Refresh page
4. Click camera button again
5. **Verify**: Camera now works

---

### Test 6: Error Handling - No Camera

**Purpose**: Verify behavior when camera is not available

**Steps**:
1. Use a device without camera OR
2. Disable camera in browser settings OR
3. Use browser that doesn't support getUserMedia
4. Open ChatBot
5. **Verify**: Camera button (📸) is NOT visible
6. **Verify**: Only file picker button (📷) is shown
7. Click file picker button
8. **Verify**: File picker opens normally
9. Upload an image
10. **Verify**: AI analysis works normally

**Expected Results**:
- ✅ Camera button hidden when not supported
- ✅ No errors or broken UI
- ✅ File picker works as fallback
- ✅ Graceful degradation

---

### Test 7: Error Handling - AI Failure

**Purpose**: Verify retry mechanism for AI failures

**Steps**:
1. Capture an image
2. **Before sending**: Disconnect internet OR use browser DevTools to block network
3. Click send button
4. **Wait**: For timeout (may take 10-30 seconds)
5. **Verify**: Error message appears
6. **Verify**: Message includes retry option
7. **Verify**: Captured image is still in preview (not removed)
8. Reconnect internet
9. Click send button again
10. **Verify**: AI analysis succeeds
11. **Verify**: Response appears in chat

**Expected Results**:
- ✅ Clear error message
- ✅ Retry option available
- ✅ Image preserved for retry
- ✅ Retry works after fixing issue

---

### Test 8: Resource Cleanup

**Purpose**: Verify camera resources are properly released

**Steps**:
1. Open ChatBot
2. Click camera button
3. **Observe**: Browser camera indicator (usually in address bar) turns on
4. **Verify**: Green/orange light or camera icon appears
5. Close camera using X button
6. **Verify**: Camera indicator turns off immediately
7. Open camera again
8. **Verify**: Camera initializes successfully
9. Close ChatBot entirely (click X in header)
10. **Verify**: Camera indicator turns off
11. Open DevTools → Console
12. **Verify**: No errors about unclosed streams

**Expected Results**:
- ✅ Camera indicator turns off when closing camera
- ✅ Camera indicator turns off when closing ChatBot
- ✅ No memory leaks or unclosed streams
- ✅ Can reopen camera multiple times

**Advanced Check** (Chrome DevTools):
1. Open DevTools → Performance tab
2. Click "Record"
3. Open and close camera 10 times
4. Stop recording
5. Check memory graph
6. **Verify**: Memory returns to baseline after each close

---

### Test 9: Mobile Responsiveness

**Purpose**: Verify mobile-optimized experience

**Device**: Mobile phone (iOS or Android)

**Steps**:
1. Open application on mobile device
2. Navigate to ChatBot
3. Click camera button
4. **Verify**: Camera modal uses full screen
5. **Verify**: No margins or wasted space
6. **Verify**: Video preview fills viewport
7. **Verify**: Focus reticle is appropriately sized
8. **Verify**: Control buttons are large (easy to tap)
9. **Measure**: Capture button size (should be ≥70px)
10. **Verify**: All buttons are easily tappable
11. Rotate device to landscape
12. **Verify**: Camera adapts to landscape orientation
13. **Verify**: Video maintains aspect ratio
14. Rotate back to portrait
15. **Verify**: Smooth transition back to portrait
16. Capture an image
17. **Verify**: Flash covers entire screen
18. **Verify**: Image quality is good

**Expected Results**:
- ✅ Full-screen camera experience
- ✅ Touch-friendly button sizes (≥44px, preferably ≥56px)
- ✅ Smooth orientation changes
- ✅ Good performance on mobile

---

### Test 10: Cross-Browser Compatibility

**Purpose**: Verify functionality across different browsers

**Browsers to Test**:
- Chrome (desktop & mobile)
- Firefox (desktop)
- Safari (desktop & iOS)
- Edge (desktop)

**For Each Browser**:
1. Open application
2. Complete full camera capture flow
3. **Verify**: Camera permission prompt works
4. **Verify**: Video preview displays correctly
5. **Verify**: Camera switching works
6. **Verify**: Image capture works
7. **Verify**: Flash effect works
8. **Verify**: AI analysis works
9. Check DevTools Console
10. **Verify**: No browser-specific errors

**Expected Results**:
- ✅ Full functionality in all major browsers
- ✅ No browser-specific bugs
- ✅ Consistent user experience

**Known Browser Differences**:
- Safari: May require HTTPS for camera access
- Firefox: Different permission prompt UI
- Mobile browsers: May have different camera APIs

---

## Performance Benchmarks

### Camera Initialization
- **Target**: < 2 seconds from click to video preview
- **Acceptable**: 2-3 seconds
- **Poor**: > 3 seconds

### Camera Switching
- **Target**: < 1 second
- **Acceptable**: 1-2 seconds
- **Poor**: > 2 seconds

### Image Capture
- **Target**: Instant (< 100ms)
- **Acceptable**: < 500ms
- **Poor**: > 500ms

### AI Analysis
- **Target**: 2-5 seconds
- **Acceptable**: 5-10 seconds
- **Poor**: > 10 seconds (may indicate network issues)

---

## Troubleshooting Guide

### Issue: Camera button not visible
**Possible Causes**:
- Browser doesn't support getUserMedia
- Camera not available on device
- JavaScript error preventing render

**Solutions**:
1. Check browser version (update if old)
2. Check DevTools Console for errors
3. Try different browser
4. Verify device has camera

---

### Issue: Permission denied error
**Possible Causes**:
- User clicked "Block" on permission prompt
- Browser settings block camera access
- Site not using HTTPS (required for camera)

**Solutions**:
1. Check browser address bar for camera icon
2. Click icon and change permission to "Allow"
3. Clear site data and try again
4. Ensure site uses HTTPS

---

### Issue: Black screen or frozen video
**Possible Causes**:
- Camera in use by another application
- Browser doesn't have camera access
- Hardware issue with camera

**Solutions**:
1. Close other apps using camera
2. Restart browser
3. Check camera works in other apps
4. Try different camera (if device has multiple)

---

### Issue: Camera switch doesn't work
**Possible Causes**:
- Device only has one camera
- Camera switch in progress (button disabled)
- Browser doesn't support camera switching

**Solutions**:
1. Check if device has multiple cameras
2. Wait for current switch to complete
3. Try different browser
4. Check DevTools Console for errors

---

### Issue: AI analysis fails
**Possible Causes**:
- No internet connection
- API key invalid or expired
- Quota exceeded
- Image too large

**Solutions**:
1. Check internet connection
2. Verify API key in environment variables
3. Check user quota
4. Try with smaller image
5. Check DevTools Network tab for failed requests

---

### Issue: Quota not updating
**Possible Causes**:
- Subscription service error
- Firestore connection issue
- User not logged in

**Solutions**:
1. Check user is logged in
2. Check Firestore connection
3. Verify subscription service is working
4. Check DevTools Console for errors

---

## Test Report Template

```
# Camera Capture Test Report

**Date**: _______________
**Tester**: _______________
**Environment**: _______________
**Browser**: _______________
**Device**: _______________

## Test Results

### Core Functionality
- [ ] Camera opens: PASS / FAIL
- [ ] Camera switching: PASS / FAIL
- [ ] Photo capture: PASS / FAIL
- [ ] AI integration: PASS / FAIL
- [ ] Quota system: PASS / FAIL

### Error Handling
- [ ] Permission denied: PASS / FAIL
- [ ] No camera: PASS / FAIL
- [ ] AI failure: PASS / FAIL
- [ ] Quota exceeded: PASS / FAIL

### Resource Management
- [ ] Camera cleanup: PASS / FAIL
- [ ] No memory leaks: PASS / FAIL

### Responsive Design
- [ ] Mobile portrait: PASS / FAIL
- [ ] Mobile landscape: PASS / FAIL
- [ ] Desktop: PASS / FAIL

### Performance
- [ ] Camera init < 2s: PASS / FAIL
- [ ] Camera switch < 1s: PASS / FAIL
- [ ] Smooth video: PASS / FAIL

## Issues Found

1. **Issue**: _______________________________________________
   **Severity**: Critical / High / Medium / Low
   **Steps to Reproduce**: ___________________________________
   **Expected**: ____________________________________________
   **Actual**: ______________________________________________

2. **Issue**: _______________________________________________
   **Severity**: Critical / High / Medium / Low
   **Steps to Reproduce**: ___________________________________
   **Expected**: ____________________________________________
   **Actual**: ______________________________________________

## Overall Assessment

**Status**: ⬜ PASS | ⬜ FAIL | ⬜ PARTIAL

**Recommendation**: ⬜ Ready for Production | ⬜ Needs Fixes | ⬜ Major Issues

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________

**Tester Signature**: _______________
```

---

## Conclusion

This manual testing guide covers all critical aspects of the camera capture feature. Complete all tests before deploying to production to ensure a high-quality user experience.

For automated testing, refer to `ChatBot.e2e.test.js` for the test suite implementation.
