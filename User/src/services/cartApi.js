// 🔒 STRICT API ACCESS POLICY - Makes repeated calls impossible by design
import apiService from './api';

// Global API call tracker for debugging
const apiCallTracker = {
  '/cart': { count: 0, timestamp: null },
  '/products': { count: 0, timestamp: null },
  '/categories': { count: 0, timestamp: null },
  '/service-categories': { count: 0, timestamp: null },
  '/banners/public': { count: 0, timestamp: null }
};

// Cart API wrapper with built-in protection against loops
export const cartApi = {
  // ⛔ PERMANENT GUARD: This can only be called once per app lifecycle
  fetchCartOnce: (() => {
    let called = false;
    return async () => {
      if (called) {
        console.log('🛑 cartApi.fetchCartOnce: Already called, blocking duplicate request');
        return null;
      }
      called = true;
      console.log('✅ cartApi.fetchCartOnce: First and only call');
      return apiService.getCart();
    };
  })(),

  // Safe cart operations that don't cause loops
  addToCart: (productId, quantity, specifications) => {
    return apiService.addToCart(productId, quantity, specifications);
  },

  updateCartItem: (itemId, quantity) => {
    return apiService.updateCartItem(itemId, quantity);
  },

  removeFromCart: (itemId) => {
    return apiService.removeFromCart(itemId);
  },

  clearCart: () => {
    return apiService.clearCart();
  },

  mergeGuestCart: (guestCartItems) => {
    return apiService.mergeGuestCart(guestCartItems);
  },

  getWishlist: () => {
    return apiService.getWishlist();
  },

  // Read-only operations (safe)
  getCartSummary: () => {
    return apiService.getCartSummary();
  },

  // Utility methods (no API calls)
  getCartCount: (cartItems) => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  },

  getCartTotal: (cartItems) => {
    return cartItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  }
};

// Export the safe wrapper as default
export default cartApi;
