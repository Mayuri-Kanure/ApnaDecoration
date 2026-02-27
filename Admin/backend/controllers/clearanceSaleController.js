const ClearanceSale = require('../models/ClearanceSale');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const VendorProduct = require('../models/VendorProduct');
const DeliveryBoy = require('../models/Delivery');

// Get all clearance sale data
exports.getClearanceSaleData = async (req, res) => {
  try {
    console.log('🔍 Getting clearance sale data...');
    
    let clearanceData = await ClearanceSale.findOne({});
    
    if (!clearanceData) {
      console.log('🔍 No clearance data found, creating default...');
      clearanceData = new ClearanceSale({
        inhouseOffer: {
          isActive: false,
          discountType: 'flat',
          discountAmount: 0,
          startDate: new Date(),
          endDate: new Date(),
          applicableProducts: [],
          description: ''
        },
        vendorOffers: [],
        prioritySettings: {
          useDefaultSorting: true,
          useCustomSorting: false,
          customSortOrder: []
        },
        createdBy: req.user.userId
      });
      
      await clearanceData.save();
    }

    // Debug: Show what's actually in the database
    console.log('🔍 Raw database data:', JSON.stringify(clearanceData.inhouseOffer.applicableProducts, null, 2));
    console.log('🔍 Database products count:', clearanceData.inhouseOffer.applicableProducts.length);

    // Populate complete product details for applicableProducts
    if (clearanceData.inhouseOffer && clearanceData.inhouseOffer.applicableProducts) {
      console.log('🔍 Populating products, count:', clearanceData.inhouseOffer.applicableProducts.length);
      const populatedProducts = await Promise.all(
        clearanceData.inhouseOffer.applicableProducts.map(async (product, index) => {
          console.log(`🔍 Processing product ${index}:`, typeof product, product);
          if (typeof product === 'string') {
            // It's an ID, fetch the complete product
            let foundProduct = await Product.findById(product).select('name price images thumbnail sku description category');
            if (!foundProduct) {
              foundProduct = await Service.findById(product).select('name price images thumbnail sku description_en category');
            }
            if (!foundProduct) {
              foundProduct = await VendorProduct.findById(product).select('name price images thumbnail sku description category');
            }
            if (foundProduct) {
              const populated = {
                ...foundProduct.toObject(),
                type: foundProduct.constructor.modelName === 'Product' ? 'product' : 
                      foundProduct.constructor.modelName === 'Service' ? 'service' : 'vendor_product',
                displayName: foundProduct.name,
                description: foundProduct.description || foundProduct.description_en || ''
              };
              console.log(`🔍 Populated product ${index}:`, populated.name, populated.thumbnail ? 'has thumbnail' : 'no thumbnail');
              return populated;
            }
            console.log(`🔍 Product ${index} not found in any collection`);
            return { _id: product, displayName: 'Unknown Product', name: 'Unknown Product', price: 0 };
          } else {
            // It's already a product object, ensure it has all fields
            console.log(`🔍 Product ${index} is already an object:`, product.name);
            return product;
          }
        })
      );
      clearanceData.inhouseOffer.applicableProducts = populatedProducts;
      console.log('🔍 Final populated products count:', populatedProducts.length);
    }

    res.json({
      success: true,
      data: clearanceData
    });
  } catch (error) {
    console.error('❌ Error getting clearance sale data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update inhouse offer
exports.updateInhouseOffer = async (req, res) => {
  try {
    const { isActive, discountType, discountAmount, startDate, endDate, applicableProducts, description } = req.body;
    
    console.log('🔍 Updating inhouse offer:', req.body);
    
    let clearanceData = await ClearanceSale.findOne({});
    
    if (!clearanceData) {
      clearanceData = new ClearanceSale({
        createdBy: req.user.userId
      });
    }

    clearanceData.inhouseOffer = {
      isActive,
      discountType,
      discountAmount,
      startDate,
      endDate,
      applicableProducts: applicableProducts || [],
      description: description || ''
    };
    
    clearanceData.lastModifiedBy = req.user.userId;
    await clearanceData.save();

    res.json({
      success: true,
      message: 'Inhouse offer updated successfully',
      data: clearanceData.inhouseOffer
    });
  } catch (error) {
    console.error('❌ Error updating inhouse offer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Add vendor offer
exports.addVendorOffer = async (req, res) => {
  try {
    const { vendorId, vendorName, discountType, discountAmount, startDate, endDate, applicableProducts, description } = req.body;
    
    console.log('🔍 Adding vendor offer:', req.body);
    
    let clearanceData = await ClearanceSale.findOne({});
    
    if (!clearanceData) {
      clearanceData = new ClearanceSale({
        createdBy: req.user.userId
      });
    }

    // Check if vendor already has an offer
    const existingOffer = clearanceData.vendorOffers.find(offer => 
      offer.vendorId.toString() === vendorId
    );

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'Vendor already has an offer'
      });
    }

    const newOffer = {
      vendorId,
      vendorName,
      discountType,
      discountAmount,
      startDate,
      endDate,
      applicableProducts: applicableProducts || [],
      status: 'pending',
      description: description || ''
    };

    clearanceData.vendorOffers.push(newOffer);
    clearanceData.lastModifiedBy = req.user.userId;
    await clearanceData.save();

    res.json({
      success: true,
      message: 'Vendor offer added successfully',
      data: newOffer
    });
  } catch (error) {
    console.error('❌ Error adding vendor offer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update vendor offer
exports.updateVendorOffer = async (req, res) => {
  try {
    const { offerId, vendorId, vendorName, discountType, discountAmount, startDate, endDate, applicableProducts, status, description } = req.body;
    
    console.log('🔍 Updating vendor offer:', req.body);
    
    let clearanceData = await ClearanceSale.findOne({});
    
    if (!clearanceData) {
      return res.status(404).json({
        success: false,
        message: 'Clearance sale data not found'
      });
    }

    const offerIndex = clearanceData.vendorOffers.findIndex(offer => 
      offer._id.toString() === offerId
    );

    if (offerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Vendor offer not found'
      });
    }

    clearanceData.vendorOffers[offerIndex] = {
      ...clearanceData.vendorOffers[offerIndex],
      vendorId,
      vendorName,
      discountType,
      discountAmount,
      startDate,
      endDate,
      applicableProducts: applicableProducts || clearanceData.vendorOffers[offerIndex].applicableProducts,
      status: status || clearanceData.vendorOffers[offerIndex].status,
      description: description || clearanceData.vendorOffers[offerIndex].description
    };

    clearanceData.lastModifiedBy = req.user.userId;
    await clearanceData.save();

    res.json({
      success: true,
      message: 'Vendor offer updated successfully',
      data: clearanceData.vendorOffers[offerIndex]
    });
  } catch (error) {
    console.error('❌ Error updating vendor offer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete vendor offer
exports.deleteVendorOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    console.log('🔍 Deleting vendor offer:', offerId);
    
    let clearanceData = await ClearanceSale.findOne({});
    
    if (!clearanceData) {
      return res.status(404).json({
        success: false,
        message: 'Clearance sale data not found'
      });
    }

    clearanceData.vendorOffers = clearanceData.vendorOffers.filter(offer => 
      offer._id.toString() !== offerId
    );

    clearanceData.lastModifiedBy = req.user.userId;
    await clearanceData.save();

    res.json({
      success: true,
      message: 'Vendor offer deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting vendor offer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update priority settings
exports.updatePrioritySettings = async (req, res) => {
  try {
    const { useDefaultSorting, useCustomSorting, customSortOrder } = req.body;
    
    console.log('🔍 Updating priority settings:', req.body);
    
    let clearanceData = await ClearanceSale.findOne({});
    
    if (!clearanceData) {
      clearanceData = new ClearanceSale({
        createdBy: req.user.userId
      });
    }

    clearanceData.prioritySettings = {
      useDefaultSorting,
      useCustomSorting,
      customSortOrder: customSortOrder || []
    };

    clearanceData.lastModifiedBy = req.user.userId;
    await clearanceData.save();

    res.json({
      success: true,
      message: 'Priority settings updated successfully',
      data: clearanceData.prioritySettings
    });
  } catch (error) {
    console.error('❌ Error updating priority settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get available vendors
exports.getAvailableVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' })
      .select('name email username')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error('❌ Error getting vendors:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get available products (all types)
exports.getAvailableProducts = async (req, res) => {
  try {
    console.log('🔍 Getting all available products...');
    
    // Fetch all product types
    const [products, services, vendorProducts] = await Promise.all([
      // Admin products
      Product.find({})
        .select('name price images thumbnail sku description category')
        .sort({ name: 1 }),
      
      // Services
      Service.find({})
        .select('name price images thumbnail sku description_en category')
        .sort({ name: 1 }),
      
      // Vendor products
      VendorProduct.find({})
        .select('name price images thumbnail sku description category')
        .sort({ name: 1 })
    ]);

    // Combine all products with type information
    const allProducts = [
      ...products.map(product => ({
        ...product.toObject(),
        _id: product._id,
        type: 'product',
        displayName: product.name,
        price: product.price || 0,
        thumbnail: product.thumbnail || product.images?.[0] || null,
        sku: product.sku || '',
        description: product.description || ''
      })),
      
      ...services.map(service => ({
        ...service.toObject(),
        _id: service._id,
        type: 'service',
        displayName: service.name,
        price: service.price || service.unit_price || 0,
        thumbnail: service.thumbnail || service.images?.[0] || null,
        sku: service.sku || '',
        description: service.description_en || service.description || ''
      })),
      
      ...vendorProducts.map(vendorProduct => ({
        ...vendorProduct.toObject(),
        _id: vendorProduct._id,
        type: 'vendor_product',
        displayName: vendorProduct.name,
        price: vendorProduct.price || vendorProduct.unit_price || 0,
        thumbnail: vendorProduct.thumbnail || vendorProduct.images?.[0] || null,
        sku: vendorProduct.sku || '',
        description: vendorProduct.description || ''
      }))
    ];

    console.log(`🔍 Found ${allProducts.length} total products:`, {
      products: products.length,
      services: services.length,
      vendorProducts: vendorProducts.length
    });

    res.json({
      success: true,
      data: allProducts
    });
  } catch (error) {
    console.error('❌ Error getting all products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get public clearance sale data (for users)
exports.getPublicClearanceSale = async (req, res) => {
  try {
    console.log('🔍 Getting public clearance sale data...');
    
    let clearanceData = await ClearanceSale.findOne({});

    if (!clearanceData) {
      return res.json({
        success: true,
        data: {
          inhouseOffer: null,
          vendorOffers: [],
          prioritySettings: null
        }
      });
    }

    // Populate product details for inhouse offer
    if (clearanceData.inhouseOffer?.isActive && clearanceData.inhouseOffer.applicableProducts?.length > 0) {
      console.log('🔍 Starting product population for inhouse offer...');
      const Product = require('../models/Product');
      const Service = require('../models/Service');
      const VendorProduct = require('../models/VendorProduct');
      
      const populatedProducts = [];
      
      console.log('🔍 Raw applicableProducts:', clearanceData.inhouseOffer.applicableProducts);
      
      for (const productRef of clearanceData.inhouseOffer.applicableProducts) {
        let productDetails = null;
        
        // Try to find in Product collection
        if (typeof productRef === 'string' || productRef._id) {
          const productId = typeof productRef === 'string' ? productRef : productRef._id;
          console.log(`🔍 Looking for product with ID: ${productId}`);
          productDetails = await Product.findById(productId);
          if (productDetails) {
            console.log(`✅ Found in Product collection: ${productDetails.name}`);
          }
        }
        
        // If not found, try Service collection
        if (!productDetails) {
          const productId = typeof productRef === 'string' ? productRef : productRef._id;
          console.log(`🔍 Looking for service with ID: ${productId}`);
          productDetails = await Service.findById(productId);
          if (productDetails) {
            console.log(`✅ Found in Service collection: ${productDetails.name}`);
          }
        }
        
        // If not found, try VendorProduct collection
        if (!productDetails) {
          const productId = typeof productRef === 'string' ? productRef : productRef._id;
          console.log(`🔍 Looking for vendor product with ID: ${productId}`);
          productDetails = await VendorProduct.findById(productId);
          if (productDetails) {
            console.log(`✅ Found in VendorProduct collection: ${productDetails.name}`);
          }
        }
        
        if (productDetails) {
          const normalizedProduct = {
            _id: productDetails._id,
            id: productDetails._id,
            displayName: productDetails.displayName || productDetails.name,
            name: productDetails.name || productDetails.displayName,
            price: productDetails.price,
            thumbnail: productDetails.thumbnail || productDetails.bannerImage || productDetails.images?.[0],
            images: productDetails.images,
            type: productDetails.type || 'product',
            sku: productDetails.sku,
            description: productDetails.description
          };
          populatedProducts.push(normalizedProduct);
          console.log(`✅ Added product: ${normalizedProduct.name} - ₹${normalizedProduct.price}`);
        } else {
          console.log(`❌ Product not found for ID: ${productRef}`);
        }
      }
      
      console.log(`🔍 Populated ${populatedProducts.length} products total`);
      console.log('🔍 Sample populated product:', populatedProducts[0]);
      console.log('🔍 All populated products:', populatedProducts);
      
      // Convert to plain object and replace product references with populated data
      const clearanceDataObj = clearanceData.toObject();
      clearanceDataObj.inhouseOffer.applicableProducts = populatedProducts;
      clearanceData = clearanceDataObj;
    } else {
      console.log('🔍 No inhouse offer applicable products to populate');
    }

    // Only return active offers
    const publicData = {
      inhouseOffer: clearanceData.inhouseOffer?.isActive ? clearanceData.inhouseOffer : null,
      vendorOffers: clearanceData.vendorOffers?.filter(offer => offer.status === 'active') || [],
      prioritySettings: clearanceData.prioritySettings
    };

    console.log('🔍 Returning public clearance data:', {
      hasInhouseOffer: !!publicData.inhouseOffer,
      vendorOffersCount: publicData.vendorOffers.length,
      hasPrioritySettings: !!publicData.prioritySettings,
      inhouseProductsCount: publicData.inhouseOffer?.applicableProducts?.length || 0,
      sampleInhouseProduct: publicData.inhouseOffer?.applicableProducts?.[0],
      inhouseProductsType: Array.isArray(publicData.inhouseOffer?.applicableProducts),
      inhouseProductsFirstItem: publicData.inhouseOffer?.applicableProducts?.[0]
    });

    res.json({
      success: true,
      data: publicData
    });
  } catch (error) {
    console.error('❌ Error getting public clearance sale data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get public clearance products for users
exports.getPublicClearanceProducts = async (req, res) => {
  try {
    console.log('🔍 PUBLIC CLEARANCE PRODUCTS API CALLED');
    console.log('🔍 Request headers:', req.headers);
    console.log('🔍 Request query params:', req.query);
    
    const { page = 1, limit = 12, sort = 'discount_desc' } = req.query;
    
    // Get clearance sale data
    const clearanceData = await ClearanceSale.findOne({});
    
    if (!clearanceData || (!clearanceData.inhouseOffer?.isActive && clearanceData.vendorOffers?.length === 0)) {
      console.log('🔍 No active clearance sale found');
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        },
        message: 'No active clearance sale found'
      });
    }
    
    let clearanceProducts = [];
    
    // Get inhouse clearance products
    if (clearanceData.inhouseOffer?.isActive) {
      console.log('🔍 Inhouse offer is active');
      const now = new Date();
      const startDate = new Date(clearanceData.inhouseOffer.startDate);
      const endDate = new Date(clearanceData.inhouseOffer.endDate);
      
      // Check if sale is active
      if (now >= startDate && now <= endDate) {
        console.log('🔍 Inhouse offer is active');
        const inhouseProducts = await Product.find({
          _id: { $in: clearanceData.inhouseOffer.applicableProducts },
          status: 'active'
        })
        .populate('category', 'name')
        .lean();
        
        console.log('🔍 Found inhouse products:', inhouseProducts.length);
        
        clearanceProducts = inhouseProducts.map(product => ({
          ...product,
          id: product._id,
          clearancePrice: calculateClearancePrice(product.price, clearanceData.inhouseOffer),
          discountPercentage: clearanceData.inhouseOffer.discountType === 'percentage' ? clearanceData.inhouseOffer.discountAmount : 0,
          originalPrice: product.price,
          isClearance: true,
          clearanceType: 'inhouse',
          saleEnds: clearanceData.inhouseOffer.endDate
        }));
      } else {
        console.log('🔍 Inhouse offer expired');
      }
    }
    
    // Get vendor clearance products
    if (clearanceData.vendorOffers?.length > 0) {
      const activeVendorOffers = clearanceData.vendorOffers.filter(offer => 
        offer.status === 'active' && 
        new Date() >= new Date(offer.startDate) && 
        new Date() <= new Date(offer.endDate)
      );
      
      console.log('🔍 Active vendor offers:', activeVendorOffers.length);
      
      for (const offer of activeVendorOffers) {
        const vendorProducts = await Product.find({
          _id: { $in: offer.applicableProducts },
          status: 'active'
        })
        .populate('category', 'name')
        .lean();
        
        const vendorClearanceProducts = vendorProducts.map(product => ({
          ...product,
          id: product._id,
          clearancePrice: calculateClearancePrice(product.price, offer),
          discountPercentage: offer.discountType === 'percentage' ? offer.discountAmount : 0,
          originalPrice: product.price,
          isClearance: true,
          clearanceType: 'vendor',
          vendorName: offer.vendorName,
          saleEnds: offer.endDate
        }));
        
        clearanceProducts.push(...vendorClearanceProducts);
      }
    }
    
    // Apply sorting
    clearanceProducts = sortClearanceProducts(clearanceProducts, sort);
    
    // Apply pagination
    const total = clearanceProducts.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = clearanceProducts.slice(startIndex, startIndex + limit);
    
    console.log('🔍 Returning clearance products:', paginatedProducts.length, 'out of', total);
    
    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting public clearance products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Helper function to calculate clearance price
function calculateClearancePrice(originalPrice, offer) {
  if (offer.discountType === 'percentage') {
    return originalPrice * (1 - offer.discountAmount / 100);
  } else if (offer.discountType === 'flat') {
    return Math.max(0, originalPrice - offer.discountAmount);
  }
  return originalPrice;
}

// Helper function to sort clearance products
function sortClearanceProducts(products, sort) {
  return products.sort((a, b) => {
    switch (sort) {
      case 'discount_desc':
        return b.discountPercentage - a.discountPercentage;
      case 'discount_asc':
        return a.discountPercentage - b.discountPercentage;
      case 'price_asc':
        return a.clearancePrice - b.clearancePrice;
      case 'price_desc':
        return b.clearancePrice - a.clearancePrice;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'ending_soon':
        return new Date(a.saleEnds) - new Date(b.saleEnds);
      default:
        return b.discountPercentage - a.discountPercentage;
    }
  });
}
