const Order = require('../models/Order');
const Product = require('../models/Product');

// Get inhouse sales data
const getInhouseSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, category = 'all' } = req.query;
    
    // Build filter
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Get orders with inhouse products (not vendor products)
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('\n=== DEBUGGING INHOUSE SALES ===');
    console.log(`Filter applied: ${JSON.stringify(filter)}`);
    console.log(`Found ${orders.length} orders`);

    // Extract product IDs and fetch product data separately
    const productIds = [];
    for (const order of orders) {
      for (const item of order.items || []) {
        if (item.productModel === 'Product' && item.product) {
          productIds.push(item.product);
        }
      }
    }

    console.log(`Product IDs extracted: ${productIds.length} IDs: ${productIds.join(', ')}`);

    // Fetch products separately
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    console.log(`Products fetched: ${products.length}`);
    
    // Create product map
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = product;
    });

    console.log('Product map created with ${Object.keys(productMap).length} entries');

    // Debug: Check if product IDs exist in map
    productIds.forEach(id => {
      if (!productMap[id]) {
        console.log(`❌ MISSING PRODUCT ID: ${id}`);
      } else {
        console.log(`✅ FOUND PRODUCT ID: ${id} -> ${productMap[id]?.name}`);
      }
    });

    // Extract inhouse product sales
    const salesData = [];
    const productSales = new Map();
    
    console.log('\n=== PROCESSING ORDERS ===');
    for (const order of orders) {
      console.log(`\n--- Processing Order: ${order.orderNumber} ---`);
      
      for (const item of order.items || []) {
        if (item.productModel !== 'Product') continue;
        
        const productId = item.product?.toString();
        if (!productId) {
          console.log(`❌ Item has no product ID`);
          continue;
        }
        
        console.log(`Product ID: ${productId}`);
        console.log(`Checking map for ID: ${productId}`);
        console.log(`Product in map: ${productMap[productId] ? 'EXISTS' : 'MISSING'}`);
        
        if (!productSales.has(productId)) {
          productSales.set(productId, {
            id: productId,
            productName: productMap[productId]?.name || 'Unknown Product',
            sales: 0,
            totalSale: 0
          });
          
          console.log(`✅ Created sales entry for ${productMap[productId]?.name}`);
        } else {
          console.log(`⚠️ Product ${productId} already exists in sales data`);
        }
        
        const productStats = productSales.get(productId);
        productStats.sales += 1;
        productStats.totalSale += item.totalPrice || 0;
      }
    }
    
    console.log('\n=== SALES DATA SUMMARY ===');
    console.log(`Total sales entries created: ${productSales.size}`);
    console.log('Sales by product:');
    productSales.forEach((sale, index) => {
      console.log(`  ${index + 1}. ${sale.productName}: ₹${sale.totalSale.toFixed(2)}`);
    });
    
    const sales = Array.from(productSales.values());
    const total = await Order.countDocuments(filter);
    
    res.json({
      data: sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching inhouse sales:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get categories for inhouse sales
const getInhouseCategories = async (req, res) => {
  try {
    // Get unique categories from inhouse products
    const products = await Product.find({}, 'category').lean();
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    // Format for frontend
    const formattedCategories = categories.map(cat => ({
      _id: cat,
      name: cat
    }));
    
    res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching inhouse categories:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInhouseSales,
  getInhouseCategories
};
