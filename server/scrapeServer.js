import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';

const app = express();
app.use(cors());
app.use(express.json());

// Scrape NhaBeAgri
app.post('/api/scrape/nhabeagri', async (req, res) => {
  try {
    const response = await axios.get('https://nhabeagri.com/gia-nong-san/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const prices = [];
    
    // Chỉ lấy bảng đầu tiên (bảng tổng hợp)
    const firstTable = $('table').first();
    
    firstTable.find('tr').each((i, element) => {
      if (i === 0) return; // Skip header
      
      const cells = $(element).find('td');
      if (cells.length >= 9) {
        const name = $(cells[0]).text().trim();
        const unit = $(cells[1]).text().trim();
        const closePrice = $(cells[5]).text().trim(); // Cột 'Đóng cửa'
        const change = $(cells[6]).text().trim();
        const date = $(cells[8]).text().trim();
        
        if (name && closePrice && name !== 'Tên nông sản' && !name.includes('đ')) {
          // Parse giá đóng cửa
          const priceText = closePrice.replace(/[^\d.,]/g, '');
          const price = parseFloat(priceText.replace(/,/g, ''));
          
          if (price > 0 && name.length > 2) {
            prices.push({
              name: name,
              price: Math.round(price),
              unit: unit.replace('đ/', '').trim(),
              market: 'NhaBeAgri',
              change: change,
              date: date,
              source: 'nhabeagri'
            });
          }
        }
      }
    });
    
    console.log(`Scraped ${prices.length} products from NhaBeAgri`);
    res.json(prices);
    
  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  }
});

// Scrape VnExpress
app.post('/api/scrape/vnexpress', async (req, res) => {
  try {
    const response = await axios.get('https://vnexpress.net/kinh-doanh/nong-nghiep');
    const $ = cheerio.load(response.data);
    
    const prices = [];
    
    $('.item-news').each((i, element) => {
      const title = $(element).find('.title-news a').text();
      const description = $(element).find('.description a').text();
      
      if (title.toLowerCase().includes('giá') || description.toLowerCase().includes('giá')) {
        const priceMatch = (title + ' ' + description).match(/(\d{1,3}(?:\.\d{3})*)\s*(đồng|VND)/gi);
        if (priceMatch) {
          const productMatch = title.match(/(gạo|cà phê|tiêu|cao su|tôm|cá)/gi);
          if (productMatch) {
            prices.push({
              name: productMatch[0],
              price: parseInt(priceMatch[0].replace(/[^\d]/g, '')),
              unit: 'kg',
              market: 'VnExpress',
              source: 'vnexpress'
            });
          }
        }
      }
    });
    
    res.json(prices);
    
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Scraping server running on port ${PORT}`);
});