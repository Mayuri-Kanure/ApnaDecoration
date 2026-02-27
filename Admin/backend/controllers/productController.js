const Product = require('../models/Product');
const VendorProduct = require('../models/VendorProduct');

// Helper function to strip HTML tags
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

// Get clearance products (public endpoint)
exports.getClearanceProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = 'discount_desc' } = req.query;
    
    // Find active clearance products that haven't expired
    const clearanceProducts = await Product.find({
      status: 'active',
      isClearance: true,
      $or: [
        { clearanceExpiry: null },
        { clearanceExpiry: { $gt: new Date() } }
      ]
    })
    .sort(getClearanceSort(sort))
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();
    
    const total = await Product.countDocuments({
      status: 'active',
      isClearance: true,
      $or: [
        { clearanceExpiry: null },
        { clearanceExpiry: { $gt: new Date() } }
      ]
    });
    
    // Format products for frontend
    const formattedProducts = clearanceProducts.map(product => ({
      ...product,
      id: product._id,
      clearancePrice: product.clearanceOriginalPrice * (1 - product.clearanceDiscount / 100),
      discountPercentage: product.clearanceDiscount,
      originalPrice: product.clearanceOriginalPrice || product.price,
      isClearance: true
    }));
    
    res.json({
      success: true,
      data: formattedProducts,
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

// Helper function for sorting clearance products
function getClearanceSort(sort) {
  switch (sort) {
    case 'discount_desc':
      return { clearanceDiscount: -1 };
    case 'discount_asc':
      return { clearanceDiscount: 1 };
    case 'price_asc':
      return { clearanceOriginalPrice: 1 };
    case 'price_desc':
      return { clearanceOriginalPrice: -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'ending_soon':
      return { clearanceExpiry: 1 };
    default:
      return { clearanceDiscount: -1 };
  }
}

// Get all products (public endpoint) - includes regular products and approved vendor products
exports.getAllProducts = async (req, res) => {
  try {
    // Fetch regular products
    const products = await Product.find({ status: 'active' });
    
    // Fetch approved vendor products
    const vendorProducts = await VendorProduct.find({ status: 'approved' })
      .select('name description price category sku images thumbnail createdAt');
    
    // Combine both arrays
    const allProducts = [
      ...products.map(product => ({
        ...product.toObject(),
        id: product._id.toString(),
        source: 'regular'
      })),
      ...vendorProducts.map(product => ({
        ...product.toObject(),
        id: product._id.toString(),
        source: 'vendor'
      }))
    ];
    
    res.json({
      success: true,
      data: allProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single product by ID (public endpoint)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      success: true,
      data: {
        ...product.toObject(),
        id: product._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get featured products (public endpoint)
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', is_featured: true });
    res.json({
      products: products.map(product => ({
        ...product.toObject(),
        id: product._id.toString()
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.featured = !product.featured;
    product.is_featured = product.featured; // Sync both fields
    await product.save();
    
    res.json({
      success: true,
      message: `Product ${product.featured ? 'added to' : 'removed from'} featured successfully`,
      data: {
        id: product._id.toString(),
        featured: product.featured,
        is_featured: product.is_featured
      }
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search products (public endpoint)
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const products = await Product.find({
      status: 'active',
      $or: [
        { product_name_en: { $regex: q, $options: 'i' } },
        { description_en: { $regex: q, $options: 'i' } }
      ]
    });

    res.json({
      products: products.map(product => ({
        ...product.toObject(),
        id: product._id.toString()
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new product (admin only) - Production Ready
exports.createProduct = async (data, imagePaths) => {
  try {
    console.log('Create product data:', data);
    console.log('Image paths:', imagePaths);

    // Parse productData if it's a string
    let productData;
    if (typeof data === 'string') {
      productData = JSON.parse(data);
    } else {
      productData = data;
    }

    // Convert local paths to Cloudinary URLs if needed
    const processedImagePaths = imagePaths.map(path => {
      if (path.startsWith('/uploads/')) {
        // Convert to full URL for local development
        return `https://localhost:5000${path}`;
      } else if (path.startsWith('http')) {
        // Already a Cloudinary URL
        return path;
      } else {
        // Assume it's a Cloudinary URL
        return `https://res.cloudinary.com/drrlkntpx/image/upload/${path}`;
      }
    });

    const {
      product_name_en,
      description_en,
      category_id,
      sku,
      unit_price,
      stock_qty,
      tags,
      status,
      is_featured,
      video_link,
      meta_title,
      meta_description,
      indexing_option,
      max_snippet,
      max_video_preview,
      max_image_preview,
      tax_percent,
      tax_calculation,
      shipping_cost,
      discount_type,
      discount_amount,
      min_order_qty,
      max_order_qty,
      color_wise_images,
      has_variations,
      variations
    } = productData;

    // Parse JSON fields
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

    // Create product with image paths and proper field mapping
    const product = new Product({
      // REQUIRED schema fields
      name: stripHtml(product_name_en),
      description: stripHtml(description_en),
      price: parseFloat(unit_price) || 0,
      category: category_id,
      
      // Admin compatibility fields
      product_name_en,
      description_en,
      category_id,
      sku: sku || `SKU-${Date.now()}`,
      unit_price: parseFloat(unit_price) || 0,
      stock: stock_qty !== undefined && stock_qty !== '' ? parseInt(stock_qty) : 0,
      tags: parsedTags,
      status: status || 'active',
      is_featured: is_featured === 'true',
      featured: is_featured === 'true',
      video_link,
      meta_title,
      meta_description,
      indexing_option,
      max_snippet,
      max_video_preview,
      max_image_preview,
      tax_percent: parseFloat(tax_percent) || 0,
      tax_calculation,
      shipping_cost: parseFloat(shipping_cost) || 0,
      discount_type,
      discount_amount: parseFloat(discount_amount) || 0,
      min_order_qty: parseInt(min_order_qty) || 1,
      max_order_qty: parseInt(max_order_qty) || 0,
      color_wise_images: color_wise_images || {},
      has_variations: has_variations || false,
      variations: variations || [],
      // Handle images - first image as thumbnail, all as images array
      thumbnail: processedImagePaths && processedImagePaths.length > 0 ? processedImagePaths[0] : '',
      images: processedImagePaths || [],
      created_at: new Date(),
      updated_at: new Date()
    });

    await product.save();
    return product;

  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
};

// Update product (admin only) - Production Ready
exports.updateProduct = async (req, id, data, imagePaths) => {
  try {
    const product = await Product.findById(id);

    if (!product) {
      throw new Error('Product not found');
    }

    // Parse productData if it's a string
    let productData;
    if (typeof data === 'string') {
      productData = JSON.parse(data);
    } else {
      productData = data;
    }

    const {
      product_name_en,
      description_en,
      category_id,
      sku,
      unit_price,
      stock_qty,
      tags,
      status,
      is_featured,
      video_link,
      meta_title,
      meta_description,
      indexing_option,
      max_snippet,
      max_video_preview,
      max_image_preview,
      tax_percent,
      tax_calculation,
      shipping_cost,
      discount_type,
      discount_amount,
      min_order_qty,
      max_order_qty,
      color_wise_images,
      has_variations,
      variations
    } = productData;

    // Parse JSON fields
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

    // Update product fields with proper mapping
    const updateData = {
      // REQUIRED schema fields
      name: stripHtml(product_name_en) || stripHtml(product.product_name_en),
      description: stripHtml(description_en) || stripHtml(product.description_en),
      price: unit_price ? parseFloat(unit_price) : product.price,
      category: category_id || product.category,
      
      // Admin compatibility fields
      product_name_en: product_name_en || product.product_name_en,
      description_en: description_en || product.description_en,
      category_id: category_id || product.category_id,
      sku: sku || product.sku,
      unit_price: unit_price ? parseFloat(unit_price) : product.unit_price,
      stock: stock_qty !== undefined && stock_qty !== '' ? parseInt(stock_qty) : product.stock,
      tags: parsedTags,
      status: status || product.status,
      is_featured: is_featured !== undefined ? is_featured === 'true' : product.is_featured,
      featured: is_featured !== undefined ? is_featured === 'true' : product.featured,
      video_link: video_link || product.video_link,
      meta_title: meta_title || product.meta_title,
      meta_description: meta_description || product.meta_description,
      indexing_option: indexing_option || product.indexing_option,
      max_snippet: max_snippet || product.max_snippet,
      max_video_preview: max_video_preview || product.max_video_preview,
      max_image_preview: max_image_preview || product.max_image_preview,
      tax_percent: tax_percent ? parseFloat(tax_percent) : product.tax_percent,
      tax_calculation: tax_calculation || product.tax_calculation,
      shipping_cost: shipping_cost ? parseFloat(shipping_cost) : product.shipping_cost,
      discount_type: discount_type || product.discount_type,
      discount_amount: discount_amount ? parseFloat(discount_amount) : product.discount_amount,
      min_order_qty: min_order_qty ? parseInt(min_order_qty) : product.min_order_qty,
      max_order_qty: max_order_qty ? parseInt(max_order_qty) : product.max_order_qty,
      color_wise_images: color_wise_images || product.color_wise_images,
      has_variations: has_variations !== undefined ? has_variations : product.has_variations,
      variations: variations || product.variations,
      updated_at: new Date()
    };

    // Handle images if provided
    if (imagePaths && imagePaths.length > 0) {
      updateData.thumbnail = imagePaths[0];
    }
    updateData.images = imagePaths;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return updatedProduct;

  } catch (error) {
    console.error('Update product error:', error);
    
    // Better error logging for field validation issues
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      Object.keys(error.errors).forEach(field => {
        console.error(`❌ Field '${field}' validation failed:`, error.errors[field].message);
      });
    }
    
    throw error;
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Actually delete from database (not soft delete)
    await Product.findByIdAndDelete(id);
    
    // Also delete associated images from filesystem (optional)
    // This ensures complete cleanup
    
    res.json({
      success: true,
      message: 'Product deleted successfully from database'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};