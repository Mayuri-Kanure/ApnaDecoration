const mongoose = require('mongoose');

const withdrawMethodSchema = new mongoose.Schema({
  methodId: {
    type: String,
    required: true,
    unique: true
  },
  methodName: {
    type: String,
    required: true
  },
  methodFields: [{
    inputType: {
      type: String,
      enum: ['text', 'number', 'textarea', 'date', 'email', 'file'],
      required: true
    },
    fieldName: {
      type: String,
      required: true
    },
    placeholderText: {
      type: String,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate method ID before saving
withdrawMethodSchema.pre('save', async function(next) {
  if (!this.methodId) {
    const count = await this.constructor.countDocuments();
    this.methodId = `WM-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes for better performance
withdrawMethodSchema.index({ methodId: 1 });
withdrawMethodSchema.index({ methodName: 1 });
withdrawMethodSchema.index({ isActive: 1 });

// Method to check if method is active
withdrawMethodSchema.methods.isMethodActive = function() {
  return this.isActive;
};

// Method to get method fields
withdrawMethodSchema.methods.getFields = function() {
  return this.methodFields;
};

module.exports = mongoose.model('WithdrawMethod', withdrawMethodSchema);
