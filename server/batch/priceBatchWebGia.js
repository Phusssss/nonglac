import { chromium } from 'playwright';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

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

const scrapeWebGiaCoffee = async () => {
  let browser;
  try {
    console.log('Starting Playwright for WebGia...');
    
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    console.log('Navigating to WebGia coffee page...');
    await page.goto('https://webgia.com/gia-hang-hoa/ca-phe/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for potential Cloudflare challenge
    await page.waitForTimeout(15000);
    
    // Check if still on Cloudflare page
    const title = await page.title();
    if (title.includes('Just a moment')) {
      console.log('Still blocked by Cloudflare');
      return [];
    }
    
    console.log('Page loaded, extracting coffee prices...');
    
    const prices = await page.evaluate(() => {
      // Decode function from the website
      function gm(r) {
        r = r.replace(/A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z/g, "");
        for (var n = [], t = 0; t < r.length - 1; t += 2) 
          n.push(parseInt(r.substr(t, 2), 16));
        return String.fromCharCode.apply(String, n);
      }
      
      const results = [];
      
      // Get average price
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
      
      // Get encoded prices from table
      const encodedCells = document.querySelectorAll('td.lsd[nb]');
      const markets = ['Đắk Lắk', 'Lâm Đồng', 'Gia Lai', 'Đắk Nông'];
      
      encodedCells.forEach((cell, index) => {
        const encoded = cell.getAttribute('nb');
        if (encoded && index < markets.length) {
          try {
            const decoded = gm(encoded);
            const price = parseFloat(decoded);
            
            if (price > 0) {
              results.push({
                productName: 'Cà phê',
                currentPrice: price,
                previousPrice: Math.round(price * 0.99),
                unit: 'kg',
                market: markets[index],
                category: 'Cà phê',
                change: '0',
                date: new Date().toLocaleDateString('vi-VN'),
                source: 'webgia'
              });
            }
          } catch (e) {
            console.log('Decode error for', encoded, e);
          }
        }
      });
      
      return results;
    });
    
    console.log(`✅ Scraped ${prices.length} coffee prices from WebGia`);
    return prices;
    
  } catch (error) {
    console.error('WebGia scraping error:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const clearCollection = async (collectionName) => {
  try {
    const ref = collection(db, collectionName);
    const snapshot = await getDocs(ref);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`Cleared ${snapshot.docs.length} old records from ${collectionName}`);
  } catch (error) {
    console.error(`Error clearing ${collectionName}:`, error);
  }
};

const saveToFirebase = async (data, collectionName) => {
  try {
    const ref = collection(db, collectionName);
    
    const savePromises = data.map(item => addDoc(ref, item));
    await Promise.all(savePromises);
    
    console.log(`Saved ${data.length} records to ${collectionName}`);
  } catch (error) {
    console.error(`Error saving to ${collectionName}:`, error);
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
    const filepath = path.join(process.cwd(), `${filename}_${timestamp}.csv`);
    
    fs.writeFileSync(filepath, '\uFEFF' + csvContent, 'utf8');
    console.log(`Saved ${data.length} records to CSV: ${filepath}`);
  } catch (error) {
    console.error(`Error saving CSV ${filename}:`, error);
  }
};

const runBatch = async () => {
  try {
    console.log('Starting WebGia coffee price batch job...');
    
    const webgiaPrices = await scrapeWebGiaCoffee();
    
    if (webgiaPrices.length > 0) {
      await clearCollection('webgia_prices');
      await saveToFirebase(webgiaPrices, 'webgia_prices');
      saveToCSV(webgiaPrices, 'webgia_prices');
      
      // Also save to main collection
      await clearCollection('prices');
      await saveToFirebase(webgiaPrices, 'prices');
    }
    
    console.log(`Batch completed - WebGia: ${webgiaPrices.length} prices`);
  } catch (error) {
    console.error('Batch job failed:', error);
  }
};

runBatch();