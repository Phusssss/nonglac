/**
 * Scheduled Cron Jobs
 * Automated tasks running on schedule
 */

const { crawlCoffeePricesSimple } = require('../crawler/simpleCrawler');
const admin = require('firebase-admin');

/**
 * Scheduled crawl job - runs every 30 minutes
 */
async function scheduledCrawl(context) {
  console.log('⏰ Scheduled crawl triggered at:', new Date().toISOString());
  
  try {
    // Check if it's within business hours (6 AM - 10 PM)
    const hour = new Date().getHours();
    if (hour < 6 || hour >= 22) {
      console.log('⏸️  Outside business hours, skipping crawl');
      return null;
    }
    
    // Run crawl
    const result = await crawlCoffeePricesSimple();
    
    // Log success
    await admin.firestore().collection('crawler_logs').add({
      type: 'scheduled',
      status: 'success',
      timestamp: Date.now(),
      duration: result.crawlDuration,
      data: result
    });
    
    console.log('✅ Scheduled crawl completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ Scheduled crawl failed:', error);
    
    // Log failure
    await admin.firestore().collection('crawler_logs').add({
      type: 'scheduled',
      status: 'failed',
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack
    });
    
    // Send alert to admin (optional)
    await sendAdminAlert('Scheduled crawl failed', error.message);
    
    return null;
  }
}

/**
 * Send alert to admin
 */
async function sendAdminAlert(title, message) {
  try {
    // Get admin users
    const adminsSnapshot = await admin.firestore()
      .collection('users')
      .where('role', '==', 'admin')
      .where('fcmToken', '!=', null)
      .get();
    
    if (adminsSnapshot.empty) {
      console.log('No admin users to alert');
      return;
    }
    
    const tokens = adminsSnapshot.docs
      .map(doc => doc.data().fcmToken)
      .filter(token => token);
    
    if (tokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title: `🚨 ${title}`,
          body: message
        },
        data: {
          type: 'admin_alert',
          timestamp: Date.now().toString()
        }
      });
      
      console.log(`Sent alert to ${tokens.length} admins`);
    }
  } catch (error) {
    console.error('Failed to send admin alert:', error);
  }
}

module.exports = {
  scheduledCrawl,
  sendAdminAlert
};
