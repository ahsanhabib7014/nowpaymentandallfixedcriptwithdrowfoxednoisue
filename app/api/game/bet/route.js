// import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import dbConnect from '@/utils/db';
// import User from '@/models/User';
// import Bet from '@/models/Bet';        // ✅ সঠিক — default import
// import jwt from 'jsonwebtoken';

// export async function POST(req) {
//   let session = null;
//   let useTransaction = false;

//   try {
//     // ১. ডাটাবেজ কানেক্ট করা
//     await dbConnect();

//     // ২. ট্রানজেকশন সেশন শুরু (ব্যর্থ হলেও কাজ করবে)
//     try {
//       session = await mongoose.startSession();
//       session.startTransaction();
//       useTransaction = true;
//     } catch (e) {
//       useTransaction = false;
//       if (session) {
//         try { session.endSession(); } catch (_) {}
//         session = null;
//       }
//     }

//     // ৩. কুকি থেকে 'token' রিড করা
//     const token = req.cookies.get('token')?.value;

//     if (!token) {
//       if (useTransaction && session) {
//         await session.abortTransaction();
//         session.endSession();
//       }
//       return NextResponse.json({ 
//         success: false, 
//         message: 'লগইন করা নেই বা টোকেন পাওয়া যায়নি।' 
//       }, { status: 401 });
//     }

//     // ৪. JWT টোকেন ভেরিফাই করা
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       if (useTransaction && session) {
//         await session.abortTransaction();
//         session.endSession();
//       }
//       return NextResponse.json({ 
//         success: false, 
//         message: 'টোকেন মেয়াদোত্তীর্ণ বা অবৈধ!' 
//       }, { status: 401 });
//     }

//     const identifier = decoded.uid || decoded.phone || decoded.userId;

//     if (!identifier) {
//       if (useTransaction && session) {
//         await session.abortTransaction();
//         session.endSession();
//       }
//       return NextResponse.json({ 
//         success: false, 
//         message: 'টোকেনে কোনো বৈধ ইউজার আইডি পাওয়া যায়নি।' 
//       }, { status: 401 });
//     }

//     // ৫. রিকোয়েস্ট বডি পার্স
//     let body;
//     try {
//       body = await req.json();
//     } catch (e) {
//       if (useTransaction && session) {
//         await session.abortTransaction();
//         session.endSession();
//       }
//       return NextResponse.json({ 
//         success: false, 
//         message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' 
//       }, { status: 400 });
//     }

//     let { choice, amount, periodNumber } = body || {};

//     amount = Number(amount);
//     const normalizedChoice = typeof choice === 'string' ? choice.trim() : '';
    
//     // ✅ periodNumber আসে "PER-12345" ফরম্যাটে। Number() করলে NaN হয়।
//     const parsedPeriodNo = Number(String(periodNumber || '').replace('PER-', '').trim());

//     // ৬. কঠোর ইনপুট ভ্যালিডেশন
//     if (
//       !['Big', 'Small', 'BIG', 'SMALL', 'big', 'small'].includes(normalizedChoice) || 
//       isNaN(amount) || 
//       amount <= 0 || 
//       !periodNumber || 
//       isNaN(parsedPeriodNo)
//     ) {
//       if (useTransaction && session) {
//         await session.abortTransaction();
//         session.endSession();
//       }
//       return NextResponse.json({ 
//         success: false, 
//         message: 'ভুল বা অসম্পূর্ণ ডেটা ইনপুট দেওয়া হয়েছে!' 
//       }, { status: 400 });
//     }

//     // ৭. ডাটাবেজ থেকে ইউজার খোঁজা
//     const userQuery = User.findOne({ 
//       $or: [
//         { uid: identifier },
//         { phone: identifier },
//         { _id: mongoose.isValidObjectId(identifier) ? identifier : null }
//       ]
//     });
//     const user = useTransaction ? await userQuery.session(session) : await userQuery;

//     if (!user || user.isBlocked) {
//       if (useTransaction && session) {
//         await session.abortTransaction();
//         session.endSession();
//       }
//       return NextResponse.json({ 
//         success: false, 
//         message: 'ইউজার খুঁজে পাওয়া যায়নি বা অ্যাকাউন্ট ব্লকড।' 
//       }, { status: 404 });
//     }

//     // ৮. ডাবল বেট চেক
//     const existingBetQuery = Bet.findOne({ 
//       userId: user._id, 
//       $or: [
//         { roundNo: parsedPeriodNo },
//         { periodNumber: String(periodNumber) }
//       ]
//     });
//     const existingBet = useTransaction ? await existingBetQuery.session(session) : await existingBetQuery;

//     if (existingBet) {
//       if (useTransaction && session) {
//         await session.abortTransaction();
//         session.endSession();
//       }
//       return NextResponse.json({ 
//         success: false, 
//         message: 'এই রাউন্ডে ইতিমধ্যে বেট করা হয়েছে!' 
//       }, { status: 400 });
//     }

//     // ৯. ব্যালেন্স চেক
//     if (user.balance < amount) {
//       if (useTransaction && session) {
//         await session.abortTransaction();
//         session.endSession();
//       }
//       return NextResponse.json({ 
//         success: false, 
//         message: `পর্যাপ্ত ব্যালেন্স নেই। বর্তমান ব্যালেন্স: ${user.balance}` 
//       }, { status: 400 });
//     }

//     // ১০. ব্যালেন্স কাটা এবং টার্নওভার আপডেট
//     user.balance -= amount;
//     const currentTurnover = Number(user.turnover || 0);
//     user.turnover = Math.max(0, currentTurnover - amount);

//     if (useTransaction) {
//       await user.save({ session });
//     } else {
//       await user.save();
//     }

//     // ১১. বেট রেকর্ড তৈরি
//     const betData = {
//       userId: user._id,
//       uid: user.uid || user._id.toString(),
//       roundNo: parsedPeriodNo,
//       periodNumber: String(periodNumber),
//       choice: normalizedChoice,
//       amount: amount,
//       outcome: 'PENDING',
//       status: 'PENDING',
//       result: 'pending'
//     };

//     if (useTransaction) {
//       await Bet.create([betData], { session });
//     } else {
//       await Bet.create(betData);
//     }

//     // ১২. ট্রানজেকশন কমিট
//     if (useTransaction && session) {
//       await session.commitTransaction();
//       session.endSession();
//     }

//     // ✅ FIX: newTurnover রিটার্ন করা হচ্ছে যাতে frontend localStorage আপডেট করতে পারে
//     return NextResponse.json({
//       success: true,
//       message: `সফলভাবে ${amount} টাকার বেড প্লেস করা হয়েছে! বর্তমান ব্যালেন্স: ${user.balance} টাকা।`,
//       newBalance: Number(user.balance),
//       newTurnover: Number(user.turnover)
//     }, { 
//       status: 200,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'Cache-Control': 'no-store, no-cache, must-revalidate'
//       }
//     });

//   } catch (error) {
//     // ✅ session leak প্রতিরোধ
//     if (useTransaction && session) {
//       try {
//         if (session.inTransaction()) {
//           await session.abortTransaction();
//         }
//       } catch (e) {}
//       try { session.endSession(); } catch (e) {}
//     } else if (session) {
//       try { session.endSession(); } catch (e) {}
//     }

//     console.error('BET API ERROR:', error);

//     // MongoDB ডুপ্লিকেট কী এরর
//     if (error.code === 11000) {
//       return NextResponse.json({ 
//         success: false, 
//         message: 'এই রাউন্ডে ইতিমধ্যে বেট করা হয়েছে!' 
//       }, { status: 400 });
//     }

//     return NextResponse.json({ 
//       success: false, 
//       message: 'সার্ভার এরর ঘটেছে: ' + error.message 
//     }, { status: 500 });
//   }
// }

// ...............................................................


import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Bet from '@/models/Bet';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    // ১. ডাটাবেজ কানেক্ট করা
    await dbConnect();

    // ২. কুকি থেকে 'token' রিড করা
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'লগইন করা নেই বা টোকেন পাওয়া যায়নি।' 
      }, { status: 401 });
    }

    // ৩. JWT টোকেন ভেরিফাই করা
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ 
        success: false, 
        message: 'টোকেন মেয়াদোত্তীর্ণ বা অবৈধ!' 
      }, { status: 401 });
    }

    const identifier = decoded.uid || decoded.phone || decoded.userId;

    if (!identifier) {
      return NextResponse.json({ 
        success: false, 
        message: 'টোকেনে কোনো বৈধ ইউজার আইডি পাওয়া যায়নি।' 
      }, { status: 401 });
    }

    // ৪. রিকোয়েস্ট বডি পার্স
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ 
        success: false, 
        message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' 
      }, { status: 400 });
    }

    let { choice, amount, periodNumber } = body || {};

    amount = Number(amount);
    const normalizedChoice = typeof choice === 'string' ? choice.trim() : '';
    
    // ✅ periodNumber আসে "PER-12345" ফরম্যাটে
    const parsedPeriodNo = Number(String(periodNumber || '').replace('PER-', '').trim());

    // ৫. কঠোর ইনপুট ভ্যালিডেশন
    if (
      !['Big', 'Small', 'BIG', 'SMALL', 'big', 'small'].includes(normalizedChoice) || 
      isNaN(amount) || 
      amount <= 0 || 
      !periodNumber || 
      isNaN(parsedPeriodNo)
    ) {
      return NextResponse.json({ 
        success: false, 
        message: 'ভুল বা অসম্পূর্ণ ডেটা ইনপুট দেওয়া হয়েছে!' 
      }, { status: 400 });
    }

    // ==========================================
    // ✅✅✅ ATOMIC balance deduct + block check
    // ==========================================
    // ✅ findOneAndUpdate + $inc = atomic
    // - isBlocked: false → ব্লকড user পারবে না
    // - balance: { $gte: amount } → balance যথেষ্ট হলে তবেই deduct
    const user = await User.findOneAndUpdate(
      { 
        $or: [
          { uid: identifier },
          { phone: identifier },
          { _id: mongoose.isValidObjectId(identifier) ? identifier : null }
        ],
        isBlocked: false,
        balance: { $gte: amount }
      },
      { 
        $inc: { 
          balance: -amount,
          turnover: -amount
        } 
      },
      { new: true }
    );

    if (!user) {
      // হয় user নেই, blocked, অথবা balance কম — কারণ খুঁজে বের করি
      const checkUser = await User.findOne({ 
        $or: [
          { uid: identifier },
          { phone: identifier }
        ]
      });
      
      if (!checkUser) {
        return NextResponse.json({ 
          success: false, 
          message: 'ইউজার খুঁজে পাওয়া যায়নি।' 
        }, { status: 404 });
      }
      if (checkUser.isBlocked) {
        return NextResponse.json({ 
          success: false, 
          message: 'আপনার অ্যাকাউন্ট ব্লকড।' 
        }, { status: 403 });
      }
      return NextResponse.json({ 
        success: false, 
        message: `পর্যাপ্ত ব্যালেন্স নেই। বর্তমান ব্যালেন্স: ${checkUser.balance}` 
      }, { status: 400 });
    }

    // ✅ Turnover 0-এর নিচে গেলে clamp
    if (user.turnover < 0) {
      user.turnover = 0;
      await User.updateOne({ _id: user._id }, { $set: { turnover: 0 } });
    }
    // ==========================================

    // ৬. ডাবল বেট চেক
    const existingBet = await Bet.findOne({ 
      userId: user._id, 
      $or: [
        { roundNo: parsedPeriodNo },
        { periodNumber: String(periodNumber) }
      ]
    });

    if (existingBet) {
      // ⚠️ Already bet — balance refund
      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: amount, turnover: amount } }
      );
      
      return NextResponse.json({ 
        success: false, 
        message: 'এই রাউন্ডে ইতিমধ্যে বেট করা হয়েছে!' 
      }, { status: 400 });
    }

    // ৭. বেট রেকর্ড তৈরি — fail হলে refund
    try {
      await Bet.create({
        userId: user._id,
        uid: user.uid || user._id.toString(),
        roundNo: parsedPeriodNo,
        periodNumber: String(periodNumber),
        choice: normalizedChoice,
        amount: amount,
        outcome: 'PENDING',
        status: 'PENDING',
        result: 'pending'
      });
    } catch (error) {
      // ⚠️ Bet fail হলে balance refund
      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: amount, turnover: amount } }
      );

      if (error.code === 11000) {
        return NextResponse.json({ 
          success: false, 
          message: 'এই রাউন্ডে ইতিমধ্যে বেট করা হয়েছে!' 
        }, { status: 400 });
      }
      throw error;
    }

    // ✅ Response format আগের মতোই (frontend ভাঙবে না)
    return NextResponse.json({
      success: true,
      message: `সফলভাবে ${amount} টাকার বেড প্লেস করা হয়েছে! বর্তমান ব্যালেন্স: ${user.balance} টাকা।`,
      newBalance: Number(user.balance),
      newTurnover: Number(user.turnover)
    }, { 
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('BET API ERROR:', error);

    // MongoDB ডুপ্লিকেট কী এরর
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: 'এই রাউন্ডে ইতিমধ্যে বেট করা হয়েছে!' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভার এরর ঘটেছে: ' + error.message 
    }, { status: 500 });
  }
}