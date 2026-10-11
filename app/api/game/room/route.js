import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const now = Math.floor(Date.now() / 1000);
    const cycleTime = 30; // ৩০ সেকেন্ডের রাউন্ড[cite: 9]
    const timeLeft = cycleTime - (now % cycleTime);
    
    // ১০০১ থেকে শুরু হয়ে সময় অনুযায়ী অটো-ইনক্রিমেন্ট পিরিয়ড আইডি[cite: 9]
    const baseTimestamp = 1717000000; // একটি বেস টাইম স্ট্যাম্প[cite: 9]
    const elapsedCycles = Math.floor((now - baseTimestamp) / cycleTime);
    const periodNumber = 1001 + Math.max(0, elapsedCycles);

    return NextResponse.json({
      timeLeft,
      periodNumber,
    }, { 
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json({ timeLeft: 30, periodNumber: 1001 }, { status: 200 });
  }
}