// ? USER APP CONFIG (CLEAN)

// Base API (MAIN)
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://user-api.apnadecoration.com/api"
    : "https://user-api.apnadecoration.com/api"; // Use production API for testing

// Image base
export const IMAGE_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://user-api.apnadecoration.com"
    : "https://user-api.apnadecoration.com"; // Use production API for testing

// Production domain for deployment
export const PRODUCTION_DOMAIN = "https://apnadecoration.com";

// Specific APIs
export const PRODUCT_API_URL = `${API_BASE_URL}/products`;
export const SERVICE_CATEGORY_API_URL = `${API_BASE_URL}/service-categories`;

// Razorpay
export const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;

// Validate Razorpay key in production
if (process.env.NODE_ENV === "production" && !RAZORPAY_KEY_ID) {
  throw new Error(
    "❌ CRITICAL: REACT_APP_RAZORPAY_KEY_ID environment variable is not set. Payment processing cannot begin without the Razorpay key configured.",
  );
}
