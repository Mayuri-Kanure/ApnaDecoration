const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Building Delivery App for Hostinger Deployment...");

// Step 1: Clean previous build
console.log("🧹 Step 1: Cleaning previous build...");
try {
  if (fs.existsSync("out")) {
    fs.rmSync("out", { recursive: true, force: true });
  }
  if (fs.existsSync(".next")) {
    fs.rmSync(".next", { recursive: true, force: true });
  }
  console.log("✅ Clean completed");
} catch (error) {
  console.error("❌ Clean failed:", error);
  process.exit(1);
}

// Step 2: Build Next.js app for production
console.log("📦 Step 2: Building Next.js app for production...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Next.js build completed");
} catch (error) {
  console.error("❌ Next.js build failed:", error);
  process.exit(1);
}

// Step 3: Export static files
console.log("📤 Step 3: Exporting static files...");
try {
  execSync("npm run export", { stdio: "inherit" });
  console.log("✅ Export completed");
} catch (error) {
  console.error("❌ Export failed:", error);
  process.exit(1);
}

// Step 4: Create .htaccess file for Hostinger
console.log("⚙️ Step 4: Creating .htaccess for Hostinger...");
try {
  const htaccess = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]

# Security headers
<IfModule mod_headers.c>
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/jpg "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/gif "access plus 1 month"
  ExpiresByType image/ico "access plus 1 month"
  ExpiresByType image/icon "access plus 1 month"
  ExpiresByType text/html "access plus 1 hour"
</IfModule>`;

  fs.writeFileSync("out/.htaccess", htaccess);
  console.log("✅ .htaccess created");
} catch (error) {
  console.error("❌ .htaccess creation failed:", error);
  process.exit(1);
}

// Step 5: Create deployment info file
console.log("📋 Step 5: Creating deployment info...");
try {
  const deployInfo = {
    appName: "Apna Decoration Delivery",
    version: "1.0.0",
    buildDate: new Date().toISOString(),
    deploymentTarget: "Hostinger",
    domain: "delivery.apnadecoration.com",
    buildType: "Static Export",
    framework: "Next.js",
    files: {
      total: fs.readdirSync("out").length,
      mainEntry: "index.html"
    }
  };

  fs.writeFileSync("out/deploy-info.json", JSON.stringify(deployInfo, null, 2));
  console.log("✅ Deployment info created");
} catch (error) {
  console.error("❌ Deployment info creation failed:", error);
  process.exit(1);
}

// Step 6: Show build summary
console.log("📊 Step 6: Build Summary...");
try {
  const stats = fs.statSync("out");
  const files = fs.readdirSync("out");
  
  console.log("\n🎉 Build completed successfully!");
  console.log("📁 Build directory: out/");
  console.log(`📄 Total files: ${files.length}`);
  console.log(`📏 Build size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log("🌐 Ready for Hostinger deployment");
  console.log("🔗 Domain: delivery.apnadecoration.com");
  
  console.log("\n📋 Next Steps:");
  console.log("1. Upload all files from 'out/' folder to Hostinger");
  console.log("2. Point domain to: delivery.apnadecoration.com");
  console.log("3. Ensure .htaccess is uploaded to root");
  console.log("4. Test the deployment");
  
} catch (error) {
  console.error("❌ Build summary failed:", error);
  process.exit(1);
}

console.log("\n✅ Delivery app is ready for Hostinger deployment! 🚀");
