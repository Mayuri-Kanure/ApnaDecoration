require('dotenv').config();
const mongoose = require('mongoose');

async function checkAdminUsers() {
  console.log('👥 Checking Admin Users in Database\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User');
    
    // Find all admin users
    const adminUsers = await User.find({ 
      $or: [
        { role: 'admin' },
        { role: 'manager' }
      ]
    });
    
    console.log(`📊 Found ${adminUsers.length} admin/manager users:`);
    
    adminUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏷️  Role: ${user.role}`);
      console.log(`   🆔 ID: ${user._id}`);
      console.log(`   ✅ Active: ${user.isActive}`);
    });

    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found!');
      console.log('📝 Creating default admin user...');
      
      // Create default admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ Default admin user created!');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
    }

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
  }
}

// Run the check
if (require.main === module) {
  checkAdminUsers();
}

module.exports = checkAdminUsers;
