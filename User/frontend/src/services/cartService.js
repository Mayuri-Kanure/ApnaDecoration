import apiService from "./api";

class CartService {
  // Get cart items
  async getCart() {
    try {
      const response = await apiService.get("/cart");
      return response;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(productId, quantity = 1, specifications = {}) {
    try {
      const response = await apiService.post("/cart", {
        productId,
        quantity,
        specifications,
      });
      return response;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(itemId, quantity) {
    try {
      const response = await apiService.put(`/cart/items/${itemId}`, {
        quantity,
      });
      return response;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(itemId) {
    try {
      const response = await apiService.delete(`/cart/items/${itemId}`);
      return response;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart() {
    try {
      const response = await apiService.delete("/cart");
      return response;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }

  // Merge guest cart with user cart (on login)
  async mergeGuestCart(guestCartItems) {
    try {
      const response = await apiService.post("/cart/merge", {
        guestCartItems,
      });
      return response;
    } catch (error) {
      console.error("Error merging guest cart:", error);
      throw error;
    }
  }

  // Get cart summary for checkout
  async getCartSummary() {
    try {
      const response = await apiService.get("/cart/summary");
      return response;
    } catch (error) {
      console.error("Error fetching cart summary:", error);
      throw error;
    }
  }

  // Calculate cart totals locally (fallback)
  calculateTotals(cartItems) {
    const totalItems = cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    const totalAmount = cartItems.reduce(
      (total, item) => total + item.quantity * item.unit_price,
      0,
    );

    return {
      totalItems,
      totalAmount,
      formattedTotal: `₹${totalAmount.toFixed(2)}`,
    };
  }

  // Validate cart item stock
  validateCartItemStock(cartItem, availableStock) {
    return cartItem.quantity <= availableStock;
  }

  // Check if cart has valid items
  validateCartItems(cartItems) {
    return cartItems.every(
      (item) =>
        item.quantity > 0 && item.unit_price >= 0 && item.product && item.name,
    );
  }

  // Get cart count for badge
  getCartCount(cartItems) {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  // Check if product is in cart
  isProductInCart(cartItems, productId, specifications = {}) {
    return cartItems.some(
      (item) =>
        item.product === productId &&
        JSON.stringify(item.specifications || {}) ===
          JSON.stringify(specifications),
    );
  }

  // Get cart item by product ID
  getCartItemByProduct(cartItems, productId, specifications = {}) {
    return cartItems.find(
      (item) =>
        item.product === productId &&
        JSON.stringify(item.specifications || {}) ===
          JSON.stringify(specifications),
    );
  }

  // Format cart items for display
  formatCartItems(cartItems) {
    return cartItems.map((item) => ({
      id: item.id || item._id,
      _id: item._id,
      product: item.product,
      name: item.name || item.product_name_en,
      product_name_en: item.product_name_en || item.name,
      description: item.description,
      price: item.unit_price,
      unit_price: item.unit_price,
      quantity: item.quantity,
      totalPrice: item.total_price || item.quantity * item.unit_price,
      thumbnail: item.thumbnail,
      images: item.images || [item.thumbnail],
      stock: item.stock,
      category: item.category,
      specifications: item.specifications || {},
      addedAt: item.addedAt,
    }));
  }

  // Prepare cart for checkout
  prepareCartForCheckout(cartItems) {
    return cartItems.map((item) => ({
      productId: item.product,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price || item.quantity * item.unit_price,
      specifications: item.specifications || {},
      thumbnail: item.thumbnail,
    }));
  }
}

const cartService = new CartService();
export default cartService;
