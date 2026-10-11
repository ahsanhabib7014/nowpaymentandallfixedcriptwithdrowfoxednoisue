// app/(user)/layout.jsx
import Link from 'next/link';

export const metadata = {
  title: 'Big/Small Prediction Game',
  description: 'Real-time prediction gaming platform',
};

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* মূল কন্টেইনার: মোবাইলে ছোট, ডেস্কটপে বড় */}
      <div className="max-w-md md:max-w-5xl mx-auto p-3 md:p-6 pb-24 md:pb-8">
        
        {/* ইউজার হেডার (নেভবার) */}
        <header className="flex justify-between items-center bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 mb-4 shadow-lg">
          <Link 
            href="/" 
            className="font-bold text-emerald-400 text-base md:text-lg flex items-center gap-2 hover:text-emerald-300 transition"
          >
            <i className="fa-solid fa-gamepad text-lg md:text-xl"></i>
            <span>GameApp</span>
          </Link>
          
          {/* <div className="flex gap-2 md:gap-3 text-sm">
            <Link 
              href="/wallet" 
              className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs md:text-sm"
            >
              <i className="fa-solid fa-wallet text-amber-400"></i>
              <span className="hidden md:inline">ওয়ালেট</span>
            </Link>
            <Link 
              href="/profile" 
              className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-xl text-white transition flex items-center gap-1.5 text-xs md:text-sm"
            >
              <i className="fa-solid fa-user"></i>
              <span className="hidden md:inline">প্রোফাইল</span>
            </Link>
          </div> */}
        </header>

        {/* মূল কনটেন্ট */}
        <main>{children}</main>

        {/* বটম নেভিগেশন (মোবাইলের জন্য) */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 flex justify-around text-slate-400 text-xs z-50 shadow-2xl md:hidden">
          <Link href="/" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-house text-lg mb-1"></i>
            <span>হোম</span>
          </Link>
          <Link href="/game" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-dice text-lg mb-1"></i>
            <span>গেম</span>
          </Link>
          <Link href="/wallet" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-wallet text-lg mb-1"></i>
            <span>ওয়ালেট</span>
          </Link>
          <Link href="/referral" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-user-group text-lg mb-1"></i>
            <span>রেফারেল</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center hover:text-emerald-400 transition">
            <i className="fa-solid fa-user text-lg mb-1"></i>
            <span>প্রোফাইল</span>
          </Link>
        </nav>

      </div>
    </div>
  );
}