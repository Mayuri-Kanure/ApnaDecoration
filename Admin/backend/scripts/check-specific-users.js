const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = 'mongodb+srv://kanuremayuri_db_user:Kanuremayurimongodbatlas@highflytravels.qoqccvi.mongodb.net/apna-decoration?retryWrites=true&w=majority';

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const emails = ['Skdecoration@gmail.com', 'sk@gmail.com'];
    
    for (const email of emails) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        console.log(`✓ Found: ${email}`);
        console.log(`  Name: ${user.name || user.username || 'N/A'}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Created: ${user.createdAt}\n`);
      } else {
        console.log(`✗ Not found: ${email}\n`);
      }
    }

    const allUsers = await User.find().select('email role name username');
    console.log(`\nTotal users in database: ${allUsers.length}`);
    console.log('\nAll users by role:');
    const roleCount = {};
    allUsers.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
