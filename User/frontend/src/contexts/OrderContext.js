import React, { createContext, useContext, useState, useCallback } from "react";
import orderService from "../services/orderService";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add new order to the list
  const addOrder = useCallback((newOrder) => {
    console.log("OrderContext - Adding new order:", newOrder);
    setAllOrders((prevOrders) => [newOrder, ...prevOrders]);
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
  }, []);

  // Refresh all orders from backend
  const refreshOrders = useCallback(async () => {
    try {
      console.log("OrderContext - Refreshing orders from backend");
      const response = await orderService.getOrders();

      let ordersArray = [];
      if (response.orders && Array.isArray(response.orders)) {
        ordersArray = response.orders;
      } else if (response.data && response.data.orders) {
        ordersArray = response.data.orders;
      } else if (Array.isArray(response.data)) {
        ordersArray = response.data;
      } else if (Array.isArray(response)) {
        ordersArray = response;
      }

      // Ensure status exists
      ordersArray = ordersArray.map((order) => ({
        ...order,
        status: order.status || "pending",
      }));

      setAllOrders(ordersArray);
      console.log("OrderContext - Orders refreshed:", ordersArray.length);
      
      // Trigger refresh in components watching this
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("OrderContext - Error refreshing orders:", error);
    }
  }, []);

  // Force refetch by incrementing trigger
  const forceRefresh = useCallback(() => {
    console.log("OrderContext - Force refresh triggered");
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const value = {
    orders,
    setOrders,
    allOrders,
    setAllOrders,
    addOrder,
    refreshOrders,
    forceRefresh,
    refreshTrigger,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
};
