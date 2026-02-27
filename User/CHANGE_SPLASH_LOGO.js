#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 APNA Decoration - Splash Screen Logo Changer\n');

// Splash screen locations for different orientations and densities
const splashLocations = [
  'android/app/src/main/res/drawable-land-xhdpi/splash.png',
  'android/app/src/main/res/drawable-land-xxhdpi/splash.png',
  'android/app/src/main/res/drawable-port-xhdpi/splash.png',
  'android/app/src/main/res/drawable-port-xxhdpi/splash.png'
];

function changeSplashLogo(newLogoPath) {
  console.log('🖼️  Changing splash screen logo...\n');
  
  if (!fs.existsSync(newLogoPath)) {
    console.log('❌ Error: New logo file not found at:', newLogoPath);
    console.log('💡 Please provide the path to your new splash.png file');
    return false;
  }
  
  let successCount = 0;
  
  splashLocations.forEach(location => {
    const fullPath = path.join(__dirname, location);
    
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Copy new logo to splash location
      fs.copyFileSync(newLogoPath, fullPath);
      console.log(`✅ Updated: ${location}`);
      successCount++;
      
    } catch (error) {
      console.log(`❌ Failed to update ${location}:`, error.message);
    }
  });
  
  console.log(`\n📊 Results: ${successCount}/${splashLocations.length} splash screens updated`);
  
  if (successCount > 0) {
    console.log('\n🎉 Splash screen logo changed successfully!');
    console.log('\n📱 Next Steps:');
    console.log('1. Rebuild APK: npm run build && npx cap sync android');
    console.log('2. Or reinstall existing APK to see changes');
    console.log('3. Test app launch to see new splash screen');
  }
  
  return successCount > 0;
}

// Instructions
console.log('📋 How to change your splash screen logo:');
console.log('=====================================');
console.log('1. Save your new logo as "new-splash.png" in the User folder');
console.log('2. Run: node CHANGE_SPLASH_LOGO.js');
console.log('3. Follow the prompts\n');

// Check if new logo exists
const newLogoPath = path.join(__dirname, 'new-splash.png');
if (fs.existsSync(newLogoPath)) {
  console.log('🎯 Found new-splash.png - Applying changes...\n');
  changeSplashLogo(newLogoPath);
} else {
  console.log('💡 To use this script:');
  console.log('1. Place your new logo as "new-splash.png" in this folder');
  console.log('2. Run this script again');
  console.log('3. Or manually replace the splash.png files at:');
  
  splashLocations.forEach(location => {
    console.log(`   - ${location}`);
  });
}

console.log('\n🎨 Recommended logo specifications:');
console.log('- Format: PNG with transparent background');
console.log('- Size: 1280x720 for landscape, 720x1280 for portrait');
console.log('- Design: Clean, professional APNA Decoration branding');
console.log('- Colors: Work well with white background');
