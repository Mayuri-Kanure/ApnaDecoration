/**
 * TEST STOCK VALIDATION
 * Quick test to verify out-of-stock products can't be added to cart
 */

import { canAddToCart, isProductInStock } from "./stockValidator.js";

console.log("🧪 Testing Stock Validation System...\n");

// Test cases
const testCases = [
  {
    name: "Out of Stock Product",
    product: {
      id: "test1",
      name: "Test Product Out of Stock",
      stock: 0,
      price: 999,
    },
    quantity: 1,
    expectedBlocked: true,
    expectedMessage: "This item is currently out of stock",
  },
  {
    name: "Low Stock Product (1 available)",
    product: {
      id: "test2",
      name: "Test Product Low Stock",
      stock: 1,
      price: 999,
    },
    quantity: 2,
    expectedBlocked: true,
    expectedMessage: "Only 1 item(s) available. You requested 2.",
  },
  {
    name: "In Stock Product (5 available)",
    product: {
      id: "test3",
      name: "Test Product In Stock",
      stock: 5,
      price: 999,
    },
    quantity: 1,
    expectedBlocked: false,
    expectedMessage: "",
  },
  {
    name: "High Quantity Request",
    product: {
      id: "test4",
      name: "Test Product High Stock",
      stock: 10,
      price: 999,
    },
    quantity: 15,
    expectedBlocked: true,
    expectedMessage: "Only 10 item(s) available. You requested 15.",
  },
];

console.log("Running test cases...\n");

testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);

  const result = canAddToCart(testCase.product, testCase.quantity);

  console.log(`  Expected Blocked: ${testCase.expectedBlocked}`);
  console.log(`  Actually Blocked: ${!result.allowed}`);
  console.log(`  Expected Message: ${testCase.expectedMessage}`);
  console.log(`  Actual Message: ${result.message}`);

  // Check if test passed
  const testPassed =
    result.allowed === !testCase.expectedBlocked ||
    (result.allowed === testCase.expectedBlocked &&
      result.message === testCase.expectedMessage);

  const status = testPassed ? "✅ PASS" : "❌ FAIL";

  console.log(`  Result: ${status}\n`);

  if (!testPassed) {
    console.log(`  ❌ Issue: ${result.message}`);
    console.log(`  💡 Expected: ${testCase.expectedMessage}`);
  }
});

console.log("\n📊 TEST SUMMARY:");
console.log("=".repeat(50));

const passedTests = testCases.filter((test) => {
  const result = canAddToCart(test.product, test.quantity);
  return (
    !result.allowed === test.expectedBlocked ||
    (result.allowed === test.expectedBlocked &&
      result.message === test.expectedMessage)
  );
}).length;

const failedTests = testCases.length - passedTests;

console.log(`Total Tests: ${testCases.length}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(
  `Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`,
);

if (failedTests === 0) {
  console.log("\n🎉 ALL TESTS PASSED! Stock validation is working correctly.");
} else {
  console.log("\n⚠️ SOME TESTS FAILED! Check the implementation.");
}

console.log("\n" + "=".repeat(50));
