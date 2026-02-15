/**
 * Script to clear old price data from Firestore
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function clearOldData() {
  console.log('🗑️  Starting to clear old price data...\n');

  try {
    // 1. Clear coffee_prices collection
    console.log('Clearing coffee_prices collection...');
    const coffeePricesSnapshot = await db.collection('coffee_prices').get();
    console.log(`Found ${coffeePricesSnapshot.size} documents in coffee_prices`);
    
    const coffeeBatch = db.batch();
    coffeePricesSnapshot.docs.forEach(doc => {
      coffeeBatch.delete(doc.ref);
    });
    await coffeeBatch.commit();
    console.log('✅ Cleared coffee_prices collection\n');

    // 2. Clear full_prices/current document
    console.log('Clearing full_prices/current document...');
    const fullPricesRef = db.collection('full_prices').doc('current');
    const fullPricesDoc = await fullPricesRef.get();
    
    if (fullPricesDoc.exists) {
      await fullPricesRef.delete();
      console.log('✅ Cleared full_prices/current document\n');
    } else {
      console.log('ℹ️  full_prices/current does not exist\n');
    }

    // 3. Clear prices collection (if exists)
    console.log('Clearing prices collection...');
    const pricesSnapshot = await db.collection('prices').get();
    console.log(`Found ${pricesSnapshot.size} documents in prices`);
    
    if (pricesSnapshot.size > 0) {
      const pricesBatch = db.batch();
      pricesSnapshot.docs.forEach(doc => {
        pricesBatch.delete(doc.ref);
      });
      await pricesBatch.commit();
      console.log('✅ Cleared prices collection\n');
    }

    console.log('🎉 All old data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearOldData();
