const DeliveryBoy = require('../models/DeliveryBoy');

// @desc    Get withdrawal history
// @route   GET /api/delivery-boy/withdrawals
// @access   Private
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;
    
    // Mock withdrawal data for demo
    const withdrawals = [
      {
        id: 'WD-001',
        date: '2026-02-20',
        amount: 1000,
        method: 'bank_transfer',
        status: 'completed',
        transactionId: 'TXN123456789',
        processingDate: '2026-02-20',
        completedDate: '2026-02-21',
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          accountHolderName: 'John Doe'
        }
      },
      {
        id: 'WD-002',
        date: '2026-02-15',
        amount: 500,
        method: 'upi',
        status: 'completed',
        transactionId: 'UPI987654321',
        processingDate: '2026-02-15',
        completedDate: '2026-02-15',
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          accountHolderName: 'John Doe'
        }
      }
    ];
    
    res.status(200).json(withdrawals);
  } catch (error) {
    console.error('Error getting withdrawal history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get withdrawal statistics
// @route   GET /api/delivery-boy/withdrawals/stats
// @access   Private
exports.getWithdrawalStats = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;
    
    // Get delivery boy data
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }
    
    // Mock withdrawal statistics
    const totalWithdrawals = 1250;
    const pendingWithdrawals = 0;
    const availableBalance = deliveryBoy.totalEarnings - totalWithdrawals;
    
    res.status(200).json({
      totalWithdrawals,
      pendingWithdrawals,
      availableBalance
    });
  } catch (error) {
    console.error('Error getting withdrawal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Request withdrawal
// @route   POST /api/delivery-boy/withdrawals
// @access   Private
exports.requestWithdrawal = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;
    const { amount, method } = req.body;
    
    if (!amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Amount and method are required'
      });
    }
    
    // Get delivery boy data
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }
    
    // Check if sufficient balance
    const totalWithdrawals = 1250; // This would come from withdrawal history
    const availableBalance = deliveryBoy.totalEarnings - totalWithdrawals;
    
    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }
    
    // Create withdrawal request (in real app, this would be saved to database)
    const withdrawal = {
      id: `WD-${String(Date.now()).slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      method,
      status: 'pending',
      transactionId: `TXN${String(Date.now()).slice(-9)}`,
      processingDate: new Date().toISOString(),
      bankDetails: {
        accountNumber: deliveryBoy.bankDetails.bankAccount,
        ifscCode: deliveryBoy.bankDetails.ifscCode,
        bankName: deliveryBoy.bankDetails.bankName,
        accountHolderName: deliveryBoy.bankDetails.accountHolderName
      }
    };
    
    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal
    });
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
