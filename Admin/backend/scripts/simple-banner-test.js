require('dotenv').config();
const axios = require('axios');

async function testBannerEndpoint() {
  console.log('🧪 Testing Banner Endpoint\n');

  const API_BASE_URL = 'http://localhost:5000/api';
  
  try {
    // Test 1: Get current banners
    console.log('📋 Test 1: Getting current banners...');
    const getResponse = await axios.get(`${API_BASE_URL}/banners`);
    console.log('✅ GET /banners status:', getResponse.status);
    console.log('📊 Current banners:', getResponse.data.banners?.length || 0);

    // Test 2: Check if banner upload endpoint exists
    console.log('\n📋 Test 2: Testing banner upload endpoint...');
    
    // Create simple banner data without image first
    const bannerData = {
      bannerType: 'Main Banner',
      bannerUrl: 'http://localhost:3000/',
      resourceType: 'category',
      category: '6983338a0147fd7ccaebe9d6',
      published: true
    };

    try {
      const postResponse = await axios.post(`${API_BASE_URL}/banners`, bannerData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer admin-test-token`
        }
      });
      
      console.log('✅ POST /banners status:', postResponse.status);
      console.log('📊 Response:', postResponse.data);
      
      if (postResponse.data.banner) {
        console.log('📁 Banner image URL:', postResponse.data.banner.image);
      }
      
    } catch (postError) {
      console.log('❌ POST /banners error:', postError.message);
      if (postError.response) {
        console.log('📊 Error status:', postError.response.status);
        console.log('📊 Error data:', postError.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Error testing banner endpoint:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testBannerEndpoint();
}

module.exports = testBannerEndpoint;
