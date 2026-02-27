const express = require('express');
const { Category } = require('../models');
const router = express.Router();

// Get public categories
router.get('/public', async (req, res) => {
  try {
    const { homeCategory, status } = req.query;
    
    // Build query
    const query = {};
    
    if (homeCategory === 'true') {
      query.homeCategory = true;
    }
    
    if (status) {
      query.status = status;
    } else {
      query.status = 'active'; // Default to active only
    }
    
    const categories = await Category.find(query)
      .sort({ priority: 1, order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Get all categories (admin)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ priority: 1, order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
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
