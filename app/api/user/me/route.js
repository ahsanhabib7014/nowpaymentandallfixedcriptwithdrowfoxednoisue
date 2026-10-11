import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

export async function GET(request) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন[cite: 12]
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

    // ২. ডাটাবেজ থেকে সম্পূর্ণ ইউজার অবজেক্ট বা লেটেস্ট স্ট্যাটাস ফেচ করা[cite: 12]
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

    // ৩. ইউজারের তথ্য সফলভাবে রিটার্ন করা[cite: 12]
    return NextResponse.json({ 
      success: true, 
      user 
    }, { 
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('User Fetch Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}