const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const { User, Product, Category, Order, Cart, Banner, Service, ServiceCategory, Address, Notification, PaymentMethod, VendorProduct, Wishlist } = require('../models');

class DatabaseMigrator {
  constructor() {
    this.localUri = 'mongodb://localhost:27017/apna-decoration-local';
    this.atlasUri = process.env.MONGODB_URI;
    this.collections = [];
  }

  async connectToDatabase(uri, name) {
    try {
      console.log(`🔗 Connecting to ${name} database...`);
      await mongoose.connect(uri);
      console.log(`✅ Connected to ${name} database`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to ${name} database:`, error.message);
      return false;
    }
  }

  async disconnectFromDatabase() {
    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from database');
    } catch (error) {
      console.error('❌ Error disconnecting:', error.message);
    }
  }

  async exportCollectionData(Model, collectionName) {
    try {
      console.log(`📤 Exporting ${collectionName}...`);
      const data = await Model.find({});
      console.log(`✅ Exported ${data.length} ${collectionName} records`);
      return data;
    } catch (error) {
      console.error(`❌ Error exporting ${collectionName}:`, error.message);
      return [];
    }
  }

  async importCollectionData(Model, data, collectionName) {
    try {
      if (data.length === 0) {
        console.log(`⚠️ No data to import for ${collectionName}`);
        return true;
      }

      console.log(`📥 Importing ${collectionName}...`);
      
      // Clear existing data in Atlas
      await Model.deleteMany({});
      
      // Insert new data
      await Model.insertMany(data);
      
      console.log(`✅ Imported ${data.length} ${collectionName} records to Atlas`);
      return true;
    } catch (error) {
      console.error(`❌ Error importing ${collectionName}:`, error.message);
      return false;
    }
  }

  async migrateCollection(Model, collectionName) {
    // Connect to local database
    const localConnected = await this.connectToDatabase(this.localUri, 'Local');
    if (!localConnected) return false;

    // Export data from local
    const data = await this.exportCollectionData(Model, collectionName);
    
    // Disconnect from local
    await this.disconnectFromDatabase();

    // Connect to Atlas
    const atlasConnected = await this.connectToDatabase(this.atlasUri, 'Atlas');
    if (!atlasConnected) return false;

    // Import data to Atlas
    const importSuccess = await this.importCollectionData(Model, data, collectionName);
    
    // Disconnect from Atlas
    await this.disconnectFromDatabase();

    return importSuccess;
  }

  async migrateAllCollections() {
    console.log('🚀 Starting database migration from Local to Atlas...\n');

    const collections = [
      { Model: User, name: 'Users' },
      { Model: Category, name: 'Categories' },
      { Model: Product, name: 'Products' },
      { Model: Order, name: 'Orders' },
      { Model: Cart, name: 'Carts' },
      { Model: Banner, name: 'Banners' },
      { Model: Service, name: 'Services' },
      { Model: ServiceCategory, name: 'ServiceCategories' },
      { Model: Address, name: 'Addresses' },
      { Model: Notification, name: 'Notifications' },
      { Model: PaymentMethod, name: 'PaymentMethods' },
      { Model: VendorProduct, name: 'VendorProducts' },
      { Model: Wishlist, name: 'Wishlists' }
    ];

    let successCount = 0;
    let totalCount = collections.length;

    for (const { Model, name } of collections) {
      console.log(`\n📋 Migrating ${name}...`);
      const success = await this.migrateCollection(Model, name);
      
      if (success) {
        successCount++;
        console.log(`✅ ${name} migration completed successfully`);
      } else {
        console.log(`❌ ${name} migration failed`);
      }
    }

    console.log(`\n🎯 Migration Summary:`);
    console.log(`✅ Successful: ${successCount}/${totalCount} collections`);
    console.log(`❌ Failed: ${totalCount - successCount}/${totalCount} collections`);
    
    if (successCount === totalCount) {
      console.log(`🎉 All data migrated successfully to Atlas!`);
    } else {
      console.log(`⚠️ Some collections failed to migrate. Please check the logs above.`);
    }

    return successCount === totalCount;
  }

  async createAdminUser() {
    console.log('\n👤 Creating admin user in Atlas...');
    
    const adminConnected = await this.connectToDatabase(this.atlasUri, 'Atlas');
    if (!adminConnected) return false;

    try {
      // Check if admin user already exists
      const existingAdmin = await User.findOne({ email: 'admin@apna.com' });
      
      if (existingAdmin) {
        console.log('✅ Admin user already exists in Atlas');
        await this.disconnectFromDatabase();
        return true;
      }

      // Create admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        username: 'admin',
        name: 'Admin User',
        email: 'admin@apna.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'admin',
        isActive: true,
        authProvider: 'local'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully in Atlas');
      console.log('📧 Email: admin@apna.com');
      console.log('🔐 Password: admin123');
      
    } catch (error) {
      console.error('❌ Error creating admin user:', error.message);
      return false;
    }

    await this.disconnectFromDatabase();
    return true;
  }
}

// Run migration
async function runMigration() {
  const migrator = new DatabaseMigrator();
  
  try {
    console.log('🔍 Checking Atlas connection...');
    const atlasConnected = await migrator.connectToDatabase(migrator.atlasUri, 'Atlas');
    
    if (!atlasConnected) {
      console.log('❌ Cannot connect to Atlas. Please check your connection string.');
      process.exit(1);
    }
    
    await migrator.disconnectFromDatabase();
    
    console.log('✅ Atlas connection verified. Starting migration...\n');
    
    // First create admin user
    const adminCreated = await migrator.createAdminUser();
    
    // Then migrate all collections
    const migrationSuccess = await migrator.migrateAllCollections();
    
    if (adminCreated && migrationSuccess) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('🌐 Your Atlas database now has all the data from local database.');
      process.exit(0);
    } else {
      console.log('\n⚠️ Migration completed with some issues. Please check the logs.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = DatabaseMigrator;
