/**
 * Simple Coffee Price Crawler - Without Playwright
 * Sử dụng Puppeteer (lighter) hoặc Axios + Cheerio
 */

const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');

/**
 * Crawl coffee prices using Axios + Cheerio (lighter)
 * @returns {Promise<Object>} Price data
 */
async function crawlCoffeePricesSimple() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting simple coffee price crawl...');
    
    // Fetch page HTML
    const response = await axios.get('https://giacaphe.com/gia-ca-phe-noi-dia/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 30000
    });
    
    console.log('📄 Page fetched successfully');
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract inline styles and CSS
    let cssContent = '';
    
    // Get inline styles
    $('style').each((i, elem) => {
      cssContent += $(elem).html() + '\n';
    });
    
    console.log('🔍 Parsing CSS content...');
    
    // Extract values from CSS ::after content
    const regex = /::after\s*{\s*content:\s*['"]([^'"]+)['"]/g;
    const values = [];
    let match;
    
    while ((match = regex.exec(cssContent)) !== null) {
      values.push(match[1]);
    }
    
    console.log(`Found ${values.length} CSS content values`);
    
    if (values.length < 8) {
      // Fallback: Try to extract from HTML directly
      console.log('⚠️ Not enough CSS values, trying HTML extraction...');
      
      // Try alternative extraction methods
      const prices = {};
      const changes = {};
      
      // This is a placeholder - you may need to adjust based on actual HTML structure
      $('.price-item').each((i, elem) => {
        const region = $(elem).find('.region').text().trim();
        const price = $(elem).find('.price').text().trim();
        const change = $(elem).find('.change').text().trim();
        
        if (region && price) {
          prices[region] = price;
          changes[region] = change || '0';
        }
      });
      
      if (Object.keys(prices).length > 0) {
        const priceData = {
          source: 'giacaphe.com',
          url: 'https://giacaphe.com/gia-ca-phe-noi-dia/',
          prices,
          changes,
          timestamp: Date.now(),
          date: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          unit: 'VNĐ/kg',
          crawlDuration: Date.now() - startTime,
          method: 'html-extraction'
        };
        
        await savePriceData(priceData);
        return priceData;
      }
      
      throw new Error(`Insufficient data: only ${values.length} values found, need at least 8`);
    }
    
    // Structure the data
    const priceData = {
      source: 'giacaphe.com',
      url: 'https://giacaphe.com/gia-ca-phe-noi-dia/',
      prices: {
        'Đắk Lắk': values[0],
        'Lâm Đồng': values[2],
        'Gia Lai': values[4],
        'Đắk Nông': values[6]
      },
      changes: {
        'Đắk Lắk': values[1],
        'Lâm Đồng': values[3],
        'Gia Lai': values[5],
        'Đắk Nông': values[7]
      },
      timestamp: Date.now(),
      date: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      unit: 'VNĐ/kg',
      crawlDuration: Date.now() - startTime,
      method: 'css-extraction'
    };
    
    console.log('💾 Saving to Firestore...');
    await savePriceData(priceData);
    
    console.log('✅ Crawl completed successfully!');
    console.log('📊 Price data:', JSON.stringify(priceData.prices, null, 2));
    
    return priceData;
    
  } catch (error) {
    console.error('❌ Crawl error:', error);
    
    // Log error to Firestore
    try {
      await admin.firestore().collection('crawler_errors').add({
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        source: 'simpleCrawler'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    throw error;
  }
}

/**
 * Save price data to Firestore
 */
async function savePriceData(priceData) {
  const db = admin.firestore();
  
  // Save to collection
  await db.collection('coffee_prices').add(priceData);
  
  // Update latest price cache
  await db.collection('coffee_latest').doc('current').set({
    ...priceData,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  });
}

module.exports = {
  crawlCoffeePricesSimple
};
