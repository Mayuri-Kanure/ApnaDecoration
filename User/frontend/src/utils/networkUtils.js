// Network utility functions to handle API connectivity issues

let isApiDown = false;
let lastFailureTime = 0;
const FAILURE_COOLDOWN = 60000; // 1 minute cooldown

export const checkApiAvailability = async (url) => {
  // If API was recently marked as down, don't try again yet
  if (isApiDown && Date.now() - lastFailureTime < FAILURE_COOLDOWN) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // If we get here, API is responding
    isApiDown = false;
    return true;
  } catch (error) {
    console.log('API availability check failed:', error.message);
    isApiDown = true;
    lastFailureTime = Date.now();
    return false;
  }
};

export const markApiDown = () => {
  isApiDown = true;
  lastFailureTime = Date.now();
};

export const isApiCurrentlyDown = () => {
  return isApiDown && Date.now() - lastFailureTime < FAILURE_COOLDOWN;
};

export const withNetworkFallback = async (apiCall, fallbackData, operation = 'API operation') => {
  // Check if API is available before attempting
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const isAvailable = await checkApiAvailability(`${apiUrl}/api/health`);
  
  if (!isAvailable) {
    console.log(`${operation} skipped - API appears to be down, using fallback data`);
    return { success: true, data: fallbackData, fallback: true };
  }

  try {
    const result = await apiCall();
    return { success: true, data: result, fallback: false };
  } catch (error) {
    console.error(`${operation} failed:`, error);
    markApiDown();
    return { success: true, data: fallbackData, fallback: true };
  }
};
