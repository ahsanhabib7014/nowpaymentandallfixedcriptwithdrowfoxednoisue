import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req) {
  try {
    await dbConnect();

    // ১. সিক্রেট কি চেক (প্রোডাকশনের জন্য জরুরি)
    const { searchParams } = new URL(req.url);
    const secretKey = searchParams.get('secret') || req.headers.get('x-seed-secret');
    
    if (process.env.NODE_ENV === 'production' && secretKey !== process.env.ADMIN_SEED_SECRET) {
      return NextResponse.json({ 
        success: false, 
        message: 'অনুমোদিত নয়! সঠিক সিক্রেট কি প্রদান করা হয়নি।' 
      }, { status: 403 });
    }

    // ২. সরাসরি .env ফাইল থেকে অ্যাডমিনের তথ্য নেওয়া
    const adminPhone = process.env.ADMIN_PHONE;
    const adminPass = process.env.ADMIN_PASSWORD;
    const adminPin = process.env.ADMIN_PIN;

    if (!adminPhone || !adminPass || !adminPin) {
      return NextResponse.json({ 
        success: false, 
        message: 'দয়া করে আপনার .env ফাইলে ADMIN_PHONE, ADMIN_PASSWORD এবং ADMIN_PIN সঠিকভাবে সেট করুন!' 
      }, { status: 400 });
    }

    // ৩. আগের সব অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা
    await User.deleteMany({ $or: [{ uid: 'ADMIN' }, { role: 'admin' }] });

    // ৪. পাসওয়ার্ড এবং পিন উভয়ই bcrypt দিয়ে হ্যাশ করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(adminPass).trim(), salt);
    const hashedPin = await bcrypt.hash(String(adminPin).trim(), salt);

    // ৫. .env এর তথ্য দিয়ে নতুন অ্যাডমিন তৈরি করা
    const newAdmin = await User.create({
      uid: 'ADMIN',
      phone: String(adminPhone).trim(),
      password: hashedPassword,
      pin: hashedPin,
      role: 'admin',
      balance: 0,
      turnover: 0
    });

    return NextResponse.json({ 
      success: true, 
      message: '.env ফাইলের তথ্য অনুযায়ী অ্যাডমিন এবং পিন সফলভাবে হ্যাশ করে তৈরি করা হয়েছে!',
      adminInfo: {
        uid: newAdmin.uid,
        phone: newAdmin.phone,
        role: newAdmin.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin seeding error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ..................................................
