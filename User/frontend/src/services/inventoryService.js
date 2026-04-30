import { API_BASE_URL } from '../config/constants';

class InventoryService {
  // Get current inventory status
  async getInventoryStatus() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/inventory/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error('❌ Error fetching inventory status:', err.message);
      return null;
    }
  }

  // Get low stock items
  async getLowStockItems() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/inventory/low-stock`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error('❌ Error fetching low stock items:', err.message);
      return null;
    }
  }

  // Manually trigger low stock scan
  async triggerLowStockScan() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/inventory/scan-now`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Low stock scan completed:', data.message);
      return data.data;
    } catch (err) {
      console.error('❌ Error triggering scan:', err.message);
      return null;
    }
  }

  // Check if product has low stock
  isLowStock(stock) {
    return stock > 0 && stock <= 5;
  }

  // Check if product is out of stock
  isOutOfStock(stock) {
    return stock === 0;
  }

  // Check if product is critical stock
  isCriticalStock(stock) {
    return stock > 0 && stock <= 2;
  }
}

export default new InventoryService();
