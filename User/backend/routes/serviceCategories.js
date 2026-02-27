const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get home page service categories - Fetch from Admin backend
router.get('/home-page-service-categories', async (req, res) => {
  try {
    const { homeCategory, status } = req.query;
    
    // Fetch from Admin backend
    const response = await axios.get('http://localhost:5000/api/service-categories/public', {
      params: { homeCategory, status }
    });
    
    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.categories || []
    });
  } catch (error) {
    console.error('Error fetching home page service categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home page service categories'
    });
  }
});

// Get public service categories - Fetch from Admin backend
router.get('/public', async (req, res) => {
  try {
    const { homeCategory, status } = req.query;
    
    // Fetch from Admin backend
    const response = await axios.get('http://localhost:5000/api/service-categories/public', {
      params: { homeCategory, status }
    });
    
    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.categories || []
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service categories'
    });
  }
});

// Get all service categories - Fetch from Admin backend
router.get('/', async (req, res) => {
  try {
    // Fetch from Admin backend
    const response = await axios.get('http://localhost:5000/api/service-categories');
    
    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.categories || []
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service categories'
    });
  }
});

// Create service category (admin)
router.post('/', async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      createdBy: req.user?.userId || req.user?._id || null
    };
    
    const category = new ServiceCategory(categoryData);
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Service category created successfully',
      category: category
    });
  } catch (error) {
    console.error('Error creating service category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service category'
    });
  }
});

// Update service category (admin)
router.put('/:id', async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service category updated successfully',
      category: category
    });
  } catch (error) {
    console.error('Error updating service category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service category'
    });
  }
});

// Delete service category (admin)
router.delete('/:id', async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service category'
    });
  }
});

module.exports = router;
