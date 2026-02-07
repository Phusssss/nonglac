# AI Video Call Feature - Requirements

## 1. Overview

Xây dựng tính năng gọi video với AI trợ lý Lạc Lạc, cho phép người dùng tương tác trực tiếp qua video và âm thanh với AI để được tư vấn nông nghiệp theo thời gian thực.

## 2. User Stories

### 2.1 Khởi động Video Call
**Là** người dùng nông dân  
**Tôi muốn** bắt đầu cuộc gọi video với AI Lạc Lạc  
**Để** được tư vấn trực tiếp về cây trồng, bệnh hại qua hình ảnh thực tế

**Acceptance Criteria:**
- Có nút "Gọi Video với Lạc Lạc" rõ ràng trên giao diện
- Khi bấm nút, hệ thống yêu cầu quyền truy cập camera và microphone
- Hiển thị trạng thái kết nối (đang kết nối, đã kết nối, lỗi)
- Hỗ trợ cả chế độ online (với API key) và offline (simulation mode)

### 2.2 Tương tác Video Real-time
**Là** người dùng  
**Tôi muốn** quay camera vào cây trồng và nghe AI phân tích trực tiếp  
**Để** nhận được tư vấn nhanh chóng mà không cần chụp ảnh

**Acceptance Criteria:**
- Video stream hiển thị mượt mà (tối thiểu 15fps)
- Có thể chuyển đổi giữa camera trước/sau
- AI có thể nhìn thấy và phân tích hình ảnh từ video stream
- Âm thanh 2 chiều hoạt động ổn định (người dùng nói, AI trả lời bằng giọng)

### 2.3 Chụp ảnh trong cuộc gọi
**Là** người dùng  
**Tôi muốn** chụp ảnh tĩnh từ video stream để AI phân tích chi tiết  
**Để** có chẩn đoán chính xác hơn về bệnh hại

**Acceptance Criteria:**
- Có nút chụp ảnh rõ ràng trong giao diện video call
- Hiệu ứng flash khi chụp ảnh
- Ảnh được gửi ngay đến AI để phân tích
- Hiển thị trạng thái "Đang phân tích..." khi AI xử lý

### 2.4 Giao diện trực quan
**Là** người dùng  
**Tôi muốn** giao diện video call đơn giản, dễ sử dụng  
**Để** tập trung vào việc tư vấn mà không bị rối

**Acceptance Criteria:**
- Giao diện fullscreen với video stream chiếm phần lớn màn hình
- Các nút điều khiển (chụp ảnh, đổi camera, tắt mic, kết thúc) dễ nhìn và bấm
- Hiển thị trạng thái AI (đang nghe, đang suy nghĩ, đang nói)
- Có visualizer âm thanh để người dùng biết AI đang hoạt động
- Hiển thị khung focus (reticle) khi camera bật để hướng dẫn người dùng

### 2.5 Xử lý lỗi và fallback
**Là** người dùng  
**Tôi muốn** hệ thống vẫn hoạt động khi không có kết nối internet tốt  
**Để** không bị gián đoạn trong quá trình sử dụng

**Acceptance Criteria:**
- Khi không có API key hoặc lỗi kết nối, tự động chuyển sang Simulation Mode
- Hiển thị thông báo lỗi rõ ràng và hướng dẫn khắc phục
- Có nút "Thử lại" khi gặp lỗi
- Không crash app khi camera/mic không khả dụng

### 2.6 Tích hợp với hệ thống hiện tại
**Là** người dùng  
**Tôi muốn** truy cập video call từ nhiều điểm trong app  
**Để** dễ dàng sử dụng khi cần

**Acceptance Criteria:**
- Có thể mở video call từ FloatingChatButton
- Có thể mở từ trang PlantDoctor
- Có thể mở từ ChatBot component
- Tích hợp với hệ thống AI usage tracking (đếm số lần sử dụng AI)

## 3. Technical Requirements

### 3.1 Camera & Media
- Hỗ trợ getUserMedia API
- Hỗ trợ chuyển đổi facingMode (user/environment)
- Hỗ trợ constraints nâng cao (focus, exposure, white balance) cho camera sau
- Capture ảnh từ video stream với chất lượng cao (JPEG, 0.8 quality)

### 3.2 Audio Processing
- Input: 16kHz sample rate cho microphone
- Output: 24kHz sample rate cho AI voice
- Visualizer sử dụng AnalyserNode với FFT size 256
- Xử lý audio real-time với ScriptProcessor hoặc AudioWorklet

### 3.3 AI Integration
- Sử dụng Google Gemini Live API (gemini-2.5-flash-native-audio-preview)
- Hỗ trợ multimodal: audio + video/image
- Hỗ trợ function calling (lookup_price, diagnose_disease, find_agri_store)
- Voice config: Kore voice (giọng nữ tự nhiên)

### 3.4 Performance
- Video stream không lag (target: 30fps)
- Audio latency < 500ms
- Thời gian phản hồi AI < 3s cho text, < 5s cho image analysis
- Tối ưu bundle size (lazy load component nếu cần)

### 3.5 Security & Privacy
- Yêu cầu user permission trước khi truy cập camera/mic
- Không lưu trữ video stream
- Chỉ gửi ảnh tĩnh khi người dùng chụp
- Validate API key trước khi kết nối

## 4. Non-Functional Requirements

### 4.1 Usability
- Giao diện phải hoạt động tốt trên mobile (responsive)
- Hỗ trợ cả portrait và landscape mode
- Font size và button size phù hợp cho người dùng lớn tuổi

### 4.2 Accessibility
- Có text labels cho tất cả buttons
- Hiển thị trạng thái bằng cả màu sắc và text
- Hỗ trợ keyboard navigation (cho desktop)

### 4.3 Compatibility
- Hỗ trợ Chrome, Safari, Edge (latest 2 versions)
- Hỗ trợ iOS Safari và Android Chrome
- Graceful degradation cho browsers không hỗ trợ getUserMedia

### 4.4 Monitoring
- Log errors đến Sentry
- Track usage metrics (số cuộc gọi, thời lượng, số ảnh chụp)
- Monitor API usage và costs

## 5. Out of Scope (Phase 1)

- Recording cuộc gọi
- Screen sharing
- Group video call
- Video filters/effects
- Bandwidth optimization (adaptive bitrate)
- WebRTC peer-to-peer connection

## 6. Dependencies

- Google Gemini API (@google/genai)
- React 18.2+
- Ant Design components
- Framer Motion (cho animations)
- Browser APIs: getUserMedia, AudioContext, Canvas

## 7. Success Metrics

- 80% người dùng hoàn thành cuộc gọi video thành công
- Thời gian phản hồi trung bình < 3s
- Error rate < 5%
- User satisfaction score > 4/5
- Tăng 30% engagement với AI features
