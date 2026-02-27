const mongoose = require('mongoose');

const deliveryEmergencyContactSchema = new mongoose.Schema({
  contactId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    required: true,
    default: '+91'
  },
  phone: {
    type: String,
    required: true
  },
  fullPhone: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    enum: ['family', 'friend', 'colleague', 'other'],
    default: 'other'
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate contact ID before saving
deliveryEmergencyContactSchema.pre('save', async function(next) {
  if (!this.contactId) {
    const count = await this.constructor.countDocuments();
    this.contactId = `DEC-${String(count + 1).padStart(3, '0')}`;
  }
  
  // Set full phone number
  this.fullPhone = `${this.countryCode} ${this.phone}`;
  
  next();
});

// Indexes for better performance
deliveryEmergencyContactSchema.index({ contactId: 1 });
deliveryEmergencyContactSchema.index({ deliveryId: 1 });
deliveryEmergencyContactSchema.index({ status: 1 });
deliveryEmergencyContactSchema.index({ isPrimary: 1 });

// Method to check if contact is active
deliveryEmergencyContactSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Method to set as primary contact
deliveryEmergencyContactSchema.methods.setAsPrimary = async function() {
  // Unset all other primary contacts for this delivery
  await this.constructor.updateMany(
    { deliveryId: this.deliveryId, _id: { $ne: this._id } },
    { isPrimary: false }
  );
  
  this.isPrimary = true;
  return this.save();
};

module.exports = mongoose.model('DeliveryEmergencyContact', deliveryEmergencyContactSchema);
