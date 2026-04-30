/**
 * VERIFY STOCK FIELDS
 * Check database for proper stock field structure
 */

const mongoose = require('mongoose');
const { Product, VendorProduct } = require('../models');
require('dotenv').config();

async function verifyStockFields() {
  try {
    console.log('🔍 Verifying stock field structure...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Products
    console.log('📦 Checking Products...');
    const products = await Product.find({}).select('stock reservedStock soldStock name').limit(5);
    
    console.log('Sample Products:');
    products.forEach(product => {
      console.log(`  ${product.name}:`);
      console.log(`    stock: ${product.stock} (type: ${typeof product.stock})`);
      console.log(`    reservedStock: ${product.reservedStock} (type: ${typeof product.reservedStock})`);
      console.log(`    soldStock: ${product.soldStock} (type: ${typeof product.soldStock})`);
      console.log(`    availableStock: ${product.stock - (product.reservedStock || 0)}`);
      console.log('');
    });

    // Check VendorProducts
    console.log('🛍️ Checking Vendor Products...');
    const vendorProducts = await VendorProduct.find({}).select('stock reservedStock soldStock name').limit(5);
    
    console.log('Sample Vendor Products:');
    vendorProducts.forEach(product => {
      console.log(`  ${product.name}:`);
      console.log(`    stock: ${product.stock} (type: ${typeof product.stock})`);
      console.log(`    reservedStock: ${product.reservedStock} (type: ${typeof product.reservedStock})`);
      console.log(`    soldStock: ${product.soldStock} (type: ${typeof product.soldStock})`);
      console.log(`    availableStock: ${product.stock - (product.reservedStock || 0)}`);
      console.log('');
    });

    // Check for any invalid stock values
    console.log('🔍 Checking for invalid stock values...');
    
    const invalidProducts = await Product.find({
      $or: [
        { stock: { $type: 'string' } },
        { stock: null },
        { stock: { $lt: 0 } },
        { reservedStock: { $type: 'string' } },
        { reservedStock: null },
        { reservedStock: { $lt: 0 } },
        { soldStock: { $type: 'string' } },
        { soldStock: null },
        { soldStock: { $lt: 0 } }
      ]
    });

    const invalidVendorProducts = await VendorProduct.find({
      $or: [
        { stock: { $type: 'string' } },
        { stock: null },
        { stock: { $lt: 0 } },
        { reservedStock: { $type: 'string' } },
        { reservedStock: null },
        { reservedStock: { $lt: 0 } },
        { soldStock: { $type: 'string' } },
        { soldStock: null },
        { soldStock: { $lt: 0 } }
      ]
    });

    console.log(`\n📊 SUMMARY:`);
    console.log(`  Products checked: ${products.length}`);
    console.log(`  Vendor Products checked: ${vendorProducts.length}`);
    console.log(`  Invalid Products: ${invalidProducts.length}`);
    console.log(`  Invalid Vendor Products: ${invalidVendorProducts.length}`);

    if (invalidProducts.length > 0) {
      console.log('\n❌ Invalid Products found:');
      invalidProducts.forEach(product => {
        console.log(`  ${product.name}: stock=${product.stock}, reserved=${product.reservedStock}, sold=${product.soldStock}`);
      });
    }

    if (invalidVendorProducts.length > 0) {
      console.log('\n❌ Invalid Vendor Products found:');
      invalidVendorProducts.forEach(product => {
        console.log(`  ${product.name}: stock=${product.stock}, reserved=${product.reservedStock}, sold=${product.soldStock}`);
      });
    }

    if (invalidProducts.length === 0 && invalidVendorProducts.length === 0) {
      console.log('\n✅ All stock fields are properly structured!');
      console.log('✅ No invalid stock values found!');
      console.log('✅ Database is ready for production!');
    }

    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');

  } catch (error) {
    console.error('❌ Verification error:', error);
    process.exit(1);
  }
}

verifyStockFields();
