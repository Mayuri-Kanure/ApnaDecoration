// Global configuration for VENDOR APP
const PRODUCTION_API = "https://user-api.apnadecoration.com/api";
const PRODUCTION_IMAGE = "https://user-api.apnadecoration.com";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? PRODUCTION_API
    : PRODUCTION_API);

export const IMAGE_BASE_URL =
  process.env.REACT_APP_IMAGE_URL ||
  (process.env.NODE_ENV === "production"
    ? PRODUCTION_IMAGE
    : PRODUCTION_IMAGE);

// App specific constants
export const APP_TYPE = "VENDOR";
export const APP_VERSION = "1.0.0";

if (typeof window !== "undefined") {
  console.log("Vendor API config:", {
    API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}
