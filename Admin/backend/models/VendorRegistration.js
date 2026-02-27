const mongoose = require('mongoose');

const vendorRegistrationSchema = new mongoose.Schema({
  // Header Section
  headerTitle: {
    type: String,
    default: 'Become Our Partner'
  },
  headerSubtitle: {
    type: String,
    default: 'Join thousands of successful sellers on our platform'
  },
  headerImage: {
    type: String,
    default: ''
  },
  
  // Why Sell With Us Section
  whySellTitle: {
    type: String,
    default: 'Why Sell With Us?'
  },
  whySellSubtitle: {
    type: String,
    default: 'Boost your sales and grow your business with our comprehensive platform'
  },
  whySellPoints: [{
    title: String,
    description: String,
    icon: String
  }],
  
  // Business Process Section
  businessProcess: {
    mainTitle: {
      type: String,
      default: '3 Easy Steps To Start Selling'
    },
    mainSubtitle: {
      type: String,
      default: 'Start selling quickly and easily with our simple onboarding process'
    },
    steps: [{
      title: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        default: ''
      },
      image: {
        type: String,
        default: ''
      }
    }]
  },
  
  // Download App Section
  downloadApp: {
    title: {
      type: String,
      default: 'Download Free Vendor App'
    },
    subtitle: {
      type: String,
      default: 'Manage your business on the go with our mobile app'
    },
    appImage: {
      type: String,
      default: ''
    },
    playStore: {
      enabled: {
        type: Boolean,
        default: true
      },
      url: {
        type: String,
        default: 'https://play.google.com/store/apps/details?id=com.example.vendorapp'
      }
    },
    appStore: {
      enabled: {
        type: Boolean,
        default: true
      },
      url: {
        type: String,
        default: 'https://apps.apple.com/app/example-vendor-app/id123456789'
      }
    }
  },
  
  // FAQ Section
  faq: {
    title: {
      type: String,
      default: 'Frequently Asked Questions'
    },
    items: [{
      question: {
        type: String,
        default: ''
      },
      answer: {
        type: String,
        default: ''
      },
      priority: {
        type: Number,
        default: 1
      },
      status: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  // Metadata
  isActive: {
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
vendorRegistrationSchema.statics.getDefaultData = function() {
  return {
    headerTitle: 'Become Our Partner',
    headerSubtitle: 'Join thousands of successful sellers on our platform',
    headerImage: '',
    whySellTitle: 'Why Sell With Us?',
    whySellPoints: [
      {
        title: 'Low Commission',
        description: 'Keep more of your earnings with our competitive rates',
        icon: 'percentage'
      },
      {
        title: 'Fast Payments',
        description: 'Get paid quickly and securely',
        icon: 'payments'
      },
      {
        title: 'Marketing Support',
        description: 'We help promote your products',
        icon: 'campaign'
      }
    ],
    businessProcess: {
      mainTitle: '3 Easy Steps To Start Selling',
      mainSubtitle: 'Start selling quickly and easily with our simple onboarding process',
      steps: [
        {
          title: 'Get Registered',
          description: 'Sign up and create your vendor account in minutes',
          image: ''
        },
        {
          title: 'Upload Products',
          description: 'Add your products with images and details',
          image: ''
        },
        {
          title: 'Start Selling',
          description: 'Begin receiving orders and grow your business',
          image: ''
        }
      ]
    },
    downloadApp: {
      title: 'Download Free Vendor App',
      subtitle: 'Manage your business on the go with our mobile app',
      appImage: '',
      playStore: {
        enabled: true,
        url: 'https://play.google.com/store/apps/details?id=com.example.vendorapp'
      },
      appStore: {
        enabled: true,
        url: 'https://apps.apple.com/app/example-vendor-app/id123456789'
      }
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'How do I start selling?',
          answer: 'Simply register as a seller, list your products, and start receiving orders.',
          priority: 1,
          status: true
        },
        {
          question: 'What are the commission rates?',
          answer: 'Our commission rates are competitive and vary by product category.',
          priority: 2,
          status: true
        }
      ]
    },
  };
};

module.exports = mongoose.model('VendorRegistration', vendorRegistrationSchema);
