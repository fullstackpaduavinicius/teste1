const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  addedAt: { type: Date, default: Date.now },
});

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: String,

  passwordHash: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpires: Date,

  marketingOptIn: { type: Boolean, default: false },
  unsubscribeToken: String,

  cart: [CartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
