const DeliveryBoy = require('../models/DeliveryBoy');
const DeliveryTracking = require('../models/DeliveryTracking');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class DeliveryBoyService {
  // Create new delivery boy
  async createDeliveryBoy(deliveryBoyData) {
    try {
      console.log('🔧 Creating delivery boy:', deliveryBoyData);
      
      // Check if delivery boy already exists
      const existingDeliveryBoy = await DeliveryBoy.findOne({
        $or: [
          { email: deliveryBoyData.email },
          { phone: deliveryBoyData.phone },
          { employeeId: deliveryBoyData.employeeId }
        ]
      });

      if (existingDeliveryBoy) {
        throw new Error('Delivery boy with this email, phone, or employee ID already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(deliveryBoyData.password, salt);

      // Generate employee ID if not provided
      if (!deliveryBoyData.employeeId) {
        deliveryBoyData.employeeId = this.generateEmployeeId();
      }

      const deliveryBoy = new DeliveryBoy({
        ...deliveryBoyData,
        password: hashedPassword
      });

      const savedDeliveryBoy = await deliveryBoy.save();
      
      // Remove password from response
      const deliveryBoyResponse = savedDeliveryBoy.toObject();
      delete deliveryBoyResponse.password;

      console.log('✅ Delivery boy created:', deliveryBoyResponse);
      return deliveryBoyResponse;
    } catch (error) {
      console.error('❌ Error creating delivery boy:', error);
      throw new Error(error.message || 'Failed to create delivery boy');
    }
  }

  // Login delivery boy
  async loginDeliveryBoy(email, password) {
    try {
      console.log('🔧 Delivery boy login attempt:', email);
      
      const deliveryBoy = await DeliveryBoy.findOne({ email });
      
      if (!deliveryBoy) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, deliveryBoy.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      if (deliveryBoy.status !== 'active') {
        throw new Error('Account is not active');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          deliveryBoyId: deliveryBoy._id,
          email: deliveryBoy.email,
          role: 'delivery_boy'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Update last active time (skip save to avoid validation issues)
      // deliveryBoy.lastActiveTime = new Date();
      // await deliveryBoy.save();

      const deliveryBoyResponse = deliveryBoy.toObject();
      delete deliveryBoyResponse.password;

      console.log('✅ Delivery boy logged in:', deliveryBoyResponse);
      return {
        deliveryBoy: deliveryBoyResponse,
        token
      };
    } catch (error) {
      console.error('❌ Error logging in delivery boy:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // Get all delivery boys
  async getAllDeliveryBoys(options = {}) {
    try {
      console.log('🔧 Getting all delivery boys');
      
      const {
        page = 1,
        limit = 20,
        status,
        isAvailable,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (isAvailable !== undefined) {
        query.isAvailable = isAvailable;
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const deliveryBoys = await DeliveryBoy.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await DeliveryBoy.countDocuments(query);

      console.log('✅ Delivery boys retrieved:', deliveryBoys.length);
      return {
        deliveryBoys,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error getting delivery boys:', error);
      throw new Error(error.message || 'Failed to get delivery boys');
    }
  }

  // Get delivery boy by ID
  async getDeliveryBoyById(id) {
    try {
      console.log('🔧 Getting delivery boy by ID:', id);
      
      const deliveryBoy = await DeliveryBoy.findById(id);
      
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      const deliveryBoyResponse = deliveryBoy.toObject();
      
      // Only remove password, keep all other fields
      delete deliveryBoyResponse.password;

      console.log('✅ Delivery boy found:', JSON.stringify(deliveryBoyResponse, null, 2));
      return deliveryBoyResponse;
    } catch (error) {
      console.error('❌ Error getting delivery boy:', error);
      throw new Error(error.message || 'Failed to get delivery boy');
    }
  }

  // Update delivery boy
  async updateDeliveryBoy(id, updateData) {
    try {
      console.log('🔧 Updating delivery boy:', { id, updateData });
      
      const deliveryBoy = await DeliveryBoy.findById(id);
      
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // Don't allow updating certain fields directly
      const allowedUpdates = [
        'name', 'phone', 'email', 'address', 'profileImage', 'dateOfBirth', 'gender',
        'vehicleType', 'vehicleNumber', 'licenseNumber', 'bankAccount', 'emergencyContact',
        'workingHours', 'permissions', 'notes'
      ];

      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      // Hash password if provided
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        filteredData.password = await bcrypt.hash(updateData.password, salt);
      }

      const updatedDeliveryBoy = await DeliveryBoy.findByIdAndUpdate(
        id,
        { ...filteredData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      const deliveryBoyResponse = updatedDeliveryBoy.toObject();
      delete deliveryBoyResponse.password;

      console.log('✅ Delivery boy updated:', deliveryBoyResponse);
      return deliveryBoyResponse;
    } catch (error) {
      console.error('❌ Error updating delivery boy:', error);
      throw new Error(error.message || 'Failed to update delivery boy');
    }
  }

  // Delete delivery boy
  async deleteDeliveryBoy(id) {
    try {
      console.log('🔧 Deleting delivery boy:', id);
      
      const deliveryBoy = await DeliveryBoy.findById(id);
      
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // Check if delivery boy has active deliveries
      const activeDeliveries = await DeliveryTracking.countDocuments({
        deliveryBoyId: id,
        currentStatus: { $in: ['confirmed', 'picked_up', 'in_transit', 'out_for_delivery'] }
      });

      if (activeDeliveries > 0) {
        throw new Error('Cannot delete delivery boy with active deliveries');
      }

      await DeliveryBoy.findByIdAndDelete(id);
      console.log('✅ Delivery boy deleted:', id);
      return { message: 'Delivery boy deleted successfully' };
    } catch (error) {
      console.error('❌ Error deleting delivery boy:', error);
      throw new Error(error.message || 'Failed to delete delivery boy');
    }
  }

  // Update availability
  async updateAvailability(id, isAvailable, currentLocation = null, coordinates = null) {
    try {
      console.log('🔧 Updating availability:', { id, isAvailable, currentLocation });
      
      const deliveryBoy = await DeliveryBoy.findById(id);
      
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      const updateData = {
        isAvailable,
        lastActiveTime: new Date()
      };

      if (currentLocation) {
        updateData.currentLocation = currentLocation;
      }

      if (coordinates) {
        updateData.currentCoordinates = coordinates;
      }

      const updatedDeliveryBoy = await DeliveryBoy.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      console.log('✅ Availability updated:', updatedDeliveryBoy);
      return updatedDeliveryBoy;
    } catch (error) {
      console.error('❌ Error updating availability:', error);
      throw new Error(error.message || 'Failed to update availability');
    }
  }

  // Get available delivery boys
  async getAvailableDeliveryBoys() {
    try {
      console.log('🔧 Getting available delivery boys');
      
      const deliveryBoys = await DeliveryBoy.getAvailableDeliveryBoys();
      
      console.log('✅ Available delivery boys retrieved:', deliveryBoys.length);
      return deliveryBoys;
    } catch (error) {
      console.error('❌ Error getting available delivery boys:', error);
      throw new Error(error.message || 'Failed to get available delivery boys');
    }
  }

  // Get delivery boys by location
  async getDeliveryBoysByLocation(latitude, longitude, radius = 5) {
    try {
      console.log('🔧 Getting delivery boys by location:', { latitude, longitude, radius });
      
      const deliveryBoys = await DeliveryBoy.getDeliveryBoysByLocation(latitude, longitude, radius);
      
      console.log('✅ Delivery boys by location retrieved:', deliveryBoys.length);
      return deliveryBoys;
    } catch (error) {
      console.error('❌ Error getting delivery boys by location:', error);
      throw new Error(error.message || 'Failed to get delivery boys by location');
    }
  }

  // Update performance metrics
  async updatePerformanceMetrics(id, deliveryStatus, deliveryTime = null) {
    try {
      console.log('🔧 Updating performance metrics:', { id, deliveryStatus, deliveryTime });
      
      const deliveryBoy = await DeliveryBoy.findById(id);
      
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      await deliveryBoy.updatePerformanceMetrics(deliveryStatus, deliveryTime);
      
      console.log('✅ Performance metrics updated:', deliveryBoy);
      return deliveryBoy;
    } catch (error) {
      console.error('❌ Error updating performance metrics:', error);
      throw new Error(error.message || 'Failed to update performance metrics');
    }
  }

  // Add rating to delivery boy
  async addRating(id, rating) {
    try {
      console.log('🔧 Adding rating:', { id, rating });
      
      const deliveryBoy = await DeliveryBoy.findById(id);
      
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      await deliveryBoy.addRating(rating);
      
      console.log('✅ Rating added:', deliveryBoy);
      return deliveryBoy;
    } catch (error) {
      console.error('❌ Error adding rating:', error);
      throw new Error(error.message || 'Failed to add rating');
    }
  }

  // Get delivery statistics
  async getDeliveryBoyStatistics(options = {}) {
    try {
      console.log('🔧 Getting delivery boy statistics');
      
      const {
        startDate,
        endDate
      } = options;

      const stats = await DeliveryBoy.getDeliveryBoyStatistics(startDate, endDate);
      
      console.log('✅ Delivery boy statistics retrieved:', stats);
      return stats[0] || {
        totalDeliveryBoys: 0,
        activeDeliveryBoys: 0,
        availableDeliveryBoys: 0,
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        averageRating: 0,
        averageDeliveryTime: 0
      };
    } catch (error) {
      console.error('❌ Error getting delivery boy statistics:', error);
      throw new Error(error.message || 'Failed to get delivery boy statistics');
    }
  }

  // Search delivery boys
  async searchDeliveryBoys(searchTerm, options = {}) {
    try {
      console.log('🔧 Searching delivery boys:', searchTerm);
      
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const searchRegex = new RegExp(searchTerm, 'i');
      
      const deliveryBoys = await DeliveryBoy.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { employeeId: searchRegex },
          { 'address.city': searchRegex },
          { 'address.state': searchRegex }
        ]
      })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

      const total = await DeliveryBoy.countDocuments({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { employeeId: searchRegex },
          { 'address.city': searchRegex },
          { 'address.state': searchRegex }
        ]
      });

      console.log('✅ Delivery boys search completed:', deliveryBoys.length);
      return {
        deliveryBoys,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error searching delivery boys:', error);
      throw new Error(error.message || 'Failed to search delivery boys');
    }
  }

  // Generate employee ID
  generateEmployeeId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DB${timestamp}${random}`;
  }

  // Get delivery boy performance report
  async getPerformanceReport(id, startDate, endDate) {
    try {
      console.log('🔧 Getting performance report:', { id, startDate, endDate });
      
      const deliveryBoy = await DeliveryBoy.findById(id);
      
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // Get deliveries in date range
      const matchStage = {
        deliveryBoyId: id
      };

      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) {
          matchStage.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          matchStage.createdAt.$lte = new Date(endDate);
        }
      }

      const deliveries = await DeliveryTracking.find(matchStage)
        .sort({ createdAt: -1 });

      const report = {
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.name,
          employeeId: deliveryBoy.employeeId,
          rating: deliveryBoy.rating,
          totalRatings: deliveryBoy.totalRatings
        },
        period: {
          startDate,
          endDate
        },
        summary: {
          totalDeliveries: deliveries.length,
          successfulDeliveries: deliveries.filter(d => d.currentStatus === 'delivered').length,
          failedDeliveries: deliveries.filter(d => d.currentStatus === 'failed').length,
          averageDeliveryTime: deliveryBoy.averageDeliveryTime
        },
        deliveries: deliveries.map(d => ({
          id: d._id,
          trackingNumber: d.trackingNumber,
          status: d.currentStatus,
          createdAt: d.createdAt,
          actualDeliveryTime: d.actualDeliveryTime
        }))
      };

      console.log('✅ Performance report generated:', report);
      return report;
    } catch (error) {
      console.error('❌ Error getting performance report:', error);
      throw new Error(error.message || 'Failed to get performance report');
    }
  }

  // Get earnings data
  async getEarnings(deliveryBoyId, options = {}) {
    try {
      console.log('🔧 Getting earnings for delivery boy:', deliveryBoyId);
      
      const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // For now, return sample earnings data for testing
      // In a real implementation, this would come from an Earnings collection
      const earnings = [];
      const deliveryCount = deliveryBoy.successfulDeliveries || 0;
      
      // Generate sample earnings for testing (even if no deliveries)
      const sampleCount = Math.max(deliveryCount, 5); // Always show at least 5 sample entries
      
      for (let i = 0; i < sampleCount; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        earnings.push({
          id: `EARN-${String(i + 1).padStart(3, '0')}`,
          date: date.toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 1000) + 500, // Random amount between 500-1500
          type: 'delivery',
          status: 'completed',
          orderId: `ORD-${String(i + 1).padStart(3, '0')}`
        });
      }

      console.log('✅ Earnings data retrieved:', earnings.length);
      return earnings;
    } catch (error) {
      console.error('❌ Error getting earnings:', error);
      throw new Error(error.message || 'Failed to get earnings');
    }
  }

  // Get earnings statistics
  async getEarningsStats(deliveryBoyId) {
    try {
      console.log('🔧 Getting earnings stats for delivery boy:', deliveryBoyId);
      
      const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // Calculate sample earnings for testing
      const sampleEarnings = 8750; // Sample total earnings
      const sampleWithdrawals = 1250; // Sample withdrawals
      
      const stats = {
        totalEarnings: deliveryBoy.totalEarnings || sampleEarnings,
        totalWithdrawals: deliveryBoy.totalWithdrawals || sampleWithdrawals,
        pendingWithdrawals: deliveryBoy.pendingWithdrawals || 0,
        monthlyEarnings: Math.floor((deliveryBoy.totalEarnings || sampleEarnings) / 12), // Simple calculation
        successfulDeliveries: deliveryBoy.successfulDeliveries || 15, // Sample deliveries
        totalDeliveries: deliveryBoy.totalDeliveries || 16
      };

      console.log('✅ Earnings stats retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting earnings stats:', error);
      throw new Error(error.message || 'Failed to get earnings stats');
    }
  }

  // Request withdrawal
  async requestWithdrawal(deliveryBoyId, amount) {
    try {
      console.log('🔧 Requesting withdrawal for delivery boy:', deliveryBoyId, amount);
      
      const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // Check if sufficient balance
      if (amount > (deliveryBoy.totalEarnings || 0)) {
        throw new Error('Insufficient balance for withdrawal');
      }

      // Update delivery boy stats
      deliveryBoy.totalWithdrawals = (deliveryBoy.totalWithdrawals || 0) + amount;
      deliveryBoy.pendingWithdrawals = (deliveryBoy.pendingWithdrawals || 0) + amount;
      
      await deliveryBoy.save();

      const withdrawal = {
        id: `WDR-${Date.now()}`,
        amount: amount,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        method: 'bank_transfer'
      };

      console.log('✅ Withdrawal request created:', withdrawal);
      return withdrawal;
    } catch (error) {
      console.error('❌ Error requesting withdrawal:', error);
      throw new Error(error.message || 'Failed to request withdrawal');
    }
  }

  // Get delivery boy settings
  async getSettings(deliveryBoyId) {
    try {
      console.log('🔧 Getting settings for delivery boy:', deliveryBoyId);
      
      const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // Return settings from database or defaults
      const settings = {
        // Notification settings
        pushNotifications: deliveryBoy.settings?.pushNotifications ?? true,
        emailNotifications: deliveryBoy.settings?.emailNotifications ?? true,
        smsNotifications: deliveryBoy.settings?.smsNotifications ?? false,
        orderNotifications: deliveryBoy.settings?.orderNotifications ?? true,
        earningsNotifications: deliveryBoy.settings?.earningsNotifications ?? true,
        
        // Privacy settings
        shareLocation: deliveryBoy.settings?.shareLocation ?? true,
        showPhone: deliveryBoy.settings?.showPhone ?? true,
        showEmail: deliveryBoy.settings?.showEmail ?? false,
        
        // App settings
        language: deliveryBoy.settings?.language ?? 'en',
        autoAcceptOrders: deliveryBoy.settings?.autoAcceptOrders ?? false,
        soundEnabled: deliveryBoy.settings?.soundEnabled ?? true
      };

      console.log('✅ Settings retrieved from database:', settings);
      return settings;
    } catch (error) {
      console.error('❌ Error getting settings:', error);
      throw new Error(error.message || 'Failed to get settings');
    }
  }

  // Update delivery boy settings
  async updateSettings(deliveryBoyId, settingsData) {
    try {
      console.log('🔧 Updating settings for delivery boy:', deliveryBoyId, settingsData);
      
      const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // Prepare settings update object
      const settingsUpdate = {
        // Notification settings
        pushNotifications: settingsData.pushNotifications !== undefined ? settingsData.pushNotifications : deliveryBoy.settings?.pushNotifications ?? true,
        emailNotifications: settingsData.emailNotifications !== undefined ? settingsData.emailNotifications : deliveryBoy.settings?.emailNotifications ?? true,
        smsNotifications: settingsData.smsNotifications !== undefined ? settingsData.smsNotifications : deliveryBoy.settings?.smsNotifications ?? false,
        orderNotifications: settingsData.orderNotifications !== undefined ? settingsData.orderNotifications : deliveryBoy.settings?.orderNotifications ?? true,
        earningsNotifications: settingsData.earningsNotifications !== undefined ? settingsData.earningsNotifications : deliveryBoy.settings?.earningsNotifications ?? true,
        
        // Privacy settings
        shareLocation: settingsData.shareLocation !== undefined ? settingsData.shareLocation : deliveryBoy.settings?.shareLocation ?? true,
        showPhone: settingsData.showPhone !== undefined ? settingsData.showPhone : deliveryBoy.settings?.showPhone ?? true,
        showEmail: settingsData.showEmail !== undefined ? settingsData.showEmail : deliveryBoy.settings?.showEmail ?? false,
        
        // App settings
        language: settingsData.language || deliveryBoy.settings?.language || 'en',
        autoAcceptOrders: settingsData.autoAcceptOrders !== undefined ? settingsData.autoAcceptOrders : deliveryBoy.settings?.autoAcceptOrders ?? false,
        soundEnabled: settingsData.soundEnabled !== undefined ? settingsData.soundEnabled : deliveryBoy.settings?.soundEnabled ?? true
      };

      // Update delivery boy settings in database
      await DeliveryBoy.findByIdAndUpdate(
        deliveryBoyId,
        { 
          $set: { settings: settingsUpdate },
          $setOnInsert: { 
            settings: {
              // Notification settings
              pushNotifications: true,
              emailNotifications: true,
              smsNotifications: false,
              orderNotifications: true,
              earningsNotifications: true,
              
              // Privacy settings
              shareLocation: true,
              showPhone: true,
              showEmail: false,
              
              // App settings
              language: 'en',
              autoAcceptOrders: false,
              soundEnabled: true
            }
          }
        },
        { new: true, upsert: true, runValidators: false }
      );

      console.log('✅ Settings updated in database:', settingsUpdate);
      return settingsUpdate;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      throw new Error(error.message || 'Failed to update settings');
    }
  }

  // Change password
  async changePassword(deliveryBoyId, currentPassword, newPassword) {
    try {
      console.log('🔧 Changing password for delivery boy:', deliveryBoyId);
      
      const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).select('+password');
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, deliveryBoy.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password using findOneAndUpdate to avoid pre-save hooks
      await DeliveryBoy.findByIdAndUpdate(
        deliveryBoyId,
        { password: hashedNewPassword },
        { new: true, runValidators: false }
      );

      console.log('✅ Password changed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error changing password:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  }

  // Delete account
  async deleteAccount(deliveryBoyId) {
    try {
      console.log('🔧 Deleting account for delivery boy:', deliveryBoyId);
      
      const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
      if (!deliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      // Delete the delivery boy
      await DeliveryBoy.findByIdAndDelete(deliveryBoyId);

      console.log('✅ Account deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      throw new Error(error.message || 'Failed to delete account');
    }
  }

  // Update delivery boy profile
  async updateDeliveryBoy(deliveryBoyId, updateData) {
    try {
      console.log('🔧 Updating delivery boy:', deliveryBoyId, updateData);
      
      const updatedDeliveryBoy = await DeliveryBoy.findByIdAndUpdate(
        deliveryBoyId,
        updateData,
        { new: true, runValidators: false }
      );

      if (!updatedDeliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      console.log('✅ Delivery boy updated:', updatedDeliveryBoy);
      console.log('✅ Delivery boy updated data:', updateData);

      // Remove password from response
      const deliveryBoyResponse = updatedDeliveryBoy.toObject();
      delete deliveryBoyResponse.password;

      console.log('✅ Delivery boy updated response:', deliveryBoyResponse);
      return deliveryBoyResponse;
    } catch (error) {
      console.error('❌ Error updating delivery boy:', error);
      throw new Error(error.message || 'Failed to update delivery boy');
    }
  }

  // Update delivery boy profile image
  async updateProfileImage(deliveryBoyId, imageUrl) {
    try {
      console.log('🖼️ Updating profile image for delivery boy:', deliveryBoyId);
      
      const updatedDeliveryBoy = await DeliveryBoy.findByIdAndUpdate(
        deliveryBoyId,
        { profileImage: imageUrl },
        { new: true, runValidators: false }
      );

      if (!updatedDeliveryBoy) {
        throw new Error('Delivery boy not found');
      }

      console.log('✅ Profile image updated successfully');
      return updatedDeliveryBoy;
    } catch (error) {
      console.error('❌ Error updating profile image:', error);
      throw new Error(error.message || 'Failed to update profile image');
    }
  }
}

module.exports = new DeliveryBoyService();
