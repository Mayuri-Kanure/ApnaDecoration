/**
 * Service Detection Verification Script
 * 
 * Verifies that the service detection fix was applied correctly
 */

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://kanuremayuri_db_user:Kanuremayurimongodbatlas@highflytravels.qoqccvi.mongodb.net/apna-decoration?retryWrites=true&w=majority';

async function verifyServiceDetection() {
  try {
    console.log('🔍 Verifying Service Detection Fix...\n');
    await mongoose.connect(MONGO_URI);

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Get all products
    const allProducts = await productsCollection.find({}).toArray();

    console.log(`📋 Total Products: ${allProducts.length}\n`);

    console.log('Services (isService: true):');
    const services = await productsCollection.find({ isService: true }).toArray();
    services.forEach(p => {
      console.log(`  ✅ ${p.name} (ID: ${p._id})`);
      console.log(`     Price: ₹${p.price}, Type: ${p.type || 'N/A'}, ServiceType: ${p.serviceType || 'N/A'}`);
    });

    console.log(`\nPhysical Products (isService: false):`);
    const physical = await productsCollection.find({ isService: false }).toArray();
    physical.forEach(p => {
      console.log(`  📦 ${p.name} (ID: ${p._id})`);
      console.log(`     Price: ₹${p.price}, Type: ${p.type || 'N/A'}`);
    });

    console.log(`\nUndetermined (no isService field):`);
    const undetermined = await productsCollection.find({ isService: { $exists: false } }).toArray();
    undetermined.forEach(p => {
      console.log(`  ⚠️  ${p.name} (ID: ${p._id})`);
      console.log(`     Price: ₹${p.price}, Type: ${p.type || 'N/A'}`);
    });

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

verifyServiceDetection();
