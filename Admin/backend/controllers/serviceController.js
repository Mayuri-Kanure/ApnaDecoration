const Service = require('../models/Service');

// Get all services (public endpoint)
exports.getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, featured, search } = req.query;
    
    // Build query
    const query = {};
    
    if (category) {
      query.serviceType = category; // Use serviceType instead of category
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination - NO COUNTING OPERATION
    const services = await Service.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Skip expensive count operation - use pagination metadata instead
    res.json({
      success: true,
      data: services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        // Use estimated total for pagination instead of exact count
        total: services.length + ((page - 1) * limit) + limit, // Estimate total
        pages: Math.ceil((services.length + ((page - 1) * limit) + limit) / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get featured services
exports.getFeaturedServices = async (req, res) => {
  try {
    const services = await Service.find({ featured: true })
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const services = await Service.find({ 
      serviceType: categoryId // Use serviceType instead of category
    })
      .sort({ priority: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get single service by ID (public endpoint)
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new service (admin only)
exports.createService = async (req, res) => {
  try {
    console.log('🔍 req.files:', req.files);
    console.log('🔍 req.file:', req.file);
    
    let bannerImagePath = '';
    let additionalImages = [];
    
    // Handle banner image from single upload (service-banner folder)
    if (req.file) {
      bannerImagePath = req.file.path || req.file.secure_url || req.file.url;
      console.log('✅ Banner URL (service-banner):', bannerImagePath);
    }
    
    // Handle multiple images (when using uploadServiceImages - service-product folder)
    if (req.files) {
      // Banner image from files (service-product folder)
      if (req.files.bannerImage && req.files.bannerImage.length > 0) {
        bannerImagePath = req.files.bannerImage[0].path || req.files.bannerImage[0].secure_url || req.files.bannerImage[0].url;
        console.log('✅ Banner URL (service-product):', bannerImagePath);
      }
      
      // Additional images (service-product folder)
      if (req.files.images && req.files.images.length > 0) {
        additionalImages = req.files.images.map(file => 
          file.path || file.secure_url || file.url
        );
        console.log('✅ Additional images (service-product):', additionalImages);
      }
    }
    
    const serviceData = {
      name: req.body.name,
      description: req.body.description,
      serviceType: req.body.serviceType,
      price: parseFloat(req.body.price),
      featured: req.body.featured === 'true',
      availability: req.body.availability === 'true',
      customizationAvailable: req.body.customizationAvailable === 'true',
      bannerImage: bannerImagePath,
      images: additionalImages.length > 0 ? additionalImages : []
    };
    
    // Handle base64 images from request body for createService
    if (additionalImages.length === 0 && req.body.images) {
      try {
        const bodyImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (Array.isArray(bodyImages) && bodyImages.length > 0) {
          // Filter out empty strings and keep only valid URLs
          serviceData.images = bodyImages.filter(img => img && !img.startsWith('data:image'));
        }
      } catch (error) {
        console.log('⚠️ Error parsing images from body:', error.message);
        serviceData.images = [];
      }
    }
    
    console.log('🔍 Service data:', serviceData);
    
    const service = new Service(serviceData);
    await service.save();
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
};

// Update service (admin only)
exports.updateService = async (req, res) => {
  try {
    console.log('🔍 req.files:', req.files);
    console.log('🔍 req.file:', req.file);
    
    let bannerImagePath = '';
    let additionalImages = [];
    
    // Handle banner image from single upload (service-banner folder)
    if (req.file) {
      bannerImagePath = req.file.path || req.file.secure_url || req.file.url;
      console.log('✅ Banner URL (service-banner):', bannerImagePath);
    }
    
    // Handle multiple images (when using uploadServiceImages - service-product folder)
    if (req.files) {
      // Banner image from files (service-product folder)
      if (req.files.bannerImage && req.files.bannerImage.length > 0) {
        bannerImagePath = req.files.bannerImage[0].path || req.files.bannerImage[0].secure_url || req.files.bannerImage[0].url;
        console.log('✅ Banner URL (service-product):', bannerImagePath);
      }
      
      // Additional images (service-product folder)
      if (req.files.images && req.files.images.length > 0) {
        additionalImages = req.files.images.map(file => 
          file.path || file.secure_url || file.url
        );
        console.log('✅ Additional images (service-product):', additionalImages);
      }
    }
    
    // Prepare update data
    const updateData = {
      ...req.body
    };
    
    // Add banner image if uploaded
    if (bannerImagePath) {
      updateData.bannerImage = bannerImagePath;
    }
    
    // Add additional images if uploaded
    if (additionalImages.length > 0) {
      updateData.images = additionalImages;
    } else if (req.body.images) {
      // Handle base64 images from request body
      try {
        const bodyImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (Array.isArray(bodyImages) && bodyImages.length > 0) {
          // Filter out empty strings and keep only valid URLs
          updateData.images = bodyImages.filter(img => img && !img.startsWith('data:image'));
        }
      } catch (error) {
        console.log('⚠️ Error parsing images from body:', error.message);
        updateData.images = [];
      }
    }
    
    // Handle featured, availability, customizationAvailable boolean fields
    if (req.body.featured !== undefined) {
      updateData.featured = req.body.featured === 'true';
    }
    if (req.body.availability !== undefined) {
      updateData.availability = req.body.availability === 'true';
    }
    if (req.body.customizationAvailable !== undefined) {
      updateData.customizationAvailable = req.body.customizationAvailable === 'true';
    }
    
    // Handle price
    if (req.body.price !== undefined) {
      updateData.price = parseFloat(req.body.price);
    }
    
    console.log('🔍 Update data:', updateData);
    
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// Delete service (admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};
