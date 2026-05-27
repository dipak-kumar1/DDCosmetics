const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  mobile: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'male', 'female', 'other', ''] },
  addresses: [{
    name: String,
    phone: String,
    pincode: String,
    locality: String,
    address: String,
    city: String,
    state: String,
    landmark: String,
    alternatePhone: String,
    type: { type: String, default: 'Home' }, // Home, Work, etc.
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);