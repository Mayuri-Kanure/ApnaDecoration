const { User } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@apnadecoration.com',
      password: adminPassword,
      phone: '+91 98765 43210',
      role: 'admin',
      emailVerified: true,
      phoneVerified: true,
      status: 'active'
    });

    // Create test user
    const userPassword = await bcrypt.hash('user123', 12);
    const testUser = await User.create({
      name: 'Test User',
      email: 'user@apnadecoration.com',
      password: userPassword,
      phone: '+91 98765 43211',
      role: 'user',
      emailVerified: true,
      phoneVerified: true,
      status: 'active'
    });

    // Create vendor users
    const vendorPassword = await bcrypt.hash('vendor123', 12);
    
    const vendorUser1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@decorations.com',
      password: vendorPassword,
      phone: '+91 98765 43212',
      role: 'vendor',
      emailVerified: true,
      phoneVerified: true,
      status: 'active'
    });

    const vendorUser2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@events.com',
      password: vendorPassword,
      phone: '+91 98765 43213',
      role: 'vendor',
      emailVerified: true,
      phoneVerified: true,
      status: 'active'
    });

    console.log('✅ Users seeded successfully!');
    console.log('Admin: admin@apnadecoration.com / admin123');
    console.log('User: user@apnadecoration.com / user123');
    console.log('Vendor 1: rajesh@decorations.com / vendor123');
    console.log('Vendor 2: priya@events.com / vendor123');

    return {
      admin,
      testUser,
      vendorUser1,
      vendorUser2
    };
  },

  down: async (queryInterface, Sequelize) => {
    await User.destroy({ where: {} });
  }
};
