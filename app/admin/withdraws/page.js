// 'use client';
// import { useState, useEffect, useRef, useCallback } from 'react';

// export default function WithdrawManagementPage() {
//   const [withdraws, setWithdraws] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
//   // 🆕 Filter + Search state
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // 🎯 মডাল State
//   const [modal, setModal] = useState({ 
//     show: false, id: null, status: null, amount: 0, uid: '', note: ''
//   });
  
//   const [processing, setProcessing] = useState(false);
  
//   // 🎯 Debounce টাইমার
//   const debounceTimers = useRef({});

//   // ✅ useCallback — stable reference
//   const showToast = useCallback((message, type = 'success') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => {
//       setToast({ show: false, message: '', type: '' });
//     }, 3000);
//   }, []);

//   const formatDateTime = (timestamp) => {
//     if (!timestamp) return 'N/A';
    
//     let date;
//     if (typeof timestamp === 'object' && timestamp.seconds) {
//       date = new Date(timestamp.seconds * 1000);
//     } else {
//       date = new Date(timestamp);
//     }

//     if (isNaN(date.getTime())) return 'N/A';

//     return date.toLocaleString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const loadWithdraws = async () => {
//     try {
//       const res = await fetch('/api/admin/withdraws', {
//         credentials: 'include',
//         cache: 'no-store'
//       });

//       if (res.status === 401 || res.status === 403) {
//         showToast('অনুমোদিত নয়! দয়া করে আবার লগইন করুন।', 'error');
//         setLoading(false);
//         return;
//       }

//       const contentType = res.headers.get('content-type');
//       if (!contentType || !contentType.includes('application/json')) {
//         console.error('❌ API returned non-JSON');
//         showToast('সার্ভার ভুল রেসপন্স দিয়েছে!', 'error');
//         setLoading(false);
//         return;
//       }

//       const data = await res.json();

//       if (data.success) {
//         const sortedWithdraws = (data.withdraws || []).sort((a, b) => {
//           const getTime = (item) => {
//             if (item.createdAt) {
//               const t = new Date(item.createdAt).getTime();
//               if (!isNaN(t)) return t;
//             }
//             if (item._id) {
//               try {
//                 return parseInt(item._id.toString().substring(0, 8), 16) * 1000;
//               } catch (e) {
//                 return 0;
//               }
//             }
//             return 0;
//           };
//           return getTime(b) - getTime(a);
//         });

//         setWithdraws(sortedWithdraws);
//       }
//     } catch (err) {
//       console.error('❌ Fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadWithdraws();
//   }, []);

//   // ✅ Unmount-এ সব pending timer clear (memory leak প্রতিরোধ)
//   useEffect(() => {
//     return () => {
//       Object.values(debounceTimers.current).forEach((t) => clearTimeout(t));
//       debounceTimers.current = {};
//     };
//   }, []);

//   // 🎯 Debounced Note Save — ২ সেকেন্ড পরে অটো সেভ
//   const debouncedSaveNote = useCallback((id, note) => {
//     if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    
//     debounceTimers.current[id] = setTimeout(async () => {
//       const cleanNote = String(note || '').trim().slice(0, 200);
      
//       try {
//         const res = await fetch('/api/admin/withdraws', {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           credentials: 'include',
//           body: JSON.stringify({ withdrawId: id, adminNote: cleanNote })
//         });
        
//         const contentType = res.headers.get('content-type');
//         if (!contentType || !contentType.includes('application/json')) {
//           console.error('❌ API returned non-JSON');
//           return;
//         }
        
//         const data = await res.json();
//         if (data.success) {
//           showToast('✅ নোট অটো-সেভ হয়েছে!', 'success');
//         } else {
//           showToast(data.message || '❌ নোট সেভ হয়নি!', 'error');
//         }
//       } catch (err) {
//         console.error('❌ Auto-save error:', err);
//         showToast('❌ সেভ করতে সমস্যা!', 'error');
//       }
//     }, 2000);
//   }, [showToast]);

//   // 🎯 নোট পরিবর্তনের হ্যান্ডলার
//   const handleNoteChange = (id, value) => {
//     setWithdraws(prev => prev.map(w => 
//       w._id === id ? { ...w, adminNote: value } : w
//     ));
//     setModal(prev => 
//       prev.show && prev.id === id ? { ...prev, note: value } : prev
//     );
//     debouncedSaveNote(id, value);
//   };

//   // 🎯 মডাল খোলা
//   const openModal = (id, status) => {
//     const item = withdraws.find(w => w._id === id);
//     setModal({
//       show: true,
//       id,
//       status,
//       amount: item?.amount || 0,
//       uid: item?.uid || item?.userId || 'N/A',
//       note: item?.adminNote || ''
//     });
//   };

//   const closeModal = () => {
//     if (processing) return;
//     setModal({ show: false, id: null, status: null, amount: 0, uid: '', note: '' });
//   };

//   // 🎯 কনফার্ম/বাতিল
//   const executeUpdate = async () => {
//     if (!modal.id || !modal.status) return;
//     if (processing) return;

//     setProcessing(true);

//     try {
//       const requestBody = { 
//         withdrawId: modal.id, 
//         status: modal.status,
//         adminNote: String(modal.note || '').trim().slice(0, 200)
//       };
      
//       const res = await fetch('/api/admin/withdraws', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify(requestBody)
//       });
      
//       const contentType = res.headers.get('content-type');
//       if (!contentType || !contentType.includes('application/json')) {
//         showToast('সার্ভার ভুল রেসপন্স দিয়েছে!', 'error');
//         return;
//       }
      
//       const data = await res.json();
//       if (data.success) {
//         showToast(
//           modal.status === 'approved' 
//             ? '✅ উইথড্র সফলভাবে কনফার্ম করা হয়েছে!' 
//             : modal.status === 'rejected'
//             ? '❌ উইথড্র সফলভাবে বাতিল করা হয়েছে!'
//             : '✅ নোট সেভ করা হয়েছে!', 
//           modal.status === 'rejected' ? 'error' : 'success'
//         );
//         setModal({ show: false, id: null, status: null, amount: 0, uid: '', note: '' });
//         loadWithdraws();
//       } else {
//         showToast(data.message || 'কিছু সমস্যা হয়েছে!', 'error');
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('সার্ভার এরর!', 'error');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // 🆕 Filter + Search একসাথে
//   const filteredWithdraws = withdraws.filter(w => {
//     if (statusFilter !== 'all' && w.status !== statusFilter) return false;

//     if (searchQuery.trim()) {
//       const search = searchQuery.trim().toLowerCase();
//       return (
//         w.uid?.toLowerCase().includes(search) ||
//         w.accountNumber?.toLowerCase().includes(search) ||
//         w.method?.toLowerCase().includes(search) ||
//         String(w.amount).includes(search)
//       );
//     }

//     return true;
//   });

//   const countByStatus = (status) => {
//     if (status === 'all') return withdraws.length;
//     return withdraws.filter(w => w.status === status).length;
//   };

//   const filterBtnClass = (filterValue) => {
//     const isActive = statusFilter === filterValue;
//     return `px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
//       isActive
//         ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
//         : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
//     }`;
//   };

//   if (loading) return <div className="p-8 text-white bg-gray-950 min-h-screen">লোড হচ্ছে...</div>;

//   return (
//     <div className="p-8 text-white bg-gray-950 min-h-screen relative">
      
//       {toast.show && (
//         <div 
//           className={`fixed z-[60] px-5 py-3 rounded-xl text-sm font-bold shadow-2xl transition-all ${
//             toast.type === 'success' 
//               ? 'bg-emerald-600 text-white border border-emerald-400' 
//               : 'bg-rose-600 text-white border border-rose-400'
//           }`}
//           style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
//         >
//           {toast.message}
//         </div>
//       )}

//       <h1 className="text-2xl font-bold mb-6">উইথড্র ম্যানেজমেন্ট</h1>

//       <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 mb-4">
//         <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-1">
//           🔍 ইউজার / অ্যাকাউন্ট / পরিমাণ খুঁজুন
//         </p>
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="UID, Account Number অথবা Amount..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-emerald-500 transition-all pr-10"
//           />
//           {searchQuery && (
//             <button
//               onClick={() => setSearchQuery('')}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-800 transition-all"
//             >
//               ✕
//             </button>
//           )}
//         </div>
//         {searchQuery && (
//           <p className="text-[10px] text-emerald-400 mt-2 px-1 font-semibold">
//             🔍 "{searchQuery}" → {filteredWithdraws.length} টি ফলাফল
//           </p>
//         )}
//       </div>

//       <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 mb-5">
//         <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-1">ফিল্টার করুন</p>
//         <div className="flex flex-wrap gap-2">
//           <button onClick={() => setStatusFilter('all')} className={filterBtnClass('all')}>
//             📋 সব ({countByStatus('all')})
//           </button>
//           <button onClick={() => setStatusFilter('approved')} className={filterBtnClass('approved')}>
//             ✅ সফল ({countByStatus('approved')})
//           </button>
//           <button onClick={() => setStatusFilter('pending')} className={filterBtnClass('pending')}>
//             ⏳ পেন্ডিং ({countByStatus('pending')})
//           </button>
//           <button onClick={() => setStatusFilter('rejected')} className={filterBtnClass('rejected')}>
//             ❌ ব্যর্থ ({countByStatus('rejected')})
//           </button>
//         </div>
//       </div>
      
//       <div className="space-y-4">
//         {filteredWithdraws.length === 0 ? (
//           <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
//             <div className="text-5xl mb-3">📭</div>
//             <p className="text-gray-400 text-sm">
//               {searchQuery 
//                 ? `"${searchQuery}" দিয়ে কোনো ফলাফল পাওয়া যায়নি`
//                 : statusFilter === 'all' 
//                 ? 'কোনো রিকোয়েস্ট নেই' 
//                 : `"${statusFilter}" স্ট্যাটাসে কোনো রিকোয়েস্ট নেই`}
//             </p>
//           </div>
//         ) : (
//           filteredWithdraws.map((item) => {
//             const isPending = !item.status || item.status === 'pending';
//             const isCrypto = item.originalCurrency === 'USD';
//             const isReferral = item.walletType === 'referral';

//             return (
//               <div 
//                 key={item._id} 
//                 className={`p-4 bg-gray-900 border rounded-xl space-y-3 ${
//                   isReferral 
//                     ? 'border-amber-500/30' 
//                     : 'border-blue-500/20'
//                 }`}
//               >
                
//                 <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  
//                   <div className="space-y-1.5 flex-1">
//                     {/* ✅ Amount + Wallet Type badges */}
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <p className={`font-bold text-lg ${
//                         isCrypto ? 'text-blue-400' : 'text-rose-400'
//                       }`}>
//                         পরিমাণ: {isCrypto ? `$${item.amount}` : `৳${item.amount}`}
//                       </p>

//                       {/* 🎁 Referral / 💰 Main */}
//                       {isReferral ? (
//                         <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
//                           🎁 রেফারেল
//                         </span>
//                       ) : (
//                         <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/30">
//                           💰 মেইন
//                         </span>
//                       )}

//                       {/* 💎 Crypto badge */}
//                       {isCrypto && (
//                         <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
//                           💎 CRYPTO
//                         </span>
//                       )}
//                     </div>
                    
//                     <p className="text-sm text-gray-400">
//                       <span className="text-gray-500">ইউজার:</span> {item.uid || item.userId || 'N/A'}
//                     </p>

//                     <p className="text-xs text-gray-300">
//                       <span className="text-gray-500">মেথড:</span>{' '}
//                       <span className="text-amber-400 font-semibold">{item.method || 'N/A'}</span>{' '}
//                       <span className="text-gray-400 font-mono">({item.accountNumber || 'N/A'})</span>
//                     </p>

//                     {/* Crypto হলে কত ৳ কেটেছে + rate */}
//                     {isCrypto && item.deductedBDT > 0 && (
//                       <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2.5 space-y-1 mt-1.5">
//                         <p className="text-[11px] text-slate-400">
//                           <span className="text-slate-500">ব্যালেন্স থেকে কেটেছে:</span>{' '}
//                           <span className="font-mono text-rose-400 font-bold">৳{item.deductedBDT}</span>
//                         </p>
//                         {item.exchangeRate && (
//                           <p className="text-[11px] text-slate-400">
//                             <span className="text-slate-500">রেট:</span>{' '}
//                             <span className="font-mono text-slate-300">$1 = ৳{item.exchangeRate}</span>
//                           </p>
//                         )}
//                       </div>
//                     )}

//                     <p className="text-xs text-slate-500 font-mono">
//                       🕐 {formatDateTime(item.createdAt || item.date || item.timestamp)}
//                     </p>

//                     <p className={`text-xs font-bold inline-block px-2 py-1 rounded mt-1 ${
//                       item.status === 'approved' 
//                         ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
//                         : item.status === 'rejected' 
//                         ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
//                         : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
//                     }`}>
//                       স্ট্যাটাস: {item.status || 'pending'}
//                     </p>

//                     {item.adminNote && (
//                       <p className="text-xs text-amber-400 mt-1 italic font-medium">
//                         <span className="font-bold">অ্যাডমিন নোট:</span> {item.adminNote}
//                       </p>
//                     )}
//                   </div>

//                   {isPending && (
//                     <div className="flex gap-2 flex-shrink-0">
//                       <button 
//                         onClick={() => openModal(item._id, 'approved')} 
//                         className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95"
//                       >
//                         ✅ কনফার্ম
//                       </button>
//                       <button 
//                         onClick={() => openModal(item._id, 'rejected')} 
//                         className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95"
//                       >
//                         ❌ বাতিল
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 <div className="pt-2 border-t border-gray-800/80">
//                   <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
//                     📝 অ্যাডমিন নোট (প্রয়োজনবোধে লিখুন — অটো সেভ হবে)
//                   </label>
//                   <input 
//                     type="text" 
//                     maxLength={200}
//                     value={item.adminNote || ''}
//                     onChange={(e) => handleNoteChange(item._id, e.target.value)}
//                     placeholder="নোট লিখুন... (২ সেকেন্ড পরে অটো সেভ হবে)"
//                     className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-rose-500 transition"
//                   />
//                 </div>

//               </div>
//             );
//           })
//         )}
//       </div>

//       {modal.show && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className={`bg-gradient-to-b from-slate-900 to-slate-950 border p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl ${
//             modal.status === 'approved' 
//               ? 'border-emerald-500/30 shadow-emerald-950/40' 
//               : modal.status === 'rejected'
//               ? 'border-rose-500/30 shadow-rose-950/40'
//               : 'border-blue-500/30 shadow-blue-950/40'
//           }`}>

//             <div className="flex flex-col items-center text-center space-y-3">
//               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${
//                 modal.status === 'approved' 
//                   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
//                   : modal.status === 'rejected'
//                   ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
//                   : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
//               }`}>
//                 {modal.status === 'approved' ? '✅' : modal.status === 'rejected' ? '❌' : '💾'}
//               </div>
              
//               <h3 className="text-base font-extrabold text-white">
//                 {modal.status === 'approved' 
//                   ? 'উইথড্র কনফার্ম নিশ্চিত করুন' 
//                   : modal.status === 'rejected'
//                   ? 'উইথড্র বাতিল নিশ্চিত করুন'
//                   : 'নোট সেভ নিশ্চিত করুন'}
//               </h3>
//             </div>

//             <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
//               <div className="flex justify-between text-xs">
//                 <span className="text-slate-500">পরিমাণ:</span>
//                 <span className="font-bold text-rose-400 font-mono">৳{modal.amount}</span>
//               </div>
//               <div className="flex justify-between text-xs">
//                 <span className="text-slate-500">ইউজার:</span>
//                 <span className="font-bold text-slate-300 font-mono">{modal.uid}</span>
//               </div>
//               <div className="flex justify-between text-xs">
//                 <span className="text-slate-500">স্ট্যাটাস:</span>
//                 <span className={`font-bold ${
//                   modal.status === 'approved' ? 'text-emerald-400' 
//                   : modal.status === 'rejected' ? 'text-rose-400' 
//                   : 'text-blue-400'
//                 }`}>
//                   {modal.status === 'approved' ? 'কনফার্ম' 
//                     : modal.status === 'rejected' ? 'বাতিল' 
//                     : 'নোট সেভ'}
//                 </span>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
//                 <span>📝</span> অ্যাডমিন নোট (ঐচ্ছিক)
//               </label>
//               <textarea 
//                 value={modal.note || ''}
//                 onChange={(e) => setModal({ ...modal, note: e.target.value })}
//                 placeholder="এখানে নোট লিখুন..."
//                 rows={3}
//                 maxLength={200}
//                 className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-white outline-none transition resize-none ${
//                   modal.status === 'approved' 
//                     ? 'border-slate-700 focus:border-emerald-500' 
//                     : modal.status === 'rejected'
//                     ? 'border-slate-700 focus:border-rose-500'
//                     : 'border-slate-700 focus:border-blue-500'
//                 }`}
//               />
//             </div>

//             <div className="flex gap-2 pt-1">
//               <button
//                 onClick={closeModal}
//                 disabled={processing}
//                 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
//               >
//                 না, বাতিল করুন
//               </button>
//               <button
//                 onClick={executeUpdate}
//                 disabled={processing}
//                 className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 ${
//                   modal.status === 'approved' 
//                     ? 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40' 
//                     : modal.status === 'rejected'
//                     ? 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-950/40'
//                     : 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40'
//                 }`}
//               >
//                 {processing ? (
//                   <>
//                     <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     প্রসেসিং...
//                   </>
//                 ) : (
//                   modal.status === 'approved' ? 'হ্যাঁ, কনফার্ম' 
//                     : modal.status === 'rejected' ? 'হ্যাঁ, বাতিল' 
//                     : 'হ্যাঁ, সেভ করুন'
//                 )}
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// ///////////////////////////////////////////////////

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function WithdrawManagementPage() {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // 🆕 Filter + Search state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🎯 মডাল State
  const [modal, setModal] = useState({ 
    show: false, id: null, status: null, amount: 0, uid: '', note: ''
  });
  
  const [processing, setProcessing] = useState(false);
  
  // 🎯 Debounce টাইমার
  const debounceTimers = useRef({});

  // ✅ useCallback — stable reference
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  }, []);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (typeof timestamp === 'object' && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // ✅ Copy to clipboard with feedback
  const handleCopy = (text) => {
    try {
      navigator.clipboard.writeText(text || '');
      showToast('✅ Address কপি হয়েছে!', 'success');
    } catch (err) {
      showToast('❌ কপি ব্যর্থ!', 'error');
    }
  };

  const loadWithdraws = async () => {
    try {
      const res = await fetch('/api/admin/withdraws', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (res.status === 401 || res.status === 403) {
        showToast('অনুমোদিত নয়! দয়া করে আবার লগইন করুন।', 'error');
        setLoading(false);
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ API returned non-JSON');
        showToast('সার্ভার ভুল রেসপন্স দিয়েছে!', 'error');
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        const sortedWithdraws = (data.withdraws || []).sort((a, b) => {
          const getTime = (item) => {
            if (item.createdAt) {
              const t = new Date(item.createdAt).getTime();
              if (!isNaN(t)) return t;
            }
            if (item._id) {
              try {
                return parseInt(item._id.toString().substring(0, 8), 16) * 1000;
              } catch (e) {
                return 0;
              }
            }
            return 0;
          };
          return getTime(b) - getTime(a);
        });

        setWithdraws(sortedWithdraws);
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdraws();
  }, []);

  // ✅ Unmount-এ সব pending timer clear (memory leak প্রতিরোধ)
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((t) => clearTimeout(t));
      debounceTimers.current = {};
    };
  }, []);

  // 🎯 Debounced Note Save — ২ সেকেন্ড পরে অটো সেভ
  const debouncedSaveNote = useCallback((id, note) => {
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    
    debounceTimers.current[id] = setTimeout(async () => {
      const cleanNote = String(note || '').trim().slice(0, 200);
      
      try {
        const res = await fetch('/api/admin/withdraws', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ withdrawId: id, adminNote: cleanNote })
        });
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('❌ API returned non-JSON');
          return;
        }
        
        const data = await res.json();
        if (data.success) {
          showToast('✅ নোট অটো-সেভ হয়েছে!', 'success');
        } else {
          showToast(data.message || '❌ নোট সেভ হয়নি!', 'error');
        }
      } catch (err) {
        console.error('❌ Auto-save error:', err);
        showToast('❌ সেভ করতে সমস্যা!', 'error');
      }
    }, 2000);
  }, [showToast]);

  // 🎯 নোট পরিবর্তনের হ্যান্ডলার
  const handleNoteChange = (id, value) => {
    setWithdraws(prev => prev.map(w => 
      w._id === id ? { ...w, adminNote: value } : w
    ));
    setModal(prev => 
      prev.show && prev.id === id ? { ...prev, note: value } : prev
    );
    debouncedSaveNote(id, value);
  };

  // 🎯 মডাল খোলা
  const openModal = (id, status) => {
    const item = withdraws.find(w => w._id === id);
    setModal({
      show: true,
      id,
      status,
      amount: item?.amount || 0,
      uid: item?.uid || item?.userId || 'N/A',
      note: item?.adminNote || ''
    });
  };

  const closeModal = () => {
    if (processing) return;
    setModal({ show: false, id: null, status: null, amount: 0, uid: '', note: '' });
  };

  // 🎯 কনফার্ম/বাতিল
  const executeUpdate = async () => {
    if (!modal.id || !modal.status) return;
    if (processing) return;

    setProcessing(true);

    try {
      const requestBody = { 
        withdrawId: modal.id, 
        status: modal.status,
        adminNote: String(modal.note || '').trim().slice(0, 200)
      };
      
      const res = await fetch('/api/admin/withdraws', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        showToast('সার্ভার ভুল রেসপন্স দিয়েছে!', 'error');
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        showToast(
          modal.status === 'approved' 
            ? '✅ উইথড্র সফলভাবে কনফার্ম করা হয়েছে!' 
            : modal.status === 'rejected'
            ? '❌ উইথড্র সফলভাবে বাতিল করা হয়েছে!'
            : '✅ নোট সেভ করা হয়েছে!', 
          modal.status === 'rejected' ? 'error' : 'success'
        );
        setModal({ show: false, id: null, status: null, amount: 0, uid: '', note: '' });
        loadWithdraws();
      } else {
        showToast(data.message || 'কিছু সমস্যা হয়েছে!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('সার্ভার এরর!', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // 🆕 Filter + Search একসাথে
  const filteredWithdraws = withdraws.filter(w => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const search = searchQuery.trim().toLowerCase();
      return (
        w.uid?.toLowerCase().includes(search) ||
        w.accountNumber?.toLowerCase().includes(search) ||
        w.method?.toLowerCase().includes(search) ||
        String(w.amount).includes(search)
      );
    }

    return true;
  });

  const countByStatus = (status) => {
    if (status === 'all') return withdraws.length;
    return withdraws.filter(w => w.status === status).length;
  };

  const filterBtnClass = (filterValue) => {
    const isActive = statusFilter === filterValue;
    return `px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
      isActive
        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
    }`;
  };

  if (loading) return <div className="p-8 text-white bg-gray-950 min-h-screen">লোড হচ্ছে...</div>;

  return (
    <div className="p-8 text-white bg-gray-950 min-h-screen relative">
      
      {toast.show && (
        <div 
          className={`fixed z-[60] px-5 py-3 rounded-xl text-sm font-bold shadow-2xl transition-all ${
            toast.type === 'success' 
              ? 'bg-emerald-600 text-white border border-emerald-400' 
              : 'bg-rose-600 text-white border border-rose-400'
          }`}
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">উইথড্র ম্যানেজমেন্ট</h1>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 mb-4">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-1">
          🔍 ইউজার / অ্যাকাউন্ট / পরিমাণ খুঁজুন
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="UID, Account Number অথবা Amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-emerald-500 transition-all pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-800 transition-all"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-[10px] text-emerald-400 mt-2 px-1 font-semibold">
            🔍 "{searchQuery}" → {filteredWithdraws.length} টি ফলাফল
          </p>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 mb-5">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-1">ফিল্টার করুন</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter('all')} className={filterBtnClass('all')}>
            📋 সব ({countByStatus('all')})
          </button>
          <button onClick={() => setStatusFilter('approved')} className={filterBtnClass('approved')}>
            ✅ সফল ({countByStatus('approved')})
          </button>
          <button onClick={() => setStatusFilter('pending')} className={filterBtnClass('pending')}>
            ⏳ পেন্ডিং ({countByStatus('pending')})
          </button>
          <button onClick={() => setStatusFilter('rejected')} className={filterBtnClass('rejected')}>
            ❌ ব্যর্থ ({countByStatus('rejected')})
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredWithdraws.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">
              {searchQuery 
                ? `"${searchQuery}" দিয়ে কোনো ফলাফল পাওয়া যায়নি`
                : statusFilter === 'all' 
                ? 'কোনো রিকোয়েস্ট নেই' 
                : `"${statusFilter}" স্ট্যাটাসে কোনো রিকোয়েস্ট নেই`}
            </p>
          </div>
        ) : (
          filteredWithdraws.map((item) => {
            const isPending = !item.status || item.status === 'pending';
            const isCrypto = item.originalCurrency === 'USD';
            const isReferral = item.walletType === 'referral';

            return (
              <div 
                key={item._id} 
                className={`p-4 bg-gray-900 border rounded-xl space-y-3 ${
                  isReferral 
                    ? 'border-amber-500/30' 
                    : 'border-blue-500/20'
                }`}
              >
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* ✅ Amount + Wallet Type badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-lg ${
                        isCrypto ? 'text-blue-400' : 'text-rose-400'
                      }`}>
                        পরিমাণ: {isCrypto ? `$${item.amount}` : `৳${item.amount}`}
                      </p>

                      {/* 🎁 Referral / 💰 Main */}
                      {isReferral ? (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                          🎁 রেফারেল
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/30">
                          💰 মেইন
                        </span>
                      )}

                      {/* 💎 Crypto badge */}
                      {isCrypto && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
                          💎 CRYPTO
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">ইউজার:</span> {item.uid || item.userId || 'N/A'}
                    </p>

                    {/* Method */}
                    <div className="text-xs text-gray-300">
                      <span className="text-gray-500">মেথড:</span>{' '}
                      <span className="text-amber-400 font-semibold">{item.method || 'N/A'}</span>
                    </div>

                    {/* ✅ Account Number / Wallet — Copy button সহ */}
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1 flex items-center gap-1">
                            {isCrypto ? (
                              <>
                                <span>💎</span>
                                <span>Wallet Address</span>
                              </>
                            ) : (
                              <>
                                <span>📱</span>
                                <span>Account Number</span>
                              </>
                            )}
                          </p>
                          <p className="text-[11px] md:text-xs font-mono text-slate-300 break-all leading-relaxed">
                            {item.accountNumber || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(item.accountNumber)}
                          className="flex-shrink-0 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white px-2.5 py-1.5 rounded text-[10px] font-bold transition active:scale-95 flex items-center gap-1"
                          title="Copy address"
                        >
                          <span>📋</span>
                          <span className="hidden md:inline">Copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Crypto হলে কত ৳ কেটেছে + rate */}
                    {isCrypto && item.deductedBDT > 0 && (
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2.5 space-y-1 mt-1.5">
                        <p className="text-[11px] text-slate-400">
                          <span className="text-slate-500">ব্যালেন্স থেকে কেটেছে:</span>{' '}
                          <span className="font-mono text-rose-400 font-bold">৳{item.deductedBDT}</span>
                        </p>
                        {item.exchangeRate && (
                          <p className="text-[11px] text-slate-400">
                            <span className="text-slate-500">রেট:</span>{' '}
                            <span className="font-mono text-slate-300">$1 = ৳{item.exchangeRate}</span>
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 font-mono">
                      🕐 {formatDateTime(item.createdAt || item.date || item.timestamp)}
                    </p>

                    <p className={`text-xs font-bold inline-block px-2 py-1 rounded mt-1 ${
                      item.status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : item.status === 'rejected' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      স্ট্যাটাস: {item.status || 'pending'}
                    </p>

                    {item.adminNote && (
                      <p className="text-xs text-amber-400 mt-1 italic font-medium">
                        <span className="font-bold">অ্যাডমিন নোট:</span> {item.adminNote}
                      </p>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={() => openModal(item._id, 'approved')} 
                        className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95"
                      >
                        ✅ কনফার্ম
                      </button>
                      <button 
                        onClick={() => openModal(item._id, 'rejected')} 
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95"
                      >
                        ❌ বাতিল
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-800/80">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
                    📝 অ্যাডমিন নোট (প্রয়োজনবোধে লিখুন — অটো সেভ হবে)
                  </label>
                  <input 
                    type="text" 
                    maxLength={200}
                    value={item.adminNote || ''}
                    onChange={(e) => handleNoteChange(item._id, e.target.value)}
                    placeholder="নোট লিখুন... (২ সেকেন্ড পরে অটো সেভ হবে)"
                    className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-rose-500 transition"
                  />
                </div>

              </div>
            );
          })
        )}
      </div>

      {modal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`bg-gradient-to-b from-slate-900 to-slate-950 border p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl ${
            modal.status === 'approved' 
              ? 'border-emerald-500/30 shadow-emerald-950/40' 
              : modal.status === 'rejected'
              ? 'border-rose-500/30 shadow-rose-950/40'
              : 'border-blue-500/30 shadow-blue-950/40'
          }`}>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${
                modal.status === 'approved' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : modal.status === 'rejected'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}>
                {modal.status === 'approved' ? '✅' : modal.status === 'rejected' ? '❌' : '💾'}
              </div>
              
              <h3 className="text-base font-extrabold text-white">
                {modal.status === 'approved' 
                  ? 'উইথড্র কনফার্ম নিশ্চিত করুন' 
                  : modal.status === 'rejected'
                  ? 'উইথড্র বাতিল নিশ্চিত করুন'
                  : 'নোট সেভ নিশ্চিত করুন'}
              </h3>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">পরিমাণ:</span>
                <span className="font-bold text-rose-400 font-mono">৳{modal.amount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">ইউজার:</span>
                <span className="font-bold text-slate-300 font-mono">{modal.uid}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">স্ট্যাটাস:</span>
                <span className={`font-bold ${
                  modal.status === 'approved' ? 'text-emerald-400' 
                  : modal.status === 'rejected' ? 'text-rose-400' 
                  : 'text-blue-400'
                }`}>
                  {modal.status === 'approved' ? 'কনফার্ম' 
                    : modal.status === 'rejected' ? 'বাতিল' 
                    : 'নোট সেভ'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <span>📝</span> অ্যাডমিন নোট (ঐচ্ছিক)
              </label>
              <textarea 
                value={modal.note || ''}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="এখানে নোট লিখুন..."
                rows={3}
                maxLength={200}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-white outline-none transition resize-none ${
                  modal.status === 'approved' 
                    ? 'border-slate-700 focus:border-emerald-500' 
                    : modal.status === 'rejected'
                    ? 'border-slate-700 focus:border-rose-500'
                    : 'border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={closeModal}
                disabled={processing}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                না, বাতিল করুন
              </button>
              <button
                onClick={executeUpdate}
                disabled={processing}
                className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 ${
                  modal.status === 'approved' 
                    ? 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40' 
                    : modal.status === 'rejected'
                    ? 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-950/40'
                    : 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40'
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    প্রসেসিং...
                  </>
                ) : (
                  modal.status === 'approved' ? 'হ্যাঁ, কনফার্ম' 
                    : modal.status === 'rejected' ? 'হ্যাঁ, বাতিল' 
                    : 'হ্যাঁ, সেভ করুন'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}