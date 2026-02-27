const ServiceCategory = require('../models').ServiceCategory;
const mongoose = require('mongoose');

// Get service categories for home page (public endpoint)
const getHomePageServiceCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, homeCategory } = req.query;
    
    // Build filter - only show active home categories for public
    const filter = {
      status: 'active', // Only active categories
      homeCategory: homeCategory === 'true' // Only home categories
    };
    
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
    console.error('Error fetching home page service categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home page service categories',
      error: error.message
    });
  }
};

module.exports = {
  getHomePageServiceCategories
};
