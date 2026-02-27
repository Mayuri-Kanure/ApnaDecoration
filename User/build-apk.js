#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Production APK Build Process...\n');

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

function runCommand(command, description) {
  log(`\n📋 ${description}`, 'blue');
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    log(`✅ ${description} - SUCCESS`, 'green');
  } catch (error) {
    log(`❌ ${description} - FAILED`, 'red');
    process.exit(1);
  }
}

// Check if required directories exist
function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'yellow');
  
  if (!fs.existsSync('./android')) {
    log('❌ Android directory not found. Run: npx cap add android', 'red');
    process.exit(1);
  }
  
  if (!fs.existsSync('./capacitor.config.ts')) {
    log('❌ capacitor.config.ts not found', 'red');
    process.exit(1);
  }
  
  log('✅ Prerequisites check passed', 'green');
}

// Main build process
function buildProductionAPK() {
  log('🎯 Building Production APK for APNA Decoration\n', 'blue');
  
  checkPrerequisites();
  
  // Step 1: Clean previous build
  runCommand('rm -rf build', 'Cleaning previous build directory');
  
  // Step 2: Build React app for production
  runCommand('npm run build', 'Building React app for production');
  
  // Step 3: Verify build exists
  if (!fs.existsSync('./build')) {
    log('❌ Build directory not created', 'red');
    process.exit(1);
  }
  
  // Step 4: Sync with Capacitor
  runCommand('npx cap sync android', 'Syncing build with Android project');
  
  // Step 5: Open Android Studio
  log('\n🎉 Build process completed successfully!', 'green');
  log('\n📱 Next Steps:', 'blue');
  log('1. Android Studio will open automatically', 'yellow');
  log('2. Build > Build Bundle(s) / APK(s) > Build APK(s)', 'yellow');
  log('3. Select "release" variant', 'yellow');
  log('4. Sign and generate your APK', 'yellow');
  
  runCommand('npx cap open android', 'Opening Android Studio');
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n⚠️  Build process interrupted', 'yellow');
  process.exit(1);
});

// Run the build
buildProductionAPK();
