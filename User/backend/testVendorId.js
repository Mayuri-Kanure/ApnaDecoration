const mongoose = require('mongoose');
const VendorProduct = require('./models/VendorProduct');

mongoose.connect('mongodb://localhost:27017/apna-decoration', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    const product = await VendorProduct.findById('6a01699084c9c34f39d2cd59');
    console.log('Product ID 6a01699084c9c34f39d2cd59:');
    console.log('Name:', product?.name);
    console.log('VendorId:', product?.vendorId);
    console.log('Has vendorId:', !!product?.vendorId);
    
    if (product) {
      console.log('Vendor details:');
      console.log('- vendorId exists:', !!product.vendorId);
      console.log('- vendorId value:', product.vendorId);
    } else {
      console.log('Product not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}).catch(error => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});
