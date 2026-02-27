const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = 'mongodb+srv://kanuremayuri_db_user:Kanuremayurimongodbatlas@highflytravels.qoqccvi.mongodb.net/apna-decoration?retryWrites=true&w=majority';

async function checkVendors() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const vendorCount = await User.countDocuments({ role: 'vendor' });
    console.log(`\nTotal Vendors: ${vendorCount}`);

    const vendors = await User.find({ role: 'vendor' }).select('name email username createdAt');
    
    if (vendors.length > 0) {
      console.log('\nVendor List:');
      vendors.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.name || vendor.username} (${vendor.email}) - Created: ${vendor.createdAt}`);
      });
    } else {
      console.log('\nNo vendors found in database.');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVendors();
