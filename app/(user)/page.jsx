// 'use client';
// import Link from 'next/link';

// export default function HomePage() {
//   return (
//     <div className="max-w-md mx-auto space-y-6 pb-24 px-4 pt-4">
      
//       {/* আই-ক্যাচিং এবং রেসপন্সিভ লগইন বাটন (নতুন যুক্ত করা হয়েছে) */}
//       <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/40 flex items-center justify-between shadow-xl">
//         <div className="flex items-center gap-2">
//           <span className="text-xl">🔐</span>
//           <div>
//             <h3 className="text-xs font-bold text-white">অ্যাকাউন্টে প্রবেশ করুন</h3>
//             <p className="text-[10px] text-slate-400">লগইন করে সম্পূর্ণ অ্যাপের এক্সেস নিন</p>
//           </div>
//         </div>
//         <Link
//           href="/login"
//           className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-900/20 whitespace-nowrap"
//         >
//           লগইন করুন
//         </Link>
//       </div>

//       {/* ওয়েলকাম ব্যানার */}
//       <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900 p-6 rounded-2xl border border-emerald-500/30 text-center space-y-3 shadow-xl">
//         <span className="text-4xl">🎮</span>
//         <h1 className="text-xl font-black text-white tracking-wide">
//           রিয়েল-টাইম প্রেডিকশন গেমে স্বাগতম!
//         </h1>
//         <p className="text-xs text-slate-300 leading-relaxed">
//           আমাদের প্ল্যাটফর্মে আপনি সঠিক অ্যানালাইসিস এবং বুদ্ধিমত্তা খাটিয়ে প্রেডিকশন করতে পারেন। গেম খেলার পাশাপাশি নিজের ব্যালেন্স ও রুলস সম্পর্কে সর্বদা সচেতন থাকুন।
//         </p>
//         <div className="pt-2">
//           <Link
//             href="/game"
//             className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg"
//           >
//             🚀 গেম রুমে প্রবেশ করুন
//           </Link>
//         </div>
//       </div>

//       {/* গেমের নিয়মাবলি (Rules) */}
//       <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
//         <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
//           <span>📋</span> গেমের মূল নিয়মাবলি
//         </h2>
//         <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
//           <li>প্রতিটি পিরিয়ডের সময়সীমা ৩০ সেকেন্ড। টাইমার শেষ হওয়ার ৫ সেকেন্ড আগে বেটিং বন্ধ হয়ে যায়।</li>
//           <li><strong className="text-emerald-400">BIG</strong> সিলেক্ট করলে ফলাফল ৫ থেকে ৯ এর মধ্যে হতে হবে।</li>
//           <li><strong className="text-rose-400">SMALL</strong> সিলেক্ট করলে ফলাফল ০ থেকে ৪ এর মধ্যে হতে হবে।</li>
//           <li>প্রতিটি রাউন্ড শেষে স্বয়ংক্রিয়ভাবে ফলাফল জেনারেট হয় এবং জয়ীদের ব্যালেন্স আপডেট করা হয়।</li>
//         </ul>
//       </div>

//       {/* সতর্কতা বাণী (Warning & Disclaimer) */}
//       <div className="bg-rose-950/30 p-5 rounded-2xl border border-rose-500/30 space-y-3 shadow-lg">
//         <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2 uppercase tracking-wider">
//           <span>⚠️</span> গুরুত্বপূর্ণ সতর্কতা বাণী
//         </h2>
//         <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
//           <p>
//             • এই গেমটি শুধুমাত্র বিনোদন এবং বুদ্ধিমত্তা যাচাইয়ের জন্য। এখানে আর্থিক ঝুঁকি রয়েছে, তাই নিজ দায়িত্বে অংশ নিন।
//           </p>
//           <p>
//             • কোনো অবস্থাতেই অতিরিক্ত বা ঋণ করে গেম খেলবেন না। আপনার সামর্থ্যের মধ্যে থেকে বিনোদন উপভোগ করুন।
//           </p>
//           <p>
//             • অপ্রাপ্তবয়স্কদের জন্য এই প্ল্যাটফর্মে প্রবেশ বা লেনদেন সম্পূর্ণ নিষিদ্ধ।
//           </p>
//         </div>
//       </div>

//       {/* হেল্প ও সাপোর্ট সেকশন */}
//       <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center space-y-2 shadow-lg">
//         <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">কোনো সমস্যায় পড়েছেন?</h3>
//         <p className="text-xs text-slate-400">আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করতে পারেন যেকোনো সময়।</p>
//         <div className="pt-1">
//           <span className="inline-block bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-xl border border-slate-700 font-medium">
//             support@gameapp.com
//           </span>
//         </div>
//       </div>

//     </div>
//   );
// }

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser.uid || savedUser.phone) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setIsLoggedIn(false);
      window.location.replace('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      
      <div className="w-full max-w-md md:max-w-5xl space-y-4 md:space-y-6">
        
        {/* লগইন/লগআউট কার্ড */}
        <div className={`relative overflow-hidden p-4 md:p-5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 transition-all duration-300 ${
          isLoggedIn 
            ? 'bg-gradient-to-r from-emerald-900/30 to-slate-900 border-emerald-500/40' 
            : 'bg-gradient-to-r from-slate-900 to-slate-900 border-emerald-500/40'
        }`}>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2.5 md:gap-3 relative z-10 min-w-0 flex-1">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl flex-shrink-0 ${
              isLoggedIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
            }`}>
              <i className={`fa-solid ${isLoggedIn ? 'fa-circle-check' : 'fa-lock'}`}></i>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs md:text-sm font-bold text-white truncate">
                {isLoggedIn ? 'অ্যাকাউন্টে লগইন করা আছে' : 'অ্যাকাউন্টে প্রবেশ করুন'}
              </h3>
              <p className="text-[10px] md:text-xs text-slate-400 truncate">
                {isLoggedIn ? 'আপনি সফলভাবে লগইন করেছেন' : 'লগইন করে সম্পূর্ণ অ্যাপের এক্সেস নিন'}
              </p>
            </div>
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="relative z-10 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs md:text-sm px-3.5 md:px-5 py-2.5 rounded-xl transition shadow-lg shadow-rose-900/30 whitespace-nowrap cursor-pointer flex items-center gap-1.5 active:scale-95 flex-shrink-0"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="hidden md:inline">লগআউট</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="relative z-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm px-3.5 md:px-5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-900/30 whitespace-nowrap flex items-center gap-1.5 active:scale-95 flex-shrink-0"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              <span className="hidden md:inline">লগইন করুন</span>
            </Link>
          )}
        </div>

        {/* হিরো ওয়েলকাম ব্যানার */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/50 via-slate-900 to-slate-900 rounded-3xl border border-emerald-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 p-6 md:p-10 text-center space-y-4 md:space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-900/50 text-3xl md:text-4xl">
              🎮
            </div>
            
            <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              রিয়েল-টাইম প্রেডিকশন <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">গেমে স্বাগতম!</span>
            </h1>
            
            <p className="text-xs md:text-sm lg:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              আমাদের প্ল্যাটফর্মে আপনি সঠিক অ্যানালাইসিস এবং বুদ্ধিমত্তা খাটিয়ে প্রেডিকশন করতে পারেন। গেম খেলার পাশাপাশি নিজের ব্যালেন্স ও রুলস সম্পর্কে সর্বদা সচেতন থাকুন।
            </p>
            
            <div className="pt-2 md:pt-3 flex flex-col md:flex-row gap-3 justify-center items-center">
              <Link
                href="/game"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm md:text-base px-6 md:px-8 py-3 md:py-4 rounded-2xl transition shadow-xl shadow-emerald-950/50 border border-emerald-500/30 active:scale-95 w-full md:w-auto justify-center"
              >
                <i className="fa-solid fa-rocket"></i>
                গেম রুমে প্রবেশ করুন
              </Link>
            </div>
          </div>
        </div>

        {/* ডেস্কটপে ২ কলাম: রুলস ও সতর্কতা */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          {/* গেমের নিয়মাবলি */}
          <div className="relative overflow-hidden bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-lg hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <i className="fa-solid fa-clipboard-list text-base md:text-lg"></i>
              </div>
              <h2 className="text-sm md:text-base font-bold text-amber-400 uppercase tracking-wider">
                গেমের মূল নিয়মাবলি
              </h2>
            </div>
            
            <ul className="space-y-2.5 md:space-y-3 text-xs md:text-sm text-slate-300 leading-relaxed relative z-10">
              <li className="flex gap-2.5">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                <span>প্রতিটি পিরিয়ডের সময়সীমা ৩০ সেকেন্ড। টাইমার শেষ হওয়ার ৫ সেকেন্ড আগে বেটিং বন্ধ হয়ে যায়।</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                <span><strong className="text-emerald-400 font-bold">BIG</strong> সিলেক্ট করলে ফলাফল ৫ থেকে ৯ এর মধ্যে হতে হবে।</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                <span><strong className="text-rose-400 font-bold">SMALL</strong> সিলেক্ট করলে ফলাফল ০ থেকে ৪ এর মধ্যে হতে হবে।</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                <span>প্রতিটি রাউন্ড শেষে স্বয়ংক্রিয়ভাবে ফলাফল জেনারেট হয় এবং জয়ীদের ব্যালেন্স আপডেট করা হয়।</span>
              </li>
            </ul>
          </div>

          {/* সতর্কতা বাণী */}
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-950/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-rose-500/30 shadow-lg hover:border-rose-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-base md:text-lg"></i>
              </div>
              <h2 className="text-sm md:text-base font-bold text-rose-400 uppercase tracking-wider">
                গুরুত্বপূর্ণ সতর্কতা
              </h2>
            </div>
            
            <div className="space-y-2.5 md:space-y-3 text-xs md:text-sm text-slate-300 leading-relaxed relative z-10">
              <div className="flex gap-2.5">
                <span className="text-rose-400 mt-0.5 flex-shrink-0">•</span>
                <span>এই গেমটি শুধুমাত্র বিনোদন এবং বুদ্ধিমত্তা যাচাইয়ের জন্য। এখানে আর্থিক ঝুঁকি রয়েছে, তাই নিজ দায়িত্বে অংশ নিন।</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-rose-400 mt-0.5 flex-shrink-0">•</span>
                <span>কোনো অবস্থাতেই অতিরিক্ত বা ঋণ করে গেম খেলবেন না। আপনার সামর্থ্যের মধ্যে থেকে বিনোদন উপভোগ করুন।</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-rose-400 mt-0.5 flex-shrink-0">•</span>
                <span>অপ্রাপ্তবয়স্কদের জন্য এই প্ল্যাটফর্মে প্রবেশ বা লেনদেন সম্পূর্ণ নিষিদ্ধ।</span>
              </div>
            </div>
          </div>

        </div>

        {/* হেল্প ও সাপোর্ট সেকশন */}
        <div className="relative overflow-hidden bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-lg text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
              <i className="fa-solid fa-headset text-lg"></i>
            </div>
            <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider">কোনো সমস্যায় পড়েছেন?</h3>
            <p className="text-xs md:text-sm text-slate-400">আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করতে পারেন যেকোনো সময়।</p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 text-xs md:text-sm px-4 md:px-5 py-2.5 md:py-3 rounded-xl border border-slate-700 font-medium hover:border-emerald-500/30 transition cursor-pointer">
                <i className="fa-solid fa-envelope text-emerald-400"></i>
                support@gameapp.com
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}