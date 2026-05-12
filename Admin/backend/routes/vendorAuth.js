const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Vendor login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(" Vendor Login Attempt:", { email, hasPassword: !!password });

    // Find vendor user
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: "vendor",
    });

    if (!user) {
      console.log(" Vendor not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(" Password mismatch for:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log(" Vendor account inactive:", email);
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact admin.",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    console.log(" Vendor login successful:", email);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(" Vendor login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// Get vendor profile
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get vendor data from Vendor collection
    const vendor = await Vendor.findOne({ createdBy: userId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    // Also get user data for basic info
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("🔍 Backend - Found vendor profile:", vendor.vendorId);

    // Combine vendor and user data for frontend
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: vendor.vendorName || user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: vendor.phone || user.phone,
        role: user.role,
        // Vendor business fields
        businessName: vendor.shopName,
        businessType: vendor.businessType,
        address: vendor.address?.street,
        city: vendor.address?.city,
        state: vendor.address?.state,
        postalCode: vendor.address?.zipCode,
        country: vendor.address?.country,
        website: vendor.website,
        description: vendor.description,
        gstNumber: vendor.gstNumber,
        panNumber: vendor.panNumber,
        establishedYear: vendor.establishedYear,
      },
    });
  } catch (error) {
    console.error("Vendor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
});

// Update vendor profile
router.put("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    console.log(" Backend - Profile update request:");
    console.log("  - User ID:", userId);
    console.log("  - Update data:", updateData);
    console.log("  - Update data keys:", Object.keys(updateData));

    // Find vendor by createdBy field (linked to user ID)
    const vendor = await Vendor.findOne({ createdBy: userId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    console.log(" Backend - Found vendor:", vendor.vendorId);

    // Map frontend fields to vendor schema fields
    const vendorUpdateData = {
      shopName: updateData.businessName || vendor.shopName,
      vendorName: updateData.name || vendor.vendorName,
      email: updateData.email || vendor.email,
      phone: updateData.phone || vendor.phone,
      businessType: updateData.businessType || vendor.businessType,
      "address.street": updateData.address || vendor.address?.street,
      "address.city": updateData.city || vendor.address?.city,
      "address.state": updateData.state || vendor.address?.state,
      "address.zipCode": updateData.postalCode || vendor.address?.zipCode,
      "address.country": updateData.country || vendor.address?.country,
      gstNumber: updateData.gstNumber || vendor.gstNumber,
      panNumber: updateData.panNumber || vendor.panNumber,
    };

    console.log(" Backend - Vendor update data:", vendorUpdateData);

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendor._id,
      { $set: vendorUpdateData },
      { new: true, runValidators: true },
    );

    console.log(" Backend - Updated vendor:");
    console.log("  - Vendor found:", !!updatedVendor);
    console.log("  - Vendor ID:", updatedVendor?.vendorId);

    res.json({
      success: true,
      vendor: updatedVendor,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Vendor profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// Change vendor password
router.put("/change-password", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Vendor password change error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
});

module.exports = router;
