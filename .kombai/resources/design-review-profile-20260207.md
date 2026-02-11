# Kết quả Review Thiết kế: Hồ sơ cá nhân (Profile Page)

**Ngày thực hiện**: 07/02/2026
**Đường dẫn**: `/profile`
**Các khía cạnh tập trung**: Visual Design, UX/Usability, Security, Code Consistency

## Tóm tắt
Trang Hồ sơ hiện tại cung cấp đầy đủ các thông tin và tính năng quản lý cơ bản. Tuy nhiên, giao diện còn khá đơn giản, chưa tạo được dấu ấn cá nhân cho người dùng. Việc hiển thị email trực tiếp và thiếu ảnh bìa khiến trang trông giống một bảng quản lý (admin) hơn là một hồ sơ mạng xã hội chuyên nghiệp.

## Danh sách các vấn đề

| # | Vấn đề | Mức độ | Khía cạnh | Vị trí trong code |
|---|--------|--------|-----------|-------------------|
| 1 | Thiếu tính năng "Ảnh bìa" (Cover Photo), khiến trang cá nhân trông trống trải và thiếu sức sống. | 🟠 Cao | Visual Design | `src/features/profile/pages/Profile.js` |
| 2 | Hiển thị Email cá nhân trực tiếp dưới tên người dùng, có thể dẫn đến rò rỉ thông tin hoặc bị spam. | 🟠 Cao | Security/UX | `src/features/profile/components/ProfileHeader.js:38` |
| 3 | Các chỉ số Followers/Following/Posts hiển thị tách rời trong sidebar, không gây ấn tượng về mức độ uy tín của người dùng. | 🟡 Trung bình | UX/Visual | `src/features/profile/components/ProfileSidebar.js:28-43` |
| 4 | Logic Infinite Scroll sử dụng sự kiện cuộn (window scroll) và throttle thủ công, không tối ưu bằng `Intersection Observer`. | 🟡 Trung bình | Performance | `src/features/profile/pages/Profile.js:56-72` |
| 5 | Nút chỉnh sửa ảnh đại diện (avatar) nằm đè lên ảnh nhưng thiếu `aria-label`, gây khó khăn cho người dùng khiếm thị. | 🟡 Trung bình | Accessibility | `src/features/profile/components/ProfileHeader.js:25` |
| 6 | Sự phụ thuộc vào file CSS riêng (`profile.css`) cho các animation đơn giản có thể thay thế bằng class Tailwind để giảm bundle size. | ⚪ Thấp | Code Quality | `src/features/profile/styles/profile.css` |

## Giải thích mức độ
- 🔴 **Nghiêm trọng (Critical)**: Vấn đề cần sửa ngay để đảm bảo chức năng hoặc bảo mật.
- 🟠 **Cao (High)**: Ảnh hưởng lớn đến trải nghiệm và cảm quan của người dùng.
- 🟡 **Trung bình (Medium)**: Các điểm trừ nhỏ về kỹ thuật hoặc giao diện.
- ⚪ **Thấp (Low)**: Gợi ý để mã nguồn sạch và tối ưu hơn.

## Các bước tiếp theo
1.  **Nâng cấp Header**: Thêm khu vực ảnh bìa và sắp xếp lại vị trí Avatar để tăng tính thẩm mỹ.
2.  **Tăng cường Bảo mật**: Ẩn Email mặc định và chỉ hiển thị khi có sự cho phép hoặc yêu cầu cụ thể.
3.  **Refactor Sidebar**: Gộp các chỉ số hoạt động vào một khu vực trực quan hơn, kèm theo Badge uy tín rõ ràng hơn.
4.  **Tối ưu hóa Code**: Chuyển đổi logic cuộn sang `Intersection Observer` và đồng bộ animation với Tailwind.