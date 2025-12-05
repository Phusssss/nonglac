import puppeteer from 'puppeteer';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import fs from 'fs';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDnFyp0GIiGiw9Nvs_UqX161lC-aap0HLo",
  authDomain: "nonglac-2025.firebaseapp.com",
  projectId: "nonglac-2025",
  storageBucket: "nonglac-2025.firebasestorage.app",
  messagingSenderId: "258039490955",
  appId: "1:258039490955:web:1f59dfbda556b8e833678e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

try {
  await signInAnonymously(auth);
  console.log('Signed in anonymously');
} catch (error) {
  console.log('Auth not required for this operation');
}

const scrapeWebGiaWithPuppeteer = async () => {
  let browser;
  try {
    console.log('Starting Puppeteer...');
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('https://webgia.com/gia-hang-hoa/ca-phe/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    const prices = await page.evaluate(() => {
      const results = [];
      
      // Lấy giá trung bình
      const avgElement = document.querySelector('p .text-red');
      if (avgElement) {
        const avgText = avgElement.textContent.trim();
        const avgPrice = parseFloat(avgText.replace(/[^\d.]/g, ''));
        if (avgPrice > 0) {
          results.push({
            productName: 'Cà phê (Trung bình)',
            currentPrice: avgPrice,
            previousPrice: Math.round(avgPrice * 0.99),
            unit: 'kg',
            market: 'Trung bình toàn quốc',
            category: 'Cà phê',
            change: '0',
            date: new Date().toLocaleDateString('vi-VN'),
            source: 'webgia'
          });
        }
      }
      
      // Lấy giá từ bảng sau khi JavaScript đã render
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const market = cells[0].textContent.trim();
          const priceText = cells[1].textContent.trim();
          
          if (market && priceText && !priceText.includes('webgia')) {
            const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
            if (price > 0 && market.length > 1) {
              results.push({
                productName: 'Cà phê',
                currentPrice: price,
                previousPrice: Math.round(price * 0.99),
                unit: 'kg',
                market: market,
                category: 'Cà phê',
                change: '0',
                date: new Date().toLocaleDateString('vi-VN'),
                source: 'webgia'
              });
            }
          }
        }
      });
      
      return results;
    });
    
    console.log(`Scraped ${prices.length} prices with Puppeteer`);
    return prices;
    
  } catch (error) {
    console.error('Puppeteer error:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const saveToCSV = (data, filename) => {
  try {
    if (data.length === 0) return;
    
    const headers = ['Tên sản phẩm', 'Giá hiện tại', 'Giá trước', 'Đơn vị', 'Thị trường', 'Danh mục', 'Thay đổi', 'Ngày', 'Nguồn'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.productName}"`,
        item.currentPrice,
        item.previousPrice,
        `"${item.unit}"`,
        `"${item.market}"`,
        `"${item.category}"`,
        `"${item.change}"`,
        `"${item.date}"`,
        `"${item.source}"`
      ].join(','))
    ].join('\n');
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filepath = `webgia_puppeteer_${timestamp}.csv`;
    
    fs.writeFileSync(filepath, '\uFEFF' + csvContent, 'utf8');
    console.log(`Saved ${data.length} records to CSV: ${filepath}`);
  } catch (error) {
    console.error(`Error saving CSV:`, error);
  }
};

const runPuppeteerBatch = async () => {
  try {
    console.log('Starting Puppeteer batch job...');
    
    const webGiaPrices = await scrapeWebGiaWithPuppeteer();
    
    if (webGiaPrices.length > 0) {
      saveToCSV(webGiaPrices, 'webgia_puppeteer');
      console.log('Puppeteer batch completed successfully');
    } else {
      console.log('No prices found with Puppeteer');
    }
    
  } catch (error) {
    console.error('Puppeteer batch failed:', error);
  }
};

runPuppeteerBatch();