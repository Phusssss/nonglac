import { theme } from 'antd';

// Agricultural-focused color palette
export const nongLacColors = {
  // Primary Palette - Xanh nông nghiệp
  primary: {
    50: '#F6FFED',
    100: '#D9F7BE', 
    200: '#B7EB8F',
    300: '#95DE64',
    400: '#73D13D',
    500: '#52C41A',  // Main brand color
    600: '#389E0D',
    700: '#237804',
    800: '#135200',
    900: '#092B00',
  },
  
  // Functional Colors
  success: '#73D13D',    // Thành công
  warning: '#FAAD14',    // Cảnh báo giá
  error: '#FF4D4F',      // Lỗi
  info: '#1890FF',       // Thông tin
  
  // Agricultural Context Colors
  harvest: '#FAAD14',    // Màu vàng lúa
  soil: '#8B4513',       // Màu đất
  water: '#1890FF',      // Màu nước
  sun: '#FFA940',        // Màu nắng
  
  // Price Trend Colors
  priceUp: '#52C41A',    // Giá tăng
  priceDown: '#FF4D4F',  // Giá giảm
  priceStable: '#8C8C8C', // Giá ổn định
  
  // Category Colors
  vegetables: '#52C41A',  // Rau củ
  fruits: '#FA8C16',     // Trái cây
  grains: '#FAAD14',     // Ngũ cốc
  livestock: '#722ED1',  // Chăn nuôi
  aquaculture: '#13C2C2', // Thủy sản
};

// Enhanced Ant Design theme for NôngLạc
export const nongLacTheme = {
  token: {
    // Brand Colors - Nông nghiệp
    colorPrimary: '#52C41A',        // Xanh lá chính (nông nghiệp)
    colorSuccess: '#73D13D',        // Xanh lá nhạt (thành công)
    colorWarning: '#FAAD14',        // Vàng (cảnh báo giá)
    colorError: '#FF4D4F',          // Đỏ (lỗi)
    colorInfo: '#1890FF',           // Xanh dương (thông tin)
    
    // Background Colors
    colorBgLayout: '#F6FFED',       // Nền xanh nhạt
    colorBgContainer: '#FFFFFF',    // Nền container
    colorBgElevated: '#FFFFFF',     // Nền nổi
    
    // Text Colors
    colorText: '#262626',           // Text chính
    colorTextSecondary: '#595959',  // Text phụ
    colorTextTertiary: '#8C8C8C',   // Text mờ
    
    // Border & Radius
    borderRadius: 8,                // Bo góc nhẹ
    borderRadiusLG: 12,            // Bo góc lớn
    borderRadiusSM: 6,             // Bo góc nhỏ
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    // Typography
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    
    // Shadows - Nhẹ nhàng, tự nhiên
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  
  components: {
    // Button customization
    Button: {
      colorPrimary: '#52C41A',
      algorithm: true,
      borderRadius: 8,
      controlHeight: 40,
      paddingContentHorizontal: 24,
      fontWeight: 500,
    },
    
    // Card customization - Phong cách nông nghiệp
    Card: {
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(82, 196, 26, 0.08)',
      headerBg: '#F6FFED',
      colorBorderSecondary: '#D9F7BE',
      paddingLG: 24,
    },
    
    // Form customization
    Form: {
      itemMarginBottom: 20,
      labelColor: '#262626',
      labelFontWeight: 500,
      labelFontSize: 14,
    },
    
    // Input customization
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 16,
      colorBorder: '#D9D9D9',
      colorBorderHover: '#52C41A',
      colorPrimaryHover: '#73D13D',
      fontSize: 14,
    },
    
    // Table customization
    Table: {
      borderRadius: 8,
      colorBorderSecondary: '#F0F0F0',
      headerBg: '#FAFAFA',
      headerColor: '#262626',
      headerSortActiveBg: '#F6FFED',
      rowHoverBg: '#F6FFED',
    },
    
    // Tag customization - Màu nông nghiệp
    Tag: {
      borderRadius: 16,
      fontSizeSM: 12,
      lineHeightSM: 1.5,
      paddingInline: 12,
    },
    
    // Modal customization
    Modal: {
      borderRadius: 12,
      headerBg: '#FFFFFF',
      contentBg: '#FFFFFF',
      paddingLG: 24,
    },
    
    // Menu customization
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#F6FFED',
      itemSelectedColor: '#52C41A',
      itemHoverBg: '#F6FFED',
      itemHoverColor: '#52C41A',
      borderRadius: 8,
    },
    
    // Layout customization
    Layout: {
      bodyBg: '#F6FFED',
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',
    },
    
    // Typography customization
    Typography: {
      titleMarginBottom: 16,
      titleMarginTop: 0,
    },
  },
  
  // Algorithm để tự động tạo màu
  algorithm: theme.defaultAlgorithm,
};

export default nongLacTheme;