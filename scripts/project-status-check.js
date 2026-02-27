require('dotenv').config();
const axios = require('axios');

async function checkProjectStatus() {
  console.log('🔍 APNA DECORATION - Complete Project Status Check\n');

  const ADMIN_API = 'http://localhost:5000/api';
  const USER_API = 'http://localhost:5002/api';

  const checks = [];

  // Check 1: Admin Backend Health
  console.log('📋 Check 1: Admin Backend Health...');
  try {
    const adminResponse = await axios.get(`${ADMIN_API}/banners/public`, { timeout: 5000 });
    checks.push({ name: 'Admin Backend', status: '✅ Running', port: 5000 });
    console.log('✅ Admin Backend: Running on port 5000');
  } catch (error) {
    checks.push({ name: 'Admin Backend', status: '❌ Down', port: 5000 });
    console.log('❌ Admin Backend: Not responding');
  }

  // Check 2: User Backend Health
  console.log('\n📋 Check 2: User Backend Health...');
  try {
    const userResponse = await axios.get(`${USER_API}/products`, { timeout: 5000 });
    checks.push({ name: 'User Backend', status: '✅ Running', port: 5002 });
    console.log('✅ User Backend: Running on port 5002');
  } catch (error) {
    checks.push({ name: 'User Backend', status: '❌ Down', port: 5002 });
    console.log('❌ User Backend: Not responding');
  }

  // Check 3: Cloudinary Connection
  console.log('\n📋 Check 3: Cloudinary Connection...');
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    const result = await cloudinary.api.ping();
    checks.push({ name: 'Cloudinary', status: '✅ Connected' });
    console.log('✅ Cloudinary: Connected successfully');
  } catch (error) {
    checks.push({ name: 'Cloudinary', status: '❌ Not Connected' });
    console.log('❌ Cloudinary: Connection failed');
  }

  // Check 4: Database Connection
  console.log('\n📋 Check 4: Database Connection...');
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus] || 'unknown';
    
    if (dbStatus === 1) {
      checks.push({ name: 'Database', status: '✅ Connected' });
      console.log('✅ Database: Connected to MongoDB');
    } else {
      checks.push({ name: 'Database', status: '❌ Not Connected' });
      console.log('❌ Database: Not connected');
    }
  } catch (error) {
    checks.push({ name: 'Database', status: '❌ Error' });
    console.log('❌ Database: Connection error');
  }

  // Check 5: Frontend Applications
  console.log('\n📋 Check 5: Frontend Applications...');
  
  const frontends = [
    { name: 'Admin Frontend', port: 3001, url: 'http://localhost:3001' },
    { name: 'User Frontend', port: 3000, url: 'http://localhost:3000' }
  ];

  for (const frontend of frontends) {
    try {
      const response = await axios.get(frontend.url, { timeout: 3000 });
      checks.push({ name: frontend.name, status: '✅ Running', port: frontend.port });
      console.log(`✅ ${frontend.name}: Running on port ${frontend.port}`);
    } catch (error) {
      checks.push({ name: frontend.name, status: '❌ Not Running', port: frontend.port });
      console.log(`❌ ${frontend.name}: Not responding on port ${frontend.port}`);
    }
  }

  // Summary
  console.log('\n🎯 PROJECT STATUS SUMMARY:');
  console.log('================================');
  
  const running = checks.filter(c => c.status.includes('✅')).length;
  const total = checks.length;
  const percentage = Math.round((running / total) * 100);

  checks.forEach(check => {
    console.log(`${check.status} ${check.name}${check.port ? ` (Port ${check.port})` : ''}`);
  });

  console.log('\n📊 OVERALL STATUS:');
  console.log(`🎯 Systems Running: ${running}/${total} (${percentage}%)`);
  
  if (percentage >= 80) {
    console.log('🎉 Project Status: EXCELLENT - Ready for production!');
  } else if (percentage >= 60) {
    console.log('⚠️ Project Status: GOOD - Some issues to address');
  } else {
    console.log('❌ Project Status: NEEDS WORK - Multiple issues found');
  }

  console.log('\n🔧 NEXT STEPS:');
  if (percentage < 100) {
    const failed = checks.filter(c => c.status.includes('❌'));
    failed.forEach(failed => {
      console.log(`🔴 Fix: ${failed.name}`);
    });
  } else {
    console.log('✅ All systems operational!');
    console.log('🚀 Ready for testing and deployment');
  }

  return checks;
}

// Run the check
if (require.main === module) {
  checkProjectStatus();
}

module.exports = checkProjectStatus;
