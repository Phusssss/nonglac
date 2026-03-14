# Hệ Thống Giới Thiệu Sinh Viên

## Tổng Quan

Hệ thống giới thiệu cho phép sinh viên chia sẻ mã giới thiệu, link, và QR code để kiếm tiền từ việc giới thiệu bạn bè đăng ký.

## Các Tệp Được Tạo

### 1. Service - referralService.js
**Đường dẫn**: `src/services/referralService.js`

**Chức năng chính**:
- `generateReferralCode(displayName)`: Tạo mã giới thiệu duy nhất
  - Format: `STU_[3 ký tự tên]_[6 ký tự ngẫu nhiên]`
  - Ví dụ: `STU_NGU_A7K9M2`

- `getOrCreateReferralCode(userId, displayName)`: Lấy hoặc tạo mã giới thiệu
  - Kiểm tra xem người dùng đã có mã chưa
  - Nếu chưa, tạo mã mới và lưu vào Firestore

- `getReferralInfo(userId)`: Lấy thông tin giới thiệu
  - Trả về mã giới thiệu và thống kê

- `generateReferralLink(referralCode)`: Tạo link giới thiệu
  - Format: `{baseUrl}/register?userType=student&ref={referralCode}`

- `updateReferralStats(referrerUserId, earnAmount)`: Cập nhật thống kê
  - Tăng số lượng giới thiệu thành công
  - Cộng tiền thưởng

- `copyToClipboard(text)`: Copy text vào clipboard

### 2. Component - StudentReferralSection.js
**Đường dẫn**: `src/features/profile/components/StudentReferralSection.js`

**Chức năng**:
- Hiển thị mã giới thiệu
- Hiển thị link giới thiệu
- Hiển thị QR code
- Hiển thị thống kê (tổng giới thiệu, đăng ký thành công, thu nhập)
- Nút copy mã, copy link, tải QR
- Hướng dẫn sử dụng
- Điều khoản & điều kiện

### 3. CSS - StudentReferralSection.css
**Đường dẫn**: `src/features/profile/components/StudentReferralSection.css`

**Styling**:
- Responsive design cho mobile, tablet, desktop
- Gradient background
- Hover effects
- Animation

## Cách Hoạt Động

### 1. Khi Sinh Viên Đăng Ký
- Tài khoản được tạo với `userType: 'student'`
- Thông tin sinh viên được lưu (mã sinh viên, trường học)

### 2. Khi Sinh Viên Truy Cập Profile
- Nếu `userProfile.userType === 'student'`, hiển thị `StudentReferralSection`
- Component tự động tạo mã giới thiệu nếu chưa có
- Hiển thị mã, link, QR code, và thống kê

### 3. Khi Bạn Bè Đăng Ký
- Bạn bè truy cập link: `/register?userType=student&ref={referralCode}`
- Hoặc nhập mã giới thiệu khi đăng ký
- Sau khi đăng ký thành công, thống kê của sinh viên được cập nhật

## Dữ Liệu Firestore

### Cấu Trúc User Document
```javascript
{
  uid: "user_id",
  userType: "student",
  studentId: "20210001",
  university: "Đại học Nông Lâm",
  referralCode: "STU_NGU_A7K9M2",
  referralStats: {
    totalReferred: 5,
    successfulReferred: 3,
    totalEarnings: 150000,
    createdAt: Timestamp
  }
  // ... các trường khác
}
```

## Tính Năng

### Hiển Thị
- ✅ Mã giới thiệu (có thể copy)
- ✅ Link giới thiệu (có thể copy)
- ✅ QR code (có thể tải)
- ✅ Thống kê (tổng giới thiệu, đăng ký thành công, thu nhập)
- ✅ Hướng dẫn sử dụng
- ✅ Điều khoản & điều kiện

### Hành Động
- ✅ Copy mã giới thiệu
- ✅ Copy link giới thiệu
- ✅ Hiện/ẩn QR code
- ✅ Tải QR code dưới dạng PNG

## Tích Hợp

### Trong Profile Page
```javascript
{userProfile?.userType === 'student' && (
  <StudentReferralSection />
)}
```

### Trong Registration Service
Khi sinh viên đăng ký, thông tin `userType: 'student'` được lưu vào Firestore.

## Tính Năng Tiếp Theo (Có Thể Thêm)

1. **Xác Thực Đăng Ký**: Kiểm tra xem bạn bè đã hoàn thành xác thực chưa
2. **Rút Tiền**: Cho phép sinh viên rút tiền thưởng
3. **Lịch Sử Giới Thiệu**: Xem danh sách bạn bè đã giới thiệu
4. **Bảng Xếp Hạng**: Top sinh viên kiếm tiền nhiều nhất
5. **Thông Báo**: Gửi thông báo khi bạn bè đăng ký thành công
6. **Chia Sẻ Mạng Xã Hội**: Chia sẻ trực tiếp lên Facebook, Zalo, etc.

## Dependencies

Cần cài đặt:
```bash
npm install qrcode --legacy-peer-deps
```

Đã thêm vào `package.json`:
```json
"qrcode": "^1.5.3"
```

**Lưu ý**: Dùng `--legacy-peer-deps` vì có conflict với react-leaflet, nhưng `qrcode` hoàn toàn tương thích với React 18.

## Kiểm Tra

1. Đăng ký tài khoản sinh viên qua `/student-affiliate-program`
2. Truy cập `/profile`
3. Xem phần "Chương Trình Giới Thiệu Sinh Viên"
4. Test copy mã, copy link, tải QR

## Ghi Chú

- Mã giới thiệu được tạo tự động lần đầu tiên
- Mã giới thiệu là duy nhất cho mỗi sinh viên
- QR code được tạo từ link giới thiệu
- Thống kê được cập nhật khi bạn bè đăng ký thành công
- Component chỉ hiển thị cho tài khoản sinh viên
