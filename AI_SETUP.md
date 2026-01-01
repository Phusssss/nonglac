# Hướng dẫn cấu hình AI Comment với Gemini

## 1. Lấy Gemini API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập với tài khoản Google
3. Click "Create API Key"
4. Copy API key

## 2. Cấu hình

Thêm API key vào file `.env`:

```env
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

## 3. Tính năng AI Comment

### AgriBot Trả Lời (Reply to Post)
- Nút "AgriBot Trả Lời" ở đầu comment section
- AI sẽ phân tích nội dung bài viết và đưa ra lời khuyên chuyên môn
- Sử dụng Gemini Pro model

### AgriBot Tư Vấn (Reply to Comment)
- Nút "AgriBot tư vấn" xuất hiện ở mỗi comment của người dùng
- AI sẽ đọc comment và ngữ cảnh bài viết để trả lời cụ thể
- Bắt đầu bằng "Chào @TênNgườiDùng"

## 4. Cách hoạt động

```javascript
// Service: src/services/geminiService.js
export const chatWithAgriBot = async (postContent, postTitle) => {
  // Gọi Gemini API với prompt chuyên nghiệp
  // Trả về câu trả lời ngắn gọn, hữu ích (2-3 câu)
}

export const replyToComment = async (commentContent, commentAuthor, postContext) => {
  // Gọi Gemini API để reply comment cụ thể
  // Trả về câu trả lời có tên người dùng
}
```

## 5. Tùy chỉnh

Bạn có thể chỉnh sửa prompt trong `src/services/geminiService.js`:

```javascript
const SYSTEM_INSTRUCTION_AGRI = `
Bạn là AgriBot, một chuyên gia nông nghiệp AI...
[Tùy chỉnh tính cách và phong cách trả lời của AI]
`;
```

## 6. Giới hạn

- Gemini API có giới hạn request miễn phí: 60 requests/phút
- Nếu vượt quá, cần nâng cấp lên paid plan
- Fallback response sẽ được sử dụng nếu API lỗi

## 7. Bảo mật

⚠️ **QUAN TRỌNG**: 
- KHÔNG commit API key lên GitHub
- Sử dụng `.env` và thêm vào `.gitignore`
- Trong production, sử dụng backend proxy để bảo vệ API key
