const { Address } = require('../models');

const addressController = {
  // Get all addresses for the user
  getAddresses: async (req, res) => {
    try {
      const addresses = await Address.find({ userId: req.user.userId }).sort({ isDefault: -1, createdAt: -1 });
      res.json({
        success: true,
        data: addresses
      });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch addresses'
      });
    }
  },

  // Get address by ID
  getAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const address = await Address.findOne({ _id: id, userId: req.user.userId });
      
      if (!address) {
        return res.status(404).json({
          success: false,
          error: 'Address not found'
        });
      }
      
      res.json({
        success: true,
        data: address
      });
    } catch (error) {
      console.error('Error fetching address:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch address'
      });
    }
  },

  // Create new address
  createAddress: async (req, res) => {
    try {
      const addressData = {
        ...req.body,
        userId: req.user.userId
      };
      
      // If this is marked as default, unset default from other addresses
      if (addressData.isDefault) {
        await Address.updateMany(
          { userId: req.user.userId, _id: { $ne: 'dummy' } },
          { isDefault: false }
        );
      }
      
      const address = new Address(addressData);
      await address.save();
      
      res.status(201).json({
        success: true,
        message: 'Address created successfully',
        data: address
      });
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create address'
      });
    }
  },

  // Update address
  updateAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // If this is marked as default, unset default from other addresses
      if (updateData.isDefault) {
        await Address.updateMany(
          { userId: req.user.userId, _id: { $ne: id } },
          { isDefault: false }
        );
      }
      
      const address = await Address.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!address) {
        return res.status(404).json({
          success: false,
          error: 'Address not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Address updated successfully',
        data: address
      });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update address'
      });
    }
  },

  // Delete address
  deleteAddress: async (req, res) => {
    try {
      const { id } = req.params;
      
      const address = await Address.findOneAndDelete({ _id: id, userId: req.user.userId });
      
      if (!address) {
        return res.status(404).json({
          success: false,
          error: 'Address not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete address'
      });
    }
  },

  // Set default address
  setDefaultAddress: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Unset default from all addresses
      await Address.updateMany(
        { userId: req.user.userId, _id: { $ne: id } },
        { isDefault: false }
      );
      
      // Set this address as default
      const address = await Address.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { isDefault: true },
        { new: true }
      );
      
      if (!address) {
        return res.status(404).json({
          success: false,
          error: 'Address not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Default address set successfully',
        data: address
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set default address'
      });
    }
  }
};

module.exports = addressController;
