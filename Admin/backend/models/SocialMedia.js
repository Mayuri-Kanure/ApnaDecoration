const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'googleplus'],
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL starting with http:// or https://'
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
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

// Static method to get platform display names
socialMediaSchema.statics.getPlatformNames = function() {
  return {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    pinterest: 'Pinterest',
    googleplus: 'Google Plus'
  };
};

// Static method to get platform icons
socialMediaSchema.statics.getPlatformIcons = function() {
  return {
    facebook: 'fab fa-facebook',
    instagram: 'fab fa-instagram',
    twitter: 'fab fa-twitter',
    linkedin: 'fab fa-linkedin',
    pinterest: 'fab fa-pinterest',
    googleplus: 'fab fa-google-plus'
  };
};

module.exports = mongoose.model('SocialMedia', socialMediaSchema);
