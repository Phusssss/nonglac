# TÀI LIỆU BẢO MẬT DỮ LIỆU NGƯỜI DÙNG
# NONGLAC SOCIAL PLATFORM

**Phiên bản:** 1.0  
**Ngày cập nhật:** 27/01/2026  
**Trạng thái:** Đang áp dụng

---

## MỤC LỤC

1. [Tổng quan hệ thống bảo mật](#1-tổng-quan-hệ-thống-bảo-mật)
2. [Kiến trúc bảo mật](#2-kiến-trúc-bảo-mật)
3. [Xác thực và phân quyền](#3-xác-thực-và-phân-quyền)
4. [Bảo vệ dữ liệu cá nhân](#4-bảo-vệ-dữ-liệu-cá-nhân)
5. [Bảo mật API và dịch vụ](#5-bảo-mật-api-và-dịch-vụ)
6. [Firestore Security Rules](#6-firestore-security-rules)
7. [Validation và Sanitization](#7-validation-và-sanitization)
8. [Quản lý Session và Token](#8-quản-lý-session-và-token)
9. [Bảo mật file upload](#9-bảo-mật-file-upload)
10. [Monitoring và Logging](#10-monitoring-và-logging)
11. [Compliance và Privacy](#11-compliance-và-privacy)
12. [Incident Response](#12-incident-response)
13. [Khuyến nghị cải thiện](#13-khuyến-nghị-cải-thiện)

---

## 1. TỔNG QUAN HỆ THỐNG BẢO MẬT

### 1.1 Mô hình bảo mật

NôngLạc Social sử dụng mô hình bảo mật đa lớp (Defense in Depth):

```
┌─────────────────────────────────────────────┐
│         Frontend Security Layer             │
│  - Input Validation                         │
│  - XSS Protection (DOMPurify)              │
│  - Auth Guards                              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Authentication & Authorization         │
│  - Firebase Authentication                  │
│  - JWT Token Verification                   │
│  - Role-Based Access Control (RBAC)        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Database Security Layer             │
│  - Firestore Security Rules                 │
│  - Field-level Access Control              │
│  - Data Encryption at Rest                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Infrastructure Security             │
│  - HTTPS/TLS Encryption                    │
│  - Firebase Security                        │
│  - Environment Variables                    │
└─────────────────────────────────────────────┘
```


### 1.2 Phạm vi bảo vệ dữ liệu

**Dữ liệu được bảo vệ:**
- ✅ Thông tin cá nhân (PII): Tên, email, số điện thoại, địa chỉ
- ✅ Thông tin xác thực: Mật khẩu (hashed), OTP, tokens
- ✅ Dữ liệu vị trí: Tọa độ GPS, tỉnh/thành phố
- ✅ Nội dung người dùng: Bài viết, bình luận, tin nhắn
- ✅ Dữ liệu giao dịch: Lịch sử mua bán, subscription
- ✅ Dữ liệu AI: Lịch sử chat, hình ảnh phân tích
- ✅ Metadata: IP address, device info, usage statistics

**Mức độ nhạy cảm:**
- 🔴 **Critical**: Mật khẩu, payment info, private messages
- 🟠 **High**: Số điện thoại, email, địa chỉ, vị trí GPS
- 🟡 **Medium**: Tên hiển thị, avatar, bài viết công khai
- 🟢 **Low**: Thống kê công khai, giá nông sản

---

## 2. KIẾN TRÚC BẢO MẬT

### 2.1 Technology Stack

```yaml
Frontend:
  - React 18.2 (với security best practices)
  - Ant Design 5.27.6 (UI components với built-in security)
  - DOMPurify 3.3.1 (XSS protection)
  - React Router 6.8 (với auth guards)

Backend/Services:
  - Firebase Authentication (OAuth 2.0, Phone Auth)
  - Cloud Firestore (với Security Rules)
  - Firebase Storage (với access control)
  - Node.js Express Server (cho scraping/AI)

Security Libraries:
  - @sentry/react 10.32.1 (Error tracking)
  - ajv 8.17.1 (JSON schema validation)
  - dompurify 3.3.1 (HTML sanitization)

AI Services:
  - Google Gemini AI (với API key protection)
  - Quota management system
```

### 2.2 Network Architecture

```
Internet
    ↓
[HTTPS/TLS 1.3]
    ↓
Firebase Hosting
    ↓
React SPA ──────→ Firebase Auth
    ↓                    ↓
    ├──────→ Cloud Firestore (Security Rules)
    ├──────→ Firebase Storage (Access Control)
    ├──────→ Gemini AI API (API Key Protected)
    └──────→ Node.js Server (JWT Protected)
```

---

## 3. XÁC THỰC VÀ PHÂN QUYỀN

### 3.1 Phương thức xác thực

#### A. Phone Authentication (Primary)

**File:** `src/services/phoneAuthService.js`

```javascript
Quy trình:
1. User nhập số điện thoại (format: +84xxxxxxxxx)
2. Firebase gửi OTP qua SMS
3. User nhập OTP để xác thực
4. Firebase tạo user account với phone number
5. Tạo JWT token cho session

Bảo mật:
✅ reCAPTCHA v3 để chống bot
✅ Rate limiting: 5 OTP/hour per phone
✅ OTP timeout: 5 phút
✅ Phone number validation (Vietnamese prefixes only)
✅ Test mode cho development (không gửi SMS thật)
```

**Đầu số hợp lệ:**
- Viettel: 032-039, 096-098, 395-399
- Mobifone: 070, 076-079, 090, 093
- Vinaphone: 081-089, 091, 094
- Vietnamobile: 056, 058
- Gmobile: 059

#### B. Email/Password Authentication

**File:** `src/hooks/useAuth.js`

```javascript
Quy trình:
1. User đăng ký với email + password
2. Firebase Auth tạo account
3. Password được hash bởi Firebase (bcrypt)
4. Email verification (optional)
5. JWT token được issue

Bảo mật:
✅ Password minimum 6 characters
✅ Firebase handles password hashing
✅ Email verification available
✅ Password reset via email
```


#### C. Google OAuth

**File:** `src/hooks/useAuth.js`

```javascript
Quy trình:
1. User click "Đăng nhập với Google"
2. Redirect to Google OAuth consent screen
3. User authorize permissions
4. Google returns OAuth token
5. Firebase creates/updates user account
6. Auto-create user profile in Firestore

Bảo mật:
✅ OAuth 2.0 standard
✅ HTTPS only
✅ State parameter để chống CSRF
✅ Scope limitation (email, profile only)
```

### 3.2 Role-Based Access Control (RBAC)

**Roles:**

```javascript
{
  "user": {
    permissions: [
      "read:public_posts",
      "create:own_posts",
      "update:own_posts",
      "delete:own_posts",
      "create:comments",
      "use:ai_services"
    ]
  },
  "admin": {
    permissions: [
      "all:user_permissions",
      "read:all_posts",
      "update:any_posts",
      "delete:any_posts",
      "manage:users",
      "view:analytics",
      "moderate:content"
    ]
  }
}
```

**Implementation:**

**File:** `server/middleware/auth.js`

```javascript
// Middleware kiểm tra admin role
export const requireAdmin = async (req, res, next) => {
  const userRecord = await admin.auth().getUser(req.user.uid);
  const customClaims = userRecord.customClaims || {};
  
  if (customClaims.role !== 'admin') {
    return res.status(403).json({
      error: 'Yêu cầu quyền admin',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};
```

### 3.3 Auth Guards (Frontend)

**File:** `src/hooks/useAuthGuard.js`

```javascript
Chức năng:
- Kiểm tra authentication trước khi cho phép action
- Hiển thị login modal hoặc redirect
- Lưu redirect path sau khi login
- Cung cấp helper methods cho từng feature

Usage:
const { requireAuthForPost, requireAuthForChat } = useAuthGuard();

requireAuthForPost(() => {
  // Create post logic
});
```

---

## 4. BẢO VỆ DỮ LIỆU CÁ NHÂN

### 4.1 Dữ liệu thu thập

**User Profile (Collection: `users`):**

```javascript
{
  uid: string,              // Firebase UID (indexed)
  phoneNumber: string,      // +84xxxxxxxxx (encrypted in transit)
  email: string,            // user@example.com
  displayName: string,      // Public name
  avatar: string,           // URL to image
  dateOfBirth: Date,        // Optional
  gender: string,           // Optional
  address: string,          // Optional
  province: string,         // For location-based features
  coordinates: {            // GPS location
    lat: number,
    lng: number
  },
  locationVerified: boolean,
  reputation: number,       // Gamification score
  role: string,             // 'user' | 'admin'
  joinDate: Date,
  isActive: boolean,
  verificationStatus: string, // 'pending' | 'verified'
  createdAt: Date,
  updatedAt: Date
}
```

**Bảo mật:**
- ✅ Không lưu password plaintext (Firebase handles)
- ✅ Phone number được validate trước khi lưu
- ✅ Email được validate
- ✅ GPS coordinates chỉ lưu khi user cho phép
- ✅ Sensitive fields không public trong Security Rules
- ⚠️ **CẢNH BÁO**: Firebase config có API key hardcoded trong code

### 4.2 Data Minimization

**Nguyên tắc:**
- Chỉ thu thập dữ liệu cần thiết
- User có thể bỏ qua các trường optional
- Không bắt buộc xác thực email ngay lập tức
- Location chỉ thu thập khi cần (AgriMap feature)

**Simplified Registration:**

**File:** `src/services/registrationService.js`

```javascript
// Đăng ký tối giản chỉ cần phone + password
async createSimpleAccount(password) {
  // Tạo email tạm từ phone number
  const tempEmail = `${phoneNumber}@nonglac.temp`;
  
  // Tạo account với thông tin tối thiểu
  await createUserWithEmailAndPassword(auth, tempEmail, password);
  
  // Profile sẽ được bổ sung qua missions
  profileCompleted: false
}
```


### 4.3 Data Encryption

**In Transit:**
- ✅ HTTPS/TLS 1.3 cho tất cả connections
- ✅ Firebase SDK tự động encrypt data in transit
- ✅ WebSocket connections (Firestore realtime) được encrypt

**At Rest:**
- ✅ Firebase Firestore tự động encrypt data at rest (AES-256)
- ✅ Firebase Storage encrypt files at rest
- ✅ Passwords được hash bởi Firebase Auth (bcrypt)

**Client-side:**
- ⚠️ LocalStorage không được encrypt (chỉ lưu non-sensitive data)
- ⚠️ SessionStorage không được encrypt
- ✅ Sensitive tokens được lưu trong memory khi có thể

### 4.4 Data Retention

**Chính sách lưu trữ:**

```yaml
User Accounts:
  - Active: Vô thời hạn
  - Inactive (>2 years): Đánh dấu để review
  - Deleted: Soft delete 30 days, sau đó hard delete

Posts & Comments:
  - Active: Vô thời hạn
  - Deleted by user: Soft delete 7 days
  - Reported content: Lưu 90 days sau khi xử lý

Messages:
  - Active conversations: Vô thời hạn
  - Deleted by user: Xóa ngay lập tức
  - Archived: 1 year

AI Chat History:
  - Lưu 30 days
  - User có thể xóa bất kỳ lúc nào

Logs & Analytics:
  - Error logs: 90 days
  - Access logs: 30 days
  - Analytics: Aggregated, vô thời hạn
```

---

## 5. BẢO MẬT API VÀ DỊCH VỤ

### 5.1 API Key Management

**⚠️ VẤN ĐỀ BẢO MẬT NGHIÊM TRỌNG:**

**File:** `src/firebase/config.js`

```javascript
// ❌ HARDCODED API KEY - NGUY HIỂM!
const firebaseConfig = {
  apiKey: "AIzaSyCNSAOYEC_2u6HrksybGPv6kw-dGJvOM60",
  authDomain: "nonglac-2026.firebaseapp.com",
  projectId: "nonglac-2026",
  // ...
};
```

**Rủi ro:**
- API key bị expose trong source code
- Có thể bị abuse nếu source code bị leak
- Không thể rotate key dễ dàng

**Khuyến nghị:**
```javascript
// ✅ SỬ DỤNG ENVIRONMENT VARIABLES
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // ...
};
```

### 5.2 Gemini AI API Protection

**File:** `src/services/geminiService.js`

```javascript
// ✅ ĐÚNG: Sử dụng environment variable
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
```

**Bảo mật:**
- ✅ API key từ environment variable
- ✅ Kiểm tra null trước khi sử dụng
- ✅ Quota management để tránh abuse
- ✅ User authentication required
- ✅ Rate limiting per user

**Quota System:**

**File:** `src/services/subscriptionService.js`

```javascript
SUBSCRIPTION_TIERS = {
  APPRENTICE: {
    limits: {
      aiQuestionsPerDay: 100,
      imageAnalysisPerDay: 100,
      voiceCallsPerDay: 50
    }
  },
  FARMER: {
    limits: {
      aiQuestionsPerDay: 100,
      imageAnalysisPerDay: 50
    }
  },
  EXPERT: {
    limits: {
      aiQuestionsPerDay: -1, // Unlimited
      imageAnalysisPerDay: -1
    }
  }
}
```

### 5.3 GitHub Storage API

**File:** `src/services/githubStorage.js`

```javascript
// ✅ ĐÚNG: API token từ environment
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN || '';

// ✅ Authorization header
headers: {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Content-Type': 'application/json'
}
```

**Bảo mật:**
- ✅ Personal Access Token với scope hạn chế
- ✅ Chỉ có quyền write vào specific repo
- ✅ Token rotation định kỳ (khuyến nghị 90 days)

### 5.4 Server-side Authentication

**File:** `server/middleware/auth.js`

```javascript
// Verify Firebase ID Token
export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token xác thực không hợp lệ',
      code: 'MISSING_TOKEN'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  
  req.user = {
    uid: decodedToken.uid,
    email: decodedToken.email,
    role: decodedToken.role || 'user'
  };
  
  next();
};
```

**Bảo mật:**
- ✅ JWT token verification
- ✅ Token expiration check
- ✅ Token revocation support
- ✅ Custom claims cho roles


---

## 6. FIRESTORE SECURITY RULES

### 6.1 Current Rules Analysis

**File:** `firestore.rules`

#### A. Users Collection

```javascript
match /users/{userId} {
  allow read: if true; // ⚠️ Public profiles
  allow create: if isOwner(userId) && 
    request.resource.data.keys().hasAll(['displayName', 'email', 'joinDate']) &&
    request.resource.data.role == null; // ✅ Prevent self-promotion
  allow update: if isOwner(userId) && 
    !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'uid']);
  allow delete: if isOwner(userId) || isAdmin();
}
```

**Phân tích:**
- ✅ **Tốt**: Ngăn user tự set role admin
- ✅ **Tốt**: Ngăn thay đổi uid
- ⚠️ **Cảnh báo**: Profile công khai (read: if true)
- ⚠️ **Thiếu**: Không validate phone number format
- ⚠️ **Thiếu**: Không giới hạn update frequency

**Khuyến nghị cải thiện:**

```javascript
match /users/{userId} {
  // Chỉ cho phép đọc các field công khai
  allow read: if true; // OK cho social network
  
  allow create: if isOwner(userId) && 
    request.resource.data.keys().hasAll(['displayName', 'email', 'joinDate']) &&
    request.resource.data.role == null &&
    // ✅ Validate phone format
    request.resource.data.phoneNumber.matches('^\\+84[0-9]{9,10}$');
    
  allow update: if isOwner(userId) && 
    !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(['role', 'uid', 'joinDate', 'createdAt']) &&
    // ✅ Rate limit: max 10 updates per day
    request.time > resource.data.lastUpdate + duration.value(2, 'h');
}
```

#### B. Posts Collection

```javascript
match /posts/{postId} {
  allow read: if resource.data.status != 'rejected';
  allow create: if isAuthenticated() && 
    request.resource.data.authorId == request.auth.uid &&
    request.resource.data.keys().hasAll(['title', 'content', 'category', 'authorId', 'createdAt']);
  allow update: if isOwner(resource.data.authorId) || isAdmin();
  allow delete: if isOwner(resource.data.authorId) || isAdmin();
}
```

**Phân tích:**
- ✅ **Tốt**: Ẩn rejected posts
- ✅ **Tốt**: Validate required fields
- ✅ **Tốt**: Chỉ author hoặc admin mới edit/delete
- ⚠️ **Thiếu**: Không validate content length
- ⚠️ **Thiếu**: Không rate limit post creation

**Khuyến nghị:**

```javascript
match /posts/{postId} {
  allow read: if resource.data.status != 'rejected';
  
  allow create: if isAuthenticated() && 
    request.resource.data.authorId == request.auth.uid &&
    request.resource.data.keys().hasAll(['title', 'content', 'category']) &&
    // ✅ Validate lengths
    request.resource.data.title.size() >= 5 &&
    request.resource.data.title.size() <= 200 &&
    request.resource.data.content.size() >= 10 &&
    request.resource.data.content.size() <= 10000 &&
    // ✅ Validate category
    request.resource.data.category in ['trong-trot', 'chan-nuoi', 'thuy-san', 
      'khuyen-nong', 'khoa-hoc-cong-nghe', 'lam-nghiep', 'moi-truong', 
      'kinh-te', 'thoi-su', 'khac'];
}
```

#### C. Comments Collection

```javascript
match /comments/{commentId} {
  allow read: if true;
  allow create: if isAuthenticated() && 
    request.resource.data.authorId == request.auth.uid &&
    request.resource.data.keys().hasAll(['postId', 'content', 'authorId', 'createdAt']);
  allow update: if isOwner(resource.data.authorId) || isAdmin();
  allow delete: if isOwner(resource.data.authorId) || isAdmin();
}
```

**Phân tích:**
- ✅ **Tốt**: Basic validation
- ⚠️ **Thiếu**: Không validate content length
- ⚠️ **Thiếu**: Không kiểm tra postId tồn tại
- ⚠️ **Thiếu**: Không rate limit

#### D. Messages Collection (Private)

```javascript
match /conversations/{conversationId} {
  allow read, write: if isAuthenticated() && 
    request.auth.uid in resource.data.participants;
  
  match /messages/{messageId} {
    allow read, write: if isAuthenticated() && 
      request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
  }
}
```

**Phân tích:**
- ✅ **Tốt**: Chỉ participants mới truy cập được
- ✅ **Tốt**: Subcollection cũng được bảo vệ
- ⚠️ **Thiếu**: Không validate message content
- ⚠️ **Thiếu**: Không giới hạn message size

#### E. Notifications Collection

```javascript
match /notifications/{notificationId} {
  allow read: if isOwner(resource.data.userId);
  allow create: if isAuthenticated();
  allow update: if isOwner(resource.data.userId); // Mark as read
  allow delete: if isOwner(resource.data.userId) || isAdmin();
}
```

**Phân tích:**
- ✅ **Tốt**: User chỉ đọc notification của mình
- ⚠️ **Vấn đề**: `allow create: if isAuthenticated()` - Bất kỳ user nào cũng có thể tạo notification cho người khác!

**Khuyến nghị:**

```javascript
match /notifications/{notificationId} {
  allow read: if isOwner(resource.data.userId);
  // ✅ Chỉ system (admin) hoặc chính user mới tạo được
  allow create: if isAdmin() || 
    (isAuthenticated() && request.resource.data.userId == request.auth.uid);
  allow update: if isOwner(resource.data.userId);
  allow delete: if isOwner(resource.data.userId) || isAdmin();
}
```

### 6.2 Backup Rules Analysis

**File:** `firestore.rules.backup`

```javascript
// ❌ NGUY HIỂM - KHÔNG BAO GIỜ SỬ DỤNG TRONG PRODUCTION!
match /{document=**} {
  allow read, write: if true;
}
```

**Rủi ro:**
- Bất kỳ ai cũng có thể đọc/ghi toàn bộ database
- Không có authentication
- Không có authorization
- Dữ liệu người dùng hoàn toàn không được bảo vệ

**⚠️ CẢNH BÁO:** File này chỉ nên dùng cho development local, KHÔNG BAO GIỜ deploy lên production!


---

## 7. VALIDATION VÀ SANITIZATION

### 7.1 Input Validation

**File:** `src/utils/validation.js`

#### A. Post Validation

```javascript
export const validatePost = (data) => {
  // ✅ Title validation
  - Minimum 5 characters
  - Maximum 200 characters
  - DOMPurify sanitization
  
  // ✅ Content validation
  - Minimum 10 characters
  - Maximum 10,000 characters
  - HTML sanitization với whitelist tags
  - Forbidden scripts, objects, embeds
  
  // ✅ Category validation
  - Whitelist của valid categories
  
  // ✅ Image URL validation
  - Regex pattern cho image URLs
  - Chỉ accept jpg, jpeg, png, gif, webp
}
```

**Allowed HTML Tags:**
```javascript
ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h3', 'h4', 'blockquote']
FORBIDDEN_TAGS: ['script', 'object', 'embed', 'form', 'input']
FORBIDDEN_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
```

#### B. Comment Validation

```javascript
export const validateComment = (data) => {
  // ✅ More restrictive than posts
  - Minimum 1 character
  - Maximum 1,000 characters
  - Limited HTML tags: ['strong', 'em', 'br']
  - No attributes allowed
}
```

#### C. User Profile Validation

```javascript
export const validateUser = (data) => {
  // ✅ Display name
  - Minimum 2 characters
  - Maximum 50 characters
  - Sanitized
  
  // ✅ Email
  - Regex validation
  - Format: xxx@xxx.xxx
  
  // ✅ Bio (optional)
  - Maximum 500 characters
  - No HTML allowed
}
```

#### D. Message Validation

```javascript
export const validateMessage = (data) => {
  // ✅ Very restrictive for private messages
  - Minimum 1 character
  - Maximum 2,000 characters
  - No HTML tags allowed
  - Plain text only
}
```

### 7.2 Content Moderation

#### A. Spam Detection

```javascript
export const detectSpam = (content) => {
  const spamPatterns = [
    /(.)\1{10,}/g,              // Repeated characters
    /https?:\/\/[^\s]+/gi,      // Multiple URLs
    /\b(mua|bán|giá rẻ)/gi,     // Commercial keywords
    /\b\d{10,11}\b/g            // Phone numbers
  ];
  
  // Spam score calculation
  // isSpam: score >= 3
  // confidence: score / 5
}
```

#### B. Profanity Filter

```javascript
export const containsProfanity = (content) => {
  const profanityWords = [
    'đm', 'dm', 'vcl', 'cc', 'lồn', 'buồi', 
    'chó', 'súc vật', 'thằng ngu', 'con điên'
  ];
  
  // Returns: { hasProfanity: boolean, word: string }
}
```

### 7.3 File Upload Validation

**File:** `src/utils/validation.js`

```javascript
export const validateFile = (file, options = {}) => {
  // ✅ Size validation
  maxSize: 5MB default
  
  // ✅ Type validation
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  // ✅ Dimension validation (for images)
  maxWidth: 2048px
  maxHeight: 2048px
  
  // ✅ Async validation with Image object
  - Load image to check actual dimensions
  - Validate file is not corrupted
}
```

**Video Validation:**

**File:** `src/utils/videoValidation.ts`

```typescript
export const validateVideoFile = (file: File): ValidationResult => {
  // ✅ Size limit: 100MB
  // ✅ Duration limit: 5 minutes
  // ✅ Allowed formats: mp4, webm, mov
  // ✅ Aspect ratio validation
  // ✅ Resolution validation
}
```

### 7.4 XSS Protection

**DOMPurify Integration:**

```javascript
import DOMPurify from 'dompurify';

// ✅ Sanitize HTML content
const sanitized = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
  ALLOWED_ATTR: ['class'],
  FORBID_SCRIPTS: true,
  FORBID_TAGS: ['script', 'object', 'embed'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror']
});
```

**React Rendering:**

```javascript
// ✅ Safe rendering với dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(content) 
}} />
```

---

## 8. QUẢN LÝ SESSION VÀ TOKEN

### 8.1 JWT Token Management

**Token Structure:**

```javascript
{
  uid: "user123",
  email: "user@example.com",
  email_verified: true,
  name: "User Name",
  picture: "https://...",
  role: "user",
  iat: 1706342400,  // Issued at
  exp: 1706428800,  // Expires at (24h)
  aud: "nonglac-2026",
  iss: "https://securetoken.google.com/nonglac-2026"
}
```

**Token Lifecycle:**

```javascript
// 1. User login
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// 2. Get ID token
const idToken = await userCredential.user.getIdToken();

// 3. Send with API requests
headers: {
  'Authorization': `Bearer ${idToken}`
}

// 4. Server verifies token
const decodedToken = await admin.auth().verifyIdToken(idToken);

// 5. Token refresh (automatic by Firebase SDK)
// Tokens expire after 1 hour
// Firebase SDK auto-refreshes before expiration
```

**Token Storage:**

```javascript
// ✅ Firebase SDK handles token storage securely
// - Stored in IndexedDB (encrypted)
// - Not accessible via JavaScript
// - Auto-refresh mechanism

// ❌ KHÔNG LÀM:
localStorage.setItem('token', idToken); // Vulnerable to XSS
sessionStorage.setItem('token', idToken); // Vulnerable to XSS
```

### 8.2 Session Management

**Auth State Persistence:**

```javascript
// File: src/hooks/useAuth.js

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ✅ User logged in
      setUser(user);
      
      // ✅ Fetch user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      setUserProfile(userDoc.data());
    } else {
      // ✅ User logged out
      setUser(null);
      setUserProfile(null);
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);
```

**Session Timeout:**

```javascript
// Firebase Auth tokens expire after 1 hour
// SDK automatically refreshes tokens
// If refresh fails (e.g., user revoked), user is logged out

// Manual logout after inactivity (optional)
let inactivityTimer;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    auth.signOut(); // Logout after 30 minutes inactivity
  }, 30 * 60 * 1000);
};

// Reset timer on user activity
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
```

### 8.3 Token Revocation

**Server-side:**

```javascript
// File: server/middleware/auth.js

export const revokeUserTokens = async (uid) => {
  try {
    // ✅ Revoke all refresh tokens for user
    await admin.auth().revokeRefreshTokens(uid);
    
    // ✅ Update user record with revocation time
    const user = await admin.auth().getUser(uid);
    console.log(`Tokens revoked at: ${user.tokensValidAfterTime}`);
    
    return true;
  } catch (error) {
    console.error('Error revoking tokens:', error);
    return false;
  }
};
```

**Use cases:**
- User changes password
- Admin suspends account
- Security breach detected
- User reports unauthorized access


---

## 9. BẢO MẬT FILE UPLOAD

### 9.1 Image Upload Security

**Firebase Storage:**

**File:** `src/services/imageUploadService.js`

```javascript
class ImageUploadService {
  async uploadProductImages(images, productId) {
    // ✅ Upload to specific path
    const imageRef = ref(storage, `marketplace/${productId}/${index}_${Date.now()}`);
    
    // ✅ Upload with metadata
    const snapshot = await uploadBytes(imageRef, image);
    
    // ✅ Get secure download URL
    return getDownloadURL(snapshot.ref);
  }
}
```

**Security Measures:**
- ✅ File type validation (client-side)
- ✅ File size limit: 5MB
- ✅ Unique filename với timestamp
- ✅ Organized folder structure
- ⚠️ **Thiếu**: Server-side validation
- ⚠️ **Thiếu**: Virus scanning
- ⚠️ **Thiếu**: Image processing (resize, compress)

**Firebase Storage Rules:**

```javascript
// Khuyến nghị thêm vào firebase.storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Marketplace images
    match /marketplace/{productId}/{imageId} {
      allow read: if true; // Public images
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024 && // 5MB
        request.resource.contentType.matches('image/.*');
    }
    
    // User avatars
    match /avatars/{userId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 2 * 1024 * 1024 && // 2MB
        request.resource.contentType.matches('image/(jpeg|png|webp)');
    }
    
    // Post images
    match /posts/{postId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 9.2 Video Upload Security

**File:** `src/services/videoUploadService.ts`

```typescript
export const uploadVideo = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  // ✅ Validate file
  const validation = validateVideoFile(file);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // ✅ Generate unique filename
  const filename = `${userId}_${Date.now()}_${file.name}`;
  
  // ✅ Upload to Firebase Storage
  const storageRef = ref(storage, `videos/${userId}/${filename}`);
  
  // ✅ Track upload progress
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  // ✅ Get download URL
  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
  
  return { url: downloadURL, filename };
};
```

**Validation:**
- ✅ Max size: 100MB
- ✅ Max duration: 5 minutes
- ✅ Allowed formats: mp4, webm, mov
- ✅ Aspect ratio check
- ✅ Resolution validation

### 9.3 GitHub Storage (Alternative)

**File:** `src/services/githubStorage.js`

```javascript
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const GITHUB_REPO = 'task-files';

async uploadFile(file, path) {
  // ✅ Convert to base64
  const base64Content = await this.fileToBase64(file);
  
  // ✅ Upload via GitHub API
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Upload ${file.name}`,
        content: base64Content
      })
    }
  );
  
  return response.content.download_url;
}
```

**Security Concerns:**
- ⚠️ GitHub token có quyền write vào repo
- ⚠️ Public repo = public files
- ⚠️ Không có file type validation
- ⚠️ Không có size limit
- ⚠️ Rate limiting từ GitHub API

**Khuyến nghị:**
- Sử dụng Firebase Storage thay vì GitHub cho production
- Nếu dùng GitHub, chỉ cho private files
- Implement proper access control

---

## 10. MONITORING VÀ LOGGING

### 10.1 Error Tracking

**Sentry Integration:**

**File:** `src/utils/sentry.js`

```javascript
import * as Sentry from '@sentry/react';

// ✅ Initialize Sentry
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  
  // ✅ Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive fields
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    
    // Remove PII from extra data
    if (event.extra) {
      delete event.extra.phoneNumber;
      delete event.extra.email;
    }
    
    return event;
  }
});

// ✅ Report errors
export const reportError = (error, context = {}) => {
  Sentry.captureException(error, {
    contexts: {
      custom: context
    }
  });
};

// ✅ Add breadcrumbs
export const addBreadcrumb = (message, category, level = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    level
  });
};
```

**Privacy Protection:**
- ✅ Filter Authorization headers
- ✅ Remove cookies
- ✅ Remove PII (phone, email)
- ✅ Sanitize error messages

### 10.2 Error Logging Service

**File:** `src/utils/errorHandler.js`

```javascript
class ErrorLogger {
  log(error, context = {}) {
    const errorLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      type: this.determineErrorType(error),
      severity: this.determineSeverity(error),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: context.userId || 'anonymous',
        component: context.component,
        action: context.action
      }
    };
    
    // ✅ Store locally
    this.logs.unshift(errorLog);
    
    // ✅ Send to Sentry
    reportError(error, errorLog.context);
    
    // ✅ Send to backend (for high/critical errors)
    if (errorLog.severity === 'HIGH' || errorLog.severity === 'CRITICAL') {
      this.sendToBackend(errorLog);
    }
    
    return errorLog;
  }
}
```

**Error Types:**
- VALIDATION
- AUTHENTICATION
- AUTHORIZATION
- NETWORK
- FIREBASE
- AI_SERVICE
- UNKNOWN

**Severity Levels:**
- LOW: Validation errors
- MEDIUM: Network errors
- HIGH: Security issues, unauthorized access
- CRITICAL: System failures, data corruption

### 10.3 Audit Logging

**User Actions Tracking:**

```javascript
// Firestore collection: userActions
{
  userId: string,
  action: string,        // 'login', 'create_post', 'delete_comment'
  resource: string,      // 'post:123', 'comment:456'
  timestamp: Date,
  ipAddress: string,     // (if available)
  userAgent: string,
  result: string,        // 'success' | 'failure'
  metadata: object       // Additional context
}
```

**Security Rules:**

```javascript
match /userActions/{actionId} {
  allow read: if isAdmin();
  allow create: if isAuthenticated() && 
    request.resource.data.userId == request.auth.uid;
}
```

**Logged Actions:**
- ✅ Login/Logout
- ✅ Create/Update/Delete posts
- ✅ Create/Update/Delete comments
- ✅ AI service usage
- ✅ File uploads
- ✅ Profile updates
- ✅ Admin actions

### 10.4 Performance Monitoring

**File:** `src/utils/performanceMonitor.js`

```javascript
export const performanceMonitor = {
  marks: new Map(),
  
  start(name) {
    this.marks.set(name, performance.now());
  },
  
  end(name) {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      
      // ✅ Log slow operations (>1s)
      if (duration > 1000) {
        errorLogger.log(new Error(`Slow operation: ${name}`), {
          type: 'performance',
          duration,
          operation: name
        });
      }
      
      return duration;
    }
  }
};
```

**Usage:**

```javascript
performanceMonitor.start('loadPosts');
await fetchPosts();
const duration = performanceMonitor.end('loadPosts');
console.log(`Posts loaded in ${duration}ms`);
```


---

## 11. COMPLIANCE VÀ PRIVACY

### 11.1 GDPR Compliance (EU)

**Quyền của người dùng:**

#### A. Right to Access (Quyền truy cập)
```javascript
// User có thể xem toàn bộ dữ liệu của mình
async function exportUserData(userId) {
  const userData = await getDoc(doc(db, 'users', userId));
  const userPosts = await getDocs(query(collection(db, 'posts'), 
    where('authorId', '==', userId)));
  const userComments = await getDocs(query(collection(db, 'comments'), 
    where('authorId', '==', userId)));
  
  return {
    profile: userData.data(),
    posts: userPosts.docs.map(d => d.data()),
    comments: userComments.docs.map(d => d.data())
  };
}
```

#### B. Right to Rectification (Quyền sửa đổi)
```javascript
// User có thể cập nhật thông tin cá nhân
// Implemented in: src/features/profile/pages/EditProfile.js
```

#### C. Right to Erasure (Quyền xóa)
```javascript
// User có thể yêu cầu xóa tài khoản
async function deleteUserAccount(userId) {
  // 1. Soft delete (30 days grace period)
  await updateDoc(doc(db, 'users', userId), {
    isActive: false,
    deletedAt: new Date(),
    scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  
  // 2. Anonymize posts (keep content but remove author)
  const posts = await getDocs(query(collection(db, 'posts'), 
    where('authorId', '==', userId)));
  posts.forEach(async (post) => {
    await updateDoc(post.ref, {
      authorId: 'deleted_user',
      authorName: 'Người dùng đã xóa'
    });
  });
  
  // 3. Delete private data
  await deleteDoc(doc(db, 'conversations', userId));
  
  // 4. Schedule hard delete after 30 days
  // (Implemented via Cloud Function)
}
```

#### D. Right to Data Portability (Quyền chuyển dữ liệu)
```javascript
// Export dữ liệu dưới dạng JSON
async function exportUserDataJSON(userId) {
  const data = await exportUserData(userId);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Download file
  const a = document.createElement('a');
  a.href = url;
  a.download = `nonglac-data-${userId}-${Date.now()}.json`;
  a.click();
}
```

#### E. Right to Object (Quyền phản đối)
```javascript
// User có thể opt-out khỏi:
- Marketing emails
- Analytics tracking
- AI training data
- Location tracking

// Implemented in: Privacy Settings page
```

### 11.2 PDPA Compliance (Vietnam)

**Luật Bảo vệ Dữ liệu Cá nhân Việt Nam (2023):**

#### A. Consent Management

```javascript
// Xin phép trước khi thu thập dữ liệu nhạy cảm
const consentForm = {
  location: {
    required: true,
    purpose: "Hiển thị nông sản gần bạn",
    canRevoke: true
  },
  phoneNumber: {
    required: true,
    purpose: "Xác thực tài khoản",
    canRevoke: false // Required for account
  },
  aiChatHistory: {
    required: false,
    purpose: "Cải thiện dịch vụ AI",
    canRevoke: true
  }
};
```

#### B. Data Processing Notice

```javascript
// Thông báo xử lý dữ liệu cá nhân
const privacyNotice = {
  dataController: "NôngLạc Social",
  purpose: [
    "Cung cấp dịch vụ mạng xã hội nông nghiệp",
    "Kết nối nông dân với thị trường",
    "Cung cấp tư vấn AI"
  ],
  dataTypes: [
    "Thông tin cá nhân (tên, email, SĐT)",
    "Vị trí địa lý",
    "Nội dung bài viết",
    "Lịch sử sử dụng dịch vụ"
  ],
  retention: "Lưu trữ trong thời gian sử dụng dịch vụ + 30 ngày",
  sharing: "Không chia sẻ với bên thứ ba trừ khi có yêu cầu pháp lý",
  rights: [
    "Quyền truy cập dữ liệu",
    "Quyền sửa đổi dữ liệu",
    "Quyền xóa dữ liệu",
    "Quyền rút lại đồng ý"
  ]
};
```

### 11.3 Terms of Service & Privacy Policy

**Cần bổ sung:**

```javascript
// File: src/pages/PrivacyPolicy.js (CHƯA CÓ)
// File: src/pages/TermsOfService.js (ĐÃ CÓ)

const PrivacyPolicy = () => {
  return (
    <div>
      <h1>Chính sách Bảo mật</h1>
      
      <section>
        <h2>1. Thu thập thông tin</h2>
        <p>Chúng tôi thu thập:</p>
        <ul>
          <li>Thông tin bạn cung cấp (tên, email, SĐT)</li>
          <li>Thông tin tự động (IP, device, cookies)</li>
          <li>Thông tin từ bên thứ ba (Google OAuth)</li>
        </ul>
      </section>
      
      <section>
        <h2>2. Sử dụng thông tin</h2>
        <p>Mục đích:</p>
        <ul>
          <li>Cung cấp và cải thiện dịch vụ</li>
          <li>Xác thực và bảo mật tài khoản</li>
          <li>Gửi thông báo quan trọng</li>
          <li>Phân tích và thống kê</li>
        </ul>
      </section>
      
      <section>
        <h2>3. Chia sẻ thông tin</h2>
        <p>Chúng tôi KHÔNG bán dữ liệu của bạn.</p>
        <p>Chỉ chia sẻ khi:</p>
        <ul>
          <li>Có sự đồng ý của bạn</li>
          <li>Yêu cầu pháp lý</li>
          <li>Bảo vệ quyền lợi của chúng tôi</li>
        </ul>
      </section>
      
      <section>
        <h2>4. Bảo mật</h2>
        <p>Biện pháp bảo mật:</p>
        <ul>
          <li>Mã hóa dữ liệu (HTTPS/TLS)</li>
          <li>Xác thực đa yếu tố</li>
          <li>Firewall và monitoring</li>
          <li>Đào tạo nhân viên về bảo mật</li>
        </ul>
      </section>
      
      <section>
        <h2>5. Quyền của bạn</h2>
        <ul>
          <li>Truy cập và tải xuống dữ liệu</li>
          <li>Sửa đổi thông tin cá nhân</li>
          <li>Xóa tài khoản</li>
          <li>Rút lại đồng ý</li>
          <li>Khiếu nại về xử lý dữ liệu</li>
        </ul>
      </section>
      
      <section>
        <h2>6. Liên hệ</h2>
        <p>Email: privacy@nonglac.com</p>
        <p>Điện thoại: 1900-xxxx</p>
      </section>
    </div>
  );
};
```

### 11.4 Cookie Policy

```javascript
// Cookies được sử dụng:

// 1. Essential Cookies (Bắt buộc)
- Firebase Auth Session
- CSRF Token
- Language Preference

// 2. Analytics Cookies (Có thể từ chối)
- Google Analytics
- Firebase Analytics
- Performance Monitoring

// 3. Marketing Cookies (Có thể từ chối)
- KHÔNG SỬ DỤNG

// Cookie Consent Banner
const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(true);
  
  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setShowBanner(false);
  };
  
  const acceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    // Disable analytics
    setShowBanner(false);
  };
  
  return showBanner && (
    <div className="cookie-banner">
      <p>Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn.</p>
      <button onClick={acceptAll}>Chấp nhận tất cả</button>
      <button onClick={acceptEssential}>Chỉ cookies cần thiết</button>
    </div>
  );
};
```

---

## 12. INCIDENT RESPONSE

### 12.1 Security Incident Response Plan

**Quy trình xử lý sự cố bảo mật:**

#### Phase 1: Detection & Analysis (0-1 hour)

```yaml
Triggers:
  - Unusual login patterns
  - Mass data access
  - Failed authentication attempts spike
  - Error rate increase
  - User reports

Actions:
  1. Confirm incident
  2. Assess severity (Low/Medium/High/Critical)
  3. Activate response team
  4. Begin logging all activities
```

#### Phase 2: Containment (1-4 hours)

```yaml
Immediate Actions:
  - Isolate affected systems
  - Revoke compromised tokens
  - Block suspicious IPs
  - Disable compromised accounts
  - Enable additional logging

Short-term Containment:
  - Apply temporary security patches
  - Increase monitoring
  - Notify key stakeholders
```

#### Phase 3: Eradication (4-24 hours)

```yaml
Actions:
  - Identify root cause
  - Remove malware/backdoors
  - Patch vulnerabilities
  - Update security rules
  - Reset compromised credentials
```

#### Phase 4: Recovery (24-72 hours)

```yaml
Actions:
  - Restore services gradually
  - Monitor for anomalies
  - Verify data integrity
  - Re-enable user accounts
  - Update security measures
```

#### Phase 5: Post-Incident (1-2 weeks)

```yaml
Actions:
  - Document incident details
  - Conduct post-mortem
  - Update security policies
  - Train team on lessons learned
  - Notify affected users (if required)
```

### 12.2 Data Breach Response

**Theo PDPA Vietnam:**

```javascript
// Thông báo vi phạm dữ liệu trong vòng 72 giờ

const dataBreachNotification = {
  // 1. Thông báo cho cơ quan quản lý
  authority: {
    recipient: "Bộ Công an - Cục An ninh mạng",
    deadline: "72 hours",
    content: {
      natureOfBreach: "Mô tả vi phạm",
      dataAffected: "Loại dữ liệu bị ảnh hưởng",
      numberOfUsers: "Số lượng người dùng",
      consequences: "Hậu quả có thể xảy ra",
      measures: "Biện pháp đã/sẽ thực hiện"
    }
  },
  
  // 2. Thông báo cho người dùng
  users: {
    method: "Email + In-app notification",
    deadline: "Without undue delay",
    content: {
      whatHappened: "Mô tả sự việc",
      dataAffected: "Dữ liệu của bạn bị ảnh hưởng",
      whatWeDid: "Biện pháp chúng tôi đã thực hiện",
      whatYouShouldDo: "Khuyến nghị cho bạn",
      contact: "Liên hệ hỗ trợ"
    }
  }
};
```

**Email Template:**

```html
Subject: [QUAN TRỌNG] Thông báo về sự cố bảo mật

Kính gửi [Tên người dùng],

Chúng tôi xin thông báo về một sự cố bảo mật đã xảy ra với hệ thống NôngLạc.

ĐIỀU GÌ ĐÃ XẢY RA:
[Mô tả ngắn gọn về sự cố]

DỮ LIỆU BỊ ẢNH HƯỞNG:
- [Loại dữ liệu 1]
- [Loại dữ liệu 2]

CHÚNG TÔI ĐÃ LÀM GÌ:
- [Hành động 1]
- [Hành động 2]

BẠN NÊN LÀM GÌ:
1. Đổi mật khẩu ngay lập tức
2. Kiểm tra hoạt động tài khoản
3. Cảnh giác với email lừa đảo

LIÊN HỆ HỖ TRỢ:
Email: security@nonglac.com
Hotline: 1900-xxxx

Chúng tôi chân thành xin lỗi về sự bất tiện này.

Trân trọng,
Đội ngũ NôngLạc
```

