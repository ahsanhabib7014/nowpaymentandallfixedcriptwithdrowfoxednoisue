// import mongoose from 'mongoose';

// // ইউজার স্কিমা (ব্যালেন্স ও টার্নওভারের জন্য)
// const userSchema = new mongoose.Schema({
//   uid: { type: String, required: true, unique: true },
//   balance: { type: Number, default: 0, min: 0 },
//   turnover: { type: Number, default: 0, min: 0 }
// }, { timestamps: true });

// // বেড স্কিমা
// const betSchema = new mongoose.Schema({
//   uid: { type: String, required: true },
//   choice: { type: String, enum: ['Big', 'Small'], required: true },
//   amount: { type: Number, required: true, min: 1 },
//   periodNumber: { type: String, required: true },
//   status: { type: String, default: 'pending' }
// }, { timestamps: true });

// // গেম রেজাল্ট স্কিমা
// const resultSchema = new mongoose.Schema({
//   periodNumber: { type: String, required: true, unique: true },
//   result: { type: String, enum: ['Big', 'Small'], required: true },
//   totalBig: { type: Number, default: 0 },
//   totalSmall: { type: Number, default: 0 }
// }, { timestamps: true });

// export const User = mongoose.models.User || mongoose.model('User', userSchema);
// export const Bet = mongoose.models.Bet || mongoose.model('Bet', betSchema);
// export const GameResult = mongoose.models.GameResult || mongoose.model('GameResult', resultSchema);


import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  periodNumber: { type: String, required: true, unique: true },
  result: { type: String, enum: ['Big', 'Small'], required: true },
  totalBig: { type: Number, default: 0 },
  totalSmall: { type: Number, default: 0 }
}, { timestamps: true });

export const GameResult = mongoose.models.GameResult || mongoose.model('GameResult', resultSchema);