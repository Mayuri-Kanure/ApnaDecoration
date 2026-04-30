const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    // Skip validation for guest carts
    if (req.user) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    }

    let cart;
    
    if (req.user) {
      // Authenticated user - get their cart
      cart = await Cart.findOrCreateCart(req.user._id);
    } else {
      // Guest user - check for session cart
      const sessionId = req.headers['x-session-id'] || req.sessionID;
      cart = await Cart.findGuestCart(sessionId);
      
      if (!cart) {
        cart = await Cart.createGuestCart(sessionId);
      }
    }

    // Transform cart items for frontend
    const transformedCart = {
      items: cart.items.map(item => ({
        id: item._id,
        _id: item._id,
        product: item.product._id,
        name: item.product.product_name_en || item.product.name,
        product_name_en: item.product.product_name_en || item.product.name,
        description: item.product.description_en || item.product.description,
        price: item.unitPrice,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        thumbnail: item.product.thumbnail,
        images: item.product.additional_images || [item.product.thumbnail],
        sku: item.product.sku,
        category: item.product.category_id,
        stock_qty: item.product.stock_qty,
        specifications: item.specifications,
        addedAt: item.addedAt
      })),
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      formattedTotal: cart.formattedTotal,
      lastUpdated: cart.lastUpdated
    };

    res.json(transformedCart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity = 1, specifications = {} } = req.body;

    // Validate product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'active') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart;

    if (req.user) {
      // Authenticated user
      cart = await Cart.findOrCreateCart(req.user._id);
      await cart.addItem(product, quantity, specifications);
    } else {
      // Guest user
      const sessionId = req.headers['x-session-id'] || req.sessionID;
      cart = await Cart.findGuestCart(sessionId);
      
      if (!cart) {
        cart = await Cart.createGuestCart(sessionId);
      }

      // Add item to guest cart (manual implementation since guest cart doesn't have addItem method)
      const existingItemIndex = cart.items.findIndex(item => 
        item.product.toString() === product._id.toString() &&
        JSON.stringify(item.specifications || {}) === JSON.stringify(specifications)
      );

      if (existingItemIndex !== -1) {
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
      } else {
        cart.items.push({
          product: product._id,
          quantity: quantity,
          unitPrice: product.unit_price,
          totalPrice: quantity * product.unit_price,
          specifications: specifications
        });
      }

      await cart.save();
    }

    // Return updated cart
    await cart.populate('items.product');
    
    const transformedCart = {
      items: cart.items.map(item => ({
        id: item._id,
        _id: item._id,
        product: item.product._id,
        name: item.product.product_name_en || item.product.name,
        product_name_en: item.product.product_name_en || item.product.name,
        description: item.product.description_en || item.product.description,
        price: item.unitPrice,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        thumbnail: item.product.thumbnail,
        images: item.product.additional_images || [item.product.thumbnail],
        sku: item.product.sku,
        category: item.product.category_id,
        stock: item.product.stock,
        specifications: item.specifications,
        addedAt: item.addedAt
      })),
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      formattedTotal: cart.formattedTotal,
      lastUpdated: cart.lastUpdated
    };

    res.status(201).json({
      message: 'Item added to cart successfully',
      cart: transformedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    let cart;

    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const sessionId = req.headers['x-session-id'] || req.sessionID;
      cart = await Cart.findGuestCart(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await cart.updateItemQuantity(itemId, quantity);
    await cart.populate('items.product');

    const transformedCart = {
      items: cart.items.map(item => ({
        id: item._id,
        _id: item._id,
        product: item.product._id,
        name: item.product.product_name_en || item.product.name,
        product_name_en: item.product.product_name_en || item.product.name,
        description: item.product.description_en || item.product.description,
        price: item.unitPrice,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        thumbnail: item.product.thumbnail,
        images: item.product.additional_images || [item.product.thumbnail],
        sku: item.product.sku,
        category: item.product.category_id,
        stock_qty: item.product.stock_qty,
        specifications: item.specifications,
        addedAt: item.addedAt
      })),
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      formattedTotal: cart.formattedTotal,
      lastUpdated: cart.lastUpdated
    };

    res.json({
      message: 'Cart item updated successfully',
      cart: transformedCart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Failed to update cart item', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    let cart;

    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const sessionId = req.headers['x-session-id'] || req.sessionID;
      cart = await Cart.findGuestCart(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await cart.removeItem(itemId);
    await cart.populate('items.product');

    const transformedCart = {
      items: cart.items.map(item => ({
        id: item._id,
        _id: item._id,
        product: item.product._id,
        name: item.product.product_name_en || item.product.name,
        product_name_en: item.product.product_name_en || item.product.name,
        description: item.product.description_en || item.product.description,
        price: item.unitPrice,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        thumbnail: item.product.thumbnail,
        images: item.product.additional_images || [item.product.thumbnail],
        sku: item.product.sku,
        category: item.product.category_id,
        stock_qty: item.product.stock_qty,
        specifications: item.specifications,
        addedAt: item.addedAt
      })),
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      formattedTotal: cart.formattedTotal,
      lastUpdated: cart.lastUpdated
    };

    res.json({
      message: 'Item removed from cart successfully',
      cart: transformedCart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    let cart;

    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const sessionId = req.headers['x-session-id'] || req.sessionID;
      cart = await Cart.findGuestCart(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await cart.clearCart();

    res.json({
      message: 'Cart cleared successfully',
      cart: {
        items: [],
        totalAmount: 0,
        totalItems: 0,
        formattedTotal: '₹0.00'
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};

// Merge guest cart with user cart (on login)
exports.mergeGuestCart = async (req, res) => {
  try {
    const { guestCartItems } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userCart = await Cart.findOrCreateCart(req.user._id);

    if (guestCartItems && guestCartItems.length > 0) {
      // Transform guest cart items to match schema
      const transformedGuestItems = guestCartItems.map(item => ({
        product: item.product || item._id,
        quantity: item.quantity,
        unitPrice: item.unit_price || item.price,
        totalPrice: item.total_price || (item.quantity * (item.unit_price || item.price)),
        specifications: item.specifications || {}
      }));

      await userCart.mergeGuestCart(transformedGuestItems);
    }

    await userCart.populate('items.product');

    const transformedCart = {
      items: userCart.items.map(item => ({
        id: item._id,
        _id: item._id,
        product: item.product._id,
        name: item.product.product_name_en || item.product.name,
        product_name_en: item.product.product_name_en || item.product.name,
        description: item.product.description_en || item.product.description,
        price: item.unitPrice,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        thumbnail: item.product.thumbnail,
        images: item.product.additional_images || [item.product.thumbnail],
        sku: item.product.sku,
        category: item.product.category_id,
        stock_qty: item.product.stock_qty,
        specifications: item.specifications,
        addedAt: item.addedAt
      })),
      totalAmount: userCart.totalAmount,
      totalItems: userCart.totalItems,
      formattedTotal: userCart.formattedTotal,
      lastUpdated: userCart.lastUpdated
    };

    res.json({
      message: 'Guest cart merged successfully',
      cart: transformedCart
    });
  } catch (error) {
    console.error('Merge guest cart error:', error);
    res.status(500).json({ message: 'Failed to merge guest cart', error: error.message });
  }
};

// Get cart summary (for checkout)
exports.getCartSummary = async (req, res) => {
  try {
    let cart;

    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    } else {
      const sessionId = req.headers['x-session-id'] || req.sessionID;
      cart = await Cart.findGuestCart(sessionId);
    }

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'Cart is empty' });
    }

    const summary = {
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      formattedTotal: cart.formattedTotal,
      itemCount: cart.items.length,
      lastUpdated: cart.lastUpdated,
      items: cart.items.map(item => ({
        id: item._id,
        name: item.product.product_name_en || item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        specifications: item.specifications
      }))
    };

    res.json(summary);
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ message: 'Failed to get cart summary', error: error.message });
  }
};
