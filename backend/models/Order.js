const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  orderType: { type: String, enum: ['pickup', 'delivery'], required: true },
  address: { type: String }, // Required if orderType is 'delivery'
  city: { type: String },
  zipCode: { type: String },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending Confirmation', 'Confirmed', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending Confirmation' 
  },
  paymentMethod: { type: String, default: 'razorpay' },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paidAt: { type: Date },
  cancelReason: { type: String }, // New field for cancellation reason
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
