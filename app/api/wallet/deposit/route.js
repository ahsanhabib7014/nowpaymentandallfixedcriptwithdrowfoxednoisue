import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Transaction from '@/models/Transaction';
import { verifyAuth } from '@/utils/authCheck';

export async function POST(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন[cite: 11]
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

    const { amount, method, transactionId, accountNumber } = body;

    if (!amount || !method) {
      return NextResponse.json({ 
        success: false, 
        message: 'সব প্রয়োজনীয় তথ্য (পরিমাণ ও মাধ্যম) পূরণ করুন!' 
      }, { status: 400 });
    }

    // ২. ভেরিফাইড ইউজার থেকে সুরক্ষিত আইডি ও তথ্য ব্যবহার করা[cite: 11]
    const userId = auth.user._id || auth.user.userId;
    const userUid = auth.user.uid || auth.user.phone;
    const userPhone = auth.user.phone || '';

    // ৩. ট্রানজেকশন কালেকশনে ডিপোজিট রিকোয়েস্ট সেভ করা[cite: 11]
    await Transaction.create({
      userId: userId,
      uid: userUid,
      phone: userPhone,
      type: 'deposit',
      amount: Number(amount),
      method,
      transactionId: transactionId || '',
      accountNumber: accountNumber || '',
      status: 'pending',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'ডিপোজিট রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে। অ্যাডমিন অ্যাপ্রুভ করলে ব্যালেন্স যোগ হবে।' 
    }, { 
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Deposit API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing deposit' 
    }, { status: 500 });
  }
}