import mongoose from 'mongoose';

const GameHistorySchema = new mongoose.Schema({
  uid: { type: String, required: true },
  periodNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  userChoice: { type: String, required: true }, // 'big' অথবা 'small'
  winningNumber: { type: Number, required: true }, // ০ থেকে ৯ এর মধ্যে রেন্ডম নম্বর
  winningChoice: { type: String, required: true }, // 'big' অথবা 'small'
  status: { type: String, required: true }, // 'win' অথবা 'loss'
}, { timestamps: true });

export default mongoose.models.GameHistory || mongoose.model('GameHistory', GameHistorySchema);