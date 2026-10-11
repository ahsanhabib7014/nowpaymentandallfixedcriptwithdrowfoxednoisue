// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import Transaction from '@/models/Transaction';
// import User from '@/models/User';
// import { verifyAuth } from '@/utils/authCheck';

// export async function PUT(req) {
//   try {
//     await dbConnect();

//     // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক[cite: 10]
//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json({ 
//         success: false, 
//         message: auth.message 
//       }, { status: auth.status });
//     }

//     const adminUser = auth.user;

//     const { transactionId, status } = await req.json(); // status: 'ACCEPTED' or 'REJECTED'[cite: 10]
    
//     if (!transactionId || !status) {
//       return NextResponse.json({ success: false, message: 'প্রয়োজনীয় তথ্য পাওয়া যায়নি।' }, { status: 400 });
//     }

//     const tx = await Transaction.findById(transactionId);
//     if (!tx || String(tx.status).toUpperCase() !== 'PENDING') {
//       return NextResponse.json({ success: false, message: 'ট্রানজেকশন পাওয়া যায়নি বা ইতোমধ্যে প্রসেস হয়েছে' }, { status: 400 });
//     }

//     const user = await User.findById(tx.userId);
//     if (!user) {
//       return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি' }, { status: 404 });
//     }

//     const upperStatus = String(status).toUpperCase();
//     const txType = String(tx.type).toUpperCase();

//     if (upperStatus === 'ACCEPTED') {
//       if (txType === 'DEPOSIT') {
//         user.balance = (Number(user.balance) || 0) + (Number(tx.amount) || 0);
//         user.turnover = (Number(user.turnover) || 0) + (Number(tx.amount) || 0); 
//       }
//       tx.status = 'ACCEPTED';
//     } else if (upperStatus === 'REJECTED') {
//       if (txType === 'WITHDRAW') {
//         // উইথড্র রিজেক্ট হলে টাকা ফেরত দেওয়া[cite: 8, 10]
//         user.balance = (Number(user.balance) || 0) + (Number(tx.amount) || 0);
//       }
//       tx.status = 'REJECTED';
//     } else {
//       return NextResponse.json({ success: false, message: 'সঠিক স্ট্যাটাস নির্বাচন করা হয়নি।' }, { status: 400 });
//     }

//     await user.save();
//     await tx.save();

//     return NextResponse.json({ 
//       success: true, 
//       message: `ট্রানজেকশন সফলভাবে ${upperStatus === 'ACCEPTED' ? 'গ্রহণ' : 'বাতিল'} করা হয়েছে` 
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Admin Transaction Update Error:', error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// ..............................................................

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

export async function PUT(req) {
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

    const { transactionId, status } = await req.json();
    
    if (!transactionId || !status) {
      return NextResponse.json({ success: false, message: 'প্রয়োজনীয় তথ্য পাওয়া যায়নি।' }, { status: 400 });
    }

    const upperStatus = String(status).toUpperCase();

    if (!['ACCEPTED', 'REJECTED'].includes(upperStatus)) {
      return NextResponse.json({ success: false, message: 'সঠিক স্ট্যাটাস নির্বাচন করা হয়নি।' }, { status: 400 });
    }

    // ==========================================
    // ✅✅✅ ATOMIC transaction status update
    // শুধু PENDING থাকলে তবেই update হবে — double approve বন্ধ
    // ==========================================
    const tx = await Transaction.findOneAndUpdate(
      { 
        _id: transactionId, 
        status: 'PENDING'   // ✅ শুধু PENDING থেকে update হবে
      },
      { $set: { status: upperStatus } },
      { new: true }
    );

    if (!tx) {
      // হয় ট্রানজেকশন নেই, হয় আগেই প্রসেস হয়েছে
      const existing = await Transaction.findById(transactionId);
      if (!existing) {
        return NextResponse.json({ success: false, message: 'ট্রানজেকশন পাওয়া যায়নি' }, { status: 404 });
      }
      return NextResponse.json({ 
        success: false, 
        message: 'ট্রানজেকশন ইতোমধ্যে প্রসেস হয়েছে' 
      }, { status: 409 });
    }

    // ✅ ATOMIC balance update (conditional)
    const txType = String(tx.type).toUpperCase();
    let balanceUpdate = null;

    if (upperStatus === 'ACCEPTED' && txType === 'DEPOSIT') {
      // ✅ Deposit accepted → balance + turnover যোগ
      balanceUpdate = {
        $inc: { 
          balance: Number(tx.amount) || 0,
          turnover: Number(tx.amount) || 0
        }
      };
    } else if (upperStatus === 'REJECTED' && txType === 'WITHDRAW') {
      // ✅ Withdraw rejected → balance refund
      balanceUpdate = {
        $inc: { balance: Number(tx.amount) || 0 }
      };
    }

    if (balanceUpdate) {
      const updatedUser = await User.findByIdAndUpdate(
        tx.userId,
        balanceUpdate,
        { new: true }
      );

      if (!updatedUser) {
        // ⚠️ Rare case: transaction status update হয়ে গেছে কিন্তু user নেই
        console.error('User not found for transaction:', tx._id);
      }
    }
    // ==========================================

    return NextResponse.json({ 
      success: true, 
      message: `ট্রানজেকশন সফলভাবে ${upperStatus === 'ACCEPTED' ? 'গ্রহণ' : 'বাতিল'} করা হয়েছে` 
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Transaction Update Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}