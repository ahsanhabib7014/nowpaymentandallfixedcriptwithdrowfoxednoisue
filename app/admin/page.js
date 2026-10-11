// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import LiveBetTrackingCard from '@/components/LiveBetTrackingCard';

// export default function AdminHomePage() {
//   const router = useRouter();
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalDeposit: 0,
//     totalWithdraw: 0,
//     totalUserBalance: 0,
//     totalReferralBonus: 0,
//     adminNetProfit: 0
//   });
//   const [users, setUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('users');

//   const [editingUser, setEditingUser] = useState(null);
//   const [newBalance, setNewBalance] = useState('');
//   const [newTurnover, setNewTurnover] = useState('');
//   const [newIp, setNewIp] = useState('');

//   // 🔔 কাস্টম কনফার্ম মডাল
//   const [confirmData, setConfirmData] = useState(null);

//   // 🍞 টোস্ট স্টেট
//   const [toasts, setToasts] = useState([]);

//   // 🍞 টোস্ট দেখানোর ফাংশন (মাঝখানে)
//   const showToast = (message, type = 'success') => {
//     const id = Date.now() + Math.random();
//     setToasts((prev) => [...prev, { id, message, type }]);
//     setTimeout(() => {
//       setToasts((prev) => prev.filter((t) => t.id !== id));
//     }, 3000);
//   };

//   const removeToast = (id) => {
//     setToasts((prev) => prev.filter((t) => t.id !== id));
//   };

//   const fetchData = async (search = '') => {
//     try {
//       setLoading(true);
//       const statsRes = await fetch(`/api/admin/stats?t=${Date.now()}`);
//       const statsData = await statsRes.json();
//       if (statsData.success) setStats(statsData.stats);

//       const usersRes = await fetch(`/api/admin/users?search=${search}&t=${Date.now()}`);
//       const usersData = await usersRes.json();
//       if (usersData.success) setUsers(usersData.users);
//     } catch (err) {
//       console.error('Fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(() => { fetchData(searchQuery); }, 5000);
//     return () => clearInterval(interval);
//   }, [searchQuery]);

//   const askConfirm = ({ title, message, icon = '⚠️', iconColor = 'amber', confirmText = 'হ্যাঁ, নিশ্চিত', confirmClass = 'emerald', onYes }) => {
//     setConfirmData({ title, message, icon, iconColor, confirmText, confirmClass, onYes });
//   };

//   const performUpdateUser = async (userId, updateData) => {
//     try {
//       const res = await fetch('/api/admin/users', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId, ...updateData })
//       });
//       const data = await res.json();
//       showToast(data.message || 'সফলভাবে আপডেট হয়েছে', 'success');
//       setEditingUser(null);
//       fetchData(searchQuery);
//     } catch (err) {
//       showToast('আপডেট করতে সমস্যা হয়েছে', 'error');
//     }
//   };

//   const performDeleteUser = async (userId) => {
//     try {
//       await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
//       showToast(`ইউজার ${userId} ডিলিট হয়েছে`, 'success');
//       fetchData(searchQuery);
//     } catch (err) {
//       showToast('ডিলিট করতে সমস্যা হয়েছে', 'error');
//     }
//   };

//   const handleUpdateUser = (userId, updateData) => {
//     let title = 'তথ্য আপডেট নিশ্চিত করুন';
//     let message = 'আপনি কি এই ইউজারের তথ্য আপডেট করতে চান?';
//     let icon = '✏️';
//     let iconColor = 'blue';
//     let confirmText = 'হ্যাঁ, আপডেট';
//     let confirmClass = 'blue';

//     if (updateData.isBlocked === true) {
//       title = 'ইউজার ব্লক নিশ্চিত করুন';
//       message = 'আপনি কি এই ইউজারকে ব্লক করতে চান?';
//       icon = '🚫';
//       iconColor = 'rose';
//       confirmText = 'হ্যাঁ, ব্লক';
//       confirmClass = 'rose';
//     }
//     if (updateData.isBlocked === false) {
//       title = 'ইউজার আনব্লক নিশ্চিত করুন';
//       message = 'আপনি কি এই ইউজারকে আনব্লক করতে চান?';
//       icon = '✅';
//       iconColor = 'emerald';
//       confirmText = 'হ্যাঁ, আনব্লক';
//       confirmClass = 'emerald';
//     }

//     askConfirm({
//       title, message, icon, iconColor, confirmText, confirmClass,
//       onYes: () => performUpdateUser(userId, updateData)
//     });
//   };

//   const handleDeleteUser = (userId) => {
//     askConfirm({
//       title: 'ইউজার ডিলিট নিশ্চিত করুন',
//       message: `ইউজার ${userId} কে স্থায়ীভাবে ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।`,
//       icon: '🗑️',
//       iconColor: 'rose',
//       confirmText: 'হ্যাঁ, ডিলিট',
//       confirmClass: 'rose',
//       onYes: () => performDeleteUser(userId)
//     });
//   };

//   const handleEditClick = (u) => {
//     askConfirm({
//       title: 'ইউজার এডিট নিশ্চিত করুন',
//       message: `ইউজার ${u.uid} এর তথ্য এডিট করতে চান?`,
//       icon: '✏️',
//       iconColor: 'blue',
//       confirmText: 'হ্যাঁ, এডিট',
//       confirmClass: 'blue',
//       onYes: () => {
//         setEditingUser(u.uid);
//         setNewBalance(u.balance);
//         setNewTurnover(u.turnover || 0);
//         setNewIp(u.ipAddress || '');
//       }
//     });
//   };

//   const handleLogout = () => {
//     askConfirm({
//       title: 'লগআউট নিশ্চিত করুন',
//       message: 'আপনি কি অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?',
//       icon: '🔓',
//       iconColor: 'rose',
//       confirmText: 'হ্যাঁ, লগআউট',
//       confirmClass: 'rose',
//       onYes: async () => {
//         try {
//           const res = await fetch('/api/auth/logout', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//           });
//           if (res.ok) {
//             showToast('সফলভাবে লগআউট হয়েছে', 'success');
//             setTimeout(() => {
//               router.push('/admin/login');
//             }, 800);
//           } else {
//             showToast('লগআউট করতে সমস্যা হয়েছে', 'error');
//           }
//         } catch (err) {
//           console.error('Logout error:', err);
//           showToast('নেটওয়ার্ক সমস্যা হয়েছে', 'error');
//         }
//       }
//     });
//   };

//   const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

//   const iconColorMap = {
//     amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
//     emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
//     rose:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
//     blue:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
//   };

//   const confirmBtnMap = {
//     emerald: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40',
//     rose:    'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-950/40',
//     blue:    'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40',
//   };

//   const toastStyleMap = {
//     success: { bg: 'bg-emerald-950/95 border-emerald-500/40', icon: '✅', iconBg: 'bg-emerald-500/20 text-emerald-400' },
//     error:   { bg: 'bg-rose-950/95 border-rose-500/40',       icon: '❌', iconBg: 'bg-rose-500/20 text-rose-400' },
//     info:    { bg: 'bg-blue-950/95 border-blue-500/40',       icon: 'ℹ️', iconBg: 'bg-blue-500/20 text-blue-400' },
//   };

//   return (
//     <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-6 font-sans">

//       {/* 🍞 টোস্ট কন্টেইনার */}
//       <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
//         {toasts.map((t) => {
//           const s = toastStyleMap[t.type] || toastStyleMap.success;
//           return (
//             <div
//               key={t.id}
//               className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${s.bg}`}
//               style={{ animation: 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
//             >
//               <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${s.iconBg}`}>
//                 {s.icon}
//               </div>
//               <p className="flex-1 text-xs font-semibold text-white leading-relaxed">{t.message}</p>
//               <button
//                 onClick={() => removeToast(t.id)}
//                 className="flex-shrink-0 text-slate-400 hover:text-white text-xs transition-colors"
//               >
//                 ✕
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       <style jsx global>{`
//         @keyframes slideDown {
//           from { opacity: 0; transform: translateY(-30px) scale(0.95); }
//           to { opacity: 1; transform: translateY(0) scale(1); }
//         }
//       `}</style>

//       {/* হেডার */}
//       <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-5 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div className="space-y-1 relative z-10">
//           <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
//             অ্যাডমিন কন্ট্রোল সেন্টার
//           </h1>
//           <p className="text-xs text-slate-400 font-medium">রিয়েল-টাইম ফিন্যান্সিয়াল ওভারভিউ</p>
//         </div>

//         <div className="flex items-center gap-2 relative z-10">
//           <button
//             onClick={() => fetchData(searchQuery)}
//             className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transition-all active:scale-95"
//           >
//             <span className="group-hover:rotate-180 transition-transform duration-500 text-sm">🔄</span>
//             ডেটা সিঙ্ক করুন
//           </button>

//           <button
//             onClick={handleLogout}
//             className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 shadow-lg shadow-rose-950/30 transition-all duration-300 active:scale-95"
//             title="লগআউট"
//           >
//             <span className="text-sm group-hover:-translate-x-0.5 transition-transform">🔓</span>
//             লগআউট
//           </button>
//         </div>
//       </div>

//       {/* ================= ৬টি কার্ড ================= */}
//       <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার</span>
//             <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl text-sm border border-blue-500/20">👥</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-white">{fmt(stats.totalUsers)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ডিপোজিট</span>
//             <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-sm border border-emerald-500/20">📥</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-emerald-400">৳{fmt(stats.totalDeposit)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট উইথড্র</span>
//             <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20">📤</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-rose-400">৳{fmt(stats.totalWithdraw)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার বেলেন্স</span>
//             <div className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl text-sm border border-amber-500/20">💰</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-amber-400">৳{fmt(stats.totalUserBalance)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট রেফারেল বোনাস</span>
//             <div className="p-2 bg-purple-500/10 text-purple-400 rounded-2xl text-sm border border-purple-500/20">🤝</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-purple-400">৳{fmt(stats.totalReferralBonus)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-emerald-500/40 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-emerald-300 uppercase">অ্যাডমিনের নিট লাভ</span>
//             <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-2xl text-sm border border-emerald-500/30">📊</div>
//           </div>
//           <h2 className={`mt-3 text-2xl md:text-3xl font-black ${stats.adminNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
//             ৳{fmt(stats.adminNetProfit)}
//           </h2>
//         </div>

//       </div>

//       <LiveBetTrackingCard />

//       {/* নেভিগেশন */}
//       <div className="flex flex-wrap gap-2 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
//         <button className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center gap-2">
//           👤 ইউজার 
//         </button>
//         <button onClick={() => router.push('/admin/deposits')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📥 ডিপোজিট</button>
//         <button onClick={() => router.push('/admin/withdraws')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📤 উইথড্র</button>
//         <button onClick={() => router.push('/admin/referrals')} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex items-center gap-2">🤝 রেফারেল</button>
//         <button onClick={() => router.push('/admin/payments')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">💳 পেমেন্ট</button>
//         <button onClick={() => router.push('/admin/payment-methods')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">🌐 মেথডস</button>
        
//         {/* ✅ নতুন: Exchange Rate button */}
//         <button 
//           onClick={() => router.push('/admin/settings/exchange-rate')} 
//           className="px-4 py-2.5 rounded-xl text-xs font-bold border border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2 transition-all"
//         >
//           💱 Exchange Rate
//         </button>
//       </div>

//       {/* ইউজার লিস্ট */}
//       <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-3">
//           <h2 className="text-sm font-bold text-slate-200">ইউজার লিস্ট ও সার্চ</h2>
//           <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="flex gap-2 w-full md:w-auto">
//             <input
//               type="text"
//               placeholder="ফোন, আইডি বা আইপি..."
//               value={searchQuery}
//               onChange={(e) => { if (e.target.value.length <= 11) setSearchQuery(e.target.value); }}
//               maxLength={11}
//               className="bg-slate-950/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs w-full md:w-72 text-white font-mono"
//             />
//             <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl font-bold text-xs">সার্চ</button>
//           </form>
//         </div>
//         <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
//           <table className="w-full min-w-[900px] text-left text-xs text-slate-300">
//             <thead className="bg-slate-950/90 text-[10px] uppercase text-slate-400 border-b border-slate-800">
//               <tr>
//                 <th className="p-3.5">UID</th>
//                 <th className="p-3.5">ফোন</th>
//                 <th className="p-3.5">ব্যালেন্স</th>
//                 <th className="p-3.5">টার্নওভার</th>
//                 <th className="p-3.5">আইপি</th>
//                 <th className="p-3.5">স্ট্যাটাস</th>
//                 <th className="p-3.5 text-center">অ্যাকশন</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-800/60">
//               {users.map((u) => (
//                 <tr key={u._id} className="hover:bg-slate-900/60">
//                   <td className="p-3.5 font-semibold text-white font-mono">{u.uid}</td>
//                   <td className="p-3.5 text-slate-300 font-mono">{u.phone}</td>
//                   <td className="p-3.5 font-extrabold text-amber-400 font-mono">৳{u.balance}</td>
//                   <td className="p-3.5 text-slate-300 font-mono">৳{u.turnover || 0}</td>
//                   <td className="p-3.5 text-[11px] font-mono text-slate-400">{u.ipAddress || 'নেই'}</td>
//                   <td className="p-3.5">
//                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isBlocked ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
//                       {u.isBlocked ? 'ব্লকড' : 'অ্যাক্টিভ'}
//                     </span>
//                   </td>
//                   <td className="p-3.5 text-center">
//                     <div className="inline-flex flex-wrap items-center justify-center gap-1.5">

//                       <button
//                         onClick={() => handleEditClick(u)}
//                         className="whitespace-nowrap bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold border border-blue-500/20 transition-all"
//                       >
//                         এডিট
//                       </button>

//                       <button
//                         onClick={() => handleUpdateUser(u.uid, { isBlocked: !u.isBlocked })}
//                         className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
//                           u.isBlocked
//                             ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'
//                             : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border-rose-500/20'
//                         }`}
//                       >
//                         {u.isBlocked ? 'আনব্লক' : 'ব্লক'}
//                       </button>

//                       <button
//                         onClick={() => handleDeleteUser(u.uid)}
//                         className="whitespace-nowrap bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
//                       >
//                         ডিলিট
//                       </button>

//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* এডিট মডাল */}
//       {editingUser && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
//             <h3 className="text-base font-extrabold text-white">ইউজার এডিট: <span className="text-emerald-400 font-mono text-xs">{editingUser}</span></h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="text-[11px] text-slate-400 block mb-1">ব্যালেন্স:</label>
//                 <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 block mb-1">টার্নওভার:</label>
//                 <input type="number" value={newTurnover} onChange={(e) => setNewTurnover(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 block mb-1">আইপি:</label>
//                 <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
//               </div>
//             </div>
//             <div className="flex gap-2 pt-1">
//               <button
//                 onClick={() => handleUpdateUser(editingUser, { balance: Number(newBalance), turnover: Number(newTurnover), ipAddress: newIp })}
//                 className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-2xl font-bold text-xs"
//               >
//                 আপডেট
//               </button>
//               <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-2xl font-bold text-xs">বাতিল</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🔔 কাস্টম কনফার্ম মডাল */}
//       {confirmData && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
//           <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl shadow-emerald-950/40">

//             <div className="flex flex-col items-center text-center space-y-3">
//               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${iconColorMap[confirmData.iconColor] || iconColorMap.amber}`}>
//                 {confirmData.icon}
//               </div>
//               <h3 className="text-base font-extrabold text-white">{confirmData.title}</h3>
//               <p className="text-xs text-slate-400 leading-relaxed">{confirmData.message}</p>
//             </div>

//             <div className="flex gap-2 pt-1">
//               <button
//                 onClick={() => setConfirmData(null)}
//                 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95"
//               >
//                 না
//               </button>
//               <button
//                 onClick={() => {
//                   confirmData.onYes?.();
//                   setConfirmData(null);
//                 }}
//                 className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 ${
//                   confirmBtnMap[confirmData.confirmClass] || confirmBtnMap.emerald
//                 }`}
//               >
//                 {confirmData.confirmText || 'হ্যাঁ, নিশ্চিত'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// /////////////////////////////////////////////////////////////////

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LiveBetTrackingCard from '@/components/LiveBetTrackingCard';

export default function AdminHomePage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    totalUserBalance: 0,
    totalReferralBonus: 0,
    adminNetProfit: 0
  });
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const [editingUser, setEditingUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');
  const [newTurnover, setNewTurnover] = useState('');
  const [newIp, setNewIp] = useState('');

  // 🔔 কাস্টম কনফার্ম মডাল
  const [confirmData, setConfirmData] = useState(null);

  // 🍞 টোস্ট স্টেট
  const [toasts, setToasts] = useState([]);

  // 🍞 টোস্ট দেখানোর ফাংশন (মাঝখানে)
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchData = async (search = '') => {
    try {
      setLoading(true);
      const statsRes = await fetch(`/api/admin/stats?t=${Date.now()}`);
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const usersRes = await fetch(`/api/admin/users?search=${search}&t=${Date.now()}`);
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => { fetchData(searchQuery); }, 5000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const askConfirm = ({ title, message, icon = '⚠️', iconColor = 'amber', confirmText = 'হ্যাঁ, নিশ্চিত', confirmClass = 'emerald', onYes }) => {
    setConfirmData({ title, message, icon, iconColor, confirmText, confirmClass, onYes });
  };

  const performUpdateUser = async (userId, updateData) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updateData })
      });
      const data = await res.json();
      showToast(data.message || 'সফলভাবে আপডেট হয়েছে', 'success');
      setEditingUser(null);
      fetchData(searchQuery);
    } catch (err) {
      showToast('আপডেট করতে সমস্যা হয়েছে', 'error');
    }
  };

  const performDeleteUser = async (userId) => {
    try {
      await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      showToast(`ইউজার ${userId} ডিলিট হয়েছে`, 'success');
      fetchData(searchQuery);
    } catch (err) {
      showToast('ডিলিট করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleUpdateUser = (userId, updateData) => {
    let title = 'তথ্য আপডেট নিশ্চিত করুন';
    let message = 'আপনি কি এই ইউজারের তথ্য আপডেট করতে চান?';
    let icon = '✏️';
    let iconColor = 'blue';
    let confirmText = 'হ্যাঁ, আপডেট';
    let confirmClass = 'blue';

    if (updateData.isBlocked === true) {
      title = 'ইউজার ব্লক নিশ্চিত করুন';
      message = 'আপনি কি এই ইউজারকে ব্লক করতে চান?';
      icon = '🚫';
      iconColor = 'rose';
      confirmText = 'হ্যাঁ, ব্লক';
      confirmClass = 'rose';
    }
    if (updateData.isBlocked === false) {
      title = 'ইউজার আনব্লক নিশ্চিত করুন';
      message = 'আপনি কি এই ইউজারকে আনব্লক করতে চান?';
      icon = '✅';
      iconColor = 'emerald';
      confirmText = 'হ্যাঁ, আনব্লক';
      confirmClass = 'emerald';
    }

    askConfirm({
      title, message, icon, iconColor, confirmText, confirmClass,
      onYes: () => performUpdateUser(userId, updateData)
    });
  };

  const handleDeleteUser = (userId) => {
    askConfirm({
      title: 'ইউজার ডিলিট নিশ্চিত করুন',
      message: `ইউজার ${userId} কে স্থায়ীভাবে ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।`,
      icon: '🗑️',
      iconColor: 'rose',
      confirmText: 'হ্যাঁ, ডিলিট',
      confirmClass: 'rose',
      onYes: () => performDeleteUser(userId)
    });
  };

  const handleEditClick = (u) => {
    askConfirm({
      title: 'ইউজার এডিট নিশ্চিত করুন',
      message: `ইউজার ${u.uid} এর তথ্য এডিট করতে চান?`,
      icon: '✏️',
      iconColor: 'blue',
      confirmText: 'হ্যাঁ, এডিট',
      confirmClass: 'blue',
      onYes: () => {
        setEditingUser(u.uid);
        setNewBalance(u.balance);
        setNewTurnover(u.turnover || 0);
        setNewIp(u.ipAddress || '');
      }
    });
  };

  const handleLogout = () => {
    askConfirm({
      title: 'লগআউট নিশ্চিত করুন',
      message: 'আপনি কি অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?',
      icon: '🔓',
      iconColor: 'rose',
      confirmText: 'হ্যাঁ, লগআউট',
      confirmClass: 'rose',
      onYes: async () => {
        try {
          const res = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            showToast('সফলভাবে লগআউট হয়েছে', 'success');
            setTimeout(() => {
              router.push('/admin/login');
            }, 800);
          } else {
            showToast('লগআউট করতে সমস্যা হয়েছে', 'error');
          }
        } catch (err) {
          console.error('Logout error:', err);
          showToast('নেটওয়ার্ক সমস্যা হয়েছে', 'error');
        }
      }
    });
  };

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  const iconColorMap = {
    amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
    blue:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const confirmBtnMap = {
    emerald: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40',
    rose:    'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-950/40',
    blue:    'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40',
  };

  const toastStyleMap = {
    success: { bg: 'bg-emerald-950/95 border-emerald-500/40', icon: '✅', iconBg: 'bg-emerald-500/20 text-emerald-400' },
    error:   { bg: 'bg-rose-950/95 border-rose-500/40',       icon: '❌', iconBg: 'bg-rose-500/20 text-rose-400' },
    info:    { bg: 'bg-blue-950/95 border-blue-500/40',       icon: 'ℹ️', iconBg: 'bg-blue-500/20 text-blue-400' },
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-6 font-sans">

      {/* 🍞 টোস্ট কন্টেইনার */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const s = toastStyleMap[t.type] || toastStyleMap.success;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${s.bg}`}
              style={{ animation: 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${s.iconBg}`}>
                {s.icon}
              </div>
              <p className="flex-1 text-xs font-semibold text-white leading-relaxed">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* হেডার */}
      <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-5 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            অ্যাডমিন কন্ট্রোল সেন্টার
          </h1>
          <p className="text-xs text-slate-400 font-medium">রিয়েল-টাইম ফিন্যান্সিয়াল ওভারভিউ</p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => fetchData(searchQuery)}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transition-all active:scale-95"
          >
            <span className="group-hover:rotate-180 transition-transform duration-500 text-sm">🔄</span>
            ডেটা সিঙ্ক করুন
          </button>

          <button
            onClick={handleLogout}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 shadow-lg shadow-rose-950/30 transition-all duration-300 active:scale-95"
            title="লগআউট"
          >
            <span className="text-sm group-hover:-translate-x-0.5 transition-transform">🔓</span>
            লগআউট
          </button>
        </div>
      </div>

      {/* ================= ৬টি কার্ড ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl text-sm border border-blue-500/20">👥</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-white">{fmt(stats.totalUsers)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ডিপোজিট</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-sm border border-emerald-500/20">📥</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-emerald-400">৳{fmt(stats.totalDeposit)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট উইথড্র</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20">📤</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-rose-400">৳{fmt(stats.totalWithdraw)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার বেলেন্স</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl text-sm border border-amber-500/20">💰</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-amber-400">৳{fmt(stats.totalUserBalance)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট রেফারেল বোনাস</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-2xl text-sm border border-purple-500/20">🤝</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-purple-400">৳{fmt(stats.totalReferralBonus)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-emerald-500/40 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase">অ্যাডমিনের নিট লাভ</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-2xl text-sm border border-emerald-500/30">📊</div>
          </div>
          <h2 className={`mt-3 text-2xl md:text-3xl font-black ${stats.adminNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ৳{fmt(stats.adminNetProfit)}
          </h2>
        </div>

      </div>

      <LiveBetTrackingCard />

      {/* নেভিগেশন */}
      <div className="flex flex-wrap gap-2 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
        <button className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center gap-2">
          👤 ইউজার 
        </button>
        <button onClick={() => router.push('/admin/deposits')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📥 ডিপোজিট</button>
        <button onClick={() => router.push('/admin/withdraws')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📤 উইথড্র</button>
        <button onClick={() => router.push('/admin/referrals')} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex items-center gap-2">🤝 রেফারেল</button>
        <button onClick={() => router.push('/admin/payments')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">💳 পেমেন্ট</button>
        <button onClick={() => router.push('/admin/payment-methods')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">🌐 মেথডস</button>
        
        {/* ✅ Exchange Rate button */}
        <button 
          onClick={() => router.push('/admin/settings/exchange-rate')} 
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2 transition-all"
        >
          💱 Exchange Rate
        </button>

        {/* ✅ নতুন: NowPayments button */}
        <button 
          onClick={() => router.push('/admin/nowpayments')} 
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 transition-all"
        >
          ₿ NowPayments
        </button>
      </div>

      {/* ইউজার লিস্ট */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <h2 className="text-sm font-bold text-slate-200">ইউজার লিস্ট ও সার্চ</h2>
          <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="ফোন, আইডি বা আইপি..."
              value={searchQuery}
              onChange={(e) => { if (e.target.value.length <= 11) setSearchQuery(e.target.value); }}
              maxLength={11}
              className="bg-slate-950/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs w-full md:w-72 text-white font-mono"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl font-bold text-xs">সার্চ</button>
          </form>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
          <table className="w-full min-w-[900px] text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-[10px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">UID</th>
                <th className="p-3.5">ফোন</th>
                <th className="p-3.5">ব্যালেন্স</th>
                <th className="p-3.5">টার্নওভার</th>
                <th className="p-3.5">আইপি</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/60">
                  <td className="p-3.5 font-semibold text-white font-mono">{u.uid}</td>
                  <td className="p-3.5 text-slate-300 font-mono">{u.phone}</td>
                  <td className="p-3.5 font-extrabold text-amber-400 font-mono">৳{u.balance}</td>
                  <td className="p-3.5 text-slate-300 font-mono">৳{u.turnover || 0}</td>
                  <td className="p-3.5 text-[11px] font-mono text-slate-400">{u.ipAddress || 'নেই'}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isBlocked ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {u.isBlocked ? 'ব্লকড' : 'অ্যাক্টিভ'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-1.5">

                      <button
                        onClick={() => handleEditClick(u)}
                        className="whitespace-nowrap bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold border border-blue-500/20 transition-all"
                      >
                        এডিট
                      </button>

                      <button
                        onClick={() => handleUpdateUser(u.uid, { isBlocked: !u.isBlocked })}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                          u.isBlocked
                            ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'
                            : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border-rose-500/20'
                        }`}
                      >
                        {u.isBlocked ? 'আনব্লক' : 'ব্লক'}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.uid)}
                        className="whitespace-nowrap bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                      >
                        ডিলিট
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* এডিট মডাল */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">ইউজার এডিট: <span className="text-emerald-400 font-mono text-xs">{editingUser}</span></h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ব্যালেন্স:</label>
                <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">টার্নওভার:</label>
                <input type="number" value={newTurnover} onChange={(e) => setNewTurnover(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">আইপি:</label>
                <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleUpdateUser(editingUser, { balance: Number(newBalance), turnover: Number(newTurnover), ipAddress: newIp })}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-2xl font-bold text-xs"
              >
                আপডেট
              </button>
              <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-2xl font-bold text-xs">বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 কাস্টম কনফার্ম মডাল */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl shadow-emerald-950/40">

            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${iconColorMap[confirmData.iconColor] || iconColorMap.amber}`}>
                {confirmData.icon}
              </div>
              <h3 className="text-base font-extrabold text-white">{confirmData.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{confirmData.message}</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmData(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95"
              >
                না
              </button>
              <button
                onClick={() => {
                  confirmData.onYes?.();
                  setConfirmData(null);
                }}
                className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 ${
                  confirmBtnMap[confirmData.confirmClass] || confirmBtnMap.emerald
                }`}
              >
                {confirmData.confirmText || 'হ্যাঁ, নিশ্চিত'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}