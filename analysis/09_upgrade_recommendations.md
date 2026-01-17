# 🚀 ĐỀ XUẤT NÂNG CẤP NÔNG LẠC

## 1. TỔNG QUAN ĐỀ XUẤT

### 1.1 Nguyên tắc ưu tiên
```
🔴 CRITICAL (Tuần 1-2): Security & Stability
🟡 HIGH (Tuần 3-6): Performance & Code Quality  
🟢 MEDIUM (Tuần 7-12): Features & Scalability
🔵 LOW (Tháng 4-6): Advanced Features
```

### 1.2 Phương pháp tiếp cận
- **Incremental**: Nâng cấp từng phần, không làm gián đoạn service
- **Risk-based**: Ưu tiên các vấn đề có rủi ro cao nhất
- **Value-driven**: Tập trung vào tác động tích cực lớn nhất
- **Measurable**: Có metrics để đo lường hiệu quả

## 2. PHASE 1: SECURITY & STABILITY (Tuần 1-2) 🔴

### 2.1 Firestore Security Rules - CRITICAL
**Vấn đề**: Hiện tại cho phép read/write cho tất cả users
**Rủi ro**: Data breach, unauthorized access, data manipulation

**Giải pháp**:
```javascript
// firestore.rules - Secure version
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts - authenticated users can create, authors can edit
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // Prices - read-only for users, write for admin
    match /prices/{priceId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Comments - authenticated users
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // Conversations - only participants can access
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
  }
}
```

**Timeline**: 2-3 ngày
**Impact**: Bảo vệ dữ liệu người dùng, tuân thủ GDPR

### 2.2 API Keys Security - CRITICAL
**Vấn đề**: Gemini API key exposed trong frontend code
**Rủi ro**: API abuse, cost escalation, service disruption

**Giải pháp**:
```javascript
// server/routes/ai.js - Backend proxy
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/analyze-plant', async (req, res) => {
  try {
    const { image, prompt, userId } = req.body;
    
    // Validate user authentication
    const user = await verifyFirebaseToken(req.headers.authorization);
    if (!user || user.uid !== userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Rate limiting
    const rateLimitKey = `ai_requests:${userId}`;
    const requestCount = await redis.get(rateLimitKey) || 0;
    if (requestCount > 10) { // 10 requests per hour
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: image } }, { text: prompt }] }
    });
    
    // Increment rate limit counter
    await redis.setex(rateLimitKey, 3600, parseInt(requestCount) + 1);
    
    res.json({ result: response.text });
  } catch (error) {
    res.status(500).json({ error: 'AI service error' });
  }
});
```

**Timeline**: 3-4 ngày
**Impact**: Bảo vệ API costs, prevent abuse

### 2.3 Input Validation & Sanitization - HIGH
**Vấn đề**: Không validate input từ users
**Rủi ro**: XSS attacks, data corruption, injection attacks

**Giải pháp**:
```javascript
// utils/validation.js
import DOMPurify from 'dompurify';
import validator from 'validator';

export const validatePost = (data) => {
  const errors = {};
  
  // Title validation
  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
  }
  if (data.title && data.title.length > 200) {
    errors.title = 'Tiêu đề không được quá 200 ký tự';
  }
  
  // Content validation
  if (!data.content || data.content.trim().length < 10) {
    errors.content = 'Nội dung phải có ít nhất 10 ký tự';
  }
  
  // Sanitize HTML content
  if (data.content) {
    data.content = DOMPurify.sanitize(data.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  }
  
  return { isValid: Object.keys(errors).length === 0, errors, data };
};

export const validateUser = (data) => {
  const errors = {};
  
  if (!validator.isEmail(data.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  if (!data.displayName || data.displayName.trim().length < 2) {
    errors.displayName = 'Tên hiển thị phải có ít nhất 2 ký tự';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
```

**Timeline**: 2-3 ngày
**Impact**: Prevent XSS, data integrity

### 2.4 Error Handling & Logging - HIGH
**Vấn đề**: Thiếu error tracking và logging
**Rủi ro**: Khó debug, không biết khi có lỗi

**Giải pháp**:
```javascript
// utils/errorHandler.js
import * as Sentry from '@sentry/react';

export const initErrorTracking = () => {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
};

export const logError = (error, context = {}) => {
  console.error('Error:', error);
  
  Sentry.withScope((scope) => {
    Object.keys(context).forEach(key => {
      scope.setTag(key, context[key]);
    });
    Sentry.captureException(error);
  });
};

// React Error Boundary
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, { component: 'ErrorBoundary', ...errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Đã xảy ra lỗi</h2>
          <p>Vui lòng tải lại trang hoặc liên hệ hỗ trợ.</p>
          <button onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Timeline**: 2 ngày
**Impact**: Better debugging, proactive error detection

## 3. PHASE 2: PERFORMANCE OPTIMIZATION (Tuần 3-4) 🟡

### 3.1 Bundle Size Optimization - HIGH
**Vấn đề**: Bundle size lớn do multiple UI libraries
**Impact**: Slow loading, poor mobile experience

**Giải pháp**:
```javascript
// Chọn 1 UI library chính - Ant Design (đã có nhiều components)
// Loại bỏ Material-UI

// package.json - Remove MUI
{
  "dependencies": {
    // Remove these:
    // "@mui/material": "^5.11.0",
    // "@mui/icons-material": "^5.11.0",
    // "@emotion/react": "^11.10.0",
    // "@emotion/styled": "^11.10.0",
    
    // Keep these:
    "antd": "^5.27.6",
    "@ant-design/icons": "^6.1.0",
    "tailwindcss": "^3.0.0"
  }
}

// Migrate MUI components to Ant Design
// Before (MUI):
import { Button, TextField } from '@mui/material';

// After (Ant Design):
import { Button, Input } from 'antd';
```

**Bundle size reduction**: ~40% (từ ~2MB xuống ~1.2MB)
**Timeline**: 5-7 ngày
**Impact**: Faster loading, better mobile performance

### 3.2 Image Optimization - HIGH
**Vấn đề**: Images không được optimize
**Impact**: Slow loading, bandwidth waste

**Giải pháp**:
```javascript
// utils/imageOptimization.js
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// components/ImageUpload.js
const handleImageUpload = async (file) => {
  // Compress before upload
  const compressedFile = await compressImage(file);
  
  // Upload to Firebase Storage
  const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, compressedFile);
  
  return getDownloadURL(storageRef);
};
```

**Timeline**: 2-3 ngày
**Impact**: 60-80% reduction in image size

### 3.3 Database Indexing - HIGH
**Vấn đề**: Queries chậm do thiếu indexes
**Impact**: Slow page loads, poor user experience

**Giải pháp**:
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorReputation", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "prices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "productName", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "comments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "postId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    }
  ]
}

// Deploy indexes
firebase deploy --only firestore:indexes
```

**Timeline**: 1 ngày
**Impact**: 50-70% faster query performance

### 3.4 Caching Implementation - MEDIUM
**Vấn đề**: Không có caching layer
**Impact**: Repeated API calls, slow response

**Giải pháp**:
```javascript
// server/middleware/cache.js
import Redis from 'redis';

const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Override res.json to cache response
      const originalJson = res.json;
      res.json = function(data) {
        redis.setex(key, duration, JSON.stringify(data));
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Usage in routes
app.get('/api/prices', cacheMiddleware(1800), getPrices); // Cache 30 minutes
app.get('/api/news', cacheMiddleware(3600), getNews);     // Cache 1 hour
```

**Timeline**: 3-4 ngày
**Impact**: 80% reduction in API response time

## 4. PHASE 3: CODE QUALITY (Tuần 5-6) 🟡

### 4.1 TypeScript Migration - HIGH
**Vấn đề**: Không có type safety
**Impact**: Runtime errors, poor developer experience

**Giải pháp**:
```typescript
// types/index.ts
export interface User {
  uid: string;
  displayName: string;
  email: string;
  reputation: number;
  joinDate: Date;
  postsCount: number;
  likesReceived: number;
  role?: 'user' | 'admin';
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  authorReputation: number;
  createdAt: Date;
  likes: number;
  comments: number;
  imageUrl?: string;
}

export interface Price {
  id: string;
  productName: string;
  currentPrice: number;
  previousPrice: number;
  unit: string;
  market: string;
  category: string;
  change: string;
  date: string;
  updatedAt: Date;
  source: string;
}

// services/postService.ts
import { Post, User } from '../types';

export class PostService {
  static async createPost(postData: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: new Date()
    });
    
    return {
      id: docRef.id,
      ...postData,
      createdAt: new Date()
    };
  }
  
  static async getPosts(limit: number = 20): Promise<Post[]> {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));
  }
}
```

**Timeline**: 2 tuần (gradual migration)
**Impact**: Fewer runtime errors, better IDE support

### 4.2 Testing Framework - HIGH
**Vấn đề**: Không có tests
**Impact**: Regression bugs, poor code confidence

**Giải pháp**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// __tests__/components/PostCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from '../components/PostCard';

const mockPost = {
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  authorName: 'Test User',
  likes: 5,
  comments: 2,
  createdAt: new Date(),
};

describe('PostCard', () => {
  test('renders post information correctly', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
  
  test('handles like button click', () => {
    const onLike = jest.fn();
    render(<PostCard post={mockPost} onLike={onLike} />);
    
    fireEvent.click(screen.getByRole('button', { name: /like/i }));
    expect(onLike).toHaveBeenCalledWith(mockPost.id);
  });
});

// __tests__/services/postService.test.js
import { PostService } from '../services/postService';

jest.mock('../firebase/config');

describe('PostService', () => {
  test('creates post successfully', async () => {
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      category: 'agriculture',
      authorId: 'user1',
      authorName: 'Test User',
      authorReputation: 100,
      likes: 0,
      comments: 0,
    };
    
    const result = await PostService.createPost(postData);
    
    expect(result).toHaveProperty('id');
    expect(result.title).toBe(postData.title);
  });
});
```

**Timeline**: 1 tuần
**Impact**: Prevent regressions, improve code quality

### 4.3 Code Linting & Formatting - MEDIUM
**Giải pháp**:
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
  },
};

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}

// package.json scripts
{
  "scripts": {
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,ts,tsx,json,css,md}"
  }
}
```

**Timeline**: 2 ngày
**Impact**: Consistent code style, fewer bugs

## 5. PHASE 4: FEATURES & SCALABILITY (Tuần 7-12) 🟢

### 5.1 Push Notifications - HIGH
**Giải pháp**:
```javascript
// firebase-messaging-sw.js
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data.type,
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// services/notificationService.js
export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_VAPID_KEY
    });
    
    // Save token to user profile
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      fcmToken: token
    });
    
    return token;
  }
};

export const sendNotification = async (userId, title, body, data = {}) => {
  // Server-side function
  await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, body, data })
  });
};
```

**Timeline**: 1 tuần
**Impact**: Better user engagement

### 5.2 Email Verification - MEDIUM
**Giải pháp**:
```javascript
// services/emailService.js
import { sendEmailVerification, applyActionCode } from 'firebase/auth';

export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: true,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const verifyEmail = async (actionCode) => {
  try {
    await applyActionCode(auth, actionCode);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// components/EmailVerificationBanner.jsx
export const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  
  if (!user || user.emailVerified) return null;
  
  const handleResendEmail = async () => {
    setSending(true);
    const result = await sendVerificationEmail(user);
    setSending(false);
    
    if (result.success) {
      message.success('Email xác thực đã được gửi!');
    } else {
      message.error('Lỗi gửi email: ' + result.error);
    }
  };
  
  return (
    <Alert
      message="Email chưa được xác thực"
      description={
        <div>
          Vui lòng kiểm tra email và xác thực tài khoản.
          <Button type="link" onClick={handleResendEmail} loading={sending}>
            Gửi lại email xác thực
          </Button>
        </div>
      }
      type="warning"
      showIcon
      closable
    />
  );
};
```

**Timeline**: 3-4 ngày
**Impact**: Better security, reduce fake accounts

### 5.3 Content Moderation - MEDIUM
**Giải pháp**:
```javascript
// services/moderationService.js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const moderateContent = async (content) => {
  try {
    const prompt = `
    Phân tích nội dung sau và đánh giá xem có vi phạm quy định không:
    - Ngôn từ thù địch, xúc phạm
    - Nội dung khiêu dâm, bạo lực
    - Spam, quảng cáo không phù hợp
    - Thông tin sai lệch về nông nghiệp
    
    Nội dung: "${content}"
    
    Trả về JSON: {"isViolation": boolean, "reason": string, "severity": "low|medium|high"}
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    // Fallback to keyword-based moderation
    return keywordModeration(content);
  }
};

const keywordModeration = (content) => {
  const bannedWords = ['spam', 'lừa đảo', 'hack', 'virus'];
  const lowerContent = content.toLowerCase();
  
  for (const word of bannedWords) {
    if (lowerContent.includes(word)) {
      return {
        isViolation: true,
        reason: `Chứa từ khóa bị cấm: ${word}`,
        severity: 'medium'
      };
    }
  }
  
  return { isViolation: false, reason: '', severity: 'low' };
};

// hooks/useContentModeration.js
export const useContentModeration = () => {
  const moderateAndPost = async (postData) => {
    const moderation = await moderateContent(postData.content);
    
    if (moderation.isViolation) {
      if (moderation.severity === 'high') {
        throw new Error('Nội dung vi phạm nghiêm trọng và không được phép đăng');
      } else {
        // Flag for manual review
        postData.needsReview = true;
        postData.moderationReason = moderation.reason;
      }
    }
    
    return postData;
  };
  
  return { moderateAndPost };
};
```

**Timeline**: 1 tuần
**Impact**: Better content quality, safer community

## 6. PHASE 5: ADVANCED FEATURES (Tháng 4-6) 🔵

### 6.1 Mobile App (React Native) - LOW
**Giải pháp**:
```javascript
// React Native setup
npx react-native init NongLacMobile --template react-native-template-typescript

// Shared business logic
// packages/shared/
├── services/
├── types/
├── utils/
└── constants/

// Mobile-specific features
// - Push notifications
// - Camera integration
// - Offline support
// - Location services
```

**Timeline**: 2-3 tháng
**Impact**: Better mobile experience, wider reach

### 6.2 Advanced Analytics - LOW
**Giải pháp**:
```javascript
// services/analyticsService.js
export const trackUserBehavior = (event, properties = {}) => {
  // Google Analytics 4
  gtag('event', event, {
    event_category: 'user_behavior',
    event_label: properties.label,
    value: properties.value,
    custom_parameters: properties
  });
  
  // Custom analytics
  addDoc(collection(db, 'analytics'), {
    event,
    properties,
    userId: auth.currentUser?.uid,
    timestamp: new Date(),
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    referrer: document.referrer
  });
};

// Analytics dashboard
export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState({});
  
  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await getAnalyticsData();
      setMetrics(data);
    };
    fetchMetrics();
  }, []);
  
  return (
    <div>
      <Card title="User Engagement">
        <Statistic title="Daily Active Users" value={metrics.dau} />
        <Statistic title="Monthly Active Users" value={metrics.mau} />
        <Statistic title="Retention Rate" value={metrics.retention} suffix="%" />
      </Card>
      
      <Card title="Content Metrics">
        <Statistic title="Posts per Day" value={metrics.postsPerDay} />
        <Statistic title="Comments per Post" value={metrics.commentsPerPost} />
        <Statistic title="Engagement Rate" value={metrics.engagementRate} suffix="%" />
      </Card>
    </div>
  );
};
```

**Timeline**: 1 tháng
**Impact**: Data-driven decisions, better user understanding

## 7. IMPLEMENTATION TIMELINE

### 7.1 Gantt Chart Overview
```
Week 1-2:  🔴 Security & Stability
Week 3-4:  🟡 Performance Optimization  
Week 5-6:  🟡 Code Quality
Week 7-8:  🟢 Core Features
Week 9-10: 🟢 Advanced Features
Week 11-12: 🟢 Scalability
Month 4-6: 🔵 Mobile & Analytics
```

### 7.2 Resource Requirements
- **Developer**: 1-2 full-stack developers
- **DevOps**: 0.5 DevOps engineer (part-time)
- **QA**: 0.5 QA engineer (part-time)
- **Budget**: $5,000-10,000 (cloud services, tools, monitoring)

### 7.3 Risk Mitigation
- **Backup strategy**: Full database backup before major changes
- **Rollback plan**: Feature flags for easy rollback
- **Testing**: Staging environment for testing
- **Monitoring**: Real-time alerts for issues

## 8. SUCCESS METRICS

### 8.1 Technical Metrics
- **Security**: 0 security vulnerabilities
- **Performance**: Page load < 2.5s, Bundle size < 1.5MB
- **Quality**: Test coverage > 70%, 0 critical bugs
- **Scalability**: Support 10K+ concurrent users

### 8.2 Business Metrics
- **User Engagement**: +30% daily active users
- **Content Quality**: +50% user-generated content
- **Performance**: +40% page load speed
- **Reliability**: 99.9% uptime

### 8.3 User Experience Metrics
- **Mobile Performance**: Lighthouse score > 90
- **Accessibility**: WCAG 2.1 AA compliance
- **User Satisfaction**: App store rating > 4.5
- **Support**: <24h response time

---
*Đề xuất nâng cấp bởi: Kiro AI*
*Ngày: 11/01/2026*