// // // 'use client';
// // // import { useState, useEffect } from 'react';

// // // export default function DepositManagementPage() {
// // //   const [deposits, setDeposits] = useState([]);
// // //   const [loading, setLoading] = useState(true);
  
// // //   // প্রতিটি ডিপোজিট কার্ডের নিজস্ব নোট ধরার জন্য স্টেট
// // //   const [notes, setNotes] = useState({});
  
// // //   // সুন্দর টোস্ট নোটিফিকেশনের জন্য স্টেট
// // //   const [toast, setToast] = useState({ show: false, message: '', type: '' });

// // //   const showToast = (message, type = 'success') => {
// // //     setToast({ show: true, message, type });
// // //     setTimeout(() => {
// // //       setToast({ show: false, message: '', type: '' });
// // //     }, 3000);
// // //   };

// // //   const loadDeposits = async () => {
// // //     try {
// // //       // HttpOnly কুকি ব্রাউজার স্বয়ংক্রিয়ভাবে পাস করবে
// // //       const res = await fetch('/api/admin/deposits');

// // //       if (res.status === 401 || res.status === 403) {
// // //         showToast('অনুমোদিত নয়! দয়া করে আবার লগইন করুন।', 'error');
// // //         setLoading(false);
// // //         return;
// // //       }

// // //       const data = await res.json();
// // //       if (data.success) {
// // //         // নতুন ডিপোজিট রেকর্ড সবসময় উপরে দেখানোর জন্য সর্টিং লজিক যুক্ত করা হলো
// // //         const sortedDeposits = (data.deposits || []).sort((a, b) => {
// // //           const timeA = new Date(a.createdAt || a.date || a.timestamp || 0).getTime();
// // //           const timeB = new Date(b.createdAt || b.date || b.timestamp || 0).getTime();
// // //           return timeB - timeA; // বড় টাইমস্ট্যাম্প (নতুন) সবার আগে আসবে
// // //         });
// // //         setDeposits(sortedDeposits);
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     loadDeposits();
// // //   }, []);

// // //   const handleUpdate = async (id, status) => {
// // //     try {
// // //       const adminNote = notes[id] || ''; // নির্দিষ্ট কার্ডের নোট নেওয়া হচ্ছে
      
// // //       const res = await fetch('/api/admin/deposits', {
// // //         method: 'PATCH',
// // //         headers: { 
// // //           'Content-Type': 'application/json'
// // //         },
// // //         body: JSON.stringify({ depositId: id, status, adminNote })
// // //       });
      
// // //       const data = await res.json();
// // //       if (data.success) {
// // //         showToast(status === 'approved' ? 'ডিপোজিট সফলভাবে কনফার্ম করা হয়েছে!' : 'ডিপোজিট সফলভাবে বাতিল করা হয়েছে!', status === 'approved' ? 'success' : 'error');
// // //         loadDeposits();
// // //       } else {
// // //         showToast(data.message || 'কিছু সমস্যা হয়েছে!', 'error');
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //       showToast('সার্ভার এরর!', 'error');
// // //     }
// // //   };

// // //   if (loading) return <div className="p-8 text-white bg-gray-950 min-h-screen">লোড হচ্ছে...</div>;

// // //   return (
// // //     <div className="p-8 text-white bg-gray-950 min-h-screen relative">
      
// // //       {/* টোস্ট নোটিফিকেশন পপআপ */}
// // //       {toast.show && (
// // //         <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl transition-all animate-bounce ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
// // //           {toast.message}
// // //         </div>
// // //       )}

// // //       <h1 className="text-2xl font-bold mb-6">ডিপোজিট ম্যানেজমেন্ট</h1>
      
// // //       <div className="space-y-4">
// // //         {deposits.length === 0 ? (
// // //           <p className="text-gray-400">কোনো রিকোয়েস্ট নেই</p>
// // //         ) : (
// // //           deposits.map((item) => (
// // //             <div key={item._id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
              
// // //               <div className="flex justify-between items-center">
// // //                 <div>
// // //                   <p className="font-bold text-emerald-400">পরিমাণ: ৳{item.amount}</p>
// // //                   <p className="text-sm text-gray-400">ইউজার: {item.uid || item.userId}</p>
// // //                   <p className="text-xs text-yellow-500">স্ট্যাটাস: {item.status || 'pending'}</p>
// // //                   {item.adminNote && <p className="text-xs text-slate-400 mt-1 italic">নোট: {item.adminNote}</p>}
// // //                 </div>

// // //                 {(!item.status || item.status === 'pending') && (
// // //                   <div className="space-x-2">
// // //                     <button onClick={() => handleUpdate(item._id, 'approved')} className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-xs font-bold transition">কনফার্ম</button>
// // //                     <button onClick={() => handleUpdate(item._id, 'rejected')} className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-xs font-bold transition">বাতিল</button>
// // //                   </div>
// // //                 )}
// // //               </div>

// // //               {/* পেন্ডিং অবস্থায় নোট লেখার ইনপুট ফিল্ড */}
// // //               {(!item.status || item.status === 'pending') && (
// // //                 <div className="pt-2 border-t border-gray-800/80">
// // //                   <input 
// // //                     type="text" 
// // //                     placeholder="নোট লিখুন (ঐচ্ছিক)..." 
// // //                     value={notes[item._id] || ''}
// // //                     onChange={(e) => setNotes({ ...notes, [item._id]: e.target.value })}
// // //                     className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-green-500 transition"
// // //                   />
// // //                 </div>
// // //               )}

// // //             </div>
// // //           ))
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // .................................................................................

// // // 'use client';
// // // import { useState, useEffect } from 'react';

// // // export default function DepositManagementPage() {
// // //   const [deposits, setDeposits] = useState([]);
// // //   const [loading, setLoading] = useState(true);
  
// // //   // প্রতিটি ডিপোজিট কার্ডের নিজস্ব নোট ধরার জন্য স্টেট
// // //   const [notes, setNotes] = useState({});
  
// // //   // সুন্দর টোস্ট নোটিফিকেশনের জন্য স্টেট
// // //   const [toast, setToast] = useState({ show: false, message: '', type: '' });

// // //   const showToast = (message, type = 'success') => {
// // //     setToast({ show: true, message, type });
// // //     setTimeout(() => {
// // //       setToast({ show: false, message: '', type: '' });
// // //     }, 3000);
// // //   };

// // //   const loadDeposits = async () => {
// // //     try {
// // //       const res = await fetch('/api/admin/deposits');

// // //       if (res.status === 401 || res.status === 403) {
// // //         showToast('অনুমোদিত নয়! দয়া করে আবার লগইন করুন।', 'error');
// // //         setLoading(false);
// // //         return;
// // //       }

// // //       const data = await res.json();
// // //       if (data.success) {
// // //         const sortedDeposits = (data.deposits || []).sort((a, b) => {
// // //           const timeA = new Date(a.createdAt || a.date || a.timestamp || 0).getTime();
// // //           const timeB = new Date(b.createdAt || b.date || b.timestamp || 0).getTime();
// // //           return timeB - timeA;
// // //         });
// // //         setDeposits(sortedDeposits);
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     loadDeposits();
// // //   }, []);

// // //   const handleUpdate = async (id, status) => {
// // //     try {
// // //       const adminNote = notes[id] || '';
      
// // //       const res = await fetch('/api/admin/deposits', {
// // //         method: 'PATCH',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ depositId: id, status, adminNote })
// // //       });
      
// // //       const data = await res.json();
// // //       if (data.success) {
// // //         showToast(
// // //           status === 'approved' ? 'ডিপোজিট সফলভাবে কনফার্ম করা হয়েছে!' : 'ডিপোজিট সফলভাবে বাতিল করা হয়েছে!', 
// // //           status === 'approved' ? 'success' : 'error'
// // //         );
// // //         loadDeposits();
// // //       } else {
// // //         showToast(data.message || 'কিছু সমস্যা হয়েছে!', 'error');
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //       showToast('সার্ভার এরর!', 'error');
// // //     }
// // //   };

// // //   // ডেট ও সময় ফরম্যাট করার ফাংশন
// // //   const formatDateTime = (timestamp) => {
// // //     if (!timestamp) return 'N/A';
    
// // //     let date;
// // //     if (typeof timestamp === 'object' && timestamp.seconds) {
// // //       date = new Date(timestamp.seconds * 1000);
// // //     } else {
// // //       date = new Date(timestamp);
// // //     }

// // //     if (isNaN(date.getTime())) return 'N/A';

// // //     return date.toLocaleString('en-GB', {
// // //       day: '2-digit',
// // //       month: 'short',
// // //       year: 'numeric',
// // //       hour: '2-digit',
// // //       minute: '2-digit',
// // //       hour12: true
// // //     });
// // //   };

// // //   if (loading) return <div className="p-8 text-white bg-gray-950 min-h-screen">লোড হচ্ছে...</div>;

// // //   return (
// // //     <div className="p-8 text-white bg-gray-950 min-h-screen relative">
      
// // //       {/* টোস্ট নোটিফিকেশন পপআপ */}
// // //       {toast.show && (
// // //         <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl transition-all animate-bounce ${
// // //           toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
// // //         }`}>
// // //           {toast.message}
// // //         </div>
// // //       )}

// // //       <h1 className="text-2xl font-bold mb-6">ডিপোজিট ম্যানেজমেন্ট</h1>
      
// // //       <div className="space-y-4">
// // //         {deposits.length === 0 ? (
// // //           <p className="text-gray-400">কোনো রিকোয়েস্ট নেই</p>
// // //         ) : (
// // //           deposits.map((item) => (
// // //             <div key={item._id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
              
// // //               <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                
// // //                 {/* বাম দিকের তথ্য */}
// // //                 <div className="space-y-1.5 flex-1">
// // //                   <p className="font-bold text-emerald-400 text-lg">পরিমাণ: ৳{item.amount}</p>
                  
// // //                   {/* ✅ ইউজার UID */}
// // //                   <p className="text-sm text-gray-400">
// // //                     <span className="text-gray-500">ইউজার:</span> {item.uid || item.userId || 'N/A'}
// // //                   </p>

// // //                   {/* ✅ Transaction ID */}
// // //                   <p className="text-sm">
// // //                     <span className="text-gray-500">ট্রানজেকশন ID:</span>{' '}
// // //                     <span className="font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
// // //                       {item.transactionId || 'N/A'}
// // //                     </span>
// // //                   </p>

// // //                   {/* ✅ পেমেন্ট মেথড */}
// // //                   <p className="text-sm text-gray-400">
// // //                     <span className="text-gray-500">মেথড:</span>{' '}
// // //                     <span className="text-purple-400 font-semibold">{item.method || 'N/A'}</span>
// // //                   </p>

// // //                   {/* ✅ তারিখ ও সময় */}
// // //                   <p className="text-xs text-slate-500 font-mono">
// // //                     {formatDateTime(item.createdAt || item.date || item.timestamp)}
// // //                   </p>

// // //                   {/* ✅ স্ট্যাটাস */}
// // //                   <p className={`text-xs font-bold inline-block px-2 py-1 rounded ${
// // //                     item.status === 'approved' 
// // //                       ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
// // //                       : item.status === 'rejected' 
// // //                       ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
// // //                       : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
// // //                   }`}>
// // //                     স্ট্যাটাস: {item.status || 'pending'}
// // //                   </p>

// // //                   {/* অ্যাডমিন নোট (যদি থাকে) */}
// // //                   {item.adminNote && (
// // //                     <p className="text-xs text-slate-400 mt-1 italic">
// // //                       <span className="font-bold text-amber-400">অ্যাডমিন নোট:</span> {item.adminNote}
// // //                     </p>
// // //                   )}
// // //                 </div>

// // //                 {/* ডান দিকের অ্যাকশন বাটন */}
// // //                 {(!item.status || item.status === 'pending') && (
// // //                   <div className="flex gap-2 flex-shrink-0">
// // //                     <button 
// // //                       onClick={() => handleUpdate(item._id, 'approved')} 
// // //                       className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95"
// // //                     >
// // //                       ✅ কনফার্ম
// // //                     </button>
// // //                     <button 
// // //                       onClick={() => handleUpdate(item._id, 'rejected')} 
// // //                       className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95"
// // //                     >
// // //                       ❌ বাতিল
// // //                     </button>
// // //                   </div>
// // //                 )}
// // //               </div>

// // //               {/* পেন্ডিং অবস্থায় নোট লেখার ইনপুট ফিল্ড */}
// // //               {(!item.status || item.status === 'pending') && (
// // //                 <div className="pt-2 border-t border-gray-800/80">
// // //                   <input 
// // //                     type="text" 
// // //                     placeholder="নোট লিখুন (ঐচ্ছিক)..." 
// // //                     value={notes[item._id] || ''}
// // //                     onChange={(e) => setNotes({ ...notes, [item._id]: e.target.value })}
// // //                     className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-green-500 transition"
// // //                   />
// // //                 </div>
// // //               )}

// // //             </div>
// // //           ))
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // .............................................................................
// // // 'use client';
// // // import { useState, useEffect, useRef } from 'react';

// // // export default function DepositManagementPage() {
// // //   const [deposits, setDeposits] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
// // //   // 🎯 মডাল State — এখন modalNote যোগ করা হয়েছে
// // //   const [modal, setModal] = useState({ 
// // //     show: false, 
// // //     id: null, 
// // //     status: null, 
// // //     amount: 0, 
// // //     uid: '',
// // //     transactionId: '',
// // //     note: '' // 🆕 মডালের ভেতরে নোট
// // //   });
  
// // //   const [processing, setProcessing] = useState(false);
// // //   const inputRefs = useRef({});

// // //   const showToast = (message, type = 'success') => {
// // //     setToast({ show: true, message, type });
// // //     setTimeout(() => {
// // //       setToast({ show: false, message: '', type: '' });
// // //     }, 3000);
// // //   };

// // //   const formatDateTime = (timestamp) => {
// // //     if (!timestamp) return 'N/A';
    
// // //     let date;
// // //     if (typeof timestamp === 'object' && timestamp.seconds) {
// // //       date = new Date(timestamp.seconds * 1000);
// // //     } else {
// // //       date = new Date(timestamp);
// // //     }

// // //     if (isNaN(date.getTime())) return 'N/A';

// // //     return date.toLocaleString('en-GB', {
// // //       day: '2-digit',
// // //       month: 'short',
// // //       year: 'numeric',
// // //       hour: '2-digit',
// // //       minute: '2-digit',
// // //       hour12: true
// // //     });
// // //   };

// // //   const loadDeposits = async () => {
// // //     try {
// // //       const res = await fetch('/api/admin/deposits');

// // //       if (res.status === 401 || res.status === 403) {
// // //         showToast('অনুমোদিত নয়! দয়া করে আবার লগইন করুন।', 'error');
// // //         setLoading(false);
// // //         return;
// // //       }

// // //       const data = await res.json();
// // //       if (data.success) {
// // //         const sortedDeposits = (data.deposits || []).sort((a, b) => {
// // //           const timeA = new Date(a.createdAt || a.date || a.timestamp || 0).getTime();
// // //           const timeB = new Date(b.createdAt || b.date || b.timestamp || 0).getTime();
// // //           return timeB - timeA;
// // //         });
// // //         setDeposits(sortedDeposits);
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     loadDeposits();
// // //   }, []);

// // //   // 🎯 মডাল খোলা — এখন বিদ্যমান নোটও লোড হবে
// // //   const openModal = (id, status) => {
// // //     const item = deposits.find(d => d._id === id);
// // //     setModal({
// // //       show: true,
// // //       id,
// // //       status,
// // //       amount: item?.amount || 0,
// // //       uid: item?.uid || item?.userId || 'N/A',
// // //       transactionId: item?.transactionId || 'N/A',
// // //       note: item?.adminNote || '' // 🆕 আগের নোট লোড
// // //     });
// // //   };

// // //   const closeModal = () => {
// // //     if (processing) return;
// // //     setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
// // //   };

// // //   // 🎯 শুধু নোট সেভ করার ফাংশন
// // //   const handleSaveNote = async (id) => {
// // //     const inputEl = inputRefs.current[id];
// // //     const adminNote = inputEl ? inputEl.value : '';

// // //     if (!adminNote.trim()) {
// // //       showToast('নোট খালি! কিছু লিখুন।', 'error');
// // //       return;
// // //     }

// // //     try {
// // //       const res = await fetch('/api/admin/deposits', {
// // //         method: 'PATCH',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ 
// // //           depositId: id, 
// // //           adminNote 
// // //         })
// // //       });
      
// // //       const data = await res.json();
// // //       if (data.success) {
// // //         showToast('✅ নোট সফলভাবে সেভ হয়েছে!', 'success');
// // //         loadDeposits();
// // //       } else {
// // //         showToast(data.message || 'নোট সেভ করতে সমস্যা হয়েছে!', 'error');
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //       showToast('সার্ভার এরর!', 'error');
// // //     }
// // //   };

// // //   // 🎯 কনফার্ম/বাতিল — এখন মডালের নোট সহ
// // //   const executeUpdate = async () => {
// // //     if (!modal.id || !modal.status) return;
// // //     if (processing) return;

// // //     setProcessing(true);

// // //     try {
// // //       const res = await fetch('/api/admin/deposits', {
// // //         method: 'PATCH',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ 
// // //           depositId: modal.id, 
// // //           status: modal.status, 
// // //           adminNote: modal.note // 🆕 মডালের নোট পাঠাচ্ছে
// // //         })
// // //       });
      
// // //       const data = await res.json();
// // //       if (data.success) {
// // //         showToast(
// // //           modal.status === 'approved' 
// // //             ? '✅ ডিপোজিট সফলভাবে কনফার্ম করা হয়েছে!' 
// // //             : '❌ ডিপোজিট সফলভাবে বাতিল করা হয়েছে!', 
// // //           modal.status === 'rejected' ? 'error' : 'success'
// // //         );
// // //         setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
// // //         loadDeposits();
// // //       } else {
// // //         showToast(data.message || 'কিছু সমস্যা হয়েছে!', 'error');
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //       showToast('সার্ভার এরর!', 'error');
// // //     } finally {
// // //       setProcessing(false);
// // //     }
// // //   };

// // //   if (loading) return <div className="p-8 text-white bg-gray-950 min-h-screen">লোড হচ্ছে...</div>;

// // //   return (
// // //     <div className="p-8 text-white bg-gray-950 min-h-screen relative">
      
// // //       {/* 🍞 টোস্ট — মাঝখানে */}
// // //       {toast.show && (
// // //         <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm pointer-events-none">
// // //           <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${
// // //             toast.type === 'success' 
// // //               ? 'bg-emerald-950/95 border-emerald-500/40' 
// // //               : 'bg-rose-950/95 border-rose-500/40'
// // //           }`}
// // //           style={{ animation: 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
// // //           >
// // //             <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${
// // //               toast.type === 'success' 
// // //                 ? 'bg-emerald-500/20 text-emerald-400' 
// // //                 : 'bg-rose-500/20 text-rose-400'
// // //             }`}>
// // //               {toast.type === 'success' ? '✅' : '❌'}
// // //             </div>
// // //             <p className="flex-1 text-xs font-semibold text-white leading-relaxed">{toast.message}</p>
// // //           </div>
// // //         </div>
// // //       )}

// // //       <style jsx global>{`
// // //         @keyframes slideDown {
// // //           from {
// // //             opacity: 0;
// // //             transform: translate(-50%, -30px) scale(0.95);
// // //           }
// // //           to {
// // //             opacity: 1;
// // //             transform: translate(-50%, 0) scale(1);
// // //           }
// // //         }
// // //       `}</style>

// // //       <h1 className="text-2xl font-bold mb-6">ডিপোজিট ম্যানেজমেন্ট</h1>
      
// // //       <div className="space-y-4">
// // //         {deposits.length === 0 ? (
// // //           <p className="text-gray-400">কোনো রিকোয়েস্ট নেই</p>
// // //         ) : (
// // //           deposits.map((item) => {
// // //             const isPending = !item.status || item.status === 'pending';

// // //             return (
// // //               <div key={item._id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
                
// // //                 <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  
// // //                   <div className="space-y-1.5 flex-1">
// // //                     <p className="font-bold text-emerald-400 text-lg">পরিমাণ: ৳{item.amount}</p>
                    
// // //                     <p className="text-sm text-gray-400">
// // //                       <span className="text-gray-500">ইউজার:</span> {item.uid || item.userId || 'N/A'}
// // //                     </p>

// // //                     <p className="text-sm">
// // //                       <span className="text-gray-500">ট্রানজেকশন ID:</span>{' '}
// // //                       <span className="font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
// // //                         {item.transactionId || 'N/A'}
// // //                       </span>
// // //                     </p>

// // //                     <p className="text-sm text-gray-400">
// // //                       <span className="text-gray-500">মেথড:</span>{' '}
// // //                       <span className="text-purple-400 font-semibold">{item.method || 'N/A'}</span>
// // //                     </p>

// // //                     <p className="text-xs text-slate-500 font-mono">
// // //                       🕐 {formatDateTime(item.createdAt || item.date || item.timestamp)}
// // //                     </p>

// // //                     <p className={`text-xs font-bold inline-block px-2 py-1 rounded mt-1 ${
// // //                       item.status === 'approved' 
// // //                         ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
// // //                         : item.status === 'rejected' 
// // //                         ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
// // //                         : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
// // //                     }`}>
// // //                       স্ট্যাটাস: {item.status || 'pending'}
// // //                     </p>

// // //                     {item.adminNote && (
// // //                       <p className="text-xs text-slate-400 mt-1 italic">
// // //                         <span className="font-bold text-amber-400">অ্যাডমিন নোট:</span> {item.adminNote}
// // //                       </p>
// // //                     )}
// // //                   </div>

// // //                   {isPending && (
// // //                     <div className="flex gap-2 flex-shrink-0">
// // //                       <button 
// // //                         onClick={() => openModal(item._id, 'approved')} 
// // //                         className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95"
// // //                       >
// // //                         ✅ কনফার্ম
// // //                       </button>
// // //                       <button 
// // //                         onClick={() => openModal(item._id, 'rejected')} 
// // //                         className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95"
// // //                       >
// // //                         ❌ বাতিল
// // //                       </button>
// // //                     </div>
// // //                   )}
// // //                 </div>

// // //                 {/* নোট ইনপুট সেকশন */}
// // //                 <div className="pt-2 border-t border-gray-800/80 flex gap-2">
// // //                   <input 
// // //                     type="text" 
// // //                     defaultValue={item.adminNote || ''}
// // //                     ref={(el) => (inputRefs.current[item._id] = el)}
// // //                     placeholder="নোট লিখুন (ঐচ্ছিক)..." 
// // //                     className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-green-500 transition"
// // //                   />
// // //                   <button 
// // //                     onClick={() => handleSaveNote(item._id)}
// // //                     className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap border border-slate-700"
// // //                   >
// // //                     💾 নোট সেভ
// // //                   </button>
// // //                 </div>

// // //               </div>
// // //             );
// // //           })
// // //         )}
// // //       </div>

// // //       {/* 🎯 কাস্টম কনফার্ম মডাল — এখন নোট সহ */}
// // //       {modal.show && (
// // //         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
// // //           <div className={`bg-gradient-to-b from-slate-900 to-slate-950 border p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl ${
// // //             modal.status === 'approved' 
// // //               ? 'border-emerald-500/30 shadow-emerald-950/40' 
// // //               : 'border-rose-500/30 shadow-rose-950/40'
// // //           }`}>

// // //             {/* আইকন ও টাইটেল */}
// // //             <div className="flex flex-col items-center text-center space-y-3">
// // //               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${
// // //                 modal.status === 'approved' 
// // //                   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
// // //                   : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
// // //               }`}>
// // //                 {modal.status === 'approved' ? '✅' : '❌'}
// // //               </div>
              
// // //               <h3 className="text-base font-extrabold text-white">
// // //                 {modal.status === 'approved' 
// // //                   ? 'ডিপোজিট কনফার্ম নিশ্চিত করুন' 
// // //                   : 'ডিপোজিট বাতিল নিশ্চিত করুন'}
// // //               </h3>
              
// // //               <p className="text-xs text-slate-400 leading-relaxed">
// // //                 {modal.status === 'approved' 
// // //                   ? 'আপনি কি এই ডিপোজিট রিকোয়েস্টটি কনফার্ম করতে চান?' 
// // //                   : 'আপনি কি এই ডিপোজিট রিকোয়েস্টটি বাতিল করতে চান?'}
// // //               </p>
// // //             </div>

// // //             {/* ডিটেইলস বক্স */}
// // //             <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
// // //               <div className="flex justify-between text-xs">
// // //                 <span className="text-slate-500">পরিমাণ:</span>
// // //                 <span className="font-bold text-emerald-400 font-mono">৳{modal.amount}</span>
// // //               </div>
// // //               <div className="flex justify-between text-xs">
// // //                 <span className="text-slate-500">ইউজার:</span>
// // //                 <span className="font-bold text-slate-300 font-mono">{modal.uid}</span>
// // //               </div>
// // //               <div className="flex justify-between text-xs">
// // //                 <span className="text-slate-500">ট্রানজেকশন ID:</span>
// // //                 <span className="font-bold text-cyan-400 font-mono text-[10px]">{modal.transactionId}</span>
// // //               </div>
// // //             </div>

// // //             {/* 🆕 নোট লেখার ইনপুট (মডালের ভেতরে) */}
// // //             <div className="space-y-2">
// // //               <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
// // //                 <span>📝</span> অ্যাডমিন নোট (ঐচ্ছিক)
// // //               </label>
// // //               <textarea 
// // //                 value={modal.note}
// // //                 onChange={(e) => setModal({ ...modal, note: e.target.value })}
// // //                 placeholder="এখানে নোট লিখুন... (যেমন: পেমেন্ট ভেরিফাইড, ভুল ট্রানজেকশন ইত্যাদি)"
// // //                 rows={3}
// // //                 className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-white outline-none transition resize-none ${
// // //                   modal.status === 'approved' 
// // //                     ? 'border-slate-700 focus:border-emerald-500' 
// // //                     : 'border-slate-700 focus:border-rose-500'
// // //                 }`}
// // //               />
// // //             </div>

// // //             {/* বাটন */}
// // //             <div className="flex gap-2 pt-1">
// // //               <button
// // //                 onClick={closeModal}
// // //                 disabled={processing}
// // //                 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
// // //               >
// // //                 না, বাতিল করুন
// // //               </button>
// // //               <button
// // //                 onClick={executeUpdate}
// // //                 disabled={processing}
// // //                 className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 ${
// // //                   modal.status === 'approved' 
// // //                     ? 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40' 
// // //                     : 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-950/40'
// // //                 }`}
// // //               >
// // //                 {processing ? (
// // //                   <>
// // //                     <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
// // //                     প্রসেসিং...
// // //                   </>
// // //                 ) : (
// // //                   modal.status === 'approved' ? 'হ্যাঁ, কনফার্ম' : 'হ্যাঁ, বাতিল'
// // //                 )}
// // //               </button>
// // //             </div>

// // //           </div>
// // //         </div>
// // //       )}

// // //     </div>
// // //   );
// // // }

// // // .............................................................................

// // // 'use client';
// // // import { useState, useEffect, useRef, useCallback } from 'react';

// // // export default function DepositManagementPage() {
// // //   const [deposits, setDeposits] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
// // //   const [modal, setModal] = useState({ 
// // //     show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: ''
// // //   });
  
// // //   const [processing, setProcessing] = useState(false);
  
// // //   // 🎯 Debounce টাইমার
// // //   const debounceTimers = useRef({});

// // //   const showToast = (message, type = 'success') => {
// // //     setToast({ show: true, message, type });
// // //     setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
// // //   };

// // //   const formatDateTime = (timestamp) => {
// // //     if (!timestamp) return 'N/A';
// // //     let date = typeof timestamp === 'object' && timestamp.seconds
// // //       ? new Date(timestamp.seconds * 1000)
// // //       : new Date(timestamp);
// // //     if (isNaN(date.getTime())) return 'N/A';
// // //     return date.toLocaleString('en-GB', {
// // //       day: '2-digit', month: 'short', year: 'numeric',
// // //       hour: '2-digit', minute: '2-digit', hour12: true
// // //     });
// // //   };

// // //   const loadDeposits = async () => {
// // //     try {
// // //       const res = await fetch('/api/admin/deposits');
// // //       if (res.status === 401 || res.status === 403) {
// // //         showToast('অনুমোদিত নয়!', 'error');
// // //         setLoading(false);
// // //         return;
// // //       }
// // //       const data = await res.json();
// // //       if (data.success) {
// // //         const sorted = (data.deposits || []).sort((a, b) => 
// // //           new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
// // //         );
// // //         setDeposits(sorted);
// // //       }
// // //     } catch (err) { console.error(err); }
// // //     finally { setLoading(false); }
// // //   };

// // //   useEffect(() => { loadDeposits(); }, []);

// // //   // 🎯 Debounced Note Save — ২ সেকেন্ড পরে অটো সেভ
// // //   const debouncedSaveNote = useCallback((id, note) => {
// // //     if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    
// // //     debounceTimers.current[id] = setTimeout(async () => {
// // //       // খালি নোট বা ২০০+ অক্ষর হলে সেভ করবে না
// // //       const cleanNote = String(note || '').trim().slice(0, 200);
      
// // //       try {
// // //         const res = await fetch('/api/admin/deposits', {
// // //           method: 'PATCH',
// // //           headers: { 'Content-Type': 'application/json' },
// // //           body: JSON.stringify({ depositId: id, adminNote: cleanNote })
// // //         });
// // //         const data = await res.json();
// // //         if (data.success) {
// // //           showToast('✅ নোট অটো-সেভ হয়েছে!', 'success');
// // //         }
// // //       } catch (err) { console.error(err); }
// // //     }, 2000);
// // //   }, []);

// // //   const handleNoteChange = (id, value) => {
// // //     // লোকাল স্টেটে আপডেট
// // //     setDeposits(prev => prev.map(d => 
// // //       d._id === id ? { ...d, adminNote: value } : d
// // //     ));
// // //     // Debounced API কল
// // //     debouncedSaveNote(id, value);
// // //   };

// // //   const openModal = (id, status) => {
// // //     const item = deposits.find(d => d._id === id);
// // //     setModal({
// // //       show: true, id, status,
// // //       amount: item?.amount || 0,
// // //       uid: item?.uid || item?.userId || 'N/A',
// // //       transactionId: item?.transactionId || 'N/A',
// // //       note: item?.adminNote || ''
// // //     });
// // //   };

// // //   const closeModal = () => {
// // //     if (processing) return;
// // //     setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
// // //   };

// // //   const executeUpdate = async () => {
// // //     if (!modal.id || !modal.status || processing) return;
// // //     setProcessing(true);
// // //     try {
// // //       const res = await fetch('/api/admin/deposits', {
// // //         method: 'PATCH',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ 
// // //           depositId: modal.id, 
// // //           status: modal.status, 
// // //           adminNote: String(modal.note || '').trim().slice(0, 200)
// // //         })
// // //       });
// // //       const data = await res.json();
// // //       if (data.success) {
// // //         showToast(
// // //           modal.status === 'approved' ? '✅ কনফার্ম হয়েছে!' : '❌ বাতিল হয়েছে!',
// // //           modal.status === 'rejected' ? 'error' : 'success'
// // //         );
// // //         setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
// // //         loadDeposits();
// // //       } else {
// // //         showToast(data.message || 'সমস্যা হয়েছে!', 'error');
// // //       }
// // //     } catch (err) { showToast('সার্ভার এরর!', 'error'); }
// // //     finally { setProcessing(false); }
// // //   };

// // //   if (loading) return <div className="p-8 text-white bg-gray-950 min-h-screen">লোড হচ্ছে...</div>;

// // //   return (
// // //     <div className="p-8 text-white bg-gray-950 min-h-screen relative">
      
// // //       {/* টোস্ট */}
// // //       {toast.show && (
// // //         <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm pointer-events-none">
// // //           <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${
// // //             toast.type === 'success' ? 'bg-emerald-950/95 border-emerald-500/40' : 'bg-rose-950/95 border-rose-500/40'
// // //           }`} style={{ animation: 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
// // //             <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
// // //               toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
// // //             }`}>{toast.type === 'success' ? '✅' : '❌'}</div>
// // //             <p className="flex-1 text-xs font-semibold text-white">{toast.message}</p>
// // //           </div>
// // //         </div>
// // //       )}

// // //       <style jsx global>{`
// // //         @keyframes slideDown {
// // //           from { opacity: 0; transform: translate(-50%, -30px) scale(0.95); }
// // //           to { opacity: 1; transform: translate(-50%, 0) scale(1); }
// // //         }
// // //       `}</style>

// // //       <h1 className="text-2xl font-bold mb-6">ডিপোজিট ম্যানেজমেন্ট</h1>
      
// // //       <div className="space-y-4">
// // //         {deposits.length === 0 ? (
// // //           <p className="text-gray-400">কোনো রিকোয়েস্ট নেই</p>
// // //         ) : (
// // //           deposits.map((item) => {
// // //             const isPending = !item.status || item.status === 'pending';
// // //             return (
// // //               <div key={item._id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
                
// // //                 <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
// // //                   <div className="space-y-1.5 flex-1">
// // //                     <p className="font-bold text-emerald-400 text-lg">পরিমাণ: ৳{item.amount}</p>
// // //                     <p className="text-sm text-gray-400">
// // //                       <span className="text-gray-500">ইউজার:</span> {item.uid || item.userId || 'N/A'}
// // //                     </p>
// // //                     <p className="text-sm">
// // //                       <span className="text-gray-500">ট্রানজেকশন ID:</span>{' '}
// // //                       <span className="font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
// // //                         {item.transactionId || 'N/A'}
// // //                       </span>
// // //                     </p>
// // //                     <p className="text-sm text-gray-400">
// // //                       <span className="text-gray-500">মেথড:</span>{' '}
// // //                       <span className="text-purple-400 font-semibold">{item.method || 'N/A'}</span>
// // //                     </p>
// // //                     <p className="text-xs text-slate-500 font-mono">
// // //                       🕐 {formatDateTime(item.createdAt)}
// // //                     </p>
// // //                     <p className={`text-xs font-bold inline-block px-2 py-1 rounded mt-1 ${
// // //                       item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
// // //                       : item.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
// // //                       : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
// // //                     }`}>স্ট্যাটাস: {item.status || 'pending'}</p>
// // //                   </div>

// // //                   {isPending && (
// // //                     <div className="flex gap-2 flex-shrink-0">
// // //                       <button onClick={() => openModal(item._id, 'approved')} 
// // //                         className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95">
// // //                         ✅ কনফার্ম
// // //                       </button>
// // //                       <button onClick={() => openModal(item._id, 'rejected')} 
// // //                         className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95">
// // //                         ❌ বাতিল
// // //                       </button>
// // //                     </div>
// // //                   )}
// // //                 </div>

// // //                 {/* 🎯 নোট — অটো সেভ, কোনো বাটন নেই */}
// // //                 <div className="pt-2 border-t border-gray-800/80">
// // //                   <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
// // //                     📝 অ্যাডমিন নোট (প্রয়োজনবোধে লিখুন — অটো সেভ হবে)
// // //                   </label>
// // //                   <input 
// // //                     type="text" 
// // //                     maxLength={200}
// // //                     value={item.adminNote || ''}
// // //                     onChange={(e) => handleNoteChange(item._id, e.target.value)}
// // //                     placeholder="নোট লিখুন... (২ সেকেন্ড পরে অটো সেভ হবে)"
// // //                     className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-amber-500 transition"
// // //                   />
// // //                 </div>

// // //               </div>
// // //             );
// // //           })
// // //         )}
// // //       </div>

// // //       {/* মডাল */}
// // //       {modal.show && (
// // //         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
// // //           <div className={`bg-gradient-to-b from-slate-900 to-slate-950 border p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl ${
// // //             modal.status === 'approved' ? 'border-emerald-500/30' : 'border-rose-500/30'
// // //           }`}>
// // //             <div className="flex flex-col items-center text-center space-y-3">
// // //               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${
// // //                 modal.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
// // //                 : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
// // //               }`}>{modal.status === 'approved' ? '✅' : '❌'}</div>
// // //               <h3 className="text-base font-extrabold text-white">
// // //                 {modal.status === 'approved' ? 'ডিপোজিট কনফার্ম নিশ্চিত করুন' : 'ডিপোজিট বাতিল নিশ্চিত করুন'}
// // //               </h3>
// // //             </div>

// // //             <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
// // //               <div className="flex justify-between text-xs">
// // //                 <span className="text-slate-500">পরিমাণ:</span>
// // //                 <span className="font-bold text-emerald-400 font-mono">৳{modal.amount}</span>
// // //               </div>
// // //               <div className="flex justify-between text-xs">
// // //                 <span className="text-slate-500">ইউজার:</span>
// // //                 <span className="font-bold text-slate-300 font-mono">{modal.uid}</span>
// // //               </div>
// // //               <div className="flex justify-between text-xs">
// // //                 <span className="text-slate-500">ট্রানজেকশন:</span>
// // //                 <span className="font-bold text-cyan-400 font-mono text-[10px]">{modal.transactionId}</span>
// // //               </div>
// // //             </div>

// // //             <div className="space-y-2">
// // //               <label className="text-xs text-slate-400 font-semibold">📝 অ্যাডমিন নোট (ঐচ্ছিক)</label>
// // //               <textarea 
// // //                 value={modal.note}
// // //                 maxLength={200}
// // //                 onChange={(e) => setModal({ ...modal, note: e.target.value })}
// // //                 placeholder="নোট লিখুন..."
// // //                 rows={3}
// // //                 className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-white outline-none resize-none ${
// // //                   modal.status === 'approved' ? 'border-slate-700 focus:border-emerald-500' 
// // //                   : 'border-slate-700 focus:border-rose-500'
// // //                 }`}
// // //               />
// // //             </div>

// // //             <div className="flex gap-2 pt-1">
// // //               <button onClick={closeModal} disabled={processing}
// // //                 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs disabled:opacity-50">
// // //                 না
// // //               </button>
// // //               <button onClick={executeUpdate} disabled={processing}
// // //                 className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs disabled:opacity-50 flex justify-center items-center gap-2 ${
// // //                   modal.status === 'approved' ? 'from-emerald-600 to-teal-600' : 'from-rose-600 to-pink-600'
// // //                 }`}>
// // //                 {processing ? (
// // //                   <>
// // //                     <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
// // //                     ...
// // //                   </>
// // //                 ) : (modal.status === 'approved' ? 'হ্যাঁ, কনফার্ম' : 'হ্যাঁ, বাতিল')}
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //     </div>
// // //   );
// // // }

// // // ..................................................................

// // 'use client';
// // import { useState, useEffect, useRef, useCallback } from 'react';

// // export default function DepositManagementPage() {
// //   const [deposits, setDeposits] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
// //   const [modal, setModal] = useState({ 
// //     show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: ''
// //   });
  
// //   const [processing, setProcessing] = useState(false);
  
// //   // 🎯 Debounce টাইমার
// //   const debounceTimers = useRef({});

// //   const showToast = (message, type = 'success') => {
// //     setToast({ show: true, message, type });
// //     setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
// //   };

// //   const formatDateTime = (timestamp) => {
// //     if (!timestamp) return 'N/A';
// //     let date = typeof timestamp === 'object' && timestamp.seconds
// //       ? new Date(timestamp.seconds * 1000)
// //       : new Date(timestamp);
// //     if (isNaN(date.getTime())) return 'N/A';
// //     return date.toLocaleString('en-GB', {
// //       day: '2-digit', month: 'short', year: 'numeric',
// //       hour: '2-digit', minute: '2-digit', hour12: true
// //     });
// //   };

// //   const loadDeposits = async () => {
// //     try {
// //       const res = await fetch('/api/admin/deposits');
// //       if (res.status === 401 || res.status === 403) {
// //         showToast('অনুমোদিত নয়!', 'error');
// //         setLoading(false);
// //         return;
// //       }
// //       const data = await res.json();
// //       if (data.success) {
// //         const sorted = (data.deposits || []).sort((a, b) => 
// //           new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
// //         );
// //         setDeposits(sorted);
// //       }
// //     } catch (err) { console.error(err); }
// //     finally { setLoading(false); }
// //   };

// //   useEffect(() => { loadDeposits(); }, []);

// //   // 🎯 Debounced Note Save — ২ সেকেন্ড পরে অটো সেভ
// //   const debouncedSaveNote = useCallback((id, note) => {
// //     if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    
// //     debounceTimers.current[id] = setTimeout(async () => {
// //       const cleanNote = String(note || '').trim().slice(0, 200);
      
// //       try {
// //         const res = await fetch('/api/admin/deposits', {
// //           method: 'PATCH',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({ depositId: id, adminNote: cleanNote })
// //         });
// //         const data = await res.json();
// //         if (data.success) {
// //           showToast('✅ নোট অটো-সেভ হয়েছে!', 'success');
// //         }
// //       } catch (err) { console.error(err); }
// //     }, 2000);
// //   }, []);

// //   const handleNoteChange = (id, value) => {
// //     setDeposits(prev => prev.map(d => 
// //       d._id === id ? { ...d, adminNote: value } : d
// //     ));
// //     debouncedSaveNote(id, value);
// //   };

// //   const openModal = (id, status) => {
// //     const item = deposits.find(d => d._id === id);
// //     setModal({
// //       show: true, id, status,
// //       amount: item?.amount || 0,
// //       uid: item?.uid || item?.userId || 'N/A',
// //       transactionId: item?.transactionId || 'N/A',
// //       note: item?.adminNote || ''
// //     });
// //   };

// //   const closeModal = () => {
// //     if (processing) return;
// //     setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
// //   };

// //   const executeUpdate = async () => {
// //     if (!modal.id || !modal.status || processing) return;
// //     setProcessing(true);
// //     try {
// //       const res = await fetch('/api/admin/deposits', {
// //         method: 'PATCH',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ 
// //           depositId: modal.id, 
// //           status: modal.status, 
// //           adminNote: String(modal.note || '').trim().slice(0, 200)
// //         })
// //       });
// //       const data = await res.json();
// //       if (data.success) {
// //         showToast(
// //           modal.status === 'approved' ? '✅ কনফার্ম হয়েছে!' : '❌ বাতিল হয়েছে!',
// //           modal.status === 'rejected' ? 'error' : 'success'
// //         );
// //         setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
// //         loadDeposits();
// //       } else {
// //         showToast(data.message || 'সমস্যা হয়েছে!', 'error');
// //       }
// //     } catch (err) { showToast('সার্ভার এরর!', 'error'); }
// //     finally { setProcessing(false); }
// //   };

// //   if (loading) return <div className="p-8 text-white bg-gray-950 min-h-screen">লোড হচ্ছে...</div>;

// //   return (
// //     <div className="p-8 text-white bg-gray-950 min-h-screen relative">
      
// //       {/* 🍞 টোস্ট — স্ক্রিনের একদম মাঝখানে (Center) */}
// //       {toast.show && (
// //         <div 
// //           className={`fixed z-[60] px-5 py-3 rounded-xl text-sm font-bold shadow-2xl transition-all ${
// //             toast.type === 'success' 
// //               ? 'bg-emerald-600 text-white border border-emerald-400' 
// //               : 'bg-rose-600 text-white border border-rose-400'
// //           }`}
// //           style={{ 
// //             top: '50%',
// //             left: '50%', 
// //             transform: 'translate(-50%, -50%)' 
// //           }}
// //         >
// //           {toast.message}
// //         </div>
// //       )}

// //       <h1 className="text-2xl font-bold mb-6">ডিপোজিট ম্যানেজমেন্ট</h1>
      
// //       <div className="space-y-4">
// //         {deposits.length === 0 ? (
// //           <p className="text-gray-400">কোনো রিকোয়েস্ট নেই</p>
// //         ) : (
// //           deposits.map((item) => {
// //             const isPending = !item.status || item.status === 'pending';
// //             return (
// //               <div key={item._id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
                
// //                 <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
// //                   <div className="space-y-1.5 flex-1">
// //                     <p className="font-bold text-emerald-400 text-lg">পরিমাণ: ৳{item.amount}</p>
// //                     <p className="text-sm text-gray-400">
// //                       <span className="text-gray-500">ইউজার:</span> {item.uid || item.userId || 'N/A'}
// //                     </p>
// //                     <p className="text-sm">
// //                       <span className="text-gray-500">ট্রানজেকশন ID:</span>{' '}
// //                       <span className="font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
// //                         {item.transactionId || 'N/A'}
// //                       </span>
// //                     </p>
// //                     <p className="text-sm text-gray-400">
// //                       <span className="text-gray-500">মেথড:</span>{' '}
// //                       <span className="text-purple-400 font-semibold">{item.method || 'N/A'}</span>
// //                     </p>
// //                     <p className="text-xs text-slate-500 font-mono">
// //                       🕐 {formatDateTime(item.createdAt)}
// //                     </p>
// //                     <p className={`text-xs font-bold inline-block px-2 py-1 rounded mt-1 ${
// //                       item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
// //                       : item.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
// //                       : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
// //                     }`}>স্ট্যাটাস: {item.status || 'pending'}</p>
// //                   </div>

// //                   {isPending && (
// //                     <div className="flex gap-2 flex-shrink-0">
// //                       <button onClick={() => openModal(item._id, 'approved')} 
// //                         className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95">
// //                         ✅ কনফার্ম
// //                       </button>
// //                       <button onClick={() => openModal(item._id, 'rejected')} 
// //                         className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95">
// //                         ❌ বাতিল
// //                       </button>
// //                     </div>
// //                   )}
// //                 </div>

// //                 {/* 🎯 নোট — অটো সেভ */}
// //                 <div className="pt-2 border-t border-gray-800/80">
// //                   <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
// //                     📝 অ্যাডমিন নোট (প্রয়োজনবোধে লিখুন — অটো সেভ হবে)
// //                   </label>
// //                   <input 
// //                     type="text" 
// //                     maxLength={200}
// //                     value={item.adminNote || ''}
// //                     onChange={(e) => handleNoteChange(item._id, e.target.value)}
// //                     placeholder="নোট লিখুন... (২ সেকেন্ড পরে অটো সেভ হবে)"
// //                     className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-amber-500 transition"
// //                   />
// //                 </div>

// //               </div>
// //             );
// //           })
// //         )}
// //       </div>

// //       {/* মডাল */}
// //       {modal.show && (
// //         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
// //           <div className={`bg-gradient-to-b from-slate-900 to-slate-950 border p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl ${
// //             modal.status === 'approved' ? 'border-emerald-500/30' : 'border-rose-500/30'
// //           }`}>
// //             <div className="flex flex-col items-center text-center space-y-3">
// //               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${
// //                 modal.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
// //                 : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
// //               }`}>{modal.status === 'approved' ? '✅' : '❌'}</div>
// //               <h3 className="text-base font-extrabold text-white">
// //                 {modal.status === 'approved' ? 'ডিপোজিট কনফার্ম নিশ্চিত করুন' : 'ডিপোজিট বাতিল নিশ্চিত করুন'}
// //               </h3>
// //             </div>

// //             <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
// //               <div className="flex justify-between text-xs">
// //                 <span className="text-slate-500">পরিমাণ:</span>
// //                 <span className="font-bold text-emerald-400 font-mono">৳{modal.amount}</span>
// //               </div>
// //               <div className="flex justify-between text-xs">
// //                 <span className="text-slate-500">ইউজার:</span>
// //                 <span className="font-bold text-slate-300 font-mono">{modal.uid}</span>
// //               </div>
// //               <div className="flex justify-between text-xs">
// //                 <span className="text-slate-500">ট্রানজেকশন:</span>
// //                 <span className="font-bold text-cyan-400 font-mono text-[10px]">{modal.transactionId}</span>
// //               </div>
// //             </div>

// //             <div className="space-y-2">
// //               <label className="text-xs text-slate-400 font-semibold">📝 অ্যাডমিন নোট (ঐচ্ছিক)</label>
// //               <textarea 
// //                 value={modal.note}
// //                 maxLength={200}
// //                 onChange={(e) => setModal({ ...modal, note: e.target.value })}
// //                 placeholder="নোট লিখুন..."
// //                 rows={3}
// //                 className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-white outline-none resize-none ${
// //                   modal.status === 'approved' ? 'border-slate-700 focus:border-emerald-500' 
// //                   : 'border-slate-700 focus:border-rose-500'
// //                 }`}
// //               />
// //             </div>

// //             <div className="flex gap-2 pt-1">
// //               <button onClick={closeModal} disabled={processing}
// //                 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs disabled:opacity-50">
// //                 না
// //               </button>
// //               <button onClick={executeUpdate} disabled={processing}
// //                 className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs disabled:opacity-50 flex justify-center items-center gap-2 ${
// //                   modal.status === 'approved' ? 'from-emerald-600 to-teal-600' : 'from-rose-600 to-pink-600'
// //                 }`}>
// //                 {processing ? (
// //                   <>
// //                     <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
// //                     ...
// //                   </>
// //                 ) : (modal.status === 'approved' ? 'হ্যাঁ, কনফার্ম' : 'হ্যাঁ, বাতিল')}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //     </div>
// //   );
// // }

// // ..............................................................

// 'use client';
// import { useState, useEffect, useRef, useCallback } from 'react';

// export default function DepositManagementPage() {
//   const [deposits, setDeposits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
//   const [modal, setModal] = useState({ 
//     show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: ''
//   });
  
//   const [processing, setProcessing] = useState(false);
  
//   // 🎯 Debounce টাইমার
//   const debounceTimers = useRef({});

//   // ✅ useCallback — stable reference
//   const showToast = useCallback((message, type = 'success') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
//   }, []);

//   const formatDateTime = (timestamp) => {
//     if (!timestamp) return 'N/A';
//     let date = typeof timestamp === 'object' && timestamp.seconds
//       ? new Date(timestamp.seconds * 1000)
//       : new Date(timestamp);
//     if (isNaN(date.getTime())) return 'N/A';
//     return date.toLocaleString('en-GB', {
//       day: '2-digit', month: 'short', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', hour12: true
//     });
//   };

//   const loadDeposits = async () => {
//     try {
//       const res = await fetch('/api/admin/deposits');
//       if (res.status === 401 || res.status === 403) {
//         showToast('অনুমোদিত নয়!', 'error');
//         setLoading(false);
//         return;
//       }
//       const data = await res.json();
//       if (data.success) {
//         const sorted = (data.deposits || []).sort((a, b) => 
//           new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
//         );
//         setDeposits(sorted);
//       }
//     } catch (err) { console.error(err); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { loadDeposits(); }, []);

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
//         const res = await fetch('/api/admin/deposits', {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ depositId: id, adminNote: cleanNote })
//         });
//         const data = await res.json();
//         if (data.success) {
//           showToast('✅ নোট অটো-সেভ হয়েছে!', 'success');
//         }
//       } catch (err) { console.error(err); }
//     }, 2000);
//   }, [showToast]);

//   const handleNoteChange = (id, value) => {
//     setDeposits(prev => prev.map(d => 
//       d._id === id ? { ...d, adminNote: value } : d
//     ));
//     debouncedSaveNote(id, value);
//   };

//   const openModal = (id, status) => {
//     const item = deposits.find(d => d._id === id);
//     setModal({
//       show: true, id, status,
//       amount: item?.amount || 0,
//       uid: item?.uid || item?.userId || 'N/A',
//       transactionId: item?.transactionId || 'N/A',
//       note: item?.adminNote || ''
//     });
//   };

//   const closeModal = () => {
//     if (processing) return;
//     setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
//   };

//   const executeUpdate = async () => {
//     if (!modal.id || !modal.status || processing) return;
//     setProcessing(true);
//     try {
//       const res = await fetch('/api/admin/deposits', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           depositId: modal.id, 
//           status: modal.status, 
//           adminNote: String(modal.note || '').trim().slice(0, 200)
//         })
//       });
//       const data = await res.json();
//       if (data.success) {
//         showToast(
//           modal.status === 'approved' ? '✅ কনফার্ম হয়েছে!' : '❌ বাতিল হয়েছে!',
//           modal.status === 'rejected' ? 'error' : 'success'
//         );
//         setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
//         loadDeposits();
//       } else {
//         showToast(data.message || 'সমস্যা হয়েছে!', 'error');
//       }
//     } catch (err) { showToast('সার্ভার এরর!', 'error'); }
//     finally { setProcessing(false); }
//   };

//   if (loading) return <div className="p-8 text-white bg-gray-950 min-h-screen">লোড হচ্ছে...</div>;

//   return (
//     <div className="p-8 text-white bg-gray-950 min-h-screen relative">
      
//       {/* 🍞 টোস্ট — স্ক্রিনের একদম মাঝখানে (Center) */}
//       {toast.show && (
//         <div 
//           className={`fixed z-[60] px-5 py-3 rounded-xl text-sm font-bold shadow-2xl transition-all ${
//             toast.type === 'success' 
//               ? 'bg-emerald-600 text-white border border-emerald-400' 
//               : 'bg-rose-600 text-white border border-rose-400'
//           }`}
//           style={{ 
//             top: '50%',
//             left: '50%', 
//             transform: 'translate(-50%, -50%)' 
//           }}
//         >
//           {toast.message}
//         </div>
//       )}

//       <h1 className="text-2xl font-bold mb-6">ডিপোজিট ম্যানেজমেন্ট</h1>
      
//       <div className="space-y-4">
//         {deposits.length === 0 ? (
//           <p className="text-gray-400">কোনো রিকোয়েস্ট নেই</p>
//         ) : (
//           deposits.map((item) => {
//             const isPending = !item.status || item.status === 'pending';
//             return (
//               <div key={item._id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
                
//                 <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
//                   <div className="space-y-1.5 flex-1">
//                     <p className="font-bold text-emerald-400 text-lg">পরিমাণ: ৳{item.amount}</p>
//                     <p className="text-sm text-gray-400">
//                       <span className="text-gray-500">ইউজার:</span> {item.uid || item.userId || 'N/A'}
//                     </p>
//                     <p className="text-sm">
//                       <span className="text-gray-500">ট্রানজেকশন ID:</span>{' '}
//                       <span className="font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
//                         {item.transactionId || 'N/A'}
//                       </span>
//                     </p>
//                     <p className="text-sm text-gray-400">
//                       <span className="text-gray-500">মেথড:</span>{' '}
//                       <span className="text-purple-400 font-semibold">{item.method || 'N/A'}</span>
//                     </p>
//                     <p className="text-xs text-slate-500 font-mono">
//                       🕐 {formatDateTime(item.createdAt)}
//                     </p>
//                     <p className={`text-xs font-bold inline-block px-2 py-1 rounded mt-1 ${
//                       item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
//                       : item.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
//                       : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
//                     }`}>স্ট্যাটাস: {item.status || 'pending'}</p>
//                   </div>

//                   {isPending && (
//                     <div className="flex gap-2 flex-shrink-0">
//                       <button onClick={() => openModal(item._id, 'approved')} 
//                         className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95">
//                         ✅ কনফার্ম
//                       </button>
//                       <button onClick={() => openModal(item._id, 'rejected')} 
//                         className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95">
//                         ❌ বাতিল
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* 🎯 নোট — অটো সেভ */}
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
//                     className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-amber-500 transition"
//                   />
//                 </div>

//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* মডাল */}
//       {modal.show && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className={`bg-gradient-to-b from-slate-900 to-slate-950 border p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl ${
//             modal.status === 'approved' ? 'border-emerald-500/30' : 'border-rose-500/30'
//           }`}>
//             <div className="flex flex-col items-center text-center space-y-3">
//               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${
//                 modal.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
//                 : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
//               }`}>{modal.status === 'approved' ? '✅' : '❌'}</div>
//               <h3 className="text-base font-extrabold text-white">
//                 {modal.status === 'approved' ? 'ডিপোজিট কনফার্ম নিশ্চিত করুন' : 'ডিপোজিট বাতিল নিশ্চিত করুন'}
//               </h3>
//             </div>

//             <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
//               <div className="flex justify-between text-xs">
//                 <span className="text-slate-500">পরিমাণ:</span>
//                 <span className="font-bold text-emerald-400 font-mono">৳{modal.amount}</span>
//               </div>
//               <div className="flex justify-between text-xs">
//                 <span className="text-slate-500">ইউজার:</span>
//                 <span className="font-bold text-slate-300 font-mono">{modal.uid}</span>
//               </div>
//               <div className="flex justify-between text-xs">
//                 <span className="text-slate-500">ট্রানজেকশন:</span>
//                 <span className="font-bold text-cyan-400 font-mono text-[10px]">{modal.transactionId}</span>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label className="text-xs text-slate-400 font-semibold">📝 অ্যাডমিন নোট (ঐচ্ছিক)</label>
//               <textarea 
//                 value={modal.note}
//                 maxLength={200}
//                 onChange={(e) => setModal({ ...modal, note: e.target.value })}
//                 placeholder="নোট লিখুন..."
//                 rows={3}
//                 className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-white outline-none resize-none ${
//                   modal.status === 'approved' ? 'border-slate-700 focus:border-emerald-500' 
//                   : 'border-slate-700 focus:border-rose-500'
//                 }`}
//               />
//             </div>

//             <div className="flex gap-2 pt-1">
//               <button onClick={closeModal} disabled={processing}
//                 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs disabled:opacity-50">
//                 না
//               </button>
//               <button onClick={executeUpdate} disabled={processing}
//                 className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs disabled:opacity-50 flex justify-center items-center gap-2 ${
//                   modal.status === 'approved' ? 'from-emerald-600 to-teal-600' : 'from-rose-600 to-pink-600'
//                 }`}>
//                 {processing ? (
//                   <>
//                     <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     ...
//                   </>
//                 ) : (modal.status === 'approved' ? 'হ্যাঁ, কনফার্ম' : 'হ্যাঁ, বাতিল')}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// //////////////////////////////////////////////////////////////

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function DepositManagementPage() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // 🆕 Filter + Search state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modal, setModal] = useState({ 
    show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: ''
  });
  
  const [processing, setProcessing] = useState(false);
  
  // 🎯 Debounce টাইমার
  const debounceTimers = useRef({});

  // ✅ useCallback — stable reference
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }, []);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    let date = typeof timestamp === 'object' && timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const loadDeposits = async () => {
    try {
      const res = await fetch('/api/admin/deposits');
      if (res.status === 401 || res.status === 403) {
        showToast('অনুমোদিত নয়!', 'error');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        const sorted = (data.deposits || []).sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setDeposits(sorted);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDeposits(); }, []);

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
        const res = await fetch('/api/admin/deposits', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ depositId: id, adminNote: cleanNote })
        });
        const data = await res.json();
        if (data.success) {
          showToast('✅ নোট অটো-সেভ হয়েছে!', 'success');
        }
      } catch (err) { console.error(err); }
    }, 2000);
  }, [showToast]);

  const handleNoteChange = (id, value) => {
    setDeposits(prev => prev.map(d => 
      d._id === id ? { ...d, adminNote: value } : d
    ));
    debouncedSaveNote(id, value);
  };

  const openModal = (id, status) => {
    const item = deposits.find(d => d._id === id);
    setModal({
      show: true, id, status,
      amount: item?.amount || 0,
      uid: item?.uid || item?.userId || 'N/A',
      transactionId: item?.transactionId || 'N/A',
      note: item?.adminNote || ''
    });
  };

  const closeModal = () => {
    if (processing) return;
    setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
  };

  const executeUpdate = async () => {
    if (!modal.id || !modal.status || processing) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          depositId: modal.id, 
          status: modal.status, 
          adminNote: String(modal.note || '').trim().slice(0, 200)
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          modal.status === 'approved' ? '✅ কনফার্ম হয়েছে!' : '❌ বাতিল হয়েছে!',
          modal.status === 'rejected' ? 'error' : 'success'
        );
        setModal({ show: false, id: null, status: null, amount: 0, uid: '', transactionId: '', note: '' });
        loadDeposits();
      } else {
        showToast(data.message || 'সমস্যা হয়েছে!', 'error');
      }
    } catch (err) { showToast('সার্ভার এরর!', 'error'); }
    finally { setProcessing(false); }
  };

  // 🆕 Filter + Search একসাথে
  const filteredDeposits = deposits.filter(d => {
    // Status filter
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;

    // Search filter
    if (searchQuery.trim()) {
      const search = searchQuery.trim().toLowerCase();
      return (
        d.transactionId?.toLowerCase().includes(search) ||
        d.uid?.toLowerCase().includes(search) ||
        String(d.amount).includes(search)
      );
    }

    return true;
  });

  const countByStatus = (status) => {
    if (status === 'all') return deposits.length;
    return deposits.filter(d => d.status === status).length;
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
      
      {/* 🍞 টোস্ট */}
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

      <h1 className="text-2xl font-bold mb-6">ডিপোজিট ম্যানেজমেন্ট</h1>

      {/* 🆕 Search Box */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 mb-4">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-1">
          🔍 ট্রানজেকশন / ইউজার / পরিমাণ খুঁজুন
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="Transaction ID, UID অথবা Amount..."
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
            🔍 "{searchQuery}" → {filteredDeposits.length} টি ফলাফল
          </p>
        )}
      </div>

      {/* 🆕 Filter Buttons */}
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
        {filteredDeposits.length === 0 ? (
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
          filteredDeposits.map((item) => {
            const isPending = !item.status || item.status === 'pending';
            return (
              <div key={item._id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  <div className="space-y-1.5 flex-1">
                    <p className="font-bold text-emerald-400 text-lg">পরিমাণ: ৳{item.amount}</p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">ইউজার:</span> {item.uid || item.userId || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">ট্রানজেকশন ID:</span>{' '}
                      <span className="font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {item.transactionId || 'N/A'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">মেথড:</span>{' '}
                      <span className="text-purple-400 font-semibold">{item.method || 'N/A'}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      🕐 {formatDateTime(item.createdAt)}
                    </p>
                    <p className={`text-xs font-bold inline-block px-2 py-1 rounded mt-1 ${
                      item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : item.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>স্ট্যাটাস: {item.status || 'pending'}</p>
                  </div>

                  {isPending && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openModal(item._id, 'approved')} 
                        className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95">
                        ✅ কনফার্ম
                      </button>
                      <button onClick={() => openModal(item._id, 'rejected')} 
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95">
                        ❌ বাতিল
                      </button>
                    </div>
                  )}
                </div>

                {/* 🎯 নোট — অটো সেভ */}
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
                    className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-amber-500 transition"
                  />
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* মডাল */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`bg-gradient-to-b from-slate-900 to-slate-950 border p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl ${
            modal.status === 'approved' ? 'border-emerald-500/30' : 'border-rose-500/30'
          }`}>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${
                modal.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>{modal.status === 'approved' ? '✅' : '❌'}</div>
              <h3 className="text-base font-extrabold text-white">
                {modal.status === 'approved' ? 'ডিপোজিট কনফার্ম নিশ্চিত করুন' : 'ডিপোজিট বাতিল নিশ্চিত করুন'}
              </h3>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">পরিমাণ:</span>
                <span className="font-bold text-emerald-400 font-mono">৳{modal.amount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">ইউজার:</span>
                <span className="font-bold text-slate-300 font-mono">{modal.uid}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">ট্রানজেকশন:</span>
                <span className="font-bold text-cyan-400 font-mono text-[10px]">{modal.transactionId}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold">📝 অ্যাডমিন নোট (ঐচ্ছিক)</label>
              <textarea 
                value={modal.note}
                maxLength={200}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="নোট লিখুন..."
                rows={3}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-white outline-none resize-none ${
                  modal.status === 'approved' ? 'border-slate-700 focus:border-emerald-500' 
                  : 'border-slate-700 focus:border-rose-500'
                }`}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={closeModal} disabled={processing}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs disabled:opacity-50">
                না
              </button>
              <button onClick={executeUpdate} disabled={processing}
                className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs disabled:opacity-50 flex justify-center items-center gap-2 ${
                  modal.status === 'approved' ? 'from-emerald-600 to-teal-600' : 'from-rose-600 to-pink-600'
                }`}>
                {processing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ...
                  </>
                ) : (modal.status === 'approved' ? 'হ্যাঁ, কনফার্ম' : 'হ্যাঁ, বাতিল')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}