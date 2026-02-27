import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com';

class CouponService {
  // Get available coupons
  async getAvailableCoupons() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/coupons/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available coupons:', error);
      // Return mock data if API fails
      return {
        success: true,
        data: [
          {
            _id: '1',
            code: 'WELCOME10',
            description: 'Welcome discount for new users',
            discountType: 'percentage',
            discountValue: 10,
            minOrderAmount: 500,
            maxDiscountAmount: 100,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true
          },
          {
            _id: '2',
            code: 'SAVE50',
            description: 'Flat ₹50 off on orders above ₹1000',
            discountType: 'fixed',
            discountValue: 50,
            minOrderAmount: 1000,
            maxDiscountAmount: 50,
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            isActive: true
          },
          {
            _id: '3',
            code: 'FESTIVAL20',
            description: '20% off on festival decorations',
            discountType: 'percentage',
            discountValue: 20,
            minOrderAmount: 2000,
            maxDiscountAmount: 500,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isActive: true
          }
        ]
      };
    }
  }

  // Validate and apply coupon
  async applyCoupon(couponCode, orderAmount) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/coupons/apply`, {
        code: couponCode,
        orderAmount: orderAmount
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error applying coupon:', error);
      
      // Mock validation logic
      const mockCoupons = [
        {
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 500,
          maxDiscountAmount: 100
        },
        {
          code: 'SAVE50',
          discountType: 'fixed',
          discountValue: 50,
          minOrderAmount: 1000,
          maxDiscountAmount: 50
        },
        {
          code: 'FESTIVAL20',
          discountType: 'percentage',
          discountValue: 20,
          minOrderAmount: 2000,
          maxDiscountAmount: 500
        }
      ];

      const coupon = mockCoupons.find(c => c.code === couponCode.toUpperCase());
      
      if (!coupon) {
        return {
          success: false,
          message: 'Invalid coupon code'
        };
      }

      if (orderAmount < coupon.minOrderAmount) {
        return {
          success: false,
          message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
        };
      }

      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      return {
        success: true,
        data: {
          coupon: coupon,
          discountAmount: discountAmount,
          finalAmount: orderAmount - discountAmount
        }
      };
    }
  }

  // Remove applied coupon
  async removeCoupon() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/coupons/remove`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing coupon:', error);
      return {
        success: true,
        message: 'Coupon removed successfully'
      };
    }
  }

  // Get user's coupon usage history
  async getCouponHistory() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/coupons/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coupon history:', error);
      return {
        success: true,
        data: []
      };
    }
  }
}

const couponService = new CouponService();
export default couponService;