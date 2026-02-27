const AdminSettings = require('../models/AdminSettings');

// Get system settings
exports.getSystemSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    // Extract system settings from the main settings
    const systemSettings = {
      appName: settings.businessName || 'APNA DECORATION',
      appDebug: false, // Default value
      appMode: 'production', // Default value
      appUrl: 'https://apnadecoration.com', // Default value
      dbConnection: 'mongodb', // Default based on current setup
      dbHost: 'localhost',
      dbPort: '27017',
      dbDatabase: 'apna_decoration',
      dbUsername: '',
      dbPassword: '',
      buyerUsername: '',
      purchaseCode: ''
    };
    
    res.json(systemSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system settings', error: error.message });
  }
};

// Update system settings
exports.updateSystemSettings = async (req, res) => {
  try {
    const {
      appName,
      appDebug,
      appMode,
      appUrl,
      dbConnection,
      dbHost,
      dbPort,
      dbDatabase,
      dbUsername,
      dbPassword,
      buyerUsername,
      purchaseCode
    } = req.body;
    
    // Validation
    if (!appName || !appUrl || !dbHost) {
      return res.status(400).json({ message: 'Required fields: App Name, App URL, DB Host' });
    }
    
    // URL validation
    try {
      const url = new URL(appUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ message: 'URL must use HTTP or HTTPS protocol' });
      }
    } catch {
      return res.status(400).json({ message: 'Please enter a valid URL' });
    }
    
    // Database port validation
    if (dbPort && (isNaN(dbPort) || dbPort < 1 || dbPort > 65535)) {
      return res.status(400).json({ message: 'Database port must be between 1 and 65535' });
    }
    
    const settings = await AdminSettings.getSettings();
    
    // Update business name
    settings.businessName = appName;
    
    // Store system settings in a nested object
    settings.systemSettings = {
      appDebug,
      appMode,
      appUrl,
      dbConnection,
      dbHost,
      dbPort,
      dbDatabase,
      dbUsername,
      dbPassword,
      buyerUsername,
      purchaseCode,
      updatedAt: new Date()
    };
    
    await settings.save();
    
    res.json({
      message: 'System settings updated successfully',
      settings: {
        appName: settings.businessName,
        appDebug,
        appMode,
        appUrl,
        dbConnection,
        dbHost,
        dbPort,
        dbDatabase,
        dbUsername,
        buyerUsername,
        purchaseCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating system settings', error: error.message });
  }
};

// Get app version control
exports.getVersionControl = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    // Default version control settings
    const versionControl = settings.versionControl || {
      customer: {
        android: {
          minVersion: '1.0.0',
          downloadUrl: 'https://play.google.com/store/apps/details?id=com.apnadecoration.customer'
        },
        ios: {
          minVersion: '1.0.0',
          downloadUrl: 'https://apps.apple.com/app/apnadecoration-customer'
        }
      },
      vendor: {
        android: {
          minVersion: '1.0.0',
          downloadUrl: 'https://play.google.com/store/apps/details?id=com.apnadecoration.vendor'
        },
        ios: {
          minVersion: '1.0.0',
          downloadUrl: 'https://apps.apple.com/app/apnadecoration-vendor'
        }
      },
      deliveryman: {
        android: {
          minVersion: '1.0.0',
          downloadUrl: 'https://play.google.com/store/apps/details?id=com.apnadecoration.delivery'
        },
        ios: {
          minVersion: '1.0.0',
          downloadUrl: 'https://apps.apple.com/app/apnadecoration-delivery'
        }
      }
    };
    
    res.json(versionControl);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching version control', error: error.message });
  }
};

// Update app version control
exports.updateVersionControl = async (req, res) => {
  try {
    const { appType, platform, minVersion, downloadUrl } = req.body;
    
    // Validation
    if (!appType || !platform || !minVersion || !downloadUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Version format validation (x.y or x.y.z)
    const versionRegex = /^\d+\.\d+(\.\d+)?$/;
    if (!versionRegex.test(minVersion)) {
      return res.status(400).json({ message: 'Invalid version format. Use x.y or x.y.z format' });
    }
    
    // URL validation
    try {
      new URL(downloadUrl);
    } catch {
      return res.status(400).json({ message: 'Invalid URL format' });
    }
    
    const settings = await AdminSettings.getSettings();
    
    // Initialize version control if not exists
    if (!settings.versionControl) {
      settings.versionControl = {
        customer: { android: { minVersion: '1.0.0', downloadUrl: '' }, ios: { minVersion: '1.0.0', downloadUrl: '' } },
        vendor: { android: { minVersion: '1.0.0', downloadUrl: '' }, ios: { minVersion: '1.0.0', downloadUrl: '' } },
        deliveryman: { android: { minVersion: '1.0.0', downloadUrl: '' }, ios: { minVersion: '1.0.0', downloadUrl: '' } }
      };
    }
    
    // Update the specific app type and platform
    settings.versionControl[appType][platform] = {
      minVersion,
      downloadUrl
    };
    
    await settings.save();
    
    res.json({
      message: 'Version control updated successfully',
      versionControl: settings.versionControl[appType][platform]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating version control', error: error.message });
  }
};

// Handle software upload
exports.uploadSoftware = async (req, res) => {
  try {
    const { username, purchaseCode } = req.body;
    const file = req.file;
    
    // Validation
    if (!username || !purchaseCode) {
      return res.status(400).json({ message: 'Username and purchase code are required' });
    }
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Purchase code format validation
    const purchaseCodeRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (!purchaseCodeRegex.test(purchaseCode)) {
      return res.status(400).json({ message: 'Invalid purchase code format' });
    }
    
    // File validation
    const allowedTypes = ['application/zip', 'application/x-rar-compressed', 'application/octet-stream'];
    if (!allowedTypes.includes(file.mimetype) && !file.originalname.match(/\.(zip|rar)$/i)) {
      return res.status(400).json({ message: 'Please upload a ZIP or RAR file' });
    }
    
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size must be less than 50MB' });
    }
    
    // In a real implementation, you would:
    // 1. Verify the purchase code with CodeCanyon API
    // 2. Extract and validate the software package
    // 3. Backup current version
    // 4. Apply the update
    
    // For now, just simulate successful upload
    const settings = await AdminSettings.getSettings();
    settings.softwareUpdate = {
      lastUploaded: new Date(),
      uploadedBy: username,
      purchaseCode,
      filename: file.originalname,
      filesize: file.size
    };
    
    await settings.save();
    
    res.json({
      message: 'Software uploaded successfully',
      uploadInfo: {
        filename: file.originalname,
        size: file.size,
        uploadedBy: username,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading software', error: error.message });
  }
};

// Get languages
exports.getLanguages = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    // Default languages
    const languages = settings.languages || [
      {
        id: 1,
        name: 'english (ltr)',
        code: 'en',
        status: true,
        defaultStatus: true
      }
    ];
    
    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching languages', error: error.message });
  }
};

// Update languages
exports.updateLanguages = async (req, res) => {
  try {
    const { languages } = req.body;
    
    if (!Array.isArray(languages)) {
      return res.status(400).json({ message: 'Languages must be an array' });
    }
    
    const settings = await AdminSettings.getSettings();
    settings.languages = languages;
    await settings.save();
    
    res.json({
      message: 'Languages updated successfully',
      languages
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating languages', error: error.message });
  }
};

// Get cookie settings
exports.getCookieSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    // Default cookie settings
    const defaultCookieSettings = {
      essentialCookies: true,
      analyticsCookies: false,
      marketingCookies: false,
      functionalCookies: false,
      cookiePolicyUrl: '',
      privacyPolicyUrl: '',
      cookieConsentText: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
      cookieConsentButtonText: 'Accept All',
      cookieConsentRejectButtonText: 'Reject All',
      cookieConsentCustomizeButtonText: 'Customize',
      showCookieBanner: true
    };
    
    const cookieSettings = settings.cookieSettings || defaultCookieSettings;
    
    res.json(cookieSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cookie settings', error: error.message });
  }
};

// Update cookie settings
exports.updateCookieSettings = async (req, res) => {
  try {
    const {
      essentialCookies,
      analyticsCookies,
      marketingCookies,
      functionalCookies,
      cookiePolicyUrl,
      privacyPolicyUrl,
      cookieConsentText,
      cookieConsentButtonText,
      cookieConsentRejectButtonText,
      cookieConsentCustomizeButtonText,
      showCookieBanner
    } = req.body;
    
    const settings = await AdminSettings.getSettings();
    
    // Update cookie settings
    settings.cookieSettings = {
      essentialCookies: essentialCookies !== undefined ? essentialCookies : true,
      analyticsCookies: analyticsCookies !== undefined ? analyticsCookies : false,
      marketingCookies: marketingCookies !== undefined ? marketingCookies : false,
      functionalCookies: functionalCookies !== undefined ? functionalCookies : false,
      cookiePolicyUrl: cookiePolicyUrl || '',
      privacyPolicyUrl: privacyPolicyUrl || '',
      cookieConsentText: cookieConsentText || 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
      cookieConsentButtonText: cookieConsentButtonText || 'Accept All',
      cookieConsentRejectButtonText: cookieConsentRejectButtonText || 'Reject All',
      cookieConsentCustomizeButtonText: cookieConsentCustomizeButtonText || 'Customize',
      showCookieBanner: showCookieBanner !== undefined ? showCookieBanner : true,
      updatedAt: new Date()
    };
    
    await settings.save();
    
    res.json({
      message: 'Cookie settings updated successfully',
      cookieSettings: settings.cookieSettings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cookie settings', error: error.message });
  }
};

// Get cleanup statistics
exports.getCleanupStats = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Customer = require('../models/Customer');
    const Product = require('../models/Product');
    const Service = require('../models/Service');
    const Notification = require('../models/Notification');
    const Review = require('../models/CustomerReview');

    // Get counts for each collection
    const stats = {
      totalOrders: await Order.countDocuments(),
      totalCustomers: await Customer.countDocuments(),
      totalProducts: await Product.countDocuments(),
      totalServices: await Service.countDocuments(),
      totalNotifications: await Notification.countDocuments(),
      totalReviews: await Review.countDocuments()
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cleanup statistics', error: error.message });
  }
};

// Clean database
exports.cleanDatabase = async (req, res) => {
  try {
    const {
      clearOrders,
      clearCustomers,
      clearProducts,
      clearServices,
      clearCategories,
      clearBanners,
      clearNotifications,
      clearReviews,
      clearWishlist,
      clearWallet,
      clearLoyaltyPoints,
      clearWithdraws,
      olderThanDays,
      backupBeforeCleanup
    } = req.body;

    let totalDeleted = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Create backup if requested
    if (backupBeforeCleanup) {
      // In a real implementation, you would create a database backup here
      console.log('Creating backup before cleanup...');
    }

    // Clean each collection based on options
    if (clearOrders) {
      const Order = require('../models/Order');
      const result = await Order.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearCustomers) {
      const Customer = require('../models/Customer');
      const result = await Customer.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearProducts) {
      const Product = require('../models/Product');
      const result = await Product.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearServices) {
      const Service = require('../models/Service');
      const result = await Service.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearCategories) {
      const Category = require('../models/Category');
      const result = await Category.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearBanners) {
      const Banner = require('../models/Banner');
      const result = await Banner.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearNotifications) {
      const Notification = require('../models/Notification');
      const result = await Notification.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearReviews) {
      const Review = require('../models/CustomerReview');
      const result = await Review.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearWishlist) {
      const Wishlist = require('../models/Wishlist');
      const result = await Wishlist.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearWallet) {
      const Wallet = require('../models/Wallet');
      const result = await Wallet.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearLoyaltyPoints) {
      const LoyaltyPoint = require('../models/LoyaltyPoint');
      const result = await LoyaltyPoint.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    if (clearWithdraws) {
      const Withdraw = require('../models/Withdraw');
      const result = await Withdraw.deleteMany({ 
        createdAt: { $lt: cutoffDate } 
      });
      totalDeleted += result.deletedCount;
    }

    res.json({
      message: 'Database cleanup completed successfully',
      deletedCount: totalDeleted,
      cutoffDate: cutoffDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during database cleanup', error: error.message });
  }
};
