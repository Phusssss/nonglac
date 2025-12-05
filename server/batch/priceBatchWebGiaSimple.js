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

// WebGia decode function
const gm = (r) => {
  r = r.replace(/A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z/g, "");
  const n = [];
  for (let t = 0; t < r.length - 1; t += 2) {
    n.push(parseInt(r.substr(t, 2), 16));
  }
  return String.fromCharCode.apply(String, n);
};

const scrapeWebGiaCoffee = async () => {
  try {
    console.log('Scraping WebGia Coffee...');
    
    const response = await axios.get('https://webgia.com/gia-hang-hoa/ca-phe/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const prices = [];
    
    // Check if blocked by Cloudflare
    if (response.data.includes('Just a moment')) {
      console.log('Blocked by Cloudflare');
      return [];
    }
    
    // Get average price
    const avgPriceText = $('p .text-red').text().trim();
    if (avgPriceText && avgPriceText.includes('vnđ')) {
      const avgPrice = parseFloat(avgPriceText.replace(/[^\d.]/g, ''));
      if (avgPrice > 0) {
        prices.push({
          productName: 'Cà phê (Trung bình)',
          currentPrice: avgPrice,
          previousPrice: Math.round(avgPrice * 0.99),
          unit: 'kg',
          market: 'Trung bình toàn quốc',
          category: 'Cà phê',
          change: '0',
          date: new Date().toLocaleDateString('vi-VN'),
          updatedAt: new Date(),
          source: 'webgia'
        });
      }
    }
    
    // Debug: Check what we actually got from the page
    console.log('Page title:', $('title').text());
    console.log('Total td elements:', $('td').length);
    console.log('td.lsd elements:', $('td.lsd').length);
    console.log('td[nb] elements:', $('td[nb]').length);
    console.log('td.lsd[nb] elements:', $('td.lsd[nb]').length);
    
    // Get encoded prices from table
    const markets = ['Đắk Lắk', 'Lâm Đồng', 'Gia Lai', 'Đắk Nông'];
    
    $('td.lsd[nb]').each((index, element) => {
      const encoded = $(element).attr('nb');
      if (encoded && index < markets.length) {
        try {
          const decoded = gm(encoded);
          console.log(`Decoded ${markets[index]}: ${encoded} → "${decoded}"`);
          
          // Parse price from decoded string (e.g., "116.500" -> 116500)
          const price = parseFloat(decoded.replace(/[^\d]/g, ''));
          
          if (price > 0) {
            prices.push({
              productName: 'Cà phê',
              currentPrice: price,
              previousPrice: Math.round(price * 0.99),
              unit: 'kg',
              market: markets[index],
              category: 'Cà phê',
              change: '0',
              date: new Date().toLocaleDateString('vi-VN'),
              updatedAt: new Date(),
              source: 'webgia'
            });
          }
        } catch (e) {
          console.log(`Decode error for ${encoded}:`, e.message);
        }
      }
    });
    
    // If no lsd elements found, try alternative selectors
    if ($('td.lsd[nb]').length === 0) {
      console.log('No td.lsd[nb] found, trying alternatives...');
      
      // Try just td[nb]
      $('td[nb]').each((index, element) => {
        const encoded = $(element).attr('nb');
        console.log(`Found td[nb]: ${encoded}`);
        
        if (encoded && index < markets.length) {
          try {
            const decoded = gm(encoded);
            console.log(`Decoded ${markets[index]}: ${encoded} → "${decoded}"`);
            
            const price = parseFloat(decoded.replace(/[^\d]/g, ''));
            
            if (price > 0) {
              prices.push({
                productName: 'Cà phê',
                currentPrice: price,
                previousPrice: Math.round(price * 0.99),
                unit: 'kg',
                market: markets[index],
                category: 'Cà phê',
                change: '0',
                date: new Date().toLocaleDateString('vi-VN'),
                updatedAt: new Date(),
                source: 'webgia'
              });
            }
          } catch (e) {
            console.log(`Decode error for ${encoded}:`, e.message);
          }
        }
      });
    }
    
    console.log(`Scraped ${prices.length} coffee prices from WebGia`);
    return prices;
    
  } catch (error) {
    console.error('Error scraping WebGia:', error.message);
    return [];
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