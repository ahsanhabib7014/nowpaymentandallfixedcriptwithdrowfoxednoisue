import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Withdraw from '@/models/Withdraw';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

// ✅ সঠিক refund amount calculation
const calculateRefundAmount = (withdraw) => {
  // Priority 1: নতুন crypto withdraw — deductedBDT আছে (৳1200)
  if (withdraw.deductedBDT && Number(withdraw.deductedBDT) > 0) {
    return { amount: Number(withdraw.deductedBDT), source: 'deductedBDT' };
  }
  
  // Priority 2: পুরোনো crypto — withdraw-এর সময়কার rate দিয়ে
  if (withdraw.originalCurrency === 'USD' && withdraw.exchangeRate && Number(withdraw.exchangeRate) > 0) {
    return { 
      amount: Math.round(Number(withdraw.amount) * Number(withdraw.exchangeRate)), 
      source: 'amount × exchangeRate' 
    };
  }
  
  // Priority 3: mobile — amount সরাসরি ৳
  return { amount: Number(withdraw.amount) || 0, source: 'amount' };
};

export async function POST(request) {
  try {
    await clientPromise;

    // ১. অ্যাডমিন অথেন্টিকেশন
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { withdrawId, action } = await request.json();

    if (!withdrawId || !action) {
      return NextResponse.json({ success: false, message: 'প্রয়োজনীয় তথ্য পাওয়া যায়নি।' }, { status: 400 });
    }

    const withdraw = await Withdraw.findById(withdrawId);
    if (!withdraw) {
      return NextResponse.json({ success: false, message: 'উইথড্র রিকোয়েস্ট খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    if (withdraw.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'এই রিকোয়েস্টটি ইতিমধ্যে প্রসেস করা হয়েছে।' }, { status: 400 });
    }

    // ✅ Approve
    if (action === 'approve') {
      withdraw.status = 'approved';
      await withdraw.save();
      return NextResponse.json({ 
        success: true, 
        message: 'উইথড্র রিকোয়েস্ট সফলভাবে অ্যাপ্রুভ করা হয়েছে।' 
      }, { status: 200 });
    }

    // ✅ Reject + Refund (withdraw-এর সময়কার rate দিয়ে)
    else if (action === 'reject') {
      withdraw.status = 'rejected';
      await withdraw.save();

      // ✅ সঠিক refund amount calculate
      const { amount: refundAmount, source } = calculateRefundAmount(withdraw);
      const walletType = withdraw.walletType || 'main';

      console.log('💸 Refund Debug:');
      console.log('  withdrawId:', withdrawId);
      console.log('  amount:', withdraw.amount);
      console.log('  deductedBDT:', withdraw.deductedBDT);
      console.log('  exchangeRate:', withdraw.exchangeRate);
      console.log('  originalCurrency:', withdraw.originalCurrency);
      console.log('  refundAmount:', refundAmount, `(${source})`);
      console.log('  walletType:', walletType);

      let refundInfo = null;

      if (refundAmount > 0) {
        const balanceField = walletType === 'referral' ? 'referralBalance' : 'balance';
        const updatedUser = await User.findOneAndUpdate(
          { uid: withdraw.uid },
          { $inc: { [balanceField]: refundAmount } },
          { new: true }
        );

        if (updatedUser) {
          refundInfo = {
            refundAmount,
            source,
            newBalance: updatedUser.balance,
            newReferralBalance: updatedUser.referralBalance
          };
          console.log('  ✅ Refund সফল:', refundInfo);
        } else {
          console.error('  ❌ User পাওয়া যায়নি:', withdraw.uid);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: `উইথড্র রিকোয়েস্ট রিজেক্ট করা হয়েছে এবং ৳${refundAmount} রিফান্ড করা হয়েছে (${source})`,
        refundInfo
      }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'সঠিক অ্যাকশন নির্বাচন করা হয়নি।' }, { status: 400 });
  } catch (error) {
    console.error('Admin Withdraw Action Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}