const DeliveryMan = require('../models/Delivery');
const DeliveryBoy = require('../models/DeliveryBoy');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'deliverymanImage') {
      cb(null, 'uploads/deliveryman-images/');
    } else if (file.fieldname === 'identityImage') {
      cb(null, 'uploads/identity-images/');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Upload image to Cloudinary
const uploadToCloudinary = async (filePath, folder, retries = 2) => {
  try {
    console.log('🔍 Uploading to Cloudinary:', filePath, 'to folder:', folder);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `apna-decoration/${folder}`,
      resource_type: 'auto',
      timeout: 60000 // 60 seconds timeout
    });
    
    // Delete local file after upload
    const fs = require('fs');
    fs.unlinkSync(filePath);
    
    console.log('✅ Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    
    // Retry logic
    if (retries > 0 && error.name === 'TimeoutError') {
      console.log('🔄 Retrying Cloudinary upload, retries left:', retries);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(uploadToCloudinary(filePath, folder, retries - 1));
        }, 2000); // Wait 2 seconds before retry
      });
    }
    
    throw error;
  }
};

exports.getDeliveries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const isAvailable = req.query.isAvailable;

    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    if (search) {
      query.$or = [
        { deliveryId: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const deliveries = await DeliveryBoy.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await DeliveryBoy.countDocuments(query);
    
    // Also get deliverymen from Admin-added collection
    const deliveryMen = await DeliveryMan.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Combine both collections
    const allDeliveries = [...deliveryMen, ...deliveries];

    // Calculate delivery statistics
    const stats = await DeliveryBoy.aggregate([
      { $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        activeDeliveries: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        inactiveDeliveries: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
        suspendedDeliveries: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
        availableDeliveries: { $sum: { $cond: ['$isAvailable', 1, 0] } },
        totalSuccessfulDeliveries: { $sum: '$successfulDeliveries' },
        totalFailedDeliveries: { $sum: '$failedDeliveries' },
        averageRating: { $avg: '$rating' },
        totalEarnings: { $sum: '$earnings' }
      }}
    ]);

    console.log('🔍 Delivery API Response:', {
      deliveriesCount: deliveries.length,
      total,
      firstDelivery: deliveries[0] ? {
        _id: deliveries[0]._id,
        firstName: deliveries[0].firstName,
        lastName: deliveries[0].lastName,
        email: deliveries[0].email,
        deliverymanImage: deliveries[0].deliverymanImage ? 'Present' : 'Missing'
      } : 'None'
    });

    res.json({
      deliveries: allDeliveries,
      total: allDeliveries.length,
      total,
      stats: {
        totalDeliveries: stats[0]?.totalDeliveries || 0,
        activeDeliveries: stats[0]?.activeDeliveries || 0,
        inactiveDeliveries: stats[0]?.inactiveDeliveries || 0,
        suspendedDeliveries: stats[0]?.suspendedDeliveries || 0,
        availableDeliveries: stats[0]?.availableDeliveries || 0,
        totalSuccessfulDeliveries: stats[0]?.totalSuccessfulDeliveries || 0,
        totalFailedDeliveries: stats[0]?.totalFailedDeliveries || 0,
        averageRating: stats[0]?.averageRating || 0,
        totalEarnings: stats[0]?.totalEarnings || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate unique delivery ID
const generateDeliveryId = () => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DEL-${timestamp}-${randomStr}`;
};

exports.createDelivery = async (req, res) => {
  try {
    console.log('🔍 Creating delivery with data:', req.body);
    console.log('🔍 Files:', req.files);
    console.log('🔍 User ID:', req.user?.userId);
    
    const {
      firstName,
      lastName,
      phone,
      countryCode,
      address,
      identityType,
      identityNumber,
      email,
      password
    } = req.body;

    const createdBy = req.user.userId;
    const deliveryId = generateDeliveryId(); // Generate unique delivery ID
    
    console.log('🔍 Generated deliveryId:', deliveryId);

    // Check if email already exists
    const existingDelivery = await DeliveryBoy.findOne({ email });
    if (existingDelivery) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if phone already exists
    const existingPhone = await DeliveryBoy.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get uploaded file paths
    const deliverymanImage = req.files?.deliverymanImage?.[0]?.path;
    const identityImage = req.files?.identityImage?.[0]?.path;

    if (!deliverymanImage || !identityImage) {
      return res.status(400).json({ message: 'Both delivery man image and identity image are required' });
    }

    // Upload images to Cloudinary
    let deliverymanImageUrl, identityImageUrl;
    
    try {
      deliverymanImageUrl = await uploadToCloudinary(deliverymanImage, 'delivery-men/images');
      identityImageUrl = await uploadToCloudinary(identityImage, 'delivery-men/identity');
    } catch (uploadError) {
      return res.status(500).json({ message: 'Error uploading images', error: uploadError.message });
    }

    const delivery = new DeliveryBoy({
      deliveryId, // Add the generated deliveryId
      firstName,
      lastName,
      phone,
      countryCode,
      address,
      identityType,
      identityNumber,
      email,
      password: hashedPassword,
      deliverymanImage: deliverymanImageUrl,
      identityImage: identityImageUrl,
      createdBy
    });

    console.log('🔍 DeliveryBoy object before save:', {
      deliveryId,
      firstName,
      lastName,
      email,
      phone,
      deliverymanImage: deliverymanImageUrl ? 'URL present' : 'Missing',
      identityImage: identityImageUrl ? 'URL present' : 'Missing',
      createdBy
    });

    await delivery.save();

    // Remove password from response
    const deliveryResponse = delivery.toObject();
    delete deliveryResponse.password;

    res.status(201).json({
      message: 'Delivery man created successfully',
      delivery: deliveryResponse
    });
  } catch (error) {
    console.error('❌ Create delivery error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request body:', req.body);
    console.error('❌ Files:', req.files);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      countryCode,
      address,
      identityType,
      identityNumber,
      email,
      status,
      isAvailable
    } = req.body;
    
    const delivery = await DeliveryBoy.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    // Check if email already exists (if changing)
    if (email && email !== delivery.email) {
      const existingDeliveryBoy = await DeliveryBoy.findOne({ email });
      if (existingDeliveryBoy) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Check if phone already exists (if changing)
    if (phone && phone !== delivery.phone) {
      const existingPhone = await DeliveryBoy.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number already exists' });
      }
    }

    // Handle image uploads if present
    const updateData = {
      firstName,
      lastName,
      phone,
      countryCode,
      address,
      identityType,
      identityNumber,
      email,
      status,
      isAvailable
    };

    if (req.files?.deliverymanImage?.[0]) {
      updateData.deliverymanImage = req.files.deliverymanImage[0].path;
    }

    if (req.files?.identityImage?.[0]) {
      updateData.identityImage = req.files.identityImage[0].path;
    }

    const updatedDeliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email');

    // Remove password from response
    const deliveryResponse = updatedDeliveryBoy.toObject();
    delete deliveryResponse.password;

    res.json({
      message: 'Delivery man updated successfully',
      delivery: deliveryResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await DeliveryBoy.findByIdAndDelete(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    res.json({
      message: 'Delivery man deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await DeliveryBoy.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    // Remove password from response
    const deliveryResponse = delivery.toObject();
    delete deliveryResponse.password;

    res.json({
      delivery: deliveryResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await DeliveryBoy.find({ 
      status: 'active', 
      isAvailable: true 
    })
    .select('firstName lastName phone email rating currentLocation')
    .sort({ rating: -1, lastActive: -1 });

    res.json({
      deliveries
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateDeliveryStats = async (req, res) => {
  try {
    const { deliveryId, successful, rating } = req.body;
    
    const delivery = await DeliveryBoy.findById(deliveryId);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery man not found' });
    }

    await delivery.updateStats(successful);

    if (rating) {
      await delivery.updateRating(rating);
    }

    res.json({
      message: 'Delivery stats updated successfully',
      delivery
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Middleware for handling file uploads
exports.uploadDeliveryImages = upload.fields([
  { name: 'deliverymanImage', maxCount: 1 },
  { name: 'identityImage', maxCount: 1 }
]);
