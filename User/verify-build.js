#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING PRODUCTION BUILD...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - NOT FOUND`, 'red');
    return false;
  }
}

function searchInFile(filePath, searchTerm, description) {
  if (!fs.existsSync(filePath)) {
    log(`❌ File not found: ${filePath}`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const found = content.includes(searchTerm);
  
  if (found) {
    log(`🚨 ${description} - FOUND: ${searchTerm}`, 'red');
    return true;
  } else {
    log(`✅ ${description} - NOT FOUND`, 'green');
    return false;
  }
}

function searchInDirectory(dirPath, searchTerm, description) {
  if (!fs.existsSync(dirPath)) {
    log(`❌ Directory not found: ${dirPath}`, 'red');
    return false;
  }
  
  let found = false;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(dirPath, file.name);
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(searchTerm)) {
        log(`🚨 ${description} - FOUND in ${file.name}: ${searchTerm}`, 'red');
        found = true;
      }
    } else if (file.isDirectory()) {
      const subDirPath = path.join(dirPath, file.name);
      if (searchInDirectory(subDirPath, searchTerm, '')) {
        found = true;
      }
    }
  }
  
  if (!found) {
    log(`✅ ${description} - NOT FOUND in directory`, 'green');
  }
  
  return found;
}

// Main verification
function verifyBuild() {
  log('📋 Build Verification Checklist:', 'blue');
  log('=====================================\n');
  
  let allChecksPass = true;
  
  // Check 1: Build directory exists
  log('🔍 CHECK 1: Build Directory Structure', 'yellow');
  if (!checkFile('./build', 'Build directory exists')) {
    allChecksPass = false;
  }
  if (!checkFile('./build/index.html', 'Build index.html exists')) {
    allChecksPass = false;
  }
  if (!checkFile('./build/static', 'Build static directory exists')) {
    allChecksPass = false;
  }
  
  // Check 2: No port 3000 references in build
  log('\n🔍 CHECK 2: No Port 3000 References', 'yellow');
  const hasPort3000 = searchInDirectory('./build', '3000', 'Port 3000 reference');
  if (hasPort3000) {
    allChecksPass = false;
    log('⚠️  Port 3000 found in build - still using dev server!', 'red');
  }
  
  // Check 3: No localhost references in build
  log('\n🔍 CHECK 3: No Localhost References', 'yellow');
  const hasLocalhost = searchInDirectory('./build', 'localhost', 'Localhost reference');
  if (hasLocalhost) {
    allChecksPass = false;
    log('⚠️  Localhost found in build - should use IP address!', 'red');
  }
  
  // Check 4: Environment variables used
  log('\n🔍 CHECK 4: Environment Variables Usage', 'yellow');
  if (!checkFile('.env.production', '.env.production file exists')) {
    allChecksPass = false;
  }
  
  // Check 5: Capacitor config
  log('\n🔍 CHECK 5: Capacitor Configuration', 'yellow');
  if (!checkFile('./capacitor.config.ts', 'Capacitor config exists')) {
    allChecksPass = false;
  }
  
  const configContent = fs.readFileSync('./capacitor.config.ts', 'utf8');
  if (configContent.includes('server.url')) {
    log('🚨 server.url still exists in capacitor.config.ts', 'red');
    allChecksPass = false;
  } else {
    log('✅ server.url removed from capacitor.config.ts', 'green');
  }
  
  if (configContent.includes('webDir: "build"')) {
    log('✅ webDir set to "build"', 'green');
  } else {
    log('❌ webDir not set to "build"', 'red');
    allChecksPass = false;
  }
  
  // Check 6: Android manifest
  log('\n🔍 CHECK 6: Android Configuration', 'yellow');
  const manifestPath = './android/app/src/main/AndroidManifest.xml';
  if (checkFile(manifestPath, 'AndroidManifest.xml exists')) {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    if (manifestContent.includes('android:name="android.permission.INTERNET"')) {
      log('✅ INTERNET permission present', 'green');
    } else {
      log('❌ INTERNET permission missing', 'red');
      allChecksPass = false;
    }
    
    if (manifestContent.includes('android:usesCleartextTraffic="true"')) {
      log('✅ Cleartext traffic enabled', 'green');
    } else {
      log('❌ Cleartext traffic not enabled', 'red');
      allChecksPass = false;
    }
  }
  
  // Summary
  log('\n📊 VERIFICATION SUMMARY', 'blue');
  log('=====================================', 'blue');
  
  if (allChecksPass) {
    log('🎉 ALL CHECKS PASSED! Build is ready for APK production.', 'green');
    log('\n📱 Next Steps:', 'blue');
    log('1. Run: npx cap sync android', 'yellow');
    log('2. Run: npx cap open android', 'yellow');
    log('3. Build APK in Android Studio', 'yellow');
    log('4. Test offline frontend (stop npm start)', 'yellow');
  } else {
    log('❌ SOME CHECKS FAILED! Fix issues before building APK.', 'red');
    log('\n🔧 Common Fixes:', 'blue');
    log('1. Remove server.url from capacitor.config.ts', 'yellow');
    log('2. Update environment variables to use REACT_APP_ prefix', 'yellow');
    log('3. Rebuild: npm run build', 'yellow');
    log('4. Check for hardcoded localhost/3000 references', 'yellow');
  }
}

// Run verification
verifyBuild();
