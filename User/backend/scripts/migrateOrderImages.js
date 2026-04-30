// MIGRATION SCRIPT: Update existing orders with production-ready image structure
const mongoose = require('mongoose');
require('dotenv').config();

// Models
const { Order, Product, VendorProduct } = require('../models');

async function migrateOrderImages() {
  try {
    console.log('=== ORDER IMAGE MIGRATION START ===');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration');
    console.log('Connected to database');

    // Find all orders that need migration
    const orders = await Order.find({
      $or: [
        { 'items.thumbnail': { $exists: false } },
        { 'items.name': { $exists: false } }
      ]
    });
    
    console.log(`Found ${orders.length} orders that need migration`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        console.log(`\nProcessing order: ${order.orderNumber}`);
        
        let hasUpdates = false;
        const updatedItems = [];

        for (const item of order.items) {
          const updatedItem = { ...item.toObject() };

          // If item doesn't have direct thumbnail, try to get it from productSnapshot or product
          if (!updatedItem.thumbnail) {
            if (updatedItem.productSnapshot?.thumbnail) {
              updatedItem.thumbnail = updatedItem.productSnapshot.thumbnail;
              hasUpdates = true;
            } else if (updatedItem.product?.thumbnail) {
              updatedItem.thumbnail = updatedItem.product.thumbnail;
              hasUpdates = true;
            }
          }

          // If item doesn't have direct name, try to get it from productSnapshot or product
          if (!updatedItem.name) {
            if (updatedItem.productSnapshot?.name) {
              updatedItem.name = updatedItem.productSnapshot.name;
              hasUpdates = true;
            } else if (updatedItem.product?.name) {
              updatedItem.name = updatedItem.product.name;
              hasUpdates = true;
            }
          }

          // If still no thumbnail, try to fetch from product collection
          if (!updatedItem.thumbnail && (updatedItem.productId || updatedItem.product)) {
            const productId = updatedItem.productId || updatedItem.product;
            
            let product = await Product.findById(productId);
            if (!product) {
              product = await VendorProduct.findById(productId);
            }

            if (product && product.thumbnail) {
              updatedItem.thumbnail = product.thumbnail;
              updatedItem.name = updatedItem.name || product.name || product.product_name_en;
              updatedItem.price = updatedItem.price || product.price;
              hasUpdates = true;
              console.log(`  Fetched image from product: ${product.name}`);
            }
          }

          // Ensure all required fields exist
          updatedItem.name = updatedItem.name || 'Product';
          updatedItem.thumbnail = updatedItem.thumbnail || '/images/fallback-product.jpg';
          updatedItem.price = updatedItem.price || updatedItem.unitPrice || 0;

          updatedItems.push(updatedItem);
        }

        // Update order if there are changes
        if (hasUpdates) {
          order.items = updatedItems;
          await order.save();
          updatedCount++;
          console.log(`  Updated order ${order.orderNumber} with image data`);
        } else {
          console.log(`  No updates needed for order ${order.orderNumber}`);
        }

      } catch (itemError) {
        console.error(`  Error processing order ${order.orderNumber}:`, itemError.message);
        errorCount++;
      }
    }

    console.log('\n=== MIGRATION COMPLETE ===');
    console.log(`Total orders processed: ${orders.length}`);
    console.log(`Orders updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);

    // Verify migration
    const remainingOrders = await Order.find({
      $or: [
        { 'items.thumbnail': { $exists: false } },
        { 'items.name': { $exists: false } }
      ]
    });

    console.log(`Orders still needing migration: ${remainingOrders.length}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateOrderImages();
}

module.exports = migrateOrderImages;
