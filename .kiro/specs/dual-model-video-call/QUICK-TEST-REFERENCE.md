# Quick Test Reference - Dual-Model Video Call

## 🚀 Quick Start

### Run All Tests (Browser Console)
```javascript
// 1. Navigate to http://localhost:3000/ai-video-call
// 2. Open console (F12)
// 3. Run:
await runAllIntegrationTests()
```

### Manual Testing Checklist
```
☐ Voice interaction works
☐ Image capture works
☐ Vietnamese voice sounds natural
☐ Tool calls execute correctly
☐ Error handling is graceful
```

## 🔍 Quick Verification Commands

### Check Session State
```javascript
// Get orchestrator instance from React component
const orchestrator = window.orchestratorRef?.current;
console.log(orchestrator?.getSessionState());
```

### Test Audio Model
```javascript
const { default: AudioModelService } = await import('./services/AudioModelService.js');
const audio = new AudioModelService(process.env.REACT_APP_GEMINI_API_KEY);
await audio.connect({ userName: 'Test' });
console.log('Connected:', audio.isServiceConnected());
```

### Test Analysis Model
```javascript
const { default: AnalysisModelService } = await import('./services/AnalysisModelService.js');
const analysis = new AnalysisModelService(process.env.REACT_APP_GEMINI_API_KEY);
await analysis.initialize();
console.log('Ready:', analysis.isServiceReady());
```

### Test Image Analysis
```javascript
const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'green';
ctx.fillRect(0, 0, 640, 480);
const base64 = canvas.toDataURL('image/jpeg', 0.98).split(',')[1];

const { default: AnalysisModelService } = await import('./services/AnalysisModelService.js');
const analysis = new AnalysisModelService(process.env.REACT_APP_GEMINI_API_KEY);
await analysis.initialize();
const result = await analysis.analyzeImage(
  { base64, mimeType: 'image/jpeg' },
  'Mô tả hình ảnh này'
);
console.log('Result:', result);
```

### Test Tool Calls
```javascript
const { default: AnalysisModelService } = await import('./services/AnalysisModelService.js');
const analysis = new AnalysisModelService(process.env.REACT_APP_GEMINI_API_KEY);
await analysis.initialize();

// Price lookup
const price = await analysis.executeTool({
  id: '1',
  name: 'lookup_price',
  args: { product: 'lúa' }
});
console.log('Price:', price.response.result);

// Disease diagnosis
const diagnosis = await analysis.executeTool({
  id: '2',
  name: 'diagnose_disease',
  args: { crop: 'lúa', symptoms: 'lá vàng' }
});
console.log('Diagnosis:', diagnosis.response.result);

// Store finder
const store = await analysis.executeTool({
  id: '3',
  name: 'find_agri_store',
  args: { productType: 'phân bón' }
});
console.log('Store:', store.response.result);
```

## 📊 Performance Checks

### Measure Voice Latency
```javascript
const start = Date.now();
// Speak into microphone
// Wait for response
const latency = Date.now() - start;
console.log('Latency:', latency, 'ms (target: <2000ms)');
```

### Measure Image Analysis Latency
```javascript
const start = Date.now();
// Click capture button
// Wait for analysis
const latency = Date.now() - start;
console.log('Latency:', latency, 'ms (target: <5000ms)');
```

### Check Memory Usage
```javascript
// Open DevTools → Performance → Memory
// Record for 5 minutes
// Check for memory leaks
```

## ⚠️ Common Issues

### Issue: "API key not configured"
**Solution:** Check `.env` file has valid `REACT_APP_GEMINI_API_KEY`

### Issue: "Audio model not connected"
**Solution:** 
1. Check internet connection
2. Verify API key has quota
3. Check browser console for errors

### Issue: "Camera not available"
**Solution:**
1. Grant camera permission
2. Check camera is not used by another app
3. Try switching cameras

### Issue: "Simulation mode active"
**Solution:** This is expected when API is unavailable. Check API key and quota.

## 🎯 Expected Behaviors

### Status Flow
```
connecting → connected → listening → thinking → speaking → listening
```

### Error Messages (Vietnamese)
- "Chế độ mô phỏng" = Simulation mode
- "Audio model không khả dụng" = Audio unavailable
- "Analysis model không khả dụng" = Analysis unavailable

### Model States
- Audio: `connected` | `disconnected` | `reconnecting`
- Analysis: `ready` | `analyzing` | `error`

## 📝 Quick Test Scenarios

### Scenario 1: Happy Path (2 min)
1. Start session
2. Say "Xin chào"
3. Capture image
4. Ask "Giá lúa?"
5. Stop session

### Scenario 2: Error Handling (3 min)
1. Start with invalid API key
2. Verify simulation mode
3. Fix API key
4. Restart session
5. Verify normal operation

### Scenario 3: Model Isolation (5 min)
1. Start session
2. Monitor console logs
3. Capture image
4. Verify only analysis model receives image
5. Speak into mic
6. Verify only audio model receives audio

## 🔧 Debug Mode

### Enable Verbose Logging
```javascript
// In browser console
localStorage.setItem('DEBUG', 'true');
location.reload();
```

### View All Logs
```javascript
// Filter console for specific service
console.log('Audio Model logs:', 
  performance.getEntriesByType('mark')
    .filter(m => m.name.includes('AudioModel'))
);
```

### Export Test Results
```javascript
// After running tests
console.log(JSON.stringify(window.testResults, null, 2));
```

## 📞 Support

**Documentation:**
- Full guide: `INTEGRATION-TESTING-GUIDE.md`
- Summary: `INTEGRATION-TEST-SUMMARY.md`
- Design: `design.md`
- Requirements: `requirements.md`

**Quick Links:**
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live)
- [Voice Options](https://ai.google.dev/gemini-api/docs/models/gemini#voice)

**Team Contact:**
- Development: [team-email]
- QA: [qa-email]
- DevOps: [devops-email]
