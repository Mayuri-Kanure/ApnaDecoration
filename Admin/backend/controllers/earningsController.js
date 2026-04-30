const DeliveryBoy = require("../models/DeliveryBoy");
const DeliveryOrder = require("../models/DeliveryOrder");

// @desc    Get delivery boy earnings
// @route   GET /api/delivery-boy/earnings
// @access   Private
exports.getEarnings = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;

    // Get completed orders for this delivery boy
    const orders = await DeliveryOrder.find({
      deliveryBoyId: deliveryBoyId,
      status: "delivered",
    })
      .sort({ deliveredDate: -1 })
      .limit(50);

    // Calculate earnings from orders
    const earnings = orders.map((order) => ({
      id: `EARN-${String(order._id).slice(-6)}`,
      date: order.deliveredDate.toISOString().split("T")[0],
      amount: order.deliveryBoyEarnings || 0,
      type: "delivery",
      status: "completed",
      orderId: order.orderId,
    }));

    res.status(200).json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    console.error("Error getting earnings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get earnings statistics
// @route   GET /api/delivery-boy/earnings/stats
// @access   Private
exports.getEarningsStats = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;

    // Get all orders for this delivery boy
    const orders = await DeliveryOrder.find({ deliveryBoyId: deliveryBoyId });

    // Calculate statistics
    const totalEarnings = orders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + (order.deliveryBoyEarnings || 0), 0);

    const completedOrders = orders.filter(
      (order) => order.status === "delivered",
    ).length;
    const totalOrders = orders.length;

    // For demo, we'll use some mock withdrawal data
    const totalWithdrawals = 1250; // This would come from withdrawals collection
    const pendingWithdrawals = 0;
    const monthlyEarnings = 4375; // This month's earnings

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        completedOrders,
        totalOrders,
        totalWithdrawals,
        pendingWithdrawals,
        monthlyEarnings,
      },
    });
  } catch (error) {
    console.error("Error getting earnings stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
