const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const VendorRegistration = require('../models/VendorRegistration');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/vendor-registration');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vendor-reg-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: fileFilter
});

// GET vendor registration content
exports.getVendorRegistration = async (req, res) => {
  try {
    let vendorReg = await VendorRegistration.findOne();
    
    if (!vendorReg) {
      // Create default content if none exists
      const defaultData = VendorRegistration.getDefaultData();
      vendorReg = new VendorRegistration(defaultData);
      await vendorReg.save();
    }
    
    res.json(vendorReg);
  } catch (error) {
    console.error('Error fetching vendor registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE vendor registration content
exports.updateVendorRegistration = async (req, res) => {
  try {
    let vendorReg = await VendorRegistration.findOne();
    
    if (!vendorReg) {
      // Create if doesn't exist
      vendorReg = new VendorRegistration();
    }
    
    // Update header section
    if (req.body.headerTitle) vendorReg.headerTitle = req.body.headerTitle;
    if (req.body.headerSubtitle) vendorReg.headerSubtitle = req.body.headerSubtitle;
    if (req.body.headerImage) vendorReg.headerImage = req.body.headerImage;
    
    // Update Why Sell With Us section`
    if (req.body.whySellTitle) vendorReg.whySellTitle = req.body.whySellTitle;
    if (req.body.whySellSubtitle) vendorReg.whySellSubtitle = req.body.whySellSubtitle;
    if (req.body.whySellPoints) vendorReg.whySellPoints = req.body.whySellPoints;
    
    // Update Business Process section (nested object)
    if (req.body.businessProcess) {
      if (req.body.businessProcess.mainTitle) vendorReg.businessProcess.mainTitle = req.body.businessProcess.mainTitle;
      if (req.body.businessProcess.mainSubtitle) vendorReg.businessProcess.mainSubtitle = req.body.businessProcess.mainSubtitle;
      if (req.body.businessProcess.steps) vendorReg.businessProcess.steps = req.body.businessProcess.steps;
    }
    
    // Update Download App section (nested object)
    if (req.body.downloadApp) {
      if (req.body.downloadApp.title) vendorReg.downloadApp.title = req.body.downloadApp.title;
      if (req.body.downloadApp.subtitle) vendorReg.downloadApp.subtitle = req.body.downloadApp.subtitle;
      if (req.body.downloadApp.appImage) vendorReg.downloadApp.appImage = req.body.downloadApp.appImage;
      if (req.body.downloadApp.playStore) vendorReg.downloadApp.playStore = req.body.downloadApp.playStore;
      if (req.body.downloadApp.appStore) vendorReg.downloadApp.appStore = req.body.downloadApp.appStore;
    }
    
    // Update FAQ section (nested object)
    if (req.body.faq) {
      if (req.body.faq.title) vendorReg.faq.title = req.body.faq.title;
      if (req.body.faq.items) vendorReg.faq.items = req.body.faq.items;
    }
    
    vendorReg.updatedBy = req.user?.id;
    await vendorReg.save();
    
    res.json({
      message: 'Vendor registration updated successfully',
      vendorReg
    });
  } catch (error) {
    console.error('Error updating vendor registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPLOAD header image
exports.uploadHeaderImage = async (req, res) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Find and update vendor registration
      let vendorReg = await VendorRegistration.findOne();
      
      if (!vendorReg) {
        vendorReg = new VendorRegistration();
      }
      
      // Delete old image if exists
      if (vendorReg.headerImage) {
        try {
          const oldImagePath = path.join(__dirname, '../public', vendorReg.headerImage);
          await fs.unlink(oldImagePath);
        } catch (error) {
          // Old image not found, continuing...
        }
      }
      
      vendorReg.headerImage = `/uploads/vendor-registration/${req.file.filename}`;
      vendorReg.updatedBy = req.user?.id;
      await vendorReg.save();
      
      res.json({
        message: 'Header image uploaded successfully',
        imagePath: vendorReg.headerImage
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE header image
exports.deleteHeaderImage = async (req, res) => {
  try {
    let vendorReg = await VendorRegistration.findOne();
    
    if (!vendorReg || !vendorReg.headerImage) {
      return res.status(404).json({ message: 'No header image found' });
    }
    
    // Delete file from filesystem
    const imagePath = path.join(__dirname, '../public', vendorReg.headerImage);
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      // Image file not found, continuing...
    }
    
    // Update database
    vendorReg.headerImage = '';
    vendorReg.updatedBy = req.user?.id;
    await vendorReg.save();
    
    res.json({ message: 'Header image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export upload middleware for use in routes
exports.upload = upload;
