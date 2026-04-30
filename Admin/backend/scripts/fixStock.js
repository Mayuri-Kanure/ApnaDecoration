const mongoose = require('mongoose');
require('dotenv').config();

// Fix existing vendor products with stock = 0
async function fixStock() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the VendorProduct model
    const VendorProduct = require('../models/VendorProduct');
    
    // Find all products with stock = 0
    const zeroStockProducts = await VendorProduct.find({ stock: 0 });
    console.log(`Found ${zeroStockProducts.length} products with stock = 0`);

    if (zeroStockProducts.length > 0) {
      // Update all zero stock products to have stock = 10
      const result = await VendorProduct.updateMany(
        { stock: 0 },
        { $set: { stock: 10 } }
      );
      
      console.log(`Updated ${result.modifiedCount} products to stock = 10`);
      console.log('Stock fix completed successfully!');
    } else {
      console.log('No products found with stock = 0');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error fixing stock:', error);
    process.exit(1);
  }
}

// Run the fix
fixStock();
