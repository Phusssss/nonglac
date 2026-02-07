# Quick Test Guide - Video Call Camera Capture

## 🚀 Quick Test (2 phút)

### Bước 1: Mở ChatBot
1. Mở application
2. Click floating chat button (góc dưới phải)
3. ✅ Verify: ChatBot mở ra

### Bước 2: Bắt đầu Video Call
1. Click nút **📹** (video call) trong header ChatBot
2. Cho phép camera + microphone khi browser hỏi
3. ✅ Verify: 
   - Video preview hiển thị (camera của bạn)
   - Status: "Đã kết nối"
   - AI nói chào (có thể nghe giọng AI)

### Bước 3: Test Chụp Ảnh
1. Nói hoặc type: "Cây của tôi bị vàng lá"
2. Chờ AI phản hồi (AI sẽ kêu bạn chụp ảnh)
3. Click nút **📸** (chụp ảnh) ở dưới cùng
4. ✅ Verify:
   - Flash trắng xuất hiện (~150ms)
   - Message: "📸 Đã gửi ảnh cho Lạc Lạc AI. Đang phân tích..."
   - AI nói kết quả phân tích (2-5 giây)
   - Kết quả hiển thị trong chat

### Bước 4: Kết thúc
1. Click nút **📞** đỏ (end call)
2. ✅ Verify:
   - Cuộc gọi kết thúc
   - Camera tắt (indicator trong browser tắt)
   - Quay về chat bình thường

---

## 🎯 Test Scenarios

### Scenario 1: Happy Path
```
1. Open ChatBot
2. Click 📹 video call
3. Grant permissions
4. Wait for AI greeting
5. Ask about plant disease
6. AI asks to take photo
7. Click 📸 capture
8. See flash effect
9. AI analyzes and speaks result
10. End call with 📞
✅ PASS if all steps work smoothly
```

### Scenario 2: Multiple Captures
```
1. Start video call
2. Capture first image 📸
3. Wait for AI response
4. Capture second image 📸
5. Wait for AI response
6. End call
✅ PASS if can capture multiple times
```

### Scenario 3: Camera Controls
```
1. Start video call
2. Toggle camera off 📷
3. Verify video stops
4. Toggle camera on 📹
5. Verify video resumes
6. Mute mic 🔇
7. Verify AI doesn't hear you
8. Unmute 🎤
9. Verify AI hears you again
✅ PASS if all controls work
```

### Scenario 4: Error Handling
```
1. Start video call
2. Disconnect internet
3. Try to capture 📸
4. Verify error message
5. Reconnect internet
6. Try again
✅ PASS if error handled gracefully
```

---

## 🔍 What to Check

### Visual Checks
- [ ] Video preview shows your camera
- [ ] Video is mirrored (selfie mode)
- [ ] Flash effect is visible and brief
- [ ] All buttons are visible and styled correctly
- [ ] Status indicator shows correct state

### Audio Checks
- [ ] Can hear AI greeting
- [ ] Can hear AI analysis result
- [ ] AI voice is clear and natural
- [ ] No audio glitches or delays

### Functional Checks
- [ ] Camera permission works
- [ ] Mic permission works
- [ ] Capture button works
- [ ] Image is sent to AI
- [ ] AI receives and analyzes image
- [ ] Results appear in chat
- [ ] End call cleans up resources

### Performance Checks
- [ ] Video preview is smooth (no lag)
- [ ] Capture is instant (< 100ms)
- [ ] AI response is fast (< 5s)
- [ ] No memory leaks after ending call

---

## 🐛 Common Issues

### Issue: "Không thể gửi ảnh"
**Cause**: Network error or session closed
**Fix**: 
1. Check internet connection
2. Restart video call
3. Try again

### Issue: AI không nói gì
**Cause**: Audio output issue
**Fix**:
1. Check speaker/volume
2. Check browser audio permissions
3. Restart call

### Issue: Flash không hiển thị
**Cause**: CSS animation issue
**Fix**:
1. Check browser supports CSS transitions
2. Refresh page
3. Try different browser

### Issue: Video đen
**Cause**: Camera permission denied
**Fix**:
1. Check browser camera permissions
2. Allow camera access
3. Restart call

---

## ✅ Success Criteria

Test is **SUCCESSFUL** if:
1. ✅ Video call starts without errors
2. ✅ Can hear AI voice clearly
3. ✅ Can capture image with flash effect
4. ✅ AI analyzes image and speaks result
5. ✅ Result appears in chat history
6. ✅ End call cleans up resources
7. ✅ No console errors
8. ✅ No memory leaks

---

## 📊 Test Report Template

```
Date: _______________
Tester: _______________
Browser: _______________
Device: _______________

Quick Test Results:
[ ] Step 1: Open ChatBot - PASS / FAIL
[ ] Step 2: Start Video Call - PASS / FAIL
[ ] Step 3: Capture Image - PASS / FAIL
[ ] Step 4: AI Analysis - PASS / FAIL
[ ] Step 5: End Call - PASS / FAIL

Overall: PASS / FAIL

Issues Found:
1. _______________________________________________
2. _______________________________________________

Notes:
_______________________________________________
_______________________________________________
```

---

## 🎬 Demo Script

**For showing to stakeholders:**

```
"Xin chào! Hôm nay tôi sẽ demo tính năng mới - 
Video Call với AI Lạc Lạc.

[Click 📹]
Đây, tôi đang gọi video với Lạc Lạc AI...

[Wait for connection]
Nghe thấy không? AI đang chào tôi bằng giọng nói.

[Ask question]
'Cây của tôi bị vàng lá'

[AI responds]
AI đang kêu tôi chụp ảnh để xem...

[Click 📸]
Nhìn kìa! Flash effect khi chụp.

[Wait for analysis]
Và đây... AI đang phân tích và NÓI kết quả luôn!
Không phải đọc text, mà AI nói trực tiếp.

[Show chat history]
Kết quả cũng được lưu trong chat history.

[Click 📞]
Kết thúc cuộc gọi. Đơn giản và tự nhiên!

Cảm ơn các bạn!"
```

---

**Ready to test!** 🚀
