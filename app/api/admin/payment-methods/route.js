import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import PaymentMethod from '@/models/PaymentMethod';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

// GET: মেথড ফেচ করা (অ্যাডমিন সব দেখবে, সাধারণ ইউজার শুধু সচল মেথডগুলো দেখবে)
export async function GET(req) {
  try {
    await dbConnect();

    // সাধারণ অথেন্টিকেশন চেক (লগইন করা আছে কি না)
    const auth = await verifyAuth();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: 'দয়া করে প্রথমে লগইন করুন!' }, { status: 401 });
    }

    let methods;
    // যদি ইউজার অ্যাডমিন হয়, তবে সব মেথড দেখাবে
    if (auth.user && auth.user.role === 'admin') {
      methods = await PaymentMethod.find({}).sort({ createdAt: -1 });
    } else {
      // সাধারণ ইউজারের জন্য শুধু সচল (Active) মেথডগুলো ফিল্টার করে পাঠানো হবে
      methods = await PaymentMethod.find({ isActive: true }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, methods }, { status: 200 });
  } catch (error) {
    console.error('Get Payment Methods Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার ত্রুটি ঘটেছে!' }, { status: 500 });
  }
}

// POST: নতুন মেথডের নাম যোগ করা (শুধুমাত্র অ্যাডমিন)
export async function POST(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const body = await req.json();
    const { methodName } = body;

    if (!methodName || !methodName.trim()) {
      return NextResponse.json({ success: false, message: 'মেথডের নাম আবশ্যক!' }, { status: 400 });
    }

    const cleanName = methodName.trim();

    // চেক করা নাম ইতিমধ্যে আছে কি না
    const existing = await PaymentMethod.findOne({ methodName: new RegExp(`^${cleanName}$`, 'i') });
    if (existing) {
      return NextResponse.json({ success: false, message: 'এই নামের পেমেন্ট মেথড ইতিমধ্যে রয়েছে!' }, { status: 400 });
    }

    const newMethod = await PaymentMethod.create({
      methodName: cleanName,
      isActive: true
    });

    return NextResponse.json({ success: true, message: 'পেমেন্ট মেথড সফলভাবে যোগ করা হয়েছে!', method: newMethod }, { status: 201 });
  } catch (error) {
    console.error('Create Payment Method Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার ত্রুটি ঘটেছে!' }, { status: 500 });
  }
}

// PUT: অন/অফ (Toggle Status) করার জন্য (শুধুমাত্র অ্যাডমিন)
export async function PUT(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'আইডি পাওয়া যায়নি!' }, { status: 400 });
    }

    const updatedMethod = await PaymentMethod.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedMethod) {
      return NextResponse.json({ success: false, message: 'পেমেন্ট মেথড পাওয়া যায়নি!' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `মেথডটি সফলভাবে ${isActive ? 'চালু' : 'বন্ধ'} করা হয়েছে!`, 
      method: updatedMethod 
    }, { status: 200 });
  } catch (error) {
    console.error('Update Payment Method Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার ত্রুটি ঘটেছে!' }, { status: 500 });
  }
}

// DELETE: ডিলিট করার জন্য (শুধুমাত্র অ্যাডমিন)
export async function DELETE(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'আইডি প্রয়োজন!' }, { status: 400 });
    }

    const deleted = await PaymentMethod.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'পেমেন্ট মেথড পাওয়া যায়নি!' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'পেমেন্ট মেথড সফলভাবে ডিলিট করা হয়েছে!' }, { status: 200 });
  } catch (error) {
    console.error('Delete Payment Method Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার ত্রুটি ঘটেছে!' }, { status: 500 });
  }
}