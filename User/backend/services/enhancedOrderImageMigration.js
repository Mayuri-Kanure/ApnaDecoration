// ENHANCED ORDER IMAGE MIGRATION - Fetch missing images from database
const { Product, VendorProduct } = require("../models");

class EnhancedOrderImageMigration {
  // Enhanced migration that fetches product images from database
  static async migrateOrderWithDatabase(order) {
    if (!order.items || order.items.length === 0) {
      console.log("Order has no items to migrate:", order.orderNumber);
      return order;
    }

    let hasChanges = false;
    const migratedItems = [];

    for (const item of order.items) {
      const itemObj = item.toObject ? item.toObject() : item;
      const migratedItem = { ...itemObj };

      console.log(`Processing item:`, {
        hasThumbnail: !!migratedItem.thumbnail,
        hasName: !!migratedItem.name,
        productId: migratedItem.productId || migratedItem.product,
        hasProductSnapshot: !!migratedItem.productSnapshot
      });

      // If item doesn't have direct thumbnail, fetch from database
      if (!migratedItem.thumbnail) {
        const productId = migratedItem.productId || migratedItem.product;
        
        if (productId) {
          try {
            console.log(`Fetching product ${productId} for order ${order.orderNumber}`);
            
            // Try Product collection first
            let product = await Product.findById(productId).select(
              "name thumbnail price sku description images category stock product_name_en"
            );
            
            // If not found, try VendorProduct
            if (!product) {
              product = await VendorProduct.findById(productId).select(
                "name thumbnail price sku description images category stock product_name_en"
              );
            }

            if (product) {
              console.log(`Found product: ${product.name || product.product_name_en}`);
              
              // Add all the missing fields from the product
              migratedItem.name = migratedItem.name || product.name || product.product_name_en || "Product";
              migratedItem.thumbnail = migratedItem.thumbnail || product.thumbnail;
              migratedItem.price = migratedItem.price || product.price || migratedItem.unitPrice || 0;
              migratedItem.sku = migratedItem.sku || product.sku;
              migratedItem.description = migratedItem.description || product.description || product.product_name_en;
              migratedItem.images = migratedItem.images || product.images || [];
              migratedItem.category = migratedItem.category || product.category;
              migratedItem.stock = migratedItem.stock || product.stock;

              // Create/update productSnapshot for compatibility
              migratedItem.productSnapshot = {
                name: product.name || product.product_name_en,
                thumbnail: product.thumbnail,
                price: product.price,
                sku: product.sku,
                description: product.description || product.product_name_en,
                images: product.images || [],
                category: product.category,
                stock: product.stock
              };

              hasChanges = true;
              console.log(`  Added image data: ${product.thumbnail}`);
            } else {
              console.log(`Product not found: ${productId}`);
              // Set fallback values
              migratedItem.name = migratedItem.name || "Product Not Available";
              migratedItem.thumbnail = migratedItem.thumbnail || "/images/fallback-product.jpg";
              migratedItem.price = migratedItem.price || migratedItem.unitPrice || 0;
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error.message);
            // Set fallback values
            migratedItem.name = migratedItem.name || "Product Error";
            migratedItem.thumbnail = migratedItem.thumbnail || "/images/fallback-product.jpg";
            migratedItem.price = migratedItem.price || migratedItem.unitPrice || 0;
          }
        } else {
          console.log("No productId found in item");
          // Set fallback values
          migratedItem.name = migratedItem.name || "Unknown Product";
          migratedItem.thumbnail = migratedItem.thumbnail || "/images/fallback-product.jpg";
          migratedItem.price = migratedItem.price || migratedItem.unitPrice || 0;
        }
      }

      // Ensure all required fields exist
      migratedItem.name = migratedItem.name || "Product";
      migratedItem.thumbnail = migratedItem.thumbnail || "/images/fallback-product.jpg";
      migratedItem.price = migratedItem.price || migratedItem.unitPrice || 0;

      migratedItems.push(migratedItem);
    }

    // Update order if changes were made
    if (hasChanges) {
      order.items = migratedItems;
      try {
        await order.save();
        console.log(`Enhanced migration completed for order ${order.orderNumber}`);
      } catch (saveError) {
        console.error("Error saving migrated order:", saveError.message);
      }
    } else {
      console.log(`No changes needed for order ${order.orderNumber}`);
    }

    return order;
  }

  // Check if order needs enhanced migration
  static needsEnhancedMigration(order) {
    if (!order.items || order.items.length === 0) {
      return false;
    }

    return order.items.some(item => 
      !item.thumbnail || !item.name || !item.price
    );
  }

  // Enhanced migration for multiple orders
  static async migrateOrdersWithDatabase(orders) {
    const migratedOrders = [];
    
    for (const order of orders) {
      if (this.needsEnhancedMigration(order)) {
        console.log(`Enhanced migrating order: ${order.orderNumber}`);
        const migratedOrder = await this.migrateOrderWithDatabase(order);
        migratedOrders.push(migratedOrder);
      } else {
        migratedOrders.push(order);
      }
    }
    
    return migratedOrders;
  }

  // Force migration for specific order IDs
  static async forceMigrateOrderById(orderId) {
    const { Order } = require("../models");
    
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        console.log(`Order not found: ${orderId}`);
        return null;
      }

      console.log(`Force migrating order: ${order.orderNumber}`);
      const migratedOrder = await this.migrateOrderWithDatabase(order);
      return migratedOrder;
    } catch (error) {
      console.error(`Error force migrating order ${orderId}:`, error.message);
      return null;
    }
  }
}

module.exports = EnhancedOrderImageMigration;
