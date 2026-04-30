const mongoose = require("mongoose");
const { Product, VendorProduct, StockReservation } = require("../models");

/**
 * PRODUCTION-GRADE INVENTORY SERVICE
 * Handles stock reservation, confirmation, and release
 * Uses atomic MongoDB queries to prevent race conditions
 */

class InventoryService {
  /**
   * STAGE 1: Reserve Stock (Temporary Lock for 10 minutes)
   * Called when user clicks "Place Order"
   * Returns reservation token for later confirmation/release
   */
  static async reserveStock(userId, items) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate all items have sufficient stock
      for (const item of items) {
        const product = await this._getProduct(item.product, item.productModel);

        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }

        const availableStock = product.stock - (product.reservedStock || 0);

        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`,
          );
        }
      }

      // Reserve stock for all items (atomic operation)
      for (const item of items) {
        const updateQuery = {
          _id: item.product,
          stock: { $gte: item.quantity }, // Ensure stock is available
        };

        const updateData = {
          $inc: { reservedStock: item.quantity }, // Lock the stock temporarily
        };

        const result =
          item.productModel === "VendorProduct"
            ? await VendorProduct.findOneAndUpdate(updateQuery, updateData, {
                new: true,
                session,
              })
            : await Product.findOneAndUpdate(updateQuery, updateData, {
                new: true,
                session,
              });

        if (!result) {
          throw new Error(
            `Failed to reserve stock for product ${item.product}. Stock may have changed.`,
          );
        }
      }

      // Create reservation record
      const reservationToken = this._generateToken();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const reservation = new StockReservation({
        user: userId,
        items,
        reservationToken,
        status: "reserved",
        expiresAt,
      });

      await reservation.save({ session });
      await session.commitTransaction();

      return {
        success: true,
        reservationToken,
        expiresAt,
        message: "Stock reserved successfully",
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        error: error.message,
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * STAGE 2: Confirm Order (Deduct Actual Stock)
   * Called after payment success (Razorpay/COD confirmed)
   * Permanent deduction from stock
   */
  static async confirmOrder(reservationToken, orderId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get reservation
      const reservation = await StockReservation.findOne({
        reservationToken,
        status: "reserved",
      }).session(session);

      if (!reservation) {
        throw new Error(
          "Reservation not found or already processed. Reservation may have expired.",
        );
      }

      // Check if reservation has expired
      if (new Date() > reservation.expiresAt) {
        // Automatically release stock
        await this._releaseReservation(reservation, "expired", session);
        throw new Error(
          "Reservation has expired. Please try ordering again.",
        );
      }

      // Confirm all items (atomic deduction)
      for (const item of reservation.items) {
        const updateQuery = {
          _id: item.product,
          reservedStock: { $gte: item.quantity }, // Ensure reserved stock exists
        };

        const updateData = {
          $inc: {
            stock: -item.quantity, // Deduct from actual stock
            reservedStock: -item.quantity, // Release the temporary lock
            soldStock: item.quantity, // Increment sold count
          },
        };

        const result =
          item.productModel === "VendorProduct"
            ? await VendorProduct.findOneAndUpdate(updateQuery, updateData, {
                new: true,
                session,
              })
            : await Product.findOneAndUpdate(updateQuery, updateData, {
                new: true,
                session,
              });

        if (!result) {
          throw new Error(
            `Failed to confirm stock for product ${item.product}`,
          );
        }

        // Prevent negative stock (safeguard)
        if (result.stock < 0) {
          throw new Error(
            `Critical error: Stock became negative for ${result.name}`,
          );
        }
      }

      // Update reservation status
      reservation.status = "confirmed";
      reservation.confirmedAt = new Date();
      reservation.order = orderId;
      await reservation.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        message: "Order confirmed and stock deducted",
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        error: error.message,
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * STAGE 3: Release Stock (Timeout / User Abandonment)
   * Called when user abandons checkout or payment fails
   * Returns reserved stock to available pool
   */
  static async releaseStock(reservationToken) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservation = await StockReservation.findOne({
        reservationToken,
      }).session(session);

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      if (reservation.status === "confirmed") {
        throw new Error(
          "Cannot release confirmed order. Use order cancellation instead.",
        );
      }

      await this._releaseReservation(reservation, "released", session);
      await session.commitTransaction();

      return {
        success: true,
        message: "Stock released successfully",
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        error: error.message,
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * CHECK AVAILABLE STOCK
   * Returns availability for a product
   */
  static async checkAvailability(productId, productModel = "Product") {
    try {
      const product = await this._getProduct(productId, productModel);

      if (!product) {
        return {
          available: false,
          stock: 0,
          message: "Product not found",
        };
      }

      const availableStock = product.stock - (product.reservedStock || 0);

      return {
        available: availableStock > 0,
        stock: availableStock,
        totalStock: product.stock,
        reserved: product.reservedStock || 0,
        sold: product.soldStock || 0,
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * VALIDATE BATCH AVAILABILITY
   * Check multiple products at once
   */
  static async validateBatchAvailability(items) {
    try {
      const validations = [];

      for (const item of items) {
        const availability = await this.checkAvailability(
          item.product,
          item.productModel,
        );

        validations.push({
          product: item.product,
          productModel: item.productModel,
          requestedQuantity: item.quantity,
          availableStock: availability.stock || 0,
          isAvailable: availability.stock >= item.quantity,
          message: availability.stock >= item.quantity
            ? "OK"
            : `Only ${availability.stock} available`,
        });
      }

      const allAvailable = validations.every((v) => v.isAvailable);

      return {
        allAvailable,
        validations,
      };
    } catch (error) {
      return {
        allAvailable: false,
        error: error.message,
      };
    }
  }

  /**
   * GET INVENTORY STATUS
   * Admin dashboard - see overall inventory health
   */
  static async getInventoryStatus() {
    try {
      const [
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        lowStockProducts,
        totalReserved,
      ] = await Promise.all([
        Product.countDocuments({ status: "active" }),
        Product.countDocuments({ status: "active", stock: { $gt: 0 } }),
        Product.countDocuments({ stock: 0 }),
        Product.countDocuments({
          status: "active",
          stock: { $gt: 0, $lte: 5 },
        }),
        StockReservation.aggregate([
          { $match: { status: "reserved" } },
          {
            $group: {
              _id: null,
              totalReserved: { $sum: 1 },
              itemsReserved: { $sum: { $size: "$items" } },
            },
          },
        ]),
      ]);

      // Get low stock items with details
      const lowStockItems = await Product.find(
        { status: "active", stock: { $gt: 0, $lte: 5 } },
        { name: 1, stock: 1, reservedStock: 1, category: 1 },
      ).limit(20);

      return {
        summary: {
          totalProducts,
          inStockProducts,
          outOfStockProducts,
          lowStockProducts,
          lowStockPercentage: (lowStockProducts / totalProducts * 100).toFixed(2),
        },
        reservations: {
          activeReservations: totalReserved[0]?.totalReserved || 0,
          itemsReserved: totalReserved[0]?.itemsReserved || 0,
        },
        lowStockItems: lowStockItems.map((p) => ({
          id: p._id,
          name: p.name,
          available: p.stock - (p.reservedStock || 0),
          reserved: p.reservedStock || 0,
          total: p.stock,
        })),
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  /**
   * CLEANUP EXPIRED RESERVATIONS (Cron Job)
   * Run every 5 minutes to release expired reservations
   */
  static async cleanupExpiredReservations() {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const expiredReservations = await StockReservation.find({
        status: "reserved",
        expiresAt: { $lt: new Date() },
      }).session(session);

      console.log(
        `⏰ Cleanup: Found ${expiredReservations.length} expired reservations`,
      );

      for (const reservation of expiredReservations) {
        await this._releaseReservation(reservation, "expired", session);
      }

      await session.commitTransaction();

      return {
        success: true,
        cleaned: expiredReservations.length,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Cleanup failed:", error.message);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      session.endSession();
    }
  }

  // ====== HELPER METHODS ======

  /**
   * Get product from either Product or VendorProduct collection
   */
  static async _getProduct(productId, productModel = "Product") {
    const Model = productModel === "VendorProduct" ? VendorProduct : Product;
    return await Model.findById(productId);
  }

  /**
   * Internal method to release reservation and revert stock
   */
  static async _releaseReservation(reservation, status, session) {
    for (const item of reservation.items) {
      const updateData = {
        $inc: { reservedStock: -item.quantity }, // Release the lock
      };

      const Model =
        item.productModel === "VendorProduct" ? VendorProduct : Product;

      await Model.findByIdAndUpdate(item.product, updateData, {
        session,
      });
    }

    reservation.status = status;
    reservation.releasedAt = new Date();
    await reservation.save({ session });
  }

  /**
   * Generate unique reservation token
   */
  static _generateToken() {
    return `RSV_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  }
}

module.exports = InventoryService;
