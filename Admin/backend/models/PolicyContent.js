const mongoose = require('mongoose');

const policyContentSchema = new mongoose.Schema({
  pageType: {
    type: String,
    required: true,
    enum: [
      'terms',
      'privacy', 
      'refund',
      'return',
      'cancellation',
      'shipping',
      'about',
      'faq',
      'reliability'
    ],
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get content by page type
policyContentSchema.statics.getByPageType = async function(pageType) {
  return await this.findOne({ pageType });
};

// Static method to create or update content
policyContentSchema.statics.createOrUpdate = async function(pageType, content, title, updatedBy) {
  const existing = await this.findOne({ pageType });
  
  if (existing) {
    return await this.findOneAndUpdate(
      { pageType },
      { 
        content, 
        title, 
        lastUpdated: new Date(),
        updatedBy
      },
      { new: true }
    );
  } else {
    return await this.create({
      pageType,
      content,
      title,
      updatedBy
    });
  }
};

module.exports = mongoose.model('PolicyContent', policyContentSchema);
