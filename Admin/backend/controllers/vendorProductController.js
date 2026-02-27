const VendorProduct = require('../models/VendorProduct');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Get vendor's own products
exports.getVendorProducts = async (req, res) => {
  try {
    // Get vendor ID from authenticated token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Convert string userId to ObjectId for proper MongoDB comparison
    const vendorObjectId = new mongoose.Types.ObjectId(decoded.userId);
    
    // Find products for this vendor only
    const products = await VendorProduct.find({ vendorId: vendorObjectId })
      .populate('vendorId', 'email firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products: products.map(product => ({
        ...product.toObject(),
        id: product._id
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new vendor product
exports.createVendorProduct = async (req, res) => {
  try {
    console.log('=== VENDOR PRODUCT CREATE ROUTE HIT ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request files:', req.files ? req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, path: f.path })) : 'No files');
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const vendorId = decoded.userId || decoded.id || decoded._id;
    console.log('Extracted vendorId:', vendorId);
    
    if (!vendorId) {
      return res.status(401).json({ message: 'Invalid token - no user ID found' });
    }
    
    // Parse product data from FormData
    let productData = {};
    
    // Handle different data formats
    if (req.body.productData) {
      // JSON string format (for backward compatibility)
      try {
        productData = JSON.parse(req.body.productData);
        console.log('Product data parsed from JSON:', Object.keys(productData));
      } catch (parseError) {
        console.error('Failed to parse productData JSON:', parseError);
        return res.status(400).json({ error: 'Invalid product data format', details: parseError.message });
      }
    } else {
      // Direct FormData fields (current format)
      productData = { ...req.body };
      console.log('Using direct req.body as product data:', Object.keys(productData));
    }
    
    // Remove file-related fields from productData
    delete productData.images;
    delete productData.productData;
    
    // Log final product data for debugging
    console.log('Final product data before validation:', {
      name: productData.name,
      sku: productData.sku,
      price: productData.price,
      brand: productData.brand,
      category: productData.category,
      description: productData.description,
      vendorId: vendorId
    });
    
    // Create the vendor product object
    const vendorProductData = {
      ...productData,
      vendorId: vendorId,
      status: 'pending', // Always starts as pending
      createdAt: new Date()
    };
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded files for vendor product...');
      console.log('Files received:', req.files.length);
      
      // Initialize images array
      vendorProductData.images = [];
      
      // Process all uploaded files
      req.files.forEach((file, index) => {
        // Use Cloudinary URL if available, otherwise fallback to local path
        const filePath = file.path || `/uploads/products/${file.filename}`;
        
        // First file as thumbnail
        if (index === 0) {
          vendorProductData.thumbnail = filePath;
          console.log('Vendor product thumbnail set:', filePath);
        }
        
        // All files as images
        vendorProductData.images.push(filePath);
        console.log(`Vendor product image ${index + 1}:`, filePath);
      });
    }
    
    console.log('Final vendor product data:', vendorProductData);

    const product = new VendorProduct(vendorProductData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product submitted for approval',
      product: {
        ...product.toObject(),
        id: product._id
      }
    });
  } catch (error) {
    console.error('Vendor product creation error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        error: error.message,
        details: Object.keys(error.errors).map(key => ({
          field: error.errors[key].path,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update vendor product
exports.updateVendorProduct = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { id } = req.params;
    const product = await VendorProduct.findOne({ 
      _id: id, 
      vendorId: decoded.userId 
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Vendors can only edit basic info, not status
    const allowedUpdates = ['name', 'description', 'price', 'category', 'images'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedProduct = await VendorProduct.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        ...updatedProduct.toObject(),
        id: updatedProduct._id
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET all vendor products with filtering and pagination
exports.getAllVendorProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      vendor,
      category,
      brand,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.active_status = status;
    }
    
    if (vendor) {
      query.vendor = vendor;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (brand) {
      query.brand = brand;
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const products = await VendorProduct.find(query)
      .populate('vendor', 'username email firstName lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await VendorProduct.countDocuments(query);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single vendor product
exports.getVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const product = await VendorProduct.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET vendor products by status
exports.getVendorProductsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const options = {
      vendorId: req.query.vendor,
      category: req.query.category,
      brand: req.query.brand,
      sort: req.query.sort || { createdAt: -1 },
      limit: parseInt(req.query.limit) || 50
    };

    const products = await VendorProduct.find({ status: status })
      .populate('vendorId', 'name email firstName lastName username')
      .select('name sku price description category status thumbnail images vendorId createdAt updatedAt approvedAt')
      .sort(options.sort)
      .limit(options.limit);
    
    res.json({
      success: true,
      products,
      count: products.length,
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// APPROVE vendor product
exports.approveVendorProduct = async (req, res) => {
  try {
    const product = await VendorProduct.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        approvedAt: new Date()
      },
      { new: true }
    ).populate('vendorId', 'email firstName lastName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product approved successfully',
      product
    });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DENY vendor product with reason
exports.denyVendorProduct = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Denial reason is required' });
    }

    const product = await VendorProduct.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'denied',
        denialReason: reason.trim(),
        deniedAt: new Date()
      },
      { new: true }
    ).populate('vendorId', 'email firstName lastName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product denied successfully',
      product
    });
  } catch (error) {
    console.error('Deny error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// RECONSIDER denied vendor product
exports.reconsiderVendorProduct = async (req, res) => {
  try {
    const product = await VendorProduct.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'pending',
        reconsideredAt: new Date(),
        denialReason: null // Clear previous denial reason
      },
      { new: true }
    ).populate('vendorId', 'email firstName lastName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create notification for admin about reconsideration
    try {
      await Notification.create({
        type: 'product_reconsideration',
        title: 'Product Reconsideration Request',
        message: `${product.vendorId?.firstName || 'A vendor'} has requested reconsideration for product: ${product.name}`,
        productId: product._id,
        vendorId: product.vendorId?._id,
        status: 'unread'
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Continue even if notification fails
    }

    res.json({
      success: true,
      message: 'Product sent for reconsideration successfully',
      product
    });
  } catch (error) {
    console.error('Reconsider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE vendor product
exports.deleteVendorProduct = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendorId = decoded.userId || decoded.id || decoded._id;
    
    console.log('🗑️ Delete request - Vendor ID:', vendorId);
    console.log('🗑️ Delete request - Product ID:', req.params.id);
    
    const product = await VendorProduct.findById(req.params.id);

    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('🗑️ Product vendorId:', product.vendorId.toString());
    console.log('🗑️ Requesting vendorId:', vendorId);
    console.log('🗑️ User role:', decoded.role);
    
    // Check if vendor owns this product or is admin
    if (product.vendorId.toString() !== vendorId && decoded.role !== 'admin') {
      console.log('❌ Not authorized to delete');
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await VendorProduct.findByIdAndDelete(req.params.id);
    console.log('✅ Product deleted successfully');

    res.json({
      success: true,
      message: 'Product deleted successfully',
      product
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// TOGGLE product active status
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await VendorProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.active_status = product.active_status === 'active' ? 'inactive' : 'active';
    await product.save();

    const updatedProduct = await VendorProduct.findById(product._id)
      .populate('vendor', 'username email firstName lastName');

    res.json({
      message: `Product ${product.active_status === 'active' ? 'activated' : 'deactivated'} successfully`,
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// TOGGLE featured status
exports.toggleFeaturedStatus = async (req, res) => {
  try {
    const product = await VendorProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.show_as_featured = !product.show_as_featured;
    await product.save();

    const updatedProduct = await VendorProduct.findById(product._id)
      .populate('vendor', 'username email firstName lastName');

    res.json({
      message: `Product ${product.show_as_featured ? 'added to' : 'removed from'} featured successfully`,
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET vendor analytics
exports.getVendorAnalytics = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const analytics = await VendorProduct.aggregate([
      { $match: { vendorId: mongoose.Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: '$active_status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$sales_data.total_revenue' },
          totalSold: { $sum: '$sales_data.total_sold' }
        }
      }
    ]);

    const totalProducts = await VendorProduct.countDocuments({ vendorId: vendorId });
    const featuredProducts = await VendorProduct.countDocuments({ 
      vendorId: vendorId, 
      show_as_featured: true 
    });

    res.json({
      analytics,
      totalProducts,
      featuredProducts,
      vendorId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET brands for filter dropdown
exports.getBrands = async (req, res) => {
  try {
    const brands = await VendorProduct.distinct('brand');
    const brandObjects = brands.map((brand, index) => ({
      id: index + 1,
      name: brand
    }));

    res.json(brandObjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET categories for filter dropdown
exports.getCategories = async (req, res) => {
  try {
    const categories = await VendorProduct.distinct('category');
    const categoryObjects = categories.map((category, index) => ({
      id: index + 1,
      name: category
    }));

    res.json(categoryObjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// EXPORT products to CSV
exports.exportProducts = async (req, res) => {
  try {
    const { status, vendor, category, brand } = req.query;
    
    const query = {};
    if (status) query.active_status = status;
    if (vendor) query.vendor = vendor;
    if (category) query.category = category;
    if (brand) query.brand = brand;

    const products = await VendorProduct.find(query)
      .populate('vendor', 'username email')
      .lean();

    // Convert to CSV
    const csvHeaders = [
      'Product Name',
      'SKU', 
      'Vendor',
      'Brand',
      'Category',
      'Price',
      'Stock',
      'Status',
      'Featured',
      'Created At'
    ];

    const csvRows = products.map(product => [
      product.name,
      product.sku,
      product.vendor?.username || 'N/A',
      product.brand,
      product.category,
      product.unit_price,
      product.stock,
      product.active_status,
      product.show_as_featured ? 'Yes' : 'No',
      product.createdAt.toISOString()
    ]);

    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vendor-products.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SEARCH products
exports.searchProducts = async (req, res) => {
  try {
    const { q: searchTerm, status, limit = 20 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const options = {
      status,
      limit: parseInt(limit)
    };

    const products = await VendorProduct.search(searchTerm, options);

    res.json({
      products,
      count: products.length,
      searchTerm
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
