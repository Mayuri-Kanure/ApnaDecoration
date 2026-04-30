// ORDER IMAGE MIGRATION SERVICE - Update existing orders on-the-fly
const { Product, VendorProduct } = require("../models");

class OrderImageMigration {
  // Migrate a single order to have production-ready image structure
  static async migrateOrder(order) {
    if (!order.items || order.items.length === 0) {
      return order;
    }

    let hasChanges = false;
    const migratedItems = [];

    for (const item of order.items) {
      const itemObj = item.toObject ? item.toObject() : item;
      const migratedItem = { ...itemObj };

      // Add direct thumbnail if missing
      if (!migratedItem.thumbnail) {
        // Priority 1: Check productSnapshot
        if (migratedItem.productSnapshot?.thumbnail) {
          migratedItem.thumbnail = migratedItem.productSnapshot.thumbnail;
          hasChanges = true;
        }
        // Priority 2: Check populated product
        else if (migratedItem.product?.thumbnail) {
          migratedItem.thumbnail = migratedItem.product.thumbnail;
          hasChanges = true;
        }
        // Priority 3: Fetch from database
        else {
          const productId = migratedItem.productId || migratedItem.product;
          if (productId) {
            try {
              let product = await Product.findById(productId);
              if (!product) {
                product = await VendorProduct.findById(productId);
              }

              if (product && product.thumbnail) {
                migratedItem.thumbnail = product.thumbnail;
                migratedItem.name = migratedItem.name || product.name || product.product_name_en;
                migratedItem.price = migratedItem.price || product.price;
                hasChanges = true;
              }
            } catch (error) {
              console.log("Error fetching product for migration:", error.message);
            }
          }
        }
      }

      // Add direct name if missing
      if (!migratedItem.name) {
        if (migratedItem.productSnapshot?.name) {
          migratedItem.name = migratedItem.productSnapshot.name;
          hasChanges = true;
        } else if (migratedItem.product?.name) {
          migratedItem.name = migratedItem.product.name;
          hasChanges = true;
        }
      }

      // Ensure fallback values
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
        console.log(`Migrated order ${order.orderNumber} with image data`);
      } catch (saveError) {
        console.log("Error saving migrated order:", saveError.message);
      }
    }

    return order;
  }

  // Migrate multiple orders
  static async migrateOrders(orders) {
    const migratedOrders = [];
    
    for (const order of orders) {
      const migratedOrder = await this.migrateOrder(order);
      migratedOrders.push(migratedOrder);
    }
    
    return migratedOrders;
  }

  // Check if order needs migration
  static needsMigration(order) {
    if (!order.items || order.items.length === 0) {
      return false;
    }

    return order.items.some(item => 
      !item.thumbnail || !item.name
    );
  }
}

module.exports = OrderImageMigration;
