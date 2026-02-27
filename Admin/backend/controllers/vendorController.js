const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getVendors = async (req, res) => {
  try {
    console.log('🔍 Getting vendors with query:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const verificationStatus = req.query.verificationStatus;

    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }

    if (search) {
      query.$or = [
        { vendorId: { $regex: search, $options: 'i' } },
        { shopName: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('🔍 Vendor query:', query);

    const vendors = await Vendor.find(query)
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Vendor.countDocuments(query);

    console.log('🔍 Found vendors:', vendors.length);
    console.log('🔍 Total vendors:', total);
    console.log('🔍 First vendor:', vendors[0]);

    // Calculate vendor statistics
    let stats = { totalVendors: 0, activeVendors: 0, inactiveVendors: 0, pendingVendors: 0, verifiedVendors: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 };
    try {
      const statsResult = await Vendor.aggregate([
        { $group: {
          _id: null,
          totalVendors: { $sum: 1 },
          activeVendors: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactiveVendors: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          pendingVendors: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          verifiedVendors: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'verified'] }, 1, 0] } },
          totalProducts: { $sum: '$totalProducts' },
          totalOrders: { $sum: '$totalOrders' },
          totalRevenue: { $sum: '$totalRevenue' }
        }}
      ]);
      
      if (statsResult.length > 0) {
        stats = statsResult[0];
      }
    } catch (aggError) {
      console.error('Vendor aggregation error:', aggError);
      // Continue with default stats
    }

    let statusStats = [];
    try {
      statusStats = await Vendor.aggregate([
        { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }}
      ]);
    } catch (statusError) {
      console.error('Vendor status aggregation error:', statusError);
    }

    let verificationStats = [];
    try {
      verificationStats = await Vendor.aggregate([
        { $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }}
      ]);
    } catch (verificationError) {
      console.error('Vendor verification aggregation error:', verificationError);
    }

    const responseData = {
      vendors,
      stats: {
        totalVendors: stats.totalVendors || 0,
        activeVendors: stats.activeVendors || 0,
        inactiveVendors: stats.inactiveVendors || 0,
        pendingVendors: stats.pendingVendors || 0,
        verifiedVendors: stats.verifiedVendors || 0,
        totalProducts: stats.totalProducts || 0,
        totalOrders: stats.totalOrders || 0,
        totalRevenue: stats.totalRevenue || 0
      },
      statusStats,
      verificationStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };

    console.log('🔍 Response data:', JSON.stringify(responseData, null, 2));

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    console.log('🔍 Creating vendor with data:', req.body);
    console.log('🔍 User ID:', req.user?.id);
    console.log('🔍 User ID (userId):', req.user?.userId);
    console.log('🔍 Full user object:', req.user);
    console.log('🔍 Files:', req.files);
    
    const { shopName, vendorName, email, phone, address, businessType, gstNumber, panNumber, bankDetails, firstName, lastName } = req.body;
    const createdBy = req.user.userId;

    // Generate vendorName from firstName + lastName if not provided
    const finalVendorName = vendorName || `${firstName || ''} ${lastName || ''}`.trim();
    
    // Generate vendorId if not provided
    const vendorId = `VEN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Check if vendor with email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor with this email already exists' });
    }

    // Handle file uploads to Cloudinary
    let vendorImageUrl = null;
    let shopLogoUrl = null;
    let shopBannerUrl = null;
    let documentUrls = {};

    // Upload vendor image to Cloudinary
    if (req.files && req.files.vendorImage && req.files.vendorImage.length > 0) {
      try {
        const vendorImageResult = await cloudinary.uploader.upload(req.files.vendorImage[0].path, {
          folder: 'apna-decoration/vendors/images',
          resource_type: 'image'
        });
        vendorImageUrl = vendorImageResult.secure_url;
        
        // Delete local file after upload
        fs.unlinkSync(req.files.vendorImage[0].path);
      } catch (uploadError) {
        console.error('❌ Vendor image upload error:', uploadError);
      }
    }

    // Upload shop logo to Cloudinary
    if (req.files && req.files.shopLogo && req.files.shopLogo.length > 0) {
      try {
        const shopLogoResult = await cloudinary.uploader.upload(req.files.shopLogo[0].path, {
          folder: 'apna-decoration/vendors/logos',
          resource_type: 'image'
        });
        shopLogoUrl = shopLogoResult.secure_url;
        
        // Delete local file after upload
        fs.unlinkSync(req.files.shopLogo[0].path);
      } catch (uploadError) {
        console.error('❌ Shop logo upload error:', uploadError);
      }
    }

    // Upload shop banner to Cloudinary
    if (req.files && req.files.shopBanner && req.files.shopBanner.length > 0) {
      try {
        const shopBannerResult = await cloudinary.uploader.upload(req.files.shopBanner[0].path, {
          folder: 'apna-decoration/vendors/banners',
          resource_type: 'image'
        });
        shopBannerUrl = shopBannerResult.secure_url;
        
        // Delete local file after upload
        fs.unlinkSync(req.files.shopBanner[0].path);
      } catch (uploadError) {
        console.error('❌ Shop banner upload error:', uploadError);
      }
    }

    // Upload documents to Cloudinary
    if (req.files && req.files.documents && req.files.documents.length > 0) {
      for (const [index, document] of req.files.documents.entries()) {
        try {
          const docResult = await cloudinary.uploader.upload(document.path, {
            folder: 'apna-decoration/vendors/documents',
            resource_type: 'auto'
          });
          
          // Store document URL by field name or index
          const fieldName = document.fieldname || `document_${index}`;
          documentUrls[fieldName] = docResult.secure_url;
          
          // Delete local file after upload
          fs.unlinkSync(document.path);
        } catch (uploadError) {
          console.error(`❌ Document ${index} upload error:`, uploadError);
        }
      }
    }

    const vendorData = {
      vendorId,
      shopName,
      vendorName: finalVendorName,
      email,
      phone,
      address: typeof address === 'string' ? JSON.parse(address) : address,
      businessType,
      gstNumber,
      panNumber,
      bankDetails: typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails,
      vendorImage: vendorImageUrl,
      shopLogo: shopLogoUrl,
      shopBanner: shopBannerUrl,
      documents: documentUrls,
      createdBy
    };
    
    console.log('🔍 Vendor data to save:', vendorData);

    const vendor = new Vendor(vendorData);
    await vendor.save();

    res.status(201).json({
      message: 'Vendor created successfully',
      vendor
    });
  } catch (error) {
    console.error('❌ Create vendor error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const { shopName, vendorName, email, phone, address, businessType, gstNumber, panNumber, bankDetails, status } = req.body;
    
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        shopName,
        vendorName,
        email,
        phone,
        address,
        businessType,
        gstNumber,
        panNumber,
        bankDetails,
        status
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      message: 'Vendor updated successfully',
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name email');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get vendor's products and orders
    const products = await Product.find({ vendorId: vendor._id }).countDocuments();
    const orders = await Order.find({ 'items.vendorId': vendor._id }).countDocuments();

    res.json({
      vendor,
      stats: {
        products,
        orders
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyVendor = async (req, res) => {
  try {
    const { verificationStatus, documents } = req.body;
    const verifiedBy = req.user.id;
    
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus,
        documents,
        verifiedBy,
        verifiedAt: verificationStatus === 'verified' ? new Date() : null
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      message: 'Vendor verification updated successfully',
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateVendorStats = async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    
    for (const vendor of vendors) {
      const totalProducts = await Product.countDocuments({ vendorId: vendor._id });
      const totalOrders = await Order.countDocuments({ 'items.vendorId': vendor._id });
      
      await Vendor.findByIdAndUpdate(vendor._id, {
        totalProducts,
        totalOrders
      });
    }

    res.json({
      message: 'Vendor statistics updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
