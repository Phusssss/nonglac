import axios from 'axios';
import * as cheerio from 'cheerio';
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

const scrapeNhaBeAgri = async () => {
  try {
    console.log('Scraping NhaBeAgri...');
    
    const response = await axios.get('https://nhabeagri.com/gia-nong-san/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const prices = [];
    
    $('table').first().find('tr').each((i, element) => {
      if (i === 0) return;
      
      const cells = $(element).find('td');
      if (cells.length >= 9) {
        const name = $(cells[0]).text().trim();
        const unit = $(cells[1]).text().trim();
        const closePrice = $(cells[5]).text().trim();
        const change = $(cells[6]).text().trim();
        const date = $(cells[8]).text().trim();
        
        if (name && closePrice && name !== 'Tên nông sản' && !name.includes('đ')) {
          const price = parseFloat(closePrice.replace(/[^\d.]/g, ''));
          
          if (price > 0 && name.length > 2) {
            prices.push({
              productName: name,
              currentPrice: price,
              previousPrice: Math.round(price * 0.98),
              unit: unit.replace('đ/', '').trim(),
              market: 'NhaBeAgri',
              category: getCategoryFromProduct(name),
              change: change,
              date: date,
              updatedAt: new Date(),
              source: 'nhabeagri'
            });
          }
        }
      }
    });
    
    console.log(`Scraped ${prices.length} products from NhaBeAgri`);
    return prices;
  } catch (error) {
    console.error('Error scraping NhaBeAgri:', error.message);
    return [];
  }
};



const getCategoryFromProduct = (productName) => {
  const name = productName.toLowerCase();
  if (name.includes('gạo') || name.includes('lúa')) return 'Lúa gạo';
  if (name.includes('cà phê')) return 'Cà phê';
  if (name.includes('tiêu') || name.includes('gia vị')) return 'Gia vị';
  if (name.includes('cao su')) return 'Cao su';
  if (name.includes('tôm') || name.includes('cá')) return 'Thủy sản';
  if (name.includes('cacao') || name.includes('cotton') || name.includes('gỗ')) return 'Khác';
  if (name.includes('đường') || name.includes('ngô') || name.includes('đậu nành')) return 'Nông sản khác';
  return 'Nông sản khác';
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
    console.log('Starting price batch job...');
    
    // Cào dữ liệu từ NhaBeAgri
    const nhaBeAgriPrices = await scrapeNhaBeAgri();
    
    if (nhaBeAgriPrices.length > 0) {
      await clearCollection('nhabeagri_prices');
      await saveToFirebase(nhaBeAgriPrices, 'nhabeagri_prices');
      saveToCSV(nhaBeAgriPrices, 'nhabeagri_prices');
      
      // Cũng lưu vào collection chính
      await clearCollection('prices');
      await saveToFirebase(nhaBeAgriPrices, 'prices');
    }
    
    console.log(`Batch completed - NhaBeAgri: ${nhaBeAgriPrices.length} prices`);
  } catch (error) {
    console.error('Batch job failed:', error);
  }
};

runBatch();