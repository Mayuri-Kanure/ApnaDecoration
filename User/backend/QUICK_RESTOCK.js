const mongoose = require('mongoose');
const { Product, VendorProduct } = require('./models');

async function quickRestock() {
  try {
    console.log('Connecting to local MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/apna-decoration');
    console.log('Connected to local MongoDB\n');

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
        name: 'Premium Metallic Balloon Set - Blue & golden',
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

    console.log('Updating products locally...\n');

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
          console.log(`\u2705 ${product.name}`);
          console.log(`   Stock: 0 \u2192 ${product.stock}`);
          console.log(`   Price: \u20b9${result.price}`);
        } else {
          console.log(`\u274c ${product.name} - Not found in local DB`);
        }
      } catch (err) {
        console.error(`\u274c Error updating ${product.name}:`, err.message);
      }
    }

    await mongoose.connection.close();
    console.log('\n\u2703 Done!');
    process.exit(0);
  } catch (err) {
    console.error('Connection Error:', err.message);
    console.log('\nIf local MongoDB is not running, use these manual commands:');
    console.log('1. Start MongoDB: mongod');
    console.log('2. Run this script again');
    process.exit(1);
  }
}

quickRestock();
