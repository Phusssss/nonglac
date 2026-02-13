/**
 * Test crawler locally before deploying
 * Run: node test/crawler.test.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // You need to download this

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const { crawlCoffeePrices } = require('../crawler/coffeeCrawler');

async function testCrawler() {
  console.log('🧪 Testing coffee crawler...\n');
  
  try {
    const result = await crawlCoffeePrices();
    
    console.log('\n✅ Test passed!');
    console.log('\n📊 Result:');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    process.exit(1);
  }
}

testCrawler();
