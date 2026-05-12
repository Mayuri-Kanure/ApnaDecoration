const mongoose = require('mongoose');
const VendorProduct = require('./models/VendorProduct');
const User = require('./models/User');

async function checkVendorProductsLive() {
  try {
    console.log('=== CHECKING VENDOR PRODUCTS FOR LIVE USER ===');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/apna-decoration');
    console.log('✅ Connected to MongoDB');

    // 1. Get the vendor user from live login
    const vendorUser = await User.findOne({ 
      email: 'mayuri@gmail.com',
      role: 'vendor'
    });
    
    if (!vendorUser) {
      console.log('❌ Vendor user not found');
      return;
    }
    
    console.log('✅ Vendor User Found:');
    console.log('   ID:', vendorUser._id);
    console.log('   Email:', vendorUser.email);
    console.log('   Username:', vendorUser.username);
    console.log('   Role:', vendorUser.role);

    // 2. Check vendor products with this vendor ID
    const vendorProducts = await VendorProduct.find({ vendorId: vendorUser._id });
    console.log('\n✅ Vendor Products Found:', vendorProducts.length);
    
    if (vendorProducts.length === 0) {
      console.log('❌ No vendor products found for this vendor');
      
      // Check all vendor products to see what vendor IDs they have
      const allVendorProducts = await VendorProduct.find({});
      console.log('\n📊 All Vendor Products:', allVendorProducts.length);
      
      allVendorProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log('      Vendor ID:', product.vendorId);
        console.log('      Status:', product.status);
      });
      
    } else {
      console.log('📦 Vendor Products:');
      vendorProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log('      ID:', product._id);
        console.log('      Price:', product.price);
        console.log('      Status:', product.status);
      });
    }

    // 3. Check if there are any vendor products with string ObjectId vs ObjectId
    const stringVendorId = vendorUser._id.toString();
    const productsWithStringId = await VendorProduct.find({ vendorId: stringVendorId });
    console.log('\n🔍 Products with string vendorId:', productsWithStringId.length);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

checkVendorProductsLive();
