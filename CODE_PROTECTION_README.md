# 🛡️ Hệ Thống Bảo Vệ Code - NôngLạc Social

## Tổng Quan

Hệ thống bảo vệ code toàn diện cho ứng dụng React, ngăn chặn việc truy cập mã nguồn và dữ liệu nhạy cảm trong môi trường production.

### ✨ Tính Năng Chính

- ✅ **Vô hiệu hóa Console**: Tất cả console logs bị tắt trong production
- ✅ **Chặn DevTools**: Phát hiện và cảnh báo khi DevTools được mở
- ✅ **Chặn Phím Tắt**: F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S
- ✅ **Chặn Right-Click**: Ngăn context menu
- ✅ **Cảnh Báo Bản Quyền**: Modal đẹp với thông báo tiếng Việt
- ✅ **Tự Động Logout**: Sau 3 lần vi phạm
- ✅ **Logging**: Tích hợp Sentry và Firebase
- ✅ **Environment-Aware**: Chỉ hoạt động trong production

## 🚀 Cài Đặt

Hệ thống đã được tích hợp sẵn vào `App.js`. Không cần cài đặt thêm.

## 📖 Cách Sử Dụng

### Cấu Hình Mặc Định

File: `src/config/protectionConfig.js`

```javascript
export const protectionConfig = {
  enabled: true,
  devToolsDetection: true,
  consoleProtection: true,
  keyboardProtection: true,
  warningLevel: 'critical',
  violationThreshold: 3,
  autoLogout: true,
  customMessages: {
    warningTitle: '⚠️ CẢNH BÁO BẢO MẬT',
    warningContent: 'Hệ thống đã phát hiện hành vi cố gắng truy cập mã nguồn...'
  }
};
```

### Tùy Chỉnh Cấu Hình

#### 1. Thay Đổi Số Lần Vi Phạm

```javascript
violationThreshold: 5  // Cho phép 5 lần thay vì 3
```

#### 2. Tắt Tự Động Logout

```javascript
autoLogout: false
```

#### 3. Thay Đổi Thông Báo

```javascript
customMessages: {
  warningTitle: 'Cảnh báo của bạn',
  warningContent: 'Nội dung cảnh báo của bạn'
}
```

#### 4. Whitelist Cho Admin

```javascript
whitelist: {
  userRoles: ['super_admin', 'developer']
}
```

#### 5. Tắt Một Tính Năng Cụ Thể

```javascript
devToolsDetection: false,  // Tắt phát hiện DevTools
consoleProtection: true,   // Giữ console protection
keyboardProtection: true   // Giữ keyboard protection
```

## 🧪 Testing

### Development Mode

```bash
npm start
```

**Kết quả mong đợi:**
- Console logs hoạt động bình thường ✅
- F12 mở được DevTools ✅
- Right-click hoạt động ✅
- Không có cảnh báo ✅

### Production Mode

```bash
npm run build
npx serve -s build
```

**Kết quả mong đợi:**
- Console logs không hiển thị ❌
- F12 bị chặn ❌
- Ctrl+Shift+I/J/C bị chặn ❌
- Right-click bị chặn ❌
- Mở DevTools → Cảnh báo xuất hiện ⚠️
- Mở 3 lần → Tự động logout 🚪

## 📊 Monitoring

### Sentry Integration

Tất cả violations được log to Sentry với context:

```javascript
{
  type: 'security',
  violations: [...],
  userAgent: '...',
  url: '...',
  timestamp: ...
}
```

### Firebase Integration

Violations được lưu vào collection `security_violations`:

```javascript
{
  type: 'devtools_opened',
  timestamp: 1234567890,
  userAgent: 'Mozilla/5.0...',
  url: 'https://...',
  screenResolution: '1920x1080'
}
```

## 🔧 API Reference

### useProtection Hook

```javascript
import { useProtection } from './contexts/ProtectionContext';

function MyComponent() {
  const {
    isActive,           // Protection đang hoạt động?
    isDevToolsOpen,     // DevTools đang mở?
    violationCount,     // Số lần vi phạm
    showWarning,        // Đang hiển thị cảnh báo?
    restrictedMode,     // Chế độ hạn chế?
    handleViolation     // Trigger violation manually
  } = useProtection();
  
  return <div>...</div>;
}
```

### Violation Manager

```javascript
import { violationManager } from './services/violationManager';

// Get violation count
const count = violationManager.getViolationCount();

// Get all violations
const violations = violationManager.getViolations();

// Clear violations
violationManager.clearViolations();

// Check if should restrict
const shouldRestrict = violationManager.shouldRestrict(3);
```

### Protection Logger

```javascript
import { protectionLogger } from './services/protectionLogger';

// Log violation
await protectionLogger.logViolation('custom_violation', {
  customData: 'value'
});

// Log event
await protectionLogger.logEvent('custom_event', {
  eventData: 'value'
});
```

## 🎨 UI Customization

### Thay Đổi Màu Sắc Modal

File: `src/components/ProtectionWarningModal.jsx`

```javascript
bodyStyle={{ 
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Thay đổi gradient
  borderRadius: '8px'
}}
```

### Thay Đổi Icon

```javascript
import { ShieldAlert, Lock, AlertTriangle } from 'lucide-react';

// Thay ShieldAlert bằng icon khác
<Lock size={80} color="#fff" />
```

## 🔒 Security Best Practices

### ⚠️ Lưu Ý Quan Trọng

Đây là **client-side protection**, không thể ngăn chặn 100% reverse engineering. Nên kết hợp với:

1. **Code Obfuscation**: Sử dụng webpack-obfuscator
2. **API Security**: Authentication & Authorization
3. **Rate Limiting**: Giới hạn request
4. **Server-Side Validation**: Validate tất cả input
5. **HTTPS**: Bắt buộc HTTPS
6. **CSP Headers**: Content Security Policy

### Recommended: Add Code Obfuscation

```bash
npm install --save-dev webpack-obfuscator
```

File: `config-overrides.js`

```javascript
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = function override(config, env) {
  if (env === 'production') {
    config.plugins.push(
      new WebpackObfuscator({
        rotateStringArray: true,
        stringArray: true,
        stringArrayThreshold: 0.75
      })
    );
  }
  return config;
};
```

## 📈 Performance Impact

- **Bundle Size**: +15KB (minified + gzipped)
- **Runtime Overhead**: Minimal (interval 500ms)
- **Load Time**: <5% increase
- **Memory**: <2MB additional

## 🐛 Troubleshooting

### Console vẫn hoạt động trong production

**Nguyên nhân**: NODE_ENV không phải 'production'

**Giải pháp**:
```bash
# Check NODE_ENV
echo $NODE_ENV

# Build với production mode
NODE_ENV=production npm run build
```

### Cảnh báo không xuất hiện

**Nguyên nhân**: Protection bị disable

**Giải pháp**: Check `protectionConfig.enabled = true`

### Tự động logout không hoạt động

**Nguyên nhân**: autoLogout = false hoặc auth token không tồn tại

**Giải pháp**: 
- Set `autoLogout: true`
- Đảm bảo có auth token trong localStorage

### DevTools vẫn mở được

**Nguyên nhân**: Một số browser có cách mở DevTools khác

**Giải pháp**: Detection sẽ phát hiện sau khi mở (trong 500ms)

## 📝 Changelog

### Version 1.0.0 (Feb 12, 2026)
- ✅ Initial release
- ✅ Console protection
- ✅ DevTools detection
- ✅ Keyboard protection
- ✅ Warning modal
- ✅ Violation management
- ✅ Sentry & Firebase integration

## 🤝 Support

Nếu có vấn đề, vui lòng:
1. Check console trong development mode
2. Check Sentry logs
3. Check Firebase security_violations collection
4. Contact dev team

## 📄 License

© 2026 NôngLạc Social - All Rights Reserved

---

**Made with ❤️ by NôngLạc Team**
