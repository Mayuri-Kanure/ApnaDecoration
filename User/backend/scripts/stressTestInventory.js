/**
 * INVENTORY STRESS TEST
 * Simulates high-load scenarios to test system robustness
 */

const mongoose = require("mongoose");
const { Product, VendorProduct, StockReservation } = require("../models");
const axios = require("axios");

class InventoryStressTest {
  constructor() {
    this.baseURL = "http://localhost:5002/api";
    this.testResults = [];
  }

  /**
   * Run comprehensive stress test
   */
  async runStressTest() {
    console.log("🚀 Starting Inventory Stress Test...\n");

    try {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/apna-decoration",
      );
      console.log("✅ Connected to database\n");

      // Test 1: Concurrent reservations
      await this.testConcurrentReservations();

      // Test 2: Duplicate requests
      await this.testDuplicateRequests();

      // Test 3: Payment failure scenarios
      await this.testPaymentFailureScenarios();

      // Test 4: Network retry scenarios
      await this.testNetworkRetry();

      // Test 5: Data corruption scenarios
      await this.testDataCorruption();

      this.printResults();
    } catch (error) {
      console.error("❌ Stress test error:", error);
    } finally {
      await mongoose.connection.close();
    }
  }

  /**
   * Test 1: Multiple users reserving same product
   */
  async testConcurrentReservations() {
    console.log("🔄 Test 1: Concurrent Reservations");

    const testProduct = await Product.findOne({ stock: { $gt: 10 } });
    if (!testProduct) {
      console.log("❌ No suitable product found for concurrent test");
      return;
    }

    const concurrentRequests = [];
    const userCount = 20;
    const requestsPerUser = 3;

    // Create concurrent requests
    for (let userId = 1; userId <= userCount; userId++) {
      for (let req = 1; req <= requestsPerUser; req++) {
        concurrentRequests.push({
          userId: `test_user_${userId}`,
          productId: testProduct._id,
          quantity: 1,
          requestId: `user_${userId}_req_${req}`,
        });
      }
    }

    console.log(
      `Launching ${concurrentRequests.length} concurrent requests...`,
    );

    // Execute all requests simultaneously
    const startTime = Date.now();
    const results = await Promise.allSettled(
      concurrentRequests.map((req) => this.makeReservationRequest(req)),
    );

    const endTime = Date.now();
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.filter(
      (r) => r.status === "rejected" || !r.value.success,
    ).length;
    const oversells = results.filter(
      (r) =>
        r.status === "fulfilled" &&
        r.value.success &&
        r.value.data?.includes("oversell"),
    ).length;

    this.testResults.push({
      test: "CONCURRENT_RESERVATIONS",
      totalRequests: concurrentRequests.length,
      successful,
      failed,
      oversells,
      duration: endTime - startTime,
      passed: oversells === 0 && successful <= testProduct.stock,
    });

    console.log(
      `  ✅ Successful: ${successful}, Failed: ${failed}, Oversells: ${oversells}`,
    );
  }

  /**
   * Test 2: Duplicate requests with same idempotency
   */
  async testDuplicateRequests() {
    console.log("🔄 Test 2: Duplicate Requests");

    const testProduct = await Product.findOne();
    const userId = "duplicate_test_user";
    const idempotencyKey = "test_key_" + Date.now();

    const duplicateRequests = [
      { userId, productId: testProduct._id, quantity: 1, idempotencyKey },
      { userId, productId: testProduct._id, quantity: 1, idempotencyKey },
      { userId, productId: testProduct._id, quantity: 1, idempotencyKey },
    ];

    const results = await Promise.allSettled(
      duplicateRequests.map((req) => this.makeReservationRequest(req)),
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const duplicates = results.filter(
      (r) =>
        r.status === "fulfilled" &&
        r.value.success &&
        r.value.data?.includes("already exists"),
    ).length;

    this.testResults.push({
      test: "DUPLICATE_REQUESTS",
      totalRequests: duplicateRequests.length,
      successful,
      duplicates,
      passed: duplicates === 2 && successful === 1, // Should have 1 success, 2 duplicates
    });

    console.log(
      `  ✅ Successful: ${successful}, Duplicates handled: ${duplicates}`,
    );
  }

  /**
   * Test 3: Payment failure and stock release
   */
  async testPaymentFailureScenarios() {
    console.log("🔄 Test 3: Payment Failure Scenarios");

    const testProduct = await Product.findOne({ stock: { $gt: 5 } });
    const userId = "payment_failure_test_user";

    // Step 1: Reserve stock
    const reservation = await this.makeReservationRequest({
      userId,
      productId: testProduct._id,
      quantity: 2,
    });

    if (!reservation.success) {
      console.log("❌ Initial reservation failed");
      return;
    }

    const reservationToken = reservation.value.data?.reservationToken;
    if (!reservationToken) {
      console.log("❌ No reservation token received");
      return;
    }

    // Step 2: Simulate payment failure by releasing reservation
    const releaseResult = await this.makeReleaseRequest({
      reservationToken,
    });

    // Step 3: Check if stock was properly restored
    const productAfterRelease = await Product.findById(testProduct._id);
    const stockRestored = productAfterRelease.stock >= testProduct.stock;

    this.testResults.push({
      test: "PAYMENT_FAILURE_RELEASE",
      stockBefore: testProduct.stock,
      stockAfter: productAfterRelease.stock,
      stockRestored,
      passed: stockRestored,
    });

    console.log(`  ✅ Stock restored: ${stockRestored}`);
  }

  /**
   * Test 4: Network retry scenarios
   */
  async testNetworkRetry() {
    console.log("🔄 Test 4: Network Retry");

    const testProduct = await Product.findOne({ stock: { $gt: 3 } });
    const userId = "retry_test_user";

    // Simulate network retries with same request
    const retryRequests = [];
    for (let attempt = 1; attempt <= 5; attempt++) {
      retryRequests.push({
        userId,
        productId: testProduct._id,
        quantity: 1,
        attempt,
      });
    }

    const results = await Promise.allSettled(
      retryRequests.map((req) => this.makeReservationRequest(req)),
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const retries = results.filter(
      (r) =>
        r.status === "fulfilled" &&
        r.value.success &&
        r.value.data?.includes("already exists"),
    ).length;

    this.testResults.push({
      test: "NETWORK_RETRY",
      totalRequests: retryRequests.length,
      successful,
      retries,
      passed: successful === 1 && retries >= 3, // Should have 1 success, multiple retries
    });

    console.log(`  ✅ Successful: ${successful}, Retries handled: ${retries}`);
  }

  /**
   * Test 5: Data corruption scenarios
   */
  async testDataCorruption() {
    console.log("🔄 Test 5: Data Corruption");

    // Test negative stock handling
    const testProduct = await Product.findOne();

    try {
      // Try to set negative stock directly in DB
      await Product.findByIdAndUpdate(testProduct._id, { $set: { stock: -5 } });

      const corruptedProduct = await Product.findById(testProduct._id);
      const hasNegativeStock = corruptedProduct.stock < 0;

      // Restore correct stock
      await Product.findByIdAndUpdate(testProduct._id, {
        $set: { stock: testProduct.stock },
      });

      this.testResults.push({
        test: "DATA_CORRUPTION",
        negativeStockAllowed: hasNegativeStock,
        passed: !hasNegativeStock,
      });

      console.log(`  ✅ Negative stock prevented: ${!hasNegativeStock}`);
    } catch (error) {
      this.testResults.push({
        test: "DATA_CORRUPTION",
        negativeStockAllowed: true,
        passed: false,
        error: error.message,
      });

      console.log(`  ❌ Negative stock allowed: ${error.message}`);
    }
  }

  /**
   * Make reservation request
   */
  async makeReservationRequest(request) {
    try {
      const response = await axios.post(
        `${this.baseURL}/inventory/reserve`,
        {
          items: [
            {
              product: request.productId,
              productModel: "Product",
              quantity: request.quantity,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test_token_${request.userId}`,
          },
          timeout: 5000,
        },
      );

      return {
        status: "fulfilled",
        success: response.data.success,
        data: JSON.stringify(response.data),
      };
    } catch (error) {
      return {
        status: "rejected",
        error: error.message,
      };
    }
  }

  /**
   * Make release request
   */
  async makeReleaseRequest(request) {
    try {
      const response = await axios.post(
        `${this.baseURL}/inventory/release`,
        {
          reservationToken: request.reservationToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test_token",
          },
          timeout: 5000,
        },
      );

      return {
        status: "fulfilled",
        success: response.data.success,
        data: response.data,
      };
    } catch (error) {
      return {
        status: "rejected",
        error: error.message,
      };
    }
  }

  /**
   * Print comprehensive test results
   */
  printResults() {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 STRESS TEST RESULTS");
    console.log("=".repeat(60) + "\n");

    let passedTests = 0;
    let totalTests = this.testResults.length;

    this.testResults.forEach((result) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(
        `${status} ${result.test}: ${result.passed ? "PASSED" : "FAILED"}`,
      );

      if (result.passed) passedTests++;

      // Print details for failed tests
      if (!result.passed) {
        console.log(`    Details:`, result);
      }
    });

    console.log("\n📊 SUMMARY:");
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}`);
    console.log(`  Failed: ${totalTests - passedTests}`);
    console.log(
      `  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`,
    );

    if (passedTests === totalTests) {
      console.log("\n🎉 ALL TESTS PASSED - SYSTEM IS PRODUCTION READY!");
    } else {
      console.log("\n⚠️ SOME TESTS FAILED - REVIEW BEFORE PRODUCTION");
    }

    console.log("=".repeat(60));
  }
}

// Run stress test if called directly
if (require.main === module) {
  const stressTest = new InventoryStressTest();
  stressTest.runStressTest();
}

module.exports = InventoryStressTest;
