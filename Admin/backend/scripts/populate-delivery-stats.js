/**
 * Script to populate test delivery statistics for delivery boys
 * Usage: node scripts/populate-delivery-stats.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const DeliveryBoy = require("../models/DeliveryBoy");
const DeliveryOrder = require("../models/DeliveryOrder");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✓ MongoDB connected");
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

async function populateStats() {
  try {
    // Get all delivery boys
    const deliveryBoys = await DeliveryBoy.find({});
    console.log(`Found ${deliveryBoys.length} delivery boys\n`);

    if (deliveryBoys.length === 0) {
      console.log("No delivery boys found in database!");
      console.log("Please create a delivery boy account first.\n");
      return;
    }

    // For each delivery boy, check their actual delivery stats
    for (const deliveryBoy of deliveryBoys) {
      console.log(`\n📦 Processing: ${deliveryBoy.firstName} ${deliveryBoy.lastName}`);
      console.log(`   ID: ${deliveryBoy._id}`);
      console.log(`   Email: ${deliveryBoy.email}`);

      // Count actual completed deliveries
      const completedDeliveries = await DeliveryOrder.countDocuments({
        deliveryBoyId: deliveryBoy._id,
        status: "delivered",
      });

      // Count failed deliveries
      const failedDeliveries = await DeliveryOrder.countDocuments({
        deliveryBoyId: deliveryBoy._id,
        status: "rejected",
      });

      // Get total earnings from completed deliveries
      const earningsData = await DeliveryOrder.aggregate([
        {
          $match: {
            deliveryBoyId: mongoose.Types.ObjectId(deliveryBoy._id),
            status: "delivered",
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$deliveryBoyEarnings" },
          },
        },
      ]);

      const totalEarnings = earningsData[0]?.totalEarnings || 0;

      // Update delivery boy stats
      deliveryBoy.totalDeliveries = completedDeliveries + failedDeliveries;
      deliveryBoy.successfulDeliveries = completedDeliveries;
      deliveryBoy.failedDeliveries = failedDeliveries;
      deliveryBoy.totalEarnings = totalEarnings;
      deliveryBoy.availableBalance = totalEarnings;

      await deliveryBoy.save();

      console.log(`   ✓ Completed deliveries: ${completedDeliveries}`);
      console.log(`   ✓ Failed deliveries: ${failedDeliveries}`);
      console.log(`   ✓ Total earnings: ₹${totalEarnings.toFixed(2)}`);
    }

    console.log("\n✓ Stats updated successfully!\n");
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}

async function createTestData() {
  try {
    console.log("\n=== Creating Test Delivery Data ===\n");

    // Get all delivery boys
    const deliveryBoys = await DeliveryBoy.find({});

    if (deliveryBoys.length === 0) {
      console.log("No delivery boys found. Please create one first.");
      return;
    }

    // Update all delivery boys with test stats
    for (const deliveryBoy of deliveryBoys) {
      deliveryBoy.totalDeliveries = 4;
      deliveryBoy.successfulDeliveries = 3;
      deliveryBoy.failedDeliveries = 1;
      deliveryBoy.totalEarnings = 525;
      deliveryBoy.availableBalance = 525;
      deliveryBoy.averageRating = 4.5;

      await deliveryBoy.save();
      console.log(`✓ Updated: ${deliveryBoy.firstName} ${deliveryBoy.lastName}`);
    }

    console.log(`\n✓ Test data created for ${deliveryBoys.length} delivery boys!`);
    console.log(`\nAll delivery boys now have:`);
    console.log(`  - Total Deliveries: 4`);
    console.log(`  - Successful: 3`);
    console.log(`  - Failed: 1`);
    console.log(`  - Total Earnings: ₹525`);
    console.log(`  - Available Balance: ₹525`);
    console.log(`  - Average Rating: 4.5\n`);
  } catch (error) {
    console.error("Error creating test data:", error.message);
  }
}

async function main() {
  await connectDB();

  console.log("\n=== Delivery Boy Stats Updater ===\n");

  const args = process.argv.slice(2);

  if (args.includes("--create-test")) {
    await createTestData();
  } else {
    await populateStats();
  }

  await mongoose.connection.close();
  console.log("✓ Database connection closed");
}

main().catch(console.error);
