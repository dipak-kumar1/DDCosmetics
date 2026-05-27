const mongoose = require('mongoose');

const UtilityBarItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  badge: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('UtilityBarItem', UtilityBarItemSchema);
