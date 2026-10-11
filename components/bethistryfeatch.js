// 'use client';
// import { useState, useEffect } from 'react';

// export default function BetHistorySection({ uid, onClose }) {
//   const [betHistory, setBetHistory] = useState([]);
//   const [loadingBet, setLoadingBet] = useState(true);

//   useEffect(() => {
//     if (!uid) return;
//     // কুকি সিকিউরিটি নিশ্চিত করতে credentials: 'include' যুক্ত করা হয়েছে
//     fetch(`/api/user/history?uid=${uid}`, {
//       credentials: 'include'
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data.success) {
//           setBetHistory(data.bets || []);
//         } else {
//           setBetHistory([]);
//         }
//       })
//       .catch(err => {
//         console.error('Bet history fetch error:', err);
//         setBetHistory([]);
//       })
//       .finally(() => setLoadingBet(false));
//   }, [uid]);

//   return (
//     <div className="mt-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 animate-fadeIn shadow-xl">
//       <div className="flex justify-between items-center border-b border-slate-800 pb-2">
//         <span className="text-xs font-bold text-amber-400 uppercase">বেট/গেম রেকর্ডসমূহ</span>
//         <button 
//           onClick={onClose}
//           className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded-lg"
//         >
//           বন্ধ করুন ✕
//         </button>
//       </div>

//       <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
//         {loadingBet ? (
//           <p className="text-center py-6 text-xs text-slate-400 animate-pulse">লোড হচ্ছে...</p>
//         ) : betHistory.length === 0 ? (
//           <p className="text-center py-6 text-xs text-slate-500">কোনো বেট রেকর্ড পাওয়া যায়নি।</p>
//         ) : (
//           <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
//             {betHistory.map((item, index) => {
//               const betResult = (item.result || item.status || '').toLowerCase();
//               const isWin = betResult === 'win' || betResult === 'won';
//               const isLoss = betResult === 'loss' || betResult === 'lost';

//               return (
//                 <div key={index} className="p-3 space-y-2 hover:bg-slate-900/40 transition">
//                   <div className="flex justify-between items-center text-xs">
//                     <span className="text-slate-300 font-mono text-[11px]">
//                       পিরিয়ড: {item.periodNumber || item.roundNo || 'N/A'}
//                     </span>
//                     <span className="font-bold font-mono text-amber-400 text-right">
//                       ৳{item.amount}
//                       <span className="block text-[9px] text-slate-400 font-normal">চয়েস: ({item.choice})</span>
//                     </span>
//                     <span>
//                       <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
//                         isWin 
//                           ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
//                           : isLoss 
//                           ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
//                           : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
//                       }`}>
//                         {isWin ? 'WIN' : isLoss ? 'LOSS' : 'Pending'}
//                       </span>
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// ////////////////////////////////////////////////////////


'use client';
import { useState, useEffect } from 'react';

export default function BetHistorySection({ uid, onClose }) {
  const [betHistory, setBetHistory] = useState([]);
  const [loadingBet, setLoadingBet] = useState(true);
  
  // 🆕 Show More state
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 10;

  useEffect(() => {
    if (!uid) return;
    fetch(`/api/user/history?uid=${uid}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBetHistory(data.bets || []);
        } else {
          setBetHistory([]);
        }
      })
      .catch(err => {
        console.error('Bet history fetch error:', err);
        setBetHistory([]);
      })
      .finally(() => setLoadingBet(false));
  }, [uid]);

  // 🆕 Visible items based on showAll
  const visibleItems = showAll 
    ? betHistory 
    : betHistory.slice(0, INITIAL_COUNT);

  const hasMore = betHistory.length > INITIAL_COUNT;
  const remainingCount = betHistory.length - INITIAL_COUNT;

  // 🆕 Win/Loss count
  const winCount = betHistory.filter(b => {
    const r = (b.result || b.status || '').toLowerCase();
    return r === 'win' || r === 'won';
  }).length;

  const lossCount = betHistory.filter(b => {
    const r = (b.result || b.status || '').toLowerCase();
    return r === 'loss' || r === 'lost';
  }).length;

  return (
    <div className="mt-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 animate-fadeIn shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-amber-400 uppercase">
          বেট/গেম রেকর্ডসমূহ
          {betHistory.length > 0 && (
            <span className="text-slate-500 ml-1.5 font-normal">
              ({betHistory.length})
            </span>
          )}
        </span>
        <button 
          onClick={onClose}
          className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded-lg"
        >
          বন্ধ করুন ✕
        </button>
      </div>

      {/* 🆕 Win/Loss Stats */}
      {betHistory.length > 0 && (
        <div className="flex gap-2 text-[10px]">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg font-bold">
            ✅ জয়: {winCount}
          </span>
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg font-bold">
            ❌ হার: {lossCount}
          </span>
          <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-1 rounded-lg font-bold">
            📊 মোট: {betHistory.length}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        {loadingBet ? (
          <p className="text-center py-6 text-xs text-slate-400 animate-pulse">লোড হচ্ছে...</p>
        ) : betHistory.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-500">কোনো বেট রেকর্ড পাওয়া যায়নি।</p>
        ) : (
          <>
            <div className="divide-y divide-slate-800/60">
              {visibleItems.map((item, index) => {
                const betResult = (item.result || item.status || '').toLowerCase();
                const isWin = betResult === 'win' || betResult === 'won';
                const isLoss = betResult === 'loss' || betResult === 'lost';

                return (
                  <div key={index} className="p-3 space-y-2 hover:bg-slate-900/40 transition">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-mono text-[11px]">
                        পিরিয়ড: {item.periodNumber || item.roundNo || 'N/A'}
                      </span>
                      <span className="font-bold font-mono text-amber-400 text-right">
                        ৳{item.amount}
                        <span className="block text-[9px] text-slate-400 font-normal">
                          চয়েস: ({item.choice})
                        </span>
                      </span>
                      <span>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isWin 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : isLoss 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {isWin ? '✅ WIN' : isLoss ? '❌ LOSS' : '⏳ Pending'}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 🆕 Show More / Show Less Button */}
            {hasMore && (
              <div className="p-3 border-t border-slate-800 bg-slate-900/30">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg"
                >
                  {showAll 
                    ? '🔼 কম দেখান' 
                    : `🔽 আরও ${remainingCount}টি দেখুন`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}