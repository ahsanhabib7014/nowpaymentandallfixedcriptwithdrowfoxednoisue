import mongoose from 'mongoose';

const WithdrawSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  amount: { type: Number, required: true },
  accountNumber: { type: String, required: true },
  method: { type: String, required: true },
  
  // 👉 Wallet type: 'main' অথবা 'referral'
  walletType: { type: String, default: 'main' },
  
  // ✅ Crypto withdraw-এর জন্য নতুন field
  deductedBDT: { type: Number, default: 0 },              // balance থেকে কত ৳ কেটেছে
  originalAmount: { type: Number, default: 0 },           // user যা টাইপ করল ($10 / ৳500)
  originalCurrency: { type: String, default: 'BDT' },     // 'USD' / 'BDT'
  exchangeRate: { type: Number, default: 1 },             // $1 = ৳X (crypto-এর জন্য)
  
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Withdraw || mongoose.model('Withdraw', WithdrawSchema);