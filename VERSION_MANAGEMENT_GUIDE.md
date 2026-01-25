# Hướng dẫn Quản lý Version & Cache

## Tổng quan

Hệ thống quản lý version tự động giúp đảm bảo người dùng luôn có phiên bản mới nhất của ứng dụng mà không gặp lỗi cache cũ.

## Cách hoạt động

1. **Version Storage**: Version được lưu trên Firebase Firestore
2. **Auto Check**: Ứng dụng tự động check version mỗi 5 phút
3. **Cache Clear**: Khi phát hiện version mới, tự động xóa cache và reload
4. **User Notification**: Hiển thị thông báo trước khi reload

## Quy trình Deploy

### 1. Cập nhật Version (Tự động - Không cần Git clean)

```bash
# Tăng patch version (1.0.0 -> 1.0.1)
npm run version:patch

# Tăng minor version (1.0.0 -> 1.1.0)
npm run version:minor

# Tăng major version (1.0.0 -> 2.0.0)
npm run version:major
```

### 2. Cập nhật Version (Thủ công)

```bash
# Cập nhật version cụ thể
npm run version:set 1.2.3

# Hoặc chỉ cập nhật build time
npm run build:version
```

### 3. Build & Deploy

```bash
# Build sẽ tự động cập nhật version
npm run build

# Deploy lên hosting
firebase deploy
```

### 4. Cập nhật Version trên Firebase

Sau khi deploy, vào **Admin Dashboard > Version & Cache** và:
1. Nhập version mới (ví dụ: 1.2.3)
2. Click "Cập nhật Version"
3. Người dùng sẽ tự động nhận được update

## Ưu điểm của Script mới

✅ **Không cần Git clean** - Hoạt động ngay cả khi có uncommitted changes
✅ **Tự động cập nhật package.json** - Đồng bộ version across files
✅ **Thông tin chi tiết** - Hiển thị summary sau khi update
✅ **Flexible** - Hỗ trợ cả auto increment và manual version

## Sử dụng Admin Panel

### Truy cập Version Manager

1. Đăng nhập Admin Dashboard
2. Vào tab "Version & Cache"
3. Xem thông tin version hiện tại
4. Cập nhật version mới khi cần

### Các chức năng

- **Xem thông tin version**: Build, Firebase, Local cache
- **Cập nhật version**: Đẩy version mới lên Firebase
- **Kiểm tra version**: Force check version ngay lập tức
- **Xóa cache**: Xóa toàn bộ cache (trừ thông tin đăng nhập)
- **Reload trang**: Reload trang hiện tại

## Cấu hình

### Environment Variables

```env
REACT_APP_VERSION=1.0.0          # Version hiện tại
REACT_APP_BUILD_TIME=1234567890  # Thời gian build
```

### Firebase Collection

```
/system/version
{
  version: "1.0.0",
  updatedAt: Timestamp,
  updatedBy: "admin"
}
```

## Tính năng

### ✅ Tự động Check Version
- Check mỗi 5 phút
- Check khi user focus vào tab
- Check khi khởi động app

### ✅ Smart Cache Management
- Giữ lại thông tin đăng nhập
- Xóa cache cũ (localStorage, sessionStorage)
- Xóa service worker cache
- Xóa browser cache

### ✅ User Experience
- Thông báo đẹp khi có update
- Countdown trước khi reload
- Không làm gián đoạn công việc

### ✅ Admin Control
- Quản lý version từ admin panel
- Xem thống kê version
- Force update khi cần

## Troubleshooting

### Lỗi thường gặp

1. **Version không update**
   - Kiểm tra Firebase connection
   - Xem console log
   - Thử force check version

2. **Cache không clear**
   - Thử xóa cache thủ công
   - Kiểm tra browser permissions
   - Hard refresh (Ctrl+F5)

3. **Thông báo không hiện**
   - Kiểm tra popup blocker
   - Xem browser console
   - Thử với browser khác

### Debug Commands

```bash
# Xem version hiện tại
console.log(process.env.REACT_APP_VERSION)

# Force check version
versionService.checkAndUpdateVersion()

# Xem thông tin version
versionService.getCurrentVersionInfo()

# Clear cache thủ công
versionService.clearAllCache()
```

## Best Practices

1. **Luôn test trước khi deploy**
2. **Cập nhật version theo semantic versioning**
3. **Thông báo user trước khi có breaking changes**
4. **Backup database trước major updates**
5. **Monitor error logs sau deploy**

## Scripts Hữu ích

```bash
# Deploy hoàn chỉnh với patch version
npm run version:patch && npm run build && firebase deploy

# Deploy với minor version
npm run version:minor && npm run build && firebase deploy

# Deploy với major version  
npm run version:major && npm run build && firebase deploy

# Set version cụ thể và deploy
npm run version:set 2.1.0 && npm run build && firebase deploy

# Quick update version mà không build
npm run build:version

# Check build size
npm run analyze

# Chỉ build với version hiện tại
npm run build
```

## Monitoring

- Theo dõi Firebase console cho version updates
- Check browser console cho errors
- Monitor user feedback sau updates
- Sử dụng analytics để track update success rate