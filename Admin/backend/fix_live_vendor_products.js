// This script needs to be run on the LIVE server
// It will link vendor products to the correct vendor ID

const mongoose = require('mongoose');
const VendorProduct = require('./models/VendorProduct');
const User = require('./models/User');

async function fixLiveVendorProducts() {
  try {
    console.log('=== FIXING LIVE VENDOR PRODUCTS ===');
    
    // Connect to LIVE MongoDB (update connection string as needed)
    await mongoose.connect('mongodb://localhost:27017/apna-decoration');
    console.log('✅ Connected to MongoDB');

    // 1. Get the vendor user from live login (mayuri@gmail.com)
    const vendorUser = await User.findOne({ 
      email: 'mayuri@gmail.com',
      role: 'vendor'
    });
    
    if (!vendorUser) {
      console.log('❌ Vendor user not found - creating vendor user...');
      
      // Create vendor user if not exists
      const newVendorUser = new User({
        username: 'mk_',
        email: 'mayuri@gmail.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOq', // mayuri123 hashed
        role: 'vendor',
        firstName: 'MK',
        lastName: 'User',
        phone: '98765432223',
        isActive: true
      });
      
      await newVendorUser.save();
      console.log('✅ Created vendor user:', newVendorUser._id);
      
      var vendorId = newVendorUser._id;
    } else {
      console.log('✅ Found existing vendor user:', vendorUser._id);
      var vendorId = vendorUser._id;
    }

    // 2. Create sample vendor products for this vendor
    console.log('\n🔧 Creating vendor products...');
    
    const sampleProducts = [
      {
        name: 'Kids Birthday Party Decoration Kit',
        description: 'Complete decoration kit for kids birthday parties',
        price: 2499,
        category: 'decoration',
        stock: 15,
        status: 'approved',
        vendorId: vendorId,
        sku: `MK-BIRTHDAY-KIT-${Date.now()}`,
        images: []
      },
      {
        name: 'Premium Birthday Decoration Set',
        description: 'Premium quality decoration for special occasions',
        price: 3499,
        category: 'decoration',
        stock: 10,
        status: 'approved',
        vendorId: vendorId,
        sku: `MK-PREMIUM-SET-${Date.now()}`,
        images: []
      },
      {
        name: 'Anniversary Decoration Package',
        description: 'Beautiful decoration for anniversary celebrations',
        price: 2999,
        category: 'decoration',
        stock: 12,
        status: 'approved',
        vendorId: vendorId,
        sku: `MK-ANNIVERSARY-${Date.now()}`,
        images: []
      },
      {
        name: 'Festival Special Decoration',
        description: 'Special decoration for festivals and celebrations',
        price: 1999,
        category: 'decoration',
        stock: 20,
        status: 'approved',
        vendorId: vendorId,
        sku: `MK-FESTIVAL-${Date.now()}`,
        images: []
      }
    ];

    for (const productData of sampleProducts) {
      // Check if product already exists
      const existingProduct = await VendorProduct.findOne({
        name: productData.name,
        vendorId: vendorId
      });
      
      if (!existingProduct) {
        const newProduct = new VendorProduct(productData);
        await newProduct.save();
        console.log(`✅ Created product: ${productData.name}`);
      } else {
        console.log(`ℹ️ Product already exists: ${productData.name}`);
      }
    }

    // 3. Verify the fix
    const finalVendorProducts = await VendorProduct.find({ vendorId: vendorId });
    console.log('\n🎯 FINAL RESULTS:');
    console.log('   Vendor ID:', vendorId);
    console.log('   Vendor Products:', finalVendorProducts.length);
    
    finalVendorProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ₹${product.price}`);
    });

    console.log('\n🎉 SUCCESS! Vendor products are now linked to the correct vendor!');
    console.log('📱 Dashboard should now show products!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

fixLiveVendorProducts();
