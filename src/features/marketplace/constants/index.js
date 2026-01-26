export const MARKETPLACE_CONSTANTS = {
  PRODUCTS_PER_PAGE: 12,
  
  // UI Constants
  COLORS: {
    PRIMARY: '#52c41a',
    PRICE: '#ee4d2d',
    SECONDARY: '#757575',
    BORDER: '#f0f0f0',
    BACKGROUND: '#f8f8f8'
  },
  
  // Layout Constants
  CARD: {
    HEIGHT: 160,
    BORDER_RADIUS: 8,
    PADDING: 12
  },
  
  // Modal Constants
  MODAL: {
    WIDTH: 600,
    IMAGE_HEIGHT: 300,
    BUTTON_HEIGHT: 48,
    Z_INDEX: 1000
  },
  
  // Text Constants
  MESSAGES: {
    SUCCESS: {
      PRODUCT_POSTED: 'Đăng sản phẩm thành công!',
      TITLE: 'Thành công'
    },
    ERROR: {
      TITLE: 'Lỗi',
      PREFIX: 'Có lỗi xảy ra: '
    },
    LOGIN: {
      TITLE: 'Đăng nhập để sử dụng chợ',
      MESSAGE: 'Đăng nhập để đăng sản phẩm và liên hệ với người bán',
      FEATURE: 'mua bán nông sản trực tuyến'
    },
    BUTTONS: {
      POST_PRODUCT: 'Đăng sản phẩm',
      CONTACT_SELLER: 'Liên hệ người bán',
      LOGIN_TO_CONTACT: 'Đăng nhập để liên hệ',
      CALL: 'Gọi',
      LOGIN: 'Đăng nhập'
    },
    LABELS: {
      MARKETPLACE_TITLE: 'Chợ nông sản',
      QUANTITY: 'Số lượng: ',
      SELLER: 'Người bán: ',
      PHONE: 'Điện thoại: ',
      ADDRESS: 'Địa chỉ: ',
      DESCRIPTION: 'Mô tả sản phẩm',
      CONTACT: 'Liên hệ',
      NEW_LISTING: 'Mới đăng',
      SOLD_COUNT: 'Đã bán',
      LOGIN_TO_VIEW: '(Đăng nhập để xem)',
      DEFAULT_LOCATION: 'Việt Nam',
      DEFAULT_UNIT: 'kg',
      CATEGORY: 'Danh mục',
      CONDITION: 'Tình trạng',
      REGION: 'Khu vực',
      ALL_CATEGORIES: 'Tất cả danh mục',
      ALL_CONDITIONS: 'Tất cả tình trạng'
    }
  },
  
  // User Roles
  USER_ROLES: {
    FARMER: 'farmer',
    BUYER: 'buyer'
  },
  
  // Transaction Types
  TRANSACTION_TYPES: {
    B2B: 'b2b',
    B2C: 'b2c'
  },
  
  TRUST_SCORES: {
    DIAMOND: { value: 'diamond', label: 'Kim cương', icon: '💎' },
    GOLD: { value: 'gold', label: 'Vàng', icon: '🥇' },
    VERIFIED: { value: 'verified', label: 'Xác thực', icon: '✅' },
    DEFAULT: { value: 'default', label: 'Thành viên', icon: '⭐' }
  },
  
  PRODUCT_CATEGORIES: [
    'Rau củ quả',
    'Trái cây',
    'Ngũ cốc',
    'Thịt gia súc',
    'Thủy sản',
    'Gia vị',
    'Khác'
  ],
  
  PRODUCT_CONDITIONS: [
    'Mới',
    'Như mới',
    'Tốt',
    'Khá tốt'
  ]
};