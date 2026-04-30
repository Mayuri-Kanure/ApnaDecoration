// MIGRATION SCRIPT - FIX OLD ORDERS WITHOUT PRODUCT SNAPSHOT
// Run this once to fix all existing orders

const mongoose = require('mongoose');
const { Order } = require('../models');
const { Product } = require('../models');
const { VendorProduct } = require('../models');

async function migrateOrderImages() {
  try {
    console.log('=== STARTING ORDER IMAGE MIGRATION ===');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-app');
    console.log('Connected to database');

    // Find all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to process`);

    let migratedOrders = 0;
    let totalItems = 0;

    for (let order of orders) {
      let orderModified = false;
      
      for (let item of order.items) {
        totalItems++;
        
        // Skip if already has productSnapshot
        if (item.productSnapshot) {
          continue;
        }

        console.log(`Processing item ${totalItems} - Order ${order._id}`);
        
        try {
          let product = null;
          const productId = item.product?.toString();
          
          if (!productId) {
            console.log(`No product ID found for item, creating fallback snapshot`);
            // Create fallback snapshot
            item.productSnapshot = {
              name: "Product",
              thumbnail: "https://picsum.photos/seed/product-fallback/64/64.jpg",
              price: item.unitPrice || 0,
            };
            orderModified = true;
            continue;
          }

          // Try to find product
          if (item.productModel === "Product") {
            product = await Product.findById(productId);
          } else if (item.productModel === "VendorProduct") {
            product = await VendorProduct.findById(productId);
          }

          if (product) {
            console.log(`Found product: ${product.name}`);
            // Create proper snapshot
            item.productSnapshot = {
              name: product.name || product.product_name_en || "Product",
              thumbnail: product.thumbnail || "https://picsum.photos/seed/product-" + productId + "/64/64.jpg",
              price: product.price || item.unitPrice || 0,
              sku: product.sku || "",
            };
            orderModified = true;
          } else {
            console.log(`Product not found, creating fallback snapshot`);
            // Create fallback snapshot
            item.productSnapshot = {
              name: "Product",
              thumbnail: "https://picsum.photos/seed/product-missing-" + productId + "/64/64.jpg",
              price: item.unitPrice || 0,
            };
            orderModified = true;
          }
        } catch (error) {
          console.error(`Error processing item:`, error);
          // Create error fallback
          item.productSnapshot = {
            name: "Product Error",
            thumbnail: "https://picsum.photos/seed/product-error/64/64.jpg",
            price: item.unitPrice || 0,
          };
          orderModified = true;
        }
      }

      // Save order if modified
      if (orderModified) {
        await order.save();
        migratedOrders++;
        console.log(`Saved order: ${order._id}`);
      }
    }

    console.log('\n=== MIGRATION COMPLETE ===');
    console.log(`Orders processed: ${orders.length}`);
    console.log(`Items processed: ${totalItems}`);
    console.log(`Orders migrated: ${migratedOrders}`);
    console.log('All orders now have productSnapshot for reliable images!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run migration
migrateOrderImages();
