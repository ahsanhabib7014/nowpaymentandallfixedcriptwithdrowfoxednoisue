import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Withdraw from '@/models/Withdraw';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

// ✅ সঠিক refund calculation
const calculateRefundAmount = (withdraw) => {
  if (withdraw.deductedBDT && Number(withdraw.deductedBDT) > 0) {
    return Number(withdraw.deductedBDT);
  }
  if (withdraw.originalCurrency === 'USD' && withdraw.exchangeRate && Number(withdraw.exchangeRate) > 0) {
    return Math.round(Number(withdraw.amount) * Number(withdraw.exchangeRate));
  }
  return Number(withdraw.amount) || 0;
};

export async function GET(request) {
  try {
    await clientPromise;
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    let withdraws = await Withdraw.find({}).lean();
    withdraws.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return NextResponse.json({ success: true, withdraws }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, withdraws: [], error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await clientPromise;

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    let body;
    try { body = await request.json(); } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
    }

    const { withdrawId, status, adminNote } = body || {};
    if (!withdrawId) {
      return NextResponse.json({ success: false, message: 'Withdraw ID প্রয়োজন!' }, { status: 400 });
    }

    const cleanNote = typeof adminNote === 'string' ? adminNote.trim().slice(0, 200) : '';

    // নোট only
    if (!status) {
      const updated = await Withdraw.findByIdAndUpdate(
        withdrawId, { $set: { adminNote: cleanNote } }, { new: true }
      );
      return NextResponse.json({ success: true, message: '✅ নোট আপডেট হয়েছে!', withdraw: updated }, { status: 200 });
    }

    // status সহ
    const updateData = { status };
    if (cleanNote) updateData.adminNote = cleanNote;

    const updatedWithdraw = await Withdraw.findOneAndUpdate(
      { _id: withdrawId, status: 'pending' },
      { $set: updateData },
      { new: true }
    );

    if (!updatedWithdraw) {
      return NextResponse.json({ success: false, message: 'ইতিমধ্যে প্রসেস হয়েছে' }, { status: 409 });
    }

    // ✅ Reject + Refund
    let refundInfo = null;

    if (status === 'rejected') {
      const targetUserId = updatedWithdraw.uid || updatedWithdraw.userId;
      const walletType = updatedWithdraw.walletType || 'main';
      const refundAmount = calculateRefundAmount(updatedWithdraw);

      console.log('💸 Refund:');
      console.log('  amount:', updatedWithdraw.amount);
      console.log('  deductedBDT:', updatedWithdraw.deductedBDT);
      console.log('  exchangeRate:', updatedWithdraw.exchangeRate);
      console.log('  → refundAmount:', refundAmount);

      if (targetUserId && refundAmount > 0) {
        const balanceField = walletType === 'referral' ? 'referralBalance' : 'balance';
        const updatedUser = await User.findOneAndUpdate(
          { uid: targetUserId },
          { $inc: { [balanceField]: refundAmount } },
          { new: true }
        );

        if (updatedUser) {
          refundInfo = {
            refundAmount,
            newBalance: updatedUser.balance,
            newReferralBalance: updatedUser.referralBalance
          };
          console.log('  ✅ Refund সফল:', refundInfo);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: status === 'rejected'
        ? `✅ উইথড্র বাতিল হয়েছে এবং ৳${refundInfo?.refundAmount || 0} ফেরত দেওয়া হয়েছে`
        : '✅ উইথড্র কনফার্ম হয়েছে',
      withdraw: updatedWithdraw,
      refundInfo     // ← ✅ এইটা response-এ যাচ্ছে
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await clientPromise;
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { withdrawId, action } = await request.json();
    if (!withdrawId || !action) {
      return NextResponse.json({ success: false, message: 'প্রয়োজনীয় তথ্য নেই' }, { status: 400 });
    }

    const withdraw = await Withdraw.findById(withdrawId);
    if (!withdraw || withdraw.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'পাওয়া যায়নি বা প্রসেস হয়েছে' }, { status: 400 });
    }

    if (action === 'approve') {
      withdraw.status = 'approved';
      await withdraw.save();
      return NextResponse.json({ success: true, message: '✅ অ্যাপ্রুভ' }, { status: 200 });
    }

    if (action === 'reject') {
      withdraw.status = 'rejected';
      await withdraw.save();

      const walletType = withdraw.walletType || 'main';
      const refundAmount = calculateRefundAmount(withdraw);

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
            newBalance: updatedUser.balance,
            newReferralBalance: updatedUser.referralBalance
          };
        }
      }

      return NextResponse.json({
        success: true,
        message: `✅ ৳${refundAmount} রিফান্ড`,
        refundInfo
      }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'ভুল action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}