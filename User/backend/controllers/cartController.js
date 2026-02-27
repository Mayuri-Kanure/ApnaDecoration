const { CartService } = require('../services');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');

const cartController = {
  // Get user's cart
  getCart: async (req, res) => {
    try {
      console.log('🛒 Cart Controller - getCart called');
      console.log('🛒 User from auth middleware:', req.user);
      
      const userId = req.user.userId;
      console.log('🛒 Extracted userId:', userId);
      
      const cart = await CartService.getUserCart(userId);
      console.log('🛒 Cart retrieved successfully:', cart);
      
      res.json({
        success: true,
        data: cart
      });
    } catch (error) {
      console.error('🛒 Cart Controller Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cart',
        error: error.message
      });
    }
  },

  // Add item to cart
  addToCart: async (req, res) => {
    try {
      console.log('🛒 Backend addToCart called');
      console.log('🛒 Request body:', req.body);
      console.log('🛒 User from auth middleware:', req.user);
      
      const { productId, quantity = 1 } = req.body;
      const userId = req.user.userId;
      
      console.log('🛒 Extracted - productId:', productId);
      console.log('🛒 Extracted - quantity:', quantity);
      console.log('🛒 Extracted - userId:', userId);
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }
      
      const cart = await CartService.addToCart(userId, productId, quantity);
      
      console.log('🛒 Cart after adding item:', cart);
      
      res.json({
        success: true,
        message: 'Item added to cart',
        data: cart
      });
    } catch (error) {
      console.error('🛒 Backend addToCart error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to add item to cart',
        error: error.message
      });
    }
  },

  // Update cart item quantity
  updateCartItem: async (req, res) => {
    try {
      const { cartItemId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.userId;
      
      console.log('🛒 Updating cart item:', { cartItemId, quantity, userId });
      
      const cart = await CartService.updateCartItem(userId, cartItemId, quantity);
      
      res.json({
        success: true,
        message: 'Cart item updated',
        data: cart
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update cart item',
        error: error.message
      });
    }
  },

  // Remove item from cart
  removeFromCart: async (req, res) => {
    try {
      const { cartItemId } = req.params;
      const userId = req.user.userId;

      console.log('🛒 Removing cart item:', { cartItemId, userId });

      // 1. Validate cart item ID
      if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart item ID"
        });
      }

      // 2. Remove item by cart item _id (NOT productId)
      const result = await Cart.updateOne(
        { user: userId },
        { $pull: { items: { _id: cartItemId } } }
      );

      console.log('🛒 MongoDB update result:', result);

      // 3. Ensure something was actually removed
      if (result.modifiedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Item removed from cart"
      });

    } catch (error) {
      console.error("🛒 Remove cart item error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to remove item from cart",
        error: error.message
      });
    }
  },

  // Clear cart
  clearCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      const cart = await CartService.clearCart(userId);
      
      res.json({
        success: true,
        message: 'Cart cleared',
        data: cart
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
        error: error.message
      });
    }
  },

  // Get cart summary
  getCartSummary: async (req, res) => {
    try {
      const userId = req.user.userId;
      const summary = await CartService.getCartSummary(userId);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get cart summary',
        error: error.message
      });
    }
  },

  // Validate cart stock
  validateCartStock: async (req, res) => {
    try {
      const userId = req.user.userId;
      const validation = await CartService.validateCartStock(userId);
      
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to validate cart stock',
        error: error.message
      });
    }
  }
};

module.exports = cartController;
