require('dotenv').config();
const mongoose = require('mongoose');
const { Product, VendorProduct } = require('./models');

async function restockRemote() {
  try {
    console.log('Connecting to remote MongoDB...');
    const mongoURI = 'mongodb+srv://kanuremayuri_db_user:Kanuremayurimongodbatlas@highflytravels.qoqccvi.mongodb.net/apna-decoration?retryWrites=true&w=majority';
    console.log(`URI: ${mongoURI}\n`);
    
    await mongoose.connect(mongoURI);
    console.log('Connected to remote MongoDB\n');

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

    console.log('Updating products in remote database...\n');

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
          console.log(`\u2705 ${product.name}`);
          console.log(`   Model: ${product.model}`);
          console.log(`   Stock Updated: ${result.stock} \u2192 ${product.stock}`);
          console.log(`   Price: \u20b9${result.price}`);
          successCount++;
        } else {
          console.log(`\u274c ${product.name} - Product not found`);
          errorCount++;
        }
        console.log();
      } catch (err) {
        console.error(`\u274c Error updating ${product.name}:`, err.message);
        errorCount++;
      }
    }

    // Summary
    console.log('========================================');
    console.log('\ud83d\udcca RESTOCK SUMMARY');
    console.log('========================================');
    console.log(`\u2705 Successfully restocked: ${successCount}`);
    console.log(`\u274c Failed: ${errorCount}`);
    console.log(`\ud83d\udce6 Total stock added: ${productsToRestock.reduce((sum, p) => sum + p.stock, 0)} units`);

    await mongoose.connection.close();
    console.log('\n\u2703 Done!');
    process.exit(0);
  } catch (err) {
    console.error('Connection Error:', err.message);
    process.exit(1);
  }
}

restockRemote();
