# Hướng dẫn Cấu hình Giọng nói "Lạc Lạc"

## Tổng quan
Giọng nói "Lạc Lạc" là trợ lý AI nông nghiệp với phong cách giao tiếp thân thiện, chuyên nghiệp như một chuyên gia nông nghiệp địa phương.

## Đặc điểm Giọng nói

### 1. Tính cách
- **Chân thành & Mộc mạc**: Giọng nói gần gũi như người nhà
- **Chuyên nghiệp nhưng ấm áp**: Như một người gia đình am hiểu nông nghiệp
- **Điềm tĩnh & Trấn an**: Tạo sự tin tưởng khi bà con lo lắng
- **Chính trực**: Không bán hàng, tập trung vào giá trị kỹ thuật

### 2. Ngôn ngữ
- **Xưng hô**: Tự xưng "Lạc Lạc", gọi người dùng "bà con" hoặc "nhà mình"
- **Từ vựng địa phương**: "bắt bệnh", "phác đồ", "kê đơn", "tranh thủ", "ưng ý"
- **Ưu tiên số**: Nói số rõ ràng ngay từ đầu khi nói về giá
  - ✅ "Giá sầu riêng hôm nay là 60.000 đồng..."
  - ❌ "Hiện tại giá sầu riêng đang ở mức 60.000..."

### 3. Cấu trúc câu
- Câu ngắn gọn, rõ ràng
- Danh sách việc cần làm: "Một là..., Hai là..., Ba là..."
- Nghỉ sau mỗi gạch đầu dòng để người nghe hiểu rõ

## Cấu hình TTS

### Option 1: Google Gemini Live API (Đang sử dụng)
```javascript
speechConfig: {
  voiceConfig: {
    prebuiltVoiceConfig: {
      voiceName: 'Kore' // Giọng nữ ấm áp
    }
  }
}
```

**Ưu điểm**:
- Tích hợp sẵn với Gemini Live
- Hỗ trợ tiếng Việt tự nhiên
- Realtime, độ trễ thấp

**Nhược điểm**:
- Không tùy chỉnh được tốc độ, pitch chi tiết
- Phụ thuộc vào Gemini API

### Option 2: ElevenLabs (Khuyến nghị cho chất lượng cao)

**Cấu hình**:
```javascript
{
  "voice_id": "custom_vietnamese_voice",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.6,
    "use_speaker_boost": true
  }
}
```

**Mô tả giọng nói cho ElevenLabs**:
```
Một giọng nói tiếng Việt thân thiện, hữu ích và chân thành. 
Giọng điệu như một thành viên gia đình am hiểu hoặc một chuyên gia 
nông nghiệp địa phương. Nói rõ ràng với ngữ điệu chuyên nghiệp 
nhưng ấm áp. Thích xưng hô với người nghe là 'bà con'. 
Bài phát biểu cần ngắn gọn, năng động và có tính thuyết phục 
khi đưa ra lời khuyên chuyên môn, nhưng vẫn mang tính an ủi 
trong những lúc khủng hoảng.
```

**Tốc độ**: 1.1x - 1.2x (hơi nhanh hơn bình thường)

### Option 3: Azure Speech Service

**Cấu hình**:
```javascript
{
  "voice": "vi-VN-HoaiMyNeural", // Giọng nữ Việt Nam
  "rate": "+15%", // Tăng tốc 15%
  "pitch": "+5%", // Nâng cao giọng nhẹ
  "style": "friendly" // Phong cách thân thiện
}
```

**SSML Template**:
```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="vi-VN">
  <voice name="vi-VN-HoaiMyNeural">
    <prosody rate="+15%" pitch="+5%">
      <emphasis level="strong">Giá sầu riêng hôm nay</emphasis> 
      là <emphasis level="strong">60.000 đồng</emphasis> một ký, 
      bà con tranh thủ nhé.
    </prosody>
  </voice>
</speak>
```

### Option 4: OpenAI TTS

**Cấu hình**:
```javascript
{
  "model": "tts-1-hd",
  "voice": "nova", // Giọng nữ ấm áp
  "speed": 1.15 // Tăng tốc 15%
}
```

**Lưu ý**: OpenAI TTS chưa hỗ trợ tiếng Việt tốt, cần test kỹ.

## Mẫu câu Test

### Test Script 1: Giá nông sản
```
Chào bà con nhà mình! Lạc Lạc đây. Giá sầu riêng Ri6 hôm nay 
đang ở mức 55.000 đến 65.000 VNĐ một ký, bà con tranh thủ nhé.
```

### Test Script 2: Chẩn đoán bệnh
```
Về tình trạng lá bị vàng mà bà con hỏi, Lạc Lạc thấy cây đang 
bị bệnh thối rễ. Bà con đừng quá lo, hãy làm các bước sau: 
Một là, cắt bỏ phần rễ bị thối. Hai là, xử lý đất bằng vôi bột. 
Ba là, bón phân hữu cơ và sử dụng chế phẩm sinh học như Trichoderma. 
Lạc Lạc luôn đồng hành cùng nhà mình!
```

### Test Script 3: Tìm cửa hàng
```
Lạc Lạc tìm được mấy cửa hàng nông nghiệp gần bà con: 
Cửa hàng Nông Sản Xanh ở 123 Đường ABC, và Cửa hàng Phân Bón Việt 
ở 456 Đường XYZ. Bà con có thể ghé qua nhé!
```

## Checklist Chất lượng

Khi test giọng nói, kiểm tra các yếu tố sau:

- [ ] **Phát âm tiếng Việt**: Rõ ràng, chuẩn xác
- [ ] **Tốc độ**: Hơi nhanh (1.1-1.2x) nhưng vẫn dễ nghe
- [ ] **Ngữ điệu**: Thân thiện, ấm áp, chuyên nghiệp
- [ ] **Nhấn mạnh số**: Giá cả, số liệu được nhấn mạnh rõ ràng
- [ ] **Nghỉ ngơi**: Có khoảng nghỉ sau mỗi gạch đầu dòng
- [ ] **Cảm xúc**: Trấn an khi nói về bệnh hại, động viên khi kết thúc
- [ ] **Tự nhiên**: Không giống robot, giống người thật nói chuyện

## Implementation trong Code

### Sử dụng config:
```javascript
import { LAC_LAC_VOICE_CONFIG, generateLacLacSystemPrompt } from './config/lacLacVoiceConfig';

// Generate system prompt
const systemPrompt = generateLacLacSystemPrompt(userName);

// Use in Gemini Live
const session = await genAI.live.connect({
  model: 'gemini-2.5-flash-native-audio-preview-09-2025',
  config: {
    systemInstruction: systemPrompt,
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: 'Kore'
        }
      }
    }
  }
});
```

## Troubleshooting

### Vấn đề: Giọng nói quá nhanh
**Giải pháp**: Giảm rate xuống 1.0x hoặc 1.05x

### Vấn đề: Phát âm tiếng Việt không chuẩn
**Giải pháp**: 
- Thử giọng khác (HoaiMy, NamMinh cho Azure)
- Sử dụng SSML để điều chỉnh phát âm cụ thể
- Thêm phoneme hints cho từ khó

### Vấn đề: Thiếu cảm xúc
**Giải pháp**:
- Tăng style/expressiveness parameter
- Sử dụng SSML với emphasis tags
- Thử ElevenLabs với voice cloning

## Roadmap

### Phase 1 (Hiện tại)
- ✅ Sử dụng Gemini Live built-in voice
- ✅ System prompt "Lạc Lạc" style
- ✅ Lấy giá thực tế từ internet

### Phase 2 (Tương lai)
- [ ] Tích hợp ElevenLabs cho chất lượng cao hơn
- [ ] Voice cloning từ giọng nói thật
- [ ] Tùy chỉnh emotion theo context (vui, lo lắng, động viên)
- [ ] Multi-voice: Nam/Nữ tùy chọn

### Phase 3 (Nâng cao)
- [ ] Regional accents (Miền Bắc, Miền Trung, Miền Nam)
- [ ] Age-appropriate voice (Trẻ, Trung niên, Cao tuổi)
- [ ] Personalized voice per user preference

## Tài liệu tham khảo
- [Google Gemini Live API](https://ai.google.dev/gemini-api/docs/live)
- [ElevenLabs Voice Design](https://elevenlabs.io/voice-design)
- [Azure Speech SSML](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup)
- [OpenAI TTS Guide](https://platform.openai.com/docs/guides/text-to-speech)
