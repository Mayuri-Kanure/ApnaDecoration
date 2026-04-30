const mongoose = require('mongoose');
const { Product, VendorProduct } = require('./models');

async function verifyStock() {
  try {
    await mongoose.connect('mongodb://localhost:27017/apna-decoration');
    
    const products = await Product.find({ 
      _id: { $in: ['6986ed1e36e5a63a6aaaaaf9', '698f08a2599853dd3ad246d7', '69aea4202036a18dc0bbc923'] }
    }).select('name stock price');
    
    const vendorProducts = await VendorProduct.find({ 
      _id: '698f26a1e9a5ae440df23e8b'
    }).select('name stock price');
    
    console.log('✅ STOCK VERIFICATION REPORT\n');
    
    if (products.length > 0) {
      console.log('📦 PRODUCTS (Regular):');
      products.forEach(p => {
        const status = p.stock > 10 ? '✅' : p.stock > 0 ? '⚠️' : '❌';
        console.log(`  ${status} ${p.name}: ${p.stock} units (₹${p.price})`);
      });
    }
    
    if (vendorProducts.length > 0) {
      console.log('\n📦 PRODUCTS (Vendor):');
      vendorProducts.forEach(p => {
        const status = p.stock > 10 ? '✅' : p.stock > 0 ? '⚠️' : '❌';
        console.log(`  ${status} ${p.name}: ${p.stock} units (₹${p.price})`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

verifyStock();
