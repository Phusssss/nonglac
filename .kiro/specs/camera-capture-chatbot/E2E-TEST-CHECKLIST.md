# End-to-End Test Checklist: Camera Capture Integration

## Test Environment Setup
- [ ] Desktop browser (Chrome/Firefox/Edge)
- [ ] Mobile iOS (Safari)
- [ ] Mobile Android (Chrome)
- [ ] User logged in with active quota

---

## Test 1: Complete Flow - Open → Switch → Capture → AI Analysis → Result

### Steps:
1. [ ] Open the application and navigate to ChatBot
2. [ ] Click the camera button (📸) next to the file picker
3. [ ] **Verify**: Camera permission prompt appears
4. [ ] Grant camera permission
5. [ ] **Verify**: Camera preview opens with live video feed
6. [ ] **Verify**: Focus reticle (corner markers + center dot) is visible and centered
7. [ ] **Verify**: Back camera is active by default (environment mode)
8. [ ] Click the switch camera button (🔄)
9. [ ] **Verify**: Camera switches to front camera
10. [ ] **Verify**: Video is horizontally mirrored (selfie mode)
11. [ ] Click switch camera button again
12. [ ] **Verify**: Camera switches back to rear camera
13. [ ] **Verify**: Video is no longer mirrored
14. [ ] Click the capture button (large white circle)
15. [ ] **Verify**: White flash effect appears for ~150ms
16. [ ] **Verify**: Camera closes automatically
17. [ ] **Verify**: Captured image appears as preview thumbnail in chat input
18. [ ] Click the send button (➤)
19. [ ] **Verify**: "Lạc Lạc đang suy nghĩ..." loading message appears
20. [ ] **Verify**: AI analysis response appears in chat thread
21. [ ] **Verify**: Quota count decreases by 1 in header
22. [ ] **Verify**: Image preview is removed from input area

### Expected Results:
✅ Complete flow works without errors
✅ Camera resources are properly released
✅ AI provides relevant plant analysis
✅ Quota system updates correctly

---

## Test 2: Error Scenario - Permission Denied

### Steps:
1. [ ] Open ChatBot
2. [ ] Click camera button (📸)
3. [ ] **Deny** camera permission in browser prompt
4. [ ] **Verify**: Error overlay appears with message "Cần quyền truy cập camera"
5. [ ] **Verify**: Instructions shown: "Vui lòng cho phép truy cập camera trong cài đặt trình duyệt"
6. [ ] **Verify**: "Đóng" button is visible
7. [ ] Click "Đóng" button
8. [ ] **Verify**: Error overlay closes
9. [ ] **Verify**: Camera modal closes
10. [ ] **Verify**: File picker button (📷) is still available as fallback

### Expected Results:
✅ Clear error message displayed
✅ User can close error and continue using file picker
✅ No console errors or crashes

---

## Test 3: Error Scenario - No Camera Available

### Steps:
1. [ ] Use a device/browser without camera support (or disable camera in browser settings)
2. [ ] Open ChatBot
3. [ ] **Verify**: Camera button (📸) is NOT visible
4. [ ] **Verify**: Only file picker button (📷) is shown
5. [ ] Click file picker button
6. [ ] **Verify**: File picker opens normally
7. [ ] Upload an image via file picker
8. [ ] **Verify**: Image analysis works normally

### Expected Results:
✅ Camera button hidden when not supported
✅ Graceful degradation to file picker only
✅ No errors in console

---

## Test 4: Error Scenario - AI Analysis Failure

### Steps:
1. [ ] Open ChatBot and capture an image using camera
2. [ ] Simulate AI failure (disconnect internet or use invalid API key)
3. [ ] Send captured image
4. [ ] **Verify**: Error message appears: "❌ Không thể phân tích ảnh. Vui lòng thử lại sau."
5. [ ] **Verify**: Retry message shown: "🔄 Nhấn nút gửi lại để thử lại với ảnh này"
6. [ ] **Verify**: Captured image is still in preview (not removed)
7. [ ] Restore internet connection
8. [ ] Click send button again
9. [ ] **Verify**: AI analysis succeeds on retry
10. [ ] **Verify**: Response appears in chat

### Expected Results:
✅ Clear error message with retry option
✅ Image preserved for retry
✅ Retry works after fixing issue

---

## Test 5: Error Scenario - Quota Exceeded

### Steps:
1. [ ] Use account with 0 remaining quota
2. [ ] Open ChatBot
3. [ ] **Verify**: Header shows "Còn 0 câu hỏi"
4. [ ] Capture image using camera
5. [ ] Send image to AI
6. [ ] **Verify**: Quota exceeded message appears
7. [ ] **Verify**: Message includes upgrade options (NHÀ NÔNG, CHUYÊN GIA)
8. [ ] **Verify**: Message mentions waiting until tomorrow for free quota reset

### Expected Results:
✅ Quota check prevents AI call
✅ Clear upgrade path shown
✅ User informed about free quota reset

---

## Test 6: Resource Cleanup - Close Camera

### Steps:
1. [ ] Open ChatBot and click camera button
2. [ ] Wait for camera to initialize
3. [ ] **Verify**: Camera preview is active
4. [ ] Click close button (✕) in camera modal header
5. [ ] **Verify**: Camera preview closes immediately
6. [ ] Open browser DevTools → Console
7. [ ] **Verify**: No errors about unclosed streams
8. [ ] Check browser's camera indicator (usually in address bar)
9. [ ] **Verify**: Camera indicator light turns off

### Expected Results:
✅ Camera stream stops immediately
✅ No memory leaks
✅ Browser camera indicator turns off

---

## Test 7: Resource Cleanup - Component Unmount

### Steps:
1. [ ] Open ChatBot and start camera
2. [ ] While camera is active, close ChatBot (click × in header)
3. [ ] **Verify**: ChatBot closes
4. [ ] Check browser's camera indicator
5. [ ] **Verify**: Camera indicator turns off
6. [ ] Open browser DevTools → Console
7. [ ] **Verify**: No errors about unclosed streams
8. [ ] Re-open ChatBot
9. [ ] **Verify**: ChatBot works normally
10. [ ] Open camera again
11. [ ] **Verify**: Camera initializes successfully

### Expected Results:
✅ Camera stops when component unmounts
✅ No resource leaks
✅ Can re-open camera after closing ChatBot

---

## Test 8: Resource Cleanup - Camera Switch

### Steps:
1. [ ] Open camera (back camera active)
2. [ ] Note the camera indicator in browser
3. [ ] Click switch camera button
4. [ ] **Verify**: Camera indicator briefly turns off then back on
5. [ ] **Verify**: Front camera is now active
6. [ ] Open DevTools → Console
7. [ ] **Verify**: No errors about multiple active streams
8. [ ] Switch camera multiple times (5-10 times)
9. [ ] **Verify**: Each switch works smoothly
10. [ ] **Verify**: No performance degradation
11. [ ] Close camera
12. [ ] **Verify**: Camera indicator turns off

### Expected Results:
✅ Previous stream stopped before new stream starts
✅ No multiple concurrent streams
✅ Smooth switching without memory leaks

---

## Test 9: Responsive Design - Mobile Portrait

### Device: Mobile phone in portrait mode (e.g., iPhone, Android)

### Steps:
1. [ ] Open ChatBot on mobile device
2. [ ] Click camera button
3. [ ] **Verify**: Camera modal uses full screen (no margins)
4. [ ] **Verify**: Video preview fills entire viewport
5. [ ] **Verify**: Focus reticle is appropriately sized for mobile
6. [ ] **Verify**: Control buttons are large enough for touch (≥44px)
7. [ ] **Verify**: Capture button is prominently sized (≥70px)
8. [ ] **Verify**: All buttons are easily tappable
9. [ ] Capture an image
10. [ ] **Verify**: Flash effect covers entire screen
11. [ ] **Verify**: Camera closes smoothly

### Expected Results:
✅ Full-screen camera experience on mobile
✅ Touch-friendly button sizes
✅ Smooth performance on mobile devices

---

## Test 10: Responsive Design - Mobile Landscape

### Device: Mobile phone in landscape mode

### Steps:
1. [ ] Open ChatBot on mobile device
2. [ ] Rotate device to landscape orientation
3. [ ] Click camera button
4. [ ] **Verify**: Camera modal adapts to landscape
5. [ ] **Verify**: Video maintains proper aspect ratio
6. [ ] **Verify**: Focus reticle remains centered
7. [ ] **Verify**: Control buttons remain accessible
8. [ ] Rotate device back to portrait while camera is open
9. [ ] **Verify**: Camera adapts smoothly to portrait
10. [ ] **Verify**: No layout breaks or distortion
11. [ ] Capture an image
12. [ ] **Verify**: Capture works in both orientations

### Expected Results:
✅ Smooth orientation change handling
✅ Video maintains aspect ratio
✅ No layout breaks during rotation

---

## Test 11: Responsive Design - Tablet

### Device: Tablet (iPad, Android tablet)

### Steps:
1. [ ] Open ChatBot on tablet
2. [ ] Click camera button
3. [ ] **Verify**: Camera modal is appropriately sized for tablet
4. [ ] **Verify**: Not too small, not unnecessarily large
5. [ ] **Verify**: Focus reticle is visible and well-proportioned
6. [ ] **Verify**: Control buttons are touch-friendly
7. [ ] Test in both portrait and landscape
8. [ ] **Verify**: Works well in both orientations
9. [ ] Capture and send image
10. [ ] **Verify**: Complete flow works smoothly

### Expected Results:
✅ Appropriate sizing for tablet screens
✅ Good user experience on larger touch devices

---

## Test 12: Responsive Design - Desktop

### Device: Desktop computer with webcam

### Steps:
1. [ ] Open ChatBot on desktop browser
2. [ ] Click camera button
3. [ ] **Verify**: Camera modal is centered on screen
4. [ ] **Verify**: Modal has reasonable max dimensions (not full screen)
5. [ ] **Verify**: Video preview is clear and well-sized
6. [ ] **Verify**: Focus reticle is visible
7. [ ] **Verify**: Control buttons are appropriately sized for mouse
8. [ ] Hover over buttons
9. [ ] **Verify**: Cursor changes to pointer
10. [ ] **Verify**: Buttons are easily clickable
11. [ ] Resize browser window
12. [ ] **Verify**: Camera modal adapts responsively
13. [ ] Capture and send image
14. [ ] **Verify**: Complete flow works smoothly

### Expected Results:
✅ Centered modal on desktop
✅ Appropriate sizing for desktop screens
✅ Good mouse interaction experience

---

## Test 13: Cross-Browser - iOS Safari

### Device: iPhone with Safari browser

### Steps:
1. [ ] Open application in Safari on iOS
2. [ ] Navigate to ChatBot
3. [ ] Click camera button
4. [ ] **Verify**: Camera permission prompt appears (iOS style)
5. [ ] Grant permission
6. [ ] **Verify**: Camera initializes successfully
7. [ ] **Verify**: Video preview displays correctly
8. [ ] **Verify**: No black screen or frozen video
9. [ ] Switch between front and back camera
10. [ ] **Verify**: Both cameras work
11. [ ] Capture image
12. [ ] **Verify**: Flash effect works
13. [ ] Send to AI
14. [ ] **Verify**: AI analysis works
15. [ ] Test in both Safari and in-app browser (e.g., from Facebook)
16. [ ] **Verify**: Works in both contexts

### Expected Results:
✅ Full functionality on iOS Safari
✅ No iOS-specific bugs
✅ Smooth performance

---

## Test 14: Cross-Browser - Android Chrome

### Device: Android phone with Chrome browser

### Steps:
1. [ ] Open application in Chrome on Android
2. [ ] Navigate to ChatBot
3. [ ] Click camera button
4. [ ] **Verify**: Camera permission prompt appears (Android style)
5. [ ] Grant permission
6. [ ] **Verify**: Camera initializes successfully
7. [ ] **Verify**: Video preview displays correctly
8. [ ] Switch between front and back camera
9. [ ] **Verify**: Both cameras work
10. [ ] Capture image
11. [ ] **Verify**: Flash effect works
12. [ ] Send to AI
13. [ ] **Verify**: AI analysis works
14. [ ] Test with different Android versions if possible
15. [ ] **Verify**: Works across Android versions

### Expected Results:
✅ Full functionality on Android Chrome
✅ No Android-specific bugs
✅ Smooth performance

---

## Test 15: Cross-Browser - Desktop Chrome

### Device: Desktop with Chrome browser

### Steps:
1. [ ] Open application in Chrome on desktop
2. [ ] Complete full camera capture flow
3. [ ] **Verify**: All features work correctly
4. [ ] Check DevTools Console
5. [ ] **Verify**: No errors or warnings
6. [ ] Check DevTools Performance tab
7. [ ] **Verify**: No memory leaks during camera usage
8. [ ] **Verify**: Smooth 60fps video preview

### Expected Results:
✅ Full functionality on Chrome
✅ No console errors
✅ Good performance

---

## Test 16: Cross-Browser - Desktop Firefox

### Device: Desktop with Firefox browser

### Steps:
1. [ ] Open application in Firefox on desktop
2. [ ] Complete full camera capture flow
3. [ ] **Verify**: All features work correctly
4. [ ] **Verify**: Camera permission prompt works (Firefox style)
5. [ ] **Verify**: Video preview displays correctly
6. [ ] **Verify**: Camera switching works
7. [ ] **Verify**: Image capture and AI analysis work

### Expected Results:
✅ Full functionality on Firefox
✅ No Firefox-specific bugs

---

## Test 17: Cross-Browser - Desktop Edge

### Device: Desktop with Edge browser

### Steps:
1. [ ] Open application in Edge on desktop
2. [ ] Complete full camera capture flow
3. [ ] **Verify**: All features work correctly
4. [ ] **Verify**: Camera permission prompt works (Edge style)
5. [ ] **Verify**: Video preview displays correctly
6. [ ] **Verify**: Camera switching works
7. [ ] **Verify**: Image capture and AI analysis work

### Expected Results:
✅ Full functionality on Edge
✅ No Edge-specific bugs

---

## Test 18: Performance - Memory Leaks

### Steps:
1. [ ] Open browser DevTools → Performance/Memory tab
2. [ ] Take initial memory snapshot
3. [ ] Open camera
4. [ ] Close camera
5. [ ] Repeat open/close 10 times
6. [ ] Take final memory snapshot
7. [ ] **Verify**: Memory usage returns to baseline
8. [ ] **Verify**: No significant memory growth
9. [ ] Switch camera 20 times
10. [ ] **Verify**: No memory leaks from camera switching
11. [ ] Capture 10 images in succession
12. [ ] **Verify**: Memory is properly managed

### Expected Results:
✅ No memory leaks
✅ Stable memory usage over time
✅ Proper resource cleanup

---

## Test 19: Performance - Camera Initialization Speed

### Steps:
1. [ ] Open ChatBot
2. [ ] Click camera button
3. [ ] **Measure**: Time from click to video preview appearing
4. [ ] **Verify**: Camera opens in < 2 seconds
5. [ ] Close and reopen camera 5 times
6. [ ] **Verify**: Consistent initialization speed
7. [ ] Switch camera
8. [ ] **Measure**: Time for camera switch
9. [ ] **Verify**: Switch completes in < 1 second

### Expected Results:
✅ Fast camera initialization (< 2s)
✅ Fast camera switching (< 1s)
✅ Consistent performance

---

## Test 20: Accessibility - Keyboard Navigation

### Steps:
1. [ ] Open ChatBot
2. [ ] Use Tab key to navigate to camera button
3. [ ] **Verify**: Camera button receives focus
4. [ ] **Verify**: Focus indicator is visible
5. [ ] Press Enter to open camera
6. [ ] **Verify**: Camera opens
7. [ ] Use Tab to navigate camera controls
8. [ ] **Verify**: Can reach all buttons (switch, capture, close)
9. [ ] Press Enter on capture button
10. [ ] **Verify**: Image is captured
11. [ ] Press Escape key
12. [ ] **Verify**: Camera closes (if implemented)

### Expected Results:
✅ Full keyboard navigation support
✅ Visible focus indicators
✅ Logical tab order

---

## Summary Checklist

### Core Functionality
- [ ] Camera opens and displays live preview
- [ ] Camera switching works (front ↔ back)
- [ ] Photo capture works with flash effect
- [ ] AI analysis receives and processes captured images
- [ ] Quota system integrates correctly

### Error Handling
- [ ] Permission denied handled gracefully
- [ ] No camera available handled gracefully
- [ ] AI failure shows retry option
- [ ] Quota exceeded shows upgrade options
- [ ] Camera switch failure reverts to previous camera

### Resource Management
- [ ] Camera stops when closing modal
- [ ] Camera stops on component unmount
- [ ] Previous camera stops when switching
- [ ] No memory leaks detected
- [ ] Browser camera indicator turns off properly

### Responsive Design
- [ ] Works on mobile portrait
- [ ] Works on mobile landscape
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] Handles orientation changes smoothly

### Cross-Browser Support
- [ ] iOS Safari works correctly
- [ ] Android Chrome works correctly
- [ ] Desktop Chrome works correctly
- [ ] Desktop Firefox works correctly
- [ ] Desktop Edge works correctly

### Performance
- [ ] No memory leaks
- [ ] Fast camera initialization (< 2s)
- [ ] Fast camera switching (< 1s)
- [ ] Smooth video preview (60fps)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Logical tab order

---

## Test Results

**Date**: _______________
**Tester**: _______________
**Environment**: _______________

**Overall Status**: ⬜ PASS | ⬜ FAIL | ⬜ PARTIAL

**Issues Found**:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________
