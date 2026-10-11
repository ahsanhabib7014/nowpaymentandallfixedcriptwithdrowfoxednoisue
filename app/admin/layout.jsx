// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import Link from 'next/link';
// import jwt from 'jsonwebtoken';

// export const metadata = {
//   title: 'Admin Control Panel - Big/Small Prediction',
//   description: 'Secure Admin Management Dashboard',
// };

// export default async function AdminLayout({ children }) {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get('token')?.value || cookieStore.get('user')?.value;

//     // টোকেন না থাকলে সরাসরি লগইন পেজে রিডাইরেক্ট হবে
//     if (!token) {
//       redirect('/login');
//     }

//     // সার্ভার সাইডে ক্রিপ্টোগ্রাফিক্যালি টোকেন ভেরিফাই করা এবং রোল চেক করা
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // যদি টোকেন ভ্যালিড না হয় বা রোল অ্যাডমিন না হয়
//     if (!decoded || decoded.role !== 'admin') {
//       redirect('/login');
//     }
//   } catch (error) {
//     // টোকেন মেয়াদোত্তীর্ণ বা ভুয়া হলে লগইনে পাঠিয়ে দিবে
//     redirect('/login');
//   }

//   return (
//     <div className="bg-slate-950 text-slate-100 min-h-screen font-sans">
//       {/* মোবাইল ফ্রেম ও স্ট্যান্ডার্ড উইডথ বজায় রাখার জন্য কন্টেইনার */}
//       <div className="max-w-md mx-auto p-4 pb-24 relative min-h-screen">
        
//         {/* অ্যাডমিন ড্যাশবোর্ড হেডার ব্র্যান্ডিং */}
//         <div className="mb-4">
//           <Link 
//             href="/admin" 
//             className="flex items-center justify-between bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 p-3.5 rounded-2xl hover:border-emerald-500/60 transition shadow-md group"
//           >
//             <div className="flex items-center gap-2.5">
//               <span className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
//                 <i className="fa-solid fa-gauge-high"></i>
//               </span>
//               <div>
//                 <h2 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition">অ্যাডমিন কন্ট্রোল প্যানেল</h2>
//                 <p className="text-[10px] text-slate-400">ম্যানেজমেন্ট হোম পেজে যেতে ক্লিক করুন</p>
//               </div>
//             </div>
//             <i className="fa-solid fa-arrow-right text-emerald-400 text-xs group-hover:translate-x-1 transition-transform"></i>
//           </Link>
//         </div>

//         {/* মূল অ্যাডমিন পেজ বা সাব-ফোল্ডারের কন্টেন্ট এখানে রেন্ডার হবে */}
//         <main>{children}</main>

//         {/* অ্যাডমিন ডেডিকেটেড বটম নেভিগেশন বার */}
//         <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900 border-t border-slate-800 p-3 flex justify-around text-slate-400 text-xs z-50 shadow-2xl">
//           <Link href="/admin" className="flex flex-col items-center hover:text-emerald-400 transition">
//             <i className="fa-solid fa-house text-lg mb-1"></i> হোম
//           </Link>
//           <Link href="/admin/deposits" className="flex flex-col items-center hover:text-emerald-400 transition">
//             <i className="fa-solid fa-wallet text-lg mb-1"></i> ডিপোজিট
//           </Link>
//           <Link href="/admin/withdraws" className="flex flex-col items-center hover:text-emerald-400 transition">
//             <i className="fa-solid fa-money-bill-transfer text-lg mb-1"></i> উইথড্র
//           </Link>
//           <Link href="/admin/payment-methods" className="flex flex-col items-center hover:text-emerald-400 transition">
//             <i className="fa-solid fa-gears text-lg mb-1"></i> গেটওয়ে
//           </Link>
//         </nav>

//       </div>
//     </div>
//   );
// }

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';

export const metadata = {
  title: 'Admin Control Panel - Big/Small Prediction',
  description: 'Secure Admin Management Dashboard',
};

export default async function AdminLayout({ children }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('user')?.value;

    // টোকেন না থাকলে সরাসরি লগইন পেজে রিডাইরেক্ট হবে
    if (!token) {
      redirect('/login');
    }

    // সার্ভার সাইডে ক্রিপ্টোগ্রাফিক্যালি টোকেন ভেরিফাই করা এবং রোল চেক করা
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // যদি টোকেন ভ্যালিড না হয় বা রোল অ্যাডমিন না হয়
    if (!decoded || decoded.role !== 'admin') {
      redirect('/login');
    }
  } catch (error) {
    // টোকেন মেয়াদোত্তীর্ণ বা ভুয়া হলে লগইনে পাঠিয়ে দিবে
    redirect('/login');
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans">
      {/* মোবাইল ফ্রেম ও স্ট্যান্ডার্ড উইডথ বজায় রাখার জন্য কন্টেইনার */}
      <div className="max-w-md mx-auto p-4 pb-24 relative min-h-screen">
        
        {/* অ্যাডমিন ড্যাশবোর্ড হেডার ব্র্যান্ডিং */}
        <div className="mb-4">
          <Link 
            href="/admin" 
            className="flex items-center justify-between bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 p-3.5 rounded-2xl hover:border-emerald-500/60 transition shadow-md group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-gauge-high"></i>
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition">অ্যাডমিন কন্ট্রোল প্যানেল</h2>
                <p className="text-[10px] text-slate-400">ম্যানেজমেন্ট হোম পেজে যেতে ক্লিক করুন</p>
              </div>
            </div>
            <i className="fa-solid fa-arrow-right text-emerald-400 text-xs group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>

        {/* মূল অ্যাডমিন পেজ বা সাব-ফোল্ডারের কন্টেন্ট এখানে রেন্ডার হবে */}
        <main>{children}</main>

        {/* অ্যাডমিন ডেডিকেটেড বটম নেভিগেশন বার */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900 border-t border-slate-800 p-3 flex justify-between items-center text-slate-400 text-[10px] z-50 shadow-2xl">
          
          <Link href="/admin" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-house text-lg mb-1"></i> হোম
          </Link>
          
          <Link href="/admin/deposits" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-wallet text-lg mb-1"></i> ডিপোজিট
          </Link>
          
          <Link href="/admin/withdraws" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-money-bill-transfer text-lg mb-1"></i> উইথড্র
          </Link>
          
          {/* নতুন যোগ করা পেমেন্ট গেটওয়ে অপশন */}
          <Link href="/admin/payment-methods" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-gears text-lg mb-1"></i> পেমেন্ট মেথডস
          </Link>
          <Link href="/admin/payments" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-gears text-lg mb-1"></i> পেমেন্ট গেটওয়ে
          </Link>
        </nav>

      </div>
    </div>
  );
}