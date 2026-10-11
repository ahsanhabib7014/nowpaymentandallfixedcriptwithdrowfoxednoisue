import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import GameHistory from '@/models/GameHistory';

export async function GET() {
  try {
    // ১. ডেটাবেজ কানেকশন নিশ্চিত করা[cite: 7]
    await dbConnect();
    
    // ২. সর্বশেষ ১০টি গেম হিস্ট্রি সংগ্রহ করা (নতুনগুলো প্রথমে থাকবে)[cite: 7]
    const history = await GameHistory.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    // ৩. সফল রেসপন্স ও সিকিউরিটি হেডার্স রিটার্ন করা[cite: 7]
    return NextResponse.json({
      success: true,
      history: history.map(h => ({
        periodNumber: h.periodNumber,
        winningNumber: h.winningNumber,
        winningChoice: h.winningChoice,
        status: h.status
      }))
    }, { 
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'সার্ভার এরর হয়েছে।',
      history: [] 
    }, { 
      status: 500,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  }
}