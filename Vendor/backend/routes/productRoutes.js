const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all vendor products
router.get('/', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { page = 1, limit = 10, status, category } = req.query;

    const query = { vendorId };
    if (status) query.status = status;
    if (category) query.category = category;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('category', 'name');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message
    });
  }
});

// Create new product
router.post('/', auth, upload.array('images', 5), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').isMongoId().withMessage('Valid category ID required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const vendorId = req.vendorId;
    const { name, description, price, category, stock, sku } = req.body;

    // Upload images to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.buffer, {
          folder: process.env.CLOUDINARY_FOLDER,
          resource_type: 'image'
        });
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }

    // Create product
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      sku: sku || `PRD-${Date.now()}`,
      vendorId,
      images,
      thumbnail: images.length > 0 ? images[0].url : null,
      status: 'pending', // Requires admin approval
      createdAt: new Date()
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully. Awaiting admin approval.',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Update product
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId, vendorId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updates = req.body;
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.buffer, {
          folder: process.env.CLOUDINARY_FOLDER,
          resource_type: 'image'
        });
        newImages.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
      updates.images = [...product.images, ...newImages];
      if (!updates.thumbnail && newImages.length > 0) {
        updates.thumbnail = newImages[0].url;
      }
    }

    Object.assign(product, updates);
    product.updatedAt = new Date();
    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId, vendorId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// Get product analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId, vendorId })
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate analytics (you can expand this with actual order data)
    const analytics = {
      views: product.views || 0,
      orders: product.orders || 0,
      revenue: product.revenue || 0,
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      stock: product.stock,
      status: product.status
    };

    res.json({
      success: true,
      data: { product, analytics }
    });

  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product analytics',
      error: error.message
    });
  }
});

module.exports = router;
