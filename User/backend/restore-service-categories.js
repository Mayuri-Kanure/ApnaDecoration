const mongoose = require('mongoose');
require('dotenv').config();

// Import ServiceCategory model
const ServiceCategory = require('./models').ServiceCategory;

// Service categories data you provided earlier
const serviceCategoriesData = [
  {
    _id: '698edfc22216a24e4e4a7715',
    name: 'propose',
    description: '',
    icon: 'category',
    image: 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770971074/apna-dec…',
    priority: 1,
    homeCategory: true,
    status: 'active',
    order: 0,
    createdBy: '69833007998d486a2f4e6b07',
    createdAt: new Date('2026-02-13T08:24:34.946+00:00'),
    updatedAt: new Date('2026-02-13T08:24:44.547+00:00')
  },
  {
    _id: '698efe3d223149c7472ec03c',
    name: 'festival',
    description: '',
    icon: 'category',
    image: 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770978876/apna-dec…',
    priority: 1,
    homeCategory: true,
    status: 'active',
    order: 0,
    createdBy: '69833007998d486a2f4e6b07',
    createdAt: new Date('2026-02-13T10:34:37.720+00:00'),
    updatedAt: new Date('2026-02-13T10:34:41.524+00:00')
  },
  {
    _id: '698efe87223149c7472ec04b',
    name: 'party',
    description: '',
    icon: 'category',
    image: 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770978951/apna-dec…',
    priority: 1,
    homeCategory: true,
    status: 'active',
    order: 0,
    createdBy: '69833007998d486a2f4e6b07',
    createdAt: new Date('2026-02-13T10:35:51.872+00:00'),
    updatedAt: new Date('2026-02-13T10:35:55.693+00:00')
  },
  {
    _id: '698f0321599853dd3ad246bf',
    name: 'event',
    description: '',
    icon: 'category',
    image: 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770980129/apna-dec…',
    priority: 1,
    homeCategory: true,
    status: 'active',
    order: 0,
    createdBy: '69833007998d486a2f4e6b07',
    createdAt: new Date('2026-02-13T10:55:29.947+00:00'),
    updatedAt: new Date('2026-02-27T07:00:51.700+00:00')
  }
];

async function restoreServiceCategories() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration');
    console.log('✅ Connected to MongoDB');

    // Clear existing service categories (optional - remove if you want to keep existing)
    await ServiceCategory.deleteMany({});
    console.log('🗑️ Cleared existing service categories');

    // Insert service categories
    const insertedCategories = await ServiceCategory.insertMany(serviceCategoriesData);
    console.log(`✅ Successfully inserted ${insertedCategories.length} service categories`);

    // Verify insertion
    const count = await ServiceCategory.countDocuments();
    console.log(`📊 Total service categories in database: ${count}`);

    // Show inserted categories
    const categories = await ServiceCategory.find({}).sort({ createdAt: 1 });
    console.log('📝 Restored categories:');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat._id})`);
    });

    console.log('🎉 Service categories restoration completed!');
    
  } catch (error) {
    console.error('❌ Error restoring service categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the restoration
restoreServiceCategories();
