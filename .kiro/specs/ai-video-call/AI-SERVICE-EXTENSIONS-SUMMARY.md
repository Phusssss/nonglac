# AI Service Extensions - Summary

## Overview

Section 9 (Extend AI Service) has been completed successfully. This document summarizes the new functions added to the AI Service to support the AI Video Call feature.

## Implementation Details

### 1. analyzeVideoFrame Function

**Purpose**: Optimized image analysis specifically for video call frames

**Signature**:
```javascript
async analyzeVideoFrame(base64Image, context = '')
```

**Parameters**:
- `base64Image` (string): Base64-encoded JPEG image from video frame
- `context` (string, optional): Additional context about the conversation or user query

**Features**:
- Smaller size limit (2MB vs 4MB for regular images) optimized for video frames
- Context-aware prompts that incorporate conversation history
- Marked as 'video_frame' type for backend optimization
- Returns formatted AI response with confidence score

**Use Case**:
```javascript
import { analyzeVideoFrame } from './services/aiService';

const context = 'Người dùng đang hỏi về bệnh hại trên lá';
const result = await analyzeVideoFrame(capturedFrame, context);

if (result.success) {
  console.log(result.result); // Formatted HTML response
  console.log(result.confidence); // 0.0 - 1.0
}
```

**Error Handling**:
- Returns `null` if user not authenticated
- Throws error for oversized frames (> 2MB)
- Validates image data before processing
- Logs errors to error handler with context

---

### 2. processToolCall Function

**Purpose**: Process tool calls from Gemini AI during video call sessions

**Signature**:
```javascript
async processToolCall(toolCall)
```

**Parameters**:
- `toolCall` (object): Tool call object from Gemini AI
  - `name` (string): Tool name ('lookup_price', 'diagnose_disease', 'find_agri_store')
  - `args` (object): Tool-specific arguments

**Supported Tools**:

#### 2.1 lookup_price
Retrieves current agricultural product prices

**Arguments**:
- `product` (string): Product name (e.g., "Lúa", "Cà phê")
- `region` (string, optional): Region name (defaults to "Việt Nam")

**Returns**:
```javascript
{
  success: true,
  tool: 'lookup_price',
  result: {
    product: 'Lúa',
    region: 'Đồng bằng sông Cửu Long',
    price: '6,500 đồng/kg',
    priceRange: { min: 6000, max: 7000 },
    unit: 'kg',
    lastUpdated: '2026-02-07T10:00:00Z',
    source: 'Sở Nông nghiệp'
  }
}
```

#### 2.2 diagnose_disease
Diagnoses plant diseases based on symptoms

**Arguments**:
- `crop` (string): Crop type (e.g., "Lúa", "Cà phê")
- `symptoms` (string): Description of symptoms

**Returns**:
```javascript
{
  success: true,
  tool: 'diagnose_disease',
  result: {
    crop: 'Lúa',
    disease: 'Bệnh đạo ôn',
    confidence: 0.9,
    symptoms: ['Lá vàng', 'Đốm nâu'],
    treatment: 'Sử dụng thuốc diệt nấm',
    prevention: 'Cải thiện thoát nước',
    severity: 'medium'
  }
}
```

#### 2.3 find_agri_store
Finds nearby agricultural stores

**Arguments**:
- `productType` (string, optional): Type of product needed
- `location` (string, optional): Location to search near

**Returns**:
```javascript
{
  success: true,
  tool: 'find_agri_store',
  result: {
    stores: [
      {
        name: 'Cửa hàng Nông Sản Xanh',
        address: '123 Đường ABC',
        phone: '0123456789',
        distance: 2.5
      }
    ],
    location: 'TP. Hồ Chí Minh',
    productType: 'Phân bón',
    totalResults: 2
  }
}
```

**Error Handling**:
- Returns `null` if user not authenticated
- Returns fallback data with `success: false` on API errors
- Validates tool call structure
- Throws error for unsupported tools
- Logs all errors with tool context

**Use Case**:
```javascript
import { processToolCall } from './services/aiService';

const toolCall = {
  name: 'lookup_price',
  args: {
    product: 'Lúa',
    region: 'Đồng bằng sông Cửu Long'
  }
};

const result = await processToolCall(toolCall);

if (result.success) {
  console.log(`Giá ${result.result.product}: ${result.result.price}`);
} else {
  console.error('Tool call failed:', result.result.error);
}
```

---

### 3. Private Helper Methods

Three private helper methods were added to handle individual tool calls:

#### _handleLookupPrice(args)
- Calls backend API endpoint `/tools/lookup-price`
- Returns structured price data
- Provides fallback data on error

#### _handleDiagnoseDisease(args)
- Calls backend API endpoint `/tools/diagnose-disease`
- Returns disease diagnosis with treatment recommendations
- Provides fallback data on error

#### _handleFindAgriStore(args)
- Calls backend API endpoint `/tools/find-agri-store`
- Returns list of nearby stores
- Provides fallback data on error

---

## Exports

All new functions are exported for use throughout the application:

```javascript
// Named exports
export const analyzeVideoFrame = (base64Image, context) => 
  aiService.analyzeVideoFrame(base64Image, context);

export const processToolCall = (toolCall) => 
  aiService.processToolCall(toolCall);

// Also available via default export
import aiService from './services/aiService';
aiService.analyzeVideoFrame(image, context);
aiService.processToolCall(toolCall);
```

---

## Integration with Video Call Service

The new functions integrate seamlessly with the VideoCallService:

```javascript
// In VideoCallService
import { analyzeVideoFrame, processToolCall } from '../services/aiService';

// Analyze captured frame
async captureAndAnalyze() {
  const frame = this.captureImage(videoElement);
  const context = this.buildContext(); // Build from conversation history
  
  const result = await analyzeVideoFrame(frame, context);
  // Handle result...
}

// Handle tool calls from Gemini
async handleToolCall(toolCall) {
  const result = await processToolCall(toolCall);
  return result;
}
```

---

## Testing

### Test Coverage

Created comprehensive test suite (`aiService.videoCall.test.js`) with 13 tests:

1. **analyzeVideoFrame Tests** (4 tests)
   - ✅ Analyze with context
   - ✅ Analyze without context
   - ✅ Reject oversized frames
   - ✅ Return null when not authenticated

2. **processToolCall Tests** (7 tests)
   - ✅ Process lookup_price
   - ✅ Process diagnose_disease
   - ✅ Process find_agri_store
   - ✅ Handle invalid tool
   - ✅ Handle missing tool name
   - ✅ Return fallback on API error
   - ✅ Return null when not authenticated

3. **Integration Tests** (2 tests)
   - ✅ Maintain backward compatibility
   - ✅ Handle API errors gracefully

### Test Results

✅ **All 13 tests passed successfully**

---

## Backend API Requirements

The new functions require the following backend API endpoints:

### 1. POST /api/ai/image
**Existing endpoint** - Enhanced to handle `type: 'video_frame'` parameter

**Request**:
```json
{
  "image": "base64_encoded_image",
  "prompt": "Analysis prompt with context",
  "userId": "user_id",
  "type": "video_frame"
}
```

### 2. POST /api/ai/tools/lookup-price
**New endpoint** - Price lookup tool

**Request**:
```json
{
  "product": "Lúa",
  "region": "Đồng bằng sông Cửu Long",
  "userId": "user_id"
}
```

### 3. POST /api/ai/tools/diagnose-disease
**New endpoint** - Disease diagnosis tool

**Request**:
```json
{
  "crop": "Lúa",
  "symptoms": "Lá vàng, có đốm nâu",
  "userId": "user_id"
}
```

### 4. POST /api/ai/tools/find-agri-store
**New endpoint** - Store finder tool

**Request**:
```json
{
  "productType": "Phân bón",
  "location": "TP. Hồ Chí Minh",
  "userId": "user_id"
}
```

---

## Benefits

1. **Optimized for Video Calls**
   - Smaller size limits for faster processing
   - Context-aware analysis
   - Backend optimization markers

2. **Tool Call Support**
   - Structured tool execution
   - Fallback data on errors
   - Consistent error handling

3. **Backward Compatible**
   - Existing functions unchanged
   - New functions follow same patterns
   - Consistent API design

4. **Well Tested**
   - Comprehensive test coverage
   - Error scenarios covered
   - Integration tests included

5. **Production Ready**
   - Error handling and logging
   - Authentication checks
   - Size validation
   - Graceful degradation

---

## Usage Examples

### Example 1: Video Frame Analysis with Context

```javascript
import { analyzeVideoFrame } from './services/aiService';

// During video call, capture and analyze frame
const capturedFrame = captureFrame(videoElement);
const conversationContext = 'Người dùng hỏi về bệnh trên lá lúa';

try {
  const result = await analyzeVideoFrame(capturedFrame, conversationContext);
  
  if (result && result.success) {
    // Display formatted result to user
    displayAIResponse(result.result);
    
    // Track usage
    trackAIUsage(result.usage);
  }
} catch (error) {
  console.error('Analysis failed:', error);
  showErrorMessage('Không thể phân tích hình ảnh');
}
```

### Example 2: Processing Tool Calls

```javascript
import { processToolCall } from './services/aiService';

// When Gemini requests a tool call
geminiService.onMessage(async (message) => {
  if (message.toolCall) {
    try {
      const result = await processToolCall(message.toolCall);
      
      if (result.success) {
        // Send result back to Gemini
        geminiService.sendToolResponse(result);
      } else {
        // Handle error
        console.error('Tool execution failed:', result.result.error);
      }
    } catch (error) {
      console.error('Tool call error:', error);
    }
  }
});
```

### Example 3: Price Lookup

```javascript
import { processToolCall } from './services/aiService';

const priceToolCall = {
  name: 'lookup_price',
  args: {
    product: 'Cà phê',
    region: 'Tây Nguyên'
  }
};

const result = await processToolCall(priceToolCall);

if (result.success) {
  console.log(`Giá ${result.result.product} tại ${result.result.region}:`);
  console.log(`${result.result.price} (${result.result.unit})`);
  console.log(`Cập nhật: ${result.result.lastUpdated}`);
}
```

---

## Future Enhancements

1. **Caching**
   - Cache tool call results for common queries
   - Reduce API calls and improve response time

2. **Batch Processing**
   - Process multiple tool calls in parallel
   - Optimize for complex queries

3. **Offline Support**
   - Local fallback data for common tools
   - Queue tool calls when offline

4. **Analytics**
   - Track tool usage patterns
   - Monitor success rates
   - Identify popular queries

---

## Conclusion

The AI Service has been successfully extended with two new functions that enable the AI Video Call feature to:
- Analyze video frames with conversation context
- Execute tool calls for price lookup, disease diagnosis, and store finding
- Provide structured, reliable results with proper error handling

All functions are well-tested, production-ready, and follow the existing service patterns for consistency and maintainability.
