# Kết quả Review Thiết kế: Trang chủ (Home Page)

**Ngày thực hiện**: 07/02/2026
**Đường dẫn**: `/`
**Các khía cạnh tập trung**: Visual Design, UX/Usability, Responsive/Mobile, Accessibility

## Tóm tắt
Trang chủ NôngLạc có giao diện hiện đại, sạch sẽ và mang đậm bản sắc nông nghiệp với tông màu xanh lá đặc trưng. Các tính năng cốt lõi như Bảng tin (Feed), Giá nông sản và Thời tiết được bố trí hợp lý. Tuy nhiên, vẫn còn một số vấn đề về độ tương phản, tính nhất quán của font chữ và trải nghiệm tìm kiếm trên di động cần được tối ưu hóa.

## Danh sách các vấn đề

| # | Vấn đề | Mức độ | Khía cạnh | Vị trí trong code |
|---|--------|--------|-----------|-------------------|
| 1 | Banner Beta dùng màu gradient đỏ (`#ff4d4f`) gây cảm giác "Cảnh báo lỗi/Nguy hiểm" thay vì trạng thái thử nghiệm. | 🔴 Nghiêm trọng | Visual Design | `src/index.css:15` |
| 2 | Sự không nhất quán về font chữ giữa CSS (`Be Vietnam Pro`, `Montserrat`) và cấu hình JS (`Inter`). | 🟠 Cao | Visual Design | `src/styles/theme.css:23,30` & `src/theme/nongLacTheme.js:76` |
| 3 | Thanh tìm kiếm (Search) trên mobile bị ẩn trong header, không thuận tiện khi người dùng muốn tìm nhanh thông tin giá cả. | 🟠 Cao | UX/Responsive | `src/components/ResponsiveNavbar.js:104-127` |
| 4 | Các icon trong menu điều hướng thiếu nhãn ARIA (aria-label), gây khó khăn cho người dùng sử dụng trình đọc màn hình. | 🟠 Cao | Accessibility | `src/components/ResponsiveNavbar.js:130-193` |
| 5 | Banner Beta có hiệu ứng animation "pulse" liên tục có thể gây xao nhãng và khó chịu cho một số nhóm người dùng. | 🟡 Trung bình | UX/Accessibility | `src/index.css:27` |
| 6 | Khoảng cách (spacing) chưa nhất quán: Code dùng gutter 24px nhưng theme quy định padding 16px. | 🟡 Trung bình | Visual Design | `src/features/home/components/HomePage.js:223` |
| 7 | Nút AI trên Mobile (floating button) chiếm vị trí trung tâm nhưng đôi khi che khuất nội dung quan trọng khi cuộn. | ⚪ Thấp | UX/Usability | `src/components/ResponsiveNavbar.js:282-289` |

## Giải thích mức độ
- 🔴 **Nghiêm trọng (Critical)**: Vi phạm tiêu chuẩn hoặc gây hiểu lầm lớn về chức năng.
- 🟠 **Cao (High)**: Ảnh hưởng đáng kể đến trải nghiệm người dùng hoặc chất lượng thiết kế.
- 🟡 **Trung bình (Medium)**: Vấn đề dễ nhận thấy, cần được tinh chỉnh.
- ⚪ **Thấp (Low)**: Gợi ý cải thiện để giao diện hoàn thiện hơn.

## Các bước tiếp theo
1.  **Ưu tiên 1**: Thay đổi màu sắc của Beta Banner sang tông xanh dương hoặc vàng nhạt để giảm bớt sự "báo động".
2.  **Ưu tiên 2**: Thống nhất sử dụng một bộ font chữ duy nhất (đề xuất: Be Vietnam Pro vì hỗ trợ tiếng Việt tốt hơn).
3.  **Ưu tiên 3**: Thêm `aria-label` cho tất cả các nút icon trong Navbar.
4.  **Tham khảo**: Xem file wireframe đề xuất để thấy cách bố trí lại thanh tìm kiếm và các phím tắt AI.