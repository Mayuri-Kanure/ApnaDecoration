/**
 * ENHANCED CHECKOUT FLOW WITH INVENTORY RESERVATION
 * 
 * This is the production-ready checkout flow that integrates
 * with the inventory reservation system.
 * 
 * Flow:
 * 1. User validates cart items (check availability)
 * 2. User submits checkout (creates order + reserves stock)
 * 3. User pays (Razorpay or COD)
 * 4. Payment confirmed → Stock is deducted
 * 5. If payment fails → Stock is auto-released
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import InventoryCheckoutService from "../services/inventoryCheckoutService";
import InventoryOrderService from "../services/inventoryOrderService";

const EnhancedCheckoutFlow = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  // Reservation state
  const [reservation, setReservation] = useState(null);
  const [reservationValid, setReservationValid] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);
  const [stockError, setStockError] = useState(null);

  // Order state
  const [createdOrder, setCreatedOrder] = useState(null);
  const [processing, setProcessing] = useState(false);

  /**
   * STEP 1: VALIDATE CART ITEMS
   * Called when user first opens checkout or manually
   * Checks all items have sufficient stock
   */
  const validateCartItems = async () => {
    setCheckingStock(true);
    setStockError(null);

    try {
      const items = cartItems.map((item) => ({
        product: item._id || item.productId,
        productModel: item.productModel || "Product",
        quantity: item.quantity,
      }));

      const validation = await InventoryCheckoutService.checkBatchAvailability(
        items,
      );

      if (!validation.allAvailable) {
        const failed = validation.validations.filter((v) => !v.isAvailable);
        setStockError({
          message: "Some items are not available",
          items: failed,
        });
        return false;
      }

      return true;
    } catch (error) {
      setStockError({
        message: "Failed to validate stock",
      });
      return false;
    } finally {
      setCheckingStock(false);
    }
  };

  /**
   * STEP 2: RESERVE STOCK
   * Called when user clicks "Proceed to Payment"
   * Reserves stock for 10 minutes (gives user time to pay)
   */
  const reserveStockForCheckout = async () => {
    setCheckingStock(true);
    setStockError(null);

    try {
      const items = cartItems.map((item) => ({
        product: item._id || item.productId,
        productModel: item.productModel || "Product",
        quantity: item.quantity,
      }));

      const reservationResult = await InventoryCheckoutService.reserveStock(
        items,
      );

      if (!reservationResult.success) {
        setStockError({
          message:
            reservationResult.error ||
            "Failed to reserve stock. Please try again.",
          details: reservationResult.details,
        });
        return false;
      }

      // Save reservation for later use
      setReservation({
        token: reservationResult.reservationToken,
        expiresAt: reservationResult.expiresAt,
        expiresIn: reservationResult.expiresIn,
      });

      setReservationValid(true);
      return reservationResult.reservationToken;
    } catch (error) {
      setStockError({
        message: "Stock reservation failed",
      });
      return false;
    } finally {
      setCheckingStock(false);
    }
  };

  /**
   * STEP 3: CREATE ORDER
   * After stock is reserved, create the actual order
   * Returns orderId which is needed for confirmation
   */
  const createOrderRecord = async (orderData, reservationToken) => {
    try {
      setProcessing(true);

      // This calls your existing order creation endpoint
      // or the new InventoryOrderService
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...orderData,
          reservationToken, // Important: Include token for later confirmation
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      setCreatedOrder({
        id: data.order._id,
        number: data.order.orderNumber,
        reservationToken,
      });

      return data.order._id;
    } catch (error) {
      setStockError({
        message: "Order creation failed",
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  /**
   * STEP 4: PAYMENT SUCCESS
   * Called after payment is confirmed (Razorpay or COD)
   * Confirms the reservation and deducts stock
   */
  const confirmPaymentAndStock = async () => {
    if (!createdOrder || !reservation) {
      setStockError({
        message: "Order or reservation information missing",
      });
      return false;
    }

    try {
      setProcessing(true);

      // Confirm the reservation (permanent stock deduction)
      const confirmation = await InventoryCheckoutService.confirmOrder(
        reservation.token,
        createdOrder.id,
      );

      if (!confirmation.success) {
        throw new Error(confirmation.error);
      }

      // Order successful!
      clearCart();
      return true;
    } catch (error) {
      setStockError({
        message: "Payment confirmation failed",
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  /**
   * STEP 5: PAYMENT FAILED
   * Release the reservation if payment fails
   */
  const handlePaymentFailure = async (errorMessage) => {
    if (reservation) {
      // Release the reserved stock
      await InventoryCheckoutService.releaseReservation(reservation.token);
    }

    setStockError({
      message: errorMessage || "Payment failed",
    });

    // Order can still be retried
  };

  /**
   * STEP 6: ABANDON CHECKOUT
   * If user leaves without completing payment within 10 minutes
   * Stock is auto-released by the cleanup job
   * Manual release for immediate UX
   */
  const handleAbandonCheckout = async () => {
    if (reservation) {
      await InventoryCheckoutService.releaseReservation(reservation.token);
    }

    navigate("/cart");
  };

  /**
   * CHECK RESERVATION VALIDITY
   * Call this periodically or before payment
   */
  const checkReservationStatus = async () => {
    if (!reservation) return false;

    const timeRemaining =
      new Date(reservation.expiresAt) - new Date();

    if (timeRemaining <= 0) {
      setReservationValid(false);
      setStockError({
        message: "Reservation expired. Please try again.",
      });
      return false;
    }

    setReservationValid(true);
    return true;
  };

  // Monitor reservation validity
  useEffect(() => {
    if (reservation) {
      const interval = setInterval(checkReservationStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [reservation]);

  return {
    // State
    reservation,
    reservationValid,
    createdOrder,
    checkingStock,
    processing,
    stockError,

    // Methods
    validateCartItems,
    reserveStockForCheckout,
    createOrderRecord,
    confirmPaymentAndStock,
    handlePaymentFailure,
    handleAbandonCheckout,
    checkReservationStatus,
  };
};

export default EnhancedCheckoutFlow;

/**
 * ====== USAGE EXAMPLE IN CHECKOUT PAGE ======
 *
 * const Checkout = () => {
 *   const checkoutFlow = useEnhancedCheckoutFlow();
 *   const { cartItems } = useCart();
 *
 *   // On page load: Validate cart
 *   useEffect(() => {
 *     checkoutFlow.validateCartItems();
 *   }, []);
 *
 *   // When user clicks "Proceed to Payment"
 *   const handleProceedToPayment = async () => {
 *     const token = await checkoutFlow.reserveStockForCheckout();
 *     if (!token) {
 *       showError(checkoutFlow.stockError.message);
 *       return;
 *     }
 *
 *     // Create order
 *     const orderId = await checkoutFlow.createOrderRecord(orderData, token);
 *
 *     // Proceed to payment page
 *   };
 *
 *   // After payment success (Razorpay callback)
 *   const handlePaymentSuccess = async (paymentResult) => {
 *     const confirmed = await checkoutFlow.confirmPaymentAndStock();
 *     if (confirmed) {
 *       navigate("/order-success");
 *     }
 *   };
 *
 *   // On payment failure
 *   const handlePaymentError = async (error) => {
 *     await checkoutFlow.handlePaymentFailure(error.message);
 *   };
 *
 *   return (
 *     <div>
 *       {checkoutFlow.stockError && (
 *         <ErrorAlert message={checkoutFlow.stockError.message} />
 *       )}
 *
 *       <StockStatus items={cartItems} />
 *
 *       {checkoutFlow.reservationValid && (
 *         <ReservationTimer expiresAt={checkoutFlow.reservation.expiresAt} />
 *       )}
 *
 *       <button onClick={handleProceedToPayment} disabled={checkoutFlow.checkingStock}>
 *         Proceed to Payment ({checkoutFlow.reservation && `${checkoutFlow.reservation.expiresIn}m left`})
 *       </button>
 *     </div>
 *   );
 * };
 */
