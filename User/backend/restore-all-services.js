const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ServiceCategory = require('./models').ServiceCategory;
const Service = require('./models').Service;

// Service categories data
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

// Services data
const servicesData = [
  {
    _id: '698edd99154bf63af3336ac4',
    name: 'Premium Wedding Stage Decoration',
    description: 'We provide premium wedding stage decoration with customized themes including traditional and modern designs.',
    serviceType: 'Wedding',
    price: 45000,
    images: [],
    bannerImage: 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770970521/apna-dec…',
    featured: true,
    availability: true,
    customizationAvailable: true,
    createdAt: new Date('2026-02-13T08:15:21.819+00:00'),
    updatedAt: new Date('2026-02-17T12:47:41.472+00:00')
  },
  {
    _id: '698effbe599853dd3ad2466f',
    name: 'Birthday Decoration',
    description: 'Creative balloon decoration service for kids and adults. Includes themed decorations, balloons, and party supplies.',
    serviceType: 'birthday',
    price: 8500,
    images: [],
    bannerImage: 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770979261/apna-dec…',
    featured: true,
    availability: true,
    customizationAvailable: true,
    createdAt: new Date('2026-02-13T10:41:02.294+00:00'),
    updatedAt: new Date('2026-02-17T12:47:41.485+00:00')
  },
  {
    _id: '698f0349599853dd3ad246c6',
    name: 'Corporate Event Hall Decoration',
    description: 'Professional decoration service for corporate events, seminars, product launches, and business meetings.',
    serviceType: 'event',
    price: 65000,
    images: ['https://res.cloudinary.com/drrlkntpx/image/upload/v1770980169/apna-dec…'],
    bannerImage: 'https://res.cloudinary.com/drrlkntpx/image/upload/v1770980169/apna-dec…',
    featured: false,
    availability: true,
    customizationAvailable: true,
    createdAt: new Date('2026-02-13T10:56:09.504+00:00'),
    updatedAt: new Date('2026-02-17T12:56:02.264+00:00')
  },
  {
    _id: '69a1423762e5b6b5340a0e70',
    name: 'Premium Festival Decoration Combo Kit',
    description: 'Beautiful and premium festive decoration kit designed for Indian festivals and celebrations.',
    serviceType: 'festival',
    price: 14000,
    images: [],
    bannerImage: 'https://res.cloudinary.com/drrlkntpx/image/upload/v1772175909/apna-dec…',
    featured: false,
    availability: true,
    customizationAvailable: true,
    createdAt: new Date('2026-02-27T07:05:27.128+00:00'),
    updatedAt: new Date('2026-02-27T07:05:27.128+00:00')
  }
];

async function restoreAllServices() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration');
    console.log('✅ Connected to MongoDB');

    // Step 1: Restore Service Categories
    console.log('\n🏷️ Restoring Service Categories...');
    await ServiceCategory.deleteMany({});
    const insertedCategories = await ServiceCategory.insertMany(serviceCategoriesData);
    console.log(`✅ Successfully inserted ${insertedCategories.length} service categories`);

    // Step 2: Restore Services
    console.log('\n🎨 Restoring Services...');
    await Service.deleteMany({});
    const insertedServices = await Service.insertMany(servicesData);
    console.log(`✅ Successfully inserted ${insertedServices.length} services`);

    // Step 3: Verify restoration
    console.log('\n📊 Verification:');
    const categoryCount = await ServiceCategory.countDocuments();
    const serviceCount = await Service.countDocuments();
    console.log(`   - Service Categories: ${categoryCount}`);
    console.log(`   - Services: ${serviceCount}`);

    // Step 4: Show restored data
    console.log('\n📝 Restored Service Categories:');
    const categories = await ServiceCategory.find({}).sort({ createdAt: 1 });
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.serviceType || 'N/A'})`);
    });

    console.log('\n🎨 Restored Services:');
    const services = await Service.find({}).sort({ createdAt: 1 });
    services.forEach(service => {
      console.log(`   - ${service.name} (${service.serviceType}) - ₹${service.price.toLocaleString('en-IN')}`);
    });

    console.log('\n🎉 All services restoration completed!');
    
  } catch (error) {
    console.error('❌ Error restoring services:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the restoration
restoreAllServices();
