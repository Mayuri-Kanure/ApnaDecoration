const https = require('https');

function verifyVendorOrdersFix() {
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
            console.log('✅ Login successful, testing updated vendor orders API...');
            
            // Test vendor orders API
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
              console.log('📦 Vendor Orders API Status:', ordersRes.statusCode);
              
              let ordersData = '';
              ordersRes.on('data', (chunk) => ordersData += chunk);
              ordersRes.on('end', () => {
                try {
                  const ordersResponse = JSON.parse(ordersData);
                  console.log('📦 Vendor Orders Response:', JSON.stringify(ordersResponse, null, 2));
                  
                  // Check if the new route is deployed
                  if (ordersResponse.vendorInfo) {
                    console.log('🎉 SUCCESS! Updated vendor orders route is deployed!');
                    console.log('   Vendor ID:', ordersResponse.vendorId);
                    console.log('   Orders found:', ordersResponse.total);
                    console.log('   Message:', ordersResponse.message);
                    
                    if (ordersResponse.orders.length > 0) {
                      console.log('📋 Order Details:');
                      ordersResponse.orders.forEach((order, index) => {
                        console.log(`   ${index + 1}. Order #${order.orderNumber}`);
                        console.log('      Items:', order.items.length);
                        console.log('      Vendor Total:', order.vendorTotal || order.totalAmount);
                        console.log('      Mixed Order:', order.isMixedOrder ? 'Yes' : 'No');
                        
                        order.items.forEach(item => {
                          console.log(`         📦 ${item.product.name} - ₹${item.unitPrice}`);
                        });
                      });
                    }
                  } else {
                    console.log('❌ Old route still active - need to restart server');
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

verifyVendorOrdersFix();
