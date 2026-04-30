/**
 * STOCK SANITY CHECK JOB
 * Runs every 30 minutes to detect and fix stock inconsistencies
 */

const mongoose = require('mongoose');
const { Product, VendorProduct, StockReservation } = require('../models');

class StockSanityJob {
  
  static initializeSanityJob() {
    console.log('🔍 Initializing stock sanity job (runs every 30 minutes)...');
    
    // Run every 30 minutes
    setInterval(async () => {
      await this.performSanityCheck();
    }, 30 * 60 * 1000); // 30 minutes
    
    console.log('✅ Stock sanity job initialized');
  }
  
  /**
   * Perform comprehensive stock sanity check
   */
  static async performSanityCheck() {
    try {
      console.log('🔍 Running stock sanity check at', new Date().toISOString());
      
      const issues = [];
      
      // Check 1: Reserved stock > actual stock
      const stockIssues = await this.checkStockConsistency();
      issues.push(...stockIssues);
      
      // Check 2: Orphaned reservations
      const orphanedIssues = await this.checkOrphanedReservations();
      issues.push(...orphanedIssues);
      
      // Check 3: Negative available stock
      const negativeIssues = await this.checkNegativeAvailableStock();
      issues.push(...negativeIssues);
      
      // Report results
      if (issues.length > 0) {
        console.log(`⚠️ STOCK SANITY ISSUES FOUND (${issues.length}):`);
        issues.forEach(issue => {
          console.log(`  ❌ ${issue.type}: ${issue.message}`);
        });
        
        // Attempt auto-fix for critical issues
        await this.attemptAutoFix(issues);
        
      } else {
        console.log('✅ Stock sanity check passed - no issues found');
      }
      
    } catch (error) {
      console.error('❌ Stock sanity check error:', error);
    }
  }
  
  /**
   * Check for reserved stock > actual stock
   */
  static async checkStockConsistency() {
    const issues = [];
    
    // Check Products
    const products = await Product.find({
      $expr: { $gt: ['$reservedStock', '$stock'] } // reserved > stock
    }).select('name stock reservedStock');
    
    products.forEach(product => {
      issues.push({
        type: 'STOCK_OVERFLOW',
        severity: 'HIGH',
        productId: product._id,
        productName: product.name,
        message: `Reserved stock (${product.reservedStock}) exceeds actual stock (${product.stock})`,
        data: {
          stock: product.stock,
          reserved: product.reservedStock,
          overflow: product.reservedStock - product.stock
        }
      });
    });
    
    // Check VendorProducts
    const vendorProducts = await VendorProduct.find({
      $expr: { $gt: ['$reservedStock', '$stock'] }
    }).select('name stock reservedStock');
    
    vendorProducts.forEach(product => {
      issues.push({
        type: 'STOCK_OVERFLOW',
        severity: 'HIGH',
        productId: product._id,
        productName: product.name,
        message: `Reserved stock (${product.reservedStock}) exceeds actual stock (${product.stock})`,
        data: {
          stock: product.stock,
          reserved: product.reservedStock,
          overflow: product.reservedStock - product.stock
        }
      });
    });
    
    return issues;
  }
  
  /**
   * Check for orphaned reservations (no matching stock deduction)
   */
  static async checkOrphanedReservations() {
    const issues = [];
    
    // Find reservations that are confirmed but stock wasn't properly deducted
    const confirmedReservations = await StockReservation.find({
      status: 'confirmed',
      confirmedAt: { $exists: true },
      createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } // Older than 5 minutes
    }).populate('items.product');
    
    for (const reservation of confirmedReservations) {
      for (const item of reservation.items) {
        let product;
        
        // Find the actual product
        if (item.productModel === 'Product') {
          product = await Product.findById(item.product);
        } else {
          product = await VendorProduct.findById(item.product);
        }
        
        if (product) {
          // Check if soldStock was properly incremented
          const expectedSoldStock = item.quantity;
          const actualSoldStock = product.soldStock || 0;
          
          // This is a simplified check - in reality, we'd need to track this better
          if (actualSoldStock < expectedSoldStock) {
            issues.push({
              type: 'ORPHANED_RESERVATION',
              severity: 'MEDIUM',
              reservationId: reservation._id,
              productId: product._id,
              productName: product.name,
              message: `Confirmed reservation may not have properly deducted sold stock`,
              data: {
                reservationToken: reservation.reservationToken,
                expectedSold: expectedSoldStock,
                actualSold: actualSoldStock
              }
            });
          }
        }
      }
    }
    
    return issues;
  }
  
  /**
   * Check for negative available stock
   */
  static async checkNegativeAvailableStock() {
    const issues = [];
    
    // Check Products
    const products = await Product.find({
      $expr: { $lt: ['$stock', '$reservedStock'] } // stock < reserved
    }).select('name stock reservedStock');
    
    products.forEach(product => {
      const availableStock = product.stock - (product.reservedStock || 0);
      issues.push({
        type: 'NEGATIVE_AVAILABLE',
        severity: 'HIGH',
        productId: product._id,
        productName: product.name,
        message: `Available stock is negative: ${availableStock}`,
        data: {
          stock: product.stock,
          reserved: product.reservedStock,
          available: availableStock
        }
      });
    });
    
    // Check VendorProducts
    const vendorProducts = await VendorProduct.find({
      $expr: { $lt: ['$stock', '$reservedStock'] }
    }).select('name stock reservedStock');
    
    vendorProducts.forEach(product => {
      const availableStock = product.stock - (product.reservedStock || 0);
      issues.push({
        type: 'NEGATIVE_AVAILABLE',
        severity: 'HIGH',
        productId: product._id,
        productName: product.name,
        message: `Available stock is negative: ${availableStock}`,
        data: {
          stock: product.stock,
          reserved: product.reservedStock,
          available: availableStock
        }
      });
    });
    
    return issues;
  }
  
  /**
   * Attempt to automatically fix issues
   */
  static async attemptAutoFix(issues) {
    console.log('🔧 Attempting auto-fix for issues...');
    
    let fixedCount = 0;
    
    for (const issue of issues) {
      try {
        switch (issue.type) {
          case 'STOCK_OVERFLOW':
            // Fix by setting reservedStock to stock
            const ProductModel = issue.productName.includes('Vendor') ? VendorProduct : Product;
            await ProductModel.findByIdAndUpdate(issue.productId, {
              $set: { reservedStock: Math.min(issue.data.stock, issue.data.reserved) }
            });
            console.log(`🔧 Fixed stock overflow for ${issue.productName}`);
            fixedCount++;
            break;
            
          case 'NEGATIVE_AVAILABLE':
            // This is critical - log but don't auto-fix to prevent data corruption
            console.log(`🚨 CRITICAL: Negative available stock for ${issue.productName} - MANUAL INTERVENTION REQUIRED`);
            break;
            
          default:
            console.log(`⚠️ No auto-fix available for issue type: ${issue.type}`);
        }
      } catch (fixError) {
        console.error(`❌ Auto-fix failed for ${issue.productName}:`, fixError.message);
      }
    }
    
    console.log(`🔧 Auto-fix completed: ${fixedCount}/${issues.length} issues resolved`);
  }
}

module.exports = StockSanityJob;
