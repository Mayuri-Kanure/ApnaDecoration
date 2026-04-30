// Robust fetch utility with SSL error handling and fallbacks

// List of API endpoints to try in order
const API_ENDPOINTS = [
  "https://user-api.apnadecoration.com/api", // User API HTTPS only - NO FALLBACKS
];

// Track which endpoints are working
const endpointStatus = new Map();

// Check if an error is SSL-related or connection-related
const isNetworkError = (error) => {
  return (
    error.message &&
    (error.message.includes("ERR_SSL_PROTOCOL_ERROR") ||
      error.message.includes("SSL") ||
      error.message.includes("certificate") ||
      error.message.includes("net::ERR_SSL") ||
      error.message.includes("ERR_CONNECTION_RESET") ||
      error.message.includes("ERR_CONNECTION_REFUSED") ||
      error.message.includes("forcibly closed") ||
      error.message.includes("ECONNRESET") ||
      error.message.includes("Network Error"))
  );
};

// Check if error is transient/retryable
const isTransientError = (error, status) => {
  return (
    status === 408 || // Request Timeout
    status === 429 || // Too Many Requests
    status === 500 || // Internal Server Error (can be transient)
    status === 502 || // Bad Gateway
    status === 503 || // Service Unavailable
    status === 504 || // Gateway Timeout
    error.name === "AbortError" || // Timeout
    isNetworkError(error)
  );
};

// Exponential backoff delay
const getRetryDelay = (attempt) => {
  // 100ms * 2^attempt + random jitter (0-100ms)
  const baseDelay = 100 * Math.pow(2, attempt);
  const jitter = Math.random() * 100;
  return Math.min(baseDelay + jitter, 10000); // Cap at 10 seconds
};

// Robust fetch with retry logic and fallback endpoints
export const robustFetch = async (path, options = {}) => {
  const timeout = options.timeout || 15000; // Increased from 5s to 15s
  const maxRetries = options.maxRetries !== undefined ? options.maxRetries : 3;
  let lastError;

  // Try each endpoint until one works
  for (const baseUrl of API_ENDPOINTS) {
    // Skip if we know this endpoint is down
    if (endpointStatus.get(baseUrl) === false) {
      continue;
    }

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        if (attempt > 0) {
          const delay = getRetryDelay(attempt - 1);
          console.log(
            `🔄 Retry attempt ${attempt}/${maxRetries} for ${baseUrl}${path} (waiting ${Math.round(delay)}ms)`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.log(`🔍 Trying endpoint: ${baseUrl}${path}`);
        }

        const response = await fetch(`${baseUrl}${path}`, {
          ...options,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            // Add auth token if available
            ...(localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          // Mark this endpoint as working
          endpointStatus.set(baseUrl, true);
          console.log(`✅ Success with endpoint: ${baseUrl}${path}`);
          return response;
        } else if (response.status === 401) {
          // For 401 errors, don't retry - it's an auth issue
          console.warn(`🔐 Authentication failed (401): ${baseUrl}${path}`);
          endpointStatus.set(baseUrl, false);
          throw new Error("Authentication failed - please login again");
        } else if (isTransientError(null, response.status)) {
          // Transient error - retry
          console.warn(
            `⚠️ Transient error ${response.status} from ${baseUrl}${path}, retrying...`,
          );
          lastError = new Error(`HTTP ${response.status}`);
          if (attempt === maxRetries) {
            endpointStatus.set(baseUrl, false);
            break; // Try next endpoint
          }
          continue; // Retry
        } else {
          // Permanent error - don't retry
          console.warn(
            `❌ Endpoint returned permanent error ${response.status}: ${baseUrl}${path}`,
          );
          endpointStatus.set(baseUrl, false);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        clearTimeout(timeoutId);

        if (isTransientError(error, 0)) {
          lastError = error;
          console.error(
            `⚠️ Transient error on ${baseUrl}${path}: ${error.message}`,
          );

          if (attempt === maxRetries) {
            console.log(
              `❌ Max retries reached for ${baseUrl}${path}, trying next endpoint`,
            );
            endpointStatus.set(baseUrl, false);
            break; // Try next endpoint
          }
          continue; // Retry with backoff
        } else {
          // Permanent error
          console.error(`❌ Endpoint failed: ${baseUrl}${path}`, error.message);
          endpointStatus.set(baseUrl, false);

          if (error.message.includes("Authentication failed")) {
            throw error;
          }
          break; // Try next endpoint
        }
      }
    }
  }

  throw (
    lastError ||
    new Error("All API endpoints failed - servers may be down")
  );
};

// Fetch with automatic retry and fallback data
export const fetchWithFallback = async (path, fallbackData, options = {}) => {
  try {
    const response = await robustFetch(path, options);
    const data = await response.json();
    return { success: true, data, fallback: false };
  } catch (error) {
    console.error(
      `🔄 All endpoints failed for ${path}, using fallback:`,
      error.message,
    );
    return { success: true, data: fallbackData, fallback: true };
  }
};

// Reset endpoint status (call this when you want to retry all endpoints)
export const resetEndpointStatus = () => {
  endpointStatus.clear();
  console.log("🔄 Endpoint status reset - will retry all endpoints");
};

// Get status of all endpoints (for debugging)
export const getEndpointStatus = () => {
  return Object.fromEntries(endpointStatus);
};
