const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// Create booking (public)
router.post('/', upload.single('referenceImage'), async (req, res) => {
  try {
    let referenceImageUrl = null;
    
    if (req.file) {
      referenceImageUrl = await uploadToCloudinary(req.file, 'bookings');
    }
    
    const bookingData = {
      ...req.body,
      referenceImage: referenceImageUrl
    };
    
    const booking = new Booking(bookingData);
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Get all bookings (admin)
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('service', 'name price')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Update booking status (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
});

// Delete booking (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking'
    });
  }
});

module.exports = router;
