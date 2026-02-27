const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const { User, Product, Category, Order, Cart, Banner, Service, ServiceCategory } = require('../models');

async function completeSampleData() {
  try {
    console.log('🔗 Connecting to Atlas database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Atlas database');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ email: 'admin@apna.com' });
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Create sample banners
    console.log('🎨 Creating sample banners...');
    const existingBanners = await Banner.countDocuments();
    if (existingBanners === 0) {
      const banners = [
        {
          title: 'Summer Sale',
          subtitle: 'Up to 50% off on selected items',
          image: '/uploads/banners/summer-sale.jpg',
          link: '/products',
          status: 'active',
          order: 1,
          createdBy: adminUser._id
        },
        {
          title: 'New Arrivals',
          subtitle: 'Check out our latest decoration items',
          image: '/uploads/banners/new-arrivals.jpg',
          link: '/products?featured=true',
          status: 'active',
          order: 2,
          createdBy: adminUser._id
        }
      ];

      const createdBanners = await Banner.insertMany(banners);
      console.log(`✅ Created ${createdBanners.length} banners`);
    } else {
      console.log(`✅ Banners already exist (${existingBanners} found)`);
    }

    // Create sample services
    console.log('🛠️ Creating sample services...');
    const existingServices = await Service.countDocuments();
    if (existingServices === 0) {
      // Create service category first
      const consultationCategory = await ServiceCategory.findOne({ name: 'Consultation' });
      const decorationCategory = await ServiceCategory.findOne({ name: 'Decoration' });

      const services = [
        {
          name: 'Home Decoration Consultation',
          description: 'Professional home decoration consultation service',
          price: 2999,
          category: consultationCategory ? consultationCategory._id : null,
          duration: '2 hours',
          image: '/uploads/services/home-consultation.jpg',
          status: 'active',
          createdBy: adminUser._id
        },
        {
          name: 'Event Decoration Service',
          description: 'Complete event decoration service',
          price: 9999,
          category: decorationCategory ? decorationCategory._id : null,
          duration: 'Full day',
          image: '/uploads/services/event-decoration.jpg',
          status: 'active',
          createdBy: adminUser._id
        }
      ];

      const createdServices = await Service.insertMany(services);
      console.log(`✅ Created ${createdServices.length} services`);
    } else {
      console.log(`✅ Services already exist (${existingServices} found)`);
    }

    // Create sample service categories
    console.log('📋 Creating sample service categories...');
    const existingServiceCategories = await ServiceCategory.countDocuments();
    if (existingServiceCategories === 0) {
      const serviceCategories = [
        {
          name: 'Consultation',
          description: 'Professional consultation services',
          image: '/uploads/service-categories/consultation.jpg',
          status: 'active',
          homeCategory: true,
          createdBy: adminUser._id
        },
        {
          name: 'Decoration',
          description: 'Decoration services',
          image: '/uploads/service-categories/decoration.jpg',
          status: 'active',
          homeCategory: true,
          createdBy: adminUser._id
        }
      ];

      const createdServiceCategories = await ServiceCategory.insertMany(serviceCategories);
      console.log(`✅ Created ${createdServiceCategories.length} service categories`);
    } else {
      console.log(`✅ Service categories already exist (${existingServiceCategories} found)`);
    }

    // Create sample regular user
    console.log('👤 Creating sample user...');
    const existingUser = await User.findOne({ email: 'user@apna.com' });
    if (!existingUser) {
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
    } else {
      console.log('✅ Sample user already exists');
    }

    console.log('\n🎉 Sample data completion successful!');
    
    // Final count check
    const finalCounts = {
      Users: await User.countDocuments(),
      Products: await Product.countDocuments(),
      Categories: await Category.countDocuments(),
      Orders: await Order.countDocuments(),
      Carts: await Cart.countDocuments(),
      Banners: await Banner.countDocuments(),
      Services: await Service.countDocuments(),
      ServiceCategories: await ServiceCategory.countDocuments()
    };

    console.log('\n📊 Final Database Summary:');
    Object.entries(finalCounts).forEach(([collection, count]) => {
      console.log(`📋 ${collection}: ${count} records`);
    });
    
    console.log('\n🔐 Login Credentials:');
    console.log('👨‍💼 Admin: admin@apna.com / admin123');
    console.log('👤 User: user@apna.com / user123');

    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from Atlas database');

  } catch (error) {
    console.error('❌ Error completing sample data:', error.message);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  completeSampleData();
}

module.exports = completeSampleData;
