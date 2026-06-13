/**
 * MongoDB Service Detection Fix Migration
 * 
 * This script updates all service documents in the MongoDB database to ensure they have
 * the proper isService flag set correctly.
 * 
 * Usage:
 * 1. Update the MONGO_URI and DB_NAME at the top of this file
 * 2. Run: node fix-service-detection.js
 * 
 * What it does:
 * - Marks all decoration/event/celebration items as services (isService: true, type: "service")
 * - Ensures physical products have isService: false
 * - Adds serviceType field to service items for additional detection
 */

const mongoose = require('mongoose');

// ====== CONFIGURATION ======
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://kanuremayuri_db_user:Kanuremayurimongodbatlas@highflytravels.qoqccvi.mongodb.net/apna-decoration?retryWrites=true&w=majority';
const DB_NAME = 'apna-decoration';

// ====== SERVICE KEYWORDS ======
// Any product matching these keywords will be marked as a service
const SERVICE_KEYWORDS = [
  'decor', 'decoration', 'wedding', 'birthday', 'anniversary', 'proposal',
  'event', 'stage', 'setup', 'arrangement', 'party', 'celebration',
  'engagement', 'ceremony', 'package', 'experience', 'service'
];

// ====== PHYSICAL PRODUCT KEYWORDS ======
// Any product matching these keywords will be marked as NOT a service
const PHYSICAL_KEYWORDS = [
  'balloon', 'confetti', 'banner', 'balloon set', 'kit', 'lights', 'garland',
  'backdrop', 'prop', 'item', 'product', 'item', 'supplies'
];

/**
 * Check if product name indicates it's a service
 */
const isServiceByName = (name) => {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  return SERVICE_KEYWORDS.some(keyword => lowerName.includes(keyword));
};

/**
 * Check if product name indicates it's a physical product
 */
const isPhysicalByName = (name) => {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  return PHYSICAL_KEYWORDS.some(keyword => lowerName.includes(keyword));
};

/**
 * Main migration function
 */
async function fixServiceDetection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    console.log('\n📊 Analyzing products collection...');
    
    // Get all products
    const allProducts = await productsCollection.find({}).toArray();
    console.log(`Found ${allProducts.length} total products`);

    let servicesMarked = 0;
    let physicalMarked = 0;
    let updated = 0;

    // Process each product
    for (const product of allProducts) {
      const isService = isServiceByName(product.name);
      const isPhysical = isPhysicalByName(product.name);

      let updateObj = {};
      let shouldUpdate = false;

      if (isService) {
        // Mark as service
        if (product.isService !== true || product.type !== 'service') {
          updateObj = {
            $set: {
              isService: true,
              type: 'service',
              serviceType: 'decoration' // Default service type
            }
          };
          shouldUpdate = true;
          servicesMarked++;
        }
      } else if (isPhysical) {
        // Mark as physical product
        if (product.isService !== false || product.type !== 'product') {
          updateObj = {
            $set: {
              isService: false,
              type: 'product'
            },
            $unset: {
              serviceType: ''
            }
          };
          shouldUpdate = true;
          physicalMarked++;
        }
      }

      if (shouldUpdate) {
        await productsCollection.updateOne(
          { _id: product._id },
          updateObj
        );
        console.log(`✅ Updated: ${product.name}`);
        updated++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`- Services marked: ${servicesMarked}`);
    console.log(`- Physical products marked: ${physicalMarked}`);
    console.log(`- Total updated: ${updated}`);

    // Verify the update
    console.log('\n🔍 Verification - Checking marked services...');
    const servicesCount = await productsCollection.countDocuments({
      isService: true
    });
    const physicalCount = await productsCollection.countDocuments({
      isService: false
    });

    console.log(`- Documents with isService: true = ${servicesCount}`);
    console.log(`- Documents with isService: false = ${physicalCount}`);
    console.log(`- Documents with no isService field = ${allProducts.length - servicesCount - physicalCount}`);

    // Sample some updated services
    console.log('\n📋 Sample of marked services:');
    const samples = await productsCollection
      .find({ isService: true })
      .limit(5)
      .toArray();
    samples.forEach(s => {
      console.log(`  • ${s.name} (ID: ${s._id})`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Verify the changes in MongoDB Atlas');
    console.log('2. Restart your User/Admin backend servers');
    console.log('3. Clear browser cache (products may be cached)');
    console.log('4. Test product/service routing on frontend');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// ====== RUN MIGRATION ======
console.log('🚀 Starting Service Detection Fix Migration...\n');
fixServiceDetection();
