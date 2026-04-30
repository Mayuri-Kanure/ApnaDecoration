/**
 * IDEMPOTENT RESERVATION SERVICE
 * Prevents duplicate reservations and ensures exactly-once semantics
 */

const mongoose = require('mongoose');
const { StockReservation } = require('../models');
const crypto = require('crypto');

class IdempotentReservationService {
  
  /**
   * Generate idempotency key for reservation request
   * @param {string} userId - User ID
   * @param {Array} items - Items being reserved
   * @returns {string} - Unique idempotency key
   */
  static generateIdempotencyKey(userId, items) {
    const itemsHash = items
      .map(item => `${item.product}:${item.quantity}:${item.productModel}`)
      .sort()
      .join('|');
    
    const payload = `${userId}:${itemsHash}:${Date.now()}`;
    return crypto.createHash('sha256').update(payload).digest('hex').substring(0, 16);
  }
  
  /**
   * Check if reservation already exists for this idempotency key
   * @param {string} idempotencyKey - Key to check
   * @returns {Promise<Object>} - { exists, reservation }
   */
  static async checkExistingReservation(idempotencyKey) {
    try {
      const reservation = await StockReservation.findOne({
        idempotencyKey,
        status: { $in: ['reserved', 'confirmed'] }
      });
      
      return {
        exists: !!reservation,
        reservation
      };
      
    } catch (error) {
      console.error('Error checking existing reservation:', error);
      return { exists: false, reservation: null };
    }
  }
  
  /**
   * Create reservation with idempotency protection
   * @param {string} userId - User ID
   * @param {Array} items - Items to reserve
   * @param {string} idempotencyKey - Optional client-provided key
   * @returns {Promise<Object>} - { success, reservation, error }
   */
  static async createIdempotentReservation(userId, items, idempotencyKey = null) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Generate or use provided idempotency key
      const finalIdempotencyKey = idempotencyKey || this.generateIdempotencyKey(userId, items);
      
      // Check for existing reservation
      const existing = await StockReservation.findOne({
        idempotencyKey,
        status: { $in: ['reserved', 'confirmed'] }
      }).session(session);
      
      if (existing) {
        await session.abortTransaction();
        console.log(`🔄 Idempotent: Returning existing reservation ${existing.reservationToken}`);
        
        return {
          success: true,
          reservation: existing,
          isExisting: true,
          message: 'Reservation already exists'
        };
      }
      
      // Create new reservation with idempotency key
      const reservationToken = this._generateToken();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      const reservation = new StockReservation({
        user: userId,
        items,
        reservationToken,
        idempotencyKey: finalIdempotencyKey,
        status: 'reserved',
        expiresAt,
        metadata: {
          source: 'checkout_idempotent',
          clientProvidedKey: !!idempotencyKey
        }
      });
      
      await reservation.save({ session });
      await session.commitTransaction();
      
      console.log(`✅ Created idempotent reservation: ${reservationToken}`);
      
      return {
        success: true,
        reservation,
        isExisting: false,
        reservationToken,
        expiresAt
      };
      
    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Idempotent reservation error:', error);
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      session.endSession();
    }
  }
  
  /**
   * Safe reservation with retry protection
   * @param {string} userId - User ID
   * @param {Array} items - Items to reserve
   * @param {string} idempotencyKey - Optional key
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<Object>} - Reservation result
   */
  static async safeReserveWithRetry(userId, items, idempotencyKey = null, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Reservation attempt ${attempt}/${maxRetries}`);
      
      try {
        const result = await this.createIdempotentReservation(userId, items, idempotencyKey);
        
        if (result.success) {
          console.log(`✅ Reservation succeeded on attempt ${attempt}`);
          return result;
        }
        
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        // Don't retry on certain errors
        if (error.message.includes('Insufficient stock') || 
            error.message.includes('Product not found')) {
          break;
        }
        
        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return {
      success: false,
      error: `Failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
      attempts: maxRetries
    };
  }
  
  /**
   * Validate reservation state consistency
   * @param {string} reservationToken - Reservation to validate
   * @returns {Promise<Object>} - { isValid, issues }
   */
  static async validateReservationState(reservationToken) {
    try {
      const reservation = await StockReservation.findOne({ reservationToken });
      
      if (!reservation) {
        return {
          isValid: false,
          issues: ['Reservation not found']
        };
      }
      
      const issues = [];
      
      // Check expiration
      if (reservation.expiresAt < new Date()) {
        issues.push('Reservation expired');
      }
      
      // Check status
      if (!['reserved', 'confirmed'].includes(reservation.status)) {
        issues.push(`Invalid status: ${reservation.status}`);
      }
      
      // Check for data integrity
      if (!reservation.items || reservation.items.length === 0) {
        issues.push('No items in reservation');
      }
      
      return {
        isValid: issues.length === 0,
        issues,
        reservation
      };
      
    } catch (error) {
      console.error('Error validating reservation state:', error);
      return {
        isValid: false,
        issues: ['Validation error']
      };
    }
  }
  
  /**
   * Generate secure reservation token
   * @private
   */
  static _generateToken() {
    return 'RSV_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex').toUpperCase();
  }
}

module.exports = IdempotentReservationService;
