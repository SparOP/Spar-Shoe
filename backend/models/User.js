const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },

  // --- NEW: Email Verification Fields ---
  isVerified: { type: Boolean, default: false }, // false by default until they click the email link
  verificationToken: String,
  verificationTokenExpires: Date,

  // --- NEW: Forgot Password Fields ---
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

module.exports = mongoose.model('User', userSchema);