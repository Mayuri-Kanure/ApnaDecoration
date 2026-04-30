import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { API_BASE_URL } from '../config/constants';

const LowStockAlert = ({ cartItems }) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Check cart items for low stock
    const itemsWithLowStock = cartItems?.filter(item => {
      const stock = item.stock || 0;
      return stock > 0 && stock <= 3; // Low stock < 3 units
    }) || [];

    setLowStockItems(itemsWithLowStock);
    setShowAlert(itemsWithLowStock.length > 0);
  }, [cartItems]);

  if (!showAlert || lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
      <div className="flex items-start gap-3">
        <TrendingDown className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Low Stock Warning</h3>
          <div className="text-yellow-700 text-sm space-y-1">
            {lowStockItems.map((item, idx) => (
              <p key={idx}>
                📦 <strong>{item.name}</strong> - Only <span className="font-bold">{item.stock}</span> unit(s) remaining
              </p>
            ))}
          </div>
          <p className="text-yellow-600 text-xs mt-2">
            ⚡ Hurry! Complete your purchase before stock runs out.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;
