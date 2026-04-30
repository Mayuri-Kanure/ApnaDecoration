// CHECK PRODUCTS FOR CLOUDINARY IMAGES AND MIGRATE EXISTING ORDERS
const mongoose = require('mongoose');
require('dotenv').config();

// Models
const { Order, Product, VendorProduct } = require('../models');

async function checkAndMigrateCloudinaryImages() {
  try {
    console.log('=== CHECKING PRODUCTS FOR CLOUDINARY IMAGES ===');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration');
    console.log('Connected to database');

    // Step 1: Check products with Cloudinary images
    console.log('\n--- Step 1: Finding products with Cloudinary images ---');
    
    const productsWithCloudinary = await Product.find({
      $or: [
        { thumbnail: { $regex: /cloudinary/i } },
        { images: { $elemMatch: { $regex: /cloudinary/i } } }
      ]
    }).select('_id name thumbnail images price sku category stock');

    const vendorProductsCloudinary = await VendorProduct.find({
      $or: [
        { thumbnail: { $regex: /cloudinary/i } },
        { images: { $elemMatch: { $regex: /cloudinary/i } } }
      ]
    }).select('_id name thumbnail images price sku category stock product_name_en');

    console.log(`Found ${productsWithCloudinary.length} products with Cloudinary images`);
    console.log(`Found ${vendorProductsCloudinary.length} vendor products with Cloudinary images`);

    // Combine all products with Cloudinary images
    const allCloudinaryProducts = [
      ...productsWithCloudinary.map(p => ({ ...p.toObject(), source: 'Product' })),
      ...vendorProductsCloudinary.map(p => ({ ...p.toObject(), source: 'VendorProduct', name: p.name || p.product_name_en }))
    ];

    if (allCloudinaryProducts.length === 0) {
      console.log('No products found with Cloudinary images');
      return;
    }

    // Display found products
    console.log('\nProducts with Cloudinary images:');
    allCloudinaryProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.product_name_en}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Thumbnail: ${product.thumbnail}`);
      console.log(`   Images: ${product.images?.length || 0} images`);
      console.log(`   Source: ${product.source}`);
      console.log('');
    });

    // Step 2: Find orders that need migration
    console.log('\n--- Step 2: Finding orders that need migration ---');
    
    const ordersNeedingMigration = await Order.find({
      $or: [
        { 'items.thumbnail': { $exists: false } },
        { 'items.name': { $exists: false } },
        { 'items.thumbnail': null },
        { 'items.name': null }
      ]
    });

    console.log(`Found ${ordersNeedingMigration.length} orders needing migration`);

    // Step 3: Migrate orders
    console.log('\n--- Step 3: Migrating orders with Cloudinary images ---');
    
    let migratedCount = 0;
    let errorCount = 0;

    for (const order of ordersNeedingMigration) {
      try {
        console.log(`\nProcessing order: ${order.orderNumber}`);
        
        let hasUpdates = false;
        const updatedItems = [];

        for (const item of order.items) {
          const updatedItem = { ...item.toObject() };

          // Find the product in our Cloudinary products list
          const productId = item.productId || item.product;
          const cloudinaryProduct = allCloudinaryProducts.find(p => p._id.toString() === productId?.toString());

          if (cloudinaryProduct) {
            console.log(`  Found Cloudinary product: ${cloudinaryProduct.name}`);
            
            // Update item with Cloudinary data
            updatedItem.name = cloudinaryProduct.name || cloudinaryProduct.product_name_en || 'Product';
            updatedItem.thumbnail = cloudinaryProduct.thumbnail;
            updatedItem.price = cloudinaryProduct.price || updatedItem.unitPrice || 0;
            updatedItem.sku = cloudinaryProduct.sku;
            updatedItem.description = cloudinaryProduct.description || cloudinaryProduct.product_name_en;
            updatedItem.images = cloudinaryProduct.images || [];
            updatedItem.category = cloudinaryProduct.category;
            updatedItem.stock = cloudinaryProduct.stock;

            // Create productSnapshot for compatibility
            updatedItem.productSnapshot = {
              name: cloudinaryProduct.name || cloudinaryProduct.product_name_en,
              thumbnail: cloudinaryProduct.thumbnail,
              price: cloudinaryProduct.price,
              sku: cloudinaryProduct.sku,
              description: cloudinaryProduct.description || cloudinaryProduct.product_name_en,
              images: cloudinaryProduct.images || [],
              category: cloudinaryProduct.category,
              stock: cloudinaryProduct.stock
            };

            hasUpdates = true;
            console.log(`  Updated with Cloudinary image: ${cloudinaryProduct.thumbnail}`);
          } else {
            console.log(`  No Cloudinary product found for ID: ${productId}`);
            
            // Set fallback values
            updatedItem.name = updatedItem.name || 'Product Not Available';
            updatedItem.thumbnail = updatedItem.thumbnail || '/images/fallback-product.jpg';
            updatedItem.price = updatedItem.price || updatedItem.unitPrice || 0;
          }

          updatedItems.push(updatedItem);
        }

        // Update order if there are changes
        if (hasUpdates) {
          order.items = updatedItems;
          await order.save();
          migratedCount++;
          console.log(`  SUCCESS: Order ${order.orderNumber} migrated with Cloudinary images`);
        } else {
          console.log(`  No updates needed for order ${order.orderNumber}`);
        }

      } catch (itemError) {
        console.error(`  ERROR processing order ${order.orderNumber}:`, itemError.message);
        errorCount++;
      }
    }

    console.log('\n=== MIGRATION COMPLETE ===');
    console.log(`Total orders processed: ${ordersNeedingMigration.length}`);
    console.log(`Orders successfully migrated: ${migratedCount}`);
    console.log(`Errors: ${errorCount}`);

    // Step 4: Verification
    console.log('\n--- Step 4: Verification ---');
    
    const remainingOrders = await Order.find({
      $or: [
        { 'items.thumbnail': { $exists: false } },
        { 'items.name': { $exists: false } }
      ]
    });

    console.log(`Orders still needing migration: ${remainingOrders.length}`);

    if (migratedCount > 0) {
      console.log('\n=== SUCCESS ===');
      console.log(`${migratedCount} orders now have Cloudinary images!`);
      console.log('Users will see real product images instead of placeholders.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
if (require.main === module) {
  checkAndMigrateCloudinaryImages();
}

module.exports = checkAndMigrateCloudinaryImages;
