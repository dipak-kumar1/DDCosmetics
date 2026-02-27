const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // storing slug or name as per requirement "Category (slug)"
  description: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  tags: [{ type: String }],
  discountPrice: { type: Number },
  images: [{ type: String }], // Array of image URLs
  isActive: { type: Boolean, default: true },
  
  // Wholesale Fields
  isWholesale: { type: Boolean, default: false },
  moq: { type: Number, default: 1 }, // Minimum Order Quantity
  bulkPricing: [
    {
      minQty: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  sellerType: { type: String, enum: ['own', 'partner'], default: 'own' },
  shopName: { type: String },
  contactNumber: { type: String },
  location: { type: String },

  // Metrics for Home Page
  totalSold: { type: Number, default: 0 },
  salesLast30Days: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 }, // Average rating (0-5)
  numReviews: { type: Number, default: 0 },
  isCombo: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
