const https = require('https');

function testLiveOrdersAPI() {
  return new Promise((resolve, reject) => {
    // First login to get token
    const loginData = JSON.stringify({
      email: 'mayuri@gmail.com',
      password: 'mayuri123'
    });
    
    const loginOptions = {
      hostname: 'admin-api.apnadecoration.com',
      port: 443,
      path: '/api/vendor/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      },
      rejectUnauthorized: false
    };

    const loginReq = https.request(loginOptions, (loginRes) => {
      let loginData = '';
      loginRes.on('data', (chunk) => loginData += chunk);
      loginRes.on('end', () => {
        try {
          const loginResponse = JSON.parse(loginData);
          if (loginResponse.token) {
            console.log('✅ Login successful, testing orders API...');
            
            // Now test orders API
            const ordersOptions = {
              hostname: 'admin-api.apnadecoration.com',
              port: 443,
              path: '/api/vendor-orders',
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginResponse.token}`
              },
              rejectUnauthorized: false
            };

            const ordersReq = https.request(ordersOptions, (ordersRes) => {
              console.log('📦 Orders API Status:', ordersRes.statusCode);
              
              let ordersData = '';
              ordersRes.on('data', (chunk) => ordersData += chunk);
              ordersRes.on('end', () => {
                try {
                  const ordersResponse = JSON.parse(ordersData);
                  console.log('📦 Orders API Response:', JSON.stringify(ordersResponse, null, 2));
                  
                  if (ordersResponse.data && ordersResponse.data.length > 0) {
                    console.log('✅ Orders found:', ordersResponse.data.length);
                    
                    // Check first few orders for product references
                    ordersResponse.data.slice(0, 3).forEach((order, index) => {
                      console.log(`\n📋 Order ${index + 1}:`);
                      console.log('   Order ID:', order._id);
                      console.log('   Status:', order.status);
                      console.log('   Items:', order.items?.length || 0);
                      
                      if (order.items && order.items.length > 0) {
                        order.items.forEach((item, itemIndex) => {
                          console.log(`     Item ${itemIndex + 1}:`);
                          console.log('       Product ID:', item.product);
                          console.log('       Quantity:', item.quantity);
                          console.log('       Price:', item.price);
                        });
                      }
                    });
                  }
                  
                  resolve(ordersResponse);
                } catch (e) {
                  console.log('📦 Orders Raw Response:', ordersData);
                  resolve({ raw: ordersData });
                }
              });
            });

            ordersReq.on('error', (error) => {
              console.error('❌ Orders API Error:', error.message);
              reject(error);
            });

            ordersReq.end();
          }
        } catch (e) {
          console.log('🔐 Login Error:', loginData);
          resolve({ error: 'Login failed' });
        }
      });
    });

    loginReq.on('error', reject);
    loginReq.write(loginData);
    loginReq.end();
  });
}

testLiveOrdersAPI();
