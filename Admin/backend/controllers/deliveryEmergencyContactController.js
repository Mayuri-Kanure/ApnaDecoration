const DeliveryEmergencyContact = require('../models/DeliveryEmergencyContact');

exports.getEmergencyContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const deliveryId = req.query.deliveryId;
    const status = req.query.status;

    let query = {};
    
    if (deliveryId) {
      query.deliveryId = deliveryId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { contactId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { fullPhone: { $regex: search, $options: 'i' } }
      ];
    }

    // Handle case where collection doesn't exist yet
    let contacts = [];
    let total = 0;
    let stats = { totalContacts: 0, activeContacts: 0, inactiveContacts: 0, primaryContacts: 0 };

    try {
      contacts = await DeliveryEmergencyContact.find(query)
        .populate('deliveryId', 'firstName lastName email')
        .populate('createdBy', 'name email')
        .sort({ isPrimary: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      total = await DeliveryEmergencyContact.countDocuments(query);

      // Calculate statistics
      const statsResult = await DeliveryEmergencyContact.aggregate([
        { $group: {
          _id: null,
          totalContacts: { $sum: 1 },
          activeContacts: { $sum: { $cond: ['$status', 'active', 1, 0] } },
          inactiveContacts: { $sum: { $cond: ['$status', 'inactive', 1, 0] } },
          primaryContacts: { $sum: { $cond: ['$isPrimary', 1, 0] } }
        }}
      ]);

      stats = {
        totalContacts: statsResult[0]?.totalContacts || 0,
        activeContacts: statsResult[0]?.activeContacts || 0,
        inactiveContacts: statsResult[0]?.inactiveContacts || 0,
        primaryContacts: statsResult[0]?.primaryContacts || 0
      };
    } catch (dbError) {
      console.log('Collection might not exist yet, returning empty results');
      // Return empty results if collection doesn't exist
    }

    res.json({
      contacts,
      total,
      stats
    });
  } catch (error) {
    console.error('Error in getEmergencyContacts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createEmergencyContact = async (req, res) => {
  try {
    const { name, countryCode, phone, relationship, deliveryId, isPrimary } = req.body;
    const createdBy = req.user.id;

    // Check if phone already exists for this delivery
    const existingContact = await DeliveryEmergencyContact.findOne({ 
      deliveryId, 
      phone 
    });
    
    if (existingContact) {
      return res.status(400).json({ message: 'Phone number already exists for this delivery person' });
    }

    const contact = new DeliveryEmergencyContact({
      name,
      countryCode,
      phone,
      relationship,
      deliveryId,
      isPrimary: isPrimary || false,
      createdBy
    });

    // If setting as primary, unset other primary contacts
    if (isPrimary) {
      await DeliveryEmergencyContact.updateMany(
        { deliveryId, _id: { $ne: contact._id } },
        { isPrimary: false }
      );
    }

    await contact.save();

    res.status(201).json({
      message: 'Emergency contact created successfully',
      contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateEmergencyContact = async (req, res) => {
  try {
    const { name, countryCode, phone, relationship, status, isPrimary } = req.body;
    
    const contact = await DeliveryEmergencyContact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }

    // Check if phone already exists (if changing)
    if (phone && phone !== contact.phone) {
      const existingContact = await DeliveryEmergencyContact.findOne({ 
        deliveryId: contact.deliveryId,
        phone 
      });
      
      if (existingContact) {
        return res.status(400).json({ message: 'Phone number already exists for this delivery person' });
      }
    }

    // If setting as primary, unset other primary contacts
    if (isPrimary && !contact.isPrimary) {
      await DeliveryEmergencyContact.updateMany(
        { deliveryId: contact.deliveryId, _id: { $ne: contact._id } },
        { isPrimary: false }
      );
    }

    const updatedContact = await DeliveryEmergencyContact.findByIdAndUpdate(
      req.params.id,
      {
        name,
        countryCode,
        phone,
        relationship,
        status,
        isPrimary
      },
      { new: true }
    ).populate('deliveryId', 'firstName lastName email')
     .populate('createdBy', 'name email');

    res.json({
      message: 'Emergency contact updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteEmergencyContact = async (req, res) => {
  try {
    const contact = await DeliveryEmergencyContact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }

    res.json({
      message: 'Emergency contact deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmergencyContactById = async (req, res) => {
  try {
    const contact = await DeliveryEmergencyContact.findById(req.params.id)
      .populate('deliveryId', 'firstName lastName email')
      .populate('createdBy', 'name email');
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }

    res.json({
      contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getContactsByDeliveryId = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    
    const contacts = await DeliveryEmergencyContact.find({ deliveryId })
      .populate('createdBy', 'name email')
      .sort({ isPrimary: -1, createdAt: -1 });

    res.json({
      contacts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.setPrimaryContact = async (req, res) => {
  try {
    const contact = await DeliveryEmergencyContact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }

    await contact.setAsPrimary();

    res.json({
      message: 'Primary contact set successfully',
      contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
