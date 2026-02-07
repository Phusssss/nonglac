# Design Document: Camera Capture Integration for ChatBot

## Overview

This design integrates direct camera capture functionality into the existing ChatBot component (`src/components/ChatBot.js`). The implementation will add a camera button alongside the existing file picker, allowing users to capture photos with a focus reticle UI and flash effect. Captured images will be seamlessly sent to the Gemini AI service for plant disease analysis.

The design follows the Ant Design + Tailwind CSS design system, maintains the existing ChatBot architecture, and ensures proper resource management and error handling.

## Architecture

### High-Level Component Structure

```
ChatBot (existing)
├── Camera Button (new)
├── Camera Preview Modal (new)
│   ├── Video Stream Display
│   ├── Focus Reticle Overlay
│   ├── Camera Controls
│   │   ├── Switch Camera Button
│   │   ├── Capture Button
│   │   └── Close Button
│   └── Flash Effect Overlay
└── Existing Components
    ├── File Picker Button
    ├── Message Thread
    └── Input Area
```

### State Management

New state variables to be added to ChatBot component:

```javascript
// Camera states
const [isCameraOpen, setIsCameraOpen] = useState(false);
const [cameraStream, setCameraStream] = useState(null);
const [facingMode, setFacingMode] = useState('environment');
const [showFlash, setShowFlash] = useState(false);
const [cameraError, setCameraError] = useState(null);

// Refs for camera functionality
const videoRef = useRef(null);
const canvasRef = useRef(null);
```

### Integration Points

1. **Gemini Service**: Uses existing `analyzePlantImage(base64Image, prompt)` function
2. **Auth Guard**: Uses existing `requireAuthForAI()` wrapper
3. **Quota System**: Uses existing `updateQuota()` function
4. **Message System**: Uses existing `setMessages()` and `addToHistory()` functions

## Components and Interfaces

### 1. Camera Button Component

**Location**: Inline in ChatBot component, next to file picker button

**Implementation**:
```javascript
<button
  type="button"
  onClick={handleOpenCamera}
  style={{
    background: '#4CAF50',
    border: 'none',
    color: 'white',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px'
  }}
  title="Chụp ảnh trực tiếp"
>
  📸
</button>
```

**Behavior**:
- Triggers `handleOpenCamera()` which checks auth and opens camera modal
- Disabled when camera is not supported
- Hidden on devices without camera capability

### 2. Camera Preview Modal

**Structure**: Full-screen overlay modal using Ant Design Modal or custom div overlay

**Layout**:
```javascript
<div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#000',
  zIndex: 2000,
  display: 'flex',
  flexDirection: 'column'
}}>
  {/* Header with close button */}
  {/* Video preview with reticle */}
  {/* Camera controls */}
  {/* Flash effect overlay */}
</div>
```

**Responsive Behavior**:
- Mobile: Full viewport height and width
- Desktop: Centered modal with max dimensions

### 3. Video Stream Component

**Implementation**:
```javascript
<video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
  }}
/>
```

**Constraints**:
- Default resolution: 1920x1080 (ideal)
- Facing mode: 'environment' (back camera) by default
- Advanced constraints for back camera: continuous focus, exposure, white balance

### 4. Focus Reticle Overlay

**Design**: Centered square with corner markers and center dot

**Implementation**:
```javascript
<div style={{
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '280px',
  height: '280px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderRadius: '12px',
  pointerEvents: 'none'
}}>
  {/* Top-left corner */}
  <div style={{
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    width: '24px',
    height: '24px',
    borderTop: '4px solid white',
    borderLeft: '4px solid white',
    borderRadius: '4px 0 0 0'
  }} />
  {/* Top-right corner */}
  <div style={{
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '24px',
    height: '24px',
    borderTop: '4px solid white',
    borderRight: '4px solid white',
    borderRadius: '0 4px 0 0'
  }} />
  {/* Bottom-left corner */}
  <div style={{
    position: 'absolute',
    bottom: '-2px',
    left: '-2px',
    width: '24px',
    height: '24px',
    borderBottom: '4px solid white',
    borderLeft: '4px solid white',
    borderRadius: '0 0 0 4px'
  }} />
  {/* Bottom-right corner */}
  <div style={{
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '24px',
    height: '24px',
    borderBottom: '4px solid white',
    borderRight: '4px solid white',
    borderRadius: '0 0 4px 0'
  }} />
  {/* Center dot */}
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '8px',
    height: '8px',
    backgroundColor: 'white',
    borderRadius: '50%',
    opacity: 0.6
  }} />
</div>
```

### 5. Camera Controls

**Layout**: Bottom-centered control bar with three buttons

**Buttons**:
1. **Switch Camera** (left): Toggles between front/back camera
2. **Capture** (center): Large circular button to take photo
3. **Close** (right): Closes camera and returns to chat

**Implementation**:
```javascript
<div style={{
  position: 'absolute',
  bottom: '40px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '40px',
  alignItems: 'center'
}}>
  {/* Switch camera button */}
  <button
    onClick={handleSwitchCamera}
    style={{
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer'
    }}
  >
    🔄
  </button>
  
  {/* Capture button */}
  <button
    onClick={handleCapture}
    style={{
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      backgroundColor: 'white',
      border: '4px solid rgba(255,255,255,0.5)',
      cursor: 'pointer'
    }}
  />
  
  {/* Close button */}
  <button
    onClick={handleCloseCamera}
    style={{
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer'
    }}
  >
    ✕
  </button>
</div>
```

### 6. Flash Effect Overlay

**Implementation**:
```javascript
<div style={{
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'white',
  opacity: showFlash ? 0.8 : 0,
  transition: 'opacity 150ms ease-out',
  pointerEvents: 'none',
  zIndex: 100
}} />
```

**Animation**: Fade in (0ms) → Fade out (150ms)

## Data Models

### Camera State Interface

```javascript
// Camera configuration
interface CameraConfig {
  facingMode: 'user' | 'environment';
  width: { ideal: number };
  height: { ideal: number };
  advanced?: MediaTrackConstraints[];
}

// Captured image data (reuses existing structure)
interface CapturedImage {
  data: string;        // base64 encoded image
  type: string;        // 'image/jpeg'
  url: string;         // data URL for preview
}

// Camera error types
type CameraError = 
  | 'permission-denied'
  | 'not-supported'
  | 'initialization-failed'
  | 'switch-failed'
  | null;
```

### Function Signatures

```javascript
// Camera lifecycle functions
const handleOpenCamera = async () => Promise<void>
const handleCloseCamera = () => void
const initializeCamera = async (facingMode: 'user' | 'environment') => Promise<MediaStream>
const stopCamera = () => void

// Camera operations
const handleSwitchCamera = async () => Promise<void>
const handleCapture = async () => Promise<void>
const captureImageFromVideo = () => string  // Returns base64

// Helper functions
const applyAdvancedConstraints = async (track: MediaStreamTrack) => Promise<void>
const checkCameraSupport = () => boolean
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Camera Resource Cleanup

*For any* camera session, when the camera is closed or the component unmounts, all MediaStream tracks should be stopped and refs should be set to null.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 2: Camera Stream Initialization

*For any* camera initialization request with a valid facing mode, the system should either return a valid MediaStream or throw a specific error type.

**Validates: Requirements 1.1, 1.2, 1.5**

### Property 3: Image Capture Round Trip

*For any* active video stream, capturing an image should produce a valid base64-encoded JPEG string that can be decoded back to an image.

**Validates: Requirements 4.3, 4.4**

### Property 4: Facing Mode Toggle

*For any* camera session, switching the facing mode should stop the current stream and start a new stream with the opposite facing mode.

**Validates: Requirements 3.2, 3.3, 3.4**

### Property 5: Authentication Guard

*For any* camera operation that triggers AI analysis, the user must be authenticated before the operation proceeds.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 6: Flash Effect Timing

*For any* capture operation, the flash effect should be visible for exactly 150ms before fading out.

**Validates: Requirements 4.2**

### Property 7: Video Mirroring Consistency

*For any* camera stream, when facing mode is 'user', the video should be horizontally mirrored; when 'environment', it should not be mirrored.

**Validates: Requirements 2.3, 2.4**

### Property 8: Error State Recovery

*For any* camera error, the system should display an appropriate error message and allow the user to retry or close the camera.

**Validates: Requirements 10.1, 10.2, 10.4**

### Property 9: Quota Validation

*For any* AI analysis request, the system should verify the user has remaining quota before sending the image to the AI service.

**Validates: Requirements 6.4, 6.5**

### Property 10: Image Quality Consistency

*For any* captured image, the JPEG quality should be 0.8 and the format should be 'image/jpeg'.

**Validates: Requirements 4.4**

## Error Handling

### Error Types and Responses

| Error Type | Trigger | User Message | Recovery Action |
|------------|---------|--------------|-----------------|
| `permission-denied` | User denies camera permission | "Cần quyền truy cập camera. Vui lòng cho phép trong cài đặt trình duyệt." | Show instructions, close camera |
| `not-supported` | Browser doesn't support getUserMedia | "Trình duyệt không hỗ trợ camera. Vui lòng sử dụng trình duyệt hiện đại hơn." | Hide camera button, show file picker only |
| `initialization-failed` | Camera fails to start | "Không thể khởi động camera. Vui lòng thử lại." | Retry button, close button |
| `switch-failed` | Camera switch fails | "Không thể chuyển camera. Tiếp tục với camera hiện tại." | Revert to previous camera |
| `capture-failed` | Image capture fails | "Không thể chụp ảnh. Vui lòng thử lại." | Retry capture |
| `ai-analysis-failed` | AI service error | "Không thể phân tích ảnh. Vui lòng thử lại sau." | Retry button, show error in chat |

### Error Handling Flow

```javascript
const handleOpenCamera = async () => {
  return requireAuthForAI(async () => {
    try {
      // Check camera support
      if (!checkCameraSupport()) {
        setCameraError('not-supported');
        return;
      }
      
      // Request camera access
      const stream = await initializeCamera(facingMode);
      setCameraStream(stream);
      setIsCameraOpen(true);
      setCameraError(null);
      
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        setCameraError('permission-denied');
      } else {
        setCameraError('initialization-failed');
      }
      console.error('Camera initialization error:', error);
    }
  });
};
```

### Graceful Degradation

1. **No camera support**: Hide camera button, show only file picker
2. **Permission denied**: Show error message with instructions, keep file picker available
3. **Camera switch fails**: Revert to previous working camera
4. **Capture fails**: Allow retry without closing camera
5. **AI analysis fails**: Show error in chat, keep captured image for retry

## Testing Strategy

### Unit Tests

Unit tests will focus on specific examples, edge cases, and error conditions:

1. **Camera Support Detection**
   - Test `checkCameraSupport()` returns true when `navigator.mediaDevices.getUserMedia` exists
   - Test returns false when API is not available

2. **Image Capture**
   - Test `captureImageFromVideo()` returns valid base64 string
   - Test captured image has correct JPEG format and quality
   - Test canvas dimensions match video dimensions

3. **Error Handling**
   - Test permission denied error displays correct message
   - Test unsupported browser hides camera button
   - Test camera initialization failure shows retry option

4. **Resource Cleanup**
   - Test `stopCamera()` stops all MediaStream tracks
   - Test refs are set to null after cleanup
   - Test cleanup on component unmount

5. **Authentication**
   - Test camera open requires authentication
   - Test unauthenticated user sees login modal
   - Test authenticated user can proceed

### Property-Based Tests

Property tests will verify universal properties across all inputs. Each test should run a minimum of 100 iterations.

**Test Configuration**: Use `fast-check` library for JavaScript property-based testing.

**Property Test 1: Camera Resource Cleanup**
```javascript
// Feature: camera-capture-chatbot, Property 1: Camera Resource Cleanup
test('camera resources are always cleaned up', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.constantFrom('user', 'environment'),
      async (facingMode) => {
        // Initialize camera
        const stream = await initializeCamera(facingMode);
        expect(stream).toBeTruthy();
        expect(stream.getTracks().length).toBeGreaterThan(0);
        
        // Stop camera
        stopCamera();
        
        // Verify all tracks are stopped
        stream.getTracks().forEach(track => {
          expect(track.readyState).toBe('ended');
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test 2: Image Capture Round Trip**
```javascript
// Feature: camera-capture-chatbot, Property 3: Image Capture Round Trip
test('captured images can be decoded back to valid images', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 640, max: 1920 }),
      fc.integer({ min: 480, max: 1080 }),
      async (width, height) => {
        // Create mock video element with dimensions
        const mockVideo = createMockVideo(width, height);
        videoRef.current = mockVideo;
        
        // Capture image
        const base64 = captureImageFromVideo();
        
        // Verify format
        expect(base64).toMatch(/^[A-Za-z0-9+/=]+$/);
        
        // Verify can be decoded
        const img = new Image();
        const loaded = new Promise(resolve => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        });
        img.src = `data:image/jpeg;base64,${base64}`;
        
        expect(await loaded).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test 3: Facing Mode Toggle**
```javascript
// Feature: camera-capture-chatbot, Property 4: Facing Mode Toggle
test('switching facing mode always changes camera', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.constantFrom('user', 'environment'),
      async (initialMode) => {
        // Start with initial mode
        setFacingMode(initialMode);
        const stream1 = await initializeCamera(initialMode);
        const track1Id = stream1.getVideoTracks()[0].id;
        
        // Switch camera
        await handleSwitchCamera();
        
        // Verify mode changed
        const expectedMode = initialMode === 'user' ? 'environment' : 'user';
        expect(facingMode).toBe(expectedMode);
        
        // Verify new stream
        const stream2 = cameraStream;
        const track2Id = stream2.getVideoTracks()[0].id;
        expect(track2Id).not.toBe(track1Id);
        
        // Verify old stream stopped
        expect(stream1.getVideoTracks()[0].readyState).toBe('ended');
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test 4: Authentication Guard**
```javascript
// Feature: camera-capture-chatbot, Property 5: Authentication Guard
test('camera operations require authentication', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.boolean(),
      async (isAuthenticated) => {
        // Mock auth state
        mockAuthState(isAuthenticated);
        
        // Attempt to open camera
        let cameraOpened = false;
        let loginModalShown = false;
        
        const originalSetShowLoginModal = setShowLoginModal;
        setShowLoginModal = (show) => {
          loginModalShown = show;
          originalSetShowLoginModal(show);
        };
        
        await handleOpenCamera();
        
        if (isAuthenticated) {
          expect(cameraOpened || isCameraOpen).toBe(true);
          expect(loginModalShown).toBe(false);
        } else {
          expect(loginModalShown).toBe(true);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test 5: Video Mirroring Consistency**
```javascript
// Feature: camera-capture-chatbot, Property 7: Video Mirroring Consistency
test('video mirroring matches facing mode', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('user', 'environment'),
      (mode) => {
        setFacingMode(mode);
        
        // Get video transform style
        const videoElement = videoRef.current;
        const transform = videoElement.style.transform;
        
        if (mode === 'user') {
          expect(transform).toContain('scaleX(-1)');
        } else {
          expect(transform).not.toContain('scaleX(-1)');
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test 6: Image Quality Consistency**
```javascript
// Feature: camera-capture-chatbot, Property 10: Image Quality Consistency
test('all captured images have consistent quality', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 1, max: 10 }),
      async (captureCount) => {
        const images = [];
        
        for (let i = 0; i < captureCount; i++) {
          const base64 = captureImageFromVideo();
          images.push(base64);
        }
        
        // Verify all images are valid JPEG base64
        images.forEach(img => {
          expect(img).toMatch(/^[A-Za-z0-9+/=]+$/);
          
          // Decode and verify JPEG header
          const decoded = atob(img.substring(0, 20));
          expect(decoded.charCodeAt(0)).toBe(0xFF); // JPEG marker
          expect(decoded.charCodeAt(1)).toBe(0xD8); // JPEG marker
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Tests

1. **End-to-End Camera Flow**
   - Open camera → Switch camera → Capture → AI analysis → Display result
   - Verify each step completes successfully
   - Verify resources are cleaned up at the end

2. **Error Recovery Flow**
   - Trigger permission denied → Show error → Close camera → Retry with file picker
   - Verify graceful degradation

3. **Quota Integration**
   - Capture image → Verify quota check → Send to AI → Update quota
   - Verify quota exceeded prevents AI call

### Testing Notes

- Unit tests focus on specific examples and edge cases
- Property tests verify universal correctness across many inputs
- Both testing approaches are complementary and necessary
- Property tests should run minimum 100 iterations due to randomization
- Each property test references its design document property via comment tag
