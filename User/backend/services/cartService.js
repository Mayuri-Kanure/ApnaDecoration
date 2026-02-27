const { Cart, Product, VendorProduct } = require('../models');
const mongoose = require('mongoose');
const axios = require('axios');

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'https://admin-api.apnadecoration.com/api';

// Helper function to safely convert string ID to ObjectId
function toObjectId(id) {
  if (!id) {
    throw new Error('User ID is required');
  }
  
  // If it's already a valid ObjectId, return as-is
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  
  // If it's a string, try to convert
  if (typeof id === 'string') {
    try {
      return new mongoose.Types.ObjectId(id);
    } catch (error) {
      throw new Error(`Invalid user ID format: ${id}`);
    }
  }
  
  throw new Error(`Invalid user ID format: ${id}`);
}

// Constants directly defined
const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
};

class CartService {
  // Get user's cart
  static async getUserCart(userId) {
    console.log('🛒 CartService.getUserCart called with userId:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userObjectId = toObjectId(userId);
    console.log('🛒 Converted to ObjectId:', userObjectId);
    
    // Get cart without populate first
    const cart = await Cart.findOne({ user: userObjectId });
    
    console.log('🛒 Cart query result:', cart);

    if (!cart) {
      console.log('🛒 No cart found, creating empty cart...');
      // Create empty cart
      return await this.createEmptyCart(userId);
    }

    // Transform cart items to ensure consistent product data
    const transformedItems = await Promise.all(cart.items.map(async item => {
      console.log('🛒 Processing cart item:', item);
      
      // Try Product model first
      let productData = await Product.findById(item.product);
      
      // If not found, try VendorProduct model
      if (!productData) {
        console.log('🛒 Not found in Product, trying VendorProduct for:', item.product);
        const vendorProduct = await VendorProduct.findById(item.product);
        if (vendorProduct) {
          console.log('🛒 Found vendor product:', vendorProduct.name);
          productData = {
            _id: vendorProduct._id,
            name: vendorProduct.name,
            description: vendorProduct.description,
            price: vendorProduct.price,
            category: vendorProduct.category,
            thumbnail: vendorProduct.images && vendorProduct.images.length > 0 ? vendorProduct.images[0] : null,
            images: vendorProduct.images || [],
            sku: vendorProduct.sku,
            status: vendorProduct.status === 'approved' ? 'active' : vendorProduct.status,
            stock: vendorProduct.stock || 0,
            source: 'vendor',
            vendorId: vendorProduct.vendorId
          };
        }
      }
      
      // If still not found, try Service model from Admin backend
      if (!productData) {
        console.log('🛒 Not found in Product/VendorProduct, trying Service for:', item.product);
        try {
          const serviceRes = await axios.get(`${ADMIN_API_URL}/services/${item.product}`);
          if (serviceRes.data.success && serviceRes.data.data) {
            const service = serviceRes.data.data;
            console.log('🛒 Found service:', service.name);
            productData = {
              _id: service._id,
              name: service.name,
              description: service.description,
              price: service.price,
              category: service.category,
              thumbnail: service.bannerImage || null,
              images: service.bannerImage ? [service.bannerImage] : [],
              sku: service.sku || 'SERVICE',
              status: service.availability ? 'active' : 'inactive',
              stock: 999,
              source: 'service'
            };
          }
        } catch (err) {
          console.log('🛒 Service not found:', err.message);
        }
      }
      
      if (!productData) {
        console.log('🛒 Product/Service not found in any model for ID:', item.product);
      }
      
      return {
        ...item.toObject(),
        product: productData
      };
    }));

    const transformedCart = {
      ...cart.toObject(),
      items: transformedItems
    };

    console.log('🛒 Transformed cart with product data:', transformedCart);
    return transformedCart;
  }

  // Create empty cart for user
  static async createEmptyCart(userId) {
    console.log('🛒 createEmptyCart called with userId:', userId);
    
    const userObjectId = toObjectId(userId);
    console.log('🛒 Converted userId to ObjectId:', userObjectId);
    
    const cart = new Cart({
      user: userObjectId,
      items: [],
      totalAmount: 0
    });

    console.log('🛒 Saving new cart...');
    return await cart.save();
  }

  // Add item to cart
  static async addToCart(userId, productId, quantity = 1) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      throw new Error('Invalid product ID');
    }

    // Check if product exists and is available
    let product = await Product.findById(productId);
    
    // If not found in Product, try VendorProduct
    if (!product) {
      const vendorProduct = await VendorProduct.findById(productId);
      
      if (vendorProduct && (vendorProduct.status === 'approved' || vendorProduct.status === 'active')) {
        product = {
          _id: vendorProduct._id,
          name: vendorProduct.name,
          description: vendorProduct.description,
          price: vendorProduct.price,
          category: vendorProduct.category,
          thumbnail: vendorProduct.images && vendorProduct.images.length > 0 ? vendorProduct.images[0] : null,
          images: vendorProduct.images || [],
          sku: vendorProduct.sku,
          status: vendorProduct.status === 'approved' ? 'active' : vendorProduct.status,
          stock: vendorProduct.stock || 0,
          source: 'vendor',
          vendorId: vendorProduct.vendorId
        };
      }
    }
    
    // If still not found, try Service from Admin backend
    if (!product) {
      console.log('🛒 Trying to fetch service from Admin backend for ID:', productId);
      try {
        const serviceRes = await axios.get(`${ADMIN_API_URL}/services/${productId}`);
        console.log('🛒 Service API response status:', serviceRes.status);
        console.log('🛒 Service API response data:', serviceRes.data);
        if (serviceRes.data.success && serviceRes.data.data) {
          const service = serviceRes.data.data;
          console.log('🛒 Found service:', service.name);
          product = {
            _id: service._id,
            name: service.name,
            description: service.description,
            price: service.price,
            category: service.category,
            thumbnail: service.bannerImage || null,
            images: service.bannerImage ? [service.bannerImage] : [],
            sku: service.sku || 'SERVICE',
            status: service.availability ? 'active' : 'inactive',
            stock: 999,
            source: 'service'
          };
        } else {
          console.log('🛒 Service API returned unsuccessful response');
        }
      } catch (err) {
        console.log('🛒 Service fetch error:', err.message);
        console.log('🛒 Service fetch error response:', err.response?.data);
        console.log('🛒 Service fetch error status:', err.response?.status);
      }
    }
    
    if (!product) {
      console.log('🛒 Product/Service not found after checking all sources for ID:', productId);
      throw new Error('Product not found');
    }

    console.log('🛒 Product found, proceeding with cart add:', product.name);

    if (product.status !== PRODUCT_STATUS.ACTIVE && product.status !== 'approved' && product.status !== 'inactive') {
      throw new Error('Product is not available');
    }

    // Temporarily disable stock check for testing
    // if (product.stock < quantity) {
    //   throw new Error(`Only ${product.stock} items available in stock`);
    // }

    const userObjectId = toObjectId(userId);
    
    // Get or create cart
    let cart = await Cart.findOne({ user: userObjectId });
    if (!cart) {
      cart = await this.createEmptyCart(userId);
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Temporarily disable stock check for testing
      // if (product.stock < newQuantity) {
      //   throw new Error(`Only ${product.stock} items available in stock`);
      // }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        price: product.price,
        quantity
      });
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();

    return await cart.save();
  }

  // Update cart item quantity
  static async updateCartItem(userId, cartItemId, quantity) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!/^[0-9a-fA-F]{24}$/.test(cartItemId)) {
      throw new Error('Invalid cart item ID');
    }

    if (quantity <= 0) {
      return await this.removeFromCart(userId, cartItemId);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Find item in cart by cartItemId
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === cartItemId
    );

    if (itemIndex === -1) {
      throw new Error('Cart item not found');
    }

    // Check stock availability (temporarily disabled for testing)
    let product = await Product.findById(cart.items[itemIndex].product);
    
    // If not found in Product, try VendorProduct (same logic as addToCart)
    if (!product) {
      console.log('🛒 Product not found in Product model, trying VendorProduct for:', cart.items[itemIndex].product);
      product = await VendorProduct.findById(cart.items[itemIndex].product);
      if (product) {
        console.log('🛒 Found vendor product for stock check:', product.name);
      }
    }
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Temporarily disable stock check for testing
    // if (product.stock < quantity) {
    //   throw new Error(`Insufficient stock for product ${product.name}`);
    // }
    console.log('🛒 Stock validation temporarily disabled for testing');

    // Update item quantity and total price
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].totalPrice = cart.items[itemIndex].price * quantity;

    // Update cart total
    cart.total = cart.items.reduce((total, item) => total + (item.totalPrice || (item.price * item.quantity)), 0);

    await cart.save();
    return cart;
  }

  // Remove item from cart
  static async removeFromCart(userId, cartItemId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!/^[0-9a-fA-F]{24}$/.test(cartItemId)) {
      throw new Error('Invalid cart item ID');
    }

    const userObjectId = toObjectId(userId);
    const cart = await Cart.findOne({ user: userObjectId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    console.log('🛒 Cart before removal:', {
      cartId: cart._id,
      itemsCount: cart.items.length,
      cartItemIdToRemove: cartItemId
    });

    // Remove item by cartItemId (not productId)
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item._id.toString() !== cartItemId
    );

    console.log('🛒 Cart after removal:', {
      itemsRemoved: initialLength - cart.items.length,
      remainingItems: cart.items.length
    });

    // Recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();

    const savedCart = await cart.save();
    console.log('🛒 Cart saved successfully:', {
      cartId: savedCart._id,
      itemsCount: savedCart.items.length
    });

    return savedCart;
  }

  // Clear cart
  static async clearCart(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userObjectId = toObjectId(userId);
    const cart = await Cart.findOne({ user: userObjectId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    console.log('🛒 Clearing cart:', {
      cartId: cart._id,
      itemsCount: cart.items.length
    });

    cart.items = [];
    cart.totalAmount = 0;
    cart.updatedAt = new Date();

    const savedCart = await cart.save();
    console.log('🛒 Cart cleared successfully:', {
      cartId: savedCart._id,
      itemsCount: savedCart.items.length
    });

    return savedCart;
  }

  // Get cart summary
  static async getCartSummary(userId) {
    const cart = await this.getUserCart(userId);
    
    return {
      itemCount: cart.items.reduce((count, item) => count + item.quantity, 0),
      totalAmount: cart.totalAmount,
      items: cart.items.map(item => ({
        productId: item.product._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
        image: item.image,
        inStock: item.product.stock > 0
      }))
    };
  }

  // Validate cart items stock
  static async validateCartStock(userId) {
    const cart = await this.getUserCart(userId);
    const outOfStockItems = [];

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        outOfStockItems.push({
          productId: item.product._id,
          name: item.name,
          requested: item.quantity,
          available: item.product.stock
        });
      }
    }

    return {
      isValid: outOfStockItems.length === 0,
      outOfStockItems
    };
  }

  // Merge guest cart with user cart
  static async mergeGuestCart(userId, guestCartItems) {
    if (!guestCartItems || guestCartItems.length === 0) {
      return await this.getUserCart(userId);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await this.createEmptyCart(userId);
    }

    for (const guestItem of guestCartItems) {
      try {
        await this.addToCart(userId, guestItem.productId, guestItem.quantity);
      } catch (error) {
        // Log error but continue with other items
        console.error(`Failed to add item ${guestItem.productId} to cart:`, error.message);
      }
    }

    return await this.getUserCart(userId);
  }

  // Apply coupon to cart
  static async applyCoupon(userId, couponCode) {
    const cart = await this.getUserCart(userId);
    
    // This is a placeholder for coupon logic
    // In a real implementation, you would:
    // 1. Validate coupon code
    // 2. Check coupon conditions (minimum amount, products, user limits)
    // 3. Calculate discount
    // 4. Apply discount to cart
    
    return {
      success: false,
      message: 'Coupon functionality not implemented yet'
    };
  }

  // Get cart total with shipping
  static async getCartTotalWithShipping(userId, shippingMethod = 'standard') {
    const cart = await this.getUserCart(userId);
    
    let shippingCost = 0;
    
    // Calculate shipping based on method and total
    switch (shippingMethod) {
      case 'standard':
        shippingCost = cart.totalAmount >= 500 ? 0 : 50;
        break;
      case 'express':
        shippingCost = cart.totalAmount >= 1000 ? 0 : 100;
        break;
      case 'overnight':
        shippingCost = 200;
        break;
    }

    return {
      subtotal: cart.totalAmount,
      shippingCost,
      total: cart.totalAmount + shippingCost,
      freeShipping: shippingCost === 0
    };
  }
}

module.exports = CartService;
