// API Configuration — production URLs for web + APK
const PRODUCTION_ADMIN = "https://admin-api.apnadecoration.com";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || PRODUCTION_ADMIN;

export const DELIVERY_API_URL =
  process.env.NEXT_PUBLIC_DELIVERY_API_URL ||
  `${PRODUCTION_ADMIN}/api/delivery-boy`;

export const DELIVERY_ORDERS_API_URL =
  process.env.NEXT_PUBLIC_DELIVERY_ORDERS_API_URL ||
  `${PRODUCTION_ADMIN}/api/delivery-orders`;

// App Configuration
export const APP_NAME = "APNA Decoration - Delivery Panel";
export const APP_VERSION = "1.0.0";

// Delivery Configuration
export const DELIVERY_CONFIG = {
  TRACKING_INTERVAL: 30000,
  MAX_DELIVERY_RADIUS: 50,
  MIN_DELIVERY_TIME: 30,
};

if (typeof window !== "undefined") {
  console.log("Delivery API config:", {
    DELIVERY_API_URL,
    DELIVERY_ORDERS_API_URL,
  });
}
