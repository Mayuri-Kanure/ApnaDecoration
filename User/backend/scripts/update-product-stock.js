#!/usr/bin/env node

/**
 * Script to update product stock
 * Usage: node scripts/update-product-stock.js [productName] [quantity]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const updateProductStock = async () => {
  try {
    await connectDB();

    // Get command line arguments
    const productName = process.argv[2] || 'engagement decoration';
    const quantity = parseInt(process.argv[3], 10) || 100;

    console.log(`\n🔍 Searching for products matching: "${productName}"`);
    console.log(`📦 Setting stock to: ${quantity}\n`);

    // Find products by name (case-insensitive)
    const products = await Product.find({
      name: { $regex: productName, $options: 'i' }
    });

    if (products.length === 0) {
      console.log(`❌ No products found matching "${productName}"`);
      console.log('\n📋 Available products:');
      const allProducts = await Product.find().select('name stock');
      allProducts.forEach(p => {
        console.log(`   - ${p.name} (Stock: ${p.stock})`);
      });
      process.exit(0);
    }

    console.log(`Found ${products.length} product(s):\n`);

    // Update each product
    let updatedCount = 0;
    for (const product of products) {
      const oldStock = product.stock;
      product.stock = quantity;
      
      // Update status based on stock
      if (quantity > 0 && product.status === 'out_of_stock') {
        product.status = 'active';
      } else if (quantity === 0 && product.status !== 'out_of_stock') {
        product.status = 'out_of_stock';
      }

      await product.save();
      updatedCount++;
      console.log(`✅ Updated: "${product.name}"`);
      console.log(`   Old stock: ${oldStock} → New stock: ${product.stock}`);
      console.log(`   Status: ${product.status}\n`);
    }

    console.log(`\n✅ Successfully updated ${updatedCount} product(s)`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating product stock:', error.message);
    process.exit(1);
  }
};

// Run the script
updateProductStock();
