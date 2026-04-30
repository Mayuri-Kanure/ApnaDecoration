const mongoose = require('mongoose');
require('dotenv').config();

// Import the ServiceCategory model
const ServiceCategory = require('./models/ServiceCategory');

async function countServiceCategories() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Count all service categories
    const totalCount = await ServiceCategory.countDocuments();
    console.log(`📊 Total Service Categories: ${totalCount}`);

    // Count active service categories
    const activeCount = await ServiceCategory.countDocuments({ status: 'active' });
    console.log(`✅ Active Service Categories: ${activeCount}`);

    // Count inactive service categories
    const inactiveCount = await ServiceCategory.countDocuments({ status: 'inactive' });
    console.log(`❌ Inactive Service Categories: ${inactiveCount}`);

    // Count home category service categories
    const homeCategoryCount = await ServiceCategory.countDocuments({ homeCategory: true });
    console.log(`🏠 Home Category Service Categories: ${homeCategoryCount}`);

    // Count active home categories (what the frontend API calls)
    const activeHomeCategories = await ServiceCategory.countDocuments({ 
      homeCategory: true, 
      status: 'active' 
    });
    console.log(`🏠✅ Active Home Categories: ${activeHomeCategories}`);

    // Get all service categories details
    const allCategories = await ServiceCategory.find({})
      .select('name status homeCategory priority order')
      .sort({ priority: 1, order: 1 });
    
    console.log('\n📋 All Service Categories:');
    allCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   Status: ${category.status}`);
      console.log(`   Home Category: ${category.homeCategory}`);
      console.log(`   Priority: ${category.priority}`);
      console.log(`   Order: ${category.order}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

countServiceCategories();
