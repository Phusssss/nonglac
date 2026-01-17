import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Routes
app.use('/api/ai', aiRoutes);

let cachedPrices = [];
let lastUpdate = null;

const scrapeNhaBeAgri = async () => {
  try {
    const response = await axios.get('https://nhabeagri.com/gia-nong-san/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const prices = [];
    
    const firstTable = $('table').first();
    
    firstTable.find('tr').each((i, element) => {
      if (i === 0) return;
      
      const cells = $(element).find('td');
      if (cells.length >= 9) {
        const name = $(cells[0]).text().trim();
        const unit = $(cells[1]).text().trim();
        const closePrice = $(cells[5]).text().trim();
        const change = $(cells[6]).text().trim();
        const date = $(cells[8]).text().trim();
        
        if (name && closePrice && name !== 'Tên nông sản' && !name.includes('đ')) {
          // Xử lý giá có dấu chấm phân cách hàng nghìn
          const priceText = closePrice.replace(/đ/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
          const price = parseFloat(priceText);
          
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
              updatedAt: new Date()
            });
          }
        }
      }
    });
    
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

const updatePrices = async () => {
  try {
    console.log('Updating prices...');
    
    const nhaBeAgriData = await scrapeNhaBeAgri();
    
    cachedPrices = nhaBeAgriData;
    lastUpdate = new Date();
    
    console.log(`Updated ${cachedPrices.length} prices at ${lastUpdate}`);
  } catch (error) {
    console.error('Error updating prices:', error);
  }
};

// API endpoints
app.get('/api/prices', (req, res) => {
  res.json({
    data: cachedPrices,
    lastUpdate,
    count: cachedPrices.length
  });
});

app.get('/api/prices/category/:category', (req, res) => {
  const { category } = req.params;
  const filtered = cachedPrices.filter(price => 
    price.category.toLowerCase() === category.toLowerCase()
  );
  
  res.json({
    data: filtered,
    category,
    count: filtered.length
  });
});

app.post('/api/prices/refresh', async (req, res) => {
  await updatePrices();
  res.json({
    message: 'Prices updated successfully',
    count: cachedPrices.length,
    lastUpdate
  });
});

// Batch job endpoint
app.post('/api/batch/run', async (req, res) => {
  try {
    console.log('Running batch job...');
    
    // Import batch job dynamically
    const { exec } = await import('child_process');
    
    exec('cd batch && npm run batch', (error, stdout, stderr) => {
      if (error) {
        console.error('Batch error:', error);
        return;
      }
      console.log('Batch output:', stdout);
    });
    
    res.json({ message: 'Batch job started' });
  } catch (error) {
    console.error('Error starting batch:', error);
    res.status(500).json({ error: 'Batch job failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NongLac API Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pricesCount: cachedPrices.length,
    lastPriceUpdate: lastUpdate
  });
});

// Update prices every 30 minutes
cron.schedule('*/30 * * * *', updatePrices);

// Initial price update
updatePrices();

app.listen(PORT, () => {
  console.log(`NongLac API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});