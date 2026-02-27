const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendor = await Vendor.findById(decoded.vendorId).select('-password');
    
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Vendor not found.'
      });
    }

    if (vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Account is ${vendor.status}. Access denied.`
      });
    }

    if (!vendor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Contact admin.'
      });
    }

    req.vendorId = vendor._id;
    req.vendor = vendor;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = auth;
