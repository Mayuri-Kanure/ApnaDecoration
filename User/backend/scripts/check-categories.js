require('dotenv').config();
const mongoose = require('mongoose');

async function checkCategories() {
  try {
    console.log('🔗 Connecting to Atlas database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Atlas database');

    // Import models
    const { Category } = require('../models');

    // Check categories
    const categories = await Category.find({}).limit(10);
    console.log(`\n📊 Found ${categories.length} categories:`);

    categories.forEach((category, index) => {
      console.log(`\n📂 Category ${index + 1}:`);
      console.log(`   Name: ${category.name}`);
      console.log(`   Image: ${category.image}`);
      console.log(`   Status: ${category.status}`);
      console.log(`   Home Category: ${category.homeCategory}`);
    });

    // Check if images are local paths
    const localImageCategories = categories.filter(cat => 
      cat.image && !cat.image.startsWith('http') && cat.image.startsWith('/uploads')
    );
    
    console.log(`\n📁 Categories with local image paths: ${localImageCategories.length}`);
    localImageCategories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.image}`);
    });

    // Check Cloudinary images
    const cloudinaryCategories = categories.filter(cat => 
      cat.image && cat.image.includes('cloudinary')
    );
    
    console.log(`\n☁️ Categories with Cloudinary images: ${cloudinaryCategories.length}`);
    cloudinaryCategories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.image}`);
    });

    console.log('\n🔌 Disconnected from Atlas database');

  } catch (error) {
    console.error('❌ Error checking categories:', error.message);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  checkCategories();
}

module.exports = checkCategories;
