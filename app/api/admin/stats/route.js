// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import User from '@/models/User';
// import Deposit from '@/models/Deposit';
// import Withdraw from '@/models/Withdraw';
// import { verifyAuth } from '@/utils/authCheck';

// export async function GET(req) {
//   try {
//     await dbConnect();

//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json({ 
//         success: false, 
//         message: auth.message 
//       }, { status: auth.status });
//     }

//     // ১. মোট ইউজার
//     const totalUsers = await User.countDocuments();

//     // ২. বাংলাদেশ সময় অনুযায়ী আজকের শুরু ও শেষ (UTC+6)
//     const bdOffsetMs = 6 * 60 * 60 * 1000;
//     const now = new Date();
//     const bdNow = new Date(now.getTime() + bdOffsetMs);

//     const startOfDayBD = new Date(bdNow);
//     startOfDayBD.setUTCHours(0, 0, 0, 0);
//     const startOfDay = new Date(startOfDayBD.getTime() - bdOffsetMs);

//     const endOfDayBD = new Date(bdNow);
//     endOfDayBD.setUTCHours(23, 59, 59, 999);
//     const endOfDay = new Date(endOfDayBD.getTime() - bdOffsetMs);

//     // ৩. আজকের approved ডিপোজিট (createdAt না থাকলে _id থেকে টাইমস্ট্যাম্প)
//     const todayDeposits = await Deposit.aggregate([
//       {
//         $match: {
//           status: 'approved',
//           $expr: {
//             $and: [
//               { $gte: [{ $ifNull: ['$createdAt', { $toDate: '$_id' }] }, startOfDay] },
//               { $lte: [{ $ifNull: ['$createdAt', { $toDate: '$_id' }] }, endOfDay] }
//             ]
//           }
//         }
//       },
//       { 
//         $group: { 
//           _id: null, 
//           total: { $sum: { $toDouble: '$amount' } }
//         } 
//       }
//     ]);
//     const totalDepositToday = todayDeposits.length > 0 ? todayDeposits[0].total : 0;

//     // ৪. আজকের approved উইথড্র
//     const todayWithdraws = await Withdraw.aggregate([
//       {
//         $match: {
//           status: 'approved',
//           $expr: {
//             $and: [
//               { $gte: [{ $ifNull: ['$createdAt', { $toDate: '$_id' }] }, startOfDay] },
//               { $lte: [{ $ifNull: ['$createdAt', { $toDate: '$_id' }] }, endOfDay] }
//             ]
//           }
//         }
//       },
//       { 
//         $group: { 
//           _id: null, 
//           total: { $sum: { $toDouble: '$amount' } }
//         } 
//       }
//     ]);
//     const totalWithdrawToday = todayWithdraws.length > 0 ? todayWithdraws[0].total : 0;

//     // ৫. নিট লাভ/লস
//     const netProfitOrLoss = totalDepositToday - totalWithdrawToday;

//     return NextResponse.json({
//       success: true,
//       stats: {
//         totalUsers,
//         totalDepositToday,
//         totalWithdrawToday,
//         netProfitOrLoss
//       }
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Admin Stats API Error:', error);
//     return NextResponse.json({ 
//       success: false, 
//       message: 'সার্ভার এরর: ' + error.message 
//     }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Deposit from '@/models/Deposit';
import Withdraw from '@/models/Withdraw';
import { verifyAuth } from '@/utils/authCheck';

export async function GET(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status }
      );
    }

    // ১. মোট ইউজার
    const totalUsers = await User.countDocuments();

    // ২. সব ইউজারের মোট ব্যালেন্স
    const balanceAgg = await User.aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ['$balance', 0] } } } } }
    ]);
    const totalUserBalance = balanceAgg.length > 0 ? balanceAgg[0].total : 0;

    // ৩. সব ইউজারের মোট রেফারেল বোনাস
    const referralAgg = await User.aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ['$referralBalance', 0] } } } } }
    ]);
    const totalReferralBonus = referralAgg.length > 0 ? referralAgg[0].total : 0;

    // ৪. সব সময়ের approved ডিপোজিট
    const depositAgg = await Deposit.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
    ]);
    const totalDeposit = depositAgg.length > 0 ? depositAgg[0].total : 0;

    // ৫. সব সময়ের approved উইথড্র
    const withdrawAgg = await Withdraw.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
    ]);
    const totalWithdraw = withdrawAgg.length > 0 ? withdrawAgg[0].total : 0;

    // ৬. অ্যাডমিনের আসল নিট লাভ
    const adminNetProfit =
      totalDeposit - (totalWithdraw + totalUserBalance + totalReferralBonus);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalDeposit,
        totalWithdraw,
        totalUserBalance,
        totalReferralBonus,
        adminNetProfit
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Stats API Error:', error);
    return NextResponse.json(
      { success: false, message: 'সার্ভার এরর: ' + error.message },
      { status: 500 }
    );
  }
}