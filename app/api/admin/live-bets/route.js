import Period from '@/models/Period';
import Bet from '@/models/Bet';
import User from '@/models/User';
import dbConnect from '@/utils/db';
import { verifyAuth } from '@/utils/authCheck';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
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

    let periodNum = null;

    // ২. প্রথমে সরাসরি Period কালেকশন থেকে active বা রানিং পিরিয়ড খোঁজা
    let currentPeriod = await Period.findOne({ status: 'active' }).sort({ createdAt: -1 });
    
    if (!currentPeriod) {
      currentPeriod = await Period.findOne().sort({ createdAt: -1 });
    }

    if (currentPeriod) {
      periodNum = currentPeriod.periodNumber || currentPeriod.period || currentPeriod.roundNo;
    }

    // ৩. যদি Period কালেকশনে কোনো ডেটা না থাকে, তবে শেষ বিকল্প হিসেবে Bet কালেকশন থেকে নেওয়া
    if (!periodNum) {
      const latestBet = await Bet.findOne().sort({ createdAt: -1 });
      if (latestBet) {
        periodNum = latestBet.roundNo || latestBet.periodNumber || latestBet.period;
      }
    }

    if (!periodNum) {
      return NextResponse.json({ 
        success: true, 
        stats: { periodNumber: 'নেই', bigTotal: 0, smallTotal: 0 } 
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // ৪. বর্তমান পিরিয়ডের আন্ডারে যত বেট পড়েছে সেগুলো কুয়েরি করা
    const orConditions = [
      { periodNumber: String(periodNum) },
      { period: String(periodNum) }
    ];

    const numericPeriod = Number(periodNum);
    if (!isNaN(numericPeriod)) {
      orConditions.push({ roundNo: numericPeriod });
    }

    const bets = await Bet.find({ $or: orConditions });

    let bigTotal = 0;
    let smallTotal = 0;

    // ৫. বিগ এবং স্মল অ্যামাউন্ট যোগ করা
    bets.forEach(bet => {
      const choiceUpper = (bet.choice || '').toUpperCase();
      if (choiceUpper === 'BIG') {
        bigTotal += Number(bet.amount) || 0;
      } else if (choiceUpper === 'SMALL') {
        smallTotal += Number(bet.amount) || 0;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        periodNumber: String(periodNum),
        bigTotal,
        smallTotal
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Live bets fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'সার্ভার এরর!' 
    }, { status: 500 });
  }
}