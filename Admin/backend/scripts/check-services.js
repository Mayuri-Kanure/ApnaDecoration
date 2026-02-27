const mongoose = require('mongoose');
const Service = require('../models/Service');

const MONGODB_URI = 'mongodb+srv://kanuremayuri_db_user:Kanuremayurimongodbatlas@highflytravels.qoqccvi.mongodb.net/apna-decoration?retryWrites=true&w=majority';

async function checkServices() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const services = await Service.find().select('_id name serviceType price availability');
    
    console.log(`Total Services: ${services.length}\n`);
    
    if (services.length > 0) {
      console.log('Services List:');
      services.forEach((service, index) => {
        console.log(`${index + 1}. ID: ${service._id}`);
        console.log(`   Name: ${service.name}`);
        console.log(`   Type: ${service.serviceType}`);
        console.log(`   Price: ₹${service.price}`);
        console.log(`   Available: ${service.availability}\n`);
      });
    } else {
      console.log('No services found in database.');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkServices();
