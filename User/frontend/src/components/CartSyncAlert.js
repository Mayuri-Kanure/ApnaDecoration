/**
 * CART SYNC ALERT COMPONENT
 * Shows when cart items need to be adjusted due to stock changes
 */

import React from "react";
import { AlertCircle, Trash2, Edit3 } from "lucide-react";

const CartSyncAlert = ({
  hasInvalidItems = [],
  hasAdjustments = [],
  onRemoveInvalid,
  onAdjustQuantity,
}) => {
  if (hasInvalidItems.length === 0 && hasAdjustments.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <AlertCircle className="text-yellow-600 mr-3 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="text-yellow-800 font-semibold mb-2">
            ⚠️ Cart Inventory Update
          </h3>

          {/* Out of stock items */}
          {hasInvalidItems.length > 0 && (
            <div className="mb-3">
              <p className="text-yellow-700 text-sm mb-2">
                The following items are now out of stock and have been removed:
              </p>
              <ul className="space-y-1">
                {hasInvalidItems.map((item) => (
                  <li key={item.productId} className="text-yellow-700 text-sm flex items-center">
                    <span className="mr-2">•</span>
                    <span>{item.productName}</span>
                    <Trash2 size={14} className="ml-2 opacity-50" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity adjustments */}
          {hasAdjustments.length > 0 && (
            <div>
              <p className="text-yellow-700 text-sm mb-2">
                Stock limited for these items:
              </p>
              <ul className="space-y-2">
                {hasAdjustments.map((adj) => (
                  <li
                    key={adj.productId}
                    className="text-yellow-700 text-sm bg-yellow-100 p-2 rounded"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        <strong>{adj.productName}</strong> reduced to{" "}
                        <strong>{adj.newQuantity}</strong> (was {adj.oldQuantity})
                      </span>
                      <button
                        onClick={() => onAdjustQuantity(adj.productId, adj.newQuantity)}
                        className="text-yellow-600 hover:text-yellow-800 ml-2"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSyncAlert;
