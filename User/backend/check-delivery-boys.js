const mongoose = require('mongoose');
const DeliveryBoy = require('./models/DeliveryBoy');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/apna-decoration', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    const deliveryBoys = await DeliveryBoy.find({});
    console.log('Found delivery boys:');
    deliveryBoys.forEach((db, index) => {
      console.log(`${index + 1}. ID: ${db._id}`);
      console.log(`   Name: ${db.name}`);
      console.log(`   Email: ${db.email}`);
      console.log(`   Phone: ${db.phone}`);
      console.log(`   Status: ${db.status}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  }
  
  mongoose.connection.close();
}).catch(console.error);
