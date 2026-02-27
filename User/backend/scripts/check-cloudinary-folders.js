require('dotenv').config();
const cloudinaryService = require('../services/cloudinaryService');

async function checkCloudinaryFolders() {
  console.log('🔍 Checking Cloudinary Folders\n');

  try {
    // Test 1: Check Cloudinary connection
    console.log('📋 Test 1: Cloudinary Connection...');
    const connectionTest = await cloudinaryService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Cloudinary connected successfully');
    } else {
      console.log('❌ Cloudinary connection failed:', connectionTest.message);
      return;
    }

    // Test 2: Upload test image to create folder structure
    console.log('\n📋 Test 2: Creating Test Images...');
    
    const cloudinary = require('cloudinary').v2;
    
    // Test upload to each folder
    const testImages = [
      { folder: 'banners', filename: 'test-banner' },
      { folder: 'products', filename: 'test-product' },
      { folder: 'categories', filename: 'test-category' },
      { folder: 'vendor-products', filename: 'test-vendor' }
    ];

    for (const test of testImages) {
      try {
        console.log(`📤 Uploading test image to ${test.folder}/...`);
        
        // Create a simple test image buffer
        const testImageBuffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          'base64'
        );

        const result = await cloudinary.uploader.upload(testImageBuffer, {
          folder: `apna-decoration/${test.folder}`,
          public_id: test.filename,
          resource_type: 'image',
          format: 'png'
        });

        console.log(`✅ Uploaded to ${test.folder}:`, result.secure_url);
        
      } catch (error) {
        console.log(`❌ Failed to upload to ${test.folder}:`, error.message);
      }
    }

    // Test 3: List all resources in folder
    console.log('\n📋 Test 3: Listing Cloudinary Resources...');
    
    const listResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'apna-decoration/',
      max_results: 50
    });

    console.log(`📊 Found ${listResult.resources.length} resources in apna-decoration/`);
    
    // Group by folder
    const folderCounts = {};
    listResult.resources.forEach(resource => {
      const folder = resource.public_id.split('/')[1] || 'root';
      folderCounts[folder] = (folderCounts[folder] || 0) + 1;
    });

    console.log('\n📁 Folder Contents:');
    Object.entries(folderCounts).forEach(([folder, count]) => {
      console.log(`   ${folder}/: ${count} images`);
    });

    console.log('\n🌐 Cloudinary Dashboard URL:');
    console.log('   https://cloudinary.com/console/media_library/folders/apna-decoration');

  } catch (error) {
    console.error('❌ Error checking Cloudinary folders:', error.message);
  }
}

// Run the check
if (require.main === module) {
  checkCloudinaryFolders();
}

module.exports = checkCloudinaryFolders;
