import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

// GET: সমস্ত ইউজার বা নির্দিষ্ট ইউজার খোঁজার জন্য (শুধুমাত্র অ্যাডমিন)
export async function GET(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        message: auth.message 
      }, { status: auth.status });
    }

    const adminUser = auth.user;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let query = {};
    if (search) {
      query = {
        $or: [
          { phone: { $regex: search, $options: 'i' } },
          { uid: { $regex: search, $options: 'i' } },
          { ipAddress: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users }, { status: 200 });

  } catch (error) {
    console.error('Admin Users GET Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
  }
}

// PATCH: ইউজারের তথ্য (ব্যালেন্স, টার্নওভার, ব্লক স্ট্যাটাস, কমিশন ইত্যাদি) আপডেট করার জন্য (শুধুমাত্র অ্যাডমিন)
export async function PATCH(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const adminUser = auth.user;

    const { userId, balance, turnover, isBlocked, ipAddress, customCommission } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'ইউজার আইডি পাওয়া যায়নি!' }, { status: 400 });
    }

    const updateData = {};
    if (balance !== undefined) updateData.balance = Number(balance);
    if (turnover !== undefined) updateData.turnover = Number(turnover);
    if (isBlocked !== undefined) updateData.isBlocked = Boolean(isBlocked);
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress;
    
    if (customCommission !== undefined) {
      updateData.customCommission = (customCommission === '' || customCommission === null) ? null : Number(customCommission);
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid: userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি!' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'ইউজার সফলভাবে আপডেট করা হয়েছে!', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Admin User Update Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
  }
}

// DELETE: ইউজার ডিলিট করার জন্য (শুধুমাত্র অ্যাডমিন)
export async function DELETE(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const adminUser = auth.user;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'ইউজার আইডি পাওয়া যায়নি!' }, { status: 400 });
    }

    const deletedUser = await User.findOneAndDelete({ uid: userId });
    if (!deletedUser) {
      return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি!' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'ইউজার সফলভাবে ডিলিট করা হয়েছে!' }, { status: 200 });

  } catch (error) {
    console.error('Admin User Delete Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
  }
}