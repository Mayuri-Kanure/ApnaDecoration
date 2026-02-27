require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

async function createCloudinaryFolders() {
  console.log('📁 Creating Cloudinary Folder Structure\n');

  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log('✅ Cloudinary configured');
    console.log(`📂 Account: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`📂 Base Folder: apna-decoration`);

    // Create test images in each folder
    const folders = ['banners', 'products', 'categories', 'vendor-products', 'orders', 'avatars'];
    
    for (const folder of folders) {
      console.log(`\n📤 Creating test image in ${folder}/...`);
      
      try {
        // Create a simple 1x1 PNG image
        const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        const result = await cloudinary.uploader.upload(imageData, {
          folder: `apna-decoration/${folder}`,
          public_id: `test-${folder}`,
          resource_type: 'image',
          format: 'png',
          overwrite: true
        });

        console.log(`✅ Uploaded to ${folder}/`);
        console.log(`   📁 URL: ${result.secure_url}`);
        console.log(`   🆔 Public ID: ${result.public_id}`);
        
      } catch (error) {
        console.log(`❌ Failed to upload to ${folder}:`, error.message);
      }
    }

    // List all resources
    console.log('\n📋 Listing all Cloudinary resources...');
    
    const listResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'apna-decoration/',
      max_results: 50
    });

    console.log(`📊 Found ${listResult.resources.length} total resources`);

    // Group by folder
    const folderContents = {};
    listResult.resources.forEach(resource => {
      const parts = resource.public_id.split('/');
      if (parts.length >= 2) {
        const folder = parts[1];
        if (!folderContents[folder]) {
          folderContents[folder] = [];
        }
        folderContents[folder].push(resource);
      }
    });

    console.log('\n📁 Folder Structure:');
    Object.entries(folderContents).forEach(([folder, resources]) => {
      console.log(`\n   📂 ${folder}/ (${resources.length} images):`);
      resources.forEach((resource, index) => {
        console.log(`      ${index + 1}. ${resource.public_id}`);
        console.log(`         🔗 ${resource.secure_url}`);
      });
    });

    console.log('\n🌐 Check your Cloudinary Dashboard:');
    console.log('   https://cloudinary.com/console');
    console.log('   Navigate to: Media Library → Folders → apna-decoration');

  } catch (error) {
    console.error('❌ Error creating Cloudinary folders:', error.message);
  }
}

// Run the function
if (require.main === module) {
  createCloudinaryFolders();
}

module.exports = createCloudinaryFolders;
