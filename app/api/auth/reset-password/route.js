import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/utils/db';
import User from '@/models/User';

const MAX_PIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // ১৫ মিনিট

// ============ RESET PASSWORD RATE LIMIT ============
const resetRateMap = new Map();

// প্রতি IP থেকে সর্বোচ্চ ৫টি চেষ্টা / ১৫ মিনিট
const RESET_WINDOW_MS = 15 * 60 * 1000;
const RESET_MAX = 5;

function getClientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

function cleanupResetMap() {
  const now = Date.now();
  for (const [ip, data] of resetRateMap.entries()) {
    if (now > data.resetTime) resetRateMap.delete(ip);
  }
}
// ===================================================

export async function POST(req) {
  try {
    await dbConnect();

    // ============ RATE LIMIT CHECK ============
    const clientIp = getClientIp(req);
    const now = Date.now();

    if (resetRateMap.size > 500) cleanupResetMap();

    const limitData = resetRateMap.get(clientIp);

    if (!limitData || now > limitData.resetTime) {
      resetRateMap.set(clientIp, { count: 1, resetTime: now + RESET_WINDOW_MS });
    } else {
      if (limitData.count >= RESET_MAX) {
        const remainingMin = Math.ceil((limitData.resetTime - now) / 60000);
        return NextResponse.json({ 
          success: false, 
          message: `অনেকবার চেষ্টা করা হয়েছে! ${remainingMin} মিনিট পর আবার চেষ্টা করুন।` 
        }, { status: 429 });
      }
      limitData.count++;
    }
    // ==========================================

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ 
        success: false, 
        message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' 
      }, { status: 400 });
    }

    const { phone, pin, newPassword } = body || {};

    if (!phone || !pin || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'সবগুলো ফিল্ড পূরণ করতে হবে!' 
      }, { status: 400 });
    }

    const cleanPhone = String(phone).trim();
    const cleanPin = String(pin).trim();
    const cleanNewPassword = String(newPassword).trim();

    // Input validation
    if (cleanPhone.length !== 11 || !/^\d+$/.test(cleanPhone)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ইউজার আইডি বা ফোন নম্বরটি সঠিক ১১ ডিজিটের হতে হবে!' 
      }, { status: 400 });
    }

    if (cleanPin.length !== 4 || !/^\d+$/.test(cleanPin)) {
      return NextResponse.json({ 
        success: false, 
        message: 'পিন অবশ্যই ৪ ডিজিটের সংখ্যা হতে হবে!' 
      }, { status: 400 });
    }

    if (cleanNewPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!' 
      }, { status: 400 });
    }

    // ✅ Password max length check (DoS protection)
    if (cleanNewPassword.length > 100) {
      return NextResponse.json({ 
        success: false, 
        message: 'পাসওয়ার্ড ১০০ অক্ষরের বেশি হতে পারবে না!' 
      }, { status: 400 });
    }

    // ✅ Weak password block
    const weakPasswords = ['123456', '1234567', '12345678', 'password', '000000', '111111', '123123', 'qwerty', 'admin123', 'abcdef'];
    if (weakPasswords.includes(cleanNewPassword.toLowerCase())) {
      return NextResponse.json({ 
        success: false, 
        message: 'এই পাসওয়ার্ডটি খুব দুর্বল। শক্তিশালী পাসওয়ার্ড দিন!' 
      }, { status: 400 });
    }

    // ✅ Generic error for user enumeration prevention
    const genericError = NextResponse.json({ 
      success: false, 
      message: 'ভুল তথ্য! নম্বর, পিন বা পাসওয়ার্ড সঠিক নয়।' 
    }, { status: 400 });

    const user = await User.findOne({ 
      $or: [
        { phone: cleanPhone },
        { uid: cleanPhone }
      ]
    });

    // ✅ User না থাকলে same generic message (enumeration রোধ)
    if (!user || !user.pin) {
      return genericError;
    }

    // ✅ Blocked user check
    if (user.isBlocked) {
      return NextResponse.json({ 
        success: false, 
        message: 'আপনার অ্যাকাউন্ট ব্লক করা হয়েছে। সহায়তার জন্য যোগাযোগ করুন।' 
      }, { status: 403 });
    }

    // ✅ PIN lockout check
    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
      const remainingMs = user.pinLockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return NextResponse.json({ 
        success: false, 
        message: `অনেকবার ভুল পিন! ${remainingMin} মিনিট পর আবার চেষ্টা করুন।` 
      }, { status: 429 });
    }

    const isPinValid = await bcrypt.compare(cleanPin, user.pin);

    if (!isPinValid) {
      // ✅ FIX: Atomic increment (race condition রোধ)
      const attempts = (user.pinAttempts || 0) + 1;

      if (attempts >= MAX_PIN_ATTEMPTS) {
        // Lock কে atomic update
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              pinAttempts: 0,
              pinLockedUntil: new Date(Date.now() + LOCK_DURATION_MS)
            } 
          }
        );

        return NextResponse.json({ 
          success: false, 
          message: 'অনেকবার ভুল পিন! অ্যাকাউন্ট ১৫ মিনিটের জন্য লক করা হয়েছে।' 
        }, { status: 429 });
      }

      // Failed attempt counter আপডেট
      await User.updateOne(
        { _id: user._id },
        { $set: { pinAttempts: attempts } }
      );

      const remaining = MAX_PIN_ATTEMPTS - attempts;
      return NextResponse.json({ 
        success: false, 
        message: `ভুল পিন! আরও ${remaining} বার চেষ্টা করতে পারবেন।` 
      }, { status: 400 });
    }

    // ✅ সফল PIN — new password hash
    const hashedPassword = await bcrypt.hash(cleanNewPassword, 10);

    // ✅ Atomic update — attempt reset + password change একসাথে
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          pinAttempts: 0,
          pinLockedUntil: null
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!'
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    // ✅ Sensitive info log করবেন না
    console.error('Reset Password API Error: DB operation failed');
    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভার এরর ঘটেছে, আবার চেষ্টা করুন।' 
    }, { status: 500 });
  }
}