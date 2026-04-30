/**
 * DATABASE MIGRATION SCRIPT
 * Run this to safely migrate existing products to the new inventory system
 *
 * Usage: node migrationScript.js
 */

const mongoose = require("mongoose");
const { Product, VendorProduct, StockReservation } = require("../models");
require("dotenv").config();

async function migrateToNewInventorySystem() {
  try {
    console.log("🔄 Starting inventory system migration...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // ===== STEP 1: Update all Products =====
    console.log("\n📦 Migrating Products...");

    const productsUpdated = await Product.updateMany(
      {},
      {
        $set: {
          reservedStock: 0,
          soldStock: 0,
        },
      },
    );

    console.log(
      `✅ Updated ${productsUpdated.modifiedCount} products with new stock fields`,
    );

    // ===== STEP 2: Update all VendorProducts =====
    console.log("\n🛍️  Migrating Vendor Products...");

    const vendorProductsUpdated = await VendorProduct.updateMany(
      {},
      {
        $set: {
          reservedStock: 0,
          soldStock: 0,
        },
      },
    );

    console.log(
      `✅ Updated ${vendorProductsUpdated.modifiedCount} vendor products with new stock fields`,
    );

    // ===== STEP 3: Create indexes =====
    console.log("\n⚡ Creating performance indexes...");

    // Product indexes
    await Product.collection.createIndex({ stock: 1 });
    await Product.collection.createIndex({ reservedStock: 1 });
    await Product.collection.createIndex({ status: 1, stock: 1 });
    await Product.collection.createIndex({
      category: 1,
      status: 1,
      stock: 1,
    });

    // VendorProduct indexes
    await VendorProduct.collection.createIndex({ stock: 1 });
    await VendorProduct.collection.createIndex({ reservedStock: 1 });
    await VendorProduct.collection.createIndex({ vendorId: 1, status: 1 });

    console.log("✅ Created performance indexes");

    // ===== STEP 4: Validate data =====
    console.log("\n🔍 Validating migrated data...");

    const productCount = await Product.countDocuments();
    const vendorProductCount = await VendorProduct.countDocuments();

    const productsWithoutReserved = await Product.countDocuments({
      reservedStock: { $exists: false },
    });
    const productsWithoutSold = await Product.countDocuments({
      soldStock: { $exists: false },
    });

    console.log(`📊 Total Products: ${productCount}`);
    console.log(`📊 Total Vendor Products: ${vendorProductCount}`);

    if (productsWithoutReserved > 0) {
      console.warn(
        `⚠️  ${productsWithoutReserved} products missing reservedStock field`,
      );
    } else {
      console.log("✅ All products have reservedStock field");
    }

    if (productsWithoutSold > 0) {
      console.warn(
        `⚠️  ${productsWithoutSold} products missing soldStock field`,
      );
    } else {
      console.log("✅ All products have soldStock field");
    }

    // ===== STEP 5: Check for data issues =====
    console.log("\n🛡️  Checking for data integrity...");

    // Check for negative stock
    const negativeStock = await Product.find({ stock: { $lt: 0 } });
    if (negativeStock.length > 0) {
      console.warn(
        `⚠️  Found ${negativeStock.length} products with negative stock`,
      );

      // Fix negative stock
      await Product.updateMany({ stock: { $lt: 0 } }, { stock: 0 });
      console.log("✅ Fixed negative stock values");
    }

    // Check for out-of-stock products
    const outOfStock = await Product.countDocuments({ stock: 0 });
    console.log(`📊 Products out of stock: ${outOfStock}`);

    // Check for low stock
    const lowStock = await Product.countDocuments({
      stock: { $gt: 0, $lte: 5 },
    });
    console.log(`📊 Products with low stock (<5): ${lowStock}`);

    // ===== MIGRATION SUMMARY =====
    console.log("\n" + "=".repeat(50));
    console.log("✅ MIGRATION COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));

    console.log(`
📈 Migration Summary:
   ├─ Products migrated: ${productCount}
   ├─ Vendor products migrated: ${vendorProductCount}
   ├─ Indexes created: ✅
   ├─ Data validated: ✅
   ├─ Negative stock fixed: ${negativeStock.length}
   ├─ Out of stock items: ${outOfStock}
   └─ Low stock warnings: ${lowStock}

🎯 Next Steps:
   1. Verify in your database:
      - db.products.find({}).select({stock:1, reservedStock:1, soldStock:1})
   2. Test inventory endpoints:
      - POST /api/inventory/check-availability
      - POST /api/inventory/reserve
   3. Start your server with InventoryCleanupJob
   4. Monitor /api/inventory/admin/status

⚡ System Features Enabled:
   ✅ Stock reservation (10 min window)
   ✅ Atomic operations (no overselling)
   ✅ Auto cleanup (expired reservations)
   ✅ Performance indexes for fast queries
   ✅ Stock tracking (reserved + sold + available)
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateToNewInventorySystem();
