import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { scrapeAgroMonitor } from './scrapers/agromonitor.js';
import { scrapeVietStock } from './scrapers/vietstock.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let cachedPrices = [];
let lastUpdate = null;

const updatePrices = async () => {
  try {
    console.log('Updating prices...');
    
    const [agroData, vietStockData] = await Promise.all([
      scrapeAgroMonitor(),
      scrapeVietStock()
    ]);
    
    cachedPrices = [...agroData, ...vietStockData];
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

// Update prices every 30 minutes
cron.schedule('*/30 * * * *', updatePrices);

// Initial price update
updatePrices();

app.listen(PORT, () => {
  console.log(`Price scraper server running on port ${PORT}`);
});