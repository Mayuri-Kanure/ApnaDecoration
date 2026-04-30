const mongoose = require('mongoose');
const { Product, VendorProduct } = require('./models');

async function restockProducts() {
  try {
    console.log('📦 Starting restock process...\n');
    
    // Try local MongoDB first, then fall back to remote
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration';
    console.log(`🔗 Connecting to: ${mongoURI.includes('localhost') ? 'Local MongoDB' : 'Remote MongoDB'}\n`);
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Products to restock with their IDs
    const productsToRestock = [
      {
        id: '6986ed1e36e5a63a6aaaaaf9',
        name: 'Glitzy Golden and Black Birthday Decor',
        stock: 20,
        model: 'Product'
      },
      {
        id: '698f26a1e9a5ae440df23e8b',
        name: 'Kids Birthday Party Decoration Kit',
        stock: 15,
        model: 'VendorProduct'
      },
      {
        id: '698f08a2599853dd3ad246d7',
        name: 'Premium Metallic Balloon Set – Blue & golden',
        stock: 15,
        model: 'Product'
      },
      {
        id: '69aea4202036a18dc0bbc923',
        name: 'new',
        stock: 10,
        model: 'Product'
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const product of productsToRestock) {
      try {
        let result;

        if (product.model === 'Product') {
          result = await Product.findByIdAndUpdate(
            product.id,
            { $set: { stock: product.stock } },
            { new: true }
          );
        } else {
          result = await VendorProduct.findByIdAndUpdate(
            product.id,
            { $set: { stock: product.stock } },
            { new: true }
          );
        }

        if (result) {
          console.log(`✅ ${product.name}`);
          console.log(`   Model: ${product.model}`);
          console.log(`   Stock Updated: 0 → ${product.stock}`);
          console.log(`   Price: ₹${result.price}`);
          successCount++;
        } else {
          console.log(`❌ ${product.name} - Product not found`);
          errorCount++;
        }
        console.log();
      } catch (err) {
        console.error(`❌ Error updating ${product.name}:`, err.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n========================================');
    console.log('📊 RESTOCK SUMMARY');
    console.log('========================================');
    console.log(`✅ Successfully restocked: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📦 Total stock added: ${productsToRestock.reduce((sum, p) => sum + p.stock, 0)} units`);

    await mongoose.connection.close();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Error:', err.message);
    console.error('\nMake sure your MongoDB connection is working.');
    process.exit(1);
  }
}

restockProducts();
