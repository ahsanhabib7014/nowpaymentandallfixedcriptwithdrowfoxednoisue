import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import User from '@/models/User';
import Withdraw from '@/models/Withdraw';
import PaymentMethod from '@/models/PaymentMethod';
import Setting from '@/models/Setting';           // ✅ যোগ হলো
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/utils/authCheck';

// ==========================================
// ✅ Method-specific Config
// ==========================================
const getMethodConfig = (method) => {
  const upper = String(method || '').toUpperCase();

  if (upper.includes('TRX') || upper.includes('TRON')) {
    return {
      isCrypto: true, currency: 'USD', minAmount: 5,
      minAccountLength: 34, maxAccountLength: 34,
      accountOnlyDigits: false, accountLabel: 'TRX Wallet Address',
    };
  }

  if (upper.includes('BINANCE') || upper.includes('USDT')) {
    return {
      isCrypto: true, currency: 'USD', minAmount: 5,
      minAccountLength: 5, maxAccountLength: 10,
      accountOnlyDigits: true, accountLabel: 'Binance Pay ID',
    };
  }

  if (upper.includes('BTC') || upper.includes('BITCOIN')) {
    return {
      isCrypto: true, currency: 'USD', minAmount: 5,
      minAccountLength: 26, maxAccountLength: 50,
      accountOnlyDigits: false, accountLabel: 'Bitcoin Wallet Address',
    };
  }

  // Mobile Banking (default)
  return {
    isCrypto: false, currency: 'BDT', minAmount: 500,
    minAccountLength: 11, maxAccountLength: 11,
    accountOnlyDigits: true, accountLabel: 'রেজিস্টার্ড মোবাইল নম্বর',
  };
};

export async function POST(request) {
  try {
    await clientPromise;

    // ১. Auth check
    const auth = await verifyAuth('user');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status }
      );
    }

    // ২. Body parse
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ ডেটা!' }, { status: 400 });
    }

    const method = typeof body.method === 'string' ? body.method.trim() : '';
    const rawAccountNumber = typeof body.accountNumber === 'string' ? body.accountNumber.trim() : '';
    const parsedAmount = Number(body.amount);
    const pin = typeof body.pin === 'string' ? body.pin.trim() : '';

    const cfg = getMethodConfig(method);

    // ✅ Account sanitize
    let accountNumber = rawAccountNumber;
    if (cfg.accountOnlyDigits) {
      accountNumber = rawAccountNumber.replace(/\D/g, '');
    } else {
      accountNumber = rawAccountNumber.replace(/[^a-zA-Z0-9]/g, '');
    }

    // Basic validation
    if (!body.amount || !method || !accountNumber || !pin) {
      return NextResponse.json({ success: false, message: 'তথ্য অসম্পূর্ণ!' }, { status: 400 });
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ success: false, message: 'পিন ৪ সংখ্যার হতে হবে!' }, { status: 400 });
    }

    // ==========================================
    // ✅ USD → BDT rate DB থেকে
    // ==========================================
    const rateSetting = await Setting.findOne({ key: 'usdToBdtRate' });
    const USD_TO_BDT_RATE = Number(rateSetting?.value) || 120;

    // ✅ Crypto হলে BDT-তে convert
    const balanceDeduction = cfg.isCrypto
      ? Math.round(parsedAmount * USD_TO_BDT_RATE)
      : parsedAmount;

    // Amount min
    if (isNaN(parsedAmount) || parsedAmount < cfg.minAmount) {
      return NextResponse.json({
        success: false,
        message: cfg.isCrypto
          ? `সর্বনিম্ন উইথড্র $${cfg.minAmount}!`
          : `সর্বনিম্ন উইথড্র ৳${cfg.minAmount}!`
      }, { status: 400 });
    }

    // Account length
    if (accountNumber.length < cfg.minAccountLength) {
      return NextResponse.json({
        success: false,
        message: `${cfg.accountLabel} — কমপক্ষে ${cfg.minAccountLength} ${cfg.accountOnlyDigits ? 'ডিজিট' : 'character'}!`
      }, { status: 400 });
    }

    if (accountNumber.length > cfg.maxAccountLength) {
      return NextResponse.json({
        success: false,
        message: `${cfg.accountLabel} — সর্বোচ্চ ${cfg.maxAccountLength} ${cfg.accountOnlyDigits ? 'ডিজিট' : 'character'}!`
      }, { status: 400 });
    }

    // PaymentMethod validate
    const escapedMethod = method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const paymentMethodDoc = await PaymentMethod.findOne({
      methodName: { $regex: `^${escapedMethod}$`, $options: 'i' },
      isActive: true
    });

    if (!paymentMethodDoc) {
      return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথড সচল নেই!' }, { status: 400 });
    }

    // User fetch
    const user = await User.findById(auth.user._id || auth.user.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি!' }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ success: false, message: 'অ্যাকাউন্ট ব্লকড!' }, { status: 403 });
    }

    // PIN verify
    if (!user.pin) {
      return NextResponse.json({ success: false, message: 'সিকিউরিটি পিন সেট নেই!' }, { status: 400 });
    }

    const isPinMatch = await bcrypt.compare(pin, user.pin);
    if (!isPinMatch) {
      return NextResponse.json({ success: false, message: 'পিন সঠিক নয়!' }, { status: 400 });
    }

    // Mobile হলে registered phone verify
    const registeredPhone = user.phone || user.uid;
    if (!cfg.isCrypto) {
      if (accountNumber !== registeredPhone) {
        return NextResponse.json({ success: false, message: 'শুধুমাত্র রেজিস্টার্ড নম্বরে উইথড্র!' }, { status: 400 });
      }
    }

    // ==========================================
    // ✅ Balance check (crypto হলে BDT-তে)
    // ==========================================
    const currentReferralBalance = Number(user.referralBalance || 0);

    if (currentReferralBalance < balanceDeduction) {
      return NextResponse.json({
        success: false,
        message: cfg.isCrypto
          ? `পর্যাপ্ত রেফারেল বোনাস নেই! প্রয়োজন ৳${balanceDeduction} ($${parsedAmount} × ৳${USD_TO_BDT_RATE}), আছে ৳${currentReferralBalance}`
          : `পর্যাপ্ত রেফারেল বোনাস নেই! প্রয়োজন ৳${balanceDeduction}, আছে ৳${currentReferralBalance}`
      }, { status: 400 });
    }

    // ==========================================
    // ✅ Atomic balance deduct
    // ==========================================
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        referralBalance: { $gte: balanceDeduction }
      },
      { $inc: { referralBalance: -balanceDeduction } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'ব্যালেন্স কাটতে সমস্যা!' }, { status: 400 });
    }

    // ==========================================
    // ✅ Withdraw record — সব field সহ
    // ==========================================
    await Withdraw.create({
      uid: user.uid,
      phone: user.phone,
      
      amount: parsedAmount,                                // $10 (crypto) / ৳500 (mobile)
      deductedBDT: balanceDeduction,                       // ৳1200 / ৳500 ✅
      originalAmount: parsedAmount,
      originalCurrency: cfg.currency,                      // 'USD' / 'BDT' ✅
      exchangeRate: cfg.isCrypto ? USD_TO_BDT_RATE : 1,    // 120 / 1 ✅
      
      currency: cfg.currency,
      isCrypto: cfg.isCrypto,
      method: paymentMethodDoc.methodName,
      accountNumber: cfg.isCrypto ? accountNumber : registeredPhone,
      walletType: 'referral',
      status: 'pending'
    });

    // Success response
    return NextResponse.json({
      success: true,
      message: cfg.isCrypto
        ? `✅ রেফারেল উইথড্র সফল! $${parsedAmount} (ব্যালেন্স থেকে ৳${balanceDeduction} কেটেছে)`
        : `✅ রেফারেল উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে! (৳${parsedAmount} কেটেছে)`,
      newReferralBalance: Number(updatedUser.referralBalance),
      withdrawInfo: {
        originalAmount: parsedAmount,
        originalCurrency: cfg.currency,
        balanceDeduction: balanceDeduction,
        exchangeRate: cfg.isCrypto ? USD_TO_BDT_RATE : 1
      }
    }, {
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Referral Withdraw API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'সার্ভারে ত্রুটি!' }, { status: 500 });
  }
}