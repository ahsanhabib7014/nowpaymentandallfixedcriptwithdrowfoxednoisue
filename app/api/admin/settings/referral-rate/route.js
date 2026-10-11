import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { verifyAuth } from '@/utils/authCheck';

// বর্তমান রেফারেল পার্সেন্টেজ গেট করার জন্য (শুধুমাত্র অ্যাডমিন)
export async function GET(request) {
  try {
    await clientPromise;

    // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const setting = await Setting.findOne({ key: 'referralPercentage' });
    const percentage = setting ? setting.value : 10; // ডিফল্টভাবে ১০%

    return NextResponse.json({ success: true, percentage }, { status: 200 });
  } catch (error) {
    console.error('Referral Percentage GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// অ্যাডমিন কর্তৃক রেফারেল পার্সেন্টেজ আপডেট করার জন্য (শুধুমাত্র অ্যাডমিন)
export async function POST(request) {
  try {
    await clientPromise;

    // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { percentage } = await request.json();
    const parsedPercentage = Number(percentage);

    if (isNaN(parsedPercentage) || parsedPercentage < 0) {
      return NextResponse.json({ success: false, message: 'সঠিক পার্সেন্টেজ প্রদান করুন।' }, { status: 400 });
    }

    await Setting.findOneAndUpdate(
      { key: 'referralPercentage' },
      { value: parsedPercentage },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'রেফারেল পার্সেন্টেজ সফলভাবে আপডেট করা হয়েছে।' }, { status: 200 });
  } catch (error) {
    console.error('Referral Percentage POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}