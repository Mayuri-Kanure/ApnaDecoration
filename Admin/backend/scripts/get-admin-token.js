require('dotenv').config();
const axios = require('axios');

async function getAdminToken() {
  console.log('🔐 Getting Admin Token\n');

  const API_BASE_URL = 'http://localhost:5000/api';
  
  try {
    // Login with admin credentials
    const loginData = {
      email: 'admin@example.com', // Default admin email
      password: 'admin123'        // Default admin password
    };

    console.log('📤 Logging in with admin credentials...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData, {
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('📊 Status:', response.status);
    console.log('📊 Response:', response.data);
    
    if (response.data.token) {
      console.log('🔑 Admin Token:', response.data.token);
      console.log('👤 User Role:', response.data.user.role);
      
      // Test the banner endpoint with this token
      console.log('\n🧪 Testing banner endpoint with fresh token...');
      
      const bannerResponse = await axios.get(`${API_BASE_URL}/banners`, {
        headers: { 
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Banner endpoint working!');
      console.log('📊 Banners found:', bannerResponse.data.banners?.length || 0);
      
      return response.data.token;
    }
    
  } catch (error) {
    console.error('❌ Error getting admin token:', error.message);
    if (error.response) {
      console.error('📊 Error response:', error.response.data);
      console.error('📊 Error status:', error.response.status);
    }
  }
}

// Run the test
if (require.main === module) {
  getAdminToken();
}

module.exports = getAdminToken;
