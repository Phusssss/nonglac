import { MARKETPLACE_CONSTANTS } from '../constants';

export const marketplaceService = {
  formatPrice: (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  },

  formatDate: (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('vi-VN');
  },

  getTrustScoreIcon: (score) => {
    const trustScore = Object.values(MARKETPLACE_CONSTANTS.TRUST_SCORES)
      .find(ts => ts.value === score);
    return trustScore ? trustScore.icon : MARKETPLACE_CONSTANTS.TRUST_SCORES.DEFAULT.icon;
  },

  getTrustScoreLabel: (score) => {
    const trustScore = Object.values(MARKETPLACE_CONSTANTS.TRUST_SCORES)
      .find(ts => ts.value === score);
    return trustScore ? trustScore.label : MARKETPLACE_CONSTANTS.TRUST_SCORES.DEFAULT.label;
  },

  validateProduct: (productData) => {
    const errors = {};
    
    if (!productData.name?.trim()) {
      errors.name = 'Tên sản phẩm là bắt buộc';
    }
    
    if (!productData.price || productData.price <= 0) {
      errors.price = 'Giá phải lớn hơn 0';
    }
    
    if (!productData.category) {
      errors.category = 'Danh mục là bắt buộc';
    }
    
    if (!productData.description?.trim()) {
      errors.description = 'Mô tả sản phẩm là bắt buộc';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};