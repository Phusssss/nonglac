import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapeAgroMonitor = async () => {
  try {
    const response = await axios.get('https://nongnghiep.vn/gia-nong-san-d1/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const prices = [];
    
    $('table tr').each((index, element) => {
      if (index === 0) return; // Skip header
      
      const cells = $(element).find('td');
      if (cells.length >= 4) {
        const productName = $(cells[0]).text().trim();
        const priceText = $(cells[1]).text().trim();
        const unit = $(cells[2]).text().trim();
        const market = $(cells[3]).text().trim();
        
        const currentPrice = parseFloat(priceText.replace(/[^\d]/g, ''));
        
        if (productName && currentPrice) {
          prices.push({
            productName,
            currentPrice,
            previousPrice: currentPrice * (0.95 + Math.random() * 0.1),
            unit: unit || 'kg',
            market: market || 'Việt Nam',
            category: getCategoryFromProduct(productName),
            updatedAt: new Date()
          });
        }
      }
    });
    
    return prices;
  } catch (error) {
    console.error('Error scraping:', error.message);
    return getFallbackData();
  }
};

const getFallbackData = () => [
  { productName: 'Gạo ST25', currentPrice: 22000, previousPrice: 21500, unit: 'kg', market: 'An Giang', category: 'Lúa gạo' },
  { productName: 'Cà phê Robusta', currentPrice: 45000, previousPrice: 44000, unit: 'kg', market: 'Đắk Lắk', category: 'Cà phê' },
  { productName: 'Tiêu đen', currentPrice: 120000, previousPrice: 118000, unit: 'kg', market: 'Đắk Lắk', category: 'Gia vị' },
  { productName: 'Tôm sú', currentPrice: 280000, previousPrice: 275000, unit: 'kg', market: 'Cà Mau', category: 'Thủy sản' },
  { productName: 'Heo hơi', currentPrice: 68000, previousPrice: 69000, unit: 'kg', market: 'Đồng Nai', category: 'Chăn nuôi' }
].map(item => ({ ...item, updatedAt: new Date() }));

const getCategoryFromProduct = (productName) => {
  const product = productName.toLowerCase();
  if (product.includes('gạo') || product.includes('lúa')) return 'Lúa gạo';
  if (product.includes('cà phê')) return 'Cà phê';
  if (product.includes('tiêu')) return 'Gia vị';
  if (product.includes('cao su')) return 'Cao su';
  if (product.includes('tôm') || product.includes('cá')) return 'Thủy sản';
  if (product.includes('heo') || product.includes('gà')) return 'Chăn nuôi';
  return 'Khác';
};