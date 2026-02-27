const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const MONGODB_URI = 'mongodb+srv://kanuremayuri_db_user:Kanuremayurimongodbatlas@highflytravels.qoqccvi.mongodb.net/apna-decoration?retryWrites=true&w=majority';

async function verifyDashboard() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
    console.log('='.repeat(60));
    console.log('ADMIN DASHBOARD VERIFICATION');
    console.log('='.repeat(60));

    // Business Analytics
    console.log('\n📊 BUSINESS ANALYTICS:');
    const totalOrders = await Order.countDocuments();
    const totalStores = await User.countDocuments({ role: 'vendor' });
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });
    
    console.log(`  Total Orders: ${totalOrders} ${totalOrders === 2 ? '✓ CORRECT' : '✗ MISMATCH'}`);
    console.log(`  Total Stores: ${totalStores} ${totalStores === 1 ? '✓ CORRECT' : '✗ MISMATCH'}`);
    console.log(`  Total Products: ${totalProducts}`);
    console.log(`  Total Customers: ${totalCustomers} ${totalCustomers === 1 ? '✓ CORRECT' : '✗ MISMATCH'}`);

    // Order Breakdown
    console.log('\n📦 ORDER BREAKDOWN:');
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const pending = ordersByStatus.find(o => o._id === 'pending')?.count || 0;
    const processing = ordersByStatus.find(o => o._id === 'processing')?.count || 0;
    const delivered = ordersByStatus.find(o => o._id === 'delivered')?.count || 0;
    const canceled = ordersByStatus.find(o => o._id === 'canceled')?.count || 0;
    
    console.log(`  Pending: ${pending} ${pending === 2 ? '✓ CORRECT' : '✗ MISMATCH'}`);
    console.log(`  Processing: ${processing} ${processing === 0 ? '✓ CORRECT' : '✗ MISMATCH'}`);
    console.log(`  Delivered: ${delivered} ${delivered === 0 ? '✓ CORRECT' : '✗ MISMATCH'}`);
    console.log(`  Canceled: ${canceled} ${canceled === 0 ? '✓ CORRECT' : '✗ MISMATCH'}`);

    // Admin Wallet
    console.log('\n💰 ADMIN WALLET:');
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    console.log(`  Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    console.log(`  In-House Earning: ₹0.00 (Not implemented)`);
    console.log(`  Commission Earned: ₹0.00 (Not implemented)`);
    console.log(`  Delivery Charge: ₹0.00 (Not implemented)`);
    console.log(`  Tax Collected: ₹0.00 (Not implemented)`);

    // User Overview
    console.log('\n👥 USER OVERVIEW:');
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const totalUsers = usersByRole.reduce((sum, u) => sum + u.count, 0);
    const customers = usersByRole.find(u => u._id === 'user')?.count || 0;
    const vendors = usersByRole.find(u => u._id === 'vendor')?.count || 0;
    const admins = usersByRole.find(u => u._id === 'admin')?.count || 0;
    
    console.log(`  Total Users: ${totalUsers} ${totalUsers === 3 ? '✓ CORRECT' : '✗ MISMATCH'}`);
    console.log(`  Total Customers: ${customers} ${customers === 1 ? '✓ CORRECT' : '✗ MISMATCH'}`);
    console.log(`  Total Vendors: ${vendors} ${vendors === 1 ? '✓ CORRECT (Dashboard shows 0 - BUG!)' : '✗ MISMATCH'}`);
    console.log(`  Total Admins: ${admins}`);
    console.log(`  Total Delivery Men: 0 (Not implemented)`);

    // Top Customers
    console.log('\n⭐ TOP CUSTOMERS:');
    const customers_list = await User.find({ role: 'user' }).select('name email');
    if (customers_list.length > 0) {
      customers_list.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.name || c.email}`);
      });
    } else {
      console.log('  No customers found');
    }

    // Popular Stores
    console.log('\n🏪 POPULAR STORES:');
    const vendors_list = await User.find({ role: 'vendor' }).select('name email username');
    if (vendors_list.length > 0) {
      vendors_list.forEach((v, i) => {
        console.log(`  ${i + 1}. ${v.name || v.username} (${v.email})`);
      });
      console.log('  ✗ Dashboard shows "No popular stores" - NOT IMPLEMENTED');
    } else {
      console.log('  No vendors found');
    }

    // Products
    console.log('\n📦 PRODUCTS:');
    const products = await Product.find().select('product_name_en price stock').limit(5);
    if (products.length > 0) {
      products.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.product_name_en} - ₹${p.price} (Stock: ${p.stock || 0})`);
      });
    } else {
      console.log('  No products found');
    }

    // Orders Detail
    console.log('\n📋 ORDERS DETAIL:');
    const ordersList = await Order.find().select('orderNumber totalAmount status createdAt').limit(5);
    if (ordersList.length > 0) {
      ordersList.forEach((o, i) => {
        console.log(`  ${i + 1}. Order #${o.orderNumber || o._id} - ₹${o.totalAmount} - ${o.status}`);
      });
    } else {
      console.log('  No orders found');
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY:');
    console.log('='.repeat(60));
    console.log('✓ Working: Total Orders, Total Stores, Total Customers, Order Breakdown');
    console.log('✗ Not Working: User Overview (shows vendor=0), Popular Stores, Top Customers');
    console.log('⚠ Not Implemented: Admin Wallet, Delivery Men, Top Products, Top Selling Store');
    console.log('='.repeat(60));

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyDashboard();
