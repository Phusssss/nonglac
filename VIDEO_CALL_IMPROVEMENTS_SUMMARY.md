# Tóm tắt Cải tiến Chức năng Video Call AI

## Ngày: 9 tháng 2, 2026

## Vấn đề ban đầu
1. ❌ Giá nông sản sử dụng dữ liệu giả (mock data)
2. ❌ Giọng nói AI chưa có phong cách "Lạc Lạc" đặc trưng
3. ❌ Chức năng đàm thoại chưa tự nhiên
4. ❌ Thông tin không lấy từ nguồn thực tế

## Giải pháp đã triển khai

### 1. Hệ thống Giá Thực tế (Real-Time Pricing)

#### File mới: `src/services/realTimePriceService.js`
- ✅ Service lấy giá nông sản thực tế từ internet
- ✅ Tích hợp với backend API
- ✅ Fallback về dữ liệu lịch sử khi không có giá mới
- ✅ Cache để tối ưu hiệu suất

#### Cập nhật: `src/services/videoCallService.js`
- ✅ Thay thế mock data bằng real-time price service
- ✅ Tool `lookup_price` giờ lấy giá thực từ internet
- ✅ Hiển thị nguồn và thời gian cập nhật

**Ví dụ response mới**:
```
Giá sầu riêng tại Đồng bằng sông Cửu Long hôm nay là 55.000 - 65.000 đồng/kg. 
Xu hướng: tăng nhẹ. Nguồn: Sở Nông nghiệp ĐBSCL, cập nhật hôm nay 14:30.
```

### 2. Giọng nói "Lạc Lạc" (Voice Configuration)

#### File mới: `src/config/lacLacVoiceConfig.js`
Cấu hình đầy đủ cho giọng nói "Lạc Lạc":

**Đặc điểm**:
- 🗣️ Xưng hô: "Lạc Lạc" / "bà con"
- 💚 Tính cách: Chân thành, mộc mạc, chuyên nghiệp nhưng gần gũi
- 📊 Ưu tiên số: Nói giá rõ ràng ngay từ đầu
- 🌾 Từ vựng địa phương: "bắt bệnh", "phác đồ", "tranh thủ", "ưng ý"
- 🎯 Cấu trúc rõ ràng: "Một là..., Hai là..., Ba là..."

**Functions**:
- `generateLacLacSystemPrompt(userName)` - Tạo system prompt
- `formatLacLacResponse(content, type)` - Format response theo style
- `LAC_LAC_VOICE_CONFIG` - Object chứa toàn bộ config

#### Cập nhật: `src/services/geminiLiveService.js`
- ✅ Import và sử dụng `generateLacLacSystemPrompt`
- ✅ System instruction giờ theo phong cách "Lạc Lạc"
- ✅ Kết hợp visual analysis rules cho video call

**Ví dụ câu nói mới**:
```
Chào bà con nhà mình! Lạc Lạc đây. Giá sầu riêng Ri6 hôm nay 
đang ở mức 55.000 đến 65.000 VNĐ một ký, bà con tranh thủ nhé.
```

### 3. Backend API Requirements

#### File mới: `BACKEND_API_REQUIREMENTS.md`
Tài liệu chi tiết cho backend developer:

**Endpoints cần thiết**:
1. `POST /api/prices/search` - Tìm kiếm giá nông sản
2. `POST /api/prices/trend` - Xu hướng giá theo thời gian

**Data sources đề xuất**:
- AgroInfo.vn
- Bộ Nông nghiệp và PTNT
- Sở Nông nghiệp các tỉnh
- VnExpress Kinh doanh
- Cafef.vn

**Implementation strategy**:
- Web scraping từ nguồn tin cậy
- Caching 1-2 giờ
- Rate limiting
- Fallback mechanism

### 4. Voice Setup Guide

#### File mới: `LAC_LAC_VOICE_SETUP.md`
Hướng dẫn đầy đủ về cấu hình giọng nói:

**Nội dung**:
- ✅ Đặc điểm giọng nói "Lạc Lạc"
- ✅ Cấu hình cho các TTS platform (Gemini, ElevenLabs, Azure, OpenAI)
- ✅ Mẫu câu test
- ✅ Checklist chất lượng
- ✅ Troubleshooting
- ✅ Roadmap phát triển

**TTS Options**:
1. **Gemini Live** (hiện tại) - Tích hợp sẵn
2. **ElevenLabs** (khuyến nghị) - Chất lượng cao nhất
3. **Azure Speech** - Hỗ trợ SSML tốt
4. **OpenAI TTS** - Đơn giản nhưng chưa tốt cho tiếng Việt

## Kiến trúc mới

```
┌─────────────────────────────────────────────────────────┐
│                    Video Call UI                         │
│                 (AIVideoCall.jsx)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              VideoCallService                            │
│         (videoCallService.js)                            │
│                                                           │
│  ┌─────────────────┐      ┌──────────────────┐          │
│  │ Audio/Video     │      │ Tool Handlers    │          │
│  │ Management      │      │ - lookup_price   │◄─────────┼──► Real-Time
│  └─────────────────┘      │ - diagnose       │          │    Price Service
│                            │ - find_store     │          │
│  ┌─────────────────┐      └──────────────────┘          │
│  │ Gemini Live     │                                     │
│  │ Integration     │                                     │
│  └─────────────────┘                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            GeminiLiveService                             │
│         (geminiLiveService.js)                           │
│                                                           │
│  System Prompt: Lạc Lạc Voice Config                    │
│  Voice: Kore (Vietnamese, warm, friendly)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API                                 │
│                                                           │
│  POST /api/prices/search    ◄───► Web Scraping          │
│  POST /api/prices/trend     ◄───► Data Sources          │
│                                    - AgroInfo.vn         │
│                                    - Bộ NN & PTNT        │
│                                    - Sở NN các tỉnh      │
└─────────────────────────────────────────────────────────┘
```

## Cách sử dụng

### 1. Frontend (Đã hoàn thành)
```bash
# Không cần cài đặt thêm, code đã sẵn sàng
# Chỉ cần đảm bảo có API key Gemini
```

### 2. Backend (Cần triển khai)
```bash
# Xem file BACKEND_API_REQUIREMENTS.md
# Triển khai 2 endpoints:
# - POST /api/prices/search
# - POST /api/prices/trend
```

### 3. Test giọng nói
```bash
# Sử dụng các test scripts trong LAC_LAC_VOICE_SETUP.md
# Test với các câu mẫu để đảm bảo chất lượng
```

## Kết quả mong đợi

### Trước khi cải tiến:
```
AI: "Giá lúa hiện tại: 6,500 - 7,000 đồng/kg"
```
❌ Dữ liệu giả
❌ Giọng nói chung chung
❌ Không có nguồn

### Sau khi cải tiến:
```
Lạc Lạc: "Chào bà con! Giá lúa hôm nay tại Đồng bằng sông Cửu Long 
là 6,800 đồng một ký, tăng nhẹ so với hôm qua. Theo thông tin từ 
Sở Nông nghiệp, cập nhật lúc 14:30 hôm nay. Bà con tranh thủ nhé!"
```
✅ Dữ liệu thực tế
✅ Giọng nói "Lạc Lạc" đặc trưng
✅ Có nguồn và thời gian
✅ Tự nhiên, gần gũi

## Checklist triển khai

### Frontend ✅ (Hoàn thành)
- [x] Tạo `realTimePriceService.js`
- [x] Tạo `lacLacVoiceConfig.js`
- [x] Cập nhật `videoCallService.js`
- [x] Cập nhật `geminiLiveService.js`
- [x] Tạo documentation files

### Backend ⏳ (Cần triển khai)
- [ ] Implement `/api/prices/search` endpoint
- [ ] Implement `/api/prices/trend` endpoint
- [ ] Setup web scraping cho data sources
- [ ] Implement caching mechanism
- [ ] Add rate limiting
- [ ] Test với real data

### Testing 🧪 (Cần thực hiện)
- [ ] Test giọng nói với các câu mẫu
- [ ] Test real-time price fetching
- [ ] Test fallback mechanism
- [ ] Test với nhiều loại nông sản
- [ ] Test với nhiều vùng miền
- [ ] User acceptance testing

## Lưu ý quan trọng

### 1. API Key
- Cần có Google Gemini API key hợp lệ
- Không sử dụng test key hoặc key rỗng
- Key phải có quyền truy cập Gemini Live API

### 2. Backend Dependencies
- Backend cần triển khai trước khi frontend có thể lấy giá thực
- Hiện tại sẽ fallback về message "chưa tìm được giá" nếu backend chưa sẵn sàng

### 3. Data Sources
- Cần tuân thủ terms of service của các trang web khi scraping
- Nên có partnership hoặc API chính thức nếu có thể
- Implement rate limiting để không spam sources

### 4. Voice Quality
- Gemini Live voice "Kore" đã khá tốt cho tiếng Việt
- Có thể nâng cấp lên ElevenLabs sau này cho chất lượng cao hơn
- Cần test với người dùng thật để điều chỉnh

## Next Steps

### Immediate (Ngay lập tức)
1. ✅ Review code changes
2. ⏳ Implement backend API endpoints
3. ⏳ Test integration end-to-end

### Short-term (1-2 tuần)
1. Deploy backend API
2. Test với real users
3. Collect feedback và điều chỉnh
4. Optimize caching và performance

### Long-term (1-3 tháng)
1. Nâng cấp lên ElevenLabs voice
2. Thêm regional accents
3. Implement advanced analytics
4. Add more data sources

## Support & Documentation

- **Backend API**: Xem `BACKEND_API_REQUIREMENTS.md`
- **Voice Setup**: Xem `LAC_LAC_VOICE_SETUP.md`
- **Code**: Xem comments trong các file service
- **Issues**: Report qua GitHub issues hoặc team chat

## Tác giả
- Frontend Implementation: Kiro AI Assistant
- Date: February 9, 2026
- Version: 1.0.0
