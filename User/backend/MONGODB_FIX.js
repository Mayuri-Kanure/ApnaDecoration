#!/usr/bin/env node

/**
 * MONGODB CONNECTION FIX GUIDE
 * 
 * Critical Issue: MongoDB Atlas not reachable
 * Error: querySrv ENOTFOUND _mongodb._tcp.apna-decoration.r8fey.mongodb.net
 * 
 * Root Causes & Solutions
 */

console.log("\n╔═══════════════════════════════════════════════════════════╗");
console.log("║         MONGODB CONNECTION TROUBLESHOOTING GUIDE          ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");

const guides = {
  issue: "querySrv ENOTFOUND _mongodb._tcp.apna-decoration.r8fey.mongodb.net",
  
  rootCauses: [
    "❌ No internet connection or DNS resolution failing",
    "❌ MongoDB Atlas IP whitelist doesn't include your IP",
    "❌ .env file missing MONGODB_URI",
    "❌ Incorrect connection string",
    "❌ Network firewall blocking MongoDB connection",
  ],

  solutions: {
    solution1_checkInternet: {
      title: "✅ SOLUTION 1: Check Internet Connection",
      steps: [
        "Open PowerShell and run: ping 8.8.8.8",
        "If you see 'Destination host unreachable' → Internet is down",
        "If you see response times → Internet is working",
      ],
      action: "Fix internet connection before proceeding",
    },

    solution2_configEnv: {
      title: "✅ SOLUTION 2: Configure .env File",
      steps: [
        "Create/Edit: User/backend/.env",
        "Add this line:",
        "MONGODB_URI=mongodb+srv://ishan:RU4X8Z3bCWxG5dFV@apna-decoration.r8fey.mongodb.net/apna-decoration?retryWrites=true&w=majority",
        "Save file",
        "Restart backend server: npm start",
      ],
      file_example: `
# User/backend/.env
MONGODB_URI=mongodb+srv://ishan:RU4X8Z3bCWxG5dFV@apna-decoration.r8fey.mongodb.net/apna-decoration?retryWrites=true&w=majority
DB_NAME=apna-decoration
NODE_ENV=development
PORT=5002
      `,
    },

    solution3_whitelistIP: {
      title: "✅ SOLUTION 3: Whitelist Your IP in MongoDB Atlas",
      steps: [
        "1. Go to: https://cloud.mongodb.com/",
        "2. Login with your account",
        "3. Navigate to: Cluster → Network Access",
        "4. Click 'Add IP Address'",
        "5. Either:",
        "   Option A: Add your current IP (Find it: https://whatismyipaddress.com/)",
        "   Option B: Add 0.0.0.0/0 (Allow all - ONLY for development)",
        "6. Click 'Confirm'",
        "7. Wait 5 minutes for whitelist to apply",
        "8. Try connecting again",
      ],
    },

    solution4_fallbackLocal: {
      title: "✅ SOLUTION 4: Use Local MongoDB (Development)",
      steps: [
        "Install MongoDB Community Edition: https://docs.mongodb.com/manual/administration/install-community/",
        "Start MongoDB service",
        "Create/Edit User/backend/.env:",
        "MONGODB_URI=mongodb://localhost:27017/apna-decoration",
        "Restart backend server",
      ],
      pros: "Works offline, faster for local development",
      cons: "Data not synced with production Atlas",
    },

    solution5_connectionString: {
      title: "✅ SOLUTION 5: Verify Connection String",
      steps: [
        "Your current: mongodb+srv://ishan:RU4X8Z3bCWxG5dFV@apna-decoration.r8fey.mongodb.net/apna-decoration",
        "Check each part:",
        "  ✓ Username: ishan (correct)",
        "  ✓ Password: RU4X8Z3bCWxG5dFV (correct)",
        "  ✓ Cluster: apna-decoration.r8fey (correct)",
        "  ✓ Database: apna-decoration (correct)",
        "If any part is wrong, update in .env",
      ],
    },
  },

  testConnection: {
    title: "🧪 TEST YOUR CONNECTION",
    command: `
cd User/backend
node -e "
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://ishan:RU4X8Z3bCWxG5dFV@apna-decoration.r8fey.mongodb.net/apna-decoration?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Connection failed:', err.message);
    process.exit(1);
  });
"
    `,
  },

  priorities: [
    "🔴 HIGH: Fix .env file (Solution 2)",
    "🔴 HIGH: Whitelist IP (Solution 3)",
    "🟡 MEDIUM: Check internet (Solution 1)",
    "🟢 LOW: Use local fallback (Solution 4)",
  ],

  nextSteps: [
    "1. Verify .env has correct MONGODB_URI",
    "2. Whitelist your IP in MongoDB Atlas",
    "3. Restart backend: npm start",
    "4. Run inventory monitoring (should work now)",
    "5. Run stock validation script",
  ],
};

// Print detailed guide
console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║                      ROOT CAUSES                           ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");
guides.rootCauses.forEach(cause => console.log(cause));

console.log("\n╔═══════════════════════════════════════════════════════════╗");
console.log("║                    QUICK FIX (5 min)                      ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");
console.log("1. Create User/backend/.env file");
console.log("2. Add:");
console.log("   MONGODB_URI=mongodb+srv://ishan:RU4X8Z3bCWxG5dFV@apna-decoration.r8fey.mongodb.net/apna-decoration?retryWrites=true&w=majority");
console.log("3. Save and restart backend");
console.log("4. Go to https://cloud.mongodb.com → Add your IP to whitelist");
console.log("5. Wait 5 minutes → Try again ✅");

console.log("\n╔═══════════════════════════════════════════════════════════╗");
console.log("║                    TEST CONNECTION                       ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");
console.log(guides.testConnection.command);

console.log("\n╔═══════════════════════════════════════════════════════════╗");
console.log("║                    PRIORITY CHECKLIST                    ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");
guides.priorities.forEach(p => console.log("  " + p));

console.log("\n" + "═".repeat(61) + "\n");
