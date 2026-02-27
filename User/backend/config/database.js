const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the same database as Admin backend
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration';
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
