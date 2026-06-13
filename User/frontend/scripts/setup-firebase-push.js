#!/usr/bin/env node
/**
 * Firebase Cloud Messaging setup checklist for User APK push notifications.
 *
 * 1. Firebase Console → Create project (or use existing)
 * 2. Add Android app → package name: com.apnadecoration.app
 * 3. Download google-services.json → copy to:
 *      User/frontend/android/app/google-services.json
 * 4. Project Settings → Cloud Messaging → copy Server key (Legacy)
 * 5. User/backend/.env on production server:
 *      FIREBASE_SERVER_KEY=your_server_key_here
 * 6. Rebuild APK:
 *      cd User/frontend && npm run build && npx cap sync android
 * 7. In app: Profile → Notifications → enable Push → allow permission
 */

const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "../android/app/google-services.json");
const example = path.join(__dirname, "../android/app/google-services.json.example");

if (fs.existsSync(target)) {
  console.log("✅ google-services.json found at android/app/");
} else {
  console.log("❌ Missing android/app/google-services.json");
  console.log("   Copy from Firebase Console or rename example:");
  console.log(`   cp "${example}" "${target}"`);
  console.log("   Then fill in real values from Firebase.");
}

console.log("\nBackend (user-api) — use Firebase Admin (recommended):");
console.log("  Place service account JSON at:");
console.log("  User/backend/config/firebase-service-account.json");
console.log("  Or set FIREBASE_SERVICE_ACCOUNT_PATH / FIREBASE_SERVICE_ACCOUNT_JSON in .env");
console.log("\nLegacy fallback (optional):");
console.log("  FIREBASE_SERVER_KEY=<Cloud Messaging server key>");
console.log("\nFirebase Android apps required (same project apna-decoration):");
console.log("  com.apnadecoration.app      → User/frontend/android/app/google-services.json");
console.log("  com.apnadecoration.vendor   → Vendor/frontend/android/app/google-services.json");
console.log("  com.apnadecoration.delivery → Delivery/frontend/android/app/google-services.json");
console.log("\nBackends:");
console.log("  user-api  → User/backend/config/firebase-service-account.json");
console.log("  admin-api → Admin/backend/config/firebase-service-account.json (same file)");
console.log("\nTest: POST /api/push-notifications/test with Bearer token (per app login)");
