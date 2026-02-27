const AdminSettings = require('../models/AdminSettings');

// Get all admin settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Update admin settings
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    const settings = await AdminSettings.getSettings();
    
    // Update settings
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        settings[key] = updates[key];
      }
    });
    
    await settings.save();
    
    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

// Get payment options
exports.getPaymentOptions = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    const paymentOptions = {
      cashOnDelivery: settings.cashOnDelivery !== undefined ? settings.cashOnDelivery : false,
      digitalPayment: settings.digitalPayment !== undefined ? settings.digitalPayment : false,
      walletPayment: settings.walletPayment !== undefined ? settings.walletPayment : false,
      offlinePayment: settings.offlinePayment !== undefined ? settings.offlinePayment : false
    };
    res.json(paymentOptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment options', error: error.message });
  }
};

// Update payment options
exports.updatePaymentOptions = async (req, res) => {
  try {
    const paymentOptions = req.body;
    
    const settings = await AdminSettings.getSettings();
    
    // Update payment options - use both individual fields and paymentMethods object
    settings.cashOnDelivery = paymentOptions.cashOnDelivery;
    settings.digitalPayment = paymentOptions.digitalPayment;
    settings.walletPayment = paymentOptions.walletPayment;
    settings.offlinePayment = paymentOptions.offlinePayment;
    
    // Also update paymentMethods object for consistency
    if (!settings.paymentMethods) {
      settings.paymentMethods = {};
    }
    settings.paymentMethods.cashOnDelivery = paymentOptions.cashOnDelivery;
    
    await settings.save();
    
    res.json({
      message: 'Payment options updated successfully',
      settings: {
        cashOnDelivery: settings.cashOnDelivery,
        digitalPayment: settings.digitalPayment,
        walletPayment: settings.walletPayment,
        offlinePayment: settings.offlinePayment
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment options', error: error.message });
  }
};

// Get order settings
exports.getOrderSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    const orderSettings = {
      orderDeliveryVerification: settings.orderDeliveryVerification || false,
      minimumOrderAmountEnabled: settings.minimumOrderAmountEnabled || false,
      showBillingAddress: settings.showBillingAddress || false,
      freeDelivery: settings.freeDelivery || false,
      freeDeliveryResponsibility: settings.freeDeliveryResponsibility || 'Admin',
      freeDeliveryOver: settings.freeDeliveryOver || '',
      refundValidityDays: settings.refundValidityDays || '',
      guestCheckout: settings.guestCheckout || false
    };
    res.json(orderSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order settings', error: error.message });
  }
};

// Update order settings
exports.updateOrderSettings = async (req, res) => {
  try {
    const orderSettings = req.body;
    
    const settings = await AdminSettings.getSettings();
    
    // Update order settings
    settings.orderDeliveryVerification = orderSettings.orderDeliveryVerification;
    settings.minimumOrderAmountEnabled = orderSettings.minimumOrderAmountEnabled;
    settings.showBillingAddress = orderSettings.showBillingAddress;
    settings.freeDelivery = orderSettings.freeDelivery;
    settings.freeDeliveryResponsibility = orderSettings.freeDeliveryResponsibility;
    settings.freeDeliveryOver = orderSettings.freeDeliveryOver;
    settings.refundValidityDays = orderSettings.refundValidityDays;
    settings.guestCheckout = orderSettings.guestCheckout;
    
    await settings.save();
    
    res.json({
      message: 'Order settings updated successfully',
      settings: {
        orderDeliveryVerification: settings.orderDeliveryVerification,
        minimumOrderAmountEnabled: settings.minimumOrderAmountEnabled,
        showBillingAddress: settings.showBillingAddress,
        freeDelivery: settings.freeDelivery,
        freeDeliveryResponsibility: settings.freeDeliveryResponsibility,
        freeDeliveryOver: settings.freeDeliveryOver,
        refundValidityDays: settings.refundValidityDays,
        guestCheckout: settings.guestCheckout
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order settings', error: error.message });
  }
};

// Update Firebase configuration
exports.updateFirebaseConfig = async (req, res) => {
  try {
    const { firebaseConfig } = req.body;
    
    // Validate required fields
    if (!firebaseConfig.serviceAccountContent || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
      return res.status(400).json({ 
        message: 'Required fields: Service Account Content, API Key, and Project ID' 
      });
    }
    
    // Validate JSON format
    try {
      JSON.parse(firebaseConfig.serviceAccountContent);
    } catch (error) {
      return res.status(400).json({ 
        message: 'Invalid JSON format in Service Account Content' 
      });
    }
    
    const settings = await AdminSettings.getSettings();
    settings.firebaseConfig = firebaseConfig;
    await settings.save();
    
    res.json({
      message: 'Firebase configuration updated successfully',
      firebaseConfig: settings.firebaseConfig
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating Firebase configuration', error: error.message });
  }
};

// Update push notification messages
exports.updatePushNotificationMessages = async (req, res) => {
  try {
    const { role, messages } = req.body;
    
    const settings = await AdminSettings.getSettings();
    
    // Update messages for the specified role
    if (settings.pushNotificationMessages[role]) {
      Object.keys(messages).forEach(key => {
        if (settings.pushNotificationMessages[role][key]) {
          settings.pushNotificationMessages[role][key] = messages[key];
        }
      });
    }
    
    await settings.save();
    
    res.json({
      message: 'Push notification messages updated successfully',
      messages: settings.pushNotificationMessages[role]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating push notification messages', error: error.message });
  }
};

// Get Firebase configuration
exports.getFirebaseConfig = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    res.json(settings.firebaseConfig || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Firebase configuration', error: error.message });
  }
};

// Get push notification messages
exports.getPushNotificationMessages = async (req, res) => {
  try {
    const { role } = req.query;
    const settings = await AdminSettings.getSettings();
    
    if (role && settings.pushNotificationMessages[role]) {
      res.json(settings.pushNotificationMessages[role]);
    } else {
      res.json(settings.pushNotificationMessages || {});
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching push notification messages', error: error.message });
  }
};
