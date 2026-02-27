const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const { User, Product, Category, Order, Cart, Banner, Service, ServiceCategory } = require('../models');

async function createSampleData() {
  try {
    console.log('🔗 Connecting to Atlas database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Atlas database');

    // Create sample categories
    console.log('📂 Creating sample categories...');
    const categories = [
      {
        name: 'Home Decoration',
        description: 'Beautiful home decoration items',
        image: '/uploads/categories/home-decoration.jpg',
        status: 'active',
        homeCategory: true
      },
      {
        name: 'Office Decoration',
        description: 'Professional office decoration',
        image: '/uploads/categories/office-decoration.jpg',
        status: 'active',
        homeCategory: true
      },
      {
        name: 'Event Decoration',
        description: 'Special event decoration services',
        image: '/uploads/categories/event-decoration.jpg',
        status: 'active',
        homeCategory: true
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create sample products
    console.log('🛍️ Creating sample products...');
    const products = [
      {
        name: 'Modern Wall Art',
        description: 'Beautiful modern wall art for living room',
        price: 2999,
        category: createdCategories[0]._id,
        sku: 'WALL-ART-001',
        stock: 15,
        images: ['/uploads/products/wall-art-1.jpg'],
        thumbnail: '/uploads/products/wall-art-1-thumb.jpg',
        status: 'active',
        featured: true
      },
      {
        name: 'Office Desk Lamp',
        description: 'Elegant desk lamp for office decoration',
        price: 1599,
        category: createdCategories[1]._id,
        sku: 'DESK-LAMP-001',
        stock: 25,
        images: ['/uploads/products/desk-lamp-1.jpg'],
        thumbnail: '/uploads/products/desk-lamp-1-thumb.jpg',
        status: 'active',
        featured: true
      },
      {
        name: 'Birthday Party Kit',
        description: 'Complete birthday party decoration kit',
        price: 4999,
        category: createdCategories[2]._id,
        sku: 'BIRTHDAY-KIT-001',
        stock: 10,
        images: ['/uploads/products/birthday-kit-1.jpg'],
        thumbnail: '/uploads/products/birthday-kit-1-thumb.jpg',
        status: 'active',
        featured: true
      },
      {
        name: 'Flower Vase Set',
        description: 'Elegant flower vase set for home decoration',
        price: 1999,
        category: createdCategories[0]._id,
        sku: 'VASE-SET-001',
        stock: 20,
        images: ['/uploads/products/vase-set-1.jpg'],
        thumbnail: '/uploads/products/vase-set-1-thumb.jpg',
        status: 'active',
        featured: false
      },
      {
        name: 'Conference Room Decor',
        description: 'Professional conference room decoration items',
        price: 8999,
        category: createdCategories[1]._id,
        sku: 'CONF-DECOR-001',
        stock: 5,
        images: ['/uploads/products/conference-decor-1.jpg'],
        thumbnail: '/uploads/products/conference-decor-1-thumb.jpg',
        status: 'active',
        featured: false
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create sample banners
    console.log('🎨 Creating sample banners...');
    const banners = [
      {
        title: 'Summer Sale',
        subtitle: 'Up to 50% off on selected items',
        image: '/uploads/banners/summer-sale.jpg',
        link: '/products',
        status: 'active',
        order: 1,
        createdBy: 'admin' // Add required field
      },
      {
        title: 'New Arrivals',
        subtitle: 'Check out our latest decoration items',
        image: '/uploads/banners/new-arrivals.jpg',
        link: '/products?featured=true',
        status: 'active',
        order: 2,
        createdBy: 'admin' // Add required field
      }
    ];

    const createdBanners = await Banner.insertMany(banners);
    console.log(`✅ Created ${createdBanners.length} banners`);

    // Create sample services
    console.log('🛠️ Creating sample services...');
    const services = [
      {
        name: 'Home Decoration Consultation',
        description: 'Professional home decoration consultation service',
        price: 2999,
        category: 'consultation',
        duration: '2 hours',
        image: '/uploads/services/home-consultation.jpg',
        status: 'active'
      },
      {
        name: 'Event Decoration Service',
        description: 'Complete event decoration service',
        price: 9999,
        category: 'decoration',
        duration: 'Full day',
        image: '/uploads/services/event-decoration.jpg',
        status: 'active'
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);

    // Create sample service categories
    console.log('📋 Creating sample service categories...');
    const serviceCategories = [
      {
        name: 'Consultation',
        description: 'Professional consultation services',
        image: '/uploads/service-categories/consultation.jpg',
        status: 'active',
        homeCategory: true
      },
      {
        name: 'Decoration',
        description: 'Decoration services',
        image: '/uploads/service-categories/decoration.jpg',
        status: 'active',
        homeCategory: true
      }
    ];

    const createdServiceCategories = await ServiceCategory.insertMany(serviceCategories);
    console.log(`✅ Created ${createdServiceCategories.length} service categories`);

    // Create sample regular user
    console.log('👤 Creating sample user...');
    const hashedPassword = await bcrypt.hash('user123', 12);
    const sampleUser = new User({
      username: 'testuser',
      name: 'Test User',
      email: 'user@apna.com',
      password: hashedPassword,
      phone: '9876543211',
      role: 'user',
      isActive: true,
      authProvider: 'local',
      firstName: 'Test',
      lastName: 'User'
    });

    await sampleUser.save();
    console.log('✅ Created sample user: user@apna.com / user123');

    console.log('\n🎉 Sample data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`📂 Categories: ${createdCategories.length}`);
    console.log(`🛍️ Products: ${createdProducts.length}`);
    console.log(`🎨 Banners: ${createdBanners.length}`);
    console.log(`🛠️ Services: ${createdServices.length}`);
    console.log(`📋 Service Categories: ${createdServiceCategories.length}`);
    console.log(`👤 Users: 1 (sample) + 1 (admin) = 2 total`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('👨‍💼 Admin: admin@apna.com / admin123');
    console.log('👤 User: user@apna.com / user123');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from Atlas database');

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  createSampleData();
}

module.exports = createSampleData;
