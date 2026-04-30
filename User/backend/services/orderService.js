const { Order, Product, Service, User, VendorProduct } = require("../models");
const mongoose = require("mongoose");
const EnhancedOrderImageMigration = require("./enhancedOrderImageMigration");
const NotificationHelper = require("./notificationHelper");

// Import DeliveryOrder model from local models
const DeliveryOrder = require("../models/DeliveryOrder");

// Constants directly defined
const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

const ORDER_TYPE = {
  PRODUCT: "product",
  SERVICE: "service",
};

const PRODUCT_STATUS = {
  ACTIVE: "active",
  OUT_OF_STOCK: "out_of_stock",
};

class OrderService {
  // Create new order
  static async createOrder(orderData, userId) {
    console.log("🔍 OrderService.createOrder called with:", {
      orderData,
      userId,
    });

    const { items, shippingAddress, paymentMethod } = orderData;

    // Validate order data
    if (!items || items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    if (!shippingAddress) {
      throw new Error("Shipping address is required");
    }

    console.log("🔍 Order validation passed");

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = item.product;

      if (!productId) {
        console.error("Missing productId:", item);
        throw new Error("Product ID missing from frontend payload");
      }

      let product = await Product.findById(productId);

      // If not found in Product, try VendorProduct (same logic as cart)
      if (!product) {
        console.log(
          "📦 Product not found in Product model, trying VendorProduct for:",
          productId,
        );
        product = await VendorProduct.findById(productId);
        if (product) {
          console.log("📦 Found vendor product for order:", product.name);

          // Check stock availability
          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
            );
          }
        }
      } else {
        // Check stock availability for regular products
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }
      }

      if (!product) {
        console.log(
          "⚠️ Product not found, but continuing with order:",
          productId,
        );
        // Create a dummy product entry to avoid breaking the order
        const dummyProduct = {
          _id: productId,
          name: "Product " + productId,
          price: item.unitPrice || 0,
        };

        totalAmount += item.totalPrice || 0;

        orderItems.push({
          // Product reference (for admin use) - FIXED FIELD NAMES
          product: new mongoose.Types.ObjectId(productId),
          productModel: "Product",

          // Order quantities
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || 0,

          // PERFECT SNAPSHOT (production-ready)
          name: "Product " + productId,
          thumbnail: "/images/fallback-product.jpg",
          price: item.unitPrice || 0,
          sku: "N/A",
          description: "Product description not available",
          images: [],
          category: "Unknown",
          stock: 0,

          // Legacy snapshot for backward compatibility
          productSnapshot: {
            name: "Product " + productId,
            thumbnail: "/images/fallback-product.jpg",
            price: item.unitPrice || 0,
            sku: "N/A",
            description: "Product description not available",
            images: [],
            category: "Unknown",
            stock: 0,
          },
        });
        continue;
      }

      console.log("📦 Found product for order:", product.name);

      // ✅ CORRECT: Use frontend values, don't recalculate
      const itemTotal = item.totalPrice;
      totalAmount += itemTotal;

      if (!product?._id) {
        console.error("DEBUG PRODUCT:", product);
        console.error("PRODUCT ID MISSING BEFORE PUSH", {
          item,
          product,
          productId,
        });
        throw new Error(
          `Product ID missing for item: ${item.name || "Unknown"}`,
        );
      }

      const finalItem = {
        product: new mongoose.Types.ObjectId(product._id), // Ensure ObjectId
        productModel:
          product.constructor.modelName === "VendorProduct"
            ? "VendorProduct"
            : "Product",

        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,

        name: product.name,
        thumbnail: product.thumbnail,
        price: product.price,
        sku: product.sku,
        description: product.description,
        images: product.images || [],
        category: product.category,
        stock: product.stock,
      };

      orderItems.push(finalItem);

      console.log("FINAL ORDER ITEM:", orderItems[orderItems.length - 1]);
    }

    console.log(" Creating order with items:", orderItems.length);
    console.log("🔍 Total amount:", totalAmount);

    // 🔒 ATOMIC STOCK BLOCKING - Block stock BEFORE creating order
    console.log("🔒 Blocking stock for order items...");
    const stockBlockResults = [];

    for (const item of orderItems) {
      const productId = item.product.toString();
      const quantity = item.quantity;

      try {
        // Try Product model first
        let product = await Product.findById(productId);
        let modelType = "Product";

        if (!product) {
          // Try VendorProduct model
          product = await VendorProduct.findById(productId);
          modelType = "VendorProduct";
        }

        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }

        // Check stock availability one more time (race condition protection)
        if (product.stock < quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`,
          );
        }

        // Block stock atomically
        const updateQuery = {
          $inc: { stock: -quantity },
          $push: {
            blockedStock: {
              orderId: "pending", // Will be updated after order creation
              quantity: quantity,
              blockedAt: new Date(),
              reason: "order_creation",
            },
          },
        };

        let updatedProduct;
        if (modelType === "Product") {
          updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateQuery,
            { new: true },
          );
        } else {
          updatedProduct = await VendorProduct.findByIdAndUpdate(
            productId,
            updateQuery,
            { new: true },
          );
        }

        if (!updatedProduct) {
          throw new Error(`Failed to block stock for product: ${productId}`);
        }

        stockBlockResults.push({
          productId,
          modelType,
          quantity,
          previousStock: product.stock,
          newStock: updatedProduct.stock,
          success: true,
        });

        console.log(
          `🔒 Blocked ${quantity} units for ${product.name} (Stock: ${product.stock} → ${updatedProduct.stock})`,
        );
      } catch (stockError) {
        console.error(
          `❌ Failed to block stock for product ${productId}:`,
          stockError.message,
        );

        // Rollback any already blocked stock
        await this.rollbackBlockedStock(stockBlockResults);

        throw stockError;
      }
    }

    console.log(
      `✅ Successfully blocked stock for ${stockBlockResults.length} items`,
    );

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,

      // ✅ EXPLICIT PRICING OBJECT (FIXED)
      pricing: {
        subtotal: orderData.pricing?.subtotal || totalAmount,
        tax: orderData.pricing?.tax || 0,
        shipping: orderData.pricing?.shipping || 0,
        total: orderData.pricing?.total || totalAmount,
      },

      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || "cod",
      paymentStatus: orderData.paymentStatus || "pending",
      eventInfo: orderData.eventInfo || null,
      referenceImage: orderData.referenceImage || null,
      status: ORDER_STATUS.PENDING,
      orderNumber:
        "ORD-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substr(2, 5).toUpperCase(),
    });

    console.log("🔍 Saving order...");
    await order.save();
    console.log("Order saved successfully:", order._id);

    // 🔄 Update blocked stock records with actual order ID
    console.log("🔄 Updating blocked stock records with order ID...");
    for (const blockResult of stockBlockResults) {
      try {
        const updateBlockedQuery = {
          $set: { "blockedStock.$[elem].orderId": order._id.toString() },
        };

        const arrayFilters = [{ "elem.orderId": "pending" }];

        if (blockResult.modelType === "Product") {
          await Product.updateOne(
            { _id: blockResult.productId },
            updateBlockedQuery,
            { arrayFilters },
          );
        } else {
          await VendorProduct.updateOne(
            { _id: blockResult.productId },
            updateBlockedQuery,
            { arrayFilters },
          );
        }

        console.log(
          `🔄 Updated blocked stock record for product ${blockResult.productId}`,
        );
      } catch (updateError) {
        console.error(
          `⚠️ Failed to update blocked stock record:`,
          updateError.message,
        );
        // Don't fail the order, just log the error
      }
    }

    // 🔔 Create notification for order created
    try {
      await NotificationHelper.notifyOrderCreated(userId, order);
      console.log("✅ Order creation notification created");
    } catch (notifError) {
      console.error("❌ Error creating order notification:", notifError);
      // Don't fail the order if notification fails
    }

    // Decrement stock for all ordered items
    console.log("Decrementing stock for ordered items...");
    for (const item of orderItems) {
      try {
        const productId = item.product.toString();

        // Try Product model first
        let product = await Product.findById(productId);
        if (product) {
          await Product.findByIdAndUpdate(productId, {
            $inc: { stock: -item.quantity },
          });
          console.log(
            `Decremented Product stock by ${item.quantity} for ${productId}`,
          );
          continue;
        }

        // Try VendorProduct model
        product = await VendorProduct.findById(productId);
        if (product) {
          await VendorProduct.findByIdAndUpdate(productId, {
            $inc: { stock: -item.quantity },
          });
          console.log(
            `Decremented VendorProduct stock by ${item.quantity} for ${productId}`,
          );
        }
      } catch (stockError) {
        console.error("Error decrementing stock:", stockError);
        // Don't fail the order, just log the error
      }
    }

    // 🔥 AUTOMATIC DELIVERY ORDER CREATION
    console.log("🚚 Creating automatic delivery order...");
    try {
      // Get user details for delivery order
      const user = await User.findById(userId);

      // Create delivery order with all required fields
      const deliveryOrderData = {
        orderId: order.orderNumber,
        customerId: order._id,
        vendorId: new mongoose.Types.ObjectId(), // Default vendor - can be updated later
        customerName:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.name || "Customer",
        customerPhone: user?.phone || "0000000000",
        customerEmail: user?.email || "customer@example.com",
        vendorName: "APNA Decoration - Main Store",
        vendorPhone: "+91 98765 43211",
        vendorAddress: "123 Main Street, Mumbai, Maharashtra 400001",
        pickupAddress: "123 Main Street, Mumbai, Maharashtra 400001", // Same as vendor address
        deliveryAddress: {
          street: order.shippingAddress.street || "N/A",
          city: order.shippingAddress.city || "N/A",
          state: order.shippingAddress.state || "N/A",
          pinCode: order.shippingAddress.pinCode || "N/A",
          country: "India",
        },
        items: order.items.map((item) => ({
          productId: item.product,
          productName:
            item.productSnapshot?.name || item.productName || "Product",
          quantity: item.quantity,
          price: item.unitPrice,
          image: item.productSnapshot?.thumbnail || null,
        })),
        orderAmount: order.pricing?.total || totalAmount,
        deliveryFee: 50,
        totalAmount: (order.pricing?.total || totalAmount) + 50,
        distance: 5.0, // Default distance in km
        estimatedTime: "30-45 mins", // Default delivery time
        priority: totalAmount > 5000 ? "high" : "normal",
        status: "pending", // This makes it available in delivery panel
        orderDate: order.createdAt,
        createdBy: order._id, // The user who created the order
        deliveryBoyEarnings: 40,
        tracking: [],
        // NOTE: No deliveryBoyId - this makes it available for pickup
      };

      // Insert using DeliveryOrder model
      const deliveryOrder = new DeliveryOrder(deliveryOrderData);
      await deliveryOrder.save();

      console.log("✅ Delivery order created successfully:", deliveryOrder._id);
      console.log("🎉 Order is now available in delivery panel!");
    } catch (deliveryError) {
      console.error("❌ Error creating delivery order:", deliveryError.message);
      // Don't fail the main order creation if delivery order fails
      console.log(
        "⚠️ Order created but delivery order failed - manual intervention needed",
      );
    }

    return order;
  }

  // Create service booking
  static async createServiceBooking(bookingData, userId) {
    const {
      serviceId,
      bookingDate,
      bookingTime,
      notes,
      customerInfo,
      referenceImage,
    } = bookingData;

    // Validate service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    if (service.status !== "active") {
      throw new Error("Service is not available for booking");
    }

    // Create booking order
    console.log("🔍 Creating booking object...");
    const booking = new Order({
      user: userId,
      type: ORDER_TYPE.SERVICE,
      service: service._id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      serviceImage: service.image,
      bookingDate,
      bookingTime,
      notes,
      customerInfo,
      referenceImage,
      pricing: {
        subtotal: service.price,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: service.price,
      },
      status: ORDER_STATUS.PENDING,
      orderNumber: OrderService.generateOrderNumber("SVC"),
    });

    console.log("🔍 Booking object created:", {
      orderNumber: booking.orderNumber,
      type: booking.type,
      service: booking.service,
      serviceName: booking.serviceName,
      pricing: booking.pricing,
      status: booking.status,
    });

    console.log("🔍 Attempting to save booking...");
    await booking.save();
    console.log("✅ Booking saved successfully!");

    return booking;
  }

  // Get user's orders
  static async getUserOrders(userId, filters = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const skip = (page - 1) * limit;

    // Build query
    console.log("🔍 getOrders called with:", {
      userId,
      page,
      limit,
      status,
      sortBy,
      sortOrder,
    });

    const query = { user: userId };

    // Handle special status filtering
    if (status === "active") {
      // Active orders = everything except cancelled
      query.status = { $ne: "cancelled" };
      console.log("Query for active orders (excluding cancelled):", query);
    } else if (status) {
      // Specific status filter
      query.status = status;
      console.log("Query for specific status:", status, query);
    } else {
      console.log("Query for all orders:", query);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    console.log("🔍 Query:", query);
    console.log("🔍 Sort:", sort);

    const orders = await Order.find(query)
      .select(
        "status items user pricing shippingAddress paymentMethod orderNumber type createdAt updatedAt timeline customerInfo referenceImage eventInfo service serviceName servicePrice serviceDuration serviceImage bookingDate bookingTime notes",
      )
      .sort(sort)
      .skip(skip)
      .limit(Math.min(limit, 100));

    // Manually populate products based on productModel
    console.log("🔍 Starting manual population for", orders.length, "orders");
    for (let order of orders) {
      console.log("🔍 Processing order with", order.items.length, "items");
      for (let item of order.items) {
        console.log(
          "🔍 Processing item:",
          item._id,
          "product:",
          item.product,
          "productModel:",
          item.productModel,
        );
        // Check if product reference exists (could be ObjectId or string)
        if (item.product && item.productModel) {
          try {
            let productDoc = null;
            const productId = item.product.toString(); // Convert ObjectId to string

            if (item.productModel === "Product") {
              productDoc = await Product.findById(productId).select(
                "name images price thumbnail",
              );
            } else if (item.productModel === "VendorProduct") {
              productDoc = await VendorProduct.findById(productId).select(
                "name images price thumbnail",
              );
            }

            if (productDoc) {
              // Use live product data if available, but fallback to snapshot
              item.product = {
                ...productDoc.toObject(),
                // Prefer snapshot data for order consistency
                name: item.productSnapshot?.name || productDoc.name,
                thumbnail:
                  item.productSnapshot?.thumbnail || productDoc.thumbnail,
                price: item.productSnapshot?.price || productDoc.price,
              };
              console.log("Product found and populated with snapshot priority");
            } else {
              console.log(
                "Product not found for item:",
                item._id,
                "model:",
                item.productModel,
                "id:",
                productId,
                "Using snapshot data",
              );
              // Use product snapshot as primary data source
              item.product = {
                name: item.productSnapshot?.name || "Product Not Available",
                images: item.productSnapshot?.thumbnail
                  ? [item.productSnapshot.thumbnail]
                  : [],
                thumbnail: item.productSnapshot?.thumbnail || null,
                price: item.productSnapshot?.price || item.unitPrice || 0,
              };
            }
          } catch (error) {
            console.log("Error populating product:", error.message);
            // Use snapshot data as fallback even in error case
            item.product = {
              name: item.productSnapshot?.name || "Product Error",
              images: item.productSnapshot?.thumbnail
                ? [item.productSnapshot.thumbnail]
                : [],
              thumbnail: item.productSnapshot?.thumbnail || null,
              price: item.productSnapshot?.price || item.unitPrice || 0,
            };
          }
        } else {
          console.log("⚠️ Item missing product or productModel");
        }
      }
    }

    console.log("🔍 Raw orders from DB:", orders.length, "orders");
    if (orders.length > 0) {
      console.log("🔍 First order items:", orders[0].items.length, "items");
      if (orders[0].items.length > 0) {
        console.log(
          "🔍 First item full data:",
          JSON.stringify(orders[0].items[0], null, 2),
        );
        console.log("🔍 First item product data:", orders[0].items[0].product);
        console.log(
          "🔍 First item productModel:",
          orders[0].items[0].productModel,
        );
      }
    }

    console.log(
      "🔍 After population - First item product:",
      orders[0]?.items[0]?.product,
    );

    // Post-process orders to ensure product data and migrate if needed
    const processedOrders = [];

    for (const order of orders) {
      const orderObj = order.toObject();

      // Check if order needs enhanced migration and migrate on-the-fly
      if (EnhancedOrderImageMigration.needsEnhancedMigration(orderObj)) {
        console.log("Order needs enhanced migration:", orderObj.orderNumber);
        const enhancedMigratedOrder =
          await EnhancedOrderImageMigration.migrateOrderWithDatabase(order);
        processedOrders.push(enhancedMigratedOrder.toObject());
      } else {
        // Process each item to ensure product data
        orderObj.items = orderObj.items.map((item) => {
          // If product is null or missing, try to fetch it
          if (!item.product && item.productModel === "Product") {
            console.log("Missing product reference for item:", item._id);
          }
          return item;
        });
        processedOrders.push(orderObj);
      }
    }

    const total = await Order.countDocuments(query);

    return {
      orders: processedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get order by ID
  static async getOrderById(orderId, userId) {
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw new Error("Invalid order ID");
    }

    console.log("🔍 Looking up order:", orderId, "for user:", userId);

    // First get the order without population to check the structure
    const rawOrder = await Order.findById(orderId);
    if (!rawOrder) {
      console.log("❌ Order not found:", orderId);
      throw new Error("Order not found");
    }

    console.log("🔍 Raw order structure:", {
      orderId: rawOrder._id,
      orderUser: rawOrder.user,
      orderUserType: typeof rawOrder.user,
      itemsCount: rawOrder.items?.length || 0,
      firstItemProduct: rawOrder.items?.[0]?.product,
      firstItemProductType: typeof rawOrder.items?.[0]?.product,
    });

    // Check if user owns the order (using raw order to avoid population issues)
    if (!rawOrder.user) {
      console.log("❌ Order has no user associated:", orderId);
      throw new Error("Order is not associated with any user");
    }

    const orderUserId = rawOrder.user.toString();
    console.log("🔍 Order ownership check (raw):", {
      orderUserId,
      requestUserId: userId,
      matches: orderUserId === userId,
    });

    if (orderUserId !== userId) {
      throw new Error(
        `Access denied - you do not own this order. Order user: ${orderUserId}, Request user: ${userId}`,
      );
    }

    // Now populate the order
    const order = await Order.findById(orderId).populate(
      "user",
      "name email phone",
    );

    console.log("🔍 Order populated successfully:", {
      orderId: order._id,
      orderUser: order.user,
      orderUserType: typeof order.user,
      itemsCount: order.items?.length || 0,
    });

    // Manually populate products to avoid ObjectId reference issues
    if (order.items && order.items.length > 0) {
      console.log(
        "🔍 Manually populating products for",
        order.items.length,
        "items",
      );
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        console.log(`🔍 Processing item ${i}:`, {
          product: item.product,
          productModel: item.productModel,
          productType: typeof item.product,
        });

        if (item.product && item.productModel) {
          try {
            let productDoc = null;
            const productId = item.product.toString();

            if (item.productModel === "Product") {
              productDoc = await Product.findById(productId).select(
                "name images price thumbnail",
              );
            } else if (item.productModel === "VendorProduct") {
              productDoc = await VendorProduct.findById(productId).select(
                "name images price thumbnail",
              );
            }

            if (productDoc) {
              // Use live product data if available, but fallback to snapshot
              item.product = {
                ...productDoc.toObject(),
                // Prefer snapshot data for order consistency
                name: item.productSnapshot?.name || productDoc.name,
                thumbnail:
                  item.productSnapshot?.thumbnail || productDoc.thumbnail,
                price: item.productSnapshot?.price || productDoc.price,
              };
              console.log(
                `✅ Product populated for item ${i}:`,
                item.product.name,
              );
            } else {
              console.log(`⚠️ Product not found for item ${i}:`, productId);
              // Use product snapshot as primary data source
              item.product = {
                name: item.productSnapshot?.name || "Product Not Available",
                images: item.productSnapshot?.thumbnail
                  ? [item.productSnapshot.thumbnail]
                  : [],
                thumbnail: item.productSnapshot?.thumbnail || null,
                price: item.productSnapshot?.price || item.unitPrice || 0,
              };
            }
          } catch (error) {
            console.log(
              `⚠️ Error populating product for item ${i}:`,
              error.message,
            );
            item.product = {
              name: item.productSnapshot?.name || "Product Error",
              images: item.productSnapshot?.thumbnail
                ? [item.productSnapshot.thumbnail]
                : [],
              thumbnail: item.productSnapshot?.thumbnail || null,
              price: item.productSnapshot?.price || item.unitPrice || 0,
            };
          }
        } else {
          console.log(`⚠️ Item ${i} missing product or productModel`);
        }
      }
    }

    // Check if order needs enhanced migration and migrate on-the-fly
    if (EnhancedOrderImageMigration.needsEnhancedMigration(order.toObject())) {
      console.log("Single order needs enhanced migration:", order.orderNumber);
      const singleMigratedOrder =
        await EnhancedOrderImageMigration.migrateOrderWithDatabase(order);
      return singleMigratedOrder;
    }

    return order;
  }

  static async updateOrderStatus(orderId, status, notes = "") {
    console.log("🔍 Updating order status:", { orderId, status, notes });

    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw new Error("Invalid order ID");
    }

    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new Error("Invalid order status");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    console.log(
      "🔍 Order found for status update:",
      order._id,
      "current status:",
      order.status,
    );

    // Add status change to timeline
    order.timeline = order.timeline || [];
    order.timeline.push({
      status,
      timestamp: new Date(),
      notes,
      updatedBy: "system", // In real app, this would be the admin user ID
    });

    order.status = status;

    // If order is delivered, set actual delivery date
    if (status === "delivered") {
      order.actualDelivery = new Date();
    }

    await order.save();
    console.log(
      "✅ Order status updated successfully:",
      order._id,
      "new status:",
      status,
    );

    // Verify the save was successful
    const verification = await Order.findById(orderId);
    console.log("ð¨ DB STATUS VERIFICATION:", {
      orderId,
      expectedStatus: status,
      actualStatus: verification.status,
      saveSuccessful: verification.status === status,
    });

    // TODO: Send notification to user about status change

    return order;
  }

  // Cancel order
  static async cancelOrder(orderId, userId, reason = "") {
    console.log("Starting order cancellation:", { orderId, userId, reason });

    try {
      const order = await this.getOrderById(orderId, userId);
      console.log(
        "Order found for cancellation:",
        order._id,
        "status:",
        order.status,
      );

      // Allow cancellation for pending and confirmed orders
      const allowedStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];
      if (!allowedStatuses.includes(order.status)) {
        throw new Error("Order cannot be cancelled at this stage");
      }

      // Restore stock - with null checks
      console.log("🔍 Restoring stock for", order.items.length, "items");
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          console.log("🔍 Processing item for stock restoration:", {
            item: item._id,
            product: item.product,
            productType: typeof item.product,
            quantity: item.quantity,
          });

          // Handle different product reference formats
          let productId;
          if (item.product && typeof item.product === "object") {
            productId = item.product._id || item.product.toString();
          } else if (item.product) {
            productId = item.product.toString();
          } else {
            console.log(
              "⚠️ Item has no product reference, skipping stock restoration",
            );
            continue;
          }

          console.log(
            "🔍 Restoring stock for product:",
            productId,
            "quantity:",
            item.quantity,
          );
          try {
            await this.updateProductStock(productId, item.quantity);
            console.log("✅ Stock restored for product:", productId);
          } catch (stockError) {
            console.log(
              "⚠️ Error restoring stock for product:",
              productId,
              stockError.message,
            );
            // Continue with cancellation even if stock restoration fails
          }
        }
      } else {
        console.log("🔍 Order has no items to restore stock for");
      }

      console.log("🔍 Updating order status to cancelled");
      try {
        const result = await this.updateOrderStatus(
          orderId,
          ORDER_STATUS.CANCELLED,
          reason || "Customer requested cancellation",
        );
        console.log("✅ Order cancelled successfully:", result._id);

        // 🔔 Create notification for order cancelled
        try {
          await NotificationHelper.notifyOrderCancelled(
            userId,
            result,
            reason || "Customer requested cancellation",
          );
          console.log("✅ Order cancellation notification created");
        } catch (notifError) {
          console.error(
            "❌ Error creating cancellation notification:",
            notifError,
          );
          // Don't fail the cancellation if notification fails
        }

        return result;
      } catch (statusError) {
        console.log("❌ Error updating order status:", statusError.message);
        throw new Error(
          `Failed to update order status: ${statusError.message}`,
        );
      }
    } catch (error) {
      console.log("❌ Order cancellation failed:", error.message);
      console.log("❌ Full error:", error);
      throw error;
    }
  }

  // Process refund
  static async processRefund(orderId, userId, refundAmount, reason = "") {
    const order = await this.getOrderById(orderId, userId);

    // ... (rest of the code remains the same)
    if (order.status !== ORDER_STATUS.DELIVERED) {
      throw new Error("Refund can only be processed for delivered orders");
    }

    if (refundAmount > order.totalAmount) {
      throw new Error("Refund amount cannot exceed order total");
    }

    order.refundAmount = refundAmount;
    order.refundReason = reason;
    order.status = ORDER_STATUS.REFUNDED;

    return await order.save();
  }

  // Get order statistics
  static async getOrderStats(userId, filters = {}) {
    const { startDate, endDate } = filters;

    const matchStage = { user: userId };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    return stats;
  }

  // Generate unique order number
  static generateOrderNumber(prefix = "ORD") {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Update product stock (helper method)
  static async updateProductStock(productId, quantity) {
    let product = await Product.findById(productId);

    // If not found in Product, try VendorProduct
    if (!product) {
      console.log(
        "📦 Product not found in Product model for stock update, trying VendorProduct:",
        productId,
      );
      product = await VendorProduct.findById(productId);
      if (product) {
        console.log("📦 Found vendor product for stock update:", product.name);
      }
    }

    if (!product) return;

    product.stock = Math.max(0, product.stock + quantity);

    // Update status based on stock (only for Product model)
    if (product.status !== undefined) {
      if (product.stock === 0) {
        product.status = PRODUCT_STATUS.OUT_OF_STOCK;
      } else if (product.status === PRODUCT_STATUS.OUT_OF_STOCK) {
        product.status = PRODUCT_STATUS.ACTIVE;
      }
    }

    await product.save();
  }

  // Track order
  static async trackOrder(orderNumber) {
    const order = await Order.findOne({ orderNumber })
      .populate("items.product", "name")
      .select("orderNumber status createdAt items statusHistory");

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  // Clear cancelled orders for a user
  static async clearCancelledOrders(userId) {
    try {
      console.log("Clearing cancelled orders for user:", userId);

      // Delete all cancelled orders for this user
      const result = await Order.deleteMany({
        user: userId,
        status: ORDER_STATUS.CANCELLED,
      });

      console.log(
        `Deleted ${result.deletedCount} cancelled orders for user ${userId}`,
      );

      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `Successfully cleared ${result.deletedCount} cancelled orders`,
      };
    } catch (error) {
      console.error("Error clearing cancelled orders:", error);
      throw new Error(`Failed to clear cancelled orders: ${error.message}`);
    }
  }
}

module.exports = OrderService;
