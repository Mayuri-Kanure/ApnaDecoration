const mongoose = require("mongoose");
const { Order, StockReservation, Product, VendorProduct } = require("../models");
const InventoryService = require("./inventoryService");

/**
 * INVENTORY-INTEGRATED ORDER SERVICE
 * Manages orders with stock reservation workflow
 * Integrates with InventoryService for atomic operations
 */

class InventoryOrderService {
  /**
   * STEP 1: INITIALIZE CHECKOUT
   * Reserve stock for items user is about to checkout
   * Returns reservation token that must be used at payment
   */
  static async initializeCheckout(userId, items) {
    try {
      // Validate and reserve stock
      const reservation = await InventoryService.reserveStock(userId, items);

      if (!reservation.success) {
        return {
          success: false,
          error: reservation.error,
          code: "STOCK_UNAVAILABLE",
        };
      }

      return {
        success: true,
        reservationToken: reservation.reservationToken,
        expiresAt: reservation.expiresAt,
        expiresIn: 600, // 10 minutes in seconds
        message: "Stock reserved. Proceed to payment.",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: "RESERVATION_ERROR",
      };
    }
  }

  /**
   * STEP 2: CREATE ORDER
   * Create order document in database
   * Called BEFORE payment is processed
   */
  static async createOrder(orderData, userId) {
    try {
      const { items, shippingAddress, billingAddress, notes } = orderData;

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`;

      const order = new Order({
        orderNumber,
        user: userId,
        items,
        shippingAddress,
        billingAddress,
        notes,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: orderData.paymentMethod || "razorpay",
        pricing: orderData.pricing,
        type: "product",
      });

      const savedOrder = await order.save();

      return {
        success: true,
        orderId: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        message: "Order created. Proceed to payment.",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: "ORDER_CREATION_ERROR",
      };
    }
  }

  /**
   * STEP 3: CONFIRM PAYMENT (Success)
   * Called after payment is confirmed
   * Moves stock from reserved to sold
   */
  static async confirmPayment(orderId, reservationToken) {
    try {
      // Get reservation
      const reservation = await StockReservation.findOne({
        reservationToken,
      });

      if (!reservation) {
        return {
          success: false,
          error: "Reservation not found",
          code: "INVALID_RESERVATION",
        };
      }

      // Confirm the order in inventory (deduct actual stock)
      const confirmation = await InventoryService.confirmOrder(
        reservationToken,
        orderId,
      );

      if (!confirmation.success) {
        return {
          success: false,
          error: confirmation.error,
          code: "CONFIRMATION_FAILED",
        };
      }

      // Update order status
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          status: "confirmed",
          paymentStatus: "paid",
          paymentDetails: {
            ...this.paymentDetails,
            status: "captured",
            captured_at: new Date(),
          },
        },
        { new: true },
      );

      return {
        success: true,
        order: updatedOrder,
        message: "Payment confirmed and stock deducted",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: "PAYMENT_CONFIRMATION_ERROR",
      };
    }
  }

  /**
   * STEP 4a: PAYMENT FAILED
   * Release reserved stock if payment fails
   */
  static async handlePaymentFailure(orderId, reservationToken) {
    try {
      // Release reserved stock
      const release = await InventoryService.releaseStock(reservationToken);

      if (!release.success) {
        console.error("❌ Failed to release stock:", release.error);
      }

      // Update order status
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          status: "failed",
          paymentStatus: "failed",
          notes: {
            internal: "Payment failed - stock released",
          },
        },
        { new: true },
      );

      return {
        success: true,
        order: updatedOrder,
        message: "Payment failed and stock released",
      };
    } catch (error) {
      console.error("❌ Payment failure handling error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * STEP 4b: USER ABANDONS CHECKOUT
   * Release stock if user leaves without completing payment
   */
  static async abandonCheckout(reservationToken) {
    try {
      const release = await InventoryService.releaseStock(reservationToken);

      if (!release.success) {
        return {
          success: false,
          error: release.error,
        };
      }

      return {
        success: true,
        message: "Checkout abandoned - stock released",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * CANCEL CONFIRMED ORDER
   * Called by user to cancel after payment
   * Returns stock to inventory
   */
  static async cancelOrder(orderId, reason = "Customer request") {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error("Order not found");
      }

      // Validate order can be cancelled
      const nonCancellableStatuses = [
        "delivered",
        "out-for-delivery",
        "cancelled",
      ];
      if (nonCancellableStatuses.includes(order.status)) {
        throw new Error(
          `Cannot cancel ${order.status} order. Contact customer support.`,
        );
      }

      // Return stock for each item
      for (const item of order.items) {
        const updateData = {
          $inc: {
            stock: item.quantity, // Return to available stock
            reservedStock: 0, // No reservation anymore
            soldStock: -item.quantity, // Decrement sold
          },
        };

        const Model =
          item.productModel === "VendorProduct" ? VendorProduct : Product;

        const result = await Model.findByIdAndUpdate(
          item.product,
          updateData,
          { session, new: true },
        );

        if (!result) {
          throw new Error(`Failed to return stock for product ${item.product}`);
        }
      }

      // Update order
      order.status = "cancelled";
      order.paymentStatus = "refunded";
      order.notes = order.notes || {};
      order.notes.internal = `Cancelled: ${reason}`;

      await order.save({ session });
      await session.commitTransaction();

      return {
        success: true,
        order,
        message: "Order cancelled and stock returned",
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
   * GET INVENTORY SNAPSHOT FOR ORDER
   * Returns stock info for order validation
   */
  static async getOrderInventoryStatus(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate("items.product", "name stock reservedStock soldStock")
        .populate("user", "name email");

      if (!order) {
        return {
          success: false,
          error: "Order not found",
        };
      }

      const inventoryStatus = order.items.map((item) => ({
        product: item.product?.name || "Unknown",
        productId: item.product?._id,
        ordered: item.quantity,
        currentStock: item.product?.stock || 0,
        reserved: item.product?.reservedStock || 0,
        sold: item.product?.soldStock || 0,
        available: Math.max(
          0,
          (item.product?.stock || 0) -
            (item.product?.reservedStock || 0),
        ),
      }));

      return {
        success: true,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        inventoryStatus,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * VALIDATE RESERVATION BEFORE CREATING ORDER
   * Check if reservation is still valid and not expired
   */
  static async validateReservation(userId, reservationToken) {
    try {
      const reservation = await StockReservation.findOne({
        reservationToken,
        user: userId,
        status: "reserved",
      });

      if (!reservation) {
        return {
          valid: false,
          error: "Reservation not found or already processed",
        };
      }

      if (new Date() > reservation.expiresAt) {
        // Auto-release expired
        await InventoryService.releaseStock(reservationToken);
        return {
          valid: false,
          error: "Reservation expired",
        };
      }

      return {
        valid: true,
        reservation,
        expiresIn: Math.round(
          (reservation.expiresAt - new Date()) / 1000,
        ), // seconds
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

module.exports = InventoryOrderService;
