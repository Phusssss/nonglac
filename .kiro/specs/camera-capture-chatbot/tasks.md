# Implementation Plan: Camera Capture Integration for ChatBot

## Overview

This implementation plan integrates camera capture functionality into the existing ChatBot component. The approach follows an incremental pattern: first adding camera infrastructure, then building the UI components, integrating with AI services, and finally adding polish with animations and error handling. Each task builds on previous work to ensure a working feature at every checkpoint.

## Tasks

- [x] 1. Set up camera infrastructure and state management
  - Add camera-related state variables to ChatBot component (isCameraOpen, cameraStream, facingMode, showFlash, cameraError)
  - Add refs for video, canvas elements (videoRef, canvasRef)
  - Create helper function `checkCameraSupport()` to detect browser camera API support
  - Create helper function `stopCamera()` to clean up MediaStream resources
  - _Requirements: 1.1, 7.1, 7.2, 7.5, 10.3_

- [x] 2. Implement core camera initialization and lifecycle
  - [x] 2.1 Create `initializeCamera(facingMode)` function
    - Request camera access via `navigator.mediaDevices.getUserMedia`
    - Apply video constraints (width: 1920, height: 1080, facingMode)
    - Return MediaStream or throw error
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 2.2 Create `applyAdvancedConstraints(track)` function
    - Check track capabilities for continuous focus, exposure, white balance
    - Apply advanced constraints when facing mode is 'environment'
    - Handle constraint application errors gracefully
    - _Requirements: 3.5_
  
  - [x] 2.3 Create `handleOpenCamera()` function
    - Wrap with `requireAuthForAI()` for authentication check
    - Check camera support, set error if not supported
    - Call `initializeCamera()` with default 'environment' mode
    - Set cameraStream state and open camera modal
    - Handle permission denied and initialization errors
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2, 10.1, 10.2_
  
  - [x] 2.4 Create `handleCloseCamera()` function
    - Call `stopCamera()` to release resources
    - Reset camera state (isCameraOpen, cameraStream, cameraError)
    - _Requirements: 7.1, 7.4_
  
  - [ ]* 2.5 Write property test for camera resource cleanup
    - **Property 1: Camera Resource Cleanup**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
  
  - [ ]* 2.6 Write property test for camera stream initialization
    - **Property 2: Camera Stream Initialization**
    - **Validates: Requirements 1.1, 1.2, 1.5**

- [ ] 3. Build camera preview UI components
  - [x] 3.1 Create camera button in ChatBot input area
    - Add camera button (📸) next to existing file picker button
    - Style with green background matching existing buttons
    - Wire onClick to `handleOpenCamera()`
    - Hide button if camera not supported
    - _Requirements: 9.1, 10.3_
  
  - [x] 3.2 Create camera preview modal overlay
    - Create full-screen fixed position div with black background
    - Add header with close button
    - Add video element with ref={videoRef}
    - Set video to autoPlay, playsInline, muted
    - Apply horizontal flip transform when facingMode is 'user'
    - _Requirements: 1.4, 2.3, 2.4, 2.5, 9.2_
  
  - [x] 3.3 Create focus reticle overlay component
    - Create centered square container (280x280px)
    - Add four corner markers with white borders
    - Add center dot with white background
    - Position absolutely over video preview
    - Set pointerEvents: 'none' to allow clicks through
    - _Requirements: 2.1, 2.2_
  
  - [x] 3.4 Create camera control buttons
    - Add switch camera button (🔄) on left
    - Add large circular capture button in center
    - Add close button (✕) on right
    - Position controls at bottom of modal
    - Style with semi-transparent backgrounds and white text
    - _Requirements: 3.1, 4.1, 9.3_
  
  - [ ]* 3.5 Write unit tests for UI rendering
    - Test camera button renders when camera supported
    - Test camera button hidden when camera not supported
    - Test modal renders when isCameraOpen is true
    - Test video element has correct transform based on facingMode
    - _Requirements: 2.3, 2.4, 9.1, 10.3_

- [x] 4. Checkpoint - Verify camera preview works
  - Ensure camera opens and displays live preview
  - Verify focus reticle displays correctly
  - Verify close button closes camera and cleans up resources
  - Ask the user if questions arise

- [x] 5. Implement camera switching functionality
  - [x] 5.1 Create `handleSwitchCamera()` function
    - Stop current camera stream
    - Toggle facingMode state between 'user' and 'environment'
    - Call `initializeCamera()` with new facing mode
    - Apply advanced constraints if switching to 'environment'
    - Handle switch failure by reverting to previous camera
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 10.4_
  
  - [x] 5.2 Wire switch button to handler
    - Connect onClick event to `handleSwitchCamera()`
    - Disable button during switch operation
    - _Requirements: 3.1_
  
  - [ ]* 5.3 Write property test for facing mode toggle
    - **Property 4: Facing Mode Toggle**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  
  - [ ]* 5.4 Write property test for video mirroring consistency
    - **Property 7: Video Mirroring Consistency**
    - **Validates: Requirements 2.3, 2.4**

- [ ] 6. Implement photo capture functionality
  - [x] 6.1 Create `captureImageFromVideo()` function
    - Get canvas context from canvasRef
    - Set canvas dimensions to match video dimensions
    - Draw current video frame to canvas using `drawImage()`
    - Convert canvas to base64 JPEG with 0.8 quality
    - Return base64 string
    - _Requirements: 4.3, 4.4_
  
  - [x] 6.2 Create flash effect overlay
    - Add white overlay div with absolute positioning
    - Control visibility with showFlash state
    - Apply opacity transition (150ms ease-out)
    - _Requirements: 4.2_
  
  - [x] 6.3 Create `handleCapture()` function
    - Set showFlash to true
    - Wait 150ms then set showFlash to false
    - Call `captureImageFromVideo()` to get base64 image
    - Create image object with data, type, and url
    - Set currentImage state (reuse existing state)
    - Close camera modal
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 6.4 Wire capture button to handler
    - Connect onClick event to `handleCapture()`
    - _Requirements: 4.1_
  
  - [ ]* 6.5 Write property test for image capture round trip
    - **Property 3: Image Capture Round Trip**
    - **Validates: Requirements 4.3, 4.4**
  
  - [ ]* 6.6 Write property test for flash effect timing
    - **Property 6: Flash Effect Timing**
    - **Validates: Requirements 4.2**
  
  - [ ]* 6.7 Write property test for image quality consistency
    - **Property 10: Image Quality Consistency**
    - **Validates: Requirements 4.4**
  
  - [ ]* 6.8 Write unit tests for capture functionality
    - Test capture creates valid base64 string
    - Test captured image has correct format and quality
    - Test flash effect shows and hides correctly
    - Test camera closes after capture
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 7. Checkpoint - Verify photo capture works
  - Ensure capture button takes photo
  - Verify flash effect displays correctly
  - Verify captured image appears in chat input area
  - Verify camera closes after capture
  - Ask the user if questions arise

- [x] 8. Integrate with AI analysis service
  - [x] 8.1 Modify `handleSendMessage()` to handle camera-captured images
    - Check if currentImage exists and was captured from camera
    - Use existing `analyzePlantImage()` call with captured image
    - Display AI response in chat thread
    - Handle AI analysis errors
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 8.2 Add quota verification before AI call
    - Check user has remaining quota before sending image
    - Display quota exceeded message if no quota remaining
    - Update quota after successful AI analysis
    - _Requirements: 5.5, 6.4, 6.5_
  
  - [ ]* 8.3 Write property test for authentication guard
    - **Property 5: Authentication Guard**
    - **Validates: Requirements 6.1, 6.2, 6.3**
  
  - [ ]* 8.4 Write property test for quota validation
    - **Property 9: Quota Validation**
    - **Validates: Requirements 6.4, 6.5**
  
  - [ ]* 8.5 Write integration tests for AI flow
    - Test camera capture → AI analysis → display result
    - Test quota check prevents AI call when exceeded
    - Test error handling for AI failures
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.4, 6.5_

- [x] 9. Implement error handling and user feedback
  - [x] 9.1 Add error state display in camera modal
    - Show error message overlay when cameraError is set
    - Display appropriate message based on error type
    - Add retry button for recoverable errors
    - Add close button for all errors
    - _Requirements: 10.1, 10.2, 10.4, 10.5_
  
  - [x] 9.2 Add error handling in camera initialization
    - Catch NotAllowedError and set 'permission-denied' error
    - Catch NotFoundError and set 'not-supported' error
    - Catch other errors and set 'initialization-failed' error
    - Log errors to console for debugging
    - _Requirements: 1.3, 1.5, 10.1, 10.2_
  
  - [x] 9.3 Add error handling in camera switching
    - Catch switch errors and revert to previous camera
    - Display error message for failed switch
    - Keep camera open with previous stream
    - _Requirements: 10.4_
  
  - [x] 9.4 Add error handling in AI analysis
    - Display AI errors in chat thread
    - Provide retry option for failed analysis
    - Keep captured image for retry
    - _Requirements: 5.4, 10.5_
  
  - [ ]* 9.5 Write property test for error state recovery
    - **Property 8: Error State Recovery**
    - **Validates: Requirements 10.1, 10.2, 10.4**
  
  - [ ]* 9.6 Write unit tests for error handling
    - Test permission denied shows correct message
    - Test not supported hides camera button
    - Test initialization failure shows retry option
    - Test switch failure reverts to previous camera
    - Test AI failure shows error in chat
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10. Add responsive design and mobile optimizations
  - [x] 10.1 Add responsive styles for camera modal
    - Use full viewport on mobile devices
    - Center and constrain on desktop
    - Adjust control button sizes for touch
    - Test on iOS Safari and Android Chrome
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 10.2 Add orientation change handling
    - Listen for orientation change events
    - Maintain proper video aspect ratio
    - Adjust reticle size if needed
    - _Requirements: 8.4_
  
  - [ ]* 10.3 Write unit tests for responsive behavior
    - Test modal uses full viewport on mobile
    - Test button sizes are touch-friendly
    - Test video maintains aspect ratio
    - _Requirements: 8.1, 8.3, 8.4_

- [x] 11. Add cleanup on component unmount
  - [x] 11.1 Add useEffect cleanup for camera resources
    - Return cleanup function from useEffect
    - Call `stopCamera()` in cleanup
    - Clear all camera-related state
    - _Requirements: 7.2_
  
  - [ ]* 11.2 Write unit tests for unmount cleanup
    - Test camera stops on component unmount
    - Test refs are cleared on unmount
    - Test no memory leaks after unmount
    - _Requirements: 7.2_

- [x] 12. Final checkpoint - End-to-end testing
  - Test complete flow: open camera → switch camera → capture → AI analysis → result
  - Test error scenarios: permission denied, no camera, AI failure
  - Test resource cleanup: camera stops, refs cleared, no memory leaks
  - Test on multiple devices: desktop, mobile iOS, mobile Android
  - Verify quota system integration works correctly
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation reuses existing ChatBot infrastructure (auth, quota, AI service)
- Camera button is added inline, no separate component file needed
- All styling follows Ant Design + Tailwind CSS design system
- Focus on minimal, working implementation first, then add polish
