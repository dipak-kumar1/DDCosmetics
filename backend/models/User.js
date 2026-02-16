const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  mobile: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  addresses: [{
    type: { type: String, default: 'Home' }, // Home, Work, etc.
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);