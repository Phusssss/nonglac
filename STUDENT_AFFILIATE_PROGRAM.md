# Chương Trình Tiếp Thị Liên Kết Sinh Viên

## Tổng Quan

Chương trình tiếp thị liên kết sinh viên cho phép sinh viên kiếm tiền bằng cách giới thiệu NongLac cho bạn bè. Khi sinh viên đăng ký qua link của bạn, bạn sẽ nhận được phần thưởng.

## Các Trang Được Tạo

### 1. Trang Landing Page - StudentAffiliateProgram
- **Đường dẫn**: `/student-affiliate-program`
- **File**: `src/pages/StudentAffiliateProgram.js`
- **CSS**: `src/styles/StudentAffiliateProgram.css`

**Chức năng**:
- Giới thiệu chương trình tiếp thị liên kết
- Hiển thị các lợi ích tham gia
- Hướng dẫn cách thức hoạt động
- Liệt kê các yêu cầu tham gia
- Nút "Đăng Ký Ngay" dẫn đến trang đăng ký sinh viên

### 2. Trang Đăng Ký Sinh Viên
- **Đường dẫn**: `/register?userType=student`
- **File**: `src/components/Registration/Registration.js` (đã sửa đổi)

**Các bước đăng ký sinh viên**:
1. Nhập số điện thoại
2. Nhập thông tin cơ bản (tên, giới tính, tuổi)
3. **[MỚI]** Nhập thông tin sinh viên (mã sinh viên, trường học)
4. Tạo mật khẩu

### 3. Component Mới - StudentInfoStep
- **File**: `src/components/Registration/StudentInfoStep.js`
- **Chức năng**: Bước nhập thông tin sinh viên trong quá trình đăng ký

## Cách Sử Dụng

### Cho Người Dùng Bình Thường
1. Truy cập `/register` để đăng ký tài khoản thông thường
2. Quy trình: Số điện thoại → Thông tin cơ bản → Mật khẩu

### Cho Sinh Viên
1. Truy cập `/student-affiliate-program` để xem thông tin chương trình
2. Click "Đăng Ký Ngay" hoặc truy cập `/register?userType=student`
3. Quy trình: Số điện thoại → Thông tin cơ bản → **Thông tin sinh viên** → Mật khẩu

## Dữ Liệu Được Lưu

Khi sinh viên đăng ký, các thông tin sau sẽ được lưu vào Firestore:

```javascript
{
  uid: "user_id",
  phoneNumber: "+84...",
  email: "temp_email@nonglac.temp",
  displayName: "Tên sinh viên",
  gender: "male/female/other",
  age: 20,
  studentId: "20210001",           // Mã sinh viên
  university: "Đại học Nông Lâm",  // Trường học
  userType: "student",              // Loại người dùng
  // ... các trường khác
}
```

## Các Hàm Được Thêm/Sửa Đổi

### registrationService.js

#### Hàm Mới: `saveStudentInfo(studentInfo)`
```javascript
saveStudentInfo(studentInfo) {
  // Lưu thông tin sinh viên
  // Tham số: { studentId, university, studentType }
  // Trả về: { success, message }
}
```

#### Hàm Sửa Đổi: `createSimpleAccount(password)`
- Bây giờ hỗ trợ lưu thông tin sinh viên nếu có
- Thêm các trường `studentId`, `university`, `userType` vào Firestore

## Tính Năng Tiếp Theo (Có Thể Thêm)

1. **Mã Giới Thiệu Độc Nhất**: Mỗi sinh viên nhận một mã giới thiệu để chia sẻ
2. **Theo Dõi Phần Thưởng**: Dashboard để xem số bạn bè đã giới thiệu và tiền kiếm được
3. **Xác Thực Trường Học**: Xác minh email trường học để đảm bảo sinh viên thực sự
4. **Bảng Xếp Hạng**: Hiển thị top sinh viên kiếm tiền nhiều nhất
5. **Thông Báo**: Gửi thông báo khi bạn bè đăng ký thành công

## Kiểm Tra

Để kiểm tra tính năng:

1. Truy cập `http://localhost:3000/student-affiliate-program`
2. Click "Đăng Ký Ngay"
3. Hoàn thành quy trình đăng ký 4 bước
4. Kiểm tra Firestore để xác nhận dữ liệu được lưu

## Ghi Chú

- Trang landing page có thiết kế responsive cho mobile, tablet, desktop
- Sử dụng Ant Design components để đồng nhất với giao diện hiện tại
- CSS được tối ưu hóa với animation và hover effects
- Danh sách trường học có thể được cập nhật trong `StudentInfoStep.js`
