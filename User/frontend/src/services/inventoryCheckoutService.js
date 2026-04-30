/**
 * INVENTORY CHECKOUT SERVICE
 * Frontend service for cart sync and checkout reservation flow
 */

import { API_BASE_URL } from "../config/constants";

class InventoryCheckoutService {
  /**
   * CHECK SINGLE PRODUCT AVAILABILITY
   */
  static async checkProductAvailability(productId, productModel = "Product") {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/inventory/status/${productId}?model=${productModel}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("❌ Availability check failed:", error);
      return {
        available: false,
        error: "Failed to check availability",
      };
    }
  }

  /**
   * CHECK BATCH AVAILABILITY
   */
  static async checkBatchAvailability(items) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/inventory/check-availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({ items }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("❌ Batch check failed:", error);
      return {
        allAvailable: false,
        error: "Failed to check availability",
      };
    }
  }

  /**
   * STEP 1: RESERVE STOCK (User About to Pay)
   */
  static async reserveStock(items) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return {
          success: false,
          error: "Authentication required",
        };
      }

      const response = await fetch(`${API_BASE_URL}/inventory/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.details ||
            data.error ||
            "Failed to reserve stock",
          details: data.details,
        };
      }

      return {
        success: true,
        reservationToken: data.data.reservationToken,
        expiresAt: data.data.expiresAt,
        expiresIn: 600, // 10 minutes
      };
    } catch (error) {
      console.error("❌ Reservation failed:", error);
      return {
        success: false,
        error: "Failed to reserve stock",
      };
    }
  }

  /**
   * STEP 2: CONFIRM ORDER (Payment Success)
   */
  static async confirmOrder(reservationToken, orderId) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/inventory/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          reservationToken,
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Failed to confirm order",
        };
      }

      return {
        success: true,
        message: data.data.message,
      };
    } catch (error) {
      console.error("❌ Order confirmation failed:", error);
      return {
        success: false,
        error: "Failed to confirm order",
      };
    }
  }

  /**
   * STEP 3: RELEASE STOCK (Payment Failed or Abandoned)
   */
  static async releaseReservation(reservationToken) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/inventory/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ reservationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn("⚠️ Stock release warning:", data.error);
      }

      return {
        success: true,
        message:
          data.data?.message ||
          "Reservation released",
      };
    } catch (error) {
      console.error("⚠️ Release failed (non-critical):", error);
      return { success: true }; // Don't block if release fails
    }
  }

  /**
   * SYNC CART WITH BACKEND
   * Check all items availability and auto-adjust quantities
   */
  static async syncCart(cartItems) {
    try {
      const items = cartItems.map((item) => ({
        product: item.productId || item._id,
        productModel: item.productModel || "Product",
        quantity: item.quantity,
      }));

      const availability = await this.checkBatchAvailability(items);

      if (!availability.allAvailable) {
        const result = {
          needsSync: true,
          validItems: [],
          invalidItems: [],
          adjustments: [],
        };

        availability.validations.forEach((validation) => {
          const cartItem = cartItems.find(
            (ci) =>
              (ci.productId || ci._id).toString() ===
              validation.product.toString(),
          );

          if (validation.isAvailable) {
            result.validItems.push(validation.product.toString());
          } else if (validation.availableStock > 0) {
            result.adjustments.push({
              productId: validation.product.toString(),
              oldQuantity: validation.requestedQuantity,
              newQuantity: validation.availableStock,
              productName: cartItem?.name || "Product",
            });
          } else {
            result.invalidItems.push({
              productId: validation.product.toString(),
              productName: cartItem?.name || "Product",
            });
          }
        });

        return result;
      }

      return {
        needsSync: false,
        validItems: items.map((i) => i.product.toString()),
      };
    } catch (error) {
      console.error("❌ Cart sync failed:", error);
      return {
        needsSync: false,
        error: "Could not sync cart",
      };
    }
  }

  /**
   * GET STOCK STATUS FOR DISPLAY
   */
  static async getStockDisplay(productId, productModel = "Product") {
    try {
      const availability = await this.checkProductAvailability(
        productId,
        productModel,
      );

      if (!availability.available) {
        return {
          inStock: false,
          displayText: "Out of stock",
          cssClass: "bg-red-100 text-red-800",
        };
      }

      const available = availability.stock;

      if (available > 10) {
        return {
          inStock: true,
          available,
          displayText: `In stock`,
          cssClass: "text-green-600",
        };
      }

      if (available > 5) {
        return {
          inStock: true,
          available,
          displayText: `⚠️ Limited stock (${available} left)`,
          cssClass: "text-yellow-600",
        };
      }

      return {
        inStock: true,
        available,
        displayText: `🔴 Only ${available} left!`,
        cssClass: "text-red-600 font-bold",
      };
    } catch (error) {
      return {
        inStock: false,
        displayText: "Unable to check stock",
      };
    }
  }

  /**
   * VALIDATE CART BEFORE PAYMENT
   */
  static async validateForPayment(cartItems) {
    const items = cartItems.map((item) => ({
      product: item.productId || item._id,
      productModel: item.productModel || "Product",
      quantity: item.quantity,
    }));

    const availability = await this.checkBatchAvailability(items);

    return {
      canProceed: availability.allAvailable,
      validation: availability,
    };
  }
}

export default InventoryCheckoutService;
