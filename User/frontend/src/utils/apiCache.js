// Simple API caching to prevent duplicate calls
const cache = {};
const pendingRequests = {};

export const cachedApiCall = async (key, apiCallFunction) => {
  // Return cached result if available and not expired (5 minutes)
  if (cache[key] && Date.now() - cache[key].timestamp < 300000) {
    console.log(`🎯 Cache hit for ${key}`);
    return cache[key].data;
  }

  // If request is already pending, wait for it
  if (pendingRequests[key]) {
    console.log(`⏳ Request pending for ${key}, waiting...`);
    return pendingRequests[key];
  }

  // Make the API call
  console.log(`🌐 Making fresh API call for ${key}`);
  const promise = apiCallFunction();
  pendingRequests[key] = promise;

  try {
    const result = await promise;
    
    // Cache the result
    cache[key] = {
      data: result,
      timestamp: Date.now()
    };
    
    console.log(`✅ Cached result for ${key}`);
    return result;
  } catch (error) {
    console.error(`❌ API call failed for ${key}:`, error);
    throw error;
  } finally {
    // Clean up pending request
    delete pendingRequests[key];
  }
};

// Clear cache for specific key
export const clearCache = (key) => {
  delete cache[key];
  delete pendingRequests[key];
  console.log(`🗑️ Cache cleared for ${key}`);
};

// Clear all cache
export const clearAllCache = () => {
  Object.keys(cache).forEach(key => delete cache[key]);
  Object.keys(pendingRequests).forEach(key => delete pendingRequests[key]);
  console.log('🗑️ All cache cleared');
};
