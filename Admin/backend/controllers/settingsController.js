const DeliveryBoy = require('../models/DeliveryBoy');

// @desc    Get delivery boy settings
// @route   GET /api/delivery-boy/settings
// @access   Private
exports.getSettings = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;
    
    // Get delivery boy data
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }
    
    // Return settings (in real app, this would come from a settings collection)
    const settings = {
      // App settings
      darkMode: false,
      language: 'en',
      autoAcceptOrders: false,
      soundEnabled: true,
      
      // Account settings
      notifications: {
        email: true,
        sms: true,
        push: true
      },
      
      // Delivery settings
      maxOrdersPerDay: 10,
      preferredAreas: ['Delhi', 'Gurgaon', 'Noida'],
      autoRejectHighValueOrders: false
    };
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update delivery boy settings
// @route   PUT /api/delivery-boy/settings
// @access   Private
exports.updateSettings = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;
    const settings = req.body;
    
    // Get delivery boy data
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }
    
    // Update settings (in real app, this would be saved to a settings collection)
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
