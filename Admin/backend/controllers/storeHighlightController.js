const StoreHighlight = require('../models/StoreHighlight');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/store-highlights/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, SVG) are allowed!'));
    }
  }
});

// GET all store highlights
exports.getAllStoreHighlights = async (req, res) => {
  try {
    const highlights = await StoreHighlight.find().sort({ featureType: 1 });
    
    // If no highlights exist, create default ones
    if (highlights.length === 0) {
      const defaultTitles = StoreHighlight.getDefaultTitles();
      const defaultDescriptions = StoreHighlight.getDescriptions();
      
      const defaultHighlights = Object.keys(defaultTitles).map((type, index) => ({
        featureType: type,
        title: defaultTitles[type],
        description: defaultDescriptions[type],
        active: type !== 'return', // Keep return policy disabled by default
        icon: '',
        createdBy: req.user?.id
      }));
      
      const createdHighlights = await StoreHighlight.insertMany(defaultHighlights);
      return res.json(createdHighlights);
    }
    
    res.json(highlights);
  } catch (error) {
    console.error('Error fetching store highlights:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE store highlight
exports.updateStoreHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, active } = req.body;
    
    let highlight = await StoreHighlight.findById(id);
    
    if (!highlight) {
      return res.status(404).json({ message: 'Store highlight not found' });
    }
    
    // Update fields
    if (title !== undefined) highlight.title = title;
    if (active !== undefined) highlight.active = active;
    
    // Update icon if file was uploaded
    if (req.file) {
      // Delete old icon if exists
      if (highlight.icon && fs.existsSync(highlight.icon)) {
        fs.unlinkSync(highlight.icon);
      }
      highlight.icon = req.file.path;
    }
    
    highlight.updatedBy = req.user?.id;
    await highlight.save();
    
    res.json({
      message: 'Store highlight updated successfully',
      highlight
    });
  } catch (error) {
    console.error('Error updating store highlight:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE store highlight icon
exports.updateStoreHighlightIcon = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    let highlight = await StoreHighlight.findById(id);
    
    if (!highlight) {
      return res.status(404).json({ message: 'Store highlight not found' });
    }
    
    // Delete old icon if exists
    if (highlight.icon && fs.existsSync(highlight.icon)) {
      fs.unlinkSync(highlight.icon);
    }
    
    highlight.icon = req.file.path;
    highlight.updatedBy = req.user?.id;
    await highlight.save();
    
    res.json({
      message: 'Icon updated successfully',
      icon: highlight.icon
    });
  } catch (error) {
    console.error('Error updating icon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE store highlight icon
exports.deleteStoreHighlightIcon = async (req, res) => {
  try {
    const { id } = req.params;
    
    let highlight = await StoreHighlight.findById(id);
    
    if (!highlight) {
      return res.status(404).json({ message: 'Store highlight not found' });
    }
    
    // Delete icon file if exists
    if (highlight.icon && fs.existsSync(highlight.icon)) {
      fs.unlinkSync(highlight.icon);
    }
    
    highlight.icon = '';
    highlight.updatedBy = req.user?.id;
    await highlight.save();
    
    res.json({
      message: 'Icon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting icon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export upload middleware
exports.uploadIcon = upload.single('icon');
