# Tài Liệu Cải Thiện Hiệu Suất Nông Lạc - Lighthouse Report

## 📊 Tóm Tắt Hiệu Suất Hiện Tại

| Chỉ Số | Giá Trị | Mục Tiêu | Trạng Thái |
|--------|--------|---------|-----------|
| First Contentful Paint (FCP) | 0.8s | < 1.8s | ✅ Tốt |
| Largest Contentful Paint (LCP) | 4.1s | < 2.5s | ⚠️ Cần cải thiện |
| Total Blocking Time (TBT) | 850ms | < 200ms | ❌ Kém |
| Cumulative Layout Shift (CLS) | 0.127 | < 0.1 | ⚠️ Cần cải thiện |
| Speed Index | 2.7s | < 3.4s | ✅ Tốt |

---

## 🔴 Vấn Đề Ưu Tiên Cao (Critical)

### 1. **Giảm Thời Gian Thực Thi JavaScript (TBT: 850ms)**

**Nguyên Nhân:**
- Google Tag Manager: 496ms
- Vendors.js: 1.202ms (825ms evaluation)
- Main.js: 288ms

**Giải Pháp:**

#### a) Tắt/Trì Hoãn Google Tag Manager
```javascript
// Trong public/index.html - Trì hoãn GTM loading
<script>
  // Delay GTM loading by 5 seconds
  setTimeout(function() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-910KJYRSXM';
    document.head.appendChild(script);
  }, 5000);
</script>
```

#### b) Code Splitting - Chia nhỏ vendors.js
```javascript
// config-overrides.js
const path = require('path');

module.exports = function override(config, env) {
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Tách Ant Design
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          name: 'antd',
          priority: 20,
        },
        // Tách Firebase
        firebase: {
          test: /[\\/]node_modules[\\/]firebase[\\/]/,
          name: 'firebase',
          priority: 15,
        },
        // Tách React
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react-vendors',
          priority: 10,
        },
        // Vendors còn lại
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 5,
        },
      },
    },
  };
  return config;
};
```

#### c) Lazy Load Components
```javascript
// Đã có sẵn trong App.js, nhưng cần tối ưu hơn
const Home = React.lazy(() => import('./features/home'));
const ChatBot = React.lazy(() => import('./components/ChatBot'));

// Thêm Suspense boundary với timeout
const LazyComponent = ({ component: Component, fallback }) => (
  <Suspense fallback={fallback}>
    <Component />
  </Suspense>
);
```

---

### 2. **Cải Thiện LCP (4.1s → < 2.5s)**

**Nguyên Nhân:**
- Video là LCP element (4.1s load time)
- CSS chặn rendering (60ms)
- Độ trễ tải tài nguyên: 4.11s

**Giải Pháp:**

#### a) Tối Ưu Video Loading
```javascript
// Trong PostCard.js hoặc video component
<video
  src={videoUrl}
  poster={posterUrl}
  preload="metadata"  // Thay vì "auto"
  loading="lazy"
  style={{ width: '100%', height: 'auto' }}
/>
```

#### b) Inline Critical CSS
```javascript
// Tạo file critical.css chỉ chứa CSS cần thiết cho above-the-fold
// Inline vào <head> trong public/index.html
<style>
  /* Critical CSS cho hero section, navbar, etc */
  .hero-section { /* ... */ }
  .navbar { /* ... */ }
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/css/main.css"></noscript>
```

#### c) Preload LCP Element
```html
<!-- Trong public/index.html -->
<link rel="preload" as="image" href="path/to/hero-image.jpg">
<link rel="preload" as="video" href="path/to/video.mp4">
```

---

### 3. **Giảm CLS (0.127 → < 0.1)**

**Nguyên Nhân:**
- Logo không có kích thước rõ ràng (550.5 KiB)
- Video element không có aspect ratio
- Fonts thay đổi khi load

**Giải Pháp:**

#### a) Đặt Kích Thước Rõ Ràng cho Logo
```javascript
// ResponsiveNavbar.js
<img 
  src={logo} 
  alt="NongLac Logo" 
  width={85}
  height={32}
  style={{ width: '85px', height: '32px' }}
/>
```

#### b) Đặt Aspect Ratio cho Video
```javascript
// PostCard.js
<div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
  <video
    src={videoUrl}
    poster={posterUrl}
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
</div>
```

#### c) Font Display Strategy
```css
/* Trong CSS hoặc tailwind config */
@font-face {
  font-family: 'Be Vietnam Pro';
  font-display: swap; /* Hiển thị fallback font trước */
  src: url(...);
}
```

---

## 🟡 Vấn Đề Ưu Tiên Trung Bình (Medium)

### 4. **Tối Ưu Hóa Hình Ảnh (Tiết Kiệm: 535 KiB)**

**Vấn Đề:**
- Logo: 550.5 KiB (hiển thị 85x32px)
- Avatars: 296 KiB
- Product images: 10.478 KiB

**Giải Pháp:**

#### a) Nén Logo
```bash
# Sử dụng ImageMagick hoặc online tool
convert logo.png -quality 85 -resize 170x64 logo-optimized.png
```

#### b) Sử Dụng WebP Format
```javascript
// Trong component
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="..." />
</picture>
```

#### c) Responsive Images
```javascript
// Sử dụng srcset
<img
  src="image-400.jpg"
  srcSet="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="..."
/>
```

---

### 5. **Giảm JavaScript Không Dùng (Tiết Kiệm: 555 KiB)**

**Vấn Đề:**
- vendors.js: 357.1 KiB không dùng
- antd.js: 108.5 KiB không dùng
- common.js: 32.8 KiB không dùng

**Giải Pháp:**

#### a) Tree Shaking - Chỉ import cần thiết từ Ant Design
```javascript
// ❌ Sai - Import toàn bộ
import { Button, Card, Modal } from 'antd';

// ✅ Đúng - Đã tối ưu, nhưng kiểm tra lại
import Button from 'antd/es/button';
import Card from 'antd/es/card';
```

#### b) Kiểm Tra Unused Dependencies
```bash
npm install -g depcheck
depcheck
```

#### c) Dynamic Import cho Routes
```javascript
// App.js - Đã có, nhưng tối ưu hơn
const Home = React.lazy(() => 
  import(/* webpackChunkName: "home" */ './features/home')
);
```

---

### 6. **Giảm CSS Không Dùng (Tiết Kiệm: 38 KiB)**

**Giải Pháp:**

#### a) Sử dụng PurgeCSS/Tailwind Purge
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  // Tailwind sẽ tự động xóa CSS không dùng
};
```

#### b) Kiểm Tra Ant Design CSS
```javascript
// Chỉ import CSS cần thiết
import 'antd/dist/reset.css'; // Đã tối ưu
```

---

## 🟢 Vấn Đề Ưu Tiên Thấp (Low)

### 7. **Sử Dụng Cache Hiệu Quả (Tiết Kiệm: 10 KiB)**

**Giải Pháp:**

#### a) Cấu Hình Cache Headers
```javascript
// firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  }
}
```

#### b) Service Worker Caching
```javascript
// Đã có sw.js, nhưng tối ưu cache strategy
// Sử dụng Cache-First cho static assets
// Network-First cho API calls
```

---

### 8. **Rút Gọn CSS (Tiết Kiệm: 3 KiB)**

```bash
npm install -g cssnano
# Hoặc sử dụng PostCSS plugin
```

---

## 📋 Kế Hoạch Hành Động (Priority Order)

### Phase 1: Ngay Lập Tức (1-2 tuần)
1. ✅ Trì hoãn Google Tag Manager (TBT: -200ms)
2. ✅ Đặt kích thước cho logo (CLS: -0.05)
3. ✅ Đặt aspect ratio cho video (CLS: -0.02)
4. ✅ Nén logo (LCP: -0.5s)

**Kỳ Vọng:** TBT: 650ms, LCP: 3.6s, CLS: 0.08

### Phase 2: Tuần 2-3
1. ✅ Code splitting vendors.js
2. ✅ Inline critical CSS
3. ✅ Preload LCP element
4. ✅ Tối ưu hình ảnh (WebP)

**Kỳ Vọng:** TBT: 400ms, LCP: 2.8s, CLS: 0.05

### Phase 3: Tuần 4+
1. ✅ Tree shaking Ant Design
2. ✅ PurgeCSS
3. ✅ Cache optimization
4. ✅ Kiểm tra unused dependencies

**Kỳ Vọng:** TBT: 200ms, LCP: 2.0s, CLS: 0.02

---

## 🔧 Các File Cần Sửa

```
src/
├── App.js (Lazy load, GTM delay)
├── components/
│   ├── ResponsiveNavbar.js (Logo sizing)
│   ├── PostCard.js (Video aspect ratio)
│   └── ChatBot.js
├── features/
│   └── home/components/PostsList.js (Image optimization)
└── index.html (Critical CSS, preload)

config-overrides.js (Code splitting)
tailwind.config.js (PurgeCSS)
firebase.json (Cache headers)
```

---

## 📊 Mục Tiêu Cuối Cùng

| Chỉ Số | Hiện Tại | Mục Tiêu | Cải Thiện |
|--------|----------|---------|----------|
| FCP | 0.8s | 0.8s | ✅ Giữ nguyên |
| LCP | 4.1s | 2.0s | ⬇️ -50% |
| TBT | 850ms | 200ms | ⬇️ -76% |
| CLS | 0.127 | 0.05 | ⬇️ -61% |
| Speed Index | 2.7s | 1.8s | ⬇️ -33% |

---

## 📚 Tài Liệu Tham Khảo

- [Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Performance Auditing](https://developers.google.com/web/tools/lighthouse)
- [React Code Splitting](https://reactjs.org/docs/code-splitting.html)
- [Ant Design Performance](https://ant.design/docs/react/introduce)
- [Firebase Hosting Optimization](https://firebase.google.com/docs/hosting/performance-optimization)

---

## ✅ Checklist Kiểm Tra

- [ ] Trì hoãn GTM
- [ ] Đặt kích thước logo
- [ ] Đặt aspect ratio video
- [ ] Nén logo
- [ ] Code splitting
- [ ] Inline critical CSS
- [ ] Preload LCP
- [ ] Tối ưu hình ảnh
- [ ] Tree shaking
- [ ] PurgeCSS
- [ ] Cache headers
- [ ] Chạy Lighthouse lại

---

**Cập nhật lần cuối:** 17/03/2026
**Người tạo:** Performance Team
