const mongoose = require('mongoose');

const BrandingSchema = new mongoose.Schema({
  logoUrl: {
    type: String,
    default: ''
  },
  logoPublicId: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'DDCosmetics'
  },
  themeColor: {
    type: String,
    default: '#ffffff'
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  }
}, { timestamps: true });

module.exports = mongoose.model('Branding', BrandingSchema);
