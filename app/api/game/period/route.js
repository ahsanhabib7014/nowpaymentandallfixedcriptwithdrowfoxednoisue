// // // import { NextResponse } from 'next/server';
// // // import dbConnect from '@/lib/mongodb'; 
// // // import { Bet, GameResult } from '@/models/Game';
// // // import jwt from 'jsonwebtoken';

// // // export async function GET(req) {
// // //   try {
// // //     // ১. ডাটাবেজ কানেক্ট করা[cite: 10, 13]
// // //     await dbConnect();

// // //     // হেডার থেকে JWT Bearer Token চেক করা (ইউজার লগইন করা থাকলে)
// // //     let tokenUid = null;
// // //     const authHeader = req.headers.get('authorization');
// // //     if (authHeader && authHeader.startsWith('Bearer ')) {
// // //       try {
// // //         const token = authHeader.split(' ')[1];
// // //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //         tokenUid = decoded.uid || decoded.userId;
// // //       } catch (err) {
// // //         // টোকেন মেয়াদোত্তীর্ণ বা ইনভ্যালিড হলে গেমের টাইমার ও গ্লোবাল রেজাল্ট ফেচ করতে বাধা দেবে না
// // //       }
// // //     }

// // //     const currentTime = Date.now();
// // //     const periodDuration = 30;
// // //     const epochSeconds = Math.floor(currentTime / 1000);
// // //     const timeLeft = periodDuration - (epochSeconds % periodDuration);
    
// // //     const basePeriodNumber = Math.floor(epochSeconds / periodDuration);
// // //     const periodNumber = `PER-${basePeriodNumber}`;

// // //     // ২. আগের পিরিয়ডের ফলাফল প্রসেস করা (যদি ইতিমধ্যে সেভ করা না থাকে)[cite: 10, 13]
// // //     const prevPeriodNumber = `PER-${basePeriodNumber - 1}`;
// // //     let checkPrev = await GameResult.findOne({ periodNumber: prevPeriodNumber });

// // //     if (!checkPrev) {
// // //       try {
// // //         const bets = await Bet.find({ periodNumber: prevPeriodNumber });
// // //         let totalBig = 0;
// // //         let totalSmall = 0;

// // //         bets.forEach(bet => {
// // //           if (bet.choice === 'Big' || bet.choice === 'BIG') totalBig += bet.amount;
// // //           if (bet.choice === 'Small' || bet.choice === 'SMALL') totalSmall += bet.amount;
// // //         });

// // //         let winningResult = '';
// // //         if (totalBig > totalSmall) {
// // //           winningResult = 'Small';
// // //         } else if (totalSmall > totalBig) {
// // //           winningResult = 'Big';
// // //         } else {
// // //           winningResult = Math.random() < 0.5 ? 'Big' : 'Small';
// // //         }

// // //         // ডাটাবেজে ফাইনাল রেজাল্ট সেভ করা[cite: 10, 13]
// // //         checkPrev = await GameResult.create({
// // //           periodNumber: prevPeriodNumber,
// // //           result: winningResult,
// // //           totalBig,
// // //           totalSmall
// // //         });

// // //         // ৩. আগের পিরিয়ডের সমস্ত পেন্ডিং বেটের ফলাফল আপডেট করা[cite: 10, 13]
// // //         if (bets.length > 0) {
// // //           for (let bet of bets) {
// // //             if (bet.status === 'PENDING' || bet.status === 'pending' || bet.result === 'pending') {
// // //               const userChoiceFormatted = bet.choice.toLowerCase();
// // //               const winningResultFormatted = winningResult.toLowerCase();

// // //               if (userChoiceFormatted === winningResultFormatted) {
// // //                 bet.status = 'WIN';
// // //                 bet.outcome = 'WIN';
// // //                 bet.result = 'win';
// // //                 bet.returnAmount = bet.amount * 2; 
// // //                 await bet.save();
// // //               } else {
// // //                 bet.status = 'LOSS';
// // //                 bet.outcome = 'LOSS';
// // //                 bet.result = 'loss';
// // //                 bet.returnAmount = 0;
// // //                 await bet.save();
// // //               }
// // //             }
// // //           }
// // //         }

// // //       } catch (err) {
// // //         console.log('Result already processed or minor db error:', err.message);
// // //       }
// // //     }

// // //     // ৪. টোকেন থেকে প্রাপ্ত আইডি দিয়ে বর্তমান পিরিয়ডে বেট ও সাম্প্রতিক বেট স্ট্যাটাস চেক করা[cite: 10, 13]
// // //     let userBetResult = null;
// // //     let hasUserBetForThisPeriod = false;

// // //     if (tokenUid) {
// // //       const currentBet = await Bet.findOne({
// // //         $or: [{ uid: tokenUid }, { userId: tokenUid }],$or: [
// // //           { periodNumber: periodNumber },
// // //           { roundNo: Number(periodNumber.replace('PER-', '')) }
// // //         ]
// // //       });

// // //       if (currentBet) {
// // //         hasUserBetForThisPeriod = true;
// // //       }

// // //       // সাম্প্রতিক বেটের স্ট্যাটাস (টোস্ট মেসেজের জন্য)[cite: 10, 13]
// // //       const latestBet = await Bet.findOne({ 
// // //         $or: [{ uid: tokenUid }, { userId: tokenUid }] 
// // //       }).sort({ createdAt: -1 });

// // //       if (latestBet) {
// // //         userBetResult = {
// // //           periodNumber: latestBet.periodNumber || latestBet.roundNo,
// // //           choice: latestBet.choice,
// // //           result: latestBet.result || latestBet.status.toLowerCase()
// // //         };
// // //       }
// // //     }

// // //     // ৫. সাম্প্রতিক ১০টি গ্লোবাল রেজাল্ট ফেচ করা[cite: 10, 13]
// // //     const recentResults = await GameResult.find().sort({ createdAt: -1 }).limit(10);

// // //     return NextResponse.json({
// // //       success: true,
// // //       periodNumber,
// // //       timeLeft,
// // //       recentResults,
// // //       userBetResult,
// // //       hasUserBetForThisPeriod
// // //     });

// // //   } catch (error) {
// // //     console.error('API PERIOD ERROR:', error);
// // //     return NextResponse.json({ 
// // //       success: false, 
// // //       message: 'Server error: ' + error.message 
// // //     }, { status: 500 });
// // //   }
// // // }

// // // import { NextResponse } from 'next/server';
// // // import dbConnect from '@/lib/mongodb'; 
// // // import { Bet, GameResult } from '@/models/Game';
// // // import jwt from 'jsonwebtoken';

// // // export async function GET(req) {
// // //   try {
// // //     // ১. ডাটাবেজ কানেক্ট করা[cite: 10, 13]
// // //     await dbConnect();

// // //     // হেডার থেকে JWT Bearer Token চেক করা (ইউজার লগইন করা থাকলে)
// // //     let tokenUid = null;
// // //     const authHeader = req.headers.get('authorization');
// // //     if (authHeader && authHeader.startsWith('Bearer ')) {
// // //       try {
// // //         const token = authHeader.split(' ')[1];
// // //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //         tokenUid = decoded.uid || decoded.userId;
// // //       } catch (err) {
// // //         // টোকেন মেয়াদোত্তীর্ণ বা ইনভ্যালিড হলে গেমের টাইমার ও গ্লোবাল রেজাল্ট ফেচ করতে বাধা দেবে না
// // //       }
// // //     }

// // //     const currentTime = Date.now();
// // //     const periodDuration = 30;
// // //     const epochSeconds = Math.floor(currentTime / 1000);
// // //     const timeLeft = periodDuration - (epochSeconds % periodDuration);
    
// // //     const basePeriodNumber = Math.floor(epochSeconds / periodDuration);
// // //     const periodNumber = `PER-${basePeriodNumber}`;

// // //     // ২. আগের পিরিয়ডের ফলাফল প্রসেস করা (যদি ইতিমধ্যে সেভ করা না থাকে)[cite: 10, 13]
// // //     const prevPeriodNumber = `PER-${basePeriodNumber - 1}`;
// // //     let checkPrev = await GameResult.findOne({ periodNumber: prevPeriodNumber });

// // //     if (!checkPrev) {
// // //       try {
// // //         const bets = await Bet.find({ periodNumber: prevPeriodNumber });
// // //         let totalBig = 0;
// // //         let totalSmall = 0;

// // //         bets.forEach(bet => {
// // //           if (bet.choice === 'Big' || bet.choice === 'BIG') totalBig += bet.amount;
// // //           if (bet.choice === 'Small' || bet.choice === 'SMALL') totalSmall += bet.amount;
// // //         });

// // //         let winningResult = '';
// // //         if (totalBig > totalSmall) {
// // //           winningResult = 'Small';
// // //         } else if (totalSmall > totalBig) {
// // //           winningResult = 'Big';
// // //         } else {
// // //           winningResult = Math.random() < 0.5 ? 'Big' : 'Small';
// // //         }

// // //         // ডাটাবেজে ফাইনাল রেজাল্ট সেভ করা[cite: 10, 13]
// // //         checkPrev = await GameResult.create({
// // //           periodNumber: prevPeriodNumber,
// // //           result: winningResult,
// // //           totalBig,
// // //           totalSmall
// // //         });

// // //         // ৩. আগের পিরিয়ডের সমস্ত পেন্ডিং বেটের ফলাফল আপডেট করা[cite: 10, 13]
// // //         if (bets.length > 0) {
// // //           for (let bet of bets) {
// // //             if (bet.status === 'PENDING' || bet.status === 'pending' || bet.result === 'pending') {
// // //               const userChoiceFormatted = bet.choice.toLowerCase();
// // //               const winningResultFormatted = winningResult.toLowerCase();

// // //               if (userChoiceFormatted === winningResultFormatted) {
// // //                 bet.status = 'WIN';
// // //                 bet.outcome = 'WIN';
// // //                 bet.result = 'win';
// // //                 bet.returnAmount = bet.amount * 2; 
// // //                 await bet.save();
// // //               } else {
// // //                 bet.status = 'LOSS';
// // //                 bet.outcome = 'LOSS';
// // //                 bet.result = 'loss';
// // //                 bet.returnAmount = 0;
// // //                 await bet.save();
// // //               }
// // //             }
// // //           }
// // //         }

// // //       } catch (err) {
// // //         console.log('Result already processed or minor db error:', err.message);
// // //       }
// // //     }

// // //     // ৪. টোকেন থেকে প্রাপ্ত আইডি দিয়ে বর্তমান পিরিয়ডে বেট ও সাম্প্রতিক বেট স্ট্যাটাস চেক করা[cite: 10, 13]
// // //     let userBetResult = null;
// // //     let hasUserBetForThisPeriod = false;

// // //     if (tokenUid) {
// // //       const currentBet = await Bet.findOne({
// // //         $or: [{ uid: tokenUid }, { userId: tokenUid }],$or: [
// // //           { periodNumber: periodNumber },
// // //           { roundNo: Number(periodNumber.replace('PER-', '')) }
// // //         ]
// // //       });

// // //       if (currentBet) {
// // //         hasUserBetForThisPeriod = true;
// // //       }

// // //       // সাম্প্রতিক বেটের স্ট্যাটাস (টোস্ট মেসেজের জন্য)[cite: 10, 13]
// // //       const latestBet = await Bet.findOne({ 
// // //         $or: [{ uid: tokenUid }, { userId: tokenUid }] 
// // //       }).sort({ createdAt: -1 });

// // //       if (latestBet) {
// // //         userBetResult = {
// // //           periodNumber: latestBet.periodNumber || latestBet.roundNo,
// // //           choice: latestBet.choice,
// // //           result: latestBet.result || latestBet.status.toLowerCase()
// // //         };
// // //       }
// // //     }

// // //     // ৫. সাম্প্রতিক ১০টি গ্লোবাল রেজাল্ট ফেচ করা[cite: 10, 13]
// // //     const recentResults = await GameResult.find().sort({ createdAt: -1 }).limit(10);

// // //     return NextResponse.json({
// // //       success: true,
// // //       periodNumber,
// // //       timeLeft,
// // //       recentResults,
// // //       userBetResult,
// // //       hasUserBetForThisPeriod
// // //     });

// // //   } catch (error) {
// // //     console.error('API PERIOD ERROR:', error);
// // //     return NextResponse.json({ 
// // //       success: false, 
// // //       message: 'Server error: ' + error.message 
// // //     }, { status: 500 });
// // //   }
// // // }

// // import { NextResponse } from 'next/server';
// // import mongoose from 'mongoose';
// // import jwt from 'jsonwebtoken';
// // import dbConnect from '@/lib/mongodb'; 
// // import User from '@/models/User';
// // import Bet from '@/models/Bet';
// // import { GameResult } from '@/models/Game';

// // export async function GET(req) {
// //   try {
// //     // ১. ডাটাবেজ কানেক্ট করা
// //     await dbConnect();

// //     // ২. HttpOnly কুকি থেকে টোকেন ভেরিফাই করা
// //     const token = req.cookies.get('token')?.value;
// //     let tokenUid = null;
// //     let tokenObjectId = null;

// //     if (token) {
// //       try {
// //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //         tokenUid = decoded.uid || decoded.phone || decoded.userId;

// //         // ✅ tokenUid যদি valid ObjectId হয়, তবেই userId query-তে ব্যবহার করা যাবে
// //         if (tokenUid && mongoose.isValidObjectId(tokenUid)) {
// //           tokenObjectId = tokenUid;
// //         }
// //       } catch (err) {
// //         // টোকেন ইনভ্যালিড হলেও টাইমার/রেজাল্ট দেখাবে
// //       }
// //     }

// //     const currentTime = Date.now();
// //     const periodDuration = 30;
// //     const epochSeconds = Math.floor(currentTime / 1000);
// //     const timeLeft = periodDuration - (epochSeconds % periodDuration);
    
// //     const basePeriodNumber = Math.floor(epochSeconds / periodDuration);
// //     const periodNumber = `PER-${basePeriodNumber}`;
// //     const currentRoundNo = basePeriodNumber;

// //     // ৩. আগের পিরিয়ডের ফলাফল প্রসেস করা
// //     const prevPeriodNumber = `PER-${basePeriodNumber - 1}`;
// //     const prevRoundNo = basePeriodNumber - 1;

// //     let checkPrev = await GameResult.findOne({ periodNumber: prevPeriodNumber });

// //     if (!checkPrev) {
// //       try {
// //         const bets = await Bet.find({
// //           $or: [
// //             { periodNumber: prevPeriodNumber },
// //             { roundNo: String(prevRoundNo) }
// //           ]
// //         });

// //         let totalBig = 0;
// //         let totalSmall = 0;

// //         bets.forEach(bet => {
// //           if (bet.choice === 'Big' || bet.choice === 'BIG') totalBig += bet.amount;
// //           if (bet.choice === 'Small' || bet.choice === 'SMALL') totalSmall += bet.amount;
// //         });

// //         // হাউস এজ: বেশি বেট যেদিকে, তার বিপরীতে রেজাল্ট
// //         let winningResult = '';
// //         if (totalBig > totalSmall) {
// //           winningResult = 'Small';
// //         } else if (totalSmall > totalBig) {
// //           winningResult = 'Big';
// //         } else {
// //           winningResult = Math.random() < 0.5 ? 'Big' : 'Small';
// //         }

// //         checkPrev = await GameResult.create({
// //           periodNumber: prevPeriodNumber,
// //           result: winningResult,
// //           totalBig,
// //           totalSmall
// //         });

// //         // ৪. পেন্ডিং বেট আপডেট + WIN হলে ব্যালেন্স যোগ
// //         if (bets.length > 0) {
// //           for (let bet of bets) {
// //             if (bet.status === 'PENDING' || bet.status === 'pending' || bet.result === 'pending') {
// //               const userChoiceFormatted = String(bet.choice).toLowerCase();
// //               const winningResultFormatted = winningResult.toLowerCase();

// //               if (userChoiceFormatted === winningResultFormatted) {
// //                 bet.status = 'WIN';
// //                 bet.outcome = 'WIN';
// //                 bet.result = 'win';
// //                 bet.returnAmount = bet.amount * 2;
// //                 await bet.save();

// //                 // ✅ WIN হলে ইউজারের ব্যালেন্সে payout যোগ
// //                 try {
// //                   if (bet.userId) {
// //                     await User.findByIdAndUpdate(
// //                       bet.userId,
// //                       { $inc: { balance: bet.amount * 2 } }
// //                     );
// //                   }
// //                 } catch (userErr) {
// //                   console.error('Balance payout error for bet', bet._id, userErr.message);
// //                 }
// //               } else {
// //                 bet.status = 'LOSS';
// //                 bet.outcome = 'LOSS';
// //                 bet.result = 'loss';
// //                 bet.returnAmount = 0;
// //                 await bet.save();
// //               }
// //             }
// //           }
// //         }

// //       } catch (err) {
// //         console.log('Result already processed or minor db error:', err.message);
// //       }
// //     }

// //     // ৫. ইউজারের বর্তমান বেট ও ব্যালেন্স চেক
// //     let userBetResult = null;
// //     let hasUserBetForThisPeriod = false;
// //     let userBalance = undefined;

// //     if (tokenUid) {
// //       // ✅ valid ObjectId থাকলেই userId clause যোগ হবে
// //       const userBetQuery = [{ uid: tokenUid }];
// //       if (tokenObjectId) {
// //         userBetQuery.push({ userId: tokenObjectId });
// //       }

// //       const currentBet = await Bet.findOne({
// //         $and: [
// //           { $or: userBetQuery },
// //           { $or: [
// //               { periodNumber: periodNumber },
// //               { roundNo: String(currentRoundNo) }
// //           ]}
// //         ]
// //       });

// //       if (currentBet) {
// //         hasUserBetForThisPeriod = true;
// //       }

// //       // সাম্প্রতিক বেটের স্ট্যাটাস (টোস্ট মেসেজের জন্য)
// //       const latestBet = await Bet.findOne({ 
// //         $or: userBetQuery 
// //       }).sort({ createdAt: -1 });

// //       if (latestBet) {
// //         userBetResult = {
// //           periodNumber: latestBet.periodNumber || latestBet.roundNo,
// //           choice: latestBet.choice,
// //           result: latestBet.result || (latestBet.status ? latestBet.status.toLowerCase() : 'pending')
// //         };
// //       }

// //       // ✅ ব্যালেন্স ফ্রন্টএন্ডে পাঠানো
// //       const userQuery = [{ uid: tokenUid }];
// //       if (tokenObjectId) {
// //         userQuery.push({ _id: tokenObjectId });
// //       }

// //       const dbUser = await User.findOne({ $or: userQuery }).select('balance');

// //       if (dbUser && dbUser.balance !== undefined) {
// //         userBalance = Number(dbUser.balance);
// //       }
// //     }

// //     // ৬. সাম্প্রতিক ১০টি গ্লোবাল রেজাল্ট
// //     const recentResults = await GameResult.find().sort({ createdAt: -1 }).limit(10);

// //     return NextResponse.json({
// //       success: true,
// //       periodNumber,
// //       timeLeft,
// //       recentResults,
// //       userBetResult,
// //       hasUserBetForThisPeriod,
// //       balance: userBalance
// //     }, {
// //       status: 200,
// //       headers: {
// //         'Cache-Control': 'no-store, no-cache, must-revalidate'
// //       }
// //     });

// //   } catch (error) {
// //     console.error('API PERIOD ERROR:', error);
// //     return NextResponse.json({ 
// //       success: false, 
// //       message: 'Server error: ' + error.message 
// //     }, { status: 500 });
// //   }
// // }

// // .................................................................

// import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import jwt from 'jsonwebtoken';
// import dbConnect from '@/lib/mongodb'; 
// import User from '@/models/User';
// import Bet from '@/models/Bet';
// import { GameResult } from '@/models/Game';

// export async function GET(req) {
//   try {
//     // ১. ডাটাবেজ কানেক্ট করা
//     await dbConnect();

//     // ২. HttpOnly কুকি থেকে টোকেন ভেরিফাই করা
//     const token = req.cookies.get('token')?.value;
//     let tokenUid = null;
//     let tokenObjectId = null;

//     if (token) {
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         tokenUid = decoded.uid || decoded.phone || decoded.userId;

//         // ✅ tokenUid যদি valid ObjectId হয়, তবেই userId query-তে ব্যবহার করা যাবে
//         if (tokenUid && mongoose.isValidObjectId(tokenUid)) {
//           tokenObjectId = tokenUid;
//         }
//       } catch (err) {
//         // টোকেন ইনভ্যালিড হলেও টাইমার/রেজাল্ট দেখাবে
//       }
//     }

//     const currentTime = Date.now();
//     const periodDuration = 30;
//     const epochSeconds = Math.floor(currentTime / 1000);
//     const timeLeft = periodDuration - (epochSeconds % periodDuration);
    
//     const basePeriodNumber = Math.floor(epochSeconds / periodDuration);
//     const periodNumber = `PER-${basePeriodNumber}`;
//     const currentRoundNo = basePeriodNumber;

//     // ৩. আগের পিরিয়ডের ফলাফল প্রসেস করা
//     const prevPeriodNumber = `PER-${basePeriodNumber - 1}`;
//     const prevRoundNo = basePeriodNumber - 1;

//     // ==========================================
//     // ✅✅✅ নতুন: ATOMIC result processing
//     // Race condition proof — একসাথে ১০ request এলেও একবারই চলবে
//     // ==========================================
//     try {
//       // ১. প্রথমে bets খুঁজে বের করা (result তৈরি করার আগেই দরকার)
//       const bets = await Bet.find({
//         $or: [
//           { periodNumber: prevPeriodNumber },
//           { roundNo: String(prevRoundNo) }
//         ]
//       });

//       let totalBig = 0;
//       let totalSmall = 0;

//       bets.forEach(bet => {
//         if (bet.choice === 'Big' || bet.choice === 'BIG') totalBig += bet.amount;
//         if (bet.choice === 'Small' || bet.choice === 'SMALL') totalSmall += bet.amount;
//       });

//       // হাউস এজ: বেশি বেট যেদিকে, তার বিপরীতে রেজাল্ট
//       let winningResult = '';
//       if (totalBig > totalSmall) {
//         winningResult = 'Small';
//       } else if (totalSmall > totalBig) {
//         winningResult = 'Big';
//       } else {
//         winningResult = Math.random() < 0.5 ? 'Big' : 'Small';
//       }

//       // ✅ ATOMIC UPSERT
//       // - যদি result আগেই থাকে → কিছুই হবে না
//       // - যদি না থাকে → নতুন তৈরি হবে
//       let isNewlyCreated = false;
//       try {
//         const upsertResult = await GameResult.findOneAndUpdate(
//           { periodNumber: prevPeriodNumber },
//           { 
//             $setOnInsert: { 
//               periodNumber: prevPeriodNumber,
//               result: winningResult,
//               totalBig,
//               totalSmall
//             } 
//           },
//           { 
//             upsert: true, 
//             new: true, 
//             rawResult: true 
//           }
//         );
        
//         // true = নতুন তৈরি (bets প্রসেস করতে হবে)
//         // false = আগেই ছিল (bets প্রসেস করা লাগবে না)
//         isNewlyCreated = !upsertResult.lastErrorObject?.updatedExisting;
//       } catch (err) {
//         // Duplicate key error = অন্য কেউ আগেই তৈরি করেছে
//         if (err.code === 11000) {
//           isNewlyCreated = false;
//         } else {
//           throw err;
//         }
//       }

//       // ✅ শুধু নতুন তৈরি হলে bets প্রসেস করুন
//       // এতে balance কখনো দুইবার যোগ হবে না
//       if (isNewlyCreated && bets.length > 0) {
//         for (let bet of bets) {
//           if (bet.status === 'PENDING' || bet.status === 'pending' || bet.result === 'pending') {
//             const userChoiceFormatted = String(bet.choice).toLowerCase();
//             const winningResultFormatted = winningResult.toLowerCase();

//             if (userChoiceFormatted === winningResultFormatted) {
//               bet.status = 'WIN';
//               bet.outcome = 'WIN';
//               bet.result = 'win';
//               bet.returnAmount = bet.amount * 2;
//               await bet.save();

//               try {
//                 if (bet.userId) {
//                   await User.findByIdAndUpdate(
//                     bet.userId,
//                     { $inc: { balance: bet.amount * 2 } }
//                   );
//                 }
//               } catch (userErr) {
//                 console.error('Balance payout error for bet', bet._id, userErr.message);
//               }
//             } else {
//               bet.status = 'LOSS';
//               bet.outcome = 'LOSS';
//               bet.result = 'loss';
//               bet.returnAmount = 0;
//               await bet.save();
//             }
//           }
//         }
//       }

//     } catch (err) {
//       console.log('Result processing error:', err.message);
//     }
//     // ==========================================

//     // ৫. ইউজারের বর্তমান বেট ও ব্যালেন্স চেক
//     let userBetResult = null;
//     let hasUserBetForThisPeriod = false;
//     let userBalance = undefined;

//     if (tokenUid) {
//       // ✅ valid ObjectId থাকলেই userId clause যোগ হবে
//       const userBetQuery = [{ uid: tokenUid }];
//       if (tokenObjectId) {
//         userBetQuery.push({ userId: tokenObjectId });
//       }

//       const currentBet = await Bet.findOne({
//         $and: [
//           { $or: userBetQuery },
//           { $or: [
//               { periodNumber: periodNumber },
//               { roundNo: String(currentRoundNo) }
//           ]}
//         ]
//       });

//       if (currentBet) {
//         hasUserBetForThisPeriod = true;
//       }

//       // সাম্প্রতিক বেটের স্ট্যাটাস (টোস্ট মেসেজের জন্য)
//       const latestBet = await Bet.findOne({ 
//         $or: userBetQuery 
//       }).sort({ createdAt: -1 });

//       if (latestBet) {
//         userBetResult = {
//           periodNumber: latestBet.periodNumber || latestBet.roundNo,
//           choice: latestBet.choice,
//           result: latestBet.result || (latestBet.status ? latestBet.status.toLowerCase() : 'pending')
//         };
//       }

//       // ✅ ব্যালেন্স ফ্রন্টএন্ডে পাঠানো
//       const userQuery = [{ uid: tokenUid }];
//       if (tokenObjectId) {
//         userQuery.push({ _id: tokenObjectId });
//       }

//       const dbUser = await User.findOne({ $or: userQuery }).select('balance');

//       if (dbUser && dbUser.balance !== undefined) {
//         userBalance = Number(dbUser.balance);
//       }
//     }

//     // ৬. সাম্প্রতিক ১০টি গ্লোবাল রেজাল্ট
//     const recentResults = await GameResult.find().sort({ createdAt: -1 }).limit(10);

//     return NextResponse.json({
//       success: true,
//       periodNumber,
//       timeLeft,
//       recentResults,
//       userBetResult,
//       hasUserBetForThisPeriod,
//       balance: userBalance
//     }, {
//       status: 200,
//       headers: {
//         'Cache-Control': 'no-store, no-cache, must-revalidate'
//       }
//     });

//   } catch (error) {
//     console.error('API PERIOD ERROR:', error);
//     return NextResponse.json({ 
//       success: false, 
//       message: 'Server error: ' + error.message 
//     }, { status: 500 });
//   }
// }

// .................................................................

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb'; 
import User from '@/models/User';
import Bet from '@/models/Bet';
import { GameResult } from '@/models/Game';

export async function GET(req) {
  try {
    // ১. ডাটাবেজ কানেক্ট করা
    await dbConnect();

    // ২. HttpOnly কুকি থেকে টোকেন ভেরিফাই করা
    const token = req.cookies.get('token')?.value;
    let tokenUid = null;
    let tokenObjectId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        tokenUid = decoded.uid || decoded.phone || decoded.userId;

        // ✅ tokenUid যদি valid ObjectId হয়, তবেই userId query-তে ব্যবহার করা যাবে
        if (tokenUid && mongoose.isValidObjectId(tokenUid)) {
          tokenObjectId = tokenUid;
        }
      } catch (err) {
        // টোকেন ইনভ্যালিড হলেও টাইমার/রেজাল্ট দেখাবে
      }
    }

    const currentTime = Date.now();
    const periodDuration = 30;
    const epochSeconds = Math.floor(currentTime / 1000);
    const timeLeft = periodDuration - (epochSeconds % periodDuration);
    
    const basePeriodNumber = Math.floor(epochSeconds / periodDuration);
    const periodNumber = `PER-${basePeriodNumber}`;
    const currentRoundNo = basePeriodNumber;

    // ৩. আগের পিরিয়ডের ফলাফল প্রসেস করা
    const prevPeriodNumber = `PER-${basePeriodNumber - 1}`;
    const prevRoundNo = basePeriodNumber - 1;

    // ==========================================
    // ✅✅✅ ATOMIC result processing
    // Race condition proof — একসাথে ১০ request এলেও একবারই চলবে
    // ==========================================
    try {
      // ১. প্রথমে bets খুঁজে বের করা (result তৈরি করার আগেই দরকার)
      // ✅ FIX #1: roundNo Number হিসেবে query
      const bets = await Bet.find({
        $or: [
          { periodNumber: prevPeriodNumber },
          { roundNo: prevRoundNo }
        ]
      });

      let totalBig = 0;
      let totalSmall = 0;

      // ✅ FIX #2: Number conversion — string concatenation বন্ধ
      bets.forEach(bet => {
        const amt = Number(bet.amount) || 0;
        if (bet.choice === 'Big' || bet.choice === 'BIG') totalBig += amt;
        if (bet.choice === 'Small' || bet.choice === 'SMALL') totalSmall += amt;
      });

      // হাউস এজ: বেশি বেট যেদিকে, তার বিপরীতে রেজাল্ট
      let winningResult = '';
      if (totalBig > totalSmall) {
        winningResult = 'Small';
      } else if (totalSmall > totalBig) {
        winningResult = 'Big';
      } else {
        winningResult = Math.random() < 0.5 ? 'Big' : 'Small';
      }

      // ✅ ATOMIC UPSERT
      // - যদি result আগেই থাকে → কিছুই হবে না
      // - যদি না থাকে → নতুন তৈরি হবে
      let isNewlyCreated = false;
      try {
        const upsertResult = await GameResult.findOneAndUpdate(
          { periodNumber: prevPeriodNumber },
          { 
            $setOnInsert: { 
              periodNumber: prevPeriodNumber,
              result: winningResult,
              totalBig,
              totalSmall
            } 
          },
          { 
            upsert: true, 
            new: true, 
            rawResult: true 
          }
        );
        
        // true = নতুন তৈরি (bets প্রসেস করতে হবে)
        // false = আগেই ছিল (bets প্রসেস করা লাগবে না)
        isNewlyCreated = !upsertResult.lastErrorObject?.updatedExisting;
      } catch (err) {
        // Duplicate key error = অন্য কেউ আগেই তৈরি করেছে
        if (err.code === 11000) {
          isNewlyCreated = false;
        } else {
          throw err;
        }
      }

      // ✅ শুধু নতুন তৈরি হলে bets প্রসেস করুন
      // এতে balance কখনো দুইবার যোগ হবে না
      if (isNewlyCreated && bets.length > 0) {
        for (let bet of bets) {
          if (bet.status === 'PENDING' || bet.status === 'pending' || bet.result === 'pending') {
            const userChoiceFormatted = String(bet.choice).toLowerCase();
            const winningResultFormatted = winningResult.toLowerCase();

            // ✅ FIX: explicit Number conversion for payout
            const betAmountNum = Number(bet.amount) || 0;

            if (userChoiceFormatted === winningResultFormatted) {
              bet.status = 'WIN';
              bet.outcome = 'WIN';
              bet.result = 'win';
              bet.returnAmount = betAmountNum * 2;
              await bet.save();

              try {
                if (bet.userId) {
                  await User.findByIdAndUpdate(
                    bet.userId,
                    { $inc: { balance: betAmountNum * 2 } }
                  );
                }
              } catch (userErr) {
                console.error('Balance payout error for bet', bet._id, userErr.message);
              }
            } else {
              bet.status = 'LOSS';
              bet.outcome = 'LOSS';
              bet.result = 'loss';
              bet.returnAmount = 0;
              await bet.save();
            }
          }
        }
      }

    } catch (err) {
      console.log('Result processing error:', err.message);
    }
    // ==========================================

    // ৫. ইউজারের বর্তমান বেট ও ব্যালেন্স চেক
    let userBetResult = null;
    let hasUserBetForThisPeriod = false;
    let userBalance = undefined;

    if (tokenUid) {
      // ✅ valid ObjectId থাকলেই userId clause যোগ হবে
      const userBetQuery = [{ uid: tokenUid }];
      if (tokenObjectId) {
        userBetQuery.push({ userId: tokenObjectId });
      }

      // ✅ FIX #3: currentRoundNo Number হিসেবে query
      const currentBet = await Bet.findOne({
        $and: [
          { $or: userBetQuery },
          { $or: [
              { periodNumber: periodNumber },
              { roundNo: currentRoundNo }
          ]}
        ]
      });

      if (currentBet) {
        hasUserBetForThisPeriod = true;
      }

      // সাম্প্রতিক বেটের স্ট্যাটাস (টোস্ট মেসেজের জন্য)
      const latestBet = await Bet.findOne({ 
        $or: userBetQuery 
      }).sort({ createdAt: -1 });

      if (latestBet) {
        userBetResult = {
          periodNumber: latestBet.periodNumber || latestBet.roundNo,
          choice: latestBet.choice,
          result: latestBet.result || (latestBet.status ? latestBet.status.toLowerCase() : 'pending')
        };
      }

      // ✅ ব্যালেন্স ফ্রন্টএন্ডে পাঠানো
      const userQuery = [{ uid: tokenUid }];
      if (tokenObjectId) {
        userQuery.push({ _id: tokenObjectId });
      }

      const dbUser = await User.findOne({ $or: userQuery }).select('balance');

      if (dbUser && dbUser.balance !== undefined) {
        userBalance = Number(dbUser.balance);
      }
    }

    // ৬. সাম্প্রতিক ১০টি গ্লোবাল রেজাল্ট
    const recentResults = await GameResult.find().sort({ createdAt: -1 }).limit(10);

    return NextResponse.json({
      success: true,
      periodNumber,
      timeLeft,
      recentResults,
      userBetResult,
      hasUserBetForThisPeriod,
      balance: userBalance
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('API PERIOD ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    }, { status: 500 });
  }
}