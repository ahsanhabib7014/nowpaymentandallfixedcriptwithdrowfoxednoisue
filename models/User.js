import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  turnover: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  ipAddress: { type: String, default: '' },
  pin: { type: String, required: true },
  role: { type: String, default: 'user' },

  // 🔐 Login brute-force protection
  loginAttempts: { type: Number, default: 0 },
  loginLockedUntil: { type: Date, default: null },
  loginAttempts: { type: Number, default: 0 },
  loginLockedUntil: { type: Date, default: null },

  // 🎁 রেফারেল সিস্টেম
  referralBalance: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String, default: null },
  customCommission: { type: Number, default: null },
}, { timestamps: true });

// Next.js ক্যাশ সমস্যা এড়াতে মডেল মুছে নতুন করে কম্পাইল
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);