const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { auth } = require('../middleware/auth');

// Get available coupons (public)
router.get('/available', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({ isActive: true })
      .select('code title discountType discountAmount minPurchase maxDiscount startDate endDate')
      .sort({ createdAt: -1 });
    
    // Filter valid coupons - only show if started and not expired
    const validCoupons = coupons.filter(coupon => {
      // Check start date - must have started
      if (coupon.startDate && now < new Date(coupon.startDate)) {
        return false; // Not started yet
      }
      
      // Check end date with end-of-day logic
      if (coupon.endDate) {
        const end = new Date(coupon.endDate);
        end.setHours(23, 59, 59, 999);
        if (now > end) {
          return false; // Expired
        }
      }
      
      return true;
    }).map(coupon => ({
      _id: coupon._id,
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount
    }));
    
    res.json({ success: true, data: validCoupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all coupons
router.get('/', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create coupon
router.post('/', auth, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update coupon
router.put('/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Prevent activating expired coupons
    if (req.body.isActive === true && coupon.endDate) {
      const now = new Date();
      const end = new Date(coupon.endDate);
      end.setHours(23, 59, 59, 999);
      
      if (now > end) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot activate expired coupon' 
        });
      }
    }

    // Prevent activating exhausted coupons
    if (req.body.isActive === true && coupon.usageLimit) {
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot activate exhausted coupon' 
        });
      }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updatedCoupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete coupon
router.delete('/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Validate coupon (public)
router.post('/validate', async (req, res) => {
  console.log('🎫 Admin: Validating coupon:', req.body);
  try {
    const { code, orderAmount } = req.body;
    
    if (!code) {
      console.log('❌ No code provided');
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    console.log('📋 Found coupon:', coupon ? { code: coupon.code, isActive: coupon.isActive, startDate: coupon.startDate, endDate: coupon.endDate, minPurchase: coupon.minPurchase } : 'NOT FOUND');

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      console.log('❌ Coupon not active');
      return res.status(400).json({ success: false, message: 'Coupon is not active' });
    }

    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      console.log('❌ Coupon not yet valid');
      return res.status(400).json({ success: false, message: 'Coupon not yet valid' });
    }

    if (coupon.endDate) {
      const end = new Date(coupon.endDate);
      end.setHours(23, 59, 59, 999);
      if (now > end) {
        console.log('❌ Coupon expired');
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      console.log('❌ Usage limit reached');
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    if (orderAmount < coupon.minPurchase) {
      console.log(`❌ Order amount ${orderAmount} < min purchase ${coupon.minPurchase}`);
      return res.status(400).json({ 
        success: false, 
        message: `Minimum purchase of ₹${coupon.minPurchase} required` 
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountAmount) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountAmount;
    }

    console.log('✅ Coupon valid, discount:', discount);
    res.json({ 
      success: true, 
      data: { 
        discount, 
        coupon: {
          code: coupon.code,
          title: coupon.title,
          discountType: coupon.discountType,
          discountAmount: coupon.discountAmount
        }
      } 
    });
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
