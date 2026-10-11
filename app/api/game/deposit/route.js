import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Deposit from '@/models/Deposit';
import Setting from '@/models/Setting';
import { verifyAuth } from '@/utils/authCheck';

// ============ DEPOSIT RATE LIMIT ============
const depositRateMap = new Map();
const DEPOSIT_WINDOW_MS = 60 * 60 * 1000; // ১ ঘন্টা
const DEPOSIT_MAX = 10;

function getClientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

function cleanupDepositMap() {
  const now = Date.now();
  for (const [ip, data] of depositRateMap.entries()) {
    if (now > data.resetTime) depositRateMap.delete(ip);
  }
}
// =============================================

// ✅ Method-specific validation rules
const getSenderValidation = (method) => {
  const upper = String(method || '').toUpperCase();
  
  if (upper.includes('TRX') || upper.includes('TRON')) {
    return { minLength: 20, maxLength: 50, onlyDigits: false, label: 'TRX Wallet Address' };
  }
  if (upper.includes('USDT') || upper.includes('BINANCE')) {
    return { minLength: 5, maxLength: 50, onlyDigits: false, label: 'Binance/USDT ID' };
  }
  if (upper.includes('BTC') || upper.includes('BITCOIN')) {
    return { minLength: 26, maxLength: 50, onlyDigits: false, label: 'Bitcoin Address' };
  }
  if (upper.includes('ETH') || upper.includes('ETHEREUM')) {
    return { minLength: 40, maxLength: 50, onlyDigits: false, label: 'ETH Address' };
  }
  
  // Mobile Banking (default)
  return { minLength: 11, maxLength: 11, onlyDigits: true, label: 'Mobile Banking Number' };
};

export async function POST(req) {
  try {
    await dbConnect();

    // ============ RATE LIMIT ============
    const clientIp = getClientIp(req);
    const now = Date.now();

    if (depositRateMap.size > 500) cleanupDepositMap();

    const limitData = depositRateMap.get(clientIp);

    if (!limitData || now > limitData.resetTime) {
      depositRateMap.set(clientIp, { count: 1, resetTime: now + DEPOSIT_WINDOW_MS });
    } else {
      if (limitData.count >= DEPOSIT_MAX) {
        const remainingMin = Math.ceil((limitData.resetTime - now) / 60000);
        return NextResponse.json(
          { 
            success: false, 
            message: `একটি IP থেকে অনেকবার ডিপোজিট রিকোয়েস্ট করা হয়েছে! ${remainingMin} মিনিট পর আবার চেষ্টা করুন।` 
          }, 
          { status: 429 }
        );
      }
      limitData.count++;
    }
    // ==========================================

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

    const user = auth.user;

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ ডেটা!' }, { status: 400 });
    }

    let { amount, method, senderNumber, accountNumber, transactionId } = body || {};
    const finalSenderNumber = senderNumber || accountNumber;

    // ২. Presence check
    if (!amount || !method || !finalSenderNumber || !transactionId) {
      return NextResponse.json({ success: false, message: 'অসম্পূর্ণ ডেটা!' }, { status: 400 });
    }

    // ৩. Amount sanitization
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return NextResponse.json({ success: false, message: 'অবৈধ পরিমাণ!' }, { status: 400 });
    }

    // ✅ Database থেকে exchange rate নাও
    const rateSetting = await Setting.findOne({ key: 'usdToBdtRate' });
    const USD_TO_BDT_RATE = Number(rateSetting?.value) || 120;

    // ✅ USD Detection
    const methodUpper = String(method).toUpperCase();
    const isUSDPayment = 
      methodUpper.includes('USDT') || 
      methodUpper.includes('BINANCE') || 
      methodUpper.includes('TRX') || 
      methodUpper.includes('TRON') ||
      methodUpper.includes('CRYPTO') ||
      methodUpper.includes('BTC') ||
      methodUpper.includes('ETH');

    // ✅ Convert to BDT
    const originalAmount = cleanAmount;
    const convertedAmount = isUSDPayment 
      ? Math.round(cleanAmount * USD_TO_BDT_RATE)
      : cleanAmount;

    // ৪. Min deposit check (BDT-এ)
    if (convertedAmount < 500) {
      return NextResponse.json({ 
        success: false, 
        message: isUSDPayment 
          ? `সর্বনিম্ন ডিপোজিট ৳500 (≈ $${(500 / USD_TO_BDT_RATE).toFixed(2)})!` 
          : 'সর্বনিম্ন ডিপোজিট ৫০০ টাকা!' 
      }, { status: 400 });
    }

    // ৫. Sender number validation — method-specific
    const senderRule = getSenderValidation(method);
    const cleanSenderNumber = String(finalSenderNumber).trim();

    if (cleanSenderNumber.length < senderRule.minLength || 
        cleanSenderNumber.length > senderRule.maxLength) {
      return NextResponse.json({ 
        success: false, 
        message: `${senderRule.label} — দৈর্ঘ্য ${senderRule.minLength}-${senderRule.maxLength} এর মধ্যে হতে হবে! (এখন ${cleanSenderNumber.length})` 
      }, { status: 400 });
    }

    if (senderRule.onlyDigits && !/^\d+$/.test(cleanSenderNumber)) {
      return NextResponse.json({ 
        success: false, 
        message: `${senderRule.label} — শুধুমাত্র সংখ্যা গ্রহণযোগ্য!` 
      }, { status: 400 });
    }

    // ৬. Transaction ID sanitization
    const cleanTrxId = String(transactionId).trim().toUpperCase();
    if (cleanTrxId.length < 5 || cleanTrxId.length > 100) {
      return NextResponse.json({ success: false, message: 'TrxID সঠিক নয়!' }, { status: 400 });
    }

    // ৭. Duplicate check
    const existingDeposit = await Deposit.findOne({ transactionId: cleanTrxId });
    if (existingDeposit) {
      return NextResponse.json({ 
        success: false, 
        message: 'এই ট্রানজেকশন আইডি ইতিপূর্বেই ব্যবহার করা হয়েছে!' 
      }, { status: 400 });
    }

    // ৮. Save deposit
    await Deposit.create({
      uid: user.uid,
      amount: convertedAmount,
      originalAmount: originalAmount,
      originalCurrency: isUSDPayment ? 'USD' : 'BDT',
      exchangeRate: isUSDPayment ? USD_TO_BDT_RATE : 1,
      method: String(method).trim(),
      senderNumber: cleanSenderNumber,
      transactionId: cleanTrxId,
      status: 'pending'
    });

    return NextResponse.json(
      { 
        success: true, 
        message: isUSDPayment 
          ? `✅ ডিপোজিট সফল! $${originalAmount} → ৳${convertedAmount} (Rate: $1 = ৳${USD_TO_BDT_RATE})`
          : '✅ ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে!',
        conversion: isUSDPayment ? {
          original: originalAmount,
          originalCurrency: 'USD',
          converted: convertedAmount,
          convertedCurrency: 'BDT',
          rate: USD_TO_BDT_RATE
        } : null
      },
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
    console.error('Secure Deposit API Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভারে ত্রুটি!' }, { status: 500 });
  }
}