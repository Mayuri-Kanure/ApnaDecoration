const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const { User } = require('../models');

async function createAdminUserInAtlas() {
  try {
    console.log('🔗 Connecting to Atlas database...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Atlas database');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@apna.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists in Atlas');
      console.log('📧 Email: admin@apna.com');
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔐 Role:', existingAdmin.role);
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      username: 'admin',
      name: 'Admin User',
      email: 'admin@apna.com',
      password: hashedPassword,
      phone: '9876543210',
      role: 'admin',
      isActive: true,
      authProvider: 'local',
      firstName: 'Admin',
      lastName: 'User'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully in Atlas!');
    console.log('📧 Email: admin@apna.com');
    console.log('🔐 Password: admin123');
    console.log('👤 Name: Admin User');
    console.log('🔐 Role: admin');
    console.log('📱 Phone: 9876543210');
    
    await mongoose.connection.close();
    console.log('🔌 Disconnected from Atlas database');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  createAdminUserInAtlas();
}

module.exports = createAdminUserInAtlas;
