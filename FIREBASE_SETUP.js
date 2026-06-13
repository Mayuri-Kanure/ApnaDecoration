#!/usr/bin/env node

/**
 * Firebase Live Setup Script
 * Automates the process of enabling Firebase for production
 * Run: node FIREBASE_SETUP.js
 */

const fs = require("fs");
const path = require("path");

console.log("\n" + "=".repeat(70));
console.log("🔥 FIREBASE LIVE SETUP - AUTOMATED CONFIGURATION");
console.log("=".repeat(70) + "\n");

const sourceFile = path.join(
  __dirname,
  "firebase data",
  "apna-decoration-firebase-adminsdk-fbsvc-41f765c502.json"
);

const backends = [
  {
    name: "User Backend",
    configDir: path.join(__dirname, "User", "backend", "config"),
    envFile: path.join(__dirname, "User", "backend", ".env"),
    envContent: `# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
PUSH_PROVIDER=firebase
PUSH_MOCK=false

# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/apna_decoration

# JWT
JWT_SECRET=your-jwt-secret-key-here

# Optional: Firebase Environment Variables (if using different setup)
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
`,
  },
  {
    name: "Admin Backend",
    configDir: path.join(__dirname, "Admin", "backend", "config"),
    envFile: path.join(__dirname, "Admin", "backend", ".env"),
    envContent: `# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
PUSH_PROVIDER=firebase
PUSH_MOCK=false

# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/apna_decoration_admin

# JWT
JWT_SECRET=your-jwt-secret-key-here-admin

# Optional: Firebase Environment Variables
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
`,
  },
];

// Track results
const results = {
  success: [],
  warning: [],
  error: [],
};

// ============================================
// Step 1: Verify Source File
// ============================================
console.log("📋 Step 1: Verifying Firebase Service Account...\n");

if (!fs.existsSync(sourceFile)) {
  console.log(`❌ ERROR: Service account file not found at:\n   ${sourceFile}`);
  results.error.push("Service account file missing");
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
  if (!serviceAccount.project_id || !serviceAccount.private_key) {
    throw new Error("Invalid service account format");
  }
  console.log(`✅ Service account file is valid`);
  console.log(`   Project: ${serviceAccount.project_id}`);
  console.log(`   Email: ${serviceAccount.client_email}\n`);
  results.success.push("Service account validated");
} catch (err) {
  console.log(`❌ ERROR: Invalid service account file\n   ${err.message}`);
  results.error.push("Invalid service account");
  process.exit(1);
}

// ============================================
// Step 2: Copy Service Account to Backends
// ============================================
console.log("📋 Step 2: Copying Service Account to Backend Config Folders...\n");

backends.forEach(({ name, configDir }) => {
  try {
    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`   📁 Created directory: ${configDir}`);
    }

    const destFile = path.join(configDir, "firebase-service-account.json");

    // Copy file
    fs.copyFileSync(sourceFile, destFile);
    console.log(`✅ ${name}: Service account copied`);
    console.log(`   Destination: ${destFile}`);
    results.success.push(`${name}: Service account copied`);
  } catch (err) {
    console.log(`❌ ${name}: Failed to copy service account`);
    console.log(`   Error: ${err.message}`);
    results.error.push(`${name}: Copy failed`);
  }
});

console.log();

// ============================================
// Step 3: Create/Update .env Files
// ============================================
console.log("📋 Step 3: Creating/Updating .env Configuration Files...\n");

backends.forEach(({ name, envFile, envContent }) => {
  try {
    const backendDir = path.dirname(envFile);
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }

    // Check if .env already exists
    if (fs.existsSync(envFile)) {
      console.log(`⚠️  ${name}: .env file already exists`);
      console.log(`   Preserving existing file at: ${envFile}`);
      console.log(`   Please manually update these settings:`);
      console.log(`     - FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json`);
      console.log(`     - PUSH_PROVIDER=firebase`);
      console.log(`     - PUSH_MOCK=false\n`);
      results.warning.push(`${name}: .env exists (manual update needed)`);
    } else {
      fs.writeFileSync(envFile, envContent);
      console.log(`✅ ${name}: .env file created`);
      console.log(`   Location: ${envFile}`);
      results.success.push(`${name}: .env created`);
    }
  } catch (err) {
    console.log(`❌ ${name}: Failed to create .env file`);
    console.log(`   Error: ${err.message}`);
    results.error.push(`${name}: .env creation failed`);
  }
});

console.log();

// ============================================
// Step 4: Create Test Script
// ============================================
console.log("📋 Step 4: Creating Firebase Test Script...\n");

const testScript = `#!/usr/bin/env node

/**
 * Firebase Connection Test
 * Verifies Firebase Admin SDK initialization
 * Run: node test-firebase.js
 */

const path = require("path");

// Ensure .env is loaded
if (require("fs").existsSync(".env")) {
  require("dotenv").config();
}

console.log("\\n" + "=".repeat(60));
console.log("🔥 Firebase Connection Test");
console.log("=".repeat(60) + "\\n");

try {
  console.log("📋 Loading Firebase Admin SDK...");
  const { getMessaging, isAdminReady } = require("./config/firebaseAdmin");

  console.log("✅ Firebase Admin module loaded\\n");

  // Test initialization
  console.log("🔌 Checking Firebase connection...");
  if (isAdminReady()) {
    console.log("✅ Firebase Admin SDK is READY\\n");

    const messaging = getMessaging();
    if (messaging) {
      console.log("📱 Firebase Messaging service is AVAILABLE");
      console.log("✅ Push notifications can be sent via FCM\\n");

      console.log("=".repeat(60));
      console.log("🎉 Firebase is LIVE and ready for production!");
      console.log("=".repeat(60) + "\\n");
      process.exit(0);
    } else {
      console.log("⚠️  Messaging service not available");
      process.exit(1);
    }
  } else {
    console.log("❌ Firebase Admin SDK is NOT ready\\n");
    console.log("Troubleshooting:");
    console.log("1. Check if firebase-service-account.json exists");
    console.log("2. Verify FIREBASE_SERVICE_ACCOUNT_PATH in .env");
    console.log("3. Run: npm install firebase-admin");
    process.exit(1);
  }
} catch (err) {
  console.log("❌ ERROR: " + err.message);
  console.log("\\nStack trace:");
  console.log(err.stack);
  process.exit(1);
}
`;

backends.forEach(({ name, configDir }) => {
  try {
    const backendDir = path.dirname(configDir);
    const testFile = path.join(backendDir, "test-firebase.js");

    fs.writeFileSync(testFile, testScript);
    console.log(`✅ ${name}: Test script created`);
    console.log(`   Location: ${testFile}`);
    console.log(`   Run with: cd ${path.basename(backendDir)} && node test-firebase.js\n`);
    results.success.push(`${name}: Test script created`);
  } catch (err) {
    console.log(`❌ ${name}: Failed to create test script`);
    console.log(`   Error: ${err.message}\n`);
    results.error.push(`${name}: Test script creation failed`);
  }
});

// ============================================
// Step 5: Create Server Verification Code
// ============================================
console.log("📋 Step 5: Creating Server Verification Code...\n");

const verificationCode = `
// Add this to your server.js file (after middleware setup):

const { getMessaging, isAdminReady } = require("./config/firebaseAdmin");

// ... other code ...

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  
  // Verify Firebase on startup
  setTimeout(() => {
    if (isAdminReady()) {
      console.log("✅ Firebase Admin SDK initialized successfully");
      console.log("📱 Push notifications: LIVE MODE");
    } else {
      console.log("⚠️  Firebase Admin SDK not ready");
      console.log("📱 Push notifications: MOCK MODE");
      console.log("💡 Tip: Check firebase-service-account.json exists in config/");
    }
  }, 1000);
});
`;

console.log("Add this code to your server.js file:\n");
console.log("```javascript");
console.log(verificationCode.trim());
console.log("```\n");

results.warning.push("Manual server.js code addition required");

// ============================================
// Summary
// ============================================
console.log("=".repeat(70));
console.log("📊 SETUP SUMMARY");
console.log("=".repeat(70) + "\n");

console.log("✅ COMPLETED STEPS:\n");
results.success.forEach((msg) => {
  console.log(`   ✓ ${msg}`);
});

if (results.warning.length > 0) {
  console.log("\n⚠️  ATTENTION REQUIRED:\n");
  results.warning.forEach((msg) => {
    console.log(`   ⚠️  ${msg}`);
  });
}

if (results.error.length > 0) {
  console.log("\n❌ ERRORS:\n");
  results.error.forEach((msg) => {
    console.log(`   ✗ ${msg}`);
  });
}

console.log("\n" + "=".repeat(70));
console.log("🎯 NEXT STEPS");
console.log("=".repeat(70) + "\n");

console.log("1️⃣  Install Firebase Admin dependency (if not already installed):");
console.log("   cd User/backend && npm install firebase-admin");
console.log("   cd Admin/backend && npm install firebase-admin\n");

console.log("2️⃣  Test Firebase connection:");
console.log("   cd User/backend && node test-firebase.js");
console.log("   cd Admin/backend && node test-firebase.js\n");

console.log("3️⃣  Add verification code to your server.js files");
console.log("   (See code snippet above)\n");

console.log("4️⃣  Restart your backend servers:");
console.log("   npm start\n");

console.log("5️⃣  Verify Firebase Console:");
console.log("   https://console.firebase.google.com/project/apna-decoration\n");

console.log("6️⃣  Monitor logs for:");
console.log("   ✓ 'Firebase Admin SDK initialized successfully'");
console.log("   ✓ 'Push notifications: LIVE MODE'\n");

console.log("=".repeat(70) + "\n");

if (results.error.length === 0) {
  console.log("✅ Firebase setup is READY. Follow the next steps above.\n");
} else {
  console.log("❌ Some errors occurred. Please fix them before proceeding.\n");
  process.exit(1);
}
