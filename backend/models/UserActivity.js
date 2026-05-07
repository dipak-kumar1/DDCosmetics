const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionToken: { type: String }, // For tracking guests before they login
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  category: { type: String },
  action: { 
    type: String, 
    enum: ['view', 'search', 'cart', 'wishlist', 'purchase'],
    required: true
  },
  weight: { type: Number, default: 1 }, // view: 1, wishlist: 3, cart: 5, purchase: 10
  timeSpent: { type: Number, default: 0 }, // in seconds, mostly for 'view' action
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster querying during recommendation generation
UserActivitySchema.index({ user: 1, action: 1 });
UserActivitySchema.index({ sessionToken: 1, action: 1 });
UserActivitySchema.index({ product: 1 });
UserActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserActivity', UserActivitySchema);
