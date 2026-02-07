# Requirements Document

## Introduction

This document specifies the requirements for integrating direct camera capture functionality into the existing ChatBot component. The feature will allow users to capture photos directly from their device camera (front or back) with a focus reticle UI, flash effect, and seamless integration with the Gemini AI plant disease analysis service. This enhancement will complement the existing file picker upload functionality, providing a more streamlined user experience for real-time plant diagnosis.

## Glossary

- **ChatBot**: The existing chat interface component located at `src/components/ChatBot.js` that provides AI-powered agricultural assistance
- **Camera_Capture_Module**: The new camera functionality to be integrated into ChatBot
- **Focus_Reticle**: A visual UI overlay with corner markers and center dot that guides users to frame their subject
- **Flash_Effect**: A white overlay animation that simulates a camera flash when capturing an image
- **Gemini_AI**: The AI service (`analyzePlantImage` from `geminiService.js`) that analyzes plant images for disease detection
- **Camera_Stream**: The MediaStream object obtained from `navigator.mediaDevices.getUserMedia`
- **Facing_Mode**: Camera direction setting, either 'user' (front camera) or 'environment' (back camera)
- **Auth_Guard**: Authentication check that ensures users are logged in before using AI features
- **Quota_System**: The subscription-based usage tracking system that limits AI requests per user tier

## Requirements

### Requirement 1: Camera Access and Initialization

**User Story:** As a user, I want to open the camera directly from the ChatBot interface, so that I can quickly capture photos of my plants without using the file picker.

#### Acceptance Criteria

1. WHEN a user clicks the camera button in ChatBot, THE Camera_Capture_Module SHALL request camera permissions from the browser
2. WHEN camera permissions are granted, THE Camera_Capture_Module SHALL initialize the Camera_Stream with the environment (back) camera by default
3. WHEN camera permissions are denied, THE Camera_Capture_Module SHALL display an error message explaining that camera access is required
4. WHEN the Camera_Stream is active, THE Camera_Capture_Module SHALL display the live video preview in the ChatBot interface
5. IF the device does not support camera access, THEN THE Camera_Capture_Module SHALL display an error message and fall back to file picker only

### Requirement 2: Camera Preview UI

**User Story:** As a user, I want to see a live camera preview with visual guides, so that I can properly frame my plant photos before capturing.

#### Acceptance Criteria

1. WHEN the camera preview is active, THE Camera_Capture_Module SHALL display the Focus_Reticle overlay centered on the video stream
2. THE Focus_Reticle SHALL consist of four corner markers and a center dot with white borders and semi-transparent styling
3. WHEN displaying the front camera, THE Camera_Capture_Module SHALL mirror the video horizontally for natural selfie-style viewing
4. WHEN displaying the back camera, THE Camera_Capture_Module SHALL show the video without mirroring
5. THE Camera_Capture_Module SHALL maintain the camera preview aspect ratio without distortion

### Requirement 3: Camera Switching

**User Story:** As a user, I want to switch between front and back cameras, so that I can choose the best camera for capturing plant images.

#### Acceptance Criteria

1. WHEN the camera preview is active, THE Camera_Capture_Module SHALL display a camera switch button
2. WHEN a user clicks the camera switch button, THE Camera_Capture_Module SHALL stop the current Camera_Stream
3. WHEN switching cameras, THE Camera_Capture_Module SHALL toggle the Facing_Mode between 'user' and 'environment'
4. WHEN the new camera initializes, THE Camera_Capture_Module SHALL restart the Camera_Stream with the new Facing_Mode
5. WHERE the Facing_Mode is 'environment', THE Camera_Capture_Module SHALL apply advanced camera constraints for continuous focus, exposure, and white balance if supported by the device

### Requirement 4: Photo Capture

**User Story:** As a user, I want to capture a photo with a visual flash effect, so that I get clear feedback that my photo was taken.

#### Acceptance Criteria

1. WHEN the camera preview is active, THE Camera_Capture_Module SHALL display a capture button
2. WHEN a user clicks the capture button, THE Camera_Capture_Module SHALL display the Flash_Effect for 150 milliseconds
3. WHEN capturing a photo, THE Camera_Capture_Module SHALL draw the current video frame to a canvas element
4. WHEN the canvas is populated, THE Camera_Capture_Module SHALL convert the canvas content to a base64-encoded JPEG image with 0.8 quality
5. WHEN the image is captured, THE Camera_Capture_Module SHALL close the camera preview and return to the normal ChatBot interface

### Requirement 5: AI Integration

**User Story:** As a user, I want my captured photos to be automatically analyzed by Gemini AI, so that I can get instant plant disease diagnosis.

#### Acceptance Criteria

1. WHEN a photo is captured, THE Camera_Capture_Module SHALL send the base64 image data to the `analyzePlantImage` service
2. WHEN calling the AI service, THE Camera_Capture_Module SHALL include a default prompt requesting plant disease diagnosis and treatment recommendations
3. WHEN the AI analysis is complete, THE Camera_Capture_Module SHALL display the response in the ChatBot message thread
4. WHEN the AI analysis fails, THE Camera_Capture_Module SHALL display an error message in the ChatBot
5. WHEN AI analysis is triggered, THE Camera_Capture_Module SHALL update the user's quota through the subscription service

### Requirement 6: Authentication and Authorization

**User Story:** As a system administrator, I want to ensure only authenticated users can use camera capture for AI analysis, so that we can track usage and prevent abuse.

#### Acceptance Criteria

1. WHEN a user attempts to open the camera, THE Camera_Capture_Module SHALL verify the user is authenticated via Auth_Guard
2. IF the user is not authenticated, THEN THE Camera_Capture_Module SHALL display the EnhancedLoginModal
3. WHEN the user successfully logs in, THE Camera_Capture_Module SHALL proceed with camera initialization
4. WHEN a photo is captured, THE Camera_Capture_Module SHALL verify the user has remaining quota before sending to AI
5. IF the user has no remaining quota, THEN THE Camera_Capture_Module SHALL display a quota exceeded message with upgrade options

### Requirement 7: Camera Resource Management

**User Story:** As a developer, I want proper camera resource cleanup, so that camera streams are released when not in use and don't cause memory leaks.

#### Acceptance Criteria

1. WHEN the camera preview is closed, THE Camera_Capture_Module SHALL stop all tracks in the Camera_Stream
2. WHEN the ChatBot component unmounts, THE Camera_Capture_Module SHALL release all camera resources
3. WHEN switching cameras, THE Camera_Capture_Module SHALL stop the previous Camera_Stream before starting a new one
4. WHEN a photo is captured, THE Camera_Capture_Module SHALL stop the Camera_Stream after image extraction
5. THE Camera_Capture_Module SHALL set all camera-related refs to null after cleanup

### Requirement 8: Responsive Design and Mobile Support

**User Story:** As a mobile user, I want the camera capture feature to work seamlessly on my phone, so that I can easily diagnose plant issues in the field.

#### Acceptance Criteria

1. WHEN the camera preview is displayed on mobile devices, THE Camera_Capture_Module SHALL use full-screen or maximized viewport dimensions
2. WHEN on mobile devices, THE Camera_Capture_Module SHALL prioritize the back camera as the default
3. THE Camera_Capture_Module SHALL use touch-friendly button sizes for capture and switch controls
4. WHEN the device orientation changes, THE Camera_Capture_Module SHALL maintain proper video aspect ratio
5. THE Camera_Capture_Module SHALL work on both iOS Safari and Android Chrome browsers

### Requirement 9: UI Integration with Existing ChatBot

**User Story:** As a user, I want the camera feature to feel like a natural part of the ChatBot, so that I have a seamless experience.

#### Acceptance Criteria

1. THE Camera_Capture_Module SHALL add a new camera button next to the existing file picker button in the ChatBot input area
2. WHEN the camera preview is active, THE Camera_Capture_Module SHALL overlay the ChatBot interface or expand to show the camera view
3. WHEN the camera preview is active, THE Camera_Capture_Module SHALL provide a close button to return to normal chat
4. THE Camera_Capture_Module SHALL use Ant Design components and Tailwind CSS classes consistent with the existing ChatBot styling
5. WHEN a photo is captured, THE Camera_Capture_Module SHALL display a preview thumbnail in the chat input area similar to file uploads

### Requirement 10: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when something goes wrong with the camera, so that I know how to resolve issues.

#### Acceptance Criteria

1. WHEN camera initialization fails, THE Camera_Capture_Module SHALL display a user-friendly error message
2. WHEN camera permissions are denied, THE Camera_Capture_Module SHALL provide instructions on how to enable camera access
3. WHEN the device has no camera, THE Camera_Capture_Module SHALL hide the camera button and show only the file picker
4. WHEN switching cameras fails, THE Camera_Capture_Module SHALL revert to the previous working camera
5. WHEN AI analysis fails, THE Camera_Capture_Module SHALL display the error in the chat thread with retry options
