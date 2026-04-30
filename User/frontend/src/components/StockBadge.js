/**
 * STOCK BADGE COMPONENT
 * Shows stock availability status in product listing and cart
 * Displays in different colors based on stock level
 */

import React from "react";
import { AlertCircle, Package, Zap } from "lucide-react";

const StockBadge = ({ stock, reserved = 0 }) => {
  const available = Math.max(0, stock - (reserved || 0));

  // Out of stock
  if (available === 0) {
    return (
      <div className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
        <Package size={14} />
        <span>Out of Stock</span>
      </div>
    );
  }

  // Low stock (1-5)
  if (available <= 5) {
    return (
      <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
        <AlertCircle size={14} />
        <span>Only {available} left!</span>
      </div>
    );
  }

  // Critical (1-2) - rare case
  if (available <= 2) {
    return (
      <div className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
        <Zap size={14} />
        <span>🔴 Critically Low</span>
      </div>
    );
  }

  // In stock
  return (
    <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
      <Package size={14} />
      <span>In Stock</span>
    </div>
  );
};

/**
 * DETAILED STOCK DISPLAY
 * Shows available, reserved, and total
 */
const StockDetails = ({ stock, reserved = 0 }) => {
  const available = Math.max(0, stock - (reserved || 0));

  return (
    <div className="bg-gray-50 p-3 rounded-lg text-xs">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-gray-600">Available</p>
          <p className="text-lg font-bold text-green-600">{available}</p>
        </div>
        <div>
          <p className="text-gray-600">Reserved</p>
          <p className="text-lg font-bold text-yellow-600">{reserved || 0}</p>
        </div>
        <div>
          <p className="text-gray-600">Total</p>
          <p className="text-lg font-bold text-blue-600">{stock}</p>
        </div>
      </div>

      {available === 0 && (
        <p className="mt-2 text-red-600 font-semibold text-center">❌ Out of Stock</p>
      )}

      {available > 0 && available <= 5 && (
        <p className="mt-2 text-orange-600 text-center">⚠️ Low stock warning</p>
      )}
    </div>
  );
};

/**
 * CANNOT ADD TO CART ALERT
 * Shows reason why product can't be added
 */
const OutOfStockAlert = ({ productName, reason = "Out of Stock" }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-2">
      <div className="flex items-start gap-2">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
        <div>
          <p className="text-red-800 font-semibold text-sm">
            Cannot Add to Cart
          </p>
          <p className="text-red-700 text-xs pt-1">
            {productName} - {reason}
          </p>
          <p className="text-red-600 text-xs pt-2 italic">
            Notify me when back in stock →
          </p>
        </div>
      </div>
    </div>
  );
};

export { StockBadge, StockDetails, OutOfStockAlert };
export default StockBadge;
