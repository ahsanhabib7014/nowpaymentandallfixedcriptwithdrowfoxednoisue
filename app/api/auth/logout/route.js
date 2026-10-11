import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'সফলভাবে লগআউট হয়েছে!'
    }, { status: 200 });

    // ✅ Cookie delete করার সময় login-এর মতো same attribute দিতে হবে
    const cookieNames = ['user_phone', 'token', 'uid', 'user', 'adminToken'];

    cookieNames.forEach(name => {
      response.cookies.set(name, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      });
    });

    return response;
  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভার এরর হয়েছে, আবার চেষ্টা করুন!' 
    }, { status: 500 });
  }
}