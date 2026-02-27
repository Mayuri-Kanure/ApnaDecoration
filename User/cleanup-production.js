#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 CLEANING PRODUCTION BUILD...\n');

// Files to clean up
const filesToClean = [
  'src/services/api.js',
  'src/config/constants.js',
  'src/pages/Products.js',
  'src/pages/Search.js'
];

// Debug patterns to remove
const debugPatterns = [
  /console\.log\('🔗 API Configuration[^;]*\);?\s*\n?/g,
  /console\.log\('🛒[^;]*\);?\s*\n?/g,
  /console\.log\('🔐[^;]*\);?\s*\n?/g,
  /console\.log\('🔍[^;]*\);?\s*\n?/g,
  /console\.error\('❌[^;]*\);?\s*\n?/g,
  /console\.log\('📱[^;]*\);?\s*\n?/g
];

let cleanedFiles = 0;

filesToClean.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    debugPatterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned debug logs from: ${filePath}`);
      cleanedFiles++;
    }
  }
});

console.log(`\n🎉 Cleanup complete! Removed debug logs from ${cleanedFiles} files.`);
