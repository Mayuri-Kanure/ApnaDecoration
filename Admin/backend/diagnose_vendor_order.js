const https = require('https');

async function diagnoseVendorOrder() {
  try {
    console.log('🔍 DIAGNOSING VENDOR ORDER ISSUE...');
    
    // Login to get token
    const loginResponse = await makeRequest('POST', '/api/vendor/auth/login', {
      email: 'mayuri@gmail.com',
      password: 'mayuri123'
    });
    
    if (!loginResponse.token) {
      console.log('❌ Login failed');
      return;
    }
    
    console.log('✅ Login successful');
    console.log('   Vendor ID:', loginResponse.user.id);
    
    const token = loginResponse.token;
    const vendorId = loginResponse.user.id;
    
    // Test 1: Check vendor products
    console.log('\n📦 Testing vendor products...');
    const productsResponse = await makeRequest('GET', '/api/vendor-products/my-products', null, token);
    console.log('Products found:', productsResponse.products.length);
    
    if (productsResponse.products.length > 0) {
      const product = productsResponse.products[0];
      console.log('Product details:');
      console.log('   ID:', product._id || product.id);
      console.log('   Name:', product.name);
      console.log('   Vendor ID:', product.vendorId);
      console.log('   Status:', product.status);
      console.log('   Matches logged-in vendor:', product.vendorId === vendorId);
    }
    
    // Test 2: Check all orders (admin view)
    console.log('\n📋 Testing all orders (if admin API exists)...');
    try {
      const allOrdersResponse = await makeRequest('GET', '/api/orders', null, token);
      console.log('All orders found:', allOrdersResponse.orders?.length || 0);
      
      if (allOrdersResponse.orders && allOrdersResponse.orders.length > 0) {
        const targetOrder = allOrdersResponse.orders.find(order => 
          order.orderNumber === 'ORD-1778476290762-7ZGAS'
        );
        
        if (targetOrder) {
          console.log('✅ Target order found:', targetOrder.orderNumber);
          console.log('   Order items:', targetOrder.items?.length || 0);
          
          targetOrder.items?.forEach((item, index) => {
            console.log(`   Item ${index + 1}:`);
            console.log('     Product ID:', item.product);
            console.log('     Product Model:', item.productModel);
            console.log('     Product Name:', item.product?.name || 'Not populated');
            console.log('     Quantity:', item.quantity);
            console.log('     Price:', item.unitPrice);
            
            if (item.product && item.product.vendorId) {
              console.log('     Product Vendor ID:', item.product.vendorId);
              console.log('     Matches logged-in vendor:', item.product.vendorId === vendorId);
            }
          });
        } else {
          console.log('❌ Target order not found in all orders');
        }
      }
    } catch (error) {
      console.log('ℹ️ Admin orders API not accessible (expected)');
    }
    
    // Test 3: Check vendor orders response details
    console.log('\n🔍 Testing vendor orders response...');
    const vendorOrdersResponse = await makeRequest('GET', '/api/vendor-orders', null, token);
    console.log('Vendor orders response:', JSON.stringify(vendorOrdersResponse, null, 2));
    
    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('If vendor orders show 0 but order exists, the issue is likely:');
    console.log('1. Order items.product not populated correctly');
    console.log('2. Product vendorId mismatch');
    console.log('3. ProductModel not set to "VendorProduct"');
    
  } catch (error) {
    console.error('❌ Diagnosis error:', error);
  }
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'admin-api.apnadecoration.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      rejectUnauthorized: false
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = jsonData.length;
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve(jsonData);
        } catch (e) {
          resolve({ raw: responseData });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

diagnoseVendorOrder();
