/**
 * STOCK MONITORING SERVICE
 * Real-time monitoring and alerting for inventory issues
 */

const mongoose = require('mongoose');
const { Product, VendorProduct, StockReservation } = require('../models');

class StockMonitoringService {
  
  static alerts = [];
  static lastCheck = new Date();
  
  /**
   * Initialize monitoring with real-time alerts
   */
  static initializeMonitoring() {
    console.log('📊 Initializing stock monitoring service...');
    
    // Check for critical issues every 2 minutes
    setInterval(() => {
      this.performHealthCheck();
    }, 2 * 60 * 1000);
    
    // Check for out-of-stock products every 5 minutes
    setInterval(() => {
      this.checkOutOfStockProducts();
    }, 5 * 60 * 1000);
    
    // Check for abnormal reservation patterns every 10 minutes
    setInterval(() => {
      this.checkAbnormalPatterns();
    }, 10 * 60 * 1000);
    
    console.log('✅ Stock monitoring initialized');
  }
  
  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck() {
    try {
      const now = new Date();
      const health = {
        timestamp: now,
        issues: [],
        metrics: {}
      };
      
      // Check 1: Database connectivity
      const dbState = mongoose.connection.readyState;
      if (dbState !== 1) {
        health.issues.push({
          type: 'DATABASE_DISCONNECTED',
          severity: 'CRITICAL',
          message: 'Database connection lost'
        });
      }
      
      // Check 2: Reservation system health
      const activeReservations = await StockReservation.countDocuments({
        status: 'reserved',
        expiresAt: { $gt: now }
      });
      
      const expiredReservations = await StockReservation.countDocuments({
        status: 'reserved',
        expiresAt: { $lt: now }
      });
      
      health.metrics.reservations = {
        active: activeReservations,
        expired: expiredReservations,
        healthScore: expiredReservations > 10 ? 'POOR' : activeReservations > 50 ? 'FAIR' : 'GOOD'
      };
      
      // Check 3: Stock consistency
      const stockIssues = await this.checkStockConsistency();
      health.issues.push(...stockIssues);
      
      // Check 4: Performance metrics
      const recentReservations = await StockReservation.find({
        createdAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } // Last hour
      });
      
      health.metrics.performance = {
        reservationsPerHour: recentReservations.length,
        averageReservationTime: this.calculateAverageReservationTime(recentReservations),
        errorRate: this.calculateErrorRate(recentReservations)
      };
      
      // Alert on critical issues
      const criticalIssues = health.issues.filter(issue => issue.severity === 'CRITICAL');
      if (criticalIssues.length > 0) {
        this.sendAlert('CRITICAL', criticalIssues);
      }
      
      // Log health status
      console.log('📊 Stock Health Check:', {
        reservations: health.metrics.reservations,
        performance: health.metrics.performance,
        issues: health.issues.length
      });
      
      this.lastCheck = now;
      
    } catch (error) {
      console.error('❌ Health check error:', error);
      this.sendAlert('ERROR', [{
        type: 'HEALTH_CHECK_FAILED',
        message: error.message
      }]);
    }
  }
  
  /**
   * Check for out-of-stock products that need attention
   */
  static async checkOutOfStockProducts() {
    try {
      const outOfStockProducts = await Promise.all([
        Product.find({ stock: 0 }).select('name sku'),
        VendorProduct.find({ stock: 0 }).select('name sku')
      ]);
      
      const allOutOfStock = [...outOfStockProducts[0], ...outOfStockProducts[1]];
      
      if (allOutOfStock.length > 0) {
        console.log(`⚠️ ${allOutOfStock.length} products out of stock`);
        
        // Alert if this is a new issue
        if (allOutOfStock.length > 5) {
          this.sendAlert('WARNING', [{
            type: 'HIGH_OUT_OF_STOCK',
            message: `${allOutOfStock.length} products are out of stock`,
            data: { count: allOutOfStock.length, products: allOutOfStock.slice(0, 5) }
          }]);
        }
      }
      
    } catch (error) {
      console.error('❌ Out-of-stock check error:', error);
    }
  }
  
  /**
   * Check for abnormal reservation patterns
   */
  static async checkAbnormalPatterns() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Check for rapid reservations from same user
      const rapidReservations = await StockReservation.aggregate([
        {
          $match: {
            createdAt: { $gte: oneHourAgo },
            status: 'reserved'
          }
        },
        {
          $group: {
            _id: '$user',
            count: { $sum: 1 },
            reservations: { $push: '$reservationToken' }
          }
        },
        {
          $match: {
            count: { $gt: 10 } // More than 10 reservations in 1 hour
          }
        }
      ]);
      
      if (rapidReservations.length > 0) {
        console.log('🚨 Abnormal reservation pattern detected:', rapidReservations);
        
        this.sendAlert('WARNING', rapidReservations.map(user => ({
          type: 'RAPID_RESERVATIONS',
          message: `User ${user._id} made ${user.count} reservations in 1 hour`,
          data: { userId: user._id, count: user.count }
        })));
      }
      
      // Check for high failure rate
      const failedReservations = await StockReservation.countDocuments({
        status: { $in: ['expired', 'cancelled'] },
        createdAt: { $gte: oneHourAgo }
      });
      
      const totalReservations = await StockReservation.countDocuments({
        createdAt: { $gte: oneHourAgo }
      });
      
      const failureRate = totalReservations > 0 ? (failedReservations / totalReservations) * 100 : 0;
      
      if (failureRate > 30) { // More than 30% failure rate
        this.sendAlert('WARNING', [{
          type: 'HIGH_FAILURE_RATE',
          message: `Reservation failure rate: ${failureRate.toFixed(1)}%`,
          data: { failureRate, failed: failedReservations, total: totalReservations }
        }]);
      }
      
    } catch (error) {
      console.error('❌ Pattern check error:', error);
    }
  }
  
  /**
   * Check stock consistency across products
   */
  static async checkStockConsistency() {
    const issues = [];
    
    // Find products with inconsistent stock
    const inconsistentProducts = await Promise.all([
      Product.find({
        $expr: { $gt: ['$reservedStock', '$stock'] }
      }).select('name stock reservedStock'),
      VendorProduct.find({
        $expr: { $gt: ['$reservedStock', '$stock'] }
      }).select('name stock reservedStock')
    ]);
    
    [...inconsistentProducts[0], ...inconsistentProducts[1]].forEach(product => {
      issues.push({
        type: 'STOCK_INCONSISTENCY',
        severity: 'HIGH',
        productId: product._id,
        productName: product.name,
        message: `Reserved stock (${product.reservedStock}) exceeds actual stock (${product.stock})`
      });
    });
    
    return issues;
  }
  
  /**
   * Send alert (console, email, webhook, etc.)
   */
  static sendAlert(level, issues) {
    const alert = {
      timestamp: new Date(),
      level,
      issues,
      id: this.generateAlertId()
    };
    
    // Store alert
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    // Log alert
    console.log(`🚨 STOCK ALERT [${level}]:`, {
      id: alert.id,
      issues: issues.length,
      timestamp: alert.timestamp
    });
    
    issues.forEach(issue => {
      console.log(`  ❌ ${issue.type}: ${issue.message}`);
    });
    
    // TODO: Add email/webhook notifications here
    // await this.sendEmailAlert(alert);
    // await this.sendWebhookAlert(alert);
  }
  
  /**
   * Calculate average reservation time
   */
  static calculateAverageReservationTime(reservations) {
    if (reservations.length === 0) return 0;
    
    const totalTime = reservations.reduce((sum, res) => {
      if (res.confirmedAt && res.createdAt) {
        return sum + (res.confirmedAt.getTime() - res.createdAt.getTime());
      }
      return sum;
    }, 0);
    
    return totalTime / reservations.length / (1000 * 60); // minutes
  }
  
  /**
   * Calculate error rate
   */
  static calculateErrorRate(reservations) {
    if (reservations.length === 0) return 0;
    
    const failedCount = reservations.filter(res => 
      ['expired', 'cancelled'].includes(res.status)
    ).length;
    
    return (failedCount / reservations.length) * 100;
  }
  
  /**
   * Generate unique alert ID
   */
  static generateAlertId() {
    return 'ALERT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }
  
  /**
   * Get current monitoring status
   */
  static getMonitoringStatus() {
    return {
      uptime: Date.now() - this.lastCheck.getTime(),
      alertCount: this.alerts.length,
      recentAlerts: this.alerts.slice(-10),
      lastCheck: this.lastCheck
    };
  }
}

module.exports = StockMonitoringService;
