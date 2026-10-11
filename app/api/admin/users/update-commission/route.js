import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

export async function POST(request) {
  try {
    // ১. আপনার অরিজিনাল ডাটাবেজ কানেকশন পদ্ধতি
    await clientPromise;

    // ২. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        message: auth.message 
      }, { status: auth.status });
    }

    const adminUser = auth.user;

    const body = await request.json();
    
    const uid = typeof body.uid === 'string' ? body.uid.trim() : '';
    const parsedRate = Number(body.commissionRate);

    if (!uid || body.commissionRate === undefined) {
      return NextResponse.json({ success: false, message: 'ইউজার আইডি এবং কমিশন রেট আবশ্যক।' }, { status: 400 });
    }

    if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
      return NextResponse.json({ success: false, message: 'সঠিক কমিশন রেট (০ থেকে ১০০ এর মধ্যে) প্রদান করুন।' }, { status: 400 });
    }

    // ৪. ইউজারের customCommission আপডেট করা
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { customCommission: parsedRate }, 
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি।' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'ইউজারের রেফারেল কমিশন সফলভাবে আপডেট করা হয়েছে!',
      user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error('Commission Update Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}