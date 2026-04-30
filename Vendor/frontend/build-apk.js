const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("?? Building APK and AAB for Apna Decoration Vendor App...");

// Step 1: Build the React app
console.log("? Step 1: Building React app...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("?? React build completed");
} catch (error) {
  console.error("?? React build failed:", error);
  process.exit(1);
}

// Step 2: Sync with Capacitor
console.log("? Step 2: Syncing with Capacitor...");
try {
  execSync("npx cap sync android", { stdio: "inherit" });
  console.log("?? Capacitor sync completed");
} catch (error) {
  console.error("?? Capacitor sync failed:", error);
  process.exit(1);
}

// Step 3: Build APK (Debug) using Gradle
console.log("? Step 3: Building APK (Debug)...");
try {
  if (process.platform === 'win32') {
    execSync(
      "cd android && gradlew.bat assembleDebug",
      { stdio: "inherit", shell: true },
    );
  } else {
    execSync(
      "cd android && ./gradlew assembleDebug",
      { stdio: "inherit", shell: true },
    );
  }
  console.log("?? APK (Debug) build completed");
} catch (error) {
  console.error("?? APK (Debug) build failed:", error);
  process.exit(1);
}

// Step 4: Build APK (Release) using Gradle
console.log("? Step 4: Building APK (Release)...");
try {
  if (process.platform === 'win32') {
    execSync(
      "cd android && gradlew.bat assembleRelease",
      { stdio: "inherit", shell: true },
    );
  } else {
    execSync(
      "cd android && ./gradlew assembleRelease",
      { stdio: "inherit", shell: true },
    );
  }
  console.log("?? APK (Release) build completed");
} catch (error) {
  console.error("?? APK (Release) build failed:", error);
  process.exit(1);
}

// Step 5: Build AAB (Release) using Gradle
console.log("? Step 5: Building AAB (Release)...");
try {
  if (process.platform === 'win32') {
    execSync(
      "cd android && gradlew.bat bundleRelease",
      { stdio: "inherit", shell: true },
    );
  } else {
    execSync(
      "cd android && ./gradlew bundleRelease",
      { stdio: "inherit", shell: true },
    );
  }
  console.log("?? AAB (Release) build completed");
} catch (error) {
  console.error("?? AAB (Release) build failed:", error);
  process.exit(1);
}

console.log("?? All builds completed successfully!");
console.log("? APK and AAB files are ready in the output directory");
console.log("? Check: android/app/build/outputs/apk/debug/");
console.log("? Check: android/app/build/outputs/apk/release/");
console.log("? Check: android/app/build/outputs/bundle/release/");
