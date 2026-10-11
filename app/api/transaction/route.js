// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import Transaction from '@/models/Transaction';
// import User from '@/models/User';
// import { sanitizeString } from '@/utils/validators';
// import { verifyAuth } from '@/utils/authCheck';

// export async function POST(req) {
//   try {
//     await dbConnect();

//     // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন[cite: 11]
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

//     let body;
//     try {
//       body = await req.json();
//     } catch (e) {
//       return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
//     }

//     const type = sanitizeString(body?.type); // 'DEPOSIT' or 'WITHDRAW'[cite: 11]
//     const method = sanitizeString(body?.method); // 'bKash' / 'Nagad' / etc.[cite: 11]
//     const phone = sanitizeString(body?.phone);
//     const amount = Number(body?.amount);
//     const trxId = sanitizeString(body?.trxId || '');

//     if (!['DEPOSIT', 'WITHDRAW'].includes(type) || isNaN(amount) || amount <= 0) {
//       return NextResponse.json({ success: false, message: 'অবৈধ ডাটা ইনপুট বা টাকার পরিমাণ সঠিক নয়' }, { status: 400 });
//     }

//     const user = await User.findById(auth.user._id || auth.user.userId);
//     if (!user || user.isBlocked) {
//       return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি বা অ্যাকাউন্ট ব্লকড' }, { status: 404 });
//     }

//     // ২. ডিপোজিটের ক্ষেত্রে ট্রানজেকশন আইডি ও ডুপ্লিকেট চেক করা[cite: 11]
//     if (type === 'DEPOSIT') {
//       if (!trxId) {
//         return NextResponse.json({ success: false, message: 'ডিপোজিটের জন্য ট্রানজেকশন আইডি আবশ্যক' }, { status: 400 });
//       }

//       const existingTrx = await Transaction.findOne({ trxId });
//       if (existingTrx) {
//         return NextResponse.json({ success: false, message: 'এই ট্রানজেকশন আইডি ইতিপূর্বেই ব্যবহার করা হয়েছে!' }, { status: 400 });
//       }
//     }

//     // ৩. উইথড্র করার সময় ব্যালেন্স ও টার্নওভার (Turnover) চেক করা[cite: 11]
//     if (type === 'WITHDRAW') {
//       if (user.balance < amount) {
//         return NextResponse.json({ success: false, message: 'অপর্যাপ্ত ব্যালেন্স' }, { status: 400 });
//       }

//       const currentTurnover = Number(user.turnover || 0);
//       if (currentTurnover > 0) {
//         return NextResponse.json({ 
//           success: false, 
//           message: `উইথড্র করার জন্য আপনার আরও ৳${currentTurnover} টার্নওভার (বেটিং) বাকি রয়েছে।` 
//         }, { status: 400 });
//       }

//       // উইথড্র রিকোয়েস্টে ব্যালেন্স তাৎক্ষণিকভাবে কেটে নেওয়া নিরাপদ[cite: 11]
//       user.balance -= amount;
//       await user.save();
//     }

//     const transaction = await Transaction.create({
//       userId: user._id,
//       type,
//       method,
//       phone,
//       amount,
//       trxId: type === 'DEPOSIT' ? trxId : undefined,
//       status: 'PENDING'
//     });

//     return NextResponse.json({ 
//       success: true, 
//       message: 'রিকোয়েস্ট সফলভাবে জমা দেওয়া হয়েছে', 
//       transaction,
//       newBalance: Number(user.balance) 
//     }, {
//       status: 200,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'Cache-Control': 'no-store, no-cache, must-revalidate'
//       }
//     });

//   } catch (error) {
//     console.error('Transaction API Error:', error);
//     return NextResponse.json({ success: false, message: error.message || 'সার্ভার এরর হয়েছে' }, { status: 500 });
//   }
// }

// .............................................................

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { sanitizeString } from '@/utils/validators';
import { verifyAuth } from '@/utils/authCheck';

export async function POST(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন
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

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
    }

    const type = sanitizeString(body?.type); // 'DEPOSIT' or 'WITHDRAW'
    const method = sanitizeString(body?.method); // 'bKash' / 'Nagad' / etc.
    const phone = sanitizeString(body?.phone);
    const amount = Number(body?.amount);
    const trxId = sanitizeString(body?.trxId || '');

    if (!['DEPOSIT', 'WITHDRAW'].includes(type) || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: 'অবৈধ ডাটা ইনপুট বা টাকার পরিমাণ সঠিক নয়' }, { status: 400 });
    }

    const user = await User.findById(auth.user._id || auth.user.userId);
    if (!user || user.isBlocked) {
      return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি বা অ্যাকাউন্ট ব্লকড' }, { status: 404 });
    }

    // ২. ডিপোজিটের ক্ষেত্রে ট্রানজেকশন আইডি ও ডুপ্লিকেট চেক করা
    if (type === 'DEPOSIT') {
      if (!trxId) {
        return NextResponse.json({ success: false, message: 'ডিপোজিটের জন্য ট্রানজেকশন আইডি আবশ্যক' }, { status: 400 });
      }

      const existingTrx = await Transaction.findOne({ trxId });
      if (existingTrx) {
        return NextResponse.json({ success: false, message: 'এই ট্রানজেকশন আইডি ইতিপূর্বেই ব্যবহার করা হয়েছে!' }, { status: 400 });
      }
    }

    // ==========================================
    // ✅✅✅ ঠিক করা হলো: atomic balance deduct
    // ==========================================
    if (type === 'WITHDRAW') {
      // ✅ Turnover চেক আগে (deduct করার আগে) — কোনো balance পরিবর্তন ছাড়াই
      const currentTurnover = Number(user.turnover || 0);
      if (currentTurnover > 0) {
        return NextResponse.json({ 
          success: false, 
          message: `উইথড্র করার জন্য আপনার আরও ৳${currentTurnover} টার্নওভার (বেটিং) বাকি রয়েছে।` 
        }, { status: 400 });
      }

      // ✅ ATOMIC balance deduct — balance যথেষ্ট হলে তবেই কাটবে
      const updatedUser = await User.findOneAndUpdate(
        { 
          _id: user._id, 
          balance: { $gte: amount }   // ✅ balance যথেষ্ট হলে তবেই deduct হবে
        },
        { $inc: { balance: -amount } },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json({ success: false, message: 'অপর্যাপ্ত ব্যালেন্স' }, { status: 400 });
      }

      // ✅ Response-এ নতুন balance পাঠানোর জন্য user variable update
      user.balance = updatedUser.balance;
    }
    // ==========================================

    const transaction = await Transaction.create({
      userId: user._id,
      type,
      method,
      phone,
      amount,
      trxId: type === 'DEPOSIT' ? trxId : undefined,
      status: 'PENDING'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'রিকোয়েস্ট সফলভাবে জমা দেওয়া হয়েছে', 
      transaction,
      newBalance: Number(user.balance) 
    }, {
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Transaction API Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'সার্ভার এরর হয়েছে' }, { status: 500 });
  }
}