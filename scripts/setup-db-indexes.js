const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  setupIndexes();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function setupIndexes() {
  try {
    console.log('🔧 Setting up database indexes...');

    const db = mongoose.connection.db;

    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ phone: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });

    // Products collection indexes
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ vendorId: 1 });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ status: 1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ sku: 1 }, { unique: true });
    await db.collection('products').createIndex({ createdAt: -1 });
    await db.collection('products').createIndex({ rating: -1 });
    await db.collection('products').createIndex({ views: -1 });

    // Orders collection indexes
    await db.collection('orders').createIndex({ customer: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ 'items.product': 1 });
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ paymentStatus: 1 });

    // Vendors collection indexes
    await db.collection('vendors').createIndex({ email: 1 }, { unique: true });
    await db.collection('vendors').createIndex({ phone: 1 }, { unique: true });
    await db.collection('vendors').createIndex({ status: 1 });
    await db.collection('vendors').createIndex({ businessName: 1 });
    await db.collection('vendors').createIndex({ createdAt: -1 });

    // Categories collection indexes
    await db.collection('categories').createIndex({ name: 1 }, { unique: true });
    await db.collection('categories').createIndex({ status: 1 });
    await db.collection('categories').createIndex({ parentId: 1 });

    // Cart collection indexes
    await db.collection('carts').createIndex({ userId: 1 });
    await db.collection('carts').createIndex({ createdAt: -1 });

    // Reviews collection indexes
    await db.collection('reviews').createIndex({ product: 1 });
    await db.collection('reviews').createIndex({ customer: 1 });
    await db.collection('reviews').createIndex({ rating: 1 });
    await db.collection('reviews').createIndex({ createdAt: -1 });

    // Support tickets collection indexes
    await db.collection('supporttickets').createIndex({ ticketId: 1 }, { unique: true });
    await db.collection('supporttickets').createIndex({ customer: 1 });
    await db.collection('supporttickets').createIndex({ status: 1 });
    await db.collection('supporttickets').createIndex({ priority: 1 });
    await db.collection('supporttickets').createIndex({ createdAt: -1 });

    // Notifications collection indexes
    await db.collection('notifications').createIndex({ userId: 1 });
    await db.collection('notifications').createIndex({ isRead: 1 });
    await db.collection('notifications').createIndex({ createdAt: -1 });

    // Delivery boys collection indexes
    await db.collection('deliveryboys').createIndex({ email: 1 }, { unique: true });
    await db.collection('deliveryboys').createIndex({ phone: 1 }, { unique: true });
    await db.collection('deliveryboys').createIndex({ status: 1 });
    await db.collection('deliveryboys').createIndex({ isAvailable: 1 });

    console.log('✅ Database indexes created successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}
