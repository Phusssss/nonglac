# 🎨 HƯỚNG DẪN SỬ DỤNG DESIGN SYSTEM NÔNG LẠC

## 📋 Tổng quan

Design System NôngLạc được xây dựng dựa trên Ant Design với theme tùy chỉnh phù hợp với lĩnh vực nông nghiệp. Hệ thống này đảm bảo tính nhất quán trong thiết kế và trải nghiệm người dùng.

## 🚀 Bắt đầu nhanh

### 1. Import theme và components

```javascript
// Import theme
import { nongLacTheme } from './theme/nongLacTheme';

// Import components
import { NongLacCard, PriceDisplay, CategoryTag } from './components/common';

// Sử dụng trong App.js
<ConfigProvider theme={nongLacTheme}>
  {/* Your app content */}
</ConfigProvider>
```

### 2. Sử dụng components cơ bản

```javascript
// NongLacCard - Card component tùy chỉnh
<NongLacCard
  title="Cà chua cherry"
  subtitle="Đà Lạt, Lâm Đồng"
  category="vegetables"
  content={<PriceDisplay currentPrice={85000} previousPrice={80000} />}
  actions={[
    <Button key="view">Xem chi tiết</Button>,
    <Button key="like" type="text">Yêu thích</Button>
  ]}
/>

// PriceDisplay - Hiển thị giá với xu hướng
<PriceDisplay
  currentPrice={85000}
  previousPrice={80000}
  unit="VNĐ/kg"
  size="large"
  showChange={true}
/>

// CategoryTag - Tag danh mục nông sản
<CategoryTag category="vegetables" size="default" />
```

## 🎨 Color Palette

### Primary Colors (Nông nghiệp)
- **Primary**: `#52C41A` - Xanh lá chính
- **Success**: `#73D13D` - Thành công
- **Warning**: `#FAAD14` - Cảnh báo
- **Error**: `#FF4D4F` - Lỗi
- **Info**: `#1890FF` - Thông tin

### Category Colors
- **Vegetables**: `#52C41A` - Rau củ
- **Fruits**: `#FA8C16` - Trái cây  
- **Grains**: `#FAAD14` - Ngũ cốc
- **Livestock**: `#722ED1` - Chăn nuôi
- **Aquaculture**: `#13C2C2` - Thủy sản

### Price Trend Colors
- **Price Up**: `#52C41A` - Giá tăng
- **Price Down**: `#FF4D4F` - Giá giảm
- **Price Stable**: `#8C8C8C` - Giá ổn định

## 📦 Components Library

### 1. NongLacCard

Card component chính với theme nông nghiệp.

**Props:**
- `title` (string): Tiêu đề card
- `subtitle` (string): Phụ đề
- `category` (string): Danh mục (vegetables, fruits, grains, livestock, aquaculture)
- `content` (ReactNode): Nội dung card
- `actions` (array): Các action buttons
- `extra` (ReactNode): Nội dung bổ sung ở header
- `hoverable` (boolean): Hiệu ứng hover
- `loading` (boolean): Trạng thái loading

**Ví dụ:**
```javascript
<NongLacCard
  title="Sản phẩm nông nghiệp"
  subtitle="Mô tả ngắn"
  category="vegetables"
  content={<div>Nội dung</div>}
  actions={[<Button>Action</Button>]}
  hoverable={true}
/>
```

### 2. PriceDisplay

Component hiển thị giá với xu hướng tăng/giảm.

**Props:**
- `currentPrice` (number): Giá hiện tại
- `previousPrice` (number): Giá trước đó
- `unit` (string): Đơn vị (mặc định: "VNĐ/kg")
- `size` (string): Kích thước ("small", "default", "large")
- `showChange` (boolean): Hiển thị thay đổi
- `showPercentage` (boolean): Hiển thị phần trăm
- `prefix` (string): Tiền tố
- `suffix` (string): Hậu tố

**Ví dụ:**
```javascript
<PriceDisplay
  currentPrice={85000}
  previousPrice={80000}
  unit="VNĐ/kg"
  size="large"
  showChange={true}
  showPercentage={true}
/>
```

### 3. CategoryTag

Tag hiển thị danh mục nông sản với icon và màu sắc phù hợp.

**Props:**
- `category` (string): Danh mục
- `size` (string): Kích thước ("small", "default", "large")
- `showIcon` (boolean): Hiển thị icon
- `showLabel` (boolean): Hiển thị label
- `style` (object): Custom style

**Ví dụ:**
```javascript
<CategoryTag category="vegetables" size="default" />
<CategoryTag category="fruits" showIcon={false} />
<CategoryTag category="grains" size="large" />
```

## 🎯 Best Practices

### 1. Sử dụng màu sắc nhất quán
```javascript
// Tốt - Sử dụng màu từ theme
import { nongLacColors } from './theme/nongLacTheme';
style={{ color: nongLacColors.primary[500] }}

// Tránh - Hard-code màu
style={{ color: '#52C41A' }}
```

### 2. Responsive Design
```javascript
// Sử dụng Grid system của Ant Design
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8} lg={6}>
    <NongLacCard />
  </Col>
</Row>
```

### 3. Consistent Spacing
```javascript
// Sử dụng Space component
<Space direction="vertical" size={16}>
  <Component1 />
  <Component2 />
</Space>
```

### 4. Loading States
```javascript
<NongLacCard loading={isLoading} />
<PriceDisplay currentPrice={price} loading={isLoading} />
```

## 📱 Responsive Guidelines

### Breakpoints
- **xs**: < 576px (Mobile)
- **sm**: ≥ 576px (Small tablet)
- **md**: ≥ 768px (Tablet)
- **lg**: ≥ 992px (Desktop)
- **xl**: ≥ 1200px (Large desktop)
- **xxl**: ≥ 1600px (Extra large)

### Component Sizes
```javascript
// Mobile
<CategoryTag size="small" />
<PriceDisplay size="small" />

// Tablet
<CategoryTag size="default" />
<PriceDisplay size="default" />

// Desktop
<CategoryTag size="large" />
<PriceDisplay size="large" />
```

## 🔧 Customization

### 1. Extend Theme
```javascript
import { nongLacTheme } from './theme/nongLacTheme';

const customTheme = {
  ...nongLacTheme,
  token: {
    ...nongLacTheme.token,
    colorPrimary: '#your-color', // Override primary color
  }
};
```

### 2. Custom Components
```javascript
// Extend existing components
const CustomCard = ({ children, ...props }) => (
  <NongLacCard
    {...props}
    style={{
      ...props.style,
      // Your custom styles
    }}
  >
    {children}
  </NongLacCard>
);
```

## 📊 Performance Tips

### 1. Lazy Loading
```javascript
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Spin />}>
  <LazyComponent />
</Suspense>
```

### 2. Memoization
```javascript
const MemoizedCard = React.memo(({ product }) => (
  <NongLacCard
    title={product.name}
    content={<PriceDisplay {...product.price} />}
  />
));
```

## 🧪 Testing

### Component Testing
```javascript
import { render, screen } from '@testing-library/react';
import { NongLacCard } from './components/common';

test('renders NongLacCard with title', () => {
  render(<NongLacCard title="Test Title" />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
});
```

## 📚 Resources

### Demo Page
Truy cập `/design-demo` để xem showcase đầy đủ các components.

### Documentation
- [Ant Design Documentation](https://ant.design/)
- [Design Tokens](./src/theme/nongLacTheme.js)
- [Component Library](./src/components/common/)

### Support
- GitHub Issues: [Link to issues]
- Design System Team: design@nonglac.com

---

**Cập nhật lần cuối:** 11/01/2026
**Version:** 1.0.0