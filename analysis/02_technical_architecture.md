# 🏗️ KIẾN TRÚC KỸ THUẬT NÔNG LẠC

## 1. KIẾN TRÚC TỔNG THỂ

### 1.1 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Cloud Services │    │   Server Side   │
│                 │    │                 │    │                 │
│  React SPA      │◄──►│  Firebase       │◄──►│  Node.js        │
│  - Components   │    │  - Auth         │    │  - Express      │
│  - Services     │    │  - Firestore    │    │  - Scrapers     │
│  - Contexts     │    │  - Storage      │    │  - Cron Jobs    │
│  - Hooks        │    │  - Hosting      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External APIs │    │   CDN/Assets    │    │   Data Sources  │
│                 │    │                 │    │                 │
│  - Gemini AI    │    │  - Images       │    │  - NhaBeAgri    │
│  - Google Search│    │  - Static Files │    │  - NNVN News    │
│  - Maps API     │    │  - Fonts        │    │  - Price APIs   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 Data Flow Architecture
```
User Request → React Router → Component → Service → Firebase/API → Response
     ↓              ↓           ↓          ↓           ↓
   Browser      Route Guard   State Mgmt  HTTP Call  Database
```

## 2. FRONTEND ARCHITECTURE

### 2.1 Folder Structure
```
src/
├── components/           # Reusable UI components
│   ├── ChatBot/         # AI chatbot
│   ├── Login/           # Authentication
│   ├── Mission/         # Gamification
│   ├── PostCard/        # Social posts
│   └── Registration/    # User signup
├── contexts/            # React Context API
│   └── ChatContext.js   # Chat state management
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication hook
│   └── useOnlineStatus.js # Online status
├── pages/               # Route components (23 pages)
│   ├── Home.js          # Main feed
│   ├── Marketplace.js   # E-commerce
│   ├── AdminDashboard.js # Admin panel
│   └── ...
├── services/            # Business logic (16 services)
│   ├── priceService.js  # Price data
│   ├── geminiService.js # AI integration
│   ├── crawlerService.js # Web scraping
│   └── ...
├── firebase/            # Firebase configuration
├── utils/               # Utility functions
├── data/                # Static data
└── assets/              # Images, icons
```

### 2.2 Component Architecture
```
App.js (Root)
├── Router (React Router)
├── AuthProvider (Authentication Context)
├── ChatProvider (Chat Context)
├── ConfigProvider (Ant Design Theme)
└── Layout
    ├── ResponsiveNavbar
    ├── Routes (Lazy Loaded)
    └── Footer
```

### 2.3 State Management
- **Global State**: React Context API
  - AuthContext: User authentication
  - ChatContext: Chat conversations
- **Local State**: useState, useReducer
- **Server State**: Direct Firebase calls (no caching layer)

### 2.4 Routing Strategy
```javascript
// Lazy loading for performance
const Home = React.lazy(() => import('./pages/Home'));
const ChatBot = React.lazy(() => import('./components/ChatBot'));
// ... 20+ more lazy-loaded components

// Route structure
/                    # Home feed
/profile            # User profile
/marketplace        # E-commerce
/gia-nong-san      # Price tracking
/plant-doctor      # AI diagnosis
/admin             # Admin dashboard
```

## 3. BACKEND ARCHITECTURE

### 3.1 Server Structure
```
server/
├── server.js           # Main Express server (Port 3001)
│   ├── Price scraping endpoints
│   ├── CORS configuration
│   └── Cron job scheduling
├── scrapeServer.js     # Dedicated scraper
├── batch/              # Batch processing jobs
├── scrapers/           # Scraper modules
│   ├── nhabeagri.js   # Price scraper
│   └── nnvn.js        # News scraper
└── package.json        # Dependencies
```

### 3.2 API Endpoints
```
GET  /api/prices        # Get current prices
POST /api/batch/run     # Run batch job
GET  /api/news          # Get scraped news
GET  /health           # Health check
```

### 3.3 Cron Jobs
```javascript
// Every 30 minutes - Price updates
cron.schedule('*/30 * * * *', async () => {
  await scrapeNhaBeAgri();
});

// Daily at 6 AM - News updates
cron.schedule('0 6 * * *', async () => {
  await scrapeNNVNNews();
});
```

## 4. DATABASE ARCHITECTURE

### 4.1 Firestore Schema Design
```
users/                          # User profiles
├── {userId}/
    ├── displayName: string
    ├── email: string
    ├── reputation: number
    ├── joinDate: timestamp
    ├── postsCount: number
    └── likesReceived: number

posts/                          # Social posts
├── {postId}/
    ├── title: string
    ├── content: string
    ├── category: string
    ├── authorId: string
    ├── authorName: string
    ├── authorReputation: number
    ├── createdAt: timestamp
    ├── likes: number
    └── comments: number

prices/                         # Agricultural prices
├── {priceId}/
    ├── productName: string
    ├── currentPrice: number
    ├── previousPrice: number
    ├── unit: string
    ├── market: string
    ├── category: string
    ├── change: string
    ├── date: string
    ├── updatedAt: timestamp
    └── source: string

conversations/                  # Chat system
├── {conversationId}/
    ├── participants: array
    ├── lastMessage: string
    ├── lastMessageTime: timestamp
    ├── unreadCount: object
    └── messages/               # Subcollection
        ├── {messageId}/
            ├── senderId: string
            ├── text: string
            ├── timestamp: timestamp
            └── type: string
```

### 4.2 Database Indexes (Cần thêm)
```javascript
// Composite indexes needed for performance
posts: [
  ['authorReputation', 'createdAt'],  // Newsfeed algorithm
  ['category', 'createdAt'],          // Category filtering
  ['likes', 'createdAt']              // Popular posts
]

prices: [
  ['productName', 'updatedAt'],       // Price history
  ['category', 'updatedAt'],          # Category prices
  ['market', 'updatedAt']             # Market prices
]
```

### 4.3 Security Rules (Hiện tại - Không bảo mật)
```javascript
// Current rules - INSECURE
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ❌ Cho phép tất cả
    }
  }
}
```

## 5. EXTERNAL INTEGRATIONS

### 5.1 Firebase Services
```
Authentication:
├── Email/Password
├── Google OAuth
└── Phone OTP

Firestore:
├── Real-time database
├── Offline support
└── Auto-scaling

Storage:
├── Image uploads
├── File management
└── CDN delivery

Hosting:
├── Static site hosting
├── Custom domain
└── SSL certificates

Analytics:
├── User tracking
├── Event logging
└── Performance monitoring
```

### 5.2 AI Services
```
Google Gemini 2.5 Flash:
├── Image analysis (Plant Doctor)
├── Text generation (Post Generator)
├── Chat responses (AgriBot)
└── Market insights

Google Search API:
├── News aggregation
├── Price information
└── Weather data
```

### 5.3 Web Scraping Targets
```
NhaBeAgri.com:
├── Agricultural prices
├── Market trends
└── Product categories

NongnghiepMoitruong.vn:
├── News articles
├── Technical guides
└── Policy updates
```

## 6. PERFORMANCE ARCHITECTURE

### 6.1 Frontend Optimization
```
Code Splitting:
├── Route-based splitting (React.lazy)
├── Component lazy loading
└── Dynamic imports

Bundle Optimization:
├── Tree shaking
├── Minification
└── Compression

Caching Strategy:
├── Browser caching
├── Service worker (planned)
└── CDN caching
```

### 6.2 Backend Optimization
```
Current:
├── In-memory caching (limited)
├── Cron job scheduling
└── Basic error handling

Needed:
├── Redis caching layer
├── Database connection pooling
├── Load balancing
└── API rate limiting
```

## 7. SECURITY ARCHITECTURE

### 7.1 Current Security (Yếu)
```
Frontend:
├── Firebase Auth tokens
├── HTTPS enforcement
└── Input sanitization (basic)

Backend:
├── CORS configuration
├── Express security headers
└── Environment variables

Database:
❌ No authentication rules
❌ No data validation
❌ No rate limiting
```

### 7.2 Security Gaps
```
Critical Issues:
├── Firestore rules allow all access
├── API keys exposed in frontend
├── No input validation
├── No rate limiting
└── No audit logging

Medium Issues:
├── No CSRF protection
├── No XSS protection
├── No SQL injection protection
└── No file upload validation
```

## 8. DEPLOYMENT ARCHITECTURE

### 8.1 Current Deployment
```
Frontend:
├── Build: npm run build
├── Deploy: firebase deploy
└── Hosting: Firebase Hosting

Backend:
├── Manual deployment
├── Single server instance
└── No load balancing

Database:
├── Firebase Firestore
├── Auto-scaling
└── Multi-region replication
```

### 8.2 CI/CD Pipeline (Cần thiết lập)
```
Proposed Pipeline:
├── Git push → GitHub Actions
├── Run tests → Build
├── Deploy to staging → Test
└── Deploy to production
```

## 9. MONITORING ARCHITECTURE

### 9.1 Current Monitoring (Hạn chế)
```
Available:
├── Firebase Analytics
├── Google Analytics
└── Basic error logging

Missing:
├── Application Performance Monitoring
├── Error tracking (Sentry)
├── Log aggregation
├── Alerting system
└── Health checks
```

### 9.2 Proposed Monitoring Stack
```
Error Tracking: Sentry
Performance: New Relic / DataDog
Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
Alerting: PagerDuty
Uptime: Pingdom
```

## 10. SCALABILITY CONSIDERATIONS

### 10.1 Current Limitations
```
Frontend:
├── Large bundle size (multiple UI libs)
├── No service worker caching
└── No CDN for assets

Backend:
├── Single Node.js instance
├── No horizontal scaling
├── No caching layer
└── No load balancing

Database:
├── No query optimization
├── No indexing strategy
├── Potential hot spots
└── No sharding strategy
```

### 10.2 Scaling Strategy
```
Phase 1 (0-1K users):
├── Optimize bundle size
├── Add Redis caching
├── Implement proper indexes
└── Add monitoring

Phase 2 (1K-10K users):
├── Horizontal server scaling
├── CDN implementation
├── Database optimization
└── Caching layers

Phase 3 (10K+ users):
├── Microservices architecture
├── Container orchestration
├── Auto-scaling
└── Multi-region deployment
```

## 11. TECHNOLOGY DECISIONS

### 11.1 Good Decisions ✅
- **React**: Modern, component-based UI
- **Firebase**: Rapid development, real-time features
- **Lazy Loading**: Performance optimization
- **Modular Structure**: Maintainable codebase

### 11.2 Questionable Decisions ❓
- **Multiple UI Libraries**: MUI + Ant Design + Tailwind (bundle bloat)
- **No TypeScript**: Type safety missing
- **No Testing**: Quality assurance gap
- **Exposed API Keys**: Security risk

### 11.3 Missing Technologies ❌
- **TypeScript**: Type safety
- **Testing Framework**: Jest + React Testing Library
- **State Management**: Redux/Zustand for complex state
- **Caching**: Redis for backend caching
- **Monitoring**: Sentry for error tracking

## 12. ARCHITECTURE RECOMMENDATIONS

### 12.1 Immediate Improvements (Tuần 1-2)
1. **Security**: Implement Firestore rules
2. **Bundle Size**: Remove duplicate UI libraries
3. **API Keys**: Move to backend proxy
4. **Error Handling**: Add comprehensive error boundaries

### 12.2 Short-term Improvements (Tháng 1-2)
1. **TypeScript**: Gradual migration
2. **Testing**: Add unit and integration tests
3. **Caching**: Implement Redis caching
4. **Monitoring**: Add Sentry error tracking

### 12.3 Long-term Improvements (Tháng 3-6)
1. **Microservices**: Break down monolithic server
2. **Container**: Docker + Kubernetes deployment
3. **CDN**: CloudFlare integration
4. **Multi-region**: Global deployment strategy

---
*Phân tích kiến trúc bởi: Kiro AI*
*Ngày: 11/01/2026*