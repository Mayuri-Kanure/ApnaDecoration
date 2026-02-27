const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    console.log('=== GET WISHLIST START ===');
    console.log('User:', req.user);
    console.log('User ID:', req.user?.userId);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.user?.userId;

    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('Fetching wishlist for user:', userId);

    // Find wishlist for the user
    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('items.product', 'name description price originalPrice images category brand inStock rating reviews discount')
      .lean();

    console.log('Found wishlist:', wishlist);

    if (!wishlist) {
      console.log('No wishlist found for user:', userId);
      return res.json({
        success: true,
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit
        }
      });
    }

    const items = wishlist.items || [];
    console.log('Wishlist items:', items);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.product?.price || 0), 0),
      potentialSavings: items.reduce((sum, item) => {
        const product = item.product;
        if (product?.originalPrice && product?.price) {
          return sum + (product.originalPrice - product.price);
        }
        return sum;
      }, 0),
      inStockItems: items.filter(item => item.product?.inStock !== false).length,
      outOfStockItems: items.filter(item => item.product?.inStock === false).length
    };

    console.log('Returning wishlist data:', { wishlist: paginatedItems, stats });

    res.json({
      success: true,
      data: paginatedItems,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(items.length / limit),
        totalItems: items.length,
        itemsPerPage: limit
      },
      stats
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    console.log('=== ADD TO WISHLIST START ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    console.log('User ID:', req.user?.userId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('Adding to wishlist - ProductId:', productId, 'UserId:', userId);

    // Check if wishlist exists for this user
    let wishlist = await Wishlist.findOne({ customer: userId });
    console.log('Existing wishlist:', wishlist);

    if (!wishlist) {
      console.log('Creating new wishlist for user:', userId);
      wishlist = new Wishlist({ 
        customer: userId, 
        items: [] 
      });
    }

    const existingItem = wishlist.items.find(item => 
      item.product && item.product.toString() === productId
    );

    if (existingItem) {
      console.log('Product already in wishlist:', productId);
      return res.status(400).json({ 
        success: false,
        message: 'Product already in wishlist' 
      });
    }

    // Add product to wishlist
    console.log('Adding product to wishlist array...');
    const newItem = { product: productId, addedAt: new Date() };
    wishlist.items.push(newItem);
    console.log('New item:', newItem);
    console.log('Wishlist items before save:', wishlist.items);
    
    console.log('Saving wishlist...');
    const savedWishlist = await wishlist.save();
    console.log('Wishlist saved successfully!', savedWishlist._id);

    console.log('Product added to wishlist successfully:', productId);

    res.status(201).json({ 
      success: true,
      message: 'Product added to wishlist',
      wishlist: savedWishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ customer: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(item => 
      item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({ 
      message: 'Product removed from wishlist',
      wishlist: await Wishlist.findOne({ customer: userId })
        .populate('items.product', 'name description price originalPrice images category brand inStock rating reviews discount')
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Move item from wishlist to cart
exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ customer: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Find the item in wishlist
    const wishlistItem = wishlist.items.find(item => 
      item.product.toString() === productId
    );

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    // Here you would typically add to cart logic
    // For now, just remove from wishlist
    wishlist.items = wishlist.items.filter(item => 
      item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({ 
      message: 'Product moved to cart',
      wishlist: await Wishlist.findOne({ customer: userId })
        .populate('items.product', 'name description price originalPrice images category brand inStock rating reviews discount')
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Move all items from wishlist to cart
exports.moveAllToCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ customer: userId });
    if (!wishlist || wishlist.items.length === 0) {
      return res.status(404).json({ message: 'Wishlist is empty' });
    }

    // Clear wishlist (in real app, you'd add all to cart first)
    wishlist.items = [];
    await wishlist.save();

    res.json({ 
      message: 'All items moved to cart',
      wishlist: []
    });
  } catch (error) {
    console.error('Move all to cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ customer: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({ 
      message: 'Wishlist cleared',
      wishlist: []
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ customer: userId });
    if (!wishlist) {
      return res.json({ isInWishlist: false });
    }

    const isInWishlist = wishlist.items.some(item => 
      item.product.toString() === productId
    );

    res.json({ isInWishlist });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
