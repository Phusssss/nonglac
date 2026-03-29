/**
 * Firebase Functions - NôngLạc Coffee Price Crawler
 * Chuẩn production với Playwright + Stealth
 */

const functions = require('firebase-functions');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const SERVICE_ACCOUNT = 'nonglac-2026@appspot.gserviceaccount.com';

// Initialize Firebase Admin
admin.initializeApp();

// Import modules
const { crawlCoffeePricesSimple } = require('./crawler/simpleCrawler');
const { getCoffeePrices, getLatestPrices, getPriceHistory } = require('./api/priceApi');
const { scheduledCrawl } = require('./scheduler/cronJobs');
const { autoPostVideosFromSheet, postSingleVideoFromDrive } = require('./scheduler/videoAutoPoster');

/**
 * API: Get client IP address
 * GET /api/client-ip
 */
exports.getClientIp = functions
  .region('asia-southeast1')
  .https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    try {
      // Lấy IP từ request headers
      let ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               req.connection.socket?.remoteAddress ||
               'unknown';
      
      // Nếu có multiple IPs (proxy), lấy cái đầu tiên
      if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }
      
      // Remove IPv6 prefix nếu có
      if (ip && ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
      }
      
      res.json({
        success: true,
        ip: ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });
    } catch (error) {
      console.error('Error getting client IP:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        ip: 'unknown'
      });
    }
  });

// ============================================
// 🔥 HTTP FUNCTIONS - API Endpoints
// ============================================

/**
 * API: Get latest coffee prices
 * GET /api/coffee/latest
 */
exports.getLatestCoffeePrices = functions
  .region('asia-southeast1')
  .https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    return getLatestPrices(req, res);
  });

/**
 * API: Get coffee price history
 * GET /api/coffee/history?days=7
 */
exports.getCoffeePriceHistory = functions
  .region('asia-southeast1')
  .https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    return getPriceHistory(req, res);
  });

/**
 * API: Trigger manual crawl (admin only)
 * POST /api/coffee/crawl
 */
exports.crawlCoffeeManual = functions
  .region('asia-southeast1')
  .runWith({
    serviceAccount: SERVICE_ACCOUNT,
    timeoutSeconds: 300,
    memory: '2GB'
  })
  .https.onRequest((req, res) => {
    return cors(req, res, async () => {
      try {
        // Crawl without auth check for now (can add later)
        const result = await crawlCoffeePricesSimple();
        
        res.json({
          success: true,
          message: 'Crawl completed successfully',
          result: result
        });
      } catch (error) {
        console.error('Manual crawl error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Crawl failed'
        });
      }
    });
  });

/**
 * Trigger: When a new post request is created in Firestore
 * Processes video sync (single or all) in the background
 */
exports.onPostRequestCreated = functions
  .region('asia-southeast1')
  .runWith({
    timeoutSeconds: 300,
    memory: '2GB'
  })
  .firestore.document('post_requests/{requestId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (data.status !== 'pending') return null;
    
    console.log(`Processing post request: ${context.params.requestId}, type: ${data.type}`);
    
    try {
      let result;
      if (data.type === 'sync_all') {
        result = await autoPostVideosFromSheet();
      } else {
        result = await postSingleVideoFromDrive(data.driveId, data.date, data.title, data.content);
      }
      
      return snap.ref.update({
        status: result.success ? 'completed' : 'failed',
        result: result,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error processing post request:', error);
      return snap.ref.update({
        status: 'failed',
        error: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// ============================================
// ⏰ SCHEDULED FUNCTIONS - Cron Jobs
// ============================================

/**
 * Scheduled: Crawl coffee prices every 30 minutes
 * Runs: 00:00, 00:30, 01:00, 01:30, ... 23:30
 */
exports.scheduledCoffeeCrawl = functions
  .region('asia-southeast1')
  .runWith({
    serviceAccount: SERVICE_ACCOUNT,
    timeoutSeconds: 300,
    memory: '2GB'
  })
  .pubsub.schedule('every 30 minutes')
  .timeZone('Asia/Ho_Chi_Minh')
  .onRun(scheduledCrawl);

/**
 * Scheduled: Auto post videos from Google Sheet every day at 8 AM
 * Runs: 08:00 every day
 */
exports.autoPostVideosDaily = functions
  .region('asia-southeast1')
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB'
  })
  .pubsub.schedule('0 8 * * *')
  .timeZone('Asia/Ho_Chi_Minh')
  .onRun(async (context) => {
    return await autoPostVideosFromSheet();
  });

/**
 * Scheduled: Daily summary at 6 AM
 * Runs: 06:00 every day
 */
exports.dailyCoffeeSummary = functions
  .region('asia-southeast1')
  .pubsub.schedule('0 6 * * *')
  .timeZone('Asia/Ho_Chi_Minh')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      
      // Get yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const snapshot = await db.collection('coffee_prices')
        .where('timestamp', '>=', yesterday.getTime())
        .orderBy('timestamp', 'desc')
        .get();
      
      if (snapshot.empty) {
        console.log('No data for summary');
        return null;
      }
      
      // Calculate summary
      const prices = snapshot.docs.map(doc => doc.data());
      const summary = {
        date: new Date().toISOString().split('T')[0],
        totalRecords: prices.length,
        averagePrices: {},
        maxPrices: {},
        minPrices: {},
        timestamp: Date.now()
      };
      
      // Calculate for each region
      const regions = ['Đắk Lắk', 'Lâm Đồng', 'Gia Lai', 'Đắk Nông'];
      regions.forEach(region => {
        const regionPrices = prices
          .map(p => parseFloat(p.prices[region]?.replace(/\./g, '') || 0))
          .filter(p => p > 0);
        
        if (regionPrices.length > 0) {
          summary.averagePrices[region] = Math.round(
            regionPrices.reduce((a, b) => a + b, 0) / regionPrices.length
          );
          summary.maxPrices[region] = Math.max(...regionPrices);
          summary.minPrices[region] = Math.min(...regionPrices);
        }
      });
      
      // Save summary
      await db.collection('coffee_summaries').add(summary);
      
      console.log('Daily summary created:', summary);
      return null;
    } catch (error) {
      console.error('Daily summary error:', error);
      return null;
    }
  });

// ============================================
// 🔔 FIRESTORE TRIGGERS
// ============================================

/**
 * Trigger: When new price is added, notify subscribers
 */
exports.onNewCoffeePrice = functions
  .region('asia-southeast1')
  .firestore.document('coffee_prices/{priceId}')
  .onCreate(async (snap, context) => {
    try {
      const newPrice = snap.data();
      
      // Get subscribers
      const subscribersSnapshot = await admin.firestore()
        .collection('price_subscribers')
        .where('active', '==', true)
        .get();
      
      if (subscribersSnapshot.empty) {
        console.log('No subscribers to notify');
        return null;
      }
      
      // Prepare notification
      const notification = {
        title: '📊 Cập nhật giá cà phê',
        body: `Đắk Lắk: ${newPrice.prices['Đắk Lắk']} VNĐ/kg`,
        data: {
          type: 'coffee_price_update',
          priceId: context.params.priceId,
          timestamp: newPrice.timestamp.toString()
        }
      };
      
      // Send to all subscribers
      const tokens = subscribersSnapshot.docs
        .map(doc => doc.data().fcmToken)
        .filter(token => token);
      
      if (tokens.length > 0) {
        await admin.messaging().sendMulticast({
          tokens,
          notification,
          data: notification.data
        });
        
        console.log(`Sent notifications to ${tokens.length} subscribers`);
      }
      
      return null;
    } catch (error) {
      console.error('Notification error:', error);
      return null;
    }
  });

// ============================================
// 🧹 CLEANUP FUNCTIONS
// ============================================

/**
 * Scheduled: Cleanup old data (keep 90 days)
 * Runs: 02:00 every day
 */
exports.cleanupOldPrices = functions
  .region('asia-southeast1')
  .pubsub.schedule('0 2 * * *')
  .timeZone('Asia/Ho_Chi_Minh')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const cutoffDate = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days ago
      
      const snapshot = await db.collection('coffee_prices')
        .where('timestamp', '<', cutoffDate)
        .limit(500)
        .get();
      
      if (snapshot.empty) {
        console.log('No old data to cleanup');
        return null;
      }
      
      // Delete in batches
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Cleaned up ${snapshot.size} old records`);
      
      return null;
    } catch (error) {
      console.error('Cleanup error:', error);
      return null;
    }
  });
