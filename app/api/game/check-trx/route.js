import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Deposit from '@/models/Deposit';
import { verifyAuth } from '@/utils/authCheck';

export async function POST(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন[cite: 4]
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

    const { transactionId } = body || {};

    if (!transactionId) {
      return NextResponse.json({ success: false, exists: false, message: 'ট্রানজেকশন আইডি পাওয়া যায়নি!' }, { status: 400 });
    }

    const trimmedTrxId = String(transactionId).trim();
    if (!trimmedTrxId) {
      return NextResponse.json({ success: false, exists: false, message: 'ট্রানজেকশন আইডি খালি হতে পারে না!' }, { status: 400 });
    }

    // ২. ডাটাবেজে ট্রানজেকশন আইডি খোঁজা[cite: 4]
    const existing = await Deposit.findOne({ transactionId: trimmedTrxId });

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        exists: true, 
        message: '⚠️ এই ট্রানজেকশন আইডিটি ইতিপূর্বে ব্যবহার বা সাবমিট করা হয়েছে!' 
      }, {
        status: 200,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      });
    }

    return NextResponse.json(
      { success: true, exists: false }, 
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
    console.error('Trx Check Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
  }
}