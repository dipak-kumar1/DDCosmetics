const mongoose = require('mongoose');

const PromoBannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
    trim: true
  },
  link: {
    type: String,
    default: '',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PromoBanner', PromoBannerSchema);
