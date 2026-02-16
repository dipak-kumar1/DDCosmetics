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
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
