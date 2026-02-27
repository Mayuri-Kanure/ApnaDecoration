const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
  type: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Remove duplicate timestamps when updating
addressSchema.pre('save', function(next) {
  if (this.isNew) {
    return next();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Address', addressSchema);
