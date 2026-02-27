const { Product, Vendor } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get vendors to assign products
    const vendors = await Vendor.findAll();
    if (vendors.length < 2) {
      console.log('⚠️  Please run 001-users.js and 002-vendors.js seeders first');
      return;
    }

    const vendor1 = vendors[0]; // Rajesh Decorations
    const vendor2 = vendors[1]; // Priya Events

    // Create products
    const products = [
      {
        name: 'Birthday Balloon Decoration Package',
        description: 'Complete birthday decoration with balloons, banners, and themed decorations',
        price: 1500.00,
        category: 'birthday',
        vendorId: vendor1.id,
        stockQuantity: 50,
        images: [
          'https://example.com/birthday1.jpg',
          'https://example.com/birthday2.jpg'
        ],
        setupRequired: true,
        setupCharges: 500.00,
        rating: 4.2,
        status: 'active'
      },
      {
        name: 'Anniversary Rose Decoration',
        description: 'Romantic anniversary decoration with roses and candles',
        price: 2500.00,
        category: 'anniversary',
        vendorId: vendor1.id,
        stockQuantity: 30,
        images: [
          'https://example.com/anniversary1.jpg',
          'https://example.com/anniversary2.jpg'
        ],
        setupRequired: true,
        setupCharges: 600.00,
        rating: 4.7,
        status: 'active'
      },
      {
        name: 'Wedding Stage Decoration',
        description: 'Traditional wedding stage with flowers and lighting',
        price: 15000.00,
        category: 'wedding',
        vendorId: vendor2.id,
        stockQuantity: 10,
        images: [
          'https://example.com/wedding1.jpg',
          'https://example.com/wedding2.jpg'
        ],
        setupRequired: true,
        setupCharges: 2000.00,
        rating: 4.9,
        status: 'active'
      },
      {
        name: 'Corporate Event Setup',
        description: 'Professional corporate event decoration with branding',
        price: 8000.00,
        category: 'corporate',
        vendorId: vendor2.id,
        stockQuantity: 20,
        images: [
          'https://example.com/corporate1.jpg',
          'https://example.com/corporate2.jpg'
        ],
        setupRequired: true,
        setupCharges: 1500.00,
        rating: 4.6,
        status: 'active'
      },
      {
        name: 'Baby Shower Theme Package',
        description: 'Cute baby shower decoration with pastel colors',
        price: 2000.00,
        category: 'baby-shower',
        vendorId: vendor1.id,
        stockQuantity: 25,
        images: [
          'https://example.com/baby1.jpg',
          'https://example.com/baby2.jpg'
        ],
        setupRequired: true,
        setupCharges: 400.00,
        rating: 4.3,
        status: 'active'
      },
      {
        name: 'Festival Lighting Decoration',
        description: 'Colorful festival lighting and decorative items',
        price: 3000.00,
        category: 'festival',
        vendorId: vendor2.id,
        stockQuantity: 35,
        images: [
          'https://example.com/festival1.jpg',
          'https://example.com/festival2.jpg'
        ],
        setupRequired: true,
        setupCharges: 800.00,
        rating: 4.4,
        status: 'active'
      }
    ];

    for (const productData of products) {
      await Product.create(productData);
    }

    console.log('Database seeded successfully!');
    console.log('Admin login: admin@apnadecoration.com / admin123');
    console.log('User login: user@apnadecoration.com / user123');
    console.log('Vendor login: rajesh@decorations.com / vendor123');
  },

  down: async (queryInterface, Sequelize) => {
    await Product.destroy({ where: {} });
  }
};
