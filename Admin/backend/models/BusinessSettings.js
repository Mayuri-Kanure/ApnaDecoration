const mongoose = require('mongoose');

const BusinessSettingsSchema = new mongoose.Schema({
  maintenanceMode: Boolean,
  companyName: String,
  phone: String,
  email: String,
  country: String,
  timezone: String,
  language: String,
  address: String,
  latitude: String,
  longitude: String,
  currency: String,
  currencyPosition: String,
  businessModel: String,
  pagination: Number,
  copyrightText: String,
  decimalDigits: Number,
  appStoreLink: String,
  playStoreLink: String,
  showAppStore: Boolean,
  showPlayStore: Boolean,
  primaryColor: String,
  secondaryColor: String,
  headerLogo: String,
  footerLogo: String,
  favicon: String,
  loadingGif: String,
  appLogo: String
}, { timestamps: true });

module.exports = mongoose.model('BusinessSettings', BusinessSettingsSchema);
