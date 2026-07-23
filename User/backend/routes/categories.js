const express = require('express');
const { Category } = require('../models');
const router = express.Router();

// Get public categories
router.get('/public', async (req, res) => {
  try {
    console.log('🔍 [CATEGORIES/PUBLIC] Starting request...');
    
    // MINIMAL TEST - just count documents first
    console.log('🔍 [CATEGORIES/PUBLIC] Counting documents...');
    const count = await Category.countDocuments({});
    console.log('✅ [CATEGORIES/PUBLIC] Total categories in DB:', count);
    
    // Try simple find with no filters
    console.log('🔍 [CATEGORIES/PUBLIC] Fetching all categories (no filters)...');
    const categories = await Category.find({}).limit(10).exec();
    console.log('✅ [CATEGORIES/PUBLIC] Fetched categories:', categories.length);
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('❌ [CATEGORIES/PUBLIC] Error:', error.message);
    console.error('❌ [CATEGORIES/PUBLIC] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get all categories (admin)
router.get('/', async (req, res) => {
  try {
    const { homeCategory, status } = req.query;
    
    console.log('🔍 [CATEGORIES] Fetching categories with query:', { homeCategory, status });
    console.log('🔍 [CATEGORIES] Request URL:', req.url);
    console.log('🔍 [CATEGORIES] Request method:', req.method);
    
    // DIAGNOSTIC: Try count first
    console.log('🔍 [CATEGORIES] Step 1: Counting documents...');
    const count = await Promise.race([
      Category.countDocuments({}),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Category count timeout')), 5000)
      )
    ]);
    console.log('✅ [CATEGORIES] Total categories:', count);
    
    // DIAGNOSTIC: Try findOne
    console.log('🔍 [CATEGORIES] Step 2: Finding one document...');
    const oneCategory = await Promise.race([
      Category.findOne({}),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Category findOne timeout')), 5000)
      )
    ]);
    console.log('✅ [CATEGORIES] Found one category:', !!oneCategory);
    
    // Build query
    const query = {};
    
    if (homeCategory === 'true') {
      query.homeCategory = true;
      console.log('🔍 [CATEGORIES] Query filter: homeCategory = true');
    }
    
    if (status) {
      query.status = status;
      console.log('🔍 [CATEGORIES] Query filter: status =', status);
    }
    
    console.log('🔍 [CATEGORIES] Final query object:', query);
    console.log('🔍 [CATEGORIES] Step 3: Starting find query...');
    
    // Add timeout to prevent hanging
    const categories = await Promise.race([
      Category.find(query).limit(50).exec(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Category query timeout')), 8000)
      )
    ]);
    
    console.log('✅ [CATEGORIES] Categories fetched successfully:', categories.length);
    console.log('✅ [CATEGORIES] Sample category:', categories[0]);
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('❌ [CATEGORIES] Error fetching categories:', error.message);
    console.error('❌ [CATEGORIES] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Create category (admin)
router.post('/', async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      createdBy: req.user?.userId || req.user?._id || null
    };
    
    const category = new Category(categoryData);
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

// Update category (admin)
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      category: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

// Delete category (admin)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
});

module.exports = router;
