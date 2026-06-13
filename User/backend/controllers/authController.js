const { AuthService, AUTH_ERROR_CODES } = require("../services");
const { User } = require("../models");
const OTPService = require("../services/otpService");

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password, phone, role } = req.body;

      // Validate input
      const validation = AuthService.validateUserData({
        name,
        email,
        password,
        phone,
      });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          code: AUTH_ERROR_CODES.WEAK_PASSWORD,
          message: "Validation failed",
          errors: validation.errors,
        });
      }

      // Register user
      const result = await AuthService.register({
        name,
        email,
        password,
        phone,
        role,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      const statusCode =
        error.code === AUTH_ERROR_CODES.USER_EXISTS ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        code: error.code || AUTH_ERROR_CODES.SERVER_ERROR,
        message: error.message || "Registration failed",
      });
    }
  },

  // Login user (with 2FA support)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          code: AUTH_ERROR_CODES.INVALID_EMAIL,
          message: "Email and password are required",
        });
      }

      // Verify credentials
      const result = await AuthService.login(email, password);

      // Check if user has 2FA enabled
      const user = await User.findOne({ email });
      
      if (user && user.twoFactorEnabled && user.phone) {
        // 2FA is enabled - send OTP instead of returning token
        try {
          await OTPService.generateAndSendOTP(
            user.phone,
            user.email,
            user._id,
            user.name || user.email
          );

          console.log('📱 2FA OTP sent to:', user.phone);

          return res.json({
            success: true,
            message: "2FA verification required",
            requiresOTP: true,
            data: {
              email: user.email,
              userId: user._id,
              phoneNumber: user.phone.slice(-4), // Show last 4 digits for security
              otpExpiresIn: 300, // 5 minutes in seconds
              provider: process.env.SMS_PROVIDER || 'twilio'
            }
          });
        } catch (otpError) {
          console.error('❌ Failed to send OTP:', otpError);
          // If OTP fails, continue with normal login (fallback)
          console.log('⚠️  OTP send failed, allowing login without 2FA');
          return res.json({
            success: true,
            message: "Login successful",
            requiresOTP: false,
            data: result
          });
        }
      }

      // Regular login without 2FA
      res.json({
        success: true,
        message: "Login successful",
        requiresOTP: false,
        data: result,
      });
    } catch (error) {
      const statusCode =
        error.code === AUTH_ERROR_CODES.INVALID_CREDENTIALS ? 401 : 500;
      res.status(statusCode).json({
        success: false,
        code: error.code || AUTH_ERROR_CODES.SERVER_ERROR,
        message: error.message || "Login failed",
      });
    }
  },

  // Verify OTP and complete login
  verifyOTPLogin: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      // Verify OTP
      const otpResult = await OTPService.verifyOTP(email, otp);

      // Get user details
      const user = await User.findById(otpResult.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Generate JWT token
      const token = AuthService.generateToken(user);
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Clear OTP after verification
      await OTPService.clearOTP(email);

      console.log('✅ 2FA login successful for:', email);

      res.json({
        success: true,
        message: "OTP verified successfully. Login complete!",
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "OTP verification failed",
      });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        code: AUTH_ERROR_CODES.SERVER_ERROR,
        message: error.message || "Server error occurred",
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const {
        name,
        firstName,
        lastName,
        phone,
        profileImage,
        dateOfBirth,
        gender,
      } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
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
        if (profileImage.startsWith("data:image/")) {
          // Extract base64 data (handle comma after image type)
          const base64Data = profileImage.replace(
            /^data:image\/[a-z]+;base64,?/,
            "",
          );
          user.profileImage = `data:image/jpeg;base64,${base64Data}`;
        } else {
          user.profileImage = profileImage;
        }
      }

      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
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
          message: "Current password and new password are required",
        });
      }

      // New password must be at least 6 characters (simpler than registration)
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
          errors: ["New password must be at least 6 characters"],
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await AuthService.comparePassword(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password (no strict validation, just length check)
      user.password = await AuthService.hashPassword(newPassword);
      user.lastPasswordChange = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        code: AUTH_ERROR_CODES.SERVER_ERROR,
        message: error.message || "Server error occurred",
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
          message: "User not found",
        });
      }

      user.twoFactorEnabled = enabled;
      await user.save();

      res.json({
        success: true,
        message: `Two-factor authentication ${enabled ? "enabled" : "disabled"} successfully`,
        data: {
          twoFactorEnabled: user.twoFactorEnabled,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        code: AUTH_ERROR_CODES.SERVER_ERROR,
        message: error.message || "Server error occurred",
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
          message: "No image file provided",
        });
      }

      // Get Cloudinary URL from uploaded file
      const profileImageUrl = req.file.path || req.file.filename;

      // Use findOneAndUpdate to only update profileImage field without validation
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { profileImage: profileImageUrl } },
        { new: true, runValidators: false },
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "Profile image uploaded successfully",
        data: {
          profileImage: profileImageUrl,
        },
      });
    } catch (error) {
      console.error("Profile image upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = authController;
