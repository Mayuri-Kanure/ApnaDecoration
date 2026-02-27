const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

exports.createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT API CALLED ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    // Check for multer errors
    if (req.fileValidationError) {
      console.log('File validation error:', req.fileValidationError);
      return res.status(400).json({ message: req.fileValidationError });
    }
    
    let productData = req.body;
    
    // Parse productData if it's a string (from FormData)
    if (typeof productData.productData === 'string') {
      console.log('Parsing productData from string');
      productData = JSON.parse(productData.productData);
    } else if (typeof productData === 'string') {
      console.log('Parsing productData as direct string');
      productData = JSON.parse(productData);
    }
    
    console.log('Final productData:', productData);
    
    // Generate unique SKU if not provided
    if (!productData.sku || productData.sku === '') {
      productData.sku = 'SKU-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      console.log('Generated new SKU:', productData.sku);
    }
    
    // Handle image uploads
    let thumbnail = '';
    let additional_images = [];
    let meta_image = '';
    let color_wise_images = {};
    
    try {
      // Process thumbnail
      if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
        thumbnail = '/uploads/products/' + req.files.thumbnail[0].filename;
        console.log('Thumbnail uploaded:', thumbnail);
      }
      
      // Process additional images
      if (req.files && req.files.additional_images && req.files.additional_images.length > 0) {
        additional_images = req.files.additional_images.map(file => 
          '/uploads/products/' + file.filename
        );
        console.log('Additional images uploaded:', additional_images.length);
      }
      
      // Process meta image
      if (req.files && req.files.meta_image && req.files.meta_image.length > 0) {
        meta_image = '/uploads/products/' + req.files.meta_image[0].filename;
        console.log('Meta image uploaded:', meta_image);
      }
      
      // Process color-wise images
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          if (fieldName.startsWith('color_image_')) {
            const color = fieldName.replace('color_image_', '');
            if (req.files[fieldName] && req.files[fieldName].length > 0) {
              color_wise_images[color] = '/uploads/products/' + req.files[fieldName][0].filename;
              console.log('Color image uploaded for color:', color);
            }
          }
        });
      }
    } catch (fileError) {
      console.error('Error processing files:', fileError);
      // Continue without files if there's an error
    }
    
    // Try to create product, handle duplicate SKU errors
    let newProduct;
    try {
      newProduct = await Product.create({
        ...productData,
        thumbnail,
        additional_images,
        meta_image,
        color_wise_images,
        status: 'active'
      });
    } catch (createError) {
      if (createError.message.includes('E11000 duplicate key error') && createError.message.includes('sku')) {
        console.log('Duplicate SKU error, generating unique SKU');
        productData.sku = productData.sku + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        console.log('Generated unique SKU:', productData.sku);
        
        newProduct = await Product.create({
          ...productData,
          thumbnail,
          additional_images,
          meta_image,
          color_wise_images,
          status: 'active'
        });
      } else {
        throw createError;
      }
    }

    console.log('Product created successfully:', newProduct._id);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
