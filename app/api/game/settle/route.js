// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import Bet from '@/models/Bet';
// import User from '@/models/User';
// import { verifyAuth } from '@/utils/authCheck';

// export async function POST(req) {
//   try {
//     await dbConnect();
    
//     // ১. সেন্ট্রালাইজড HttpOnly কুকি ও অ্যাডমিন রোল ভেরিফিকেশন
//     const auth = await verifyAuth('admin');
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

//     let body;
//     try {
//       body = await req.json();
//     } catch (e) {
//       return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
//     }

//     const { roundNo, winningChoice } = body || {}; 
//     if (!roundNo || !['BIG', 'SMALL', 'Big', 'Small', 'big', 'small'].includes(winningChoice)) {
//       return NextResponse.json({ success: false, message: 'রাউন্ড নম্বর অথবা অবৈধ উইনিং চয়েস প্রদান করা হয়েছে!' }, { status: 400 });
//     }

//     const normalizedWinningChoice = winningChoice.toUpperCase();

//     // ২. এই রাউন্ডের সমস্ত পেন্ডিং বেট খুঁজে বের করা[cite: 10]
//     const pendingBets = await Bet.find({ roundNo, status: 'PENDING' });

//     for (const bet of pendingBets) {
//       const user = await User.findById(bet.userId);
//       if (!user) continue;

//       const userChoiceNormalized = String(bet.choice).toUpperCase();

//       if (userChoiceNormalized === normalizedWinningChoice) {
//         // উইন করলে মূল পরিমাণের ১.৯৫ গুণ রিটার্ন[cite: 10]
//         const returnAmount = bet.amount * 1.95; 
//         bet.status = 'WIN';
//         bet.returnAmount = returnAmount;
//         user.balance += returnAmount;
//       } else {
//         bet.status = 'LOSS';
//         bet.returnAmount = 0;
//       }
//       await bet.save();
//       await user.save();
//     }

//     return NextResponse.json(
//       { success: true, message: `রাউন্ড #${roundNo} এর ফলাফল সফলভাবে সম্পন্ন হয়েছে।` },
//       {
//         status: 200,
//         headers: {
//           'X-Content-Type-Options': 'nosniff',
//           'X-Frame-Options': 'DENY',
//           'Cache-Control': 'no-store, no-cache, must-revalidate'
//         }
//       }
//     );
//   } catch (error) {
//     console.error('Admin Settle API Error:', error);
//     return NextResponse.json({ success: false, message: error.message || 'সার্ভার এরর হয়েছে।' }, { status: 500 });
//   }
// }


// ...........................................................

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Bet from '@/models/Bet';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

export async function POST(req) {
  try {
    await dbConnect();
    
    // ১. সেন্ট্রালাইজড HttpOnly কুকি ও অ্যাডমিন রোল ভেরিফিকেশন
    const auth = await verifyAuth('admin');
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

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
    }

    const { roundNo, winningChoice } = body || {}; 
    if (!roundNo || !['BIG', 'SMALL', 'Big', 'Small', 'big', 'small'].includes(winningChoice)) {
      return NextResponse.json({ success: false, message: 'রাউন্ড নম্বর অথবা অবৈধ উইনিং চয়েস প্রদান করা হয়েছে!' }, { status: 400 });
    }

    const normalizedWinningChoice = winningChoice.toUpperCase();

    // ২. এই রাউন্ডের সমস্ত পেন্ডিং বেট খুঁজে বের করা
    const pendingBets = await Bet.find({ roundNo, status: 'PENDING' });

    // ==========================================
    // ✅✅✅ ঠিক করা হলো: ATOMIC balance update
    // ==========================================
    for (const bet of pendingBets) {
      const userChoiceNormalized = String(bet.choice).toUpperCase();
      const isWinner = userChoiceNormalized === normalizedWinningChoice;

      if (isWinner) {
        const returnAmount = bet.amount * 1.95; 

        // ✅ ATOMIC bet update
        await Bet.findByIdAndUpdate(
          bet._id,
          { 
            $set: { 
              status: 'WIN',
              returnAmount: returnAmount
            } 
          }
        );

        // ✅ ATOMIC user balance update — $inc use
        await User.findByIdAndUpdate(
          bet.userId,
          { $inc: { balance: returnAmount } }
        );
      } else {
        // ✅ LOSS — শুধু bet update, balance-এ হাত দেব না
        await Bet.findByIdAndUpdate(
          bet._id,
          { 
            $set: { 
              status: 'LOSS',
              returnAmount: 0
            } 
          }
        );
      }
    }
    // ==========================================

    return NextResponse.json(
      { success: true, message: `রাউন্ড #${roundNo} এর ফলাফল সফলভাবে সম্পন্ন হয়েছে।` },
      {
        status: 200,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Admin Settle API Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'সার্ভার এরর হয়েছে।' }, { status: 500 });
  }
}