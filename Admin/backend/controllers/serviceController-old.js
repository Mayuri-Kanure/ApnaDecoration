const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');

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
    
    // Execute query with pagination
    const services = await Service.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Service.countDocuments(query);
    
    res.json({
      success: true,
      data: services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
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
    
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching service',
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

// Create new service (admin only)
exports.createService = async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
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
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
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
