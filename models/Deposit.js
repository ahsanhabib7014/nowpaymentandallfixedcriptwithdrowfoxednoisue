// import mongoose from 'mongoose';

// const DepositSchema = new mongoose.Schema({
//   uid: { type: String, required: true, index: true },
  
//   // ✅ BDT amount (balance-এ এই amount যোগ হবে)
//   amount: { type: Number, required: true },
  
//   // ✅ USD conversion info
//   originalAmount: { type: Number, default: 0 },        // User যা দিয়েছে (যেমন $10)
//   originalCurrency: { type: String, default: 'BDT' },  // 'USD' অথবা 'BDT'
//   exchangeRate: { type: Number, default: 1 },          // Rate (যেমন 120, 125)
  
//   // ✅ Payment info
//   method: { type: String, required: true },
//   senderNumber: { type: String, required: true },      // কোন নম্বর থেকে পাঠিয়েছে
//   transactionId: { type: String, required: true, unique: true },
  
//   // ✅ Status
//   status: { 
//     type: String, 
//     enum: ['pending', 'approved', 'rejected'], 
//     default: 'pending' 
//   },
//   adminNote: { type: String, default: '' }
// }, { timestamps: true });

// export default mongoose.models.Deposit || 
//   mongoose.model('Deposit', DepositSchema);

//   ///////////////////////////////////////////////////////////////

import mongoose from 'mongoose';

const DepositSchema = new mongoose.Schema({
  uid: { type: String, required: true, index: true },
  
  // ✅ BDT amount (balance-এ এই amount যোগ হবে)
  amount: { type: Number, required: true },
  
  // ✅ USD conversion info
  originalAmount: { type: Number, default: 0 },
  originalCurrency: { type: String, default: 'BDT' },
  exchangeRate: { type: Number, default: 1 },
  
  // ✅ Payment info
  method: { type: String, required: true },
  senderNumber: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  
  // ✅ Status — 'partial' যোগ করা হলো
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'partial'], 
    default: 'pending' 
  },
  adminNote: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Deposit || 
  mongoose.model('Deposit', DepositSchema);