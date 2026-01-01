class FilterService {
  constructor() {
    this.filters = {};
    this.listeners = [];
  }

  // Áp dụng bộ lọc thông minh theo ngữ cảnh
  applyContextualFilters(products, userRole, transactionIntent, filters) {
    let filtered = [...products];

    // Lọc theo vai trò người dùng
    if (userRole === 'trader' || userRole === 'wholesaler') {
      // Ưu tiên hiển thị hàng có sẵn với số lượng lớn
      filtered = filtered.filter(product => 
        product.stock_status === 'in_stock' || product.capacity === 'volume'
      );
    }

    // Lọc theo mục đích giao dịch
    if (transactionIntent === 'b2b') {
      // Ưu tiên quy cách đóng gói lớn, giá sỉ
      filtered = filtered.filter(product => 
        product.packaging === 'bulk' || product.packaging === 'carton'
      );
    } else if (transactionIntent === 'gifting') {
      // Lọc sản phẩm có ngoại quan đẹp, size VIP
      filtered = filtered.filter(product => 
        product.packaging === 'giftbox' || 
        product.stem_length === 'vip' ||
        product.cherry_size === '32+' ||
        product.trust_score === 'diamond'
      );
    } else if (transactionIntent === 'processing') {
      // Lọc hàng "xấu mã" nhưng chất lượng tốt để tối ưu chi phí
      filtered = filtered.filter(product => 
        product.grade === 'processing' || 
        product.price < this.getAveragePrice(products, product.category)
      );
    }

    // Áp dụng các bộ lọc cụ thể
    Object.entries(filters).forEach(([category, values]) => {
      if (values && values.length > 0) {
        filtered = filtered.filter(product => {
          return values.some(value => product[category] === value);
        });
      }
    });

    return this.sortByRelevance(filtered, userRole, transactionIntent);
  }

  // Sắp xếp theo độ liên quan
  sortByRelevance(products, userRole, transactionIntent) {
    return products.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Điểm uy tín
      const trustScores = { diamond: 3, gold: 2, verified: 1 };
      scoreA += trustScores[a.trust_score] || 0;
      scoreB += trustScores[b.trust_score] || 0;

      // Điểm theo mục đích giao dịch
      if (transactionIntent === 'gifting') {
        if (a.packaging === 'giftbox') scoreA += 2;
        if (b.packaging === 'giftbox') scoreB += 2;
        if (a.stem_length === 'vip') scoreA += 1;
        if (b.stem_length === 'vip') scoreB += 1;
      }

      // Điểm theo vai trò
      if (userRole === 'trader') {
        if (a.capacity === 'volume') scoreA += 2;
        if (b.capacity === 'volume') scoreB += 2;
      }

      return scoreB - scoreA;
    });
  }

  // Tính giá trung bình theo danh mục
  getAveragePrice(products, category) {
    const categoryProducts = products.filter(p => p.category === category);
    if (categoryProducts.length === 0) return 0;
    
    const totalPrice = categoryProducts.reduce((sum, p) => sum + p.price, 0);
    return totalPrice / categoryProducts.length;
  }

  // Lấy gợi ý bộ lọc thông minh
  getSmartFilterSuggestions(userRole, transactionIntent, currentFilters = {}) {
    const suggestions = [];

    if (transactionIntent === 'gifting' && !currentFilters.packaging) {
      suggestions.push({
        category: 'packaging',
        value: 'giftbox',
        reason: 'Phù hợp cho mục đích làm quà'
      });
    }

    if (userRole === 'trader' && !currentFilters.capacity) {
      suggestions.push({
        category: 'capacity',
        value: 'volume',
        reason: 'Phù hợp cho thương lái cần số lượng lớn'
      });
    }

    if (transactionIntent === 'b2b' && !currentFilters.packaging) {
      suggestions.push({
        category: 'packaging',
        value: 'bulk',
        reason: 'Tối ưu chi phí cho giao dịch B2B'
      });
    }

    return suggestions;
  }

  // Phân tích xu hướng tìm kiếm
  analyzeSearchTrends(searchHistory) {
    const trends = {};
    
    searchHistory.forEach(search => {
      Object.entries(search.filters).forEach(([category, values]) => {
        if (!trends[category]) trends[category] = {};
        values.forEach(value => {
          trends[category][value] = (trends[category][value] || 0) + 1;
        });
      });
    });

    return trends;
  }

  // Lưu bộ lọc
  saveFilters(filters) {
    this.filters = filters;
    this.notifyListeners();
  }

  // Xóa tất cả bộ lọc
  clearFilters() {
    this.filters = {};
    this.notifyListeners();
  }

  // Đăng ký listener
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Hủy đăng ký listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Thông báo cho các listener
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.filters));
  }

  // Xuất bộ lọc thành URL params
  filtersToUrlParams(filters) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([category, values]) => {
      if (values && values.length > 0) {
        params.set(category, values.join(','));
      }
    });

    return params.toString();
  }

  // Nhập bộ lọc từ URL params
  filtersFromUrlParams(urlParams) {
    const filters = {};
    const params = new URLSearchParams(urlParams);

    for (const [category, value] of params) {
      filters[category] = value.split(',');
    }

    return filters;
  }
}

export default new FilterService();