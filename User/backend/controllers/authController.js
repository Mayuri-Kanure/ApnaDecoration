const { AuthService } = require('../services');
const { User } = require('../models');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password, phone, role } = req.body;

      // Validate input
      const validation = AuthService.validateUserData({ name, email, password, phone });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Register user
      const result = await AuthService.register({ name, email, password, phone, role });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { name, firstName, lastName, phone, profileImage, dateOfBirth, gender } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update fields
      if (name) user.name = name;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (dateOfBirth) user.dateOfBirth = dateOfBirth;
      if (gender) user.gender = gender;
      if (profileImage) {
        // Handle base64 image data
        if (profileImage.startsWith('data:image/')) {
          // Extract base64 data (handle comma after image type)
          const base64Data = profileImage.replace(/^data:image\/[a-z]+;base64,?/, '');
          user.profileImage = `data:image/jpeg;base64,${base64Data}`;
        } else {
          user.profileImage = profileImage;
        }
      }

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await AuthService.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Validate new password
      const validation = AuthService.validateUserData({ 
        name: user.name, 
        email: user.email, 
        password: newPassword, 
        phone: user.phone 
      });
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'New password validation failed',
          errors: validation.errors
        });
      }

      // Update password
      user.password = await AuthService.hashPassword(newPassword);
      user.lastPasswordChange = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Toggle 2FA
  toggle2FA: async (req, res) => {
    try {
      const { enabled } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.twoFactorEnabled = enabled;
      await user.save();

      res.json({
        success: true,
        message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: {
          twoFactorEnabled: user.twoFactorEnabled
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Upload profile image
  uploadProfileImage: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // Get Cloudinary URL from uploaded file
      const profileImageUrl = req.file.path || req.file.filename;
      
      // Use findOneAndUpdate to only update profileImage field without validation
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { profileImage: profileImageUrl } },
        { new: true, runValidators: false }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          profileImage: profileImageUrl
        }
      });
    } catch (error) {
      console.error('Profile image upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = authController;