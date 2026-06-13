/**
 * Service Detection Utility
 * 
 * Robust detection logic to identify whether a product is a service or physical item
 * Handles multiple data structure formats from different sources
 */

/**
 * Determine if a product is a service using multiple detection strategies
 * 
 * Checks in priority order:
 * 1. Explicit type field (type === "service")
 * 2. Explicit isService flag
 * 3. Service-specific fields (serviceType, setupTimeSlot, eventInfo)
 * 4. Service collection indicator (source === "service")
 * 5. Price heuristic (decorative packages are typically high-value services)
 * 
 * @param {Object} product - The product object to check
 * @returns {Boolean} true if product is a service, false if physical product
 */
export const isProductService = (product) => {
  if (!product) return false;

  // Strategy 1: Explicit type field (most reliable)
  if (product.type === "service") {
    console.log(`✅ Service detected via type field: ${product.name}`);
    return true;
  }

  // Strategy 2: Explicit isService flag
  if (product.isService === true) {
    console.log(`✅ Service detected via isService flag: ${product.name}`);
    return true;
  }

  // Strategy 3: Service-specific schema fields
  // These fields only exist on Service model documents
  if (
    product.serviceType ||
    product.setupTimeSlot ||
    product.eventInfo ||
    product.customizationAvailable ||
    (Array.isArray(product.availableSlots) && product.availableSlots.length > 0)
  ) {
    console.log(`✅ Service detected via serviceType/eventInfo: ${product.name}`);
    return true;
  }

  // Strategy 4: Source indicator from backend
  if (product.source === "service") {
    console.log(`✅ Service detected via source field: ${product.name}`);
    return true;
  }

  // Strategy 5: Collection/Model heuristic
  // If product came from services endpoint or has service metadata
  if (
    product.sku === "SERVICE" ||
    product.__collection === "services" ||
    product.model === "Service"
  ) {
    console.log(`✅ Service detected via collection indicator: ${product.name}`);
    return true;
  }

  // Strategy 6: Price heuristic (optional, for edge cases)
  // Decoration services typically higher-priced than physical products
  // Only use if above checks inconclusive
  if (
    product.price >= 5000 &&
    product.name &&
    /decor|wedding|stage|event|package|celebration/i.test(product.name)
  ) {
    console.log(
      `⚠️ Service detected via price + name heuristic: ${product.name}`
    );
    return true;
  }

  // Default: Treat as physical product
  console.log(`📦 Physical product detected: ${product.name}`);
  return false;
};

/**
 * Get the correct route for navigating to product/service detail page
 * 
 * @param {Object} product - The product object
 * @returns {String} The correct route path
 */
export const getProductRoute = (product) => {
  const id = product._id || product.id;
  if (!id) {
    console.warn("⚠️ Product missing ID:", product.name);
    return "/";
  }

  const isService = isProductService(product);
  const route = isService ? `/service/${id}` : `/product/${id}`;
  
  console.log(`🔗 Routing ${product.name}: type="${product.type}" -> isService=${isService} -> route="${route}`);
  
  return route;
};

/**
 * Get human-readable product type label
 * 
 * @param {Object} product - The product object
 * @returns {String} Label for UI display
 */
export const getProductTypeLabel = (product) => {
  if (isProductService(product)) {
    return "Service";
  } else if (product.type === "vendor-product") {
    return "Vendor Product";
  }
  return "Product";
};

/**
 * Get product category for classification
 * 
 * @param {Object} product - The product object
 * @returns {String} Category type
 */
export const getProductCategory = (product) => {
  if (isProductService(product)) return "service";
  if (product.type === "vendor-product" || product.vendorId) return "vendor";
  return "product";
};

/**
 * Log complete product detection debug info
 * Useful for debugging data consistency issues
 * 
 * @param {Object} product - The product object
 */
export const logProductDebugInfo = (product) => {
  console.group(`🔍 Product Debug Info: ${product.name}`);
  console.log("Product Object:", product);
  console.log("Type:", product.type);
  console.log("isService:", product.isService);
  console.log("serviceType:", product.serviceType);
  console.log("setupTimeSlot:", product.setupTimeSlot);
  console.log("eventInfo:", product.eventInfo);
  console.log("customizationAvailable:", product.customizationAvailable);
  console.log("vendorId:", product.vendorId);
  console.log("source:", product.source);
  console.log("sku:", product.sku);
  console.log("Detected as Service:", isProductService(product));
  console.log("Route:", getProductRoute(product));
  console.log("Category:", getProductCategory(product));
  console.groupEnd();
};

export default {
  isProductService,
  getProductRoute,
  getProductTypeLabel,
  getProductCategory,
  logProductDebugInfo,
};
