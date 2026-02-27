const mongoose = require('mongoose');

const createIndexes = async () => {
  try {
    console.log('🔧 Creating database indexes...');

    // User indexes
    await mongoose.connection.db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { username: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { isActive: 1 } },
      { key: { createdAt: -1 } }
    ]);

    // Product indexes
    await mongoose.connection.db.collection('products').createIndexes([
      { key: { sku: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { category_id: 1 } },
      { key: { product_type: 1 } },
      { key: { is_featured: 1 } },
      { key: { unit_price: 1 } },
      { key: { createdAt: -1 } },
      { key: { updatedAt: -1 } },
      { key: { product_name_en: 'text', description_en: 'text' } } // Text search
    ]);

    // Order indexes
    await mongoose.connection.db.collection('orders').createIndexes([
      { key: { customerId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { totalAmount: -1 } },
      { key: { 'items.product': 1 } }
    ]);

    // Category indexes
    await mongoose.connection.db.collection('categories').createIndexes([
      { key: { name: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { priority: 1 } },
      { key: { homeCategory: 1 } }
    ]);

    // Banner indexes
    await mongoose.connection.db.collection('banners').createIndexes([
      { key: { section: 1 } },
      { key: { status: 1 } },
      { key: { priority: -1 } },
      { key: { createdAt: -1 } }
    ]);

    // Service indexes
    await mongoose.connection.db.collection('services').createIndexes([
      { key: { serviceType: 1 } },
      { key: { availability: 1 } },
      { key: { featured: 1 } },
      { key: { createdAt: -1 } },
      { key: { name: 'text', description: 'text' } } // Text search
    ]);

    // ServiceCategory indexes
    await mongoose.connection.db.collection('servicecategories').createIndexes([
      { key: { name: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { priority: 1 } },
      { key: { homeCategory: 1 } }
    ]);

    // CustomerReview indexes
    await mongoose.connection.db.collection('customerreviews').createIndexes([
      { key: { productId: 1 } },
      { key: { customerId: 1 } },
      { key: { rating: 1 } },
      { key: { createdAt: -1 } }
    ]);

    // Notification indexes
    await mongoose.connection.db.collection('notifications').createIndexes([
      { key: { userId: 1 } },
      { key: { isRead: 1 } },
      { key: { createdAt: -1 } },
      { key: { type: 1 } }
    ]);

    // Wishlist indexes
    await mongoose.connection.db.collection('wishlists').createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { 'products.productId': 1 } },
      { key: { createdAt: -1 } }
    ]);

    console.log('✅ All database indexes created successfully!');
    
    // List all indexes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Created indexes for collections:');
    
    for (const collection of collections) {
      const indexes = await mongoose.connection.db.collection(collection.name).listIndexes().toArray();
      const indexNames = indexes.map(index => index.name).join(', ');
      console.log(`  ${collection.name}: ${indexNames}`);
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

module.exports = createIndexes;
