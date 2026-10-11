// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import User from '@/models/User';
// import Transaction from '@/models/Transaction';
// import { verifyAuth } from '@/utils/authCheck';

// export async function POST(req) {
//   try {
//     await dbConnect();

//     // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন[cite: 12]
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

//     const { amount, method, accountNumber } = body;
//     const numAmount = Number(amount);

//     if (!numAmount || isNaN(numAmount) || numAmount <= 0 || !method) {
//       return NextResponse.json({ 
//         success: false, 
//         message: 'সঠিক উত্তোলনের পরিমাণ এবং মাধ্যম প্রদান করুন!' 
//       }, { status: 400 });
//     }

//     // ২. ডাটাবেজ থেকে সম্পূর্ণ ইউজার অবজেক্ট নিশ্চিত করা[cite: 12]
//     const user = await User.findById(auth.user._id || auth.user.userId);

//     if (!user || user.isBlocked) {
//       return NextResponse.json({ 
//         success: false, 
//         message: 'ইউজার পাওয়া যায়নি বা অ্যাকাউন্ট ব্লকড।' 
//       }, { 
//         status: 404,
//         headers: {
//           'X-Content-Type-Options': 'nosniff',
//           'X-Frame-Options': 'DENY'
//         }
//       });
//     }

//     if (user.balance < numAmount) {
//       return NextResponse.json({ 
//         success: false, 
//         message: 'পর্যাপ্ত ব্যালেন্স নেই!' 
//       }, { status: 400 });
//     }

//     // ৩. উইথড্র করার সাথে সাথে ব্যালেন্স কেটে পেন্ডিং রাখা[cite: 12]
//     user.balance -= numAmount;
//     await user.save();

//     await Transaction.create({
//       userId: user._id,
//       uid: user.uid,
//       phone: user.phone || '',
//       type: 'withdraw',
//       amount: numAmount,
//       method,
//       accountNumber: accountNumber || '',
//       status: 'pending',
//     });

//     return NextResponse.json({ 
//       success: true, 
//       message: 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!',
//       newBalance: user.balance 
//     }, { 
//       status: 200,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'Cache-Control': 'no-store, no-cache, must-revalidate'
//       }
//     });

//   } catch (error) {
//     console.error('Withdraw API Error:', error);
//     return NextResponse.json({ 
//       success: false, 
//       message: 'Error processing withdraw' 
//     }, { status: 500 });
//   }
// }

// ...................................................................

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
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

    const { amount, method, accountNumber } = body;
    const numAmount = Number(amount);

    if (!numAmount || isNaN(numAmount) || numAmount <= 0 || !method) {
      return NextResponse.json({ 
        success: false, 
        message: 'সঠিক উত্তোলনের পরিমাণ এবং মাধ্যম প্রদান করুন!' 
      }, { status: 400 });
    }

    // ২. ডাটাবেজ থেকে সম্পূর্ণ ইউজার অবজেক্ট নিশ্চিত করা
    const user = await User.findById(auth.user._id || auth.user.userId);

    if (!user || user.isBlocked) {
      return NextResponse.json({ 
        success: false, 
        message: 'ইউজার পাওয়া যায়নি বা অ্যাকাউন্ট ব্লকড।' 
      }, { 
        status: 404,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        }
      });
    }

    // ==========================================
    // ✅✅✅ ঠিক করা হলো: atomic balance deduct
    // ==========================================
    // Balance check + deduct একসাথে — race condition proof
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: user._id, 
        balance: { $gte: numAmount }   // ✅ balance যথেষ্ট হলে তবেই deduct হবে
      },
      { $inc: { balance: -numAmount } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'পর্যাপ্ত ব্যালেন্স নেই!' 
      }, { status: 400 });
    }
    // ==========================================

    // ৩. Withdraw transaction তৈরি
    await Transaction.create({
      userId: user._id,
      uid: user.uid,
      phone: user.phone || '',
      type: 'withdraw',
      amount: numAmount,
      method,
      accountNumber: accountNumber || '',
      status: 'pending',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!',
      newBalance: Number(updatedUser.balance)   // ✅ নতুন balance
    }, { 
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Withdraw API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing withdraw' 
    }, { status: 500 });
  }
}