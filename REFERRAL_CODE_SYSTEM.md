# Hệ Thống Mã Giới Thiệu

## Tổng Quan

Hệ thống mã giới thiệu cho phép sinh viên chia sẻ mã giới thiệu để người khác đăng ký. Khi người dùng đăng ký qua link hoặc nhập mã giới thiệu, mã sẽ được lưu vào tài khoản của họ.

## Các Thay Đổi

### 1. Link Giới Thiệu
**Trước**: `/register?userType=student&ref=STU_XXX_XXXXXX`
**Sau**: `/register?ref=STU_XXX_XXXXXX`

Link giới thiệu không còn cần `userType=student`, chỉ cần mã giới thiệu.

### 2. Quy Trình Đăng Ký
Thêm bước mới "Mã Giới Thiệu" vào quy trình đăng ký:

1. Số điện thoại
2. Thông tin cơ bản (tên, giới tính, tuổi)
3. **Mã Giới Thiệu (tùy chọn)** ← BỚ MỚI
4. Mật khẩu

### 3. Component Mới - ReferralCodeStep
**Đường dẫn**: `src/components/Registration/ReferralCodeStep.js`

**Chức năng**:
- Nhập mã giới thiệu (tùy chọn)
- Nếu URL có param `ref`, tự động điền vào
- Kiểm tra format mã giới thiệu: `STU_XXX_XXXXXX`
- Có thể bỏ qua bước này

### 4. Service - registrationService.js

**Hàm mới**: `saveReferralCode(referralCode)`
- Lưu mã giới thiệu
- Kiểm tra format mã
- Mã là tùy chọn

**Hàm sửa đổi**: `createSimpleAccount(password)`
- Thêm `referralCode` vào userData khi tạo tài khoản

### 5. Service - referralService.js

**Hàm sửa đổi**: `generateReferralLink(referralCode)`
- Link chỉ có `ref` param
- Không còn `userType=student`

## Dữ Liệu Firestore

### Cấu Trúc User Document
```javascript
{
  uid: "user_id",
  phoneNumber: "+84...",
  displayName: "Tên người dùng",
  referralCode: "STU_NGU_A7K9M2",  // Mã giới thiệu của người được giới thiệu
  // ... các trường khác
}
```

## Cách Hoạt Động

### Khi Sinh Viên Chia Sẻ Link
1. Sinh viên truy cập `/profile`
2. Xem phần "Chương Trình Giới Thiệu Sinh Viên"
3. Copy link: `/register?ref=STU_XXX_XXXXXX`
4. Chia sẻ link với bạn bè

### Khi Bạn Bè Đăng Ký
**Cách 1: Qua Link**
1. Bạn bè click link: `/register?ref=STU_XXX_XXXXXX`
2. Mã giới thiệu tự động điền vào bước 3
3. Hoàn thành đăng ký

**Cách 2: Nhập Mã Thủ Công**
1. Bạn bè truy cập `/register`
2. Hoàn thành bước 1 và 2
3. Bước 3: Nhập mã giới thiệu (tùy chọn)
4. Hoàn thành đăng ký

### Khi Đăng Ký Thành Công
- Mã giới thiệu được lưu vào tài khoản người dùng
- Thống kê của sinh viên được cập nhật (nếu có)
- Tiền thưởng được cộng vào tài khoản sinh viên

## Tính Năng

### Hiển Thị Trên Profile
- ✅ Mã giới thiệu của sinh viên
- ✅ Link giới thiệu (chỉ có `ref` param)
- ✅ QR code
- ✅ Thống kê

### Trong Quy Trình Đăng Ký
- ✅ Bước mã giới thiệu (tùy chọn)
- ✅ Tự động điền nếu URL có `ref` param
- ✅ Kiểm tra format mã
- ✅ Có thể bỏ qua

## Ví Dụ

### Link Giới Thiệu
```
http://localhost:3000/register?ref=STU_NGU_A7K9M2
```

### Mã Giới Thiệu
```
STU_NGU_A7K9M2
```

Format: `STU_[3 ký tự tên]_[6 ký tự ngẫu nhiên]`

## Tích Hợp

### Trong StudentReferralSection
```javascript
const link = referralService.generateReferralLink(referralCode);
// Kết quả: /register?ref=STU_XXX_XXXXXX
```

### Trong Registration
```javascript
const referralCode = searchParams.get('ref');
// Truyền vào ReferralCodeStep
<ReferralCodeStep initialCode={referralCode} />
```

## Tính Năng Tiếp Theo

1. **Xác Thực Mã Giới Thiệu**: Kiểm tra xem mã có tồn tại không
2. **Cập Nhật Thống Kê**: Tự động cập nhật khi bạn bè đăng ký thành công
3. **Rút Tiền**: Cho phép sinh viên rút tiền thưởng
4. **Lịch Sử**: Xem danh sách bạn bè đã giới thiệu ✅ (Đã thêm)
5. **Thông Báo**: Gửi thông báo khi bạn bè đăng ký

## Ghi Chú

- Mã giới thiệu là tùy chọn, người dùng có thể bỏ qua
- Mã giới thiệu được lưu vào tài khoản người dùng
- Link giới thiệu không còn cần `userType=student`
- Quy trình đăng ký bình thường, chỉ thêm bước mã giới thiệu


## Danh Sách Người Được Giới Thiệu

### Component - ReferredUsersList
**Đường dẫn**: `src/features/profile/components/ReferredUsersList.js`

**Chức năng**:
- Hiển thị danh sách tài khoản đã đăng ký qua mã giới thiệu
- Bảng với các cột: Tên, Số điện thoại, Ngày đăng ký, Trạng thái
- Xem chi tiết từng người dùng
- Phân trang

**Dữ Liệu Hiển Thị**:
- Tên người dùng
- Số điện thoại
- Email
- Giới tính
- Tuổi
- Ngày đăng ký
- Trạng thái xác thực
- Uy tín
- Số bài viết

### Service - referralService.js

**Hàm mới**: `getReferredUsers(referralCode)`
- Lấy danh sách tài khoản có `referralCode` trùng khớp
- Trả về mảng người dùng

### Tích Hợp Trong Profile

```javascript
{userProfile?.userType === 'student' && (
  <>
    <StudentReferralSection />
    {userProfile?.referralCode && (
      <ReferredUsersList referralCode={userProfile.referralCode} />
    )}
  </>
)}
```

### Hiển Thị

Khi sinh viên truy cập `/profile`:
1. Phần "Chương Trình Giới Thiệu Sinh Viên" (mã, link, QR)
2. Phần "Danh Sách Người Dùng Đã Đăng Ký" (bảng danh sách)

### Ví Dụ Dữ Liệu

```javascript
{
  uid: "user_123",
  displayName: "Nguyễn Văn A",
  phoneNumber: "+84912345678",
  email: "a@example.com",
  gender: "male",
  age: 20,
  joinDate: Timestamp,
  verificationStatus: "verified",
  reputation: 10,
  postsCount: 5
}
```
