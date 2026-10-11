import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const MAX_LOGIN_ATTEMPTS = 8;
const LOCK_DURATION_MS = 15 * 60 * 1000; // ১৫ মিনিট

export async function POST(req) {
  try {
    await dbConnect();

    // ✅ JWT_SECRET check
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
      console.error('JWT_SECRET is missing or too short!');
      return NextResponse.json({ 
        success: false, 
        message: 'সার্ভার কনফিগারেশন এরর!' 
      }, { status: 500 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
    }

    const { phone, uid, password } = body || {};
    const identifier = phone || uid;

    if (!identifier || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'ফোন নম্বর/আইডি এবং পাসওয়ার্ড দিতে হবে!' 
      }, { status: 400 });
    }

    if (typeof identifier !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: 'অবৈধ ইনপুট ফরম্যাট!' 
      }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (cleanIdentifier.length !== 11 || !/^\d+$/.test(cleanIdentifier)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ইউজার আইডি বা ফোন নম্বরটি সঠিক ১১ ডিজিটের হতে হবে!' 
      }, { status: 400 });
    }

    if (cleanPassword.length < 6 || cleanPassword.length > 100) {
      return NextResponse.json({ 
        success: false, 
        message: 'ভুল ফোন নম্বর বা পাসওয়ার্ড!' 
      }, { status: 401 });
    }

    // Client IP log
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const user = await User.findOne({ 
      $or: [
        { phone: cleanIdentifier },
        { uid: cleanIdentifier }
      ]
    });

    // ✅ Generic message (user enumeration রোধ)
    const genericError = 'ভুল ফোন নম্বর বা পাসওয়ার্ড!';
    const genericAuthFailed = NextResponse.json({ 
      success: false, 
      message: genericError 
    }, { status: 401 });

    if (!user) {
      return genericAuthFailed;
    }

    // ✅ Brute-force lockout check
    if (user.loginLockedUntil && user.loginLockedUntil > new Date()) {
      const remainingMs = user.loginLockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return NextResponse.json({ 
        success: false, 
        message: `অনেকবার ভুল চেষ্টা! ${remainingMin} মিনিট পর আবার চেষ্টা করুন।` 
      }, { status: 429 });
    }

    // ✅ Password verify
    const isPasswordValid = await bcrypt.compare(cleanPassword, user.password);

    if (!isPasswordValid) {
      // Failed attempt counter
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.loginLockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.loginAttempts = 0;
      }

      try { await user.save(); } catch (e) {}
      return genericAuthFailed;
    }

    // ✅ Blocked user check (PASSWORD verify-এর পরে)
    if (user.isBlocked) {
      return NextResponse.json({ 
        success: false, 
        message: 'আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে। সহায়তার জন্য যোগাযোগ করুন।' 
      }, { status: 403 });
    }

    // ✅ Success — attempt counter reset
    if (user.loginAttempts > 0 || user.loginLockedUntil) {
      user.loginAttempts = 0;
      user.loginLockedUntil = null;
    }

    // ✅ IP update
    if (ipAddress && ipAddress !== '127.0.0.1') {
      user.ipAddress = ipAddress;
    }

    try { await user.save(); } catch (e) {}

    // JWT Token (৭ দিনের মেয়াদ)
    const token = jwt.sign(
      { userId: user._id, phone: user.phone, uid: user.uid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'লগইন সফল হয়েছে!',
      user: {
        uid: user.uid,
        phone: user.phone,
        role: user.role,
        balance: user.balance,
        turnover: user.turnover,
        isBlocked: user.isBlocked
      }
    }, { status: 200 });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভার এরর হয়েছে, আবার চেষ্টা করুন।' 
    }, { status: 500 });
  }
}