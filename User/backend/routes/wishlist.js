const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const VendorProduct = require('../models/VendorProduct');
const { authMiddleware } = require('../middleware/auth');

// All wishlist routes require authentication (temporarily disabled for testing)
// router.use(authMiddleware);

// Get user's wishlist
router.get('/', async (req, res) => {
  try {
    // Handle authentication being temporarily disabled
    const userId = req.user ? req.user.userId : '69523c2a9baedf46651d6bf6'; // Default admin user for testing
    
    console.log('=== USER BACKEND GET WISHLIST ===');
    console.log('User ID:', userId);
    
    // Find individual wishlist items and populate product data
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate('product')
      .sort({ addedAt: -1 });
    
    console.log('Found wishlist items:', wishlistItems.length);
    
    // Transform to match admin backend structure
    const transformedItems = wishlistItems.map(item => ({
      _id: item._id,
      product: item.product,
      addedAt: item.addedAt
    }));
    
    // Filter out items with null products and create response structure
    const validItems = transformedItems.filter(item => item.product !== null);
    
    console.log('Valid items after filtering:', validItems.length);
    console.log('Null products removed:', transformedItems.length - validItems.length);
    
    // Create response structure that matches what frontend expects
    const response = {
      success: true,
      data: validItems.map(item => ({
        id: item.product._id,
        _id: item.product._id,
        name: item.product.name || item.product.product_name_en || 'Unknown Product',
        price: item.product.price || item.product.unit_price || 0,
        unit_price: item.product.price || item.product.unit_price || 0,
        thumbnail: item.product.thumbnail || null,
        image: item.product.image || item.product.thumbnail || null,
        images: item.product.images || [],
        stock: item.product.stock || item.product.stock_qty || 0,
        stock_qty: item.product.stock || item.product.stock_qty || 0,
        inStock: (item.product.stock || item.product.stock_qty || 0) > 0,
        sku: item.product.sku || '',
        description: item.product.description || item.product.description_en || '',
        category: item.product.category || null,
        discount_amount: item.product.discount_amount || 0,
        originalPrice: item.product.originalPrice || 0,
        rating: item.product.rating || 0,
        reviews: item.product.reviews || 0
      }))
    };
    
    console.log('Returning transformed wishlist:', response.data.length, 'items');
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist'
    });
  }
});

// Add to wishlist
router.post('/add', async (req, res) => {
  try {
    const { productId } = req.body;
    // Handle authentication being temporarily disabled
    const userId = req.user ? req.user.userId : '69523c2a9baedf46651d6bf6'; // Default admin user for testing
    
    console.log('🔍 Adding to wishlist:', { productId, userId });
    
    // Check if already in wishlist first (before checking product exists)
    const existingItem = await Wishlist.findOne({ user: userId, product: productId });
    if (existingItem) {
      console.log('❌ Product already in wishlist:', productId);
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist'
      });
    }
    
    // Add to wishlist without checking if product exists
    // Frontend already has the product data, so we trust it exists
    const wishlistItem = new Wishlist({
      user: userId,
      product: productId
    });
    
    await wishlistItem.save();
    console.log('✅ Added to wishlist successfully:', wishlistItem._id);
    
    res.json({
      success: true,
      message: 'Added to wishlist'
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to add to wishlist',
      details: error.message
    });
  }
});

// Remove from wishlist
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    // Handle authentication being temporarily disabled
    const userId = req.user ? req.user.userId : '69523c2a9baedf46651d6bf6'; // Default admin user for testing
    
    console.log('🔍 Removing from wishlist:', { productId, userId });
    
    const result = await Wishlist.deleteOne({ user: userId, product: productId });
    
    if (result.deletedCount === 0) {
      console.log('❌ Item not found in wishlist:', productId);
      return res.status(404).json({
        success: false,
        error: 'Item not found in wishlist'
      });
    }
    
    console.log('✅ Removed from wishlist successfully:', productId);
    
    res.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from wishlist'
    });
  }
});

module.exports = router;
