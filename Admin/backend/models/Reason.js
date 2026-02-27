const mongoose = require('mongoose');

const reasonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get default data
reasonSchema.statics.getDefaultData = function() {
  return [
    {
      title: 'Low Commission Rates',
      description: 'Keep more of your earnings with our competitive commission structure designed to help you grow your business.',
      priority: 3,
      status: true
    },
    {
      title: 'Fast & Secure Payments',
      description: 'Get paid quickly and securely with our multiple payment options and reliable payment processing system.',
      priority: 2,
      status: true
    },
    {
      title: 'Marketing Support',
      description: 'We help promote your products through our marketing channels and provide tools to boost your visibility.',
      priority: 1,
      status: true
    }
  ];
};

module.exports = mongoose.model('Reason', reasonSchema);
