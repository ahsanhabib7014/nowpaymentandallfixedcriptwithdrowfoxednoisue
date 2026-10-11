// // // 'use client';
// // // import { useState, useEffect } from 'react';
// // // import Link from 'next/link';
// // // import { useRouter } from 'next/navigation';
// // // import BackButton from '@/components/BackButton';

// // // // আগের মতো হিস্ট্রি কম্পোনেন্টগুলো ইমপোর্ট করা হলো
// // // import DepositHistorySection from '@/components/deposithistoryfetch';
// // // import WithdrawHistorySection from '@/components/withdrowhistryfeatch';
// // // import BetHistorySection from '@/components/bethistryfeatch';

// // // export default function WalletPage() {
// // //   const [user, setUser] = useState({ balance: 0, turnover: 0 });
// // //   const [activeTab, setActiveTab] = useState(null); // 'deposit', 'withdraw', 'bet'
// // //   const router = useRouter();

// // //   useEffect(() => {
// // //     const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
// // //     if (!savedUser.uid) {
// // //       router.push('/login');
// // //       return;
// // //     }
// // //     setUser(savedUser);

// // //     // আগের সেই আসল ও কার্যকর API রাউট ব্যবহার করা হলো
// // //     fetch(`/api/admin/users?search=${savedUser.uid}`, {
// // //       credentials: 'include'
// // //     })
// // //       .then(res => res.json())
// // //       .then(data => {
// // //         if (data.success && data.users.length > 0) {
// // //           const currentUser = data.users.find(u => u.uid === savedUser.uid) || data.users[0];
// // //           setUser(currentUser);
// // //           localStorage.setItem('user', JSON.stringify(currentUser));
// // //         }
// // //       })
// // //       .catch(err => console.error(err));
// // //   }, [router]);

// // //   const handleLogout = async () => {
// // //     try {
// // //       await fetch('/api/auth/logout', { 
// // //         method: 'POST',
// // //         credentials: 'include'
// // //       });
// // //     } catch (err) {
// // //       console.error('Logout error:', err);
// // //     } finally {
// // //       localStorage.removeItem('user');
// // //       window.location.replace('/login'); 
// // //     }
// // //   };

// // //   const uidToFetch = user.phone || user.uid;

// // //   return (
// // //     <div className="max-w-md mx-auto mt-10 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white space-y-6 shadow-xl relative">
      
// // //       <div className="-mb-2">
// // //         <BackButton title="ফিরে যান" />
// // //       </div>

// // //       <div className="flex justify-between items-center border-b border-slate-800 pb-4">
// // //         <h2 className="text-xl font-bold text-emerald-400">আমার ওয়ালেট</h2>
// // //         <button
// // //           onClick={handleLogout}
// // //           className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
// // //         >
// // //           লগআউট
// // //         </button>
// // //       </div>

// // //       <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-center shadow-inner">
// // //         <p className="text-xs text-slate-400 uppercase tracking-wider">উপলব্ধ মূল ব্যালেন্স</p>
// // //         <h1 className="text-3xl font-extrabold text-amber-400 font-mono">৳{user.balance || 0}</h1>
        
// // //         <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs text-slate-400 px-2 font-mono">
// // //           <span>টার্নওভার: <strong className="text-emerald-400">৳{user.turnover || 0}</strong></span>
// // //           <span>আইডি: <strong className="text-white">{user.uid}</strong></span>
// // //         </div>
// // //       </div>

// // //       <div className="space-y-3 pt-2">
// // //         <p className="text-xs text-slate-400 text-center">আপনার লেনদেন বেছে নিন</p>
        
// // //         <div className="grid grid-cols-2 gap-4">
// // //           <Link 
// // //             href="/deposit" 
// // //             className="flex flex-col items-center justify-center bg-emerald-600 hover:bg-emerald-500 p-5 rounded-2xl transition shadow-lg shadow-emerald-950/50 space-y-2 group"
// // //           >
// // //             <span className="text-2xl group-hover:scale-110 transition">📥</span>
// // //             <span className="font-bold text-sm">ডিপোজিট করুন</span>
// // //           </Link>

// // //           <Link 
// // //             href="/withdraw" 
// // //             className="flex flex-col items-center justify-center bg-rose-600 hover:bg-rose-500 p-5 rounded-2xl transition shadow-lg shadow-rose-950/50 space-y-2 group"
// // //           >
// // //             <span className="text-2xl group-hover:scale-110 transition">📤</span>
// // //             <span className="font-bold text-sm">উইথড্র করুন</span>
// // //           </Link>
// // //         </div>

// // //         {/* ৩টি হিস্ট্রি বাটন */}
// // //         <div className="pt-3 space-y-3">
// // //           <div className="grid grid-cols-3 gap-1.5">
// // //             <button
// // //               onClick={() => setActiveTab(activeTab === 'deposit' ? null : 'deposit')}
// // //               className={`py-2.5 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
// // //                 activeTab === 'deposit' 
// // //                   ? 'bg-emerald-600 border-emerald-400 text-white shadow-md' 
// // //                   : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
// // //               }`}
// // //             >
// // //               <span>📥 ডিপোজিট</span>
// // //               <span className="text-[9px] opacity-75">{activeTab === 'deposit' ? '▲' : '▼'}</span>
// // //             </button>

// // //             <button
// // //               onClick={() => setActiveTab(activeTab === 'withdraw' ? null : 'withdraw')}
// // //               className={`py-2.5 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
// // //                 activeTab === 'withdraw' 
// // //                   ? 'bg-rose-600 border-rose-400 text-white shadow-md' 
// // //                   : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
// // //               }`}
// // //             >
// // //               <span>📤 উইথড্র</span>
// // //               <span className="text-[9px] opacity-75">{activeTab === 'withdraw' ? '▲' : '▼'}</span>
// // //             </button>

// // //             <button
// // //               onClick={() => setActiveTab(activeTab === 'bet' ? null : 'bet')}
// // //               className={`py-2.5 px-1 rounded-xl text-[11px] font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
// // //                 activeTab === 'bet' 
// // //                   ? 'bg-amber-600 border-amber-400 text-white shadow-md' 
// // //                   : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
// // //               }`}
// // //             >
// // //               <span>🎲 বেট হিস্ট্রি</span>
// // //               <span className="text-[9px] opacity-75">{activeTab === 'bet' ? '▲' : '▼'}</span>
// // //             </button>
// // //           </div>

// // //           {/* আলাদা ফাইল থেকে রেন্ডার হওয়া হিস্ট্রি সেকশনগুলো */}
// // //           {activeTab === 'deposit' && <DepositHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
// // //           {activeTab === 'withdraw' && <WithdrawHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
// // //           {activeTab === 'bet' && <BetHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}

// // //         </div>

// // //       </div>
// // //     </div>
// // //   );
// // // }

// // 'use client';
// // import { useState, useEffect } from 'react';
// // import Link from 'next/link';
// // import { useRouter } from 'next/navigation';

// // import DepositHistorySection from '@/components/deposithistoryfetch';
// // import WithdrawHistorySection from '@/components/withdrowhistryfeatch';
// // import BetHistorySection from '@/components/bethistryfeatch';

// // export default function WalletPage() {
// //   const [user, setUser] = useState({ balance: 0, turnover: 0 });
// //   const [activeTab, setActiveTab] = useState(null);
// //   const router = useRouter();

// //   useEffect(() => {
// //     const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
// //     if (!savedUser.uid) {
// //       router.push('/login');
// //       return;
// //     }
// //     setUser(savedUser);

// //     fetch(`/api/admin/users?search=${savedUser.uid}`, {
// //       credentials: 'include'
// //     })
// //       .then(res => res.json())
// //       .then(data => {
// //         if (data.success && data.users.length > 0) {
// //           const currentUser = data.users.find(u => u.uid === savedUser.uid) || data.users[0];
// //           setUser(currentUser);
// //           localStorage.setItem('user', JSON.stringify(currentUser));
// //         }
// //       })
// //       .catch(err => console.error(err));
// //   }, [router]);

// //   const uidToFetch = user.phone || user.uid;

// //   return (
// //     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      
// //       <div className="w-full max-w-md md:max-w-2xl space-y-3 md:space-y-4">
        
// //         {/* হেডার সেকশন (কমপ্যাক্ট) */}
// //         <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
// //           <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
// //             <i className="fa-solid fa-wallet"></i> আমার ওয়ালেট
// //           </h2>
// //           <button
// //             onClick={() => router.back()}
// //             className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0"
// //           >
// //             <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
// //           </button>
// //         </div>

// //         {/* ব্যালেন্স কার্ড */}
// //         <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
// //           <p className="text-[11px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold">উপলব্ধ মূল ব্যালেন্স</p>
// //           <h1 className="text-3xl md:text-4xl font-black text-amber-400 font-mono mt-1">৳{user.balance || 0}</h1>
// //           <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-center gap-6 text-xs md:text-sm text-slate-400 font-mono">
// //             <span>টার্নওভার: <strong className="text-emerald-400">৳{user.turnover || 0}</strong></span>
// //             <span>আইডি: <strong className="text-white">{user.uid}</strong></span>
// //           </div>
// //         </div>

// //         {/* কমপ্যাক্ট অ্যাকশন বাটন (ডিপোজিট এবং উইথড্র) */}
// //         <div className="grid grid-cols-2 gap-3 md:gap-4">
// //           <Link 
// //             href="/deposit" 
// //             className="flex flex-row items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-950/40 group"
// //           >
// //             <span className="text-xl group-hover:scale-110 transition">📥</span>
// //             <span className="font-bold text-sm">ডিপোজিট</span>
// //           </Link>

// //           <Link 
// //             href="/withdraw" 
// //             className="flex flex-row items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 py-3.5 px-4 rounded-xl transition shadow-lg shadow-rose-950/40 group"
// //           >
// //             <span className="text-xl group-hover:scale-110 transition">📤</span>
// //             <span className="font-bold text-sm">উইথড্র</span>
// //           </Link>
// //         </div>

// //         {/* হিস্ট্রি সেকশন */}
// //         <div className="space-y-3 pt-1">
// //           <p className="text-[11px] md:text-xs text-slate-400 text-center font-semibold uppercase tracking-wider">লেনদেনের ইতিহাস</p>
          
// //           {/* সেগমেন্টেড ট্যাব ডিজাইন */}
// //           <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-800 shadow-lg">
// //             <button
// //               onClick={() => setActiveTab(activeTab === 'deposit' ? null : 'deposit')}
// //               className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
// //                 activeTab === 'deposit' 
// //                   ? 'bg-emerald-600 text-white shadow-md' 
// //                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
// //               }`}
// //             >
// //               <span>📥</span> ডিপোজিট
// //             </button>

// //             <button
// //               onClick={() => setActiveTab(activeTab === 'withdraw' ? null : 'withdraw')}
// //               className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
// //                 activeTab === 'withdraw' 
// //                   ? 'bg-rose-600 text-white shadow-md' 
// //                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
// //               }`}
// //             >
// //               <span>📤</span> উইথড্র
// //             </button>

// //             <button
// //               onClick={() => setActiveTab(activeTab === 'bet' ? null : 'bet')}
// //               className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
// //                 activeTab === 'bet' 
// //                   ? 'bg-amber-600 text-white shadow-md' 
// //                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
// //               }`}
// //             >
// //               <span>🎲</span> বেট হিস্ট্রি
// //             </button>
// //           </div>

// //           {/* হিস্ট্রি সেকশনগুলো */}
// //           <div className="pt-1">
// //             {activeTab === 'deposit' && <DepositHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
// //             {activeTab === 'withdraw' && <WithdrawHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
// //             {activeTab === 'bet' && <BetHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
// //           </div>

// //         </div>

// //       </div>
// //     </div>
// //   );
// // }

// // ...................................................................

// 'use client';
// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';

// import DepositHistorySection from '@/components/deposithistoryfetch';
// import WithdrawHistorySection from '@/components/withdrowhistryfeatch';
// import BetHistorySection from '@/components/bethistryfeatch';

// export default function WalletPage() {
//   const [user, setUser] = useState({ balance: 0, turnover: 0 });
//   const [activeTab, setActiveTab] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
//     if (!savedUser.uid) {
//       router.push('/login');
//       return;
//     }
//     setUser(savedUser);

//     // ✅ FIX: /api/user/me ব্যবহার করা হচ্ছে (admin API-র বদলে)
//     fetch('/api/user/me', {
//       credentials: 'include'
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data.success && data.user) {
//           const currentUser = data.user;
//           setUser(currentUser);
//           localStorage.setItem('user', JSON.stringify(currentUser));
//         }
//       })
//       .catch(err => console.error(err));
//   }, [router]);

//   const uidToFetch = user.phone || user.uid;

//   return (
//     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      
//       <div className="w-full max-w-md md:max-w-2xl space-y-3 md:space-y-4">
        
//         {/* হেডার সেকশন (কমপ্যাক্ট) */}
//         <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
//           <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
//             <i className="fa-solid fa-wallet"></i> আমার ওয়ালেট
//           </h2>
//           <button
//             onClick={() => router.back()}
//             className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0"
//           >
//             <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
//           </button>
//         </div>

//         {/* ব্যালেন্স কার্ড */}
//         <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
//           <p className="text-[11px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold">উপলব্ধ মূল ব্যালেন্স</p>
//           <h1 className="text-3xl md:text-4xl font-black text-amber-400 font-mono mt-1">৳{user.balance || 0}</h1>
//           <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-center gap-6 text-xs md:text-sm text-slate-400 font-mono">
//             <span>টার্নওভার: <strong className="text-emerald-400">৳{user.turnover || 0}</strong></span>
//             <span>আইডি: <strong className="text-white">{user.uid}</strong></span>
//           </div>
//         </div>

//         {/* কমপ্যাক্ট অ্যাকশন বাটন (ডিপোজিট এবং উইথড্র) */}
//         <div className="grid grid-cols-2 gap-3 md:gap-4">
//           <Link 
//             href="/deposit" 
//             className="flex flex-row items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-950/40 group"
//           >
//             <span className="text-xl group-hover:scale-110 transition">📥</span>
//             <span className="font-bold text-sm">ডিপোজিট</span>
//           </Link>

//           <Link 
//             href="/withdraw" 
//             className="flex flex-row items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 py-3.5 px-4 rounded-xl transition shadow-lg shadow-rose-950/40 group"
//           >
//             <span className="text-xl group-hover:scale-110 transition">📤</span>
//             <span className="font-bold text-sm">উইথড্র</span>
//           </Link>
//         </div>

//         {/* হিস্ট্রি সেকশন */}
//         <div className="space-y-3 pt-1">
//           <p className="text-[11px] md:text-xs text-slate-400 text-center font-semibold uppercase tracking-wider">লেনদেনের ইতিহাস</p>
          
//           {/* সেগমেন্টেড ট্যাব ডিজাইন */}
//           <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-800 shadow-lg">
//             <button
//               onClick={() => setActiveTab(activeTab === 'deposit' ? null : 'deposit')}
//               className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
//                 activeTab === 'deposit' 
//                   ? 'bg-emerald-600 text-white shadow-md' 
//                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
//               }`}
//             >
//               <span>📥</span> ডিপোজিট
//             </button>

//             <button
//               onClick={() => setActiveTab(activeTab === 'withdraw' ? null : 'withdraw')}
//               className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
//                 activeTab === 'withdraw' 
//                   ? 'bg-rose-600 text-white shadow-md' 
//                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
//               }`}
//             >
//               <span>📤</span> উইথড্র
//             </button>

//             <button
//               onClick={() => setActiveTab(activeTab === 'bet' ? null : 'bet')}
//               className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
//                 activeTab === 'bet' 
//                   ? 'bg-amber-600 text-white shadow-md' 
//                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
//               }`}
//             >
//               <span>🎲</span> বেট হিস্ট্রি
//             </button>
//           </div>

//           {/* হিস্ট্রি সেকশনগুলো */}
//           <div className="pt-1">
//             {activeTab === 'deposit' && <DepositHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
//             {activeTab === 'withdraw' && <WithdrawHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
//             {activeTab === 'bet' && <BetHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }

// .........................................

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import DepositHistorySection from '@/components/deposithistoryfetch';
import WithdrawHistorySection from '@/components/withdrowhistryfeatch';
import BetHistorySection from '@/components/bethistryfeatch';

export default function WalletPage() {
  const [user, setUser] = useState({ balance: 0, turnover: 0 });
  const [activeTab, setActiveTab] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!savedUser.uid) {
      router.push('/login');
      return;
    }

    // ✅ FIX #1: String → Number conversion
    setUser({
      ...savedUser,
      balance: Number(savedUser.balance) || 0,
      turnover: Number(savedUser.turnover) || 0,
    });

    // ✅ FIX: /api/user/me ব্যবহার করা হচ্ছে (admin API-র বদলে)
    fetch('/api/user/me', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          // ✅ FIX #2: সব field Number-এ convert
          const currentUser = {
            ...data.user,
            balance: Number(data.user.balance) || 0,
            turnover: Number(data.user.turnover) || 0,
          };
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      })
      .catch(err => console.error(err));
  }, [router]);

  const uidToFetch = user.phone || user.uid;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      
      <div className="w-full max-w-md md:max-w-2xl space-y-3 md:space-y-4">
        
        {/* হেডার সেকশন (কমপ্যাক্ট) */}
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
            <i className="fa-solid fa-wallet"></i> আমার ওয়ালেট
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        {/* ব্যালেন্স কার্ড */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
          <p className="text-[11px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold">উপলব্ধ মূল ব্যালেন্স</p>
          <h1 className="text-3xl md:text-4xl font-black text-amber-400 font-mono mt-1">৳{user.balance || 0}</h1>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-center gap-6 text-xs md:text-sm text-slate-400 font-mono">
            <span>টার্নওভার: <strong className="text-emerald-400">৳{user.turnover || 0}</strong></span>
            <span>আইডি: <strong className="text-white">{user.uid}</strong></span>
          </div>
        </div>

        {/* কমপ্যাক্ট অ্যাকশন বাটন (ডিপোজিট এবং উইথড্র) */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Link 
            href="/deposit" 
            className="flex flex-row items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-950/40 group"
          >
            <span className="text-xl group-hover:scale-110 transition">📥</span>
            <span className="font-bold text-sm">ডিপোজিট</span>
          </Link>

          <Link 
            href="/withdraw" 
            className="flex flex-row items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 py-3.5 px-4 rounded-xl transition shadow-lg shadow-rose-950/40 group"
          >
            <span className="text-xl group-hover:scale-110 transition">📤</span>
            <span className="font-bold text-sm">উইথড্র</span>
          </Link>
        </div>

        {/* হিস্ট্রি সেকশন */}
        <div className="space-y-3 pt-1">
          <p className="text-[11px] md:text-xs text-slate-400 text-center font-semibold uppercase tracking-wider">লেনদেনের ইতিহাস</p>
          
          {/* সেগমেন্টেড ট্যাব ডিজাইন */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-800 shadow-lg">
            <button
              onClick={() => setActiveTab(activeTab === 'deposit' ? null : 'deposit')}
              className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'deposit' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>📥</span> ডিপোজিট
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'withdraw' ? null : 'withdraw')}
              className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'withdraw' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>📤</span> উইথড্র
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'bet' ? null : 'bet')}
              className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'bet' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>🎲</span> বেট হিস্ট্রি
            </button>
          </div>

          {/* হিস্ট্রি সেকশনগুলো */}
          <div className="pt-1">
            {activeTab === 'deposit' && <DepositHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
            {activeTab === 'withdraw' && <WithdrawHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
            {activeTab === 'bet' && <BetHistorySection uid={uidToFetch} onClose={() => setActiveTab(null)} />}
          </div>

        </div>

      </div>
    </div>
  );
}