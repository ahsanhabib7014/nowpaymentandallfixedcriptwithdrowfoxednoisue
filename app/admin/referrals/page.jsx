// // 'use client';
// // import { useState, useEffect } from 'react';
// // import { useRouter } from 'next/navigation';

// // export default function AdminReferralPage() {
// //   const [globalRate, setGlobalRate] = useState(10);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [searchedUsers, setSearchedUsers] = useState([]);
// //   const [selectedUser, setSelectedUser] = useState(null);
// //   const [newCommission, setNewCommission] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [toast, setToast] = useState({ show: false, text: '', success: true });

// //   const router = useRouter();

// //   const showToast = (text, success = true) => {
// //     setToast({ show: true, text, success });
// //     setTimeout(() => {
// //       setToast({ show: false, text: '', success: false });
// //     }, 3500);
// //   };

// //   useEffect(() => {
// //     fetchGlobalRate();
// //   }, []);

// //   const fetchGlobalRate = async () => {
// //     try {
// //       // HttpOnly কুকি ব্রাউজার স্বয়ংক্রিয়ভাবে পাস করবে
// //       const res = await fetch('/api/admin/settings/referral-rate');
// //       const contentType = res.headers.get("content-type");
// //       if (!res.ok || !contentType || !contentType.includes("application/json")) return;
// //       const data = await res.json();
// //       if (data.success) {
// //         setGlobalRate(data.percentage);
// //       }
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   const handleUpdateGlobalRate = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       const res = await fetch('/api/admin/settings/referral-rate', {
// //         method: 'POST',
// //         headers: { 
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify({ percentage: globalRate })
// //       });
// //       const contentType = res.headers.get("content-type");
// //       if (!res.ok || !contentType || !contentType.includes("application/json")) {
// //         showToast('সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি।', false);
// //         return;
// //       }
// //       const data = await res.json();
// //       if (data.success) {
// //         showToast('ডিফল্ট রেফারেল পার্সেন্টেজ সফলভাবে আপডেট করা হয়েছে!', true);
// //       } else {
// //         showToast(data.message || 'আপডেট ব্যর্থ হয়েছে।', false);
// //       }
// //     } catch (err) {
// //       showToast('সার্ভারে সমস্যা হয়েছে।', false);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleSearchUser = async (e) => {
// //     e.preventDefault();
// //     if (!searchQuery.trim()) return;

// //     try {
// //       const res = await fetch(`/api/admin/users?search=${searchQuery}`);
// //       const contentType = res.headers.get("content-type");
// //       if (!res.ok || !contentType || !contentType.includes("application/json")) return;
// //       const data = await res.json();
// //       if (data.success) {
// //         setSearchedUsers(data.users || []);
// //         if (data.users.length === 0) {
// //           showToast('কোনো ইউজার পাওয়া যায়নি।', false);
// //         }
// //       }
// //     } catch (err) {
// //       showToast('সার্চ করতে সমস্যা হয়েছে।', false);
// //     }
// //   };

// //   const handleUpdateUserCommission = async (e) => {
// //     e.preventDefault();
// //     if (!selectedUser) return;

// //     try {
// //       const res = await fetch('/api/admin/users/update-commission', {
// //         method: 'POST',
// //         headers: { 
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify({ 
// //           uid: selectedUser.uid, 
// //           commissionRate: Number(newCommission) 
// //         })
// //       });
// //       const contentType = res.headers.get("content-type");
// //       if (!res.ok || !contentType || !contentType.includes("application/json")) {
// //         showToast('সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি।', false);
// //         return;
// //       }
// //       const data = await res.json();
// //       if (data.success) {
// //         showToast('ইউজারের কমিশন সফলভাবে আপডেট করা হয়েছে!', true);
// //         setSelectedUser(null);
// //         setNewCommission('');
// //         setSearchedUsers([]);
// //         setSearchQuery('');
// //       } else {
// //         showToast(data.message || 'কমিশন আপডেট ব্যর্থ হয়েছে।', false);
// //       }
// //     } catch (err) {
// //       showToast('সার্ভারে সমস্যা হয়েছে।', false);
// //     }
// //   };

// //   return (
// //     <div className="max-w-5xl mx-auto p-6 space-y-8 text-white min-h-screen bg-[#07090e]">
      
// //       {toast.show && (
// //         <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce">
// //           <div className={`p-4 rounded-2xl shadow-2xl text-xs font-bold text-center border flex items-center justify-center space-x-2 ${
// //             toast.success ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/50 backdrop-blur-md' : 'bg-rose-950/95 text-rose-300 border-rose-500/50 backdrop-blur-md'
// //           }`}>
// //             <span>{toast.success ? '✅' : '⚠️'}</span>
// //             <span>{toast.text}</span>
// //           </div>
// //         </div>
// //       )}

// //       <div className="flex items-center justify-between bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
// //         <div>
// //           <h1 className="text-xl font-extrabold text-emerald-400">রেফারেল ও কমিশন অ্যাডমিন প্যানেল</h1>
// //           <p className="text-xs text-slate-400 mt-1">গ্লোবাল কমিশন রেট, উইথড্র রিকোয়েস্ট এবং ইউজার স্পেশাল কমিশন ম্যানেজ করুন।</p>
// //         </div>
// //         <button 
// //           onClick={() => router.back()} 
// //           className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-slate-300 transition cursor-pointer"
// //         >
// //           ফিরে যান
// //         </button>
// //       </div>

// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
// //         <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
// //           <div>
// //             <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">গ্লোবাল রেফারেল পার্সেন্টেজ</h2>
// //             <p className="text-xs text-slate-400">সকল নতুন বা সাধারণ ইউজারের জন্য ডিফল্ট কমিশন রেট সেট করুন।</p>
// //           </div>

// //           <form onSubmit={handleUpdateGlobalRate} className="space-y-4 pt-4">
// //             <div>
// //               <label className="text-xs text-slate-400 block mb-1">পার্সেন্টেজ (%)</label>
// //               <input 
// //                 type="number" 
// //                 value={globalRate}
// //                 onChange={(e) => setGlobalRate(e.target.value)}
// //                 required
// //                 min="0"
// //                 max="100"
// //                 className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-amber-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
// //               />
// //             </div>
// //             <button 
// //               type="submit" 
// //               disabled={loading}
// //               className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-950/50"
// //             >
// //               {loading ? 'আপডেট হচ্ছে...' : 'রেট সেভ করুন'}
// //             </button>
// //           </form>
// //         </div>

// //         <div className="md:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
// //           <div>
// //             <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">ইউজার কাস্টম কমিশন এডিটর</h2>
// //             <p className="text-xs text-slate-400">ইউজার আইডি বা মোবাইল নম্বর দিয়ে সার্চ করে নির্দিষ্ট ইউজারের কমিশন পরিবর্তন করুন।</p>
// //           </div>

// //           <form onSubmit={handleSearchUser} className="flex gap-2">
// //             <input 
// //               type="text" 
// //               placeholder="ইউজার আইডি (UID) বা ফোন নম্বর লিখুন..." 
// //               value={searchQuery}
// //               onChange={(e) => {
// //                 if (e.target.value.length <= 11) {
// //                   setSearchQuery(e.target.value);
// //                 }
// //               }}
// //               maxLength={11}
// //               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
// //             />
// //             <button 
// //               type="submit"
// //               className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border border-slate-700"
// //             >
// //               সার্চ করুন
// //             </button>
// //           </form>

// //           {searchedUsers.length > 0 && !selectedUser && (
// //             <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
// //               {searchedUsers.map((u) => (
// //                 <div key={u._id || u.uid} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
// //                   <div>
// //                     <p className="text-xs font-bold text-white">{u.name || 'নামবিহীন ইউজার'}</p>
// //                     <p className="text-[10px] text-slate-400 font-mono">UID: {u.uid} | ফোন: {u.phone || 'N/A'}</p>
// //                     <p className="text-[10px] text-amber-400 font-medium">বর্তমান কমিশন: {u.customCommission !== null && u.customCommission !== undefined ? u.customCommission : globalRate}%</p>
// //                   </div>
// //                   <button 
// //                     onClick={() => { setSelectedUser(u); setNewCommission(u.customCommission !== null && u.customCommission !== undefined ? u.customCommission : globalRate); }}
// //                     className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border border-emerald-500/30"
// //                   >
// //                     এডিট করুন
// //                   </button>
// //                 </div>
// //               ))}
// //             </div>
// //           )}

// //           {selectedUser && (
// //             <form onSubmit={handleUpdateUserCommission} className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-3 mt-3">
// //               <div className="flex justify-between items-center">
// //                 <span className="text-xs text-slate-300">সিলেক্টেড ইউজার: <strong className="text-emerald-400">{selectedUser.name || selectedUser.uid}</strong></span>
// //                 <button type="button" onClick={() => setSelectedUser(null)} className="text-[10px] text-rose-400 hover:underline">বাতিল</button>
// //               </div>
// //               <div className="flex gap-2">
// //                 <input 
// //                   type="number" 
// //                   value={newCommission}
// //                   onChange={(e) => setNewCommission(e.target.value)}
// //                   placeholder="নতুন কমিশন পার্সেন্টেজ"
// //                   required
// //                   min="0"
// //                   max="100"
// //                   className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
// //                 />
// //                 <button 
// //                   type="submit"
// //                   className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
// //                 >
// //                   সেভ করুন
// //                 </button>
// //               </div>
// //             </form>
// //           )}
// //         </div>

// //       </div>

// //     </div>
// //   );
// // }


// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function AdminReferralPage() {
//   const [globalRate, setGlobalRate] = useState(10);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchedUsers, setSearchedUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [newCommission, setNewCommission] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState({ show: false, text: '', success: true });

//   const [confirmModal, setConfirmModal] = useState({ show: false, uid: null, rate: null, name: '' });
//   const [rateConfirm, setRateConfirm] = useState({ show: false, rate: null });

//   const router = useRouter();

//   const showToast = (text, success = true) => {
//     setToast({ show: true, text, success });
//     setTimeout(() => {
//       setToast({ show: false, text: '', success: false });
//     }, 3500);
//   };

//   useEffect(() => {
//     fetchGlobalRate();
//   }, []);

//   const fetchGlobalRate = async () => {
//     try {
//       const res = await fetch('/api/admin/settings/referral-rate');
//       const contentType = res.headers.get("content-type");
//       if (!res.ok || !contentType || !contentType.includes("application/json")) return;
//       const data = await res.json();
//       if (data.success) setGlobalRate(data.percentage);
//     } catch (err) { console.error(err); }
//   };

//   const openRateConfirm = (e) => {
//     e.preventDefault();
//     if (globalRate === '' || globalRate === null || globalRate === undefined) {
//       showToast('পার্সেন্টেজ দিন!', false); return;
//     }
//     setRateConfirm({ show: true, rate: Number(globalRate) });
//   };

//   const handleUpdateGlobalRate = async () => {
//     const rate = rateConfirm.rate;
//     setRateConfirm({ show: false, rate: null });
//     setLoading(true);
//     try {
//       const res = await fetch('/api/admin/settings/referral-rate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ percentage: rate })
//       });
//       const contentType = res.headers.get("content-type");
//       if (!res.ok || !contentType || !contentType.includes("application/json")) {
//         showToast('সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি।', false); return;
//       }
//       const data = await res.json();
//       if (data.success) showToast('ডিফল্ট রেফারেল পার্সেন্টেজ সফলভাবে আপডেট করা হয়েছে!', true);
//       else showToast(data.message || 'আপডেট ব্যর্থ হয়েছে।', false);
//     } catch (err) {
//       showToast('সার্ভারে সমস্যা হয়েছে।', false);
//     } finally { setLoading(false); }
//   };

//   const handleSearchUser = async (e) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) return;
//     try {
//       const res = await fetch(`/api/admin/users?search=${searchQuery}`);
//       const contentType = res.headers.get("content-type");
//       if (!res.ok || !contentType || !contentType.includes("application/json")) return;
//       const data = await res.json();
//       if (data.success) {
//         setSearchedUsers(data.users || []);
//         if (data.users.length === 0) showToast('কোনো ইউজার পাওয়া যায়নি।', false);
//       }
//     } catch (err) { showToast('সার্চ করতে সমস্যা হয়েছে।', false); }
//   };

//   const openCommissionConfirm = (e) => {
//     e.preventDefault();
//     if (!selectedUser) return;
//     if (newCommission === '' || newCommission === null || newCommission === undefined) {
//       showToast('কমিশন পার্সেন্টেজ দিন!', false); return;
//     }
//     setConfirmModal({
//       show: true,
//       uid: selectedUser.uid,
//       rate: Number(newCommission),
//       name: selectedUser.name || selectedUser.uid
//     });
//   };

//   const handleUpdateUserCommission = async () => {
//     const { uid, rate } = confirmModal;
//     setConfirmModal({ show: false, uid: null, rate: null, name: '' });
//     try {
//       const res = await fetch('/api/admin/users/update-commission', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ uid, commissionRate: rate })
//       });
//       const contentType = res.headers.get("content-type");
//       if (!res.ok || !contentType || !contentType.includes("application/json")) {
//         showToast('সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি।', false); return;
//       }
//       const data = await res.json();
//       if (data.success) {
//         showToast('ইউজারের কমিশন সফলভাবে আপডেট করা হয়েছে!', true);
//         setSelectedUser(null); setNewCommission('');
//         setSearchedUsers([]); setSearchQuery('');
//       } else showToast(data.message || 'কমিশন আপডেট ব্যর্থ হয়েছে।', false);
//     } catch (err) { showToast('সার্ভারে সমস্যা হয়েছে।', false); }
//   };

//   return (
//     <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-5 sm:space-y-8 text-white min-h-screen bg-[#07090e] relative">

//       {/* ---------- Toast (মাঝখানে, স্ক্রিনের ভেতরে ফিট) ---------- */}
//       {toast.show && (
//         <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none px-4">
//           <div className={`w-fit max-w-[85vw] sm:max-w-sm px-4 py-3 rounded-2xl shadow-2xl text-[11px] leading-snug sm:text-sm font-bold text-center border flex items-center justify-center gap-2 ${
//             toast.success
//               ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/50 backdrop-blur-md'
//               : 'bg-rose-950/95 text-rose-300 border-rose-500/50 backdrop-blur-md'
//           }`}>
//             <span className="shrink-0">{toast.success ? '✅' : '⚠️'}</span>
//             <span className="break-words">{toast.text}</span>
//           </div>
//         </div>
//       )}

//       {/* ---------- গ্লোবাল রেট Confirmation Modal ---------- */}
//       {rateConfirm.show && (
//         <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/70 backdrop-blur-sm px-4">
//           <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm text-center shadow-[0_20px_80px_-10px_rgba(16,185,129,0.3)]">
//             <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
//               <i className="fa-solid fa-percent text-emerald-400 text-xl"></i>
//             </div>
//             <h3 className="text-sm sm:text-base font-bold text-white mb-2">গ্লোবাল রেট আপডেট নিশ্চিত করুন</h3>
//             <p className="text-xs text-slate-400 mb-5">
//               ডিফল্ট রেফারেল পার্সেন্টেজ <strong className="text-amber-400">{rateConfirm.rate}%</strong> করতে চান?
//             </p>
//             <div className="flex gap-2">
//               <button onClick={() => setRateConfirm({ show: false, rate: null })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition">না</button>
//               <button onClick={handleUpdateGlobalRate} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-emerald-950/50">হ্যাঁ, আপডেট</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ---------- ইউজার কমিশন Confirmation Modal ---------- */}
//       {confirmModal.show && (
//         <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/70 backdrop-blur-sm px-4">
//           <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm text-center shadow-[0_20px_80px_-10px_rgba(16,185,129,0.3)]">
//             <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
//               <i className="fa-solid fa-user-pen text-emerald-400 text-xl"></i>
//             </div>
//             <h3 className="text-sm sm:text-base font-bold text-white mb-2">কমিশন আপডেট নিশ্চিত করুন</h3>
//             <p className="text-xs text-slate-400 mb-5">
//               <strong className="text-emerald-400">{confirmModal.name}</strong> এর কমিশন <strong className="text-amber-400">{confirmModal.rate}%</strong> করতে চান?
//             </p>
//             <div className="flex gap-2">
//               <button onClick={() => setConfirmModal({ show: false, uid: null, rate: null, name: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition">না</button>
//               <button onClick={handleUpdateUserCommission} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-emerald-950/50">হ্যাঁ, আপডেট</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* হেডার */}
//       <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500/20 shadow-[0_10px_40px_-15px_rgba(16,185,129,0.3)]">
//         <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
//         <div className="relative z-10">
//           <h1 className="text-base sm:text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">রেফারেল ও কমিশন অ্যাডমিন প্যানেল</h1>
//           <p className="text-[11px] sm:text-xs text-slate-400 mt-1">গ্লোবাল কমিশন রেট, উইথড্র রিকোয়েস্ট এবং ইউজার স্পেশাল কমিশন ম্যানেজ করুন।</p>
//         </div>
//         <button onClick={() => router.back()} className="relative z-10 text-xs bg-slate-800/80 hover:bg-slate-700 backdrop-blur px-4 py-2 rounded-xl text-slate-300 transition cursor-pointer self-start sm:self-auto border border-slate-700">
//           <i className="fa-solid fa-arrow-left mr-1"></i> ফিরে যান
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
//         {/* গ্লোবাল রেট */}
//         <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] space-y-4 flex flex-col justify-between">
//           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
//                 <i className="fa-solid fa-percent text-emerald-400 text-xs"></i>
//               </div>
//               <h2 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">গ্লোবাল রেট</h2>
//             </div>
//             <p className="text-[11px] sm:text-xs text-slate-400">সকল নতুন বা সাধারণ ইউজারের জন্য ডিফল্ট কমিশন রেট সেট করুন।</p>
//           </div>
//           <form onSubmit={openRateConfirm} className="space-y-4 pt-4">
//             <div>
//               <label className="text-xs text-slate-400 block mb-1">পার্সেন্টেজ (%)</label>
//               <input type="number" value={globalRate} onChange={(e) => setGlobalRate(e.target.value)} required min="0" max="100"
//                 className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-lg text-amber-400 font-bold font-mono text-center focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition" />
//             </div>
//             <button type="submit" disabled={loading}
//               className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-950/50 disabled:opacity-50">
//               {loading ? 'আপডেট হচ্ছে...' : 'রেট সেভ করুন'}
//             </button>
//           </form>
//         </div>

//         {/* ইউজার কাস্টম কমিশন */}
//         <div className="relative overflow-hidden md:col-span-2 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] space-y-4">
//           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
//                 <i className="fa-solid fa-user-pen text-teal-400 text-xs"></i>
//               </div>
//               <h2 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">ইউজার কাস্টম কমিশন</h2>
//             </div>
//             <p className="text-[11px] sm:text-xs text-slate-400">ইউজার আইডি বা মোবাইল নম্বর দিয়ে সার্চ করে নির্দিষ্ট ইউজারের কমিশন পরিবর্তন করুন।</p>
//           </div>

//           <form onSubmit={handleSearchUser} className="flex flex-col sm:flex-row gap-2">
//             <div className="relative w-full">
//               <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
//               <input type="text" placeholder="ইউজার আইডি (UID) বা ফোন নম্বর..." value={searchQuery}
//                 onChange={(e) => { if (e.target.value.length <= 11) setSearchQuery(e.target.value); }}
//                 maxLength={11}
//                 className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono transition" />
//             </div>
//             <button type="submit" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border border-slate-700 hover:border-emerald-500/30">
//               সার্চ করুন
//             </button>
//           </form>

//           {searchedUsers.length > 0 && !selectedUser && (
//             <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
//               {searchedUsers.map((u) => (
//                 <div key={u._id || u.uid} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-950 hover:bg-slate-900/80 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition">
//                   <div className="flex items-start gap-3">
//                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
//                       {(u.name || u.uid || '?').charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                       <p className="text-xs font-bold text-white">{u.name || 'নামবিহীন ইউজার'}</p>
//                       <p className="text-[10px] text-slate-400 font-mono mt-0.5">UID: {u.uid} | ফোন: {u.phone || 'N/A'}</p>
//                       <p className="text-[10px] text-amber-400 font-medium mt-0.5">
//                         বর্তমান কমিশন: <strong>{u.customCommission !== null && u.customCommission !== undefined ? u.customCommission : globalRate}%</strong>
//                       </p>
//                     </div>
//                   </div>
//                   <button onClick={() => { setSelectedUser(u); setNewCommission(u.customCommission !== null && u.customCommission !== undefined ? u.customCommission : globalRate); }}
//                     className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border border-emerald-500/30 self-start sm:self-auto whitespace-nowrap">
//                     <i className="fa-solid fa-pen-to-square mr-1"></i> এডিট
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {selectedUser && (
//             <form onSubmit={openCommissionConfirm} className="relative overflow-hidden bg-gradient-to-b from-emerald-950/40 to-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3 mt-3 shadow-[0_10px_40px_-15px_rgba(16,185,129,0.4)]">
//               <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
//               <div className="flex flex-wrap justify-between items-center gap-2">
//                 <div className="flex items-center gap-2">
//                   <i className="fa-solid fa-user-check text-emerald-400 text-xs"></i>
//                   <span className="text-xs text-slate-300">সিলেক্টেড: <strong className="text-emerald-400">{selectedUser.name || selectedUser.uid}</strong></span>
//                 </div>
//                 <button type="button" onClick={() => setSelectedUser(null)} className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline transition">
//                   <i className="fa-solid fa-xmark mr-1"></i> বাতিল
//                 </button>
//               </div>
//               <div className="flex flex-col sm:flex-row gap-2">
//                 <input type="number" value={newCommission} onChange={(e) => setNewCommission(e.target.value)} placeholder="নতুন কমিশন পার্সেন্টেজ" required min="0" max="100"
//                   className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition" />
//                 <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shadow-lg shadow-emerald-950/50">
//                   <i className="fa-solid fa-floppy-disk mr-1"></i> সেভ
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// ............................................................................

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminReferralPage() {
  const [globalRate, setGlobalRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newCommission, setNewCommission] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, text: '', success: true });

  const [confirmModal, setConfirmModal] = useState({ show: false, uid: null, rate: null, name: '' });
  const [rateConfirm, setRateConfirm] = useState({ show: false, rate: null });

  const router = useRouter();

  const showToast = (text, success = true) => {
    setToast({ show: true, text, success });
    setTimeout(() => {
      setToast({ show: false, text: '', success: false });
    }, 3500);
  };

  useEffect(() => {
    fetchGlobalRate();
  }, []);

  const fetchGlobalRate = async () => {
    try {
      setRateLoading(true);
      const res = await fetch('/api/admin/settings/referral-rate');
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        setGlobalRate(10); // fallback
        return;
      }
      const data = await res.json();
      if (data.success && data.percentage !== undefined && data.percentage !== null) {
        setGlobalRate(data.percentage);
      } else {
        setGlobalRate(10); // fallback
      }
    } catch (err) {
      console.error(err);
      setGlobalRate(10); // fallback
    } finally {
      setRateLoading(false);
    }
  };

  const openRateConfirm = (e) => {
    e.preventDefault();
    if (globalRate === '' || globalRate === null || globalRate === undefined) {
      showToast('পার্সেন্টেজ দিন!', false); return;
    }
    setRateConfirm({ show: true, rate: Number(globalRate) });
  };

  const handleUpdateGlobalRate = async () => {
    const rate = rateConfirm.rate;
    setRateConfirm({ show: false, rate: null });
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings/referral-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage: rate })
      });
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        showToast('সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি।', false); return;
      }
      const data = await res.json();
      if (data.success) showToast('ডিফল্ট রেফারেল পার্সেন্টেজ সফলভাবে আপডেট করা হয়েছে!', true);
      else showToast(data.message || 'আপডেট ব্যর্থ হয়েছে।', false);
    } catch (err) {
      showToast('সার্ভারে সমস্যা হয়েছে।', false);
    } finally { setLoading(false); }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/admin/users?search=${searchQuery}`);
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) return;
      const data = await res.json();
      if (data.success) {
        setSearchedUsers(data.users || []);
        if (data.users.length === 0) showToast('কোনো ইউজার পাওয়া যায়নি।', false);
      }
    } catch (err) { showToast('সার্চ করতে সমস্যা হয়েছে।', false); }
  };

  const openCommissionConfirm = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newCommission === '' || newCommission === null || newCommission === undefined) {
      showToast('কমিশন পার্সেন্টেজ দিন!', false); return;
    }
    setConfirmModal({
      show: true,
      uid: selectedUser.uid,
      rate: Number(newCommission),
      name: selectedUser.name || selectedUser.uid
    });
  };

  const handleUpdateUserCommission = async () => {
    const { uid, rate } = confirmModal;
    setConfirmModal({ show: false, uid: null, rate: null, name: '' });
    try {
      const res = await fetch('/api/admin/users/update-commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, commissionRate: rate })
      });
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        showToast('সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি।', false); return;
      }
      const data = await res.json();
      if (data.success) {
        showToast('ইউজারের কমিশন সফলভাবে আপডেট করা হয়েছে!', true);
        setSelectedUser(null); setNewCommission('');
        setSearchedUsers([]); setSearchQuery('');
      } else showToast(data.message || 'কমিশন আপডেট ব্যর্থ হয়েছে।', false);
    } catch (err) { showToast('সার্ভারে সমস্যা হয়েছে।', false); }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-5 sm:space-y-8 text-white min-h-screen bg-[#07090e] relative">

      {/* ---------- Toast (মাঝখানে) ---------- */}
      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none px-4">
          <div className={`w-fit max-w-[85vw] sm:max-w-sm px-4 py-3 rounded-2xl shadow-2xl text-[11px] leading-snug sm:text-sm font-bold text-center border flex items-center justify-center gap-2 ${
            toast.success
              ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/50 backdrop-blur-md'
              : 'bg-rose-950/95 text-rose-300 border-rose-500/50 backdrop-blur-md'
          }`}>
            <span className="shrink-0">{toast.success ? '✅' : '⚠️'}</span>
            <span className="break-words">{toast.text}</span>
          </div>
        </div>
      )}

      {/* ---------- গ্লোবাল রেট Confirmation Modal ---------- */}
      {rateConfirm.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm text-center shadow-[0_20px_80px_-10px_rgba(16,185,129,0.3)]">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
              <i className="fa-solid fa-percent text-emerald-400 text-xl"></i>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-2">গ্লোবাল রেট আপডেট নিশ্চিত করুন</h3>
            <p className="text-xs text-slate-400 mb-5">
              ডিফল্ট রেফারেল পার্সেন্টেজ <strong className="text-amber-400">{rateConfirm.rate}%</strong> করতে চান?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setRateConfirm({ show: false, rate: null })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition">না</button>
              <button onClick={handleUpdateGlobalRate} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-emerald-950/50">হ্যাঁ, আপডেট</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ইউজার কমিশন Confirmation Modal ---------- */}
      {confirmModal.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm text-center shadow-[0_20px_80px_-10px_rgba(16,185,129,0.3)]">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
              <i className="fa-solid fa-user-pen text-emerald-400 text-xl"></i>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-2">কমিশন আপডেট নিশ্চিত করুন</h3>
            <p className="text-xs text-slate-400 mb-5">
              <strong className="text-emerald-400">{confirmModal.name}</strong> এর কমিশন <strong className="text-amber-400">{confirmModal.rate}%</strong> করতে চান?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmModal({ show: false, uid: null, rate: null, name: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition">না</button>
              <button onClick={handleUpdateUserCommission} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-emerald-950/50">হ্যাঁ, আপডেট</button>
            </div>
          </div>
        </div>
      )}

      {/* হেডার */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500/20 shadow-[0_10px_40px_-15px_rgba(16,185,129,0.3)]">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-base sm:text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">রেফারেল ও কমিশন অ্যাডমিন প্যানেল</h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">গ্লোবাল কমিশন রেট, উইথড্র রিকোয়েস্ট এবং ইউজার স্পেশাল কমিশন ম্যানেজ করুন।</p>
        </div>
        <button onClick={() => router.back()} className="relative z-10 text-xs bg-slate-800/80 hover:bg-slate-700 backdrop-blur px-4 py-2 rounded-xl text-slate-300 transition cursor-pointer self-start sm:self-auto border border-slate-700">
          <i className="fa-solid fa-arrow-left mr-1"></i> ফিরে যান
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* গ্লোবাল রেট */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] space-y-4 flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <i className="fa-solid fa-percent text-emerald-400 text-xs"></i>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">গ্লোবাল রেট</h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">সকল নতুন বা সাধারণ ইউজারের জন্য ডিফল্ট কমিশন রেট সেট করুন।</p>
          </div>
          <form onSubmit={openRateConfirm} className="space-y-4 pt-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">পার্সেন্টেজ (%)</label>
              <input 
                type="number" 
                value={globalRate ?? ''} 
                onChange={(e) => setGlobalRate(e.target.value)} 
                required 
                min="0" 
                max="100"
                placeholder={rateLoading ? 'লোড হচ্ছে...' : '10'}
                disabled={rateLoading}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-lg text-amber-400 font-bold font-mono text-center focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || rateLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'আপডেট হচ্ছে...' : rateLoading ? 'লোড হচ্ছে...' : 'রেট সেভ করুন'}
            </button>
          </form>
        </div>

        {/* ইউজার কাস্টম কমিশন */}
        <div className="relative overflow-hidden md:col-span-2 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] space-y-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <i className="fa-solid fa-user-pen text-teal-400 text-xs"></i>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">ইউজার কাস্টম কমিশন</h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">ইউজার আইডি বা মোবাইল নম্বর দিয়ে সার্চ করে নির্দিষ্ট ইউজারের কমিশন পরিবর্তন করুন।</p>
          </div>

          <form onSubmit={handleSearchUser} className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input type="text" placeholder="ইউজার আইডি (UID) বা ফোন নম্বর..." value={searchQuery}
                onChange={(e) => { if (e.target.value.length <= 11) setSearchQuery(e.target.value); }}
                maxLength={11}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono transition" />
            </div>
            <button type="submit" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border border-slate-700 hover:border-emerald-500/30">
              সার্চ করুন
            </button>
          </form>

          {searchedUsers.length > 0 && !selectedUser && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {searchedUsers.map((u) => (
                <div key={u._id || u.uid} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-950 hover:bg-slate-900/80 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                      {(u.name || u.uid || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{u.name || 'নামবিহীন ইউজার'}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">UID: {u.uid} | ফোন: {u.phone || 'N/A'}</p>
                      <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                        বর্তমান কমিশন: <strong>{u.customCommission !== null && u.customCommission !== undefined ? u.customCommission : (globalRate ?? 10)}%</strong>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedUser(u); setNewCommission(u.customCommission !== null && u.customCommission !== undefined ? u.customCommission : (globalRate ?? 10)); }}
                    className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border border-emerald-500/30 self-start sm:self-auto whitespace-nowrap">
                    <i className="fa-solid fa-pen-to-square mr-1"></i> এডিট
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedUser && (
            <form onSubmit={openCommissionConfirm} className="relative overflow-hidden bg-gradient-to-b from-emerald-950/40 to-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3 mt-3 shadow-[0_10px_40px_-15px_rgba(16,185,129,0.4)]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-emerald-400 text-xs"></i>
                  <span className="text-xs text-slate-300">সিলেক্টেড: <strong className="text-emerald-400">{selectedUser.name || selectedUser.uid}</strong></span>
                </div>
                <button type="button" onClick={() => setSelectedUser(null)} className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline transition">
                  <i className="fa-solid fa-xmark mr-1"></i> বাতিল
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="number" value={newCommission} onChange={(e) => setNewCommission(e.target.value)} placeholder="নতুন কমিশন পার্সেন্টেজ" required min="0" max="100"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition" />
                <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shadow-lg shadow-emerald-950/50">
                  <i className="fa-solid fa-floppy-disk mr-1"></i> সেভ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}