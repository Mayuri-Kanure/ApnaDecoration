#!/bin/bash

# Mobile APK Build Script for APNA DECORATION
# This script builds production APKs with correct URLs

set -e

echo "📱 Building production APKs for APNA DECORATION..."

# Configuration
USER_APP_DIR="./User"
ANDROID_DIR="$USER_APP_DIR/android"
BUILD_DIR="$USER_APP_DIR/build"
APK_OUTPUT_DIR="./apks"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create output directory
print_status "Creating APK output directory..."
mkdir -p "$APK_OUTPUT_DIR"

# Navigate to user app directory
cd "$USER_APP_DIR"

# Check if Node modules are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
fi

# Update environment variables for production
print_status "Updating environment variables for production..."
cat > .env.production << EOF
# Production Environment Variables
REACT_APP_API_BASE_URL=https://user-api.apnadecoration.com
REACT_APP_IMAGE_BASE_URL=https://admin-api.apnadecoration.com
REACT_APP_PRODUCT_API_URL=https://admin-api.apnadecoration.com/api
REACT_APP_SERVICE_CATEGORY_API_URL=https://admin-api.apnadecoration.com/api

# Compatibility (legacy Vite keys)
VITE_API_BASE_URL=https://user-api.apnadecoration.com
VITE_IMAGE_BASE_URL=https://admin-api.apnadecoration.com
VITE_PRODUCT_API_URL=https://admin-api.apnadecoration.com/api

# App Configuration
REACT_APP_APP_NAME=APNA DECORATION
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# API Configuration
REACT_APP_API_TIMEOUT=30000
REACT_APP_RETRY_ATTEMPTS=3

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_CRASH_REPORTING=true
REACT_APP_ENABLE_PUSH_NOTIFICATIONS=true
EOF

# Copy production environment to .env
cp .env.production .env

# Build the React app
print_status "Building React application..."
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build failed - build directory not found"
    exit 1
fi

# Check if Capacitor is installed
if [ ! -d "android" ]; then
    print_status "Initializing Capacitor for Android..."
    npx cap init "APNA DECORATION" "com.apnadecoration.app" --web-dir="build"
    npx cap add android
else
    print_status "Updating Capacitor configuration..."
    npx cap sync android
fi

# Update Android app configuration
print_status "Updating Android app configuration..."
cat > android/app/src/main/AndroidManifest.xml << EOF
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.apnadecoration.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>
EOF

# Create network security configuration
mkdir -p android/app/src/main/res/xml
cat > android/app/src/main/res/xml/network_security_config.xml << EOF
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">apnadecoration.com</domain>
        <domain includeSubdomains="true">admin-api.apnadecoration.com</domain>
        <domain includeSubdomains="true">user-api.apnadecoration.com</domain>
    </domain-config>
</network-security-config>
EOF

# Update app strings
cat > android/app/src/main/res/values/strings.xml << EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">APNA DECORATION</string>
    <string name="package_name">com.apnadecoration.app</string>
</resources>
EOF

# Check if Android SDK is available
if ! command -v adb &> /dev/null; then
    print_warning "Android SDK not found. Please install Android Studio and set up ANDROID_HOME"
fi

# Build APK
print_status "Building APK..."
cd android

# Check if Gradle wrapper exists
if [ ! -f "gradlew" ]; then
    print_error "Gradle wrapper not found. Please run 'gradle wrapper' in Android project"
    exit 1
fi

# Make gradlew executable
chmod +x gradlew

# Clean previous builds
./gradlew clean

# Build debug APK
print_status "Building debug APK..."
./gradlew assembleDebug

# Build release APK (if release keystore is available)
if [ -f "app/release-key.keystore" ]; then
    print_status "Building release APK..."
    ./gradlew assembleRelease
fi

# Copy APKs to output directory
print_status "Copying APKs to output directory..."
cp app/build/outputs/apk/debug/*.apk "../../../$APK_OUTPUT_DIR/" 2>/dev/null || true
cp app/build/outputs/apk/release/*.apk "../../../$APK_OUTPUT_DIR/" 2>/dev/null || true

# Go back to project root
cd ../..

# List generated APKs
print_status "Generated APKs:"
ls -la "$APK_OUTPUT_DIR"/*.apk 2>/dev/null || print_warning "No APKs found"

# Create APK information file
cat > "$APK_OUTPUT_DIR/APK_INFO.txt" << EOF
APNA DECORATION - Mobile APK Information
========================================

Build Date: $(date)
Build Environment: Production
App Name: APNA DECORATION
Package Name: com.apnadecoration.app
Version: 1.0.0

API Endpoints:
- User API: https://user-api.apnadecoration.com
- Admin API: https://admin-api.apnadecoration.com
- Image Base: https://admin-api.apnadecoration.com

Features:
- Product browsing and search
- Shopping cart management
- Order placement and tracking
- User authentication
- Push notifications
- Location services
- Camera access for product images

Security:
- HTTPS communication only
- Network security configuration
- Certificate pinning ready

Installation:
1. Enable "Unknown Sources" in Android settings
2. Download and install the APK
3. Grant necessary permissions
4. Launch the app

Support: support@apnadecoration.com
EOF

print_status "🎉 APK build process completed!"
echo ""
echo "📱 APK Location: $APK_OUTPUT_DIR"
echo "📋 APK Information: $APK_OUTPUT_DIR/APK_INFO.txt"
echo ""
echo "🚀 Next Steps:"
echo "1. Test the APK on Android devices"
echo "2. Upload to Google Play Store"
echo "3. Distribute to users"
echo ""
echo "⚠️  Remember to test all functionality before distribution!"
