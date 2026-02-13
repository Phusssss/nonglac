/**
 * Coffee Price API Endpoints
 * RESTful API for accessing coffee price data
 */

const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

/**
 * Get latest coffee prices
 * GET /api/coffee/latest
 */
async function getLatestPrices(req, res) {
  return cors(req, res, async () => {
    try {
      const db = admin.firestore();
      
      // Get from cache first
      const cacheDoc = await db.collection('coffee_latest').doc('current').get();
      
      if (cacheDoc.exists) {
        const data = cacheDoc.data();
        return res.json({
          success: true,
          data: {
            prices: data.prices,
            changes: data.changes,
            timestamp: data.timestamp,
            date: data.date,
            unit: data.unit,
            source: data.source
          },
          cached: true
        });
      }
      
      // Fallback: get latest from collection
      const snapshot = await db.collection('coffee_prices')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return res.status(404).json({
          success: false,
          error: 'No price data available'
        });
      }
      
      const latestPrice = snapshot.docs[0].data();
      
      res.json({
        success: true,
        data: {
          prices: latestPrice.prices,
          changes: latestPrice.changes,
          timestamp: latestPrice.timestamp,
          date: latestPrice.date,
          unit: latestPrice.unit,
          source: latestPrice.source
        },
        cached: false
      });
      
    } catch (error) {
      console.error('Get latest prices error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

/**
 * Get coffee price history
 * GET /api/coffee/history?days=7&region=Đắk Lắk
 */
async function getPriceHistory(req, res) {
  return cors(req, res, async () => {
    try {
      const days = parseInt(req.query.days) || 7;
      const region = req.query.region || null;
      const limit = parseInt(req.query.limit) || 100;
      
      if (days > 90) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 90 days of history allowed'
        });
      }
      
      const db = admin.firestore();
      const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
      
      const snapshot = await db.collection('coffee_prices')
        .where('timestamp', '>=', cutoffDate)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      if (snapshot.empty) {
        return res.status(404).json({
          success: false,
          error: 'No historical data available'
        });
      }
      
      let history = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          prices: data.prices,
          changes: data.changes,
          timestamp: data.timestamp,
          date: data.date
        };
      });
      
      // Filter by region if specified
      if (region) {
        history = history.map(item => ({
          timestamp: item.timestamp,
          date: item.date,
          price: item.prices[region],
          change: item.changes[region]
        }));
      }
      
      // Calculate statistics
      const stats = calculateStats(history, region);
      
      res.json({
        success: true,
        data: {
          history: history.reverse(), // Oldest first
          stats,
          period: {
            days,
            from: new Date(cutoffDate).toISOString(),
            to: new Date().toISOString()
          }
        }
      });
      
    } catch (error) {
      console.error('Get price history error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

/**
 * Calculate statistics for price history
 */
function calculateStats(history, region) {
  if (history.length === 0) return null;
  
  const stats = {};
  
  if (region) {
    // Single region stats
    const prices = history
      .map(h => parseFloat(h.price?.replace(/\./g, '') || 0))
      .filter(p => p > 0);
    
    if (prices.length > 0) {
      stats[region] = {
        average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        max: Math.max(...prices),
        min: Math.min(...prices),
        latest: prices[prices.length - 1],
        oldest: prices[0],
        change: prices[prices.length - 1] - prices[0],
        changePercent: ((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2)
      };
    }
  } else {
    // All regions stats
    const regions = ['Đắk Lắk', 'Lâm Đồng', 'Gia Lai', 'Đắk Nông'];
    
    regions.forEach(reg => {
      const prices = history
        .map(h => parseFloat(h.prices[reg]?.replace(/\./g, '') || 0))
        .filter(p => p > 0);
      
      if (prices.length > 0) {
        stats[reg] = {
          average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          max: Math.max(...prices),
          min: Math.min(...prices),
          latest: prices[prices.length - 1],
          oldest: prices[0],
          change: prices[prices.length - 1] - prices[0],
          changePercent: ((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2)
        };
      }
    });
  }
  
  return stats;
}

/**
 * Get coffee prices (generic endpoint)
 */
async function getCoffeePrices(req, res) {
  return getLatestPrices(req, res);
}

module.exports = {
  getCoffeePrices,
  getLatestPrices,
  getPriceHistory
};
