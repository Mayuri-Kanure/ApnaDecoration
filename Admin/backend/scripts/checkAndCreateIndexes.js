const mongoose = require('mongoose');

const checkAndCreateIndexes = async () => {
  try {
    console.log('🔧 Checking and creating database indexes...');

    // User indexes
    const userCollection = mongoose.connection.db.collection('users');
    try {
      await userCollection.createIndex({ email: 1 }, { unique: true });
      await userCollection.createIndex({ username: 1 }, { unique: true });
      await userCollection.createIndex({ role: 1 });
      await userCollection.createIndex({ isActive: 1 });
      await userCollection.createIndex({ createdAt: -1 });
      console.log('✅ User indexes created/verified');
    } catch (error) {
      if (error.code !== 85) console.log('⚠️ User indexes:', error.message);
    }

    // Product indexes
    const productCollection = mongoose.connection.db.collection('products');
    try {
      await productCollection.createIndex({ sku: 1 }, { unique: true });
      await productCollection.createIndex({ status: 1 });
      await productCollection.createIndex({ category_id: 1 });
      await productCollection.createIndex({ product_type: 1 });
      await productCollection.createIndex({ is_featured: 1 });
      await productCollection.createIndex({ unit_price: 1 });
      await productCollection.createIndex({ createdAt: -1 });
      await productCollection.createIndex({ updatedAt: -1 });
      console.log('✅ Product indexes created/verified');
    } catch (error) {
      if (error.code !== 85) console.log('⚠️ Product indexes:', error.message);
    }

    // Order indexes
    const orderCollection = mongoose.connection.db.collection('orders');
    try {
      await orderCollection.createIndex({ customerId: 1 });
      await orderCollection.createIndex({ status: 1 });
      await orderCollection.createIndex({ createdAt: -1 });
      await orderCollection.createIndex({ totalAmount: -1 });
      await orderCollection.createIndex({ 'items.product': 1 });
      console.log('✅ Order indexes created/verified');
    } catch (error) {
      if (error.code !== 85) console.log('⚠️ Order indexes:', error.message);
    }

    // Category indexes
    const categoryCollection = mongoose.connection.db.collection('categories');
    try {
      await categoryCollection.createIndex({ name: 1 }, { unique: true });
      await categoryCollection.createIndex({ status: 1 });
      await categoryCollection.createIndex({ priority: 1 });
      await categoryCollection.createIndex({ homeCategory: 1 });
      console.log('✅ Category indexes created/verified');
    } catch (error) {
      if (error.code !== 85) console.log('⚠️ Category indexes:', error.message);
    }

    // Banner indexes
    const bannerCollection = mongoose.connection.db.collection('banners');
    try {
      await bannerCollection.createIndex({ section: 1 });
      await bannerCollection.createIndex({ status: 1 });
      await bannerCollection.createIndex({ priority: -1 });
      await bannerCollection.createIndex({ createdAt: -1 });
      console.log('✅ Banner indexes created/verified');
    } catch (error) {
      if (error.code !== 85) console.log('⚠️ Banner indexes:', error.message);
    }

    console.log('✅ Database indexes optimization completed!');

  } catch (error) {
    console.error('❌ Error with indexes:', error);
  }
};

module.exports = checkAndCreateIndexes;
