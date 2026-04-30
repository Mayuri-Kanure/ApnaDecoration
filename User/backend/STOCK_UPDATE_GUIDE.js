#!/usr/bin/env node

/**
 * MONGODB STOCK UPDATE COMMANDS
 * Run these commands in MongoDB Compass or mongo shell when you have internet access
 */

const commands = {
  description: "Stock Update Commands for APNA DECORATION Products",
  database: "apna-decoration",
  collection: "products",
  note: "Replace <YOUR_CONN_STRING> with your MongoDB connection string",
  
  methods: {
    method1_mongoShell: `
    // Open mongo shell with your connection string:
    // mongo "mongodb+srv://ishan:RU4X8Z3bCWxG5dFV@apna-decoration.r8fey.mongodb.net/apna-decoration"
    
    // Then run each command below:
    
    // 1. Glitzy Golden and Black Birthday Decor - 20 units
    db.products.updateOne(
      { _id: ObjectId("6986ed1e36e5a63a6aaaaaf9") },
      { $set: { stock: 20 } }
    );
    
    // 2. Premium Metallic Balloon Set - 15 units
    db.products.updateOne(
      { _id: ObjectId("698f08a2599853dd3ad246d7") },
      { $set: { stock: 15 } }
    );
    
    // 3. new - 10 units
    db.products.updateOne(
      { _id: ObjectId("69aea4202036a18dc0bbc923") },
      { $set: { stock: 10 } }
    );
    
    // 4. Kids Birthday Party Decoration Kit (VendorProduct) - 15 units
    db.vendor_products.updateOne(
      { _id: ObjectId("698f26a1e9a5ae440df23e8b") },
      { $set: { stock: 15 } }
    );
    `,
    
    method2_mongoCompass: `
    // In MongoDB Compass:
    // 1. Connect to: mongodb+srv://ishan:RU4X8Z3bCWxG5dFV@apna-decoration.r8fey.mongodb.net/apna-decoration
    // 2. Select "apna-decoration" database
    // 3. Select "products" collection
    // 4. Click the Edit button (pencil icon) next to each product:
    
    Product 1 (ID: 6986ed1e36e5a63a6aaaaaf9)
    - Find: { "_id": ObjectId("6986ed1e36e5a63a6aaaaaf9") }
    - Update the "stock" field from 0 to 20
    
    Product 2 (ID: 698f08a2599853dd3ad246d7)
    - Find: { "_id": ObjectId("698f08a2599853dd3ad246d7") }
    - Update the "stock" field from 0 to 15
    
    Product 3 (ID: 69aea4202036a18dc0bbc923)
    - Find: { "_id": ObjectId("69aea4202036a18dc0bbc923") }
    - Update the "stock" field from 0 to 10
    
    // Then switch to "vendor_products" collection:
    Product 4 (ID: 698f26a1e9a5ae440df23e8b)
    - Find: { "_id": ObjectId("698f26a1e9a5ae440df23e8b") }
    - Update the "stock" field from 0 to 15
    `,
    
    method3_nodeScript: `
    // Run this from command line in the backend directory:
    // Make sure MongoDB is running (either locally or remote is accessible)
    
    node restockProducts.js
    
    // The script will automatically:
    // - Connect to MongoDB
    // - Update all 4 products with new stock quantities
    // - Show success/failure status
    `,
  },

  products: [
    {
      productId: "6986ed1e36e5a63a6aaaaaf9",
      name: "Glitzy Golden and Black Birthday Decor",
      collection: "products",
      currentStock: 0,
      newStock: 20,
      price: 2999,
      orders: 22
    },
    {
      productId: "698f26a1e9a5ae440df23e8b",
      name: "Kids Birthday Party Decoration Kit",
      collection: "vendor_products",
      currentStock: 0,
      newStock: 15,
      price: 2499,
      orders: 11
    },
    {
      productId: "698f08a2599853dd3ad246d7",
      name: "Premium Metallic Balloon Set – Blue & golden",
      collection: "products",
      currentStock: 0,
      newStock: 15,
      price: 4999,
      orders: 8
    },
    {
      productId: "69aea4202036a18dc0bbc923",
      name: "new",
      collection: "products",
      currentStock: 0,
      newStock: 10,
      price: 4343,
      orders: 2
    }
  ],

  summary: {
    totalProducts: 4,
    totalOldStock: 0,
    totalNewStock: 60,
    affectedOrders: 43,
    potentialRevenue: 14840
  }
};

// Print the guide
console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  STOCK RESTOCK GUIDE FOR APNA DECORATION      ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('📊 PRODUCTS TO RESTOCK:');
console.log('─'.repeat(100));

commands.products.forEach((product, index) => {
  console.log(`\n${index + 1}. ${product.name}`);
  console.log(`   ID: ${product.productId}`);
  console.log(`   Price: ₹${product.price}`);
  console.log(`   Current Stock: ${product.currentStock}`);
  console.log(`   New Stock: ${product.newStock}`);
  console.log(`   Collection: ${product.collection}`);
  console.log(`   Orders: ${product.orders}`);
});

console.log('\n' + '─'.repeat(100));
console.log(`\n📈 SUMMARY:`);
console.log(`   Total products affected: ${commands.summary.totalProducts}`);
console.log(`   New stock being added: ${commands.summary.totalNewStock} units`);
console.log(`   Affected orders: ${commands.summary.totalOldStock} → ${commands.summary.totalNewStock}`);
console.log(`   Potential revenue impact: ₹${commands.summary.potentialRevenue}`);

console.log('\n\n╔════════════════════════════════════════════════╗');
console.log('║  HOW TO UPDATE STOCK - CHOOSE ONE METHOD      ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('\n✅ METHOD 1: Using Mongo Shell (Recommended when internet is back)');
console.log('─'.repeat(100));
console.log(commands.methods.method1_mongoShell);

console.log('\n✅ METHOD 2: Using MongoDB Compass GUI');
console.log('─'.repeat(100));
console.log(commands.methods.method2_mongoCompass);

console.log('\n✅ METHOD 3: Using Node Script');
console.log('─'.repeat(100));
console.log(commands.methods.method3_nodeScript);

console.log('\n' + '═'.repeat(100));
console.log('Next Step: Run one of the above methods when MongoDB connection is available');
console.log('═'.repeat(100) + '\n');
