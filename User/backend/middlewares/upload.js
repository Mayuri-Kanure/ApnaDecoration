const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinaryService = require("../services/cloudinaryService");

// Use Cloudinary service for uploads
const upload = cloudinaryService.getUploader("orders", 5);

// Export Cloudinary upload directly
module.exports = upload;
