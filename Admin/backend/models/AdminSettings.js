const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  // Company Information
  businessName: {
    type: String,
    default: 'APNA DECORATION'
  },
  email: {
    type: String,
    default: 'info@apnadecoration.com'
  },
  phone: {
    type: String,
    default: '+1234567890'
  },
  address: {
    type: String,
    default: '123 Main St, City, State'
  },
  latitude: {
    type: String,
    default: ''
  },
  longitude: {
    type: String,
    default: ''
  },
  
  // Currency Settings
  currency: {
    type: String,
    default: 'USD'
  },
  currencyPosition: {
    type: String,
    default: 'left'
  },
  thousandSeparator: {
    type: String,
    default: ','
  },
  decimalSeparator: {
    type: String,
    default: '.'
  },
  
  // Business Settings
  businessModel: {
    type: String,
    default: 'single'
  },
  pagination: {
    type: String,
    default: '10'
  },
  copyrightText: {
    type: String,
    default: ''
  },
  decimalDigits: {
    type: String,
    default: '2'
  },
  
  // Payment Options
  cashOnDelivery: {
    type: Boolean,
    default: false
  },
  digitalPayment: {
    type: Boolean,
    default: false
  },
  walletPayment: {
    type: Boolean,
    default: false
  },
  offlinePayment: {
    type: Boolean,
    default: false
  },
  
  // System Settings
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  
  // App Store Settings
  showAppStore: {
    type: Boolean,
    default: false
  },
  appStoreLink: {
    type: String,
    default: ''
  },
  showPlayStore: {
    type: Boolean,
    default: false
  },
  playStoreLink: {
    type: String,
    default: ''
  },
  
  // App Settings
  appVersion: {
    type: String,
    default: '1.0.0'
  },
  androidVersion: {
    type: String,
    default: '1.0.0'
  },
  iosVersion: {
    type: String,
    default: '1.0.0'
  },
  
  // Theme Settings
  primaryColor: {
    type: String,
    default: '#1976d2'
  },
  secondaryColor: {
    type: String,
    default: '#dc004e'
  },
  logo: {
    type: String
  },
  favicon: {
    type: String
  },
  
  // Digital Product
  sellDigitalProduct: {
    type: Boolean,
    default: false
  },
  
  // Order Settings
  orderDeliveryVerification: {
    type: Boolean,
    default: false
  },
  minimumOrderAmountEnabled: {
    type: Boolean,
    default: false
  },
  showBillingAddress: {
    type: Boolean,
    default: false
  },
  freeDelivery: {
    type: Boolean,
    default: false
  },
  freeDeliveryResponsibility: {
    type: String,
    default: 'Admin'
  },
  freeDeliveryOver: {
    type: String,
    default: ''
  },
  refundValidityDays: {
    type: String,
    default: ''
  },
  guestCheckout: {
    type: Boolean,
    default: false
  },
  
  // Legacy fields
  taxRate: {
    type: Number,
    default: 10
  },
  shippingFee: {
    type: Number,
    default: 5
  },
  websiteTitle: {
    type: String,
    default: 'APNA DECORATION'
  },
  metaDescription: {
    type: String,
    default: 'APNA DECORATION - Your trusted decoration partner'
  },
  metaKeywords: {
    type: String,
    default: 'decoration, home decor, interior design'
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  paymentMethods: {
    paypal: { type: Boolean, default: true },
    stripe: { type: Boolean, default: true },
    cashOnDelivery: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: false }
  },
  shippingSettings: {
    freeShippingThreshold: { type: Number, default: 100 },
    standardShippingFee: { type: Number, default: 5 },
    expressShippingFee: { type: Number, default: 15 }
  },
  emailSettings: {
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPassword: String,
    fromEmail: String,
    fromName: { type: String, default: 'APNA DECORATION' }
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'We are currently under maintenance. Please check back soon.'
  },
  // System Settings
  systemSettings: {
    appDebug: { type: Boolean, default: false },
    appMode: { type: String, default: 'production' },
    appUrl: { type: String, default: 'https://apnadecoration.com' },
    dbConnection: { type: String, default: 'mongodb' },
    dbHost: { type: String, default: 'localhost' },
    dbPort: { type: String, default: '27017' },
    dbDatabase: { type: String, default: 'apna_decoration' },
    dbUsername: { type: String, default: '' },
    dbPassword: { type: String, default: '' },
    buyerUsername: { type: String, default: '' },
    purchaseCode: { type: String, default: '' }
  },
  // Firebase Push Notification Settings
  firebaseConfig: {
    serviceAccountContent: String,
    apiKey: String,
    authDomain: String,
    projectId: String,
    storageBucket: String,
    messagingSenderId: String,
    appId: String,
    measurementId: String
  },
  // Push Notification Messages
  pushNotificationMessages: {
    customer: {
      orderPending: { text: String, active: Boolean },
      orderConfirmation: { text: String, active: Boolean },
      orderProcessing: { text: String, active: Boolean },
      orderOutForDelivery: { text: String, active: Boolean },
      orderDelivered: { text: String, active: Boolean },
      orderReturned: { text: String, active: Boolean },
      orderFailed: { text: String, active: Boolean },
      orderCanceled: { text: String, active: Boolean },
      orderRefunded: { text: String, active: Boolean },
      refundRequestCanceled: { text: String, active: Boolean },
      messageFromDeliveryMan: { text: String, active: Boolean },
      messageFromSeller: { text: String, active: Boolean },
      fundAddedByAdmin: { text: String, active: Boolean },
      messageFromAdmin: { text: String, active: Boolean }
    },
    vendor: {
      orderPending: { text: String, active: Boolean },
      orderConfirmation: { text: String, active: Boolean },
      orderProcessing: { text: String, active: Boolean },
      orderDelivered: { text: String, active: Boolean },
      newOrder: { text: String, active: Boolean },
      productApproved: { text: String, active: Boolean },
      productRejected: { text: String, active: Boolean },
      paymentReceived: { text: String, active: Boolean },
      messageFromAdmin: { text: String, active: Boolean }
    },
    deliveryMan: {
      newDeliveryTask: { text: String, active: Boolean },
      orderPickedUp: { text: String, active: Boolean },
      orderDelivered: { text: String, active: Boolean },
      deliveryFailed: { text: String, active: Boolean },
      messageFromAdmin: { text: String, active: Boolean },
      messageFromCustomer: { text: String, active: Boolean }
    }
  },
  // Version Control
  versionControl: {
    customer: {
      android: { minVersion: String, downloadUrl: String },
      ios: { minVersion: String, downloadUrl: String }
    },
    vendor: {
      android: { minVersion: String, downloadUrl: String },
      ios: { minVersion: String, downloadUrl: String }
    },
    deliveryman: {
      android: { minVersion: String, downloadUrl: String },
      ios: { minVersion: String, downloadUrl: String }
    }
  },
  // Languages
  languages: [{
    id: Number,
    name: String,
    code: String,
    status: Boolean,
    defaultStatus: Boolean
  }],
  // Currencies
  currencies: [{
    id: Number,
    name: String,
    code: String,
    symbol: String,
    exchangeRate: Number,
    status: Boolean,
    isDefault: Boolean
  }],
  // Cookie Settings
  cookieSettings: {
    essentialCookies: { type: Boolean, default: true },
    analyticsCookies: { type: Boolean, default: false },
    marketingCookies: { type: Boolean, default: false },
    functionalCookies: { type: Boolean, default: false },
    cookiePolicyUrl: { type: String, default: '' },
    privacyPolicyUrl: { type: String, default: '' },
    cookieConsentText: { type: String, default: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.' },
    cookieConsentButtonText: { type: String, default: 'Accept All' },
    cookieConsentRejectButtonText: { type: String, default: 'Reject All' },
    cookieConsentCustomizeButtonText: { type: String, default: 'Customize' },
    showCookieBanner: { type: Boolean, default: true }
  },
  // Software Update
  softwareUpdate: {
    lastUploaded: Date,
    uploadedBy: String,
    purchaseCode: String,
    filename: String,
    filesize: Number
  }
}, {
  timestamps: true
});

// Create a singleton - there should only be one settings document
adminSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
