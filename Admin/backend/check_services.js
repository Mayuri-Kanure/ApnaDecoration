const mongoose = require('mongoose');
require('dotenv').config();

// Import Service model
const Service = require('./models/Service');

async function checkServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🔍 Connected to MongoDB');
    console.log('🔍 Checking for services...');
    
    // Count all services
    const totalServices = await Service.countDocuments();
    console.log(`📊 Total services in database: ${totalServices}`);
    
    if (totalServices === 0) {
      console.log('❌ No services found in database!');
      console.log('💡 You need to create services first using the Admin panel');
      
      // Create a sample service for testing
      console.log('🔧 Creating sample service...');
      const sampleService = new Service({
        name: 'Birthday Decoration Package',
        description: 'Complete birthday decoration service with balloons, flowers, and theme setup',
        serviceType: 'decoration',
        price: 5000,
        featured: true,
        availability: true,
        customizationAvailable: true,
        bannerImage: 'https://via.placeholder.com/800x400',
        images: [
          'https://via.placeholder.com/400x300',
          'https://via.placeholder.com/400x300'
        ]
      });
      
      await sampleService.save();
      console.log('✅ Sample service created successfully!');
      console.log('📝 Service ID:', sampleService._id);
    } else {
      // Get first 5 services
      const services = await Service.find().limit(5);
      console.log('✅ Found services:');
      services.forEach((service, index) => {
        console.log(`${index + 1}. ${service.name} (${service.serviceType}) - ₹${service.price}`);
        console.log(`   Featured: ${service.featured}, Available: ${service.availability}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking services:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔍 Disconnected from MongoDB');
  }
}

checkServices();
