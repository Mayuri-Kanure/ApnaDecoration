const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Banner } = require('../models');

async function checkBanners() {
  try {
    console.log('🔗 Connecting to Atlas database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Atlas database');

    // Check all banners
    const banners = await Banner.find({});
    console.log(`\n📊 Found ${banners.length} banners:`);

    banners.forEach((banner, index) => {
      console.log(`\n🎨 Banner ${index + 1}:`);
      console.log(`   ID: ${banner._id}`);
      console.log(`   Title: ${banner.title}`);
      console.log(`   Image: ${banner.image}`);
      console.log(`   Status: ${banner.status}`);
      console.log(`   Order: ${banner.order}`);
    });

    // Check if banner files exist
    const fs = require('fs');
    const path = require('path');
    
    console.log('\n📁 Checking banner files in uploads directory:');
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const bannersDir = path.join(uploadsDir, 'banners');
    
    if (fs.existsSync(bannersDir)) {
      const bannerFiles = fs.readdirSync(bannersDir);
      console.log(`   Banners directory exists with ${bannerFiles.length} files:`);
      bannerFiles.forEach(file => {
        console.log(`     - ${file}`);
      });
    } else {
      console.log('   ❌ Banners directory does not exist');
    }

    // Check root uploads for banner files
    const allFiles = fs.readdirSync(uploadsDir);
    const bannerRelatedFiles = allFiles.filter(file => file.toLowerCase().includes('banner'));
    console.log(`\n📁 Banner-related files in root uploads (${bannerRelatedFiles.length}):`);
    bannerRelatedFiles.forEach(file => {
      console.log(`     - ${file}`);
    });

    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from Atlas database');

  } catch (error) {
    console.error('❌ Error checking banners:', error.message);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  checkBanners();
}

module.exports = checkBanners;
