import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export const priceService = {
  // Chạy batch job để cập nhật giá
  async fetchPricesFromAPI() {
    try {
      // Gọi batch job
      await fetch('http://localhost:3001/api/batch/run', {
        method: 'POST'
      });
      
      // Đợi 3 giây rồi lấy dữ liệu mới
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await fetch('http://localhost:3001/api/prices');
      const result = await response.json();
      
      return result.data || [];
    } catch (error) {
      console.error('Lỗi khi chạy batch job:', error);
      return [];
    }
  },

  // Cập nhật giá vào Firestore
  async updatePrices(pricesData) {
    try {
      const pricesRef = collection(db, 'prices');
      
      for (const price of pricesData) {
        await addDoc(pricesRef, {
          productName: price.productName,
          currentPrice: price.currentPrice,
          previousPrice: price.previousPrice,
          unit: price.unit,
          market: price.market,
          category: price.category,
          change: price.change,
          date: price.date,
          updatedAt: new Date(),
          source: 'nhabeagri'
        });
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật giá:', error);
      return false;
    }
  },







  // Lấy giá từ database
  async getPrices(productName = null, limitCount = 50) {
    try {
      const pricesRef = collection(db, 'prices');
      let q = query(pricesRef, orderBy('updatedAt', 'desc'), limit(limitCount));
      
      if (productName) {
        q = query(pricesRef, where('productName', '==', productName), orderBy('updatedAt', 'desc'), limit(limitCount));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Lỗi khi lấy giá:', error);
      return [];
    }
  },

  // Phân loại sản phẩm
  getCategoryByProduct(productName) {
    const name = productName.toLowerCase();
    if (name.includes('gạo') || name.includes('lúa')) return 'Lúa gạo';
    if (name.includes('cà phê')) return 'Cà phê';
    if (name.includes('tiêu') || name.includes('gia vị')) return 'Gia vị';
    if (name.includes('cao su')) return 'Cao su';
    if (name.includes('tôm') || name.includes('cá')) return 'Thủy sản';
    if (name.includes('cacao') || name.includes('cotton') || name.includes('gỗ')) return 'Khác';
    if (name.includes('đường') || name.includes('ngô') || name.includes('đậu nành')) return 'Nông sản khác';
    return 'Nông sản khác';
  }
};

// Export các function riêng lẻ để tương thích
export const fetchLatestPrices = priceService.getPrices;
export const refreshPrices = priceService.fetchPricesFromAPI;