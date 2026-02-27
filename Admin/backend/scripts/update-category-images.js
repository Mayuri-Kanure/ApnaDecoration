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

async function updateCategoryImages() {
  try {
    console.log('🔗 Connecting to Atlas database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Atlas database');

    // Get all categories with local image paths
    const categories = await Category.find({
      image: { $regex: '^/uploads/categories/' }
    });

    console.log(`📊 Found ${categories.length} categories with local image paths`);

    if (categories.length === 0) {
      console.log('✅ No categories need updating');
      return;
    }

    // Default category images (using placeholder service)
    const defaultImages = {
      'Home Decoration': 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770978951/apna-decoration/categories/home-decoration.jpg',
      'Office Decoration': 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770978951/apna-decoration/categories/office-decoration.jpg',
      'Event Decoration': 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770978951/apna-decoration/categories/event-decoration.jpg',
      'Wall Art': 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770978951/apna-decoration/categories/wall-art.jpg',
      'Lighting': 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770978951/apna-decoration/categories/lighting.jpg',
      'Furniture': 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770978951/apna-decoration/categories/furniture.jpg'
    };

    // Update each category
    for (const category of categories) {
      try {
        console.log(`\n📂 Updating category: ${category.name}`);
        console.log(`   Current image: ${category.image}`);

        // Get the Cloudinary URL for this category
        const cloudinaryUrl = defaultImages[category.name];
        
        if (cloudinaryUrl) {
          // Update the category with Cloudinary URL
          await Category.findByIdAndUpdate(category._id, {
            image: cloudinaryUrl
          });

          console.log(`   ✅ Updated to: ${cloudinaryUrl}`);
        } else {
          console.log(`   ⚠️ No default image found for ${category.name}`);
          
          // Upload a generic placeholder
          const placeholderResult = await cloudinary.uploader.upload(
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiPjwvdGV4dD4KPHN2ZyB4PSIxNTAiIHk9IjE1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM2MzY2RjEiPgo8cmVjdCB4PSIxNjAiIHk9IjE2MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iNCIgZmlsbD0iI0ZGRkZGRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzYzNjZGMSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPjwvdGV4dD4KPC9zdmc+Cjwvc3ZnPg==',
            {
              folder: 'apna-decoration/categories',
              public_id: `${category.name.toLowerCase().replace(/\s+/g, '-')}-placeholder`
            }
          );

          await Category.findByIdAndUpdate(category._id, {
            image: placeholderResult.secure_url
          });

          console.log(`   ✅ Updated to placeholder: ${placeholderResult.secure_url}`);
        }

      } catch (error) {
        console.error(`   ❌ Error updating ${category.name}:`, error.message);
      }
    }

    console.log('\n✅ Category image update completed');

    // Show updated categories
    const updatedCategories = await Category.find({});
    console.log('\n📋 Updated Categories:');
    updatedCategories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.image}`);
    });

    console.log('\n🔌 Disconnected from Atlas database');

  } catch (error) {
    console.error('❌ Error updating category images:', error.message);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  updateCategoryImages();
}

module.exports = updateCategoryImages;
