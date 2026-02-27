require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Category = require('../models/Category');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function convertBase64Categories() {
  try {
    console.log('🔗 Connecting to Atlas database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Atlas database');

    // Get all categories with base64 images
    const categories = await Category.find({
      image: { $regex: '^data:image/' }
    });

    console.log(`📊 Found ${categories.length} categories with base64 images`);

    if (categories.length === 0) {
      console.log('✅ No categories need converting');
      return;
    }

    // Convert each category
    for (const category of categories) {
      try {
        console.log(`\n📂 Converting category: ${category.name}`);
        
        // Upload base64 image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(category.image, {
          folder: 'apna-decoration/categories',
          public_id: `${category.name.toLowerCase().replace(/\s+/g, '-')}-${category._id}`,
          resource_type: 'auto'
        });

        console.log(`   ☁️ Uploaded to Cloudinary: ${uploadResult.secure_url}`);

        // Update category with Cloudinary URL
        await Category.findByIdAndUpdate(category._id, {
          image: uploadResult.secure_url
        });

        console.log(`   ✅ Database updated`);

      } catch (error) {
        console.error(`   ❌ Error converting ${category.name}:`, error.message);
      }
    }

    console.log('\n✅ Base64 to Cloudinary conversion completed');

    // Show updated categories
    const updatedCategories = await Category.find({}).limit(10);
    console.log('\n📋 Updated Categories:');
    updatedCategories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.image.substring(0, 80)}...`);
    });

    console.log('\n🔌 Disconnected from Atlas database');

  } catch (error) {
    console.error('❌ Error converting categories:', error.message);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  convertBase64Categories();
}

module.exports = convertBase64Categories;
