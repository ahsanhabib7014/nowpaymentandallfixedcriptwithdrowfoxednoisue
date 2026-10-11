'use client';
import { useState, useEffect } from 'react';

export default function LiveBetTrackingCard() {
  const [liveBetStats, setLiveBetStats] = useState({
    periodNumber: 'লোডিং...',
    bigTotal: 0,
    smallTotal: 0
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const fetchLiveStats = async (isInitial = false) => {
    try {
      if (!isInitial) setIsUpdating(true);

      const res = await fetch(`/api/admin/live-bets?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',   // ✅ FIX: HttpOnly cookie পাঠাবে
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      const data = await res.json();
      if (data.success && data.stats) {
        setLiveBetStats(data.stats);
      }
    } catch (err) {
      console.error('Live bets fetch error:', err);
    } finally {
      if (!isInitial) setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchLiveStats(true);

    const interval = setInterval(() => {
      fetchLiveStats(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4 relative overflow-hidden">
      
      {isUpdating && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 animate-pulse" />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h2 className="text-sm font-bold text-slate-200">
            লাইভ গেম বেট ট্র্যাকিং (Big / Small)
          </h2>
        </div>
        
        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-mono font-bold flex items-center gap-2">
          <span className="text-slate-400">কারেন্ট পিরিয়ড:</span> 
          <span className="text-white text-sm transition-all duration-300">{liveBetStats.periodNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex justify-between items-center group hover:border-emerald-500/40 transition-all">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">মোট বিগ (BIG) বেট</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono transition-all duration-300">
              ৳{liveBetStats.bigTotal}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 font-bold text-xs">BIG</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex justify-between items-center group hover:border-rose-500/40 transition-all">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">মোট স্মল (SMALL) বেট</span>
            <h3 className="text-2xl font-black text-rose-400 mt-1 font-mono transition-all duration-300">
              ৳{liveBetStats.smallTotal}
            </h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 font-bold text-xs">SMALL</div>
        </div>
      </div>
    </div>
  );
}