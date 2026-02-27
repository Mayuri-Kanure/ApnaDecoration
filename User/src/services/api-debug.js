// Debug script to check API configuration
import { API_BASE_URL, PRODUCT_API_URL } from '../config/constants';

console.log('🔍 API CONFIGURATION DEBUG:');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('PRODUCT_API_URL:', PRODUCT_API_URL);
console.log('Expected Product API:', 'https://admin-api.apnadecoration.com/api');

// Check if constants are loaded correctly
if (PRODUCT_API_URL === 'https://admin-api.apnadecoration.com/api') {
  console.log('✅ PRODUCT_API_URL is correctly set to Admin backend');
} else {
  console.log('❌ PRODUCT_API_URL is not set correctly:', PRODUCT_API_URL);
}

export { API_BASE_URL, PRODUCT_API_URL };
