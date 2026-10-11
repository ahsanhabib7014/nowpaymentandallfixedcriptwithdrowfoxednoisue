'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExchangeRatePage() {
  const router = useRouter();
  const [rate, setRate] = useState(120);
  const [newRate, setNewRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchRate = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/exchange-rate', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) { router.push('/admin/login'); return; }
      const data = await res.json();
      if (data.success) {
        setRate(data.rate);
        setNewRate(String(data.rate));
        setUpdatedAt(data.updatedAt);
      }
    } catch (err) { 
      console.error(err); 
      showToast('Rate load করতে সমস্যা!', 'error');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRate(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    const parsed = Number(newRate);
    if (isNaN(parsed) || parsed <= 0) {
      showToast('সঠিক rate দিন!', 'error');
      return;
    }

    if (parsed < 50 || parsed > 500) {
      showToast('Rate ৫০ থেকে ৫০০ এর মধ্যে হতে হবে!', 'error');
      return;
    }

    if (parsed === rate) {
      showToast('Rate অপরিবর্তিত!', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rate: parsed })
      });
      const data = await res.json();
      if (data.success) {
        setRate(parsed);
        setUpdatedAt(data.updatedAt);
        showToast(data.message, 'success');
      } else {
        showToast(data.message || 'সমস্যা!', 'error');
      }
    } catch (err) { 
      console.error(err); 
      showToast('সার্ভার এরর!', 'error');
    }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setNewRate('120');
    showToast('Default rate (120) সেট — সেভ করুন', 'success');
  };

  if (loading) {
    return (
      <div className="p-8 text-white bg-[#07090e] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-5 lg:p-8 space-y-4 text-white min-h-screen bg-[#07090e]">

      {toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[calc(100%-1.5rem)]">
          <div className={`px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl text-center text-xs font-bold ${
            toast.type === 'success' 
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-400' 
              : 'bg-rose-950/95 border-rose-500/40 text-rose-400'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-lg font-extrabold text-emerald-400 flex items-center gap-2">
            <i className="fa-solid fa-dollar-sign"></i>
            <span>USD → BDT Exchange Rate</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            ডলারে ডিপোজিট করলে এই rate দিয়ে টাকায় convert হবে।
          </p>
        </div>
        <button 
          onClick={() => router.back()}
          className="text-[11px] sm:text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-slate-300 border border-slate-700 self-start sm:self-auto flex items-center gap-1.5"
        >
          <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
        </button>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 sm:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider font-semibold">
          বর্তমান Exchange Rate
        </p>
        <h2 className="text-3xl sm:text-5xl font-black text-amber-400 font-mono mt-2">
          ৳{rate}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-2">
          <span className="text-white font-bold">১ USD</span> = <span className="text-emerald-400 font-bold">৳{rate} BDT</span>
        </p>
        {updatedAt && (
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            <i className="fa-solid fa-clock mr-1"></i>
            Last updated: {new Date(updatedAt).toLocaleString('bn-BD')}
          </p>
        )}
      </div>

      <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <i className="fa-solid fa-pen-to-square text-emerald-400"></i>
          <h3 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">
            নতুন Rate সেট করুন
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[11px] sm:text-xs text-slate-400 block mb-2 font-semibold">
              USD → BDT Rate (১ USD = কত টাকা?)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">৳</span>
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="যেমন: 120"
                min="50"
                max="500"
                step="0.01"
                className="w-full bg-slate-950 border border-slate-700 p-3 pl-9 rounded-xl text-sm text-white outline-none focus:border-emerald-500 font-mono font-bold"
                required
              />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5">
              Range: ৫০ থেকে ৫০০ এর মধ্যে
            </p>
          </div>

          {newRate && Number(newRate) > 0 && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/20 space-y-2">
              <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Calculation Preview</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">$10 deposit</span>
                <span className="font-mono font-bold text-emerald-400">৳{(10 * Number(newRate)).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">$50 deposit</span>
                <span className="font-mono font-bold text-emerald-400">৳{(50 * Number(newRate)).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">$100 deposit</span>
                <span className="font-mono font-bold text-emerald-400">৳{(100 * Number(newRate)).toFixed(0)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl font-bold text-xs transition cursor-pointer border border-slate-700"
            >
              <i className="fa-solid fa-rotate-left mr-1"></i> Default
            </button>
            <button
              type="submit"
              disabled={saving || !newRate || Number(newRate) === rate}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  সেভ হচ্ছে...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i>
                  নতুন Rate সেভ করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-950/30 border border-blue-500/30 p-4 rounded-xl space-y-2">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-circle-info text-blue-400"></i>
          <h4 className="text-xs font-bold text-blue-400">কীভাবে কাজ করে?</h4>
        </div>
        <ul className="text-[11px] text-slate-400 space-y-1.5 pl-1">
          <li>• <strong className="text-white">Binance Pay, USDT, TRX</strong> — USD amount দিলে BDT-এ convert হবে।</li>
          <li>• <strong className="text-white">Bkash, Nagad, Rocket, Upay</strong> — BDT amount হিসেবেই থাকবে।</li>
          <li>• Admin approve করলে user-এর balance-এ <strong className="text-emerald-400">BDT amount</strong> যোগ হবে।</li>
          <li>• Rate পরিবর্তন করলে <strong className="text-amber-400">future deposit</strong>-এ apply হবে।</li>
        </ul>
      </div>

    </div>
  );
}