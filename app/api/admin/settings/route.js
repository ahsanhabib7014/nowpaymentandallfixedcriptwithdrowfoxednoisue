// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import PaymentSetting from '@/models/PaymentSetting';
// import { verifyAuth } from '@/utils/authCheck';

// // সব পেমেন্ট নম্বর ও লিমিট গেট করা (অ্যাডমিন সব দেখবে, সাধারণ ইউজার শুধু সচলগুলো দেখবে)
// export async function GET(req) {
//   try {
//     await dbConnect();

//     // প্রথমে চেক করব রিকোয়েস্টকারী অ্যাডমিন কি না
//     let isAdmin = false;
//     try {
//       const auth = await verifyAuth('admin');
//       if (auth.success) {
//         isAdmin = true;
//       }
//     } catch (e) {
//       isAdmin = false;
//     }

//     let settings;
//     if (isAdmin) {
//       // অ্যাডমিন হলে সব সেটিংস দেখাবে
//       settings = await PaymentSetting.find({}).sort({ createdAt: -1 });
//     } else {
//       // সাধারণ ইউজার হলে শুধুমাত্র সচল (Active) পেমেন্ট নম্বরগুলো দেখাবে
//       settings = await PaymentSetting.find({ isActive: true }).sort({ createdAt: -1 });
//     }

//     return NextResponse.json({ success: true, settings }, { status: 200 });
//   } catch (error) {
//     console.error('Settings GET Error:', error);
//     return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
//   }
// }

// // নতুন পেমেন্ট নম্বর বা লিমিট অ্যাড করা (শুধুমাত্র অ্যাডমিন)[cite: 7, 8]
// export async function POST(req) {
//   try {
//     await dbConnect();

//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
//     }

//     const { methodName, accountType, accountNumber, minDeposit, minWithdraw } = await req.json();

//     if (!methodName || !accountNumber) {
//       return NextResponse.json({ success: false, message: 'মেথড এবং অ্যাকাউন্ট নম্বর আবশ্যক!' }, { status: 400 });
//     }

//     if (methodName !== 'USDT' && methodName !== 'TRX' && accountNumber.length !== 11) {
//       return NextResponse.json({ success: false, message: 'অ্যাকাউন্ট নম্বর অবশ্যই ১১ সংখ্যার হতে হবে!' }, { status: 400 });
//     }

//     const newSetting = await PaymentSetting.create({
//       methodName,
//       accountType,
//       accountNumber,
//       minDeposit: minDeposit ? Number(minDeposit) : 500,
//       minWithdraw: minWithdraw ? Number(minWithdraw) : 500,
//     });

//     return NextResponse.json({ success: true, message: 'পেমেন্ট নম্বর সফলভাবে যুক্ত করা হয়েছে!', data: newSetting }, { status: 201 });
//   } catch (error) {
//     console.error('Settings POST Error:', error);
//     return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
//   }
// }

// // স্ট্যাটাস অন/অফ বা লিমিট আপডেট করার জন্য PATCH (শুধুমাত্র অ্যাডমিন)[cite: 7, 8]
// export async function PATCH(req) {
//   try {
//     await dbConnect();

//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
//     }

//     const { id, isActive, minDeposit, minWithdraw } = await req.json();

//     if (!id) {
//       return NextResponse.json({ success: false, message: 'আইডি পাওয়া যায়নি!' }, { status: 400 });
//     }

//     const updateData = {};
//     if (isActive !== undefined) updateData.isActive = isActive;
//     if (minDeposit !== undefined) updateData.minDeposit = Number(minDeposit);
//     if (minWithdraw !== undefined) updateData.minWithdraw = Number(minWithdraw);

//     const updated = await PaymentSetting.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    
//     if (!updated) {
//       return NextResponse.json({ success: false, message: 'পেমেন্ট সেটিংস পাওয়া যায়নি!' }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, message: 'সফলভাবে আপডেট করা হয়েছে!', updated }, { status: 200 });
//   } catch (error) {
//     console.error('Settings PATCH Error:', error);
//     return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
//   }
// }

// // ডিলিট করার জন্য DELETE (শুধুমাত্র অ্যাডমিন)[cite: 7, 8]
// export async function DELETE(req) {
//   try {
//     await dbConnect();

//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
//     }

//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get('id');

//     if (!id) {
//       return NextResponse.json({ success: false, message: 'আইডি পাওয়া যায়নি!' }, { status: 400 });
//     }

//     const deleted = await PaymentSetting.findByIdAndDelete(id);
//     if (!deleted) {
//       return NextResponse.json({ success: false, message: 'পেমেন্ট সেটিংস পাওয়া যায়নি!' }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, message: 'সফলভাবে ডিলিট করা হয়েছে!' }, { status: 200 });
//   } catch (error) {
//     console.error('Settings DELETE Error:', error);
//     return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
//   }
// }

// ..........................................................

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import PaymentSetting from '@/models/PaymentSetting';
import { verifyAuth } from '@/utils/authCheck';

// ==========================================
// ✅ Smart Validation Rules — method name অনুযায়ী
// ==========================================
const getValidationRule = (method) => {
  const upper = String(method || '').toUpperCase();
  
  // Crypto detection
  if (upper.includes('TRX') || upper.includes('TRON')) {
    return { minLength: 20, maxLength: 50, label: 'TRX Wallet Address', onlyDigits: false };
  }
  if (upper.includes('USDT') && (upper.includes('TRC') || upper.includes('TRON'))) {
    return { minLength: 20, maxLength: 50, label: 'USDT TRC20 Address', onlyDigits: false };
  }
  if (upper.includes('USDT') && (upper.includes('BEP') || upper.includes('BSC'))) {
    return { minLength: 30, maxLength: 50, label: 'USDT BEP20 Address', onlyDigits: false };
  }
  if (upper.includes('USDT')) {
    return { minLength: 20, maxLength: 50, label: 'USDT Address', onlyDigits: false };
  }
  if (upper.includes('BINANCE')) {
    return { minLength: 5, maxLength: 20, label: 'Binance Pay ID', onlyDigits: true };
  }
  if (upper.includes('BTC') || upper.includes('BITCOIN')) {
    return { minLength: 26, maxLength: 42, label: 'Bitcoin Address', onlyDigits: false };
  }
  if (upper.includes('ETH') || upper.includes('ETHEREUM')) {
    return { minLength: 40, maxLength: 42, label: 'ETH Address', onlyDigits: false };
  }
  
  // Mobile Banking (১১ ডিজিট) — default
  return { minLength: 11, maxLength: 11, label: 'Mobile Banking Number', onlyDigits: true };
};

// সব পেমেন্ট নম্বর ও লিমিট গেট করা
export async function GET(req) {
  try {
    await dbConnect();

    let isAdmin = false;
    try {
      const auth = await verifyAuth('admin');
      if (auth.success) isAdmin = true;
    } catch (e) {
      isAdmin = false;
    }

    let settings;
    if (isAdmin) {
      settings = await PaymentSetting.find({}).sort({ createdAt: -1 });
    } else {
      settings = await PaymentSetting.find({ isActive: true }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    console.error('Settings GET Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
  }
}

// নতুন পেমেন্ট নম্বর বা লিমিট অ্যাড করা (শুধুমাত্র অ্যাডমিন)
export async function POST(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { methodName, accountType, accountNumber, minDeposit, minWithdraw } = await req.json();

    if (!methodName || !accountNumber) {
      return NextResponse.json({ success: false, message: 'মেথড এবং অ্যাকাউন্ট নম্বর আবশ্যক!' }, { status: 400 });
    }

    // ✅✅✅ FIX: Smart validation — method name অনুযায়ী
    const rule = getValidationRule(methodName);
    const cleanAccountNumber = String(accountNumber).trim();

    // Length check
    if (cleanAccountNumber.length < rule.minLength || cleanAccountNumber.length > rule.maxLength) {
      return NextResponse.json({ 
        success: false, 
        message: `${rule.label} — দৈর্ঘ্য ${rule.minLength}-${rule.maxLength} এর মধ্যে হতে হবে! (এখন ${cleanAccountNumber.length})` 
      }, { status: 400 });
    }

    // Digits check
    if (rule.onlyDigits && !/^\d+$/.test(cleanAccountNumber)) {
      return NextResponse.json({ 
        success: false, 
        message: `${rule.label} — শুধুমাত্র সংখ্যা গ্রহণযোগ্য!` 
      }, { status: 400 });
    }

    const newSetting = await PaymentSetting.create({
      methodName: String(methodName).trim(),
      accountType: accountType || 'Personal',
      accountNumber: cleanAccountNumber,
      minDeposit: minDeposit ? Number(minDeposit) : 500,
      minWithdraw: minWithdraw ? Number(minWithdraw) : 500,
      isActive: true
    });

    return NextResponse.json({ 
      success: true, 
      message: '✅ পেমেন্ট নম্বর সফলভাবে যুক্ত করা হয়েছে!', 
      data: newSetting 
    }, { status: 201 });
  } catch (error) {
    console.error('Settings POST Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
  }
}

// স্ট্যাটাস অন/অফ বা লিমিট আপডেট করার জন্য PATCH (শুধুমাত্র অ্যাডমিন)
export async function PATCH(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { id, isActive, minDeposit, minWithdraw } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'আইডি পাওয়া যায়নি!' }, { status: 400 });
    }

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (minDeposit !== undefined) updateData.minDeposit = Number(minDeposit);
    if (minWithdraw !== undefined) updateData.minWithdraw = Number(minWithdraw);

    const updated = await PaymentSetting.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    
    if (!updated) {
      return NextResponse.json({ success: false, message: 'পেমেন্ট সেটিংস পাওয়া যায়নি!' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'সফলভাবে আপডেট করা হয়েছে!', updated }, { status: 200 });
  } catch (error) {
    console.error('Settings PATCH Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
  }
}

// ডিলিট করার জন্য DELETE (শুধুমাত্র অ্যাডমিন)
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
      return NextResponse.json({ success: false, message: 'আইডি পাওয়া যায়নি!' }, { status: 400 });
    }

    const deleted = await PaymentSetting.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'পেমেন্ট সেটিংস পাওয়া যায়নি!' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'সফলভাবে ডিলিট করা হয়েছে!' }, { status: 200 });
  } catch (error) {
    console.error('Settings DELETE Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার এরর!' }, { status: 500 });
  }
}