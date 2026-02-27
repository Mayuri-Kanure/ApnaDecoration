const BusinessSettings = require('../models/BusinessSettings');

// Get business settings
exports.getBusinessSettings = async (req, res) => {
  try {
    const settings = await BusinessSettings.getSettings();
    
    res.json({
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update business settings
exports.updateBusinessSettings = async (req, res) => {
  try {
    const updateData = req.body;
    const updatedBy = req.user.id;
    
    let settings = await BusinessSettings.getSettings();
    
    await settings.updateSettings(updateData, updatedBy);
    
    res.json({
      message: 'Business settings updated successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update specific section of business settings
exports.updateBusinessSection = async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;
    const updatedBy = req.user.id;
    
    let settings = await BusinessSettings.getSettings();
    
    // Validate section exists
    if (!settings[section]) {
      return res.status(400).json({ message: 'Invalid section' });
    }
    
    // Update only the specific section
    const sectionUpdate = {};
    sectionUpdate[section] = updateData;
    
    await settings.updateSettings(sectionUpdate, updatedBy);
    
    res.json({
      message: `${section} settings updated successfully`,
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset business settings to defaults
exports.resetBusinessSettings = async (req, res) => {
  try {
    const updatedBy = req.user.id;
    
    // Delete existing settings
    await BusinessSettings.deleteMany({});
    
    // Create new default settings
    const settings = new BusinessSettings({
      businessName: 'My Business',
      businessEmail: 'contact@mybusiness.com',
      businessPhone: '+1234567890',
      updatedBy
    });
    
    await settings.save();
    
    res.json({
      message: 'Business settings reset to defaults successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export business settings
exports.exportBusinessSettings = async (req, res) => {
  try {
    const settings = await BusinessSettings.getSettings();
    
    // Create JSON export
    const exportData = {
      businessName: settings.businessName,
      businessEmail: settings.businessEmail,
      businessPhone: settings.businessPhone,
      businessAddress: settings.businessAddress,
      orderSettings: settings.orderSettings,
      paymentMethods: settings.paymentMethods,
      vendorSettings: settings.vendorSettings,
      customerSettings: settings.customerSettings,
      deliverySettings: settings.deliverySettings,
      deliveryRestrictions: settings.deliveryRestrictions,
      invoiceSettings: settings.invoiceSettings,
      systemSettings: settings.systemSettings,
      notificationSettings: settings.notificationSettings,
      seoSettings: settings.seoSettings,
      exportedAt: new Date(),
      exportedBy: req.user.id
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=business-settings.json');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Import business settings
exports.importBusinessSettings = async (req, res) => {
  try {
    const importData = req.body;
    const updatedBy = req.user.id;
    
    let settings = await BusinessSettings.getSettings();
    
    // Validate and update settings
    const validFields = [
      'businessName', 'businessEmail', 'businessPhone', 'businessAddress',
      'orderSettings', 'paymentMethods', 'vendorSettings', 'customerSettings',
      'deliverySettings', 'deliveryRestrictions', 'invoiceSettings',
      'systemSettings', 'notificationSettings', 'seoSettings'
    ];
    
    const updateData = {};
    validFields.forEach(field => {
      if (importData[field] !== undefined) {
        updateData[field] = importData[field];
      }
    });
    
    await settings.updateSettings(updateData, updatedBy);
    
    res.json({
      message: 'Business settings imported successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get business settings statistics
exports.getBusinessSettingsStats = async (req, res) => {
  try {
    const settings = await BusinessSettings.getSettings();
    
    const stats = {
      totalSections: 0,
      enabledFeatures: 0,
      paymentMethods: {
        enabled: 0,
        total: Object.keys(settings.paymentMethods || {}).length
      },
      orderFeatures: {
        enabled: 0,
        total: Object.keys(settings.orderSettings || {}).length
      },
      customerFeatures: {
        enabled: 0,
        total: Object.keys(settings.customerSettings || {}).length
      },
      deliveryFeatures: {
        enabled: 0,
        total: Object.keys(settings.deliverySettings || {}).length
      }
    };
    
    // Count enabled features
    const sections = [
      'paymentMethods', 'orderSettings', 'customerSettings', 
      'deliverySettings', 'notificationSettings'
    ];
    
    sections.forEach(section => {
      if (settings[section]) {
        Object.values(settings[section]).forEach(value => {
          if (typeof value === 'boolean' && value) {
            stats.enabledFeatures++;
          }
        });
        stats.totalSections++;
      }
    });
    
    // Count specific section features
    if (settings.paymentMethods) {
      Object.values(settings.paymentMethods).forEach(value => {
        if (value) stats.paymentMethods.enabled++;
      });
    }
    
    if (settings.orderSettings) {
      Object.values(settings.orderSettings).forEach(value => {
        if (value) stats.orderFeatures.enabled++;
      });
    }
    
    if (settings.customerSettings) {
      Object.values(settings.customerSettings).forEach(value => {
        if (value) stats.customerFeatures.enabled++;
      });
    }
    
    if (settings.deliverySettings) {
      Object.values(settings.deliverySettings).forEach(value => {
        if (value) stats.deliveryFeatures.enabled++;
      });
    }
    
    res.json({
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
