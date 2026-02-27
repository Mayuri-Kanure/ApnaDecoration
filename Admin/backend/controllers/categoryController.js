const Category = require('../models/Category');
const { validationResult } = require('express-validator');

exports.getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status, homeCategory } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (homeCategory === 'true') {
      query.homeCategory = true;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Category.countDocuments(query);

    res.json({
      categories: categories.map(cat => ({
        ...cat.toObject(),
        id: cat._id.toString() // Add id field for frontend compatibility
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    console.log('Create category request received:', req.body);
    
    // Handle uploaded file from Cloudinary
    let imageUrl = null;
    if (req.file) {
      // Cloudinary provides secure_url for uploaded files
      imageUrl = req.file.secure_url || req.file.path;
      console.log('Cloudinary image uploaded:', imageUrl);
    } else if (req.body.image) {
      // Fallback to image URL from body
      imageUrl = req.body.image;
      console.log('Using image URL from body:', imageUrl);
    }

    const { name, priority, homeCategory, description, status } = req.body;
    console.log('Extracted data:', { name, priority, homeCategory, imageUrl, description, status });

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      console.log('Category already exists:', existingCategory.name);
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const category = new Category({
      name: name.trim(),
      priority: priority || 1,
      homeCategory: homeCategory || false,
      image: imageUrl,
      description: description || '',
      status: status || 'active'
    });
    
    console.log('Category object created:', category);
    
    const savedCategory = await category.save();
    console.log('Category saved to MongoDB:', savedCategory);
    
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Handle uploaded file from Cloudinary
    let imageUrl = null;
    if (req.file) {
      // Cloudinary provides secure_url for uploaded files
      imageUrl = req.file.secure_url || req.file.path;
      console.log('Cloudinary image uploaded for update:', imageUrl);
    } else if (req.body.image) {
      // Fallback to image URL from body
      imageUrl = req.body.image;
      console.log('Using image URL from body for update:', imageUrl);
    }

    const { name, priority, homeCategory, description } = req.body;

    // Check if category name already exists (excluding current category)
    if (name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(priority && { priority }),
      ...(homeCategory !== undefined && { homeCategory }),
      ...(imageUrl && { image: imageUrl }),
      ...(description !== undefined && { description })
    };

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    console.log('Delete request received for ID:', req.params.id);
    const category = await Category.findByIdAndDelete(req.params.id);
    console.log('Category found and deleted:', category);
    
    if (!category) {
      console.log('Category not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('📝 Toggle category ID:', id);
    console.log('📝 Request body:', req.body);
    console.log('📝 Request headers:', req.headers);

    // Validate status
    if (!status || !['active', 'inactive'].includes(status)) {
      console.log('❌ Invalid status value:', status);
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find category
    console.log('🔍 Looking for category with ID:', id);
    const category = await Category.findById(id);
    if (!category) {
      console.log('❌ Category not found with ID:', id);
      return res.status(404).json({ message: 'Category not found' });
    }

    console.log('✅ Category found:', category.name, 'Current status:', category.status);
    console.log('🔄 Updating status to:', status);

    // Update only status field
    category.status = status;
    await category.save();

    console.log('✅ Category updated successfully:', category);
    res.json(category);
  } catch (error) {
    console.error('❌ Toggle category error:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCategoryPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    if (!priority || priority < 1) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
