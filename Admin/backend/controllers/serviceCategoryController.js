const ServiceCategory = require('../models').ServiceCategory;
const mongoose = require('mongoose');
const cloudinaryService = require('../services/cloudinaryService');

// Get all service categories
const getServiceCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, homeCategory } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (homeCategory !== undefined) filter.homeCategory = homeCategory === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const categories = await ServiceCategory.find(filter)
      .sort({ priority: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ServiceCategory.countDocuments(filter);

    res.json({
      success: true,
      data: categories,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service categories',
      error: error.message
    });
  }
};

// Get service category by ID
const getServiceCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service category ID'
      });
    }

    const category = await ServiceCategory.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching service category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service category',
      error: error.message
    });
  }
};

// Create service category
const createServiceCategory = async (req, res) => {
  try {
    const { name, description, priority, homeCategory, status, order } = req.body;
    
    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category with same name already exists
    const existingCategory = await ServiceCategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Service category with this name already exists'
      });
    }

    // Handle image upload - Support both Cloudinary and local storage
    let imagePath = '';
    
    if (req.file) {
      imagePath = req.file.path || req.file.secure_url || req.file.url;
      console.log('✅ Service category image:', imagePath);
    }

    // Create new service category
    const serviceCategory = new ServiceCategory({
      name: name.trim(),
      description: description || '',
      priority: priority || 1,
      homeCategory: homeCategory || false,
      status: status || 'active',
      order: order || 0,
      image: imagePath,
      createdBy: req.user ? req.user._id : null
    });

    await serviceCategory.save();

    res.status(201).json({
      success: true,
      message: 'Service category created successfully',
      data: serviceCategory
    });
  } catch (error) {
    console.error('Error creating service category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service category',
      error: error.message
    });
  }
};

// Update service category
const updateServiceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priority, homeCategory, status, order } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service category ID'
      });
    }

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category exists
    const category = await ServiceCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }

    // Check if another category with same name exists (excluding current one)
    const existingCategory = await ServiceCategory.findOne({ 
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Service category with this name already exists'
      });
    }

    // Handle image upload
    let imagePath = category.image;
    if (req.file) {
      imagePath = req.file.path || req.file.secure_url || req.file.url;
    }

    // Update category
    const updatedCategory = await ServiceCategory.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description || '',
        priority: priority || 1,
        homeCategory: homeCategory || false,
        status: status || 'active',
        order: order || 0,
        image: imagePath
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Service category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating service category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service category',
      error: error.message
    });
  }
};

// Delete service category
const deleteServiceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service category ID'
      });
    }

    const category = await ServiceCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }

    // Check if there are any services using this category
    const Service = require('../models').Service;
    const servicesCount = await Service.countDocuments({ serviceCategory: id });
    
    if (servicesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${servicesCount} service(s) are using this category`
      });
    }

    await ServiceCategory.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Service category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service category',
      error: error.message
    });
  }
};

// Toggle service category status
const toggleServiceCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, homeCategory } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service category ID'
      });
    }

    const category = await ServiceCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }

    // Handle both status and homeCategory toggles
    let updateData = {};
    
    if (homeCategory !== undefined) {
      // Toggle homeCategory
      updateData.homeCategory = homeCategory;
    } else if (status !== undefined) {
      // Toggle status
      const newStatus = status || (category.status === 'active' ? 'inactive' : 'active');
      updateData.status = newStatus;
    }

    const updatedCategory = await ServiceCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Service category ${homeCategory !== undefined ? 'home category' : 'status'} updated successfully`,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error toggling service category status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle service category status',
      error: error.message
    });
  }
};

module.exports = {
  getServiceCategories,
  getServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  toggleServiceCategoryStatus
};