import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Withdraw from '@/models/Withdraw';
import User from '@/models/User';
import PaymentMethod from '@/models/PaymentMethod';
import Setting from '@/models/Setting';
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/utils/authCheck';

// ✅ Method-specific account validation
const getAccountValidation = (method) => {
  const upper = String(method || '').toUpperCase();
  
  if (upper.includes('TRX') || upper.includes('TRON')) {
    return { minLength: 34, maxLength: 34, onlyDigits: false, label: 'TRX Wallet Address' };  // ✅ 34-34
  }
  if (upper.includes('USDT') || upper.includes('BINANCE')) {
    return { minLength: 5, maxLength: 10, onlyDigits: true, label: 'Binance Pay ID' };          // ✅ 5-10
  }
  if (upper.includes('BTC') || upper.includes('BITCOIN')) {
    return { minLength: 26, maxLength: 50, onlyDigits: false, label: 'Bitcoin Address' };
  }
  if (upper.includes('ETH') || upper.includes('ETHEREUM')) {
    return { minLength: 40, maxLength: 50, onlyDigits: false, label: 'ETH Address' };
  }
  
  // Mobile Banking
  return { minLength: 11, maxLength: 11, onlyDigits: true, label: 'Mobile Banking Number' };
};

export async function POST(req) {
  try {
    await dbConnect();

    // ==========================================
    // ১. Auth check
    // ==========================================
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

    // ==========================================
    // ২. Body parse
    // ==========================================
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ ডেটা!' }, { status: 400 });
    }

    const { amount, method, pin, accountNumber: userProvidedAccount } = body || {};

    if (!amount || !method || !pin) {
      return NextResponse.json({ success: false, message: 'তথ্য অসম্পূর্ণ!' }, { status: 400 });
    }

    // ==========================================
    // ৩. Amount validation
    // ==========================================
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return NextResponse.json({ success: false, message: 'অবৈধ পরিমাণ!' }, { status: 400 });
    }

    // ==========================================
    // ৪. Rate fetch + Crypto detection
    // ==========================================
    const rateSetting = await Setting.findOne({ key: 'usdToBdtRate' });
    const USD_TO_BDT_RATE = Number(rateSetting?.value) || 120;

    const methodUpper = String(method).toUpperCase();
    const isCryptoWithdraw = 
      methodUpper.includes('USDT') || 
      methodUpper.includes('BINANCE') || 
      methodUpper.includes('TRX') || 
      methodUpper.includes('TRON') ||
      methodUpper.includes('CRYPTO') ||
      methodUpper.includes('BTC') ||
      methodUpper.includes('ETH');

    const originalAmount = cleanAmount;
    const balanceDeduction = isCryptoWithdraw 
      ? Math.round(cleanAmount * USD_TO_BDT_RATE)
      : cleanAmount;

    // ==========================================
    // ৫. Min withdraw check
    // ==========================================
    if (isCryptoWithdraw && cleanAmount < 5) {
      return NextResponse.json({ 
        success: false, 
        message: 'সর্বনিম্ন উইথড্র $5!' 
      }, { status: 400 });
    }

    if (!isCryptoWithdraw && cleanAmount < 500) {
      return NextResponse.json({ 
        success: false, 
        message: 'সর্বনিম্ন উইথড্র ৳500!' 
      }, { status: 400 });
    }

    // ==========================================
    // ৬. Payment method validation
    // ==========================================
    const cleanMethod = String(method).trim();
    const escapedMethod = cleanMethod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const paymentMethodDoc = await PaymentMethod.findOne({
      methodName: { $regex: new RegExp(`^${escapedMethod}$`, 'i') },
      isActive: true
    });

    if (!paymentMethodDoc) {
      return NextResponse.json({ 
        success: false, 
        message: 'এই পেমেন্ট মেথড সচল নেই!' 
      }, { status: 400 });
    }

    const verifiedMethodName = paymentMethodDoc.methodName;

    // ==========================================
    // ৭. PIN validation (format)
    // ==========================================
    const cleanPin = String(pin).trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return NextResponse.json({ success: false, message: 'পিন ৪ সংখ্যার হতে হবে!' }, { status: 400 });
    }

    // ==========================================
    // ৮. User fetch
    // ==========================================
    const user = await User.findById(auth.user._id || auth.user.userId);

    if (!user) {
      return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি!' }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্ট ব্লকড!' }, { status: 403 });
    }

    // ==========================================
    // ৯. PIN check
    // ==========================================
    if (!user.pin) {
      return NextResponse.json({ success: false, message: 'আপনার সিকিউরিটি পিন সেট করা নেই!' }, { status: 400 });
    }

    const isPinMatch = await bcrypt.compare(cleanPin, user.pin);
    if (!isPinMatch) {
      return NextResponse.json({ success: false, message: 'আপনার সিকিউরিটি পিন সঠিক নয়!' }, { status: 400 });
    }

    // ==========================================
    // ১০. Turnover check
    // ==========================================
    const cleanTurnover = Number(user.turnover) || 0;
    if (cleanTurnover > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `টার্নওভার বাকি আছে। আপনার টার্নওভার: ৳${cleanTurnover}` 
      }, { status: 400 });
    }

    // ==========================================
    // ১১. Account number validation — method specific
    // ==========================================
    const accountRule = getAccountValidation(method);
    let finalAccountNumber;

    if (accountRule.onlyDigits && accountRule.maxLength === 11) {
      // Mobile Banking → user-এর রেজিস্টার্ড নম্বর
      finalAccountNumber = user.phone;
      if (!finalAccountNumber || !/^\d{11}$/.test(finalAccountNumber)) {
        return NextResponse.json({ 
          success: false, 
          message: 'আপনার অ্যাকাউন্টে সঠিক ১১ ডিজিটের রেজিস্টার্ড নম্বর পাওয়া যায়নি!' 
        }, { status: 400 });
      }
    } else {
      // Crypto → user নিজে দেবে
      const cleanUserAccount = String(userProvidedAccount || '').trim();
      
      if (!cleanUserAccount) {
        return NextResponse.json({ 
          success: false, 
          message: `${accountRule.label} দিতে হবে!` 
        }, { status: 400 });
      }

      if (cleanUserAccount.length < accountRule.minLength || 
          cleanUserAccount.length > accountRule.maxLength) {
        return NextResponse.json({ 
          success: false, 
          message: `${accountRule.label} — ${accountRule.minLength}-${accountRule.maxLength} character হতে হবে! (এখন ${cleanUserAccount.length})` 
        }, { status: 400 });
      }

      if (accountRule.onlyDigits && !/^\d+$/.test(cleanUserAccount)) {
        return NextResponse.json({ 
          success: false, 
          message: `${accountRule.label} — শুধুমাত্র সংখ্যা গ্রহণযোগ্য!` 
        }, { status: 400 });
      }

      finalAccountNumber = cleanUserAccount;
    }

    // ==========================================
    // ১২. ✅ ATOMIC balance deduct (race condition proof)
    // ==========================================
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: user._id,
        balance: { $gte: balanceDeduction }
      },
      { $inc: { balance: -balanceDeduction } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false, 
        message: isCryptoWithdraw 
          ? `পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন ৳${balanceDeduction} (≈ $${originalAmount})`
          : 'আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!' 
      }, { status: 400 });
    }

    // ==========================================
    // ১৩. Withdraw record তৈরি
    // ==========================================
    await Withdraw.create({
      uid: user.uid,
      amount: originalAmount,
      deductedBDT: balanceDeduction,
      originalAmount: originalAmount,
      originalCurrency: isCryptoWithdraw ? 'USD' : 'BDT',
      exchangeRate: isCryptoWithdraw ? USD_TO_BDT_RATE : 1,
      method: verifiedMethodName,
      accountNumber: finalAccountNumber,
      walletType: 'main',                  // ✅ main wallet
      status: 'pending'
    });

    // ==========================================
    // ১৪. Success response
    // ==========================================
    return NextResponse.json({ 
      success: true, 
      message: isCryptoWithdraw 
        ? `✅ উইথড্র সফল! $${originalAmount} (ব্যালেন্স থেকে ৳${balanceDeduction} কেটেছে)`
        : `✅ উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে! (৳${originalAmount} কেটেছে)`,
      newBalance: Number(updatedUser.balance),
      withdrawInfo: {
        originalAmount: originalAmount,
        originalCurrency: isCryptoWithdraw ? 'USD' : 'BDT',
        balanceDeduction: balanceDeduction,
        exchangeRate: isCryptoWithdraw ? USD_TO_BDT_RATE : 1
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
    console.error('Withdraw API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভারে ত্রুটি ঘটেছে!' 
    }, { status: 500 });
  }
}