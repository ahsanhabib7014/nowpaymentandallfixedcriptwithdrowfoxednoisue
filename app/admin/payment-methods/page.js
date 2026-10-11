// 'use client';
// import { useState, useEffect } from 'react';

// export default function AdminPaymentMethodsPage() {
//   const [methods, setMethods] = useState([]);
//   const [methodName, setMethodName] = useState('');
//   const [loading, setLoading] = useState(false);

//   // মেথডগুলো ফেচ করা (HttpOnly কুকি ব্রাউজার স্বয়ংক্রিয়ভাবে পাস করবে)
//   const fetchMethods = async () => {
//     try {
//       const res = await fetch('/api/admin/payment-methods');
//       const data = await res.json();
//       if (data.success) {
//         setMethods(data.methods);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchMethods();
//   }, []);

//   // নতুন মেথড যোগ করার হ্যান্ডলার
//   const handleAddMethod = async (e) => {
//     e.preventDefault();
//     if (!methodName.trim()) {
//       alert('দয়া করে মেথডের নাম দিন!');
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await fetch('/api/admin/payment-methods', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ methodName: methodName.trim() })
//       });
//       const data = await res.json();
//       alert(data.message);
//       if (data.success) {
//         setMethodName('');
//         fetchMethods();
//       }
//     } catch (err) {
//       console.error(err);
//       alert('ত্রুটি ঘটেছে!');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // অন/অফ (Toggle Status) করার ফাংশন
//   const handleToggleStatus = async (id, currentStatus) => {
//     try {
//       const res = await fetch('/api/admin/payment-methods', {
//         method: 'PUT',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ id, isActive: !currentStatus })
//       });
//       const data = await res.json();
//       if (data.success) {
//         fetchMethods();
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // মেথড ডিলিট করার ফাংশন
//   const handleDelete = async (id) => {
//     if (!confirm('আপনি কি নিশ্চিত এই পেমেন্ট মেথডটি ডিলিট করতে চান?')) return;

//     try {
//       const res = await fetch(`/api/admin/payment-methods?id=${id}`, {
//         method: 'DELETE'
//       });
//       const data = await res.json();
//       alert(data.message);
//       if (data.success) {
//         fetchMethods();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-6 mt-10 shadow-xl">
//       <h2 className="text-xl font-bold text-emerald-400 text-center">পেমেন্ট মেথড ম্যানেজমেন্ট</h2>

//       {/* মেথড যোগ করার ফর্ম */}
//       <form onSubmit={handleAddMethod} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
//         <label className="text-xs text-slate-400 block">নতুন পেমেন্ট মেথডের নাম লিখুন</label>
//         <div className="flex gap-2">
//           <input 
//             type="text" 
//             placeholder="যেমন: বিকাশ, নগদ, USDT ইত্যাদি" 
//             value={methodName}
//             onChange={(e) => setMethodName(e.target.value)}
//             className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-emerald-500"
//             required
//           />
//           <button 
//             type="submit" 
//             disabled={loading}
//             className="bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-xl font-bold text-sm transition whitespace-nowrap shadow-lg"
//           >
//             {loading ? 'যোগ হচ্ছে...' : 'যোগ করুন'}
//           </button>
//         </div>
//       </form>

//       {/* মেথডগুলোর লিস্ট */}
//       <div className="space-y-3">
//         <h3 className="text-xs font-bold text-slate-400">সকল পেমেন্ট মেথডের তালিকা</h3>
        
//         {methods.length === 0 ? (
//           <p className="text-center text-slate-500 py-6 text-sm">কোনো পেমেন্ট মেথড যোগ করা হয়নি।</p>
//         ) : (
//           <div className="space-y-2">
//             {methods.map((m) => (
//               <div key={m._id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
//                 <div className="flex items-center gap-3">
//                   <span className="font-bold text-white text-base">{m.methodName}</span>
//                   <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${m.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
//                     {m.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => handleToggleStatus(m._id, m.isActive)}
//                     className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${m.isActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
//                   >
//                     {m.isActive ? 'বন্ধ করুন (Off)' : 'চালু করুন (On)'}
//                   </button>
//                   <button
//                     onClick={() => handleDelete(m._id)}
//                     className="bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg text-xs font-bold transition text-white"
//                   >
//                     ডিলিট
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// .....................................................


// 'use client';
// import { useState, useEffect } from 'react';

// export default function AdminPaymentMethodsPage() {
//   const [methods, setMethods] = useState([]);
//   const [methodName, setMethodName] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   // Toast স্টেট (মাঝখানে দেখানোর জন্য)
//   const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

//   // Toast দেখানোর হেল্পার ফাংশন
//   const showToast = (message, type = 'success') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => {
//       setToast({ show: false, message: '', type: 'success' });
//     }, 2000);
//   };

//   // মেথডগুলো ফেচ করা
//   const fetchMethods = async () => {
//     try {
//       const res = await fetch('/api/admin/payment-methods');
//       const data = await res.json();
//       if (data.success) {
//         setMethods(data.methods);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchMethods();
//   }, []);

//   // নতুন মেথড যোগ করার হ্যান্ডলার
//   const handleAddMethod = async (e) => {
//     e.preventDefault();
//     if (!methodName.trim()) {
//       showToast('দয়া করে মেথডের নাম দিন!', 'error');
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await fetch('/api/admin/payment-methods', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ methodName: methodName.trim() })
//       });
//       const data = await res.json();
//       showToast(data.message, data.success ? 'success' : 'error');
//       if (data.success) {
//         setMethodName('');
//         fetchMethods();
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('ত্রুটি ঘটেছে!', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // অন/অফ (Toggle Status)
//   const handleToggleStatus = async (id, currentStatus) => {
//     try {
//       const res = await fetch('/api/admin/payment-methods', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id, isActive: !currentStatus })
//       });
//       const data = await res.json();
//       if (data.success) {
//         showToast('স্ট্যাটাস পরিবর্তন হয়েছে!', 'success');
//         fetchMethods();
//       } else {
//         showToast(data.message, 'error');
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('ত্রুটি ঘটেছে!', 'error');
//     }
//   };

//   // মেথড ডিলিট
//   const handleDelete = async (id) => {
//     try {
//       const res = await fetch(`/api/admin/payment-methods?id=${id}`, {
//         method: 'DELETE'
//       });
//       const data = await res.json();
//       showToast(data.message, data.success ? 'success' : 'error');
//       if (data.success) {
//         fetchMethods();
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('ত্রুটি ঘটেছে!', 'error');
//     }
//   };

//   return (
//     <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-5 sm:space-y-6 mt-4 sm:mt-10 shadow-xl relative">
      
//       {/* স্ক্রিনের মাঝখানে Toast Message */}
//       {toast.show && (
//         <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
//           <div className={`px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm sm:text-base animate-pulse ${
//             toast.type === 'success' 
//               ? 'bg-emerald-600 text-white' 
//               : 'bg-rose-600 text-white'
//           }`}>
//             {toast.message}
//           </div>
//         </div>
//       )}

//       <h2 className="text-lg sm:text-xl font-bold text-emerald-400 text-center">পেমেন্ট মেথড ম্যানেজমেন্ট</h2>

//       {/* মেথড যোগ করার ফর্ম */}
//       <form onSubmit={handleAddMethod} className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-3">
//         <label className="text-xs text-slate-400 block">নতুন পেমেন্ট মেথডের নাম লিখুন</label>
//         <div className="flex flex-col sm:flex-row gap-2">
//           <input 
//             type="text" 
//             placeholder="যেমন: বিকাশ, নগদ, USDT ইত্যাদি" 
//             value={methodName}
//             onChange={(e) => setMethodName(e.target.value)}
//             className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-emerald-500"
//             required
//           />
//           <button 
//             type="submit" 
//             disabled={loading}
//             className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-xl font-bold text-sm transition whitespace-nowrap shadow-lg disabled:opacity-50"
//           >
//             {loading ? 'যোগ হচ্ছে...' : 'যোগ করুন'}
//           </button>
//         </div>
//       </form>

//       {/* মেথডগুলোর লিস্ট */}
//       <div className="space-y-3">
//         <h3 className="text-xs font-bold text-slate-400">সকল পেমেন্ট মেথডের তালিকা</h3>
        
//         {methods.length === 0 ? (
//           <p className="text-center text-slate-500 py-6 text-sm">কোনো পেমেন্ট মেথড যোগ করা হয়নি।</p>
//         ) : (
//           <div className="space-y-2">
//             {methods.map((m) => (
//               <div 
//                 key={m._id} 
//                 className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
//               >
//                 <div className="flex flex-wrap items-center gap-2 sm:gap-3">
//                   <span className="font-bold text-white text-sm sm:text-base">{m.methodName}</span>
//                   <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold ${m.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
//                     {m.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-2 w-full sm:w-auto">
//                   <button
//                     onClick={() => handleToggleStatus(m._id, m.isActive)}
//                     className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition text-white ${m.isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
//                   >
//                     {m.isActive ? 'বন্ধ করুন (Off)' : 'চালু করুন (On)'}
//                   </button>
//                   <button
//                     onClick={() => handleDelete(m._id)}
//                     className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition text-white"
//                   >
//                     ডিলিট
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// .........................................................................

'use client';
import { useState, useEffect } from 'react';

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [methodName, setMethodName] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔔 কাস্টম কনফার্ম মডাল স্টেট
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

  // 🔔 কাস্টম কনফার্ম ওপেন করার হেল্পার
  const askConfirm = ({ title, message, icon = '⚠️', iconColor = 'amber', confirmText = 'হ্যাঁ, নিশ্চিত', confirmClass = 'emerald', onYes }) => {
    setConfirmData({ title, message, icon, iconColor, confirmText, confirmClass, onYes });
  };

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/admin/payment-methods');
      const data = await res.json();
      if (data.success) {
        setMethods(data.methods);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  // ✅ আসল যোগ করার কাজ (কনফার্মের পরে)
  const performAddMethod = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodName: methodName.trim() })
      });
      const data = await res.json();
      showToast(data.message || 'মেথড যোগ করা হয়েছে!', data.success ? 'success' : 'error');
      if (data.success) {
        setMethodName('');
        fetchMethods();
      }
    } catch (err) {
      console.error(err);
      showToast('ত্রুটি ঘটেছে!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 নতুন মেথড যোগ — কনফার্ম সহ
  const handleAddMethod = (e) => {
    e.preventDefault();
    if (!methodName.trim()) {
      showToast('দয়া করে মেথডের নাম দিন!', 'error');
      return;
    }

    askConfirm({
      title: 'নতুন মেথড যোগ নিশ্চিত করুন',
      message: `আপনি কি "${methodName.trim()}" নামে নতুন পেমেন্ট মেথড যোগ করতে চান?`,
      icon: '➕',
      iconColor: 'emerald',
      confirmText: 'হ্যাঁ, যোগ করুন',
      confirmClass: 'emerald',
      onYes: performAddMethod
    });
  };

  // ✅ অন/অফ (Toggle) — কনফার্ম সহ
  const performToggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          currentStatus ? 'মেথড বন্ধ করা হয়েছে!' : 'মেথড চালু করা হয়েছে!',
          'success'
        );
        fetchMethods();
      } else {
        showToast(data.message || 'সমস্যা হয়েছে!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('ত্রুটি ঘটেছে!', 'error');
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    askConfirm({
      title: currentStatus ? 'মেথড বন্ধ নিশ্চিত করুন' : 'মেথড চালু নিশ্চিত করুন',
      message: currentStatus
        ? 'আপনি কি এই পেমেন্ট মেথডটি বন্ধ করতে চান?'
        : 'আপনি কি এই পেমেন্ট মেথডটি চালু করতে চান?',
      icon: currentStatus ? '🚫' : '✅',
      iconColor: currentStatus ? 'rose' : 'emerald',
      confirmText: currentStatus ? 'হ্যাঁ, বন্ধ করুন' : 'হ্যাঁ, চালু করুন',
      confirmClass: currentStatus ? 'rose' : 'emerald',
      onYes: () => performToggleStatus(id, currentStatus)
    });
  };

  // ✅ ডিলিট — কনফার্ম সহ
  const performDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/payment-methods?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      showToast(data.message || 'ডিলিট করা হয়েছে!', data.success ? 'success' : 'error');
      if (data.success) {
        fetchMethods();
      }
    } catch (err) {
      console.error(err);
      showToast('ত্রুটি ঘটেছে!', 'error');
    }
  };

  const handleDelete = (id) => {
    askConfirm({
      title: 'মেথড ডিলিট নিশ্চিত করুন',
      message: 'আপনি কি নিশ্চিত এই পেমেন্ট মেথডটি ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।',
      icon: '🗑️',
      iconColor: 'rose',
      confirmText: 'হ্যাঁ, ডিলিট',
      confirmClass: 'rose',
      onYes: () => performDelete(id)
    });
  };

  // 🎨 কালার ম্যাপ
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
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-5 sm:space-y-6 mt-4 sm:mt-10 shadow-xl relative">

      {/* 🍞 টোস্ট কন্টেইনার — মাঝখানে */}
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

      {/* CSS অ্যানিমেশন */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <h2 className="text-lg sm:text-xl font-bold text-emerald-400 text-center">পেমেন্ট মেথড ম্যানেজমেন্ট</h2>

      {/* মেথড যোগ করার ফর্ম — কনফার্ম সহ */}
      <form onSubmit={handleAddMethod} className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-3">
        <label className="text-xs text-slate-400 block">নতুন পেমেন্ট মেথডের নাম লিখুন</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="যেমন: বিকাশ, নগদ, USDT ইত্যাদি"
            value={methodName}
            onChange={(e) => setMethodName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-emerald-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-xl font-bold text-sm transition whitespace-nowrap shadow-lg disabled:opacity-50"
          >
            {loading ? 'যোগ হচ্ছে...' : 'যোগ করুন'}
          </button>
        </div>
      </form>

      {/* মেথডগুলোর লিস্ট */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400">সকল পেমেন্ট মেথডের তালিকা</h3>

        {methods.length === 0 ? (
          <p className="text-center text-slate-500 py-6 text-sm">কোনো পেমেন্ট মেথড যোগ করা হয়নি।</p>
        ) : (
          <div className="space-y-2">
            {methods.map((m) => (
              <div
                key={m._id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              >
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-bold text-white text-sm sm:text-base">{m.methodName}</span>
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold ${m.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {m.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleToggleStatus(m._id, m.isActive)}
                    className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition text-white ${m.isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                  >
                    {m.isActive ? 'বন্ধ করুন (Off)' : 'চালু করুন (On)'}
                  </button>
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition text-white"
                  >
                    ডিলিট
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔔 কাস্টম কনফার্ম মডাল — যোগ, টগল ও ডিলিটে আসবে */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[90] p-4">
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