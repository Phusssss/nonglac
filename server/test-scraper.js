import axios from 'axios';
import * as cheerio from 'cheerio';

async function testNhaBeAgri() {
  try {
    console.log('Testing NhaBeAgri scraper...');
    
    const response = await axios.get('https://nhabeagri.com/gia-nong-san/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const prices = [];
    
    // Debug: In ra HTML để xem cấu trúc
    console.log('Page title:', $('title').text());
    
    // Tìm tất cả bảng
    $('table').each((tableIndex, table) => {
      console.log(`\nTable ${tableIndex}:`);
      
      $(table).find('tr').each((rowIndex, row) => {
        const cells = $(row).find('td, th');
        const rowData = [];
        
        cells.each((cellIndex, cell) => {
          rowData.push($(cell).text().trim());
        });
        
        if (rowData.length > 0) {
          console.log(`Row ${rowIndex}:`, rowData);
          
          // Nếu là dòng dữ liệu (không phải header)
          if (rowIndex > 0 && rowData.length >= 7) {
            const name = rowData[0];
            const unit = rowData[1];
            const closePrice = rowData[4] || rowData[5]; // Thử cột 4 hoặc 5
            
            if (name && closePrice && name !== 'Tên nông sản') {
              const priceText = closePrice.replace(/[^\d.,]/g, '');
              const price = parseFloat(priceText.replace(/,/g, ''));
              
              if (price > 0) {
                prices.push({
                  name,
                  price: Math.round(price),
                  unit: unit.replace('đ/', ''),
                  market: 'NhaBeAgri'
                });
              }
            }
          }
        }
      });
    });
    
    console.log(`\nFound ${prices.length} products:`);
    prices.forEach(p => console.log(`- ${p.name}: ${p.price} ${p.unit}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNhaBeAgri();