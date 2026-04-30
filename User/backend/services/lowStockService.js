const nodemailer = require('nodemailer');
const { Product, VendorProduct } = require('../models');

class LowStockService {
  constructor() {
    // Initialize email transporter (configure based on your email provider)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'noreply@apnadecorations.com',
        pass: process.env.EMAIL_PASSWORD || 'your_app_password',
      },
    });

    // Threshold for low stock alerts (units)
    this.LOW_STOCK_THRESHOLD = 5;
    this.CRITICAL_STOCK_THRESHOLD = 2;
  }

  // Check if product stock is low
  isLowStock(stock) {
    return stock > 0 && stock <= this.LOW_STOCK_THRESHOLD;
  }

  // Check if product stock is critical
  isCriticalStock(stock) {
    return stock > 0 && stock <= this.CRITICAL_STOCK_THRESHOLD;
  }

  // Send low stock email alert to admin
  async sendLowStockAlert(product, currentStock, threshold) {
    try {
      const severity = this.isCriticalStock(currentStock) ? '🔴 CRITICAL' : '🟡 WARNING';
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@apnadecorations.com';

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `${severity} Low Stock Alert: ${product.name}`,
        html: `
          <h2>${severity} Low Stock Alert</h2>
          <p><strong>Product:</strong> ${product.name}</p>
          <p><strong>Current Stock:</strong> ${currentStock} units</p>
          <p><strong>Threshold:</strong> ${threshold} units</p>
          <p><strong>Price:</strong> ₹${product.price}</p>
          <p><strong>Category:</strong> ${product.category?.name || 'N/A'}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
          <hr>
          <p>⚡ Action Required: Please restock this item or mark it as unavailable</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Low stock email sent for: ${product.name}`);
      return true;
    } catch (err) {
      console.error('📧 Failed to send email:', err.message);
      return false;
    }
  }

  // Log low stock to database for analytics
  async logLowStockEvent(productId, currentStock, severity) {
    try {
      // You can create a LowStockLog model if needed
      console.log(`📊 LOW STOCK EVENT LOGGED`);
      console.log(`   Product ID: ${productId}`);
      console.log(`   Stock: ${currentStock}`);
      console.log(`   Severity: ${severity}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);
      return true;
    } catch (err) {
      console.error('Error logging low stock:', err.message);
      return false;
    }
  }

  // Scan all products for low stock and send alerts
  async scanAndAlertLowStock() {
    try {
      console.log('🔍 Scanning for low stock products...');

      // Check regular products
      const lowStockProducts = await Product.find({
        stock: { $gt: 0, $lte: this.LOW_STOCK_THRESHOLD },
      }).select('name stock price category');

      // Check vendor products
      const lowStockVendorProducts = await VendorProduct.find({
        stock: { $gt: 0, $lte: this.LOW_STOCK_THRESHOLD },
      }).select('name stock price category');

      const allLowStockItems = [...lowStockProducts, ...lowStockVendorProducts];

      if (allLowStockItems.length > 0) {
        console.log(`⚠️ Found ${allLowStockItems.length} low stock items`);

        for (const product of allLowStockItems) {
          const isCritical = this.isCriticalStock(product.stock);
          const severity = isCritical ? 'CRITICAL' : 'LOW';

          // Send email alert
          await this.sendLowStockAlert(
            product,
            product.stock,
            this.LOW_STOCK_THRESHOLD
          );

          // Log event
          await this.logLowStockEvent(product._id, product.stock, severity);
        }
      } else {
        console.log('✅ All products have sufficient stock');
      }

      return allLowStockItems;
    } catch (err) {
      console.error('Error scanning low stock:', err.message);
      return [];
    }
  }

  // Get inventory status dashboard
  async getInventoryStatus() {
    try {
      const allProducts = await Product.find().select('name stock price');
      const allVendorProducts = await VendorProduct.find().select('name stock price');
      const allItems = [...allProducts, ...allVendorProducts];

      const stats = {
        totalProducts: allItems.length,
        inStock: allItems.filter(p => p.stock > this.LOW_STOCK_THRESHOLD).length,
        lowStock: allItems.filter(p => this.isLowStock(p.stock)).length,
        criticalStock: allItems.filter(p => this.isCriticalStock(p.stock)).length,
        outOfStock: allItems.filter(p => p.stock === 0).length,
        items: {
          inStock: allItems.filter(p => p.stock > this.LOW_STOCK_THRESHOLD),
          lowStock: allItems.filter(p => this.isLowStock(p.stock)),
          criticalStock: allItems.filter(p => this.isCriticalStock(p.stock)),
          outOfStock: allItems.filter(p => p.stock === 0),
        },
      };

      return stats;
    } catch (err) {
      console.error('Error getting inventory status:', err.message);
      return null;
    }
  }
}

module.exports = new LowStockService();
