const mongoose = require('mongoose');
require('dotenv').config();

// Import Admin Category model
const Category = require('../models/Category');

async function createAdminCategories() {
  try {
    console.log('🔗 Connecting to Atlas database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Atlas database');

    // Check existing categories
    const existingCategories = await Category.countDocuments();
    console.log(`📊 Found ${existingCategories} existing categories`);

    if (existingCategories > 0) {
      console.log('✅ Categories already exist in admin database');
      
      // Show existing categories
      const categories = await Category.find({});
      console.log('\n📋 Existing Categories:');
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.status})`);
      });
      
      await mongoose.connection.close();
      return;
    }

    // Create admin categories
    console.log('📂 Creating admin categories...');
    const categories = [
      {
        name: 'Home Decoration',
        description: 'Beautiful home decoration items for living spaces',
        image: '/uploads/categories/home-decoration.jpg',
        status: 'active',
        homeCategory: true,
        priority: 1
      },
      {
        name: 'Office Decoration',
        description: 'Professional office decoration and workspace items',
        image: '/uploads/categories/office-decoration.jpg',
        status: 'active',
        homeCategory: true,
        priority: 2
      },
      {
        name: 'Event Decoration',
        description: 'Special event decoration services and supplies',
        image: '/uploads/categories/event-decoration.jpg',
        status: 'active',
        homeCategory: true,
        priority: 3
      },
      {
        name: 'Wall Art',
        description: 'Modern and traditional wall art pieces',
        image: '/uploads/categories/wall-art.jpg',
        status: 'active',
        homeCategory: false,
        priority: 4
      },
      {
        name: 'Lighting',
        description: 'Decorative lighting solutions',
        image: '/uploads/categories/lighting.jpg',
        status: 'active',
        homeCategory: false,
        priority: 5
      },
      {
        name: 'Furniture',
        description: 'Decorative furniture pieces',
        image: '/uploads/categories/furniture.jpg',
        status: 'active',
        homeCategory: false,
        priority: 6
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} admin categories`);

    console.log('\n📋 Created Categories:');
    createdCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.status}) - Priority: ${cat.priority}`);
    });

    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from Atlas database');

  } catch (error) {
    console.error('❌ Error creating admin categories:', error.message);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  createAdminCategories();
}

module.exports = createAdminCategories;
