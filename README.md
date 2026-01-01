# NôngLạc - Mạng xã hội nông nghiệp

## Tính năng chính

### 1. Diễn đàn mạng xã hội
- Đăng bài viết, chia sẻ kinh nghiệm nông nghiệp
- Hệ thống like, comment, share
- Phân loại bài viết theo danh mục (trồng trọt, chăn nuôi, thủy sản...)

### 2. Hệ thống uy tín (Reputation System)
- Người dùng có điểm uy tín dựa trên hoạt động
- Bài viết của người có uy tín cao được ưu tiên hiển thị
- Thuật toán newsfeed theo uy tín + thời gian

### 3. Cập nhật giá nông sản
- Hiển thị giá cả các loại nông sản theo thời gian thực
- Theo dõi xu hướng tăng/giảm giá
- Phân loại theo thị trường, vùng miền

### 4. Tính năng tương lai
- Tích hợp bán hàng trực tiếp
- Hệ thống đánh giá nhà cung cấp
- Chat/messaging giữa người dùng
- Livestream bán hàng

## Cài đặt

1. Cài đặt dependencies:
\`\`\`bash
npm install
\`\`\`

2. Cấu hình Firebase:
- Tạo project Firebase mới
- Cập nhật config trong \`src/firebase/config.js\`
- Bật Authentication (Email/Password)
- Tạo Firestore Database
- Bật Storage

3. Chạy ứng dụng:
\`\`\`bash
npm start
\`\`\`

## Cấu trúc Database (Firestore)

### Collection: users
\`\`\`
{
  displayName: string,
  email: string,
  reputation: number,
  joinDate: timestamp,
  postsCount: number,
  likesReceived: number
}
\`\`\`

### Collection: posts
\`\`\`
{
  title: string,
  content: string,
  category: string,
  authorId: string,
  authorName: string,
  authorReputation: number,
  createdAt: timestamp,
  likes: number,
  comments: number
}
\`\`\`

### Collection: prices
\`\`\`
{
  productName: string,
  currentPrice: number,
  previousPrice: number,
  unit: string,
  market: string,
  updatedAt: timestamp
}
\`\`\`

## Công nghệ sử dụng

- **Frontend**: React.js, Material-UI
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Routing**: React Router
- **State Management**: React Context API
- **UI Framework**: Material-UI

## Tool cào dữ liệu NNVN

### Tính năng mới: Scraper Báo Nông Nghiệp Việt Nam
- ✅ Cào tin tức từ nongnghiepmoitruong.vn
- ✅ Không cần AI, parse HTML thuần
- ✅ Hỗ trợ tất cả danh mục chính
- ✅ Tự động phân loại và làm sạch dữ liệu
- ✅ Component React hiển thị tin tức

### Cách sử dụng:

```javascript
// Import scraper
import { scrapeNNVNNews, NNVN_CATEGORIES } from './services/crawlerService';

// Scrape trang chủ nông nghiệp
const news = await scrapeNNVNNews();

// Scrape danh mục cụ thể
const trongTrotNews = await scrapeNNVNNews('trong-trot', 10);

// Scrape tất cả danh mục
const allNews = await scrapeAllNNVNNews();
```

### Danh mục hỗ trợ:
- 🌾 Nông nghiệp
- 🐄 Chăn nuôi  
- 🌱 Trồng trọt
- 🐟 Thủy sản
- 📚 Khuyến nông
- 🔬 Khoa học - Công nghệ
- 🌲 Lâm nghiệp
- 🌍 Môi trường
- 💰 Kinh tế
- 📰 Thời sự

## Roadmap phát triển

### Phase 1 (Hiện tại)
- ✅ Diễn đàn cơ bản
- ✅ Hệ thống uy tín
- ✅ Cập nhật giá nông sản
- ✅ Authentication
- ✅ Tool cào tin NNVN

### Phase 2 (Tương lai)
- [ ] Hệ thống comment
- [ ] Upload hình ảnh
- [ ] Tìm kiếm và filter
- [ ] Notification system
- [ ] Tích hợp nhiều nguồn tin khác

### Phase 3 (Mở rộng)
- [ ] Marketplace (bán hàng)
- [ ] Chat messaging
- [ ] Mobile app
- [ ] Admin dashboard
- [ ] AI phân tích xu hướng nông nghiệp