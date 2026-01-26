# Profile Feature

## Cấu trúc

```
profile/
├── components/           # UI Components
│   ├── ProfileHeader.js     # Header với avatar và thông tin cơ bản
│   ├── ProfileSidebar.js    # Sidebar với stats và skills
│   ├── ProfileTabs.js       # Tab navigation
│   ├── ProfileContent.js    # Nội dung bài viết
│   ├── EditProfileDialog.js # Dialog chỉnh sửa profile
│   └── index.js            # Export components
├── hooks/               # Custom hooks
│   ├── useProfile.js       # Hook quản lý data profile
│   ├── useProfileEdit.js   # Hook chỉnh sửa profile
│   └── index.js           # Export hooks
├── services/            # Business logic
│   └── index.js           # Profile utilities
├── constants/           # Constants
│   └── index.js           # Profile constants
├── styles/              # CSS styles
│   └── profile.css        # Profile specific styles
├── pages/               # Pages
│   └── Profile.js         # Main profile page
└── index.js             # Feature entry point
```

## Tính năng

- ✅ Hiển thị thông tin profile
- ✅ Chỉnh sửa profile (tên, avatar)
- ✅ Hiển thị bài viết của user
- ✅ Infinite scroll
- ✅ Tab navigation
- ✅ Responsive design
- ✅ Clean code structure

## Sử dụng

```javascript
import { Profile } from '../features/profile';

// Trong App.js hoặc Router
<Route path="/profile" element={<Profile />} />
```

## Components

### ProfileHeader
- Hiển thị avatar, tên, email
- Button chỉnh sửa
- Responsive design

### ProfileSidebar  
- Thống kê followers/following/posts
- Giới thiệu
- Chuyên môn/skills

### ProfileContent
- Danh sách bài viết
- Loading states
- Infinite scroll

### EditProfileDialog
- Modal chỉnh sửa thông tin
- Upload avatar
- Validation

## Hooks

### useProfile
- Load bài viết của user
- Infinite scroll logic
- Stats (followers/following)

### useProfileEdit
- Quản lý form chỉnh sửa
- Upload avatar
- Update profile

## Performance

- Lazy loading components
- Optimized re-renders
- Throttled scroll events
- Image optimization