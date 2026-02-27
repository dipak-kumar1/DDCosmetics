const mongoose = require('mongoose');

const HeroConfigSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Redefine Your True Beauty'
  },
  subtitle: {
    type: String,
    default: 'Experience the fusion of nature and science.'
  },
  backgroundImage: {
    type: String,
    // default can be a placeholder or empty
  },
  cta1: {
    text: { type: String, default: 'Shop Now' },
    type: { 
      type: String, 
      enum: ['whatsapp', 'call', 'visit_store', 'custom_url'], 
      default: 'custom_url' 
    },
    link: { type: String, default: '/shop' }
  },
  cta2: {
    text: { type: String, default: 'New Arrivals' },
    type: { 
      type: String, 
      enum: ['whatsapp', 'call', 'visit_store', 'custom_url'], 
      default: 'custom_url' 
    },
    link: { type: String, default: '/shop?category=new-arrivals' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  offerBadge: {
    type: String,
    default: ''
  },
  deliveryInfo: {
    text: { type: String, default: '' },
    mapLink: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('HeroConfig', HeroConfigSchema);
