// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import GameHistory from '@/models/GameHistory';
// import User from '@/models/User';

// export async function GET() {
//   try {
//     // ১. ডেটাবেজ কানেকশন নিশ্চিত করা[cite: 10]
//     await dbConnect();

//     // বর্তমান সময় এবং ৩০ সেকেন্ডের কাউন্টডাউন হিসাব করা[cite: 10]
//     const now = new Date();
//     const totalSeconds = Math.floor(now.getTime() / 1000);
//     const timeLeft = 30 - (totalSeconds % 30); // ৩০ সেকেন্ডের লুপ[cite: 10]
    
//     // ইউনিক পিরিয়ড নম্বর জেনারেট করার লজিক[cite: 10]
//     const periodNumber = Math.floor(totalSeconds / 30).toString();

//     // টাইমার যখন শেষ মুহূর্তে (১ সেকেন্ডে) পৌঁছাবে, তখন ড্র সম্পন্ন করে পেন্ডিং বেটগুলোর ফলাফল প্রসেস করবে[cite: 10]
//     if (timeLeft === 1 || timeLeft === 30) {
//       await processPendingBets(periodNumber);
//     }

//     return NextResponse.json({
//       success: true,
//       periodNumber,
//       timeLeft
//     }, {
//       status: 200,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'Cache-Control': 'no-store, no-cache, must-revalidate'
//       }
//     });

//   } catch (error) {
//     console.error('Timer API Error:', error);
//     return NextResponse.json({ 
//       success: false, 
//       message: 'টাইমার ফেচ করতে সমস্যা হয়েছে!' 
//     }, { status: 500 });
//   }
// }

// // টাইমার শেষ হলে ড্র জেনারেট করে রেজাল্ট প্রসেস এবং ইউজারের ব্যালেন্স আপডেট করার ফাংশন[cite: 10]
// async function processPendingBets(currentPeriod) {
//   try {
//     // এই পিরিয়ডের যেসব বেট এখনও 'pending' অবস্থায় আছে তাদের খুঁজে বের করা[cite: 10]
//     const pendingBets = await GameHistory.find({ periodNumber: currentPeriod, status: 'pending' });
    
//     if (pendingBets.length > 0) {
//       // রেন্ডম ড্র ফলাফল জেনারেট করা (০ থেকে ৯)[cite: 10]
//       const winningNumber = Math.floor(Math.random() * 10);
//       const winningChoice = winningNumber >= 5 ? 'big' : 'small';

//       for (const bet of pendingBets) {
//         const isWin = bet.userChoice === winningChoice;
//         let winnings = 0;

//         if (isWin) {
//           winnings = bet.amount * 2; // উইন হলে বেট অ্যামাউন্টের দ্বিগুণ টাকা রিটার্ন[cite: 10]
//           const user = await User.findOne({ uid: bet.uid });
//           if (user) {
//             user.balance += winnings;
//             await user.save();
//           }
//         }

//         // বেটের ডাটাবেজ রেকর্ড আপডেট করা (ফলাফল ও স্ট্যাটাস বসানো)[cite: 10]
//         bet.winningNumber = winningNumber;
//         bet.winningChoice = winningChoice;
//         bet.status = isWin ? 'win' : 'loss';
//         await bet.save();
//       }
//     }
//   } catch (err) {
//     console.error('Process Pending Bets Error:', err);
//   }
// }

// ...............................................

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import GameHistory from '@/models/GameHistory';
import User from '@/models/User';

export async function GET() {
  try {
    // ১. ডেটাবেজ কানেকশন নিশ্চিত করা
    await dbConnect();

    // বর্তমান সময় এবং ৩০ সেকেন্ডের কাউন্টডাউন হিসাব করা
    const now = new Date();
    const totalSeconds = Math.floor(now.getTime() / 1000);
    const timeLeft = 30 - (totalSeconds % 30); // ৩০ সেকেন্ডের লুপ
    
    // ইউনিক পিরিয়ড নম্বর জেনারেট করার লজিক
    const periodNumber = Math.floor(totalSeconds / 30).toString();

    // টাইমার যখন শেষ মুহূর্তে (১ সেকেন্ডে) পৌঁছাবে, তখন ড্র সম্পন্ন করে পেন্ডিং বেটগুলোর ফলাফল প্রসেস করবে
    if (timeLeft === 1 || timeLeft === 30) {
      await processPendingBets(periodNumber);
    }

    return NextResponse.json({
      success: true,
      periodNumber,
      timeLeft
    }, {
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Timer API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'টাইমার ফেচ করতে সমস্যা হয়েছে!' 
    }, { status: 500 });
  }
}

// টাইমার শেষ হলে ড্র জেনারেট করে রেজাল্ট প্রসেস এবং ইউজারের ব্যালেন্স আপডেট করার ফাংশন
async function processPendingBets(currentPeriod) {
  try {
    // এই পিরিয়ডের যেসব বেট এখনও 'pending' অবস্থায় আছে তাদের খুঁজে বের করা
    const pendingBets = await GameHistory.find({ periodNumber: currentPeriod, status: 'pending' });
    
    if (pendingBets.length > 0) {
      // রেন্ডম ড্র ফলাফল জেনারেট করা (০ থেকে ৯)
      const winningNumber = Math.floor(Math.random() * 10);
      const winningChoice = winningNumber >= 5 ? 'big' : 'small';

      for (const bet of pendingBets) {
        const isWin = bet.userChoice === winningChoice;

        // ✅ FIX #1: explicit Number conversion
        const betAmountNum = Number(bet.amount) || 0;
        let winnings = 0;

        if (isWin) {
          winnings = betAmountNum * 2; // উইন হলে বেট অ্যামাউন্টের দ্বিগুণ টাকা রিটার্ন

          // ✅ FIX #2: ATOMIC balance update — $inc use (race condition proof)
          await User.findOneAndUpdate(
            { uid: bet.uid },
            { $inc: { balance: winnings } }
          );
        }

        // বেটের ডাটাবেজ রেকর্ড আপডেট করা (ফলাফল ও স্ট্যাটাস বসানো)
        bet.winningNumber = winningNumber;
        bet.winningChoice = winningChoice;
        bet.status = isWin ? 'win' : 'loss';
        await bet.save();
      }
    }
  } catch (err) {
    console.error('Process Pending Bets Error:', err);
  }
}