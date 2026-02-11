# Image Upload Testing Guide

## Overview
This guide helps you test the new image upload functionality in the dual-model video call feature.

## What Was Fixed
1. **Model Name**: Changed from `gemini-1.5-pro-latest` to `gemini-1.5-flash-latest`
   - The previous model names were causing 404 errors
   - `gemini-1.5-flash-latest` is the correct stable model for vision tasks

2. **Upload Implementation**: Complete and working
   - File validation (images only, max 10MB)
   - Base64 conversion
   - Dual-model processing via OrchestratorService
   - Same analysis logic as camera capture

## Testing Steps

### 1. Start the Application
```bash
npm start
```

### 2. Navigate to Video Call
- Go to the AI Video Call page
- The session should start automatically
- Camera should auto-start (back camera on mobile)

### 3. Test Image Upload

#### A. Click Upload Button
- Look for the 🖼️ (picture) icon button in the controls
- It's located between the capture button and camera switch button

#### B. Select an Image
- Click the upload button
- Choose an image file (JPG, PNG, etc.)
- Max size: 10MB

#### C. Verify Processing
- Status should change to "analyzing"
- Mascot message: "Chờ Lạc Lạc 1 xíu nhé..."
- Wait for AI analysis response

#### D. Check Response
- AI should analyze the image
- Response appears in mascot message
- Status returns to "listening"

### 4. Test Different Scenarios

#### Valid Images
- ✅ Small image (< 1MB)
- ✅ Medium image (1-5MB)
- ✅ Large image (5-10MB)
- ✅ Different formats (JPG, PNG, WEBP)

#### Invalid Cases
- ❌ Non-image file (should show error: "Vui lòng chọn file ảnh")
- ❌ Image > 10MB (should show error: "Ảnh quá lớn")

### 5. Compare with Camera Capture
- Upload an image
- Capture the same scene with camera
- Both should use the same analysis logic
- Both should produce similar quality results

## Expected Behavior

### Success Flow
1. User clicks upload button
2. File picker opens
3. User selects image
4. Status → "analyzing"
5. Image converted to base64
6. Sent to OrchestratorService
7. Analysis Model processes image
8. Response displayed in mascot
9. Status → "listening"

### Error Handling
- **Wrong file type**: "Vui lòng chọn file ảnh (JPG, PNG, etc.)"
- **File too large**: "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB"
- **API error**: "Không thể phân tích ảnh"
- **Network error**: Appropriate error message

## Troubleshooting

### Upload Button Not Visible
- Check if `REACT_APP_USE_DUAL_MODEL_VIDEO_CALL=true` in `.env`
- Verify VideoCallControls is rendering
- Check browser console for errors

### Upload Not Working
1. **Check Console Logs**
   - Look for "useVideoCallV2: === UPLOAD AND ANALYZE START ==="
   - Check for file validation messages
   - Look for base64 conversion logs

2. **Verify API Key**
   - Check `.env` has valid `REACT_APP_GEMINI_API_KEY`
   - Key should start with "AIza"
   - Key should be at least 30 characters

3. **Check Model Name**
   - Open `src/services/AnalysisModelService.js`
   - Line 107 should have: `modelName = 'gemini-1.5-flash-latest'`

4. **Network Issues**
   - Check browser network tab
   - Look for requests to Gemini API
   - Check for 404 or 403 errors

### Analysis Fails
- **Simulation Mode**: If API key is invalid, app runs in simulation mode
- **API Quota**: Check if you've exceeded Gemini API quota
- **Model Access**: Verify your API key has access to vision models

## Console Debugging

### Key Log Messages
```javascript
// Upload started
"useVideoCallV2: === UPLOAD AND ANALYZE START ==="
"useVideoCallV2: File: [filename] [type] [size]"

// Validation
"useVideoCallV2: File converted to base64"
"useVideoCallV2: Image size: [X] KB"

// Processing
"useVideoCallV2: Sending image to orchestrator..."
"useVideoCallV2: Image sent successfully, orchestrator handling analysis..."

// Success
"useVideoCallV2: === IMAGE ANALYSIS END ==="
```

### Error Messages
```javascript
// File errors
"useVideoCallV2: No file provided"
"useVideoCallV2: Error uploading and analyzing:"

// API errors
"AnalysisModelService: Error analyzing image:"
"models/[model-name] is not found for API version v1beta"
```

## Success Criteria
- ✅ Upload button visible and clickable
- ✅ File picker opens on click
- ✅ Image files accepted
- ✅ Non-image files rejected
- ✅ Large files (>10MB) rejected
- ✅ Valid images processed successfully
- ✅ AI analysis response displayed
- ✅ Same quality as camera capture
- ✅ No console errors
- ✅ Proper error messages for failures

## Next Steps
After successful testing:
1. Test with various plant images
2. Compare accuracy with camera capture
3. Test on different devices (mobile, tablet, desktop)
4. Test with different network conditions
5. Verify tool calls work (price lookup, diagnosis, store finder)

## Notes
- Upload uses the same `analyzeImage()` function as camera capture
- Both go through OrchestratorService for dual-model processing
- Analysis Model handles vision processing
- Audio Model handles voice interactions
- Upload does NOT require camera permission
