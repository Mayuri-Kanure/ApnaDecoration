/**
 * Backend Health Check - Diagnose API timeout issues
 * Usage: node scripts/check-backend-health.js
 */

const axios = require("axios");

const API_BASE = "https://admin-api.apnadecoration.com";

// Test delivery boy credentials (use real ones for testing)
const TEST_TOKEN = process.env.TEST_DELIVERY_BOY_TOKEN || null;

async function checkAPIHealth() {
  console.log("\n=== Backend Health Check ===\n");
  console.log(`API Base: ${API_BASE}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Test 1: Check if server is reachable
  console.log("1️⃣  Testing server connectivity...");
  try {
    const response = await axios.get(`${API_BASE}/api/health`, {
      timeout: 5000,
    });
    console.log("   ✓ Server is reachable");
    console.log(`   Status: ${response.status}`);
  } catch (error) {
    console.log("   ✗ Server is NOT reachable");
    if (error.code === "ECONNREFUSED") {
      console.log("   → Cause: Connection refused - backend server is not running");
    } else if (error.code === "ENOTFOUND") {
      console.log("   → Cause: Domain not found - check API URL");
    } else if (error.code === "ETIMEDOUT") {
      console.log("   → Cause: Connection timeout - server is slow or down");
    }
    console.log(`   Error: ${error.message}\n`);
    return;
  }

  // Test 2: Check dashboard endpoint (without auth)
  console.log("\n2️⃣  Testing /api/delivery-boy/dashboard endpoint...");
  try {
    const response = await axios.get(
      `${API_BASE}/api/delivery-boy/dashboard`,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${TEST_TOKEN || "test-token"}`,
        },
      }
    );
    console.log("   ✓ Endpoint responded successfully");
    console.log(`   Status: ${response.status}`);
    console.log(`   Response time: ${response.headers["x-response-time"] || "N/A"}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("   ⚠ Endpoint exists but needs authentication");
      console.log("   → This is expected without a valid token");
    } else if (error.code === "ECONNREFUSED") {
      console.log("   ✗ Connection refused");
    } else if (error.code === "ETIMEDOUT") {
      console.log("   ✗ Request timed out after 5 seconds");
      console.log("   → Backend is slow or database is not responding");
    } else {
      console.log(`   ✗ Error: ${error.message}`);
    }
  }

  // Test 3: Check orders endpoint
  console.log("\n3️⃣  Testing /api/delivery-orders/available endpoint...");
  try {
    const response = await axios.get(
      `${API_BASE}/api/delivery-orders/available`,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${TEST_TOKEN || "test-token"}`,
        },
      }
    );
    console.log("   ✓ Endpoint responded successfully");
    console.log(`   Status: ${response.status}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("   ⚠ Endpoint exists but needs authentication");
    } else if (error.code === "ETIMEDOUT") {
      console.log("   ✗ Request timed out after 5 seconds");
    } else {
      console.log(`   ✗ Error: ${error.message}`);
    }
  }

  // Test 4: Database connection check (backend should have /api/health)
  console.log("\n4️⃣  Checking backend logs location...");
  console.log("   📂 Backend logs: Admin/backend/logs/");
  console.log("   📝 Check these files for errors:");
  console.log("      - MongoDB connection errors");
  console.log("      - Unhandled promise rejections");
  console.log("      - API endpoint errors\n");

  // Recommendations
  console.log("\n=== Troubleshooting Guide ===\n");
  console.log("If the server is not reachable:");
  console.log("1. Check if backend server is running:");
  console.log("   cd Admin/backend");
  console.log("   npm start\n");
  console.log("2. Verify MongoDB is running:");
  console.log("   mongod  # or check MongoDB service status\n");
  console.log("3. Check for errors in backend logs:");
  console.log("   tail -f Admin/backend/logs/*.log\n");
  console.log("If the endpoint is slow:");
  console.log("1. Check the getDashboardStats() function in:");
  console.log("   Admin/backend/controllers/deliveryBoyController.js:486\n");
  console.log("2. Profile database queries:");
  console.log("   - DeliveryBoy.findById() might be slow");
  console.log("   - Add indexes if missing\n");
  console.log("3. Consider caching dashboard data with Redis\n");
}

// Test with a real token if provided
async function testWithRealToken() {
  if (!TEST_TOKEN) {
    console.log("\n📌 To test with real authentication:");
    console.log(
      "   Set TEST_DELIVERY_BOY_TOKEN environment variable with a valid token\n"
    );
    return;
  }

  console.log("Testing with provided token...\n");

  try {
    const response = await axios.get(
      `${API_BASE}/api/delivery-boy/dashboard`,
      {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
      }
    );

    console.log("✓ Dashboard data retrieved successfully:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    }
  }
}

checkAPIHealth()
  .then(() => testWithRealToken())
  .catch(console.error);
