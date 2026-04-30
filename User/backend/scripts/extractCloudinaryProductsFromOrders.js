// EXTRACT CLOUDINARY PRODUCT INFORMATION FROM ORDERS
const mongoose = require('mongoose');
require('dotenv').config();

// Models
const { Order, Product, VendorProduct } = require('../models');

async function extractCloudinaryProductsFromOrders() {
  try {
    console.log('=== EXTRACTING CLOUDINARY PRODUCTS FROM ORDERS ===');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration');
    console.log('Connected to database');

    // Step 1: Find all orders with Cloudinary images
    console.log('\n--- Step 1: Finding orders with Cloudinary images ---');
    
    const ordersWithCloudinary = await Order.find({
      $or: [
        { 'items.productSnapshot.thumbnail': { $regex: /cloudinary/i } },
        { 'items.thumbnail': { $regex: /cloudinary/i } },
        { 'items.productSnapshot.images': { $elemMatch: { $regex: /cloudinary/i } } },
        { 'items.images': { $elemMatch: { $regex: /cloudinary/i } } }
      ]
    }).select('orderNumber items createdAt user status');

    console.log(`Found ${ordersWithCloudinary.length} orders with Cloudinary images`);

    if (ordersWithCloudinary.length === 0) {
      console.log('No orders found with Cloudinary images');
      return;
    }

    // Step 2: Extract unique product information
    console.log('\n--- Step 2: Extracting unique product information ---');
    
    const uniqueProducts = new Map();
    const productOrderCounts = new Map();
    const totalCloudinaryItems = [];

    for (const order of ordersWithCloudinary) {
      console.log(`\nProcessing order: ${order.orderNumber}`);
      
      for (const item of order.items) {
        // Check if item has Cloudinary images
        const hasCloudinaryImage = 
          (item.productSnapshot?.thumbnail && item.productSnapshot.thumbnail.includes('cloudinary')) ||
          (item.thumbnail && item.thumbnail.includes('cloudinary')) ||
          (item.productSnapshot?.images && item.productSnapshot.images.some(img => img.includes('cloudinary'))) ||
          (item.images && item.images.some(img => img.includes('cloudinary')));

        if (hasCloudinaryImage) {
          const productId = item.productId || item.product;
          const productKey = productId ? productId.toString() : `fallback-${item.name || 'unknown'}`;
          
          // Extract product data
          const productData = {
            productId: productId,
            name: item.name || item.productSnapshot?.name || 'Unknown Product',
            thumbnail: item.thumbnail || item.productSnapshot?.thumbnail,
            images: item.images || item.productSnapshot?.images || [],
            price: item.unitPrice || item.productSnapshot?.price || 0,
            sku: item.sku || item.productSnapshot?.sku || 'N/A',
            description: item.description || item.productSnapshot?.description || '',
            category: item.category || item.productSnapshot?.category || 'Unknown',
            stock: item.stock || item.productSnapshot?.stock || 0,
            productModel: item.productModel || 'Unknown'
          };

          // Store unique product
          if (!uniqueProducts.has(productKey)) {
            uniqueProducts.set(productKey, productData);
            productOrderCounts.set(productKey, 0);
          }
          
          // Increment order count
          productOrderCounts.set(productKey, productOrderCounts.get(productKey) + 1);
          
          // Store item for detailed analysis
          totalCloudinaryItems.push({
            orderNumber: order.orderNumber,
            orderDate: order.createdAt,
            orderStatus: order.status,
            userId: order.user,
            productData: productData,
            quantity: item.quantity,
            totalPrice: item.totalPrice
          });
        }
      }
    }

    // Step 3: Display results
    console.log('\n--- Step 3: Results Summary ---');
    console.log(`Total unique products with Cloudinary images: ${uniqueProducts.size}`);
    console.log(`Total Cloudinary items across all orders: ${totalCloudinaryItems.length}`);

    // Display unique products
    console.log('\n=== UNIQUE PRODUCTS WITH CLOUDINARY IMAGES ===');
    let productIndex = 1;
    for (const [productKey, product] of uniqueProducts) {
      const orderCount = productOrderCounts.get(productKey);
      console.log(`\n${productIndex}. ${product.name}`);
      console.log(`   Product ID: ${product.productId || 'N/A'}`);
      console.log(`   Model: ${product.productModel}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: ${product.price}`);
      console.log(`   Orders: ${orderCount}`);
      console.log(`   Thumbnail: ${product.thumbnail}`);
      console.log(`   Images: ${product.images.length} images`);
      
      if (product.images.length > 0) {
        console.log(`   Image URLs:`);
        product.images.forEach((img, idx) => {
          console.log(`     ${idx + 1}. ${img}`);
        });
      }
      
      productIndex++;
    }

    // Step 4: Create summary by category
    console.log('\n--- Step 4: Category Summary ---');
    const categoryStats = new Map();
    
    for (const [productKey, product] of uniqueProducts) {
      const category = product.category;
      if (!categoryStats.has(category)) {
        categoryStats.set(category, {
          productCount: 0,
          totalOrders: 0,
          totalRevenue: 0
        });
      }
      
      const stats = categoryStats.get(category);
      stats.productCount += 1;
      stats.totalOrders += productOrderCounts.get(productKey);
      
      // Calculate revenue from this product
      const productRevenue = totalCloudinaryItems
        .filter(item => item.productData.productId === product.productId)
        .reduce((sum, item) => sum + item.totalPrice, 0);
      stats.totalRevenue += productRevenue;
    }

    console.log('\n=== PRODUCTS BY CATEGORY ===');
    for (const [category, stats] of categoryStats) {
      console.log(`\n${category}:`);
      console.log(`   Products: ${stats.productCount}`);
      console.log(`   Total Orders: ${stats.totalOrders}`);
      console.log(`   Total Revenue: ${stats.totalRevenue}`);
    }

    // Step 5: Export data
    console.log('\n--- Step 5: Export Options ---');
    
    const exportData = {
      summary: {
        totalUniqueProducts: uniqueProducts.size,
        totalCloudinaryItems: totalCloudinaryItems.length,
        totalCategories: categoryStats.size
      },
      products: Array.from(uniqueProducts.values()).map(product => ({
        ...product,
        orderCount: productOrderCounts.get(product.productId ? product.productId.toString() : `fallback-${product.name}`)
      })),
      categories: Array.from(categoryStats.entries()).map(([category, stats]) => ({
        category,
        ...stats
      })),
      allItems: totalCloudinaryItems
    };

    // Save to file
    const fs = require('fs');
    const outputPath = './cloudinary-products-from-orders.json';
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`\nData exported to: ${outputPath}`);

    // Step 6: Find missing products in database
    console.log('\n--- Step 6: Checking product database availability ---');
    
    const missingInDatabase = [];
    const foundInDatabase = [];
    
    for (const [productKey, product] of uniqueProducts) {
      if (product.productId) {
        // Check in Product model
        const productDoc = await Product.findById(product.productId);
        // Check in VendorProduct model
        const vendorProductDoc = await VendorProduct.findById(product.productId);
        
        if (productDoc || vendorProductDoc) {
          foundInDatabase.push({
            productId: product.productId,
            name: product.name,
            foundIn: productDoc ? 'Product' : 'VendorProduct'
          });
        } else {
          missingInDatabase.push({
            productId: product.productId,
            name: product.name,
            thumbnail: product.thumbnail
          });
        }
      }
    }
    
    console.log(`\nProducts found in database: ${foundInDatabase.length}`);
    console.log(`Products missing from database: ${missingInDatabase.length}`);
    
    if (missingInDatabase.length > 0) {
      console.log('\n=== MISSING PRODUCTS ===');
      missingInDatabase.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.productId})`);
        console.log(`   Thumbnail: ${product.thumbnail}`);
      });
    }

    console.log('\n=== EXTRACTION COMPLETE ===');
    console.log(`Successfully extracted Cloudinary product information from ${ordersWithCloudinary.length} orders`);

  } catch (error) {
    console.error('Extraction failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run extraction
if (require.main === module) {
  extractCloudinaryProductsFromOrders();
}

module.exports = extractCloudinaryProductsFromOrders;
