# 📋 TỔNG QUAN HỆ THỐNG NÔNG LẠC

## 1. GIỚI THIỆU DỰ ÁN

**NôngLạc** là một mạng xã hội nông nghiệp toàn diện, kết hợp diễn đàn cộng đồng với marketplace và các công cụ AI hỗ trợ nông dân Việt Nam.

### Thông tin cơ bản
- **Tên dự án**: NôngLạc - Mạng xã hội nông nghiệp
- **Tagline**: "Hệ điều hành niềm tin Nông nghiệp"
- **Domain**: nonglac.com (đang triển khai)
- **Hosting**: Firebase Hosting (nonglac-2025.web.app)
- **Ngôn ngữ**: Tiếng Việt
- **Đối tượng**: Nông dân, nhà cung cấp nông sản, chuyên gia nông nghiệp

## 2. LOẠI ỨNG DỤNG

### 2.1 Kiến trúc tổng thể
```
Frontend (React SPA) ←→ Firebase Services ←→ Node.js Server
     ↓                        ↓                    ↓
Mobile Web App          Firestore Database    Web Scraper
```

### 2.2 Phân loại
- **Frontend**: Single Page Application (SPA) - React.js
- **Backend**: Backend-as-a-Service (Firebase) + Node.js Express
- **Database**: NoSQL (Firestore)
- **Architecture**: Hybrid (SPA + BaaS + Microservices)

## 3. TÍNH NĂNG CHÍNH

### 3.1 Diễn đàn mạng xã hội ✅
- Đăng bài viết, chia sẻ kinh nghiệm
- Hệ thống like, comment, share
- Phân loại theo danh mục (trồng trọt, chăn nuôi, thủy sản)
- Hệ thống uy tín (reputation score)

### 3.2 Marketplace ✅
- Mua bán sản phẩm nông sản
- Quản lý sản phẩm
- Hệ thống đánh giá

### 3.3 Công cụ AI ✅
- **Plant Doctor**: Chẩn đoán bệnh cây bằng hình ảnh (Gemini AI)
- **AgriBot**: Chatbot tư vấn nông nghiệp
- **Post Generator**: Tạo bài viết tự động
- **Market Insights**: Phân tích thị trường

### 3.4 Cập nhật giá nông sản ✅
- Real-time price tracking
- Scraping từ NhaBeAgri.com
- Cập nhật mỗi 30 phút
- Biểu đồ xu hướng giá

### 3.5 Tin tức nông nghiệp ✅
- Scraping từ nongnghiepmoitruong.vn
- 10+ danh mục tin tức
- Tự động phân loại và làm sạch dữ liệu

### 3.6 Tính năng khác ✅
- Chat messaging giữa người dùng
- Lessons/Tutorials nông nghiệp
- AgriMap - Bản đồ địa điểm
- Hệ thống missions/gamification
- Admin dashboard

## 4. CÔNG NGHỆ SỬ DỤNG

### 4.1 Frontend Stack
- **React**: 18.2.0 (UI Framework)
- **Material-UI**: 5.11.0 (Component library)
- **Ant Design**: 5.27.6 (UI components)
- **Tailwind CSS**: 3.0.0 (Utility CSS)
- **React Router**: 6.8.0 (Routing)
- **Framer Motion**: 10.18.0 (Animations)

### 4.2 Backend Stack
- **Node.js**: Express server
- **Firebase**: Authentication, Firestore, Storage, Hosting
- **Cheerio**: HTML parsing cho web scraping
- **Axios**: HTTP client
- **Node-Cron**: Scheduled tasks

### 4.3 AI & External APIs
- **Google Gemini**: 2.5 Flash (Image analysis, chatbot)
- **Google Search API**: Tìm kiếm tin tức
- **Web Scraping**: NhaBeAgri, NNVN

## 5. KIẾN TRÚC DATABASE

### 5.1 Firestore Collections
```
users/          # Thông tin người dùng, reputation
posts/          # Bài viết, likes, comments
prices/         # Giá nông sản real-time
comments/       # Bình luận
notifications/  # Thông báo
follows/        # Theo dõi người dùng
savedPosts/     # Bài viết đã lưu
likes/          # Lượt thích
conversations/  # Chat conversations
  └─ messages/  # Chat messages (subcollection)
userActions/    # Analytics tracking
```

### 5.2 Đặc điểm Database
- **NoSQL**: Flexible schema
- **Real-time**: Live updates
- **Scalable**: Auto-scaling
- **Security**: Rules-based (hiện tại chưa bảo mật)

## 6. DEPLOYMENT & HOSTING

### 6.1 Firebase Configuration
```
Project ID: nonglac-2026
Hosting: https://nonglac-2025.web.app
Domain: nonglac.com (planned)
Region: asia-southeast1
```

### 6.2 Build Process
```bash
npm run build    # React build + cache busting
firebase deploy  # Deploy to Firebase Hosting
```

### 6.3 Server Deployment
- **Node.js server**: Port 3001
- **Web scraper**: Separate process
- **Cron jobs**: Automated price updates

## 7. SEO & OPTIMIZATION

### 7.1 SEO Implementation ✅
- Meta tags (title, description, keywords)
- Open Graph + Twitter Cards
- Structured data (JSON-LD)
- XML Sitemaps (chính + news + products)
- SEO-friendly URLs tiếng Việt
- PWA manifest

### 7.2 Performance Optimization ✅
- Lazy loading components
- Code splitting (React.lazy)
- Image optimization hints
- Preconnect to external domains
- Critical CSS inline
- Cache busting mechanism

### 7.3 Target Keywords
- **Primary**: "nông nghiệp việt nam", "mạng xã hội nông nghiệp"
- **Secondary**: "giá nông sản", "giá cà phê", "giá lúa gạo"
- **Long-tail**: "cộng đồng nông dân việt nam", "diễn đàn nông nghiệp"

## 8. BRAND IDENTITY

### 8.1 Logo & Colors
- **Logo**: Chim Lạc ôm Địa cầu + Cây lúa
- **Primary Color**: #3A9947 (Xanh nông nghiệp)
- **Secondary Color**: #1CBECF (Xanh công nghệ)
- **Accent Color**: #EDB324 (Vàng mùa gặt)

### 8.2 Typography
- **Headings**: Montserrat (Bold)
- **Body**: Be Vietnam Pro (Regular/Medium)
- **Mobile-friendly**: Minimum 16sp

## 9. TRẠNG THÁI HIỆN TẠI

### 9.1 Điểm mạnh ✅
- **Đa tính năng**: Diễn đàn + Marketplace + AI + Scraper
- **AI Integration**: Gemini 2.5 Flash
- **Real-time Data**: Cập nhật giá mỗi 30 phút
- **Responsive Design**: Mobile-first
- **SEO Optimized**: Comprehensive SEO

### 9.2 Điểm yếu ❌
- **Security**: Firestore rules không bảo mật
- **Performance**: Bundle size lớn (multiple UI libs)
- **Code Quality**: Không có TypeScript, testing
- **Scalability**: Single server, no caching
- **Monitoring**: Thiếu error tracking, logging

## 10. METRICS & ANALYTICS

### 10.1 User Analytics ✅
- User actions tracking (view, like, comment, create, search)
- Firebase Analytics integration
- Google Analytics setup

### 10.2 Performance Metrics
- Page load time
- First Contentful Paint
- Largest Contentful Paint
- Cumulative Layout Shift

### 10.3 Business Metrics
- Monthly Active Users (MAU)
- Daily Active Users (DAU)
- Posts per user per day
- Marketplace transactions

## 11. KẾT LUẬN

NôngLạc là một dự án **đầy tham vọng** với **kiến trúc tốt** và **tính năng phong phú**. Hệ thống đã hoạt động ổn định với đầy đủ tính năng cơ bản của một mạng xã hội nông nghiệp.

**Thế mạnh**: Tích hợp AI, real-time data, đa tính năng, SEO tốt
**Thách thức**: Bảo mật, hiệu suất, chất lượng code, khả năng mở rộng

**Ưu tiên tiếp theo**: Security hardening → Performance optimization → Code quality improvement

---
*Phân tích bởi: Kiro AI*
*Ngày: 11/01/2026*