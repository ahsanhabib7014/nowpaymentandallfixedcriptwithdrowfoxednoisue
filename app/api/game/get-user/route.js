// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import { verifyAuth } from '@/utils/authCheck';

// export async function GET(req) {
//   try {
//     await dbConnect();

//     // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন
//     const auth = await verifyAuth('user');
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message }, 
//         { 
//           status: auth.status,
//           headers: {
//             'X-Content-Type-Options': 'nosniff',
//             'X-Frame-Options': 'DENY'
//           }
//         }
//       );
//     }

//     const user = auth.user;

//     // ২. ✅ এখন referralBalance এবং referralCode সহ সব প্রয়োজনীয় ফিল্ড রিটার্ন করা
//     return NextResponse.json({
//       success: true,
//       uid: user.uid || user.phone,
//       phone: user.phone,
//       balance: user.balance,
//       turnover: user.turnover,
//       referralBalance: user.referralBalance || 0,
//       referralCode: user.referralCode || user.uid
//     }, { 
//       status: 200,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'Cache-Control': 'no-store, no-cache, must-revalidate'
//       }
//     });

//   } catch (error) {
//     console.error('Get User Error:', error);
//     return NextResponse.json({ 
//       success: false, 
//       message: 'সার্ভার এরর।' 
//     }, { status: 500 });
//   }
// }

// ................................................

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import { verifyAuth } from '@/utils/authCheck';

export async function GET(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন
    const auth = await verifyAuth('user');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message }, 
        { 
          status: auth.status,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
          }
        }
      );
    }

    const user = auth.user;

    // ২. ✅ সব field Number-এ convert করে return
    return NextResponse.json({
      success: true,
      uid: user.uid || user.phone,
      phone: user.phone,
      balance: Number(user.balance) || 0,
      turnover: Number(user.turnover) || 0,
      referralBalance: Number(user.referralBalance) || 0,
      referralCode: user.referralCode || user.uid
    }, { 
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Get User Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভার এরর।' 
    }, { status: 500 });
  }
}