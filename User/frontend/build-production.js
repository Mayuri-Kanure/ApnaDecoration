// Production build script for APNA Decoration
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building APNA Decoration for Production...');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.REACT_APP_RAZORPAY_KEY = 'rzp_live_RsakLTdHRff3gk';

// Create production .env file
const envContent = `
NODE_ENV=production
REACT_APP_RAZORPAY_KEY=rzp_live_RsakLTdHRff3gk
REACT_APP_API_URL=https://user-api.apnadecoration.com/api
REACT_APP_DOMAIN=https://apnadecoration.com
`;

fs.writeFileSync('.env.production', envContent.trim());
console.log('✅ Production .env file created');

// Build the application
try {
  console.log('📦 Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Build files are in /build directory');
  console.log('🌐 Ready for deployment to: https://apnadecoration.com');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
