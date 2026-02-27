const Banner = require('../models/Banner');
const cloudinaryService = require('../services/cloudinaryService');

// Get published banners (public route - no authentication required)
exports.getPublicBanners = async (req, res) => {
  try {
    console.log('=== GET PUBLIC BANNERS API CALLED ===');
    const banners = await Banner.find({ published: true })
      .populate('product', 'product_name_en')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    console.log('Public banners found:', banners.length);
    res.json({ banners });
  } catch (error) {
    console.error('Error in getPublicBanners:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all banners
exports.getBanners = async (req, res) => {
  try {
    console.log('=== GET BANNERS API CALLED ===');
    const banners = await Banner.find().populate('product', 'product_name_en').populate('category', 'name');
    console.log('Banners found:', banners.length);
    res.json({ banners });
  } catch (error) {
    console.error('Error in getBanners:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    console.log('=== CREATE BANNER API CALLED ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request user:', req.user);

    const { bannerType, bannerUrl, resourceType, product, category, published } = req.body;

    // Create banner data
    const bannerData = {
      bannerType: bannerType || 'Main Banner',
      bannerUrl: bannerUrl || '',
      resourceType: resourceType || '',
      published: published === 'true' || published === true
    };

    // Add image path if file was uploaded
    if (req.file) {
      if (req.file.path && req.file.path.includes('cloudinary')) {
        // Cloudinary URL
        bannerData.image = req.file.path;
        console.log('✅ Image saved to Cloudinary:', bannerData.image);
      } else {
        // Local storage path
        bannerData.image = `/uploads/banners/${req.file.filename}`;
        console.log('✅ Image saved locally:', bannerData.image);
      }
    }

    // Add product reference if specified
    if (resourceType === 'product' && product) {
      bannerData.product = product;
    }

    // Add category reference if specified
    if (resourceType === 'category' && category) {
      bannerData.category = category;
    }

    const banner = new Banner(bannerData);
    await banner.save();

    console.log('Banner created successfully:', banner);

    // Return the created banner with populated references
    const populatedBanner = await Banner.findById(banner._id)
      .populate('product', 'product_name_en')
      .populate('category', 'name');

    res.status(201).json({
      message: 'Banner created successfully',
      banner: populatedBanner
    });
  } catch (error) {
    console.error('Error in createBanner:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a banner
exports.updateBanner = async (req, res) => {
  try {
    console.log('=== UPDATE BANNER API CALLED ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    const { id } = req.params;

    // Find existing banner first
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const {
      bannerType,
      bannerUrl,
      resourceType,
      published,
      product,
      category
    } = req.body;

    // Update fields ONLY if provided
    if (bannerType !== undefined) banner.bannerType = bannerType;
    if (bannerUrl !== undefined) banner.bannerUrl = bannerUrl;
    if (resourceType !== undefined) banner.resourceType = resourceType;
    if (published !== undefined) banner.published = published;
    if (product !== undefined && product !== '') banner.product = product;
    if (category !== undefined && category !== '') banner.category = category;

    // Update image if new file was uploaded
    if (req.file) {
      if (req.file.path && req.file.path.includes('cloudinary')) {
        // Cloudinary URL
        banner.image = req.file.path;
        console.log('Updated banner image to Cloudinary:', banner.image);
      } else {
        // Local storage path
        banner.image = `/uploads/banners/${req.file.filename}`;
        console.log('Updated banner image locally:', banner.image);
      }
    }

    console.log('Updated banner object before save:', banner);

    await banner.save();

    // Populate for response
    try {
      const populatedBanner = await Banner.findById(banner._id)
        .populate('product', 'product_name_en')
        .populate('category', 'name');
      
      console.log('Banner updated successfully:', populatedBanner);
      res.json({
        message: 'Banner updated successfully',
        banner: populatedBanner
      });
      return;
    } catch (populateError) {
      console.log('⚠️ Populate error (continuing):', populateError.message);
      // Continue without populate if there's an issue
    }
  } catch (error) {
    console.error('❌ Update Banner Error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    console.log('=== DELETE BANNER API CALLED ===');
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    console.log('Banner deleted successfully:', banner);
    res.json({
      message: 'Banner deleted successfully',
      banner
    });
  } catch (error) {
    console.error('Error in deleteBanner:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle banner published status
exports.toggleBannerStatus = async (req, res) => {
  try {
    console.log('=== TOGGLE BANNER STATUS API CALLED ===');
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.published = !banner.published;
    await banner.save();

    console.log('Banner status toggled successfully:', banner);
    res.json({
      message: 'Banner status updated successfully',
      banner
    });
  } catch (error) {
    console.error('Error in toggleBannerStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
