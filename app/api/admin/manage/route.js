// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import User from '@/models/User';
// import Transaction from '@/models/Transaction';
// import { verifyAuth } from '@/utils/authCheck';

// // অ্যাডমিন প্যানেলের ডেটা ফেচ করা (ইউজার লিস্ট ও ট্রানজেকশন রিকোয়েস্ট)[cite: 6]
// export async function GET(req) {
//   try {
//     await dbConnect();

//     // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json({ 
//         success: false, 
//         message: auth.message 
//       }, { status: auth.status });
//     }

//     const adminUser = auth.user;

//     const users = await User.find({}).select('-password');
//     const transactions = await Transaction.find({ status: 'pending' });

//     return NextResponse.json({ success: true, users, transactions }, { status: 200 });
//   } catch (error) {
//     console.error('Admin Panel GET Error:', error);
//     return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
//   }
// }

// // অ্যাডমিন অ্যাকশন হ্যান্ডেল করা (ব্যালেন্স আপডেট বা ট্রানজেকশন অ্যাপ্রুভ/রিজেক্ট)[cite: 6]
// export async function POST(req) {
//   try {
//     await dbConnect();

//     // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json({ 
//         success: false, 
//         message: auth.message 
//       }, { status: auth.status });
//     }

//     const adminUser = auth.user;

//     const { action, targetUid, amount, txId, status } = await req.json();

//     // ৩. ইউজারের ব্যালেন্স ম্যানুয়াল অ্যাড/মাইনাস করা[cite: 6]
//     if (action === 'updateBalance') {
//       const targetUser = await User.findOne({ uid: targetUid });
//       if (!targetUser) {
//         return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি' }, { status: 404 });
//       }

//       targetUser.balance = (Number(targetUser.balance) || 0) + Number(amount);
//       await targetUser.save();
//       return NextResponse.json({ success: true, message: 'ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!' }, { status: 200 });
//     }

//     // ৪. ডিপোজিট বা উইথড্র রিকোয়েস্ট অ্যাপ্রুভ/রিজেক্ট করা[cite: 6]
//     if (action === 'handleTransaction') {
//       const tx = await Transaction.findById(txId);
//       if (!tx) {
//         return NextResponse.json({ success: false, message: 'ট্রানজেকশন পাওয়া যায়নি' }, { status: 404 });
//       }

//       tx.status = status; // 'approved' বা 'rejected'[cite: 6]
//       await tx.save();

//       // যদি ডিপোজিট অ্যাপ্রুভ হয়, তবে ইউজারের ব্যালেন্স বাড়িয়ে দেওয়া[cite: 6]
//       if (String(status).toLowerCase() === 'approved' && String(tx.type).toLowerCase() === 'deposit') {
//         const user = await User.findOne({ uid: tx.uid });
//         if (user) {
//           user.balance = (Number(user.balance) || 0) + Number(tx.amount);
//           await user.save();
//         }
//       }

//       return NextResponse.json({ success: true, message: `ট্রানজেকশন ${status} করা হয়েছে!` }, { status: 200 });
//     }

//     return NextResponse.json({ success: false, message: 'সঠিক অ্যাকশন নির্বাচন করা হয়নি' }, { status: 400 });
//   } catch (error) {
//     console.error('Admin Panel POST Error:', error);
//     return NextResponse.json({ success: false, message: 'Error processing admin action' }, { status: 500 });
//   }
// }

// ...................................................................

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { verifyAuth } from '@/utils/authCheck';

// অ্যাডমিন প্যানেলের ডেটা ফেচ করা (ইউজার লিস্ট ও ট্রানজেকশন রিকোয়েস্ট)
export async function GET(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        message: auth.message 
      }, { status: auth.status });
    }

    const adminUser = auth.user;

    const users = await User.find({}).select('-password');
    const transactions = await Transaction.find({ status: 'pending' });

    return NextResponse.json({ success: true, users, transactions }, { status: 200 });
  } catch (error) {
    console.error('Admin Panel GET Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// অ্যাডমিন অ্যাকশন হ্যান্ডেল করা (ব্যালেন্স আপডেট বা ট্রানজেকশন অ্যাপ্রুভ/রিজেক্ট)
export async function POST(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        message: auth.message 
      }, { status: auth.status });
    }

    const adminUser = auth.user;

    const { action, targetUid, amount, txId, status } = await req.json();

    // ==========================================
    // ✅✅✅ ঠিক করা হলো: atomic balance update
    // ==========================================
    if (action === 'updateBalance') {
      const parsedAmount = Number(amount);

      // ✅ Input validation
      if (!targetUid || isNaN(parsedAmount) || parsedAmount === 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'ইউজার আইডি বা সঠিক পরিমাণ প্রদান করুন!' 
        }, { status: 400 });
      }

      // ✅ findOneAndUpdate + $inc = atomic operation
      // এখন একসাথে দুই request এলেও দুটোই কাজ করবে
      const updatedUser = await User.findOneAndUpdate(
        { uid: targetUid },
        { $inc: { balance: parsedAmount } },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json({ 
          success: false, 
          message: 'ইউজার পাওয়া যায়নি' 
        }, { status: 404 });
      }

      // ✅ Response format আগের মতোই
      return NextResponse.json({ 
        success: true, 
        message: 'ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!' 
      }, { status: 200 });
    }
    // ==========================================

    // ৪. ডিপোজিট বা উইথড্র রিকোয়েস্ট অ্যাপ্রুভ/রিজেক্ট করা
    if (action === 'handleTransaction') {
      const tx = await Transaction.findById(txId);
      if (!tx) {
        return NextResponse.json({ success: false, message: 'ট্রানজেকশন পাওয়া যায়নি' }, { status: 404 });
      }

      tx.status = status;
      await tx.save();

      // যদি ডিপোজিট অ্যাপ্রুভ হয়, তবে ইউজারের ব্যালেন্স বাড়িয়ে দেওয়া
      if (String(status).toLowerCase() === 'approved' && String(tx.type).toLowerCase() === 'deposit') {
        const user = await User.findOne({ uid: tx.uid });
        if (user) {
          user.balance = (Number(user.balance) || 0) + Number(tx.amount);
          await user.save();
        }
      }

      return NextResponse.json({ success: true, message: `ট্রানজেকশন ${status} করা হয়েছে!` }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'সঠিক অ্যাকশন নির্বাচন করা হয়নি' }, { status: 400 });
  } catch (error) {
    console.error('Admin Panel POST Error:', error);
    return NextResponse.json({ success: false, message: 'Error processing admin action' }, { status: 500 });
  }
}