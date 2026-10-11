import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ============ REGISTRATION RATE LIMIT ============
const registerRateMap = new Map();

// প্রতি IP থেকে সর্বোচ্চ ৩টি রেজিস্ট্রেশন / ঘন্টা
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // ১ ঘন্টা
const REGISTER_MAX = 3;

function getClientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

function cleanupRegisterMap() {
  const now = Date.now();
  for (const [ip, data] of registerRateMap.entries()) {
    if (now > data.resetTime) registerRateMap.delete(ip);
  }
}
// ================================================

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

    // ============ RATE LIMIT CHECK ============
    const clientIp = getClientIp(req);
    const now = Date.now();

    if (registerRateMap.size > 500) cleanupRegisterMap();

    const limitData = registerRateMap.get(clientIp);

    if (!limitData || now > limitData.resetTime) {
      registerRateMap.set(clientIp, { count: 1, resetTime: now + REGISTER_WINDOW_MS });
    } else {
      if (limitData.count >= REGISTER_MAX) {
        const remainingMin = Math.ceil((limitData.resetTime - now) / 60000);
        return NextResponse.json({ 
          success: false, 
          message: `একটি IP থেকে অনেকবার রেজিস্ট্রেশন করা হয়েছে! ${remainingMin} মিনিট পর আবার চেষ্টা করুন।` 
        }, { status: 429 });
      }
      limitData.count++;
    }
    // ==========================================

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
    }

    const { phone, uid, mobile, password, pin, refCode, ref } = body || {};
    const phoneOrUid = phone || uid || mobile;
    const referralCodeInput = refCode || ref;

    if (!phoneOrUid || !password || !pin) {
      return NextResponse.json({ 
        success: false, 
        message: 'ফোন নম্বর/আইডি, পাসওয়ার্ড এবং পিন দিতে হবে!' 
      }, { status: 400 });
    }

    const cleanValue = String(phoneOrUid).trim();
    const cleanPassword = String(password).trim();
    const cleanPin = String(pin).trim();

    // ১১ ডিজিট নিশ্চিত করা
    if (cleanValue.length !== 11 || !/^\d+$/.test(cleanValue)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ইউজার আইডি বা ফোন নম্বরটি সঠিক ১১ ডিজিটের সংখ্যা হতে হবে!' 
      }, { status: 400 });
    }

    // PIN validation
    if (cleanPin.length !== 4 || !/^\d+$/.test(cleanPin)) {
      return NextResponse.json({ 
        success: false, 
        message: 'পিন অবশ্যই ৪ ডিজিটের সংখ্যা হতে হবে!' 
      }, { status: 400 });
    }

    // ✅ Password length check (min + max)
    if (cleanPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!' 
      }, { status: 400 });
    }

    if (cleanPassword.length > 100) {
      return NextResponse.json({ 
        success: false, 
        message: 'পাসওয়ার্ড ১০০ অক্ষরের বেশি হতে পারবে না!' 
      }, { status: 400 });
    }

    // ✅ Weak password block
    const weakPasswords = ['123456', '1234567', '12345678', 'password', '000000', '111111', '123123', 'qwerty', 'admin123'];
    if (weakPasswords.includes(cleanPassword.toLowerCase())) {
      return NextResponse.json({ 
        success: false, 
        message: 'এই পাসওয়ার্ডটি খুব দুর্বল। শক্তিশালী পাসওয়ার্ড দিন!' 
      }, { status: 400 });
    }

    // ✅ Weak PIN block
    const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321'];
    if (weakPins.includes(cleanPin)) {
      return NextResponse.json({ 
        success: false, 
        message: 'এই পিনটি খুব সহজ। অন্য পিন নির্বাচন করুন!' 
      }, { status: 400 });
    }

    // Duplicate user check
    const existingUser = await User.findOne({ 
      $or: [
        { phone: cleanValue },
        { uid: cleanValue }
      ]
    });

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'এই নম্বর বা আইডি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে!' 
      }, { status: 400 });
    }

    // ✅ Referral code validation (with length limit)
    let validReferrer = null;
    if (referralCodeInput) {
      const cleanRefCode = String(referralCodeInput).trim();

      if (cleanRefCode.length > 20) {
        return NextResponse.json({ 
          success: false, 
          message: 'রেফারেল কোড সঠিক নয়!' 
        }, { status: 400 });
      }

      if (cleanRefCode.length > 0 && cleanRefCode !== cleanValue) {
        const referrerUser = await User.findOne({ referralCode: cleanRefCode });
        if (referrerUser && referrerUser.uid !== cleanValue) {
          validReferrer = referrerUser;
        }
      }
    }

    // Password + PIN hash
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(cleanPassword, saltRounds);
    const hashedPin = await bcrypt.hash(cleanPin, saltRounds);

    // IP log
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Create new user
    const newUser = await User.create({
      uid: cleanValue,
      phone: cleanValue,
      password: hashedPassword, 
      pin: hashedPin, 
      balance: 0,
      turnover: 0,
      isBlocked: false,
      ipAddress: ipAddress,
      role: 'user',
      referralCode: cleanValue, 
      referredBy: validReferrer ? validReferrer.uid : null 
    });

    // ✅ JWT Token — algorithm pinned
    const token = jwt.sign(
      { userId: newUser._id, uid: newUser.uid, phone: newUser.phone, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'রেজিস্ট্রেশন এবং পিন সেটআপ সফল হয়েছে!',
      user: { 
        uid: newUser.uid, 
        phone: newUser.phone, 
        role: newUser.role,
        balance: newUser.balance,
        turnover: newUser.turnover,
        isBlocked: newUser.isBlocked
      }
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration API Error:', error);

    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: 'এই নম্বর বা আইডি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে!' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভার এরর হয়েছে, আবার চেষ্টা করুন।' 
    }, { status: 500 });
  }
}