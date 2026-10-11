// import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import dbConnect from '@/lib/mongodb';
// import { verifyAuth } from '@/utils/authCheck';
// import User from '@/models/User';
// import Bet from '@/models/Bet';
// import Deposit from '@/models/Deposit';

// export async function GET(req) {
//   try {
//     await dbConnect();

//     // ১. Auth verification
//     const auth = await verifyAuth('user');
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message }, 
//         { 
//           status: auth.status,
//           headers: {
//             'X-Content-Type-Options': 'nosniff',
//             'X-Frame-Options': 'DENY'
//           }
//         }
//       );
//     }

//     // ২. ইউজার খোঁজা
//     let user = await User.findOne({ 
//       $or: [
//         { _id: auth.user._id || auth.user.userId },
//         { uid: auth.user.uid },
//         { phone: auth.user.phone }
//       ] 
//     });

//     if (!user && mongoose.Types.ObjectId.isValid(auth.user._id || auth.user.userId)) {
//       user = await User.findById(auth.user._id || auth.user.userId);
//     }

//     if (!user || user.isBlocked) {
//       return NextResponse.json({ 
//         success: false, 
//         message: 'ইউজার ডাটাবেজে পাওয়া যায়নি বা অ্যাকাউন্ট ব্লকড!' 
//       }, { 
//         status: 404,
//         headers: {
//           'X-Content-Type-Options': 'nosniff',
//           'X-Frame-Options': 'DENY'
//         }
//       });
//     }

//     // ==========================================
//     // ৩. বেট হিস্ট্রি
//     // ==========================================
//     let bets = [];
//     try {
//       bets = await Bet.find({ 
//         $or: [
//           { userId: user._id }, 
//           { uid: user.uid }, 
//           { uid: user.phone }
//         ] 
//       }).sort({ createdAt: -1 }).limit(50).lean();

//       bets = bets.map(bet => {
//         const upperStatus = String(bet.result || bet.status || 'PENDING').toUpperCase();
//         const finalStatus = (upperStatus === 'WIN' || upperStatus === 'LOSS') ? upperStatus : 'PENDING';
//         return {
//           ...bet,
//           status: finalStatus,
//           result: finalStatus
//         };
//       });
//     } catch (e) {
//       console.log('Bet fetch error:', e.message);
//     }

//     // ==========================================
//     // ৪. ডিপোজিট হিস্ট্রি — ✅ FIXED
//     // ==========================================
//     let deposits = [];
//     try {
//       deposits = await Deposit.find({ 
//         $or: [
//           { uid: user.uid },
//           { uid: user.phone }
//         ] 
//       }).sort({ createdAt: -1 }).limit(20).lean();

//       deposits = deposits.map(item => ({
//         ...item,
//         createdAt: item.createdAt || (item._id ? item._id.getTimestamp() : new Date()),
//         adminNote: item.adminNote || ''
//       }));
//     } catch (e) {
//       console.log('Deposit fetch error:', e.message);
//     }

//     // ==========================================
//     // ৫. উইথড্র হিস্ট্রি
//     // ==========================================
//     // ⚠️ Withdraw model এখনো আপনার কাছ থেকে পাইনি।
//     // models/Withdraw.js ফাইল পাঠালে এই সেকশনটাও ঠিক করে দেব।
//     let withdraws = [];
//     try {
//       if (mongoose.models.Withdraw) {
//         withdraws = await mongoose.models.Withdraw.find({ 
//           $or: [
//             { uid: user.uid },
//             { uid: user.phone }
//           ] 
//         }).sort({ createdAt: -1 }).limit(20).lean();

//         withdraws = withdraws.map(item => ({
//           ...item,
//           createdAt: item.createdAt || (item._id ? item._id.getTimestamp() : new Date()),
//           adminNote: item.adminNote || ''
//         }));
//       }
//     } catch (e) {
//       console.log('Withdraw fetch error:', e.message);
//     }

//     return NextResponse.json({
//       success: true,
//       deposits: deposits || [],
//       withdraws: withdraws || [],
//       bets: bets || []
//     }, { 
//       status: 200,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'Cache-Control': 'no-store, no-cache, must-revalidate'
//       }
//     });

//   } catch (error) {
//     console.error('HISTORY API ERROR:', error);
//     return NextResponse.json({ 
//       success: false, 
//       message: 'সার্ভার এরর: ' + error.message 
//     }, { status: 500 });
//   }
// }

// .............................................................

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { verifyAuth } from '@/utils/authCheck';
import User from '@/models/User';
import Bet from '@/models/Bet';
import Deposit from '@/models/Deposit';
import Withdraw from '@/models/Withdraw';   // ✅✅✅ নতুন যোগ হলো

export async function GET(req) {
  try {
    await dbConnect();

    // ১. Auth verification
    const auth = await verifyAuth('user');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message }, 
        { 
          status: auth.status,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
          }
        }
      );
    }

    // ২. ইউজার খোঁজা
    let user = await User.findOne({ 
      $or: [
        { _id: auth.user._id || auth.user.userId },
        { uid: auth.user.uid },
        { phone: auth.user.phone }
      ] 
    });

    if (!user && mongoose.Types.ObjectId.isValid(auth.user._id || auth.user.userId)) {
      user = await User.findById(auth.user._id || auth.user.userId);
    }

    if (!user || user.isBlocked) {
      return NextResponse.json({ 
        success: false, 
        message: 'ইউজার ডাটাবেজে পাওয়া যায়নি বা অ্যাকাউন্ট ব্লকড!' 
      }, { 
        status: 404,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        }
      });
    }

    // ==========================================
    // ৩. বেট হিস্ট্রি (আগের মতোই — কোনো পরিবর্তন নেই)
    // ==========================================
    let bets = [];
    try {
      bets = await Bet.find({ 
        $or: [
          { userId: user._id }, 
          { uid: user.uid }, 
          { uid: user.phone }
        ] 
      }).sort({ createdAt: -1 }).limit(50).lean();

      bets = bets.map(bet => {
        const upperStatus = String(bet.result || bet.status || 'PENDING').toUpperCase();
        const finalStatus = (upperStatus === 'WIN' || upperStatus === 'LOSS') ? upperStatus : 'PENDING';
        return {
          ...bet,
          status: finalStatus,
          result: finalStatus
        };
      });
    } catch (e) {
      console.log('Bet fetch error:', e.message);
    }

    // ==========================================
    // ৪. ডিপোজিট হিস্ট্রি (আগের মতোই — কোনো পরিবর্তন নেই)
    // ==========================================
    let deposits = [];
    try {
      deposits = await Deposit.find({ 
        $or: [
          { uid: user.uid },
          { uid: user.phone }
        ] 
      }).sort({ createdAt: -1 }).limit(20).lean();

      deposits = deposits.map(item => ({
        ...item,
        createdAt: item.createdAt || (item._id ? item._id.getTimestamp() : new Date()),
        adminNote: item.adminNote || ''
      }));
    } catch (e) {
      console.log('Deposit fetch error:', e.message);
    }

    // ==========================================
    // ৫. উইথড্র হিস্ট্রি — ✅✅✅ ঠিক করা হলো
    // ==========================================
    let withdraws = [];
    try {
      withdraws = await Withdraw.find({ 
        $or: [
          { uid: user.uid },
          { uid: user.phone }
        ] 
      }).sort({ createdAt: -1 }).limit(20).lean();

      withdraws = withdraws.map(item => ({
        ...item,
        createdAt: item.createdAt || (item._id ? item._id.getTimestamp() : new Date()),
        adminNote: item.adminNote || ''
      }));
    } catch (e) {
      console.log('Withdraw fetch error:', e.message);
    }

    // ==========================================
    // ৬. Response — ✅ format একই
    // ==========================================
    return NextResponse.json({
      success: true,
      deposits: deposits || [],
      withdraws: withdraws || [],
      bets: bets || []
    }, { 
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('HISTORY API ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভার এরর: ' + error.message 
    }, { status: 500 });
  }
}