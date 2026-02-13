# Hướng dẫn Hệ thống Chọn Danh hiệu Chuyên môn

## Tổng quan

Khi người dùng đạt 500 điểm AgriTrust-Score, họ sẽ được chọn 1 trong 3 danh hiệu chuyên môn:
- 🌾 **Người sản xuất** - Nhà sản xuất nông sản uy tín
- 🚚 **Nhà cung cấp** - Nhà cung cấp vật tư nông nghiệp  
- 🏪 **Vựa/Buôn bán** - Thương lái, vựa thu mua

## Quy tắc

1. **Chỉ được chọn 1 lần duy nhất** - Người dùng không thể thay đổi sau khi đã chọn
2. **Bắt buộc phải chọn** - Modal không thể đóng cho đến khi chọn xong
3. **Tự động hiển thị** - Modal tự động hiển thị khi đạt 500 điểm và chưa chọn

## Cách hoạt động

### 1. Khi đạt 500 điểm

Hệ thống sẽ:
- Kiểm tra xem user đã chọn badge chuyên môn chưa
- Nếu chưa chọn → Hiển thị `BadgeSelectionModal`
- Modal không thể đóng (closable=false, maskClosable=false)

### 2. Khi chọn badge

```javascript
// User chọn badge
handleSelectBadge(badgeId) {
  // Gọi API
  missionsService.selectProfessionBadge(userId, badgeId)
  
  // Lưu vào Firestore
  userMissions/{userId} {
    unlockedBadges: [..., badgeId],
    selectedProfessionBadge: badgeId
  }
}
```

### 3. Logic kiểm tra

```javascript
// Trong constants/index.js
BADGES: {
  PRODUCER: {
    requiresSelection: true,  // Yêu cầu chọn
    selectionGroup: 'profession',  // Nhóm chọn
    autoUnlock: false  // Không tự động mở khóa
  }
}

// Trong services/index.js
checkUnlockedBadges(score, currentBadges) {
  // Chỉ auto-unlock badge có autoUnlock = true
  // Badge có requiresSelection = true phải chọn thủ công
}

canSelectProfessionBadge(score, currentBadges) {
  // Kiểm tra đủ 500 điểm
  // Kiểm tra chưa chọn badge nào trong nhóm profession
}
```

## Components

### BadgeSelectionModal
- Hiển thị 3 badge để chọn
- Highlight badge được chọn
- Nút "Xác nhận lựa chọn" chỉ active khi đã chọn
- Không thể đóng modal

### BadgeCard
- Hiển thị trạng thái "Có thể chọn" cho badge đủ điểm nhưng chưa unlock
- Màu vàng (#fffbe6) cho badge có thể chọn
- Màu xanh (#f6ffed) cho badge đã unlock

## Firestore Structure

```javascript
userMissions/{userId} {
  score: 500,
  unlockedBadges: ['VERIFIED', 'PRODUCER'],  // Chỉ có 1 trong 3
  selectedProfessionBadge: 'PRODUCER',  // Badge đã chọn
  missions: [...],
  lastUpdated: timestamp
}
```

## Firestore Rules

```javascript
match /userMissions/{userId} {
  allow update: if isOwner(userId) && 
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['missions', 'score', 'unlockedBadges', 
                'selectedProfessionBadge', ...]);
}
```

## Testing

### Test Case 1: Đạt 500 điểm lần đầu
1. User hoàn thành nhiệm vụ → đạt 500 điểm
2. Modal tự động hiển thị
3. User chọn 1 trong 3 badge
4. Xác nhận → Badge được lưu vào Firestore
5. Modal đóng, hiển thị notification thành công

### Test Case 2: Đã chọn badge rồi
1. User đã có selectedProfessionBadge
2. Modal không hiển thị
3. Badge hiển thị trạng thái "Đã đạt" trong tab Badges

### Test Case 3: Reload trang
1. User đã chọn badge
2. Reload trang
3. Modal không hiển thị lại
4. Badge vẫn giữ nguyên trạng thái

## Files Changed

1. `src/features/missions/constants/index.js` - Thêm requiresSelection, selectionGroup, autoUnlock
2. `src/features/missions/services/index.js` - Thêm canSelectProfessionBadge, selectProfessionBadge
3. `src/features/missions/components/BadgeSelectionModal.js` - Component mới
4. `src/features/missions/components/BadgeCard.js` - Thêm logic hiển thị "Có thể chọn"
5. `src/features/missions/pages/MissionsPage.js` - Thêm logic hiển thị modal
6. `firestore.rules` - Thêm rules cho userMissions collection

## Future Enhancements

1. Cho phép thay đổi badge (với phí hoặc điều kiện đặc biệt)
2. Thêm badge animation khi chọn
3. Hiển thị badge trên profile và posts
4. Badge-specific features (ví dụ: Người sản xuất có thể đăng sản phẩm organic)
