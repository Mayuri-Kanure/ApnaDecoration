// Global configuration for DELIVERY APP
// Use production API for live, local for development
export const API_BASE_URL = 
  (process.env.NODE_ENV === 'production') 
    ? "https://user-api.apnadecoration.com/api" 
    : "http://localhost:5002/api";

export const DELIVERY_API_URL = 
  (process.env.NODE_ENV === 'production') 
    ? "https://user-api.apnadecoration.com/api" 
    : "http://localhost:5002/api";

// App specific constants
export const APP_TYPE = 'DELIVERY';
export const APP_VERSION = '1.0.0';

// Debug: Show current configuration
console.log("🔗 DELIVERY API CONFIGURATION:", {
  API_BASE_URL: (process.env.NODE_ENV === 'production') 
    ? "https://user-api.apnadecoration.com/api" 
    : "http://localhost:5002/api",
  DELIVERY_API_URL: (process.env.NODE_ENV === 'production') 
    ? "https://user-api.apnadecoration.com/api" 
    : "http://localhost:5002/api",
  NODE_ENV: process.env.NODE_ENV || "development",
});
