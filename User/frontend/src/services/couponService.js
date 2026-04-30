import axios from "axios";
import { API_BASE_URL } from "../config/constants";

const API_BASE_URL_FINAL = API_BASE_URL;

class CouponService {
  // Get available coupons
  async getAvailableCoupons() {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}/api/coupons/available`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  // Validate and apply coupon
  async applyCoupon(couponCode, orderAmount) {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/coupons/apply`,
      {
        code: couponCode,
        orderAmount: orderAmount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  // Remove applied coupon
  async removeCoupon() {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/coupons/remove`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  // Get user's coupon usage history
  async getCouponHistory() {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/coupons/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }
}

const couponService = new CouponService();
export default couponService;
