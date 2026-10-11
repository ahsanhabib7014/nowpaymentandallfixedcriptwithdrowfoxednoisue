

// ..................................................................

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ==========================================
// ✅ Method-specific Config
// ==========================================
const getMethodConfig = (method) => {
  const upper = String(method || '').toUpperCase();
  
  // Crypto detection
  if (upper.includes('TRX') || upper.includes('TRON')) {
    return {
      isCrypto: true,
      currency: 'USD',
      amountLabel: 'টাকার পরিমাণ (USD $)',
      amountPlaceholder: 'যেমন: 10',
      senderLabel: 'TRX Wallet Address',
      senderPlaceholder: 'TXYZ... (৩৪ character)',
      senderMinLength: 20,
      senderMaxLength: 50,
      senderOnlyDigits: false,
      adminLabel: 'অ্যাডমিন TRX Address:'
    };
  }
  
  if (upper.includes('BINANCE') || upper.includes('USDT')) {
    return {
      isCrypto: true,
      currency: 'USD',
      amountLabel: 'টাকার পরিমাণ (USD $)',
      amountPlaceholder: 'যেমন: 10',
      senderLabel: 'Binance Pay ID',
      senderPlaceholder: '541254656',
      senderMinLength: 5,
      senderMaxLength: 20,
      senderOnlyDigits: true,
      adminLabel: 'অ্যাডমিন Binance Pay ID:'
    };
  }
  
  if (upper.includes('BTC') || upper.includes('BITCOIN')) {
    return {
      isCrypto: true,
      currency: 'USD',
      amountLabel: 'টাকার পরিমাণ (USD $)',
      amountPlaceholder: 'যেমন: 10',
      senderLabel: 'Bitcoin Wallet Address',
      senderPlaceholder: 'bc1... or 1...',
      senderMinLength: 26,
      senderMaxLength: 50,
      senderOnlyDigits: false,
      adminLabel: 'অ্যাডমিন BTC Address:'
    };
  }
  
  // Mobile Banking (default)
  return {
    isCrypto: false,
    currency: 'BDT',
    amountLabel: 'টাকার পরিমাণ (৳)',
    amountPlaceholder: 'যেমন: 500',
    senderLabel: 'যে নাম্বার থেকে টাকা পাঠিয়েছেন',
    senderPlaceholder: '01700000000 (১১ ডিজিট)',
    senderMinLength: 11,
    senderMaxLength: 11,
    senderOnlyDigits: true,
    adminLabel: 'অ্যাডমিন নম্বর:'
  };
};

export default function UserDepositPage() {
  const router = useRouter();

  const [activeMethods, setActiveMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  const [amount, setAmount] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  const [trxError, setTrxError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🆕 NowPayments state
  const [npAmount, setNpAmount] = useState('');
  const [npCurrency, setNpCurrency] = useState('usdttrc20');
  const [npLoading, setNpLoading] = useState(false);
  const [showNowPayments, setShowNowPayments] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const methodConfig = getMethodConfig(selectedMethod?.methodName);

  // ✅ Load payment methods
  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const active = data.settings.filter(s => s.isActive);
          setActiveMethods(active);
          if (active.length > 0) setSelectedMethod(active[0]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // ✅ TrxID real-time check
  useEffect(() => {
    const checkTrx = async () => {
      const cleanTrxId = transactionId.trim();
      
      if (!cleanTrxId || cleanTrxId.length < 5) {
        setTrxError('');
        return;
      }

      if (!/^[a-zA-Z0-9]+$/.test(cleanTrxId)) {
        setTrxError('ট্রানজেকশন আইডিতে কোনো বিশেষ চরিত্র বা স্পেস ব্যবহার করা যাবে না!');
        return;
      }

      try {
        const res = await fetch('/api/game/check-trx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ transactionId: cleanTrxId })
        });
        const data = await res.json();
        if (data.exists) {
          setTrxError(data.message);
        } else {
          setTrxError('');
        }
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(checkTrx, 500);
    return () => clearTimeout(timer);
  }, [transactionId]);

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    showToast('নম্বর সফলভাবে কপি করা হয়েছে!', 'success');
  };

  const handleMethodChange = (methodId) => {
    const m = activeMethods.find(item => item._id === methodId);
    setSelectedMethod(m);
    setSenderNumber('');
    setAmount('');
    setTransactionId('');
    setTrxError('');
  };

  const handleSenderChange = (value) => {
    let sanitized = value;
    
    if (methodConfig.senderOnlyDigits) {
      sanitized = value.replace(/\D/g, '');
    } else {
      sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    if (sanitized.length <= methodConfig.senderMaxLength) {
      setSenderNumber(sanitized);
    }
  };

  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    
    if (trxError) {
      showToast('দয়া করে সঠিক ও ইউনিক ট্রানজেকশন আইডি দিন!', 'error');
      return;
    }

    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      showToast('দয়া করে সঠিক পরিমাণ দিন!', 'error');
      return;
    }

    const minAmount = selectedMethod?.minDeposit || (methodConfig.isCrypto ? 4 : 500);
    if (cleanAmount < minAmount) {
      showToast(
        methodConfig.isCrypto 
          ? `সর্বনিম্ন ডিপোজিট $${minAmount}!`
          : `সর্বনিম্ন ডিপোজিট ৳${minAmount}!`, 
        'error'
      );
      return;
    }

    const cleanSenderNumber = senderNumber.trim();
    if (cleanSenderNumber.length < methodConfig.senderMinLength) {
      showToast(
        `${methodConfig.senderLabel} — কমপক্ষে ${methodConfig.senderMinLength} ${methodConfig.senderOnlyDigits ? 'ডিজিট' : 'character'}!`, 
        'error'
      );
      return;
    }

    const cleanTrxId = transactionId.trim().toUpperCase();

    try {
      setLoading(true);
      const res = await fetch('/api/game/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: cleanAmount,
          method: selectedMethod ? `${selectedMethod.methodName}` : 'Bkash',
          accountNumber: cleanSenderNumber,
          transactionId: cleanTrxId
        })
      });
      const data = await res.json();
      
      showToast(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        setAmount('');
        setSenderNumber('');
        setTransactionId('');
      }
    } catch (err) {
      console.error(err);
      showToast('সার্ভার ত্রুটি দেখা দিয়েছে!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 NowPayments Invoice তৈরি
  const handleNowPayments = async () => {
    const cleanAmount = Number(npAmount);

    if (!cleanAmount || cleanAmount < 5) {
      showToast('সর্বনিম্ন $5!', 'error');
      return;
    }

    try {
      setNpLoading(true);
      const res = await fetch('/api/nowpayments/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: cleanAmount,
          payCurrency: npCurrency
        })
      });
      const data = await res.json();

      if (data.success && data.invoice_url) {
        showToast('NowPayments-এ redirect করা হচ্ছে...', 'success');
        setTimeout(() => {
          window.location.href = data.invoice_url;
        }, 500);
      } else {
        showToast(data.message || 'Invoice তৈরি হয়নি!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('সার্ভার ত্রুটি!', 'error');
    } finally {
      setNpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans">
      
      {/* Toast */}
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`px-6 py-5 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full flex flex-col items-center gap-3 border ${
            toast.type === 'success' 
              ? 'bg-slate-900 border-emerald-500 text-emerald-400' 
              : 'bg-slate-900 border-rose-500 text-rose-400'
          }`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check text-3xl' : 'fa-circle-exclamation text-3xl'}`}></i>
            <span className="leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md md:max-w-xl space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <i className="fa-solid fa-download"></i> ডিপোজিট করুন
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        {/* Tab Switcher — Manual / NowPayments */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setShowNowPayments(false)}
            className={`py-2.5 rounded-lg text-xs font-bold transition ${
              !showNowPayments 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <i className="fa-solid fa-hand-holding-dollar mr-1"></i> Manual Deposit
          </button>
          <button
            type="button"
            onClick={() => setShowNowPayments(true)}
            className={`py-2.5 rounded-lg text-xs font-bold transition ${
              showNowPayments 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <i className="fa-solid fa-bolt mr-1"></i> Auto Crypto
          </button>
        </div>

        {/* ============ MANUAL DEPOSIT FORM ============ */}
        {!showNowPayments && (
          <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
            <form onSubmit={handleSubmitDeposit} className="space-y-5">
              
              {/* Payment Method */}
              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">পেমেন্ট মেথড সিলেক্ট করুন</label>
                <select 
                  value={selectedMethod?._id || ''}
                  onChange={(e) => handleMethodChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {activeMethods.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.methodName} {m.accountType ? `(${m.accountType})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Account Number */}
              {selectedMethod && (
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                  <div className="flex justify-between text-xs md:text-sm text-slate-400">
                    <span>{methodConfig.adminLabel} {selectedMethod.accountType ? `(${selectedMethod.accountType})` : ''}</span>
                    <span className="text-amber-400 font-bold">
                      মিনিমাম: {methodConfig.isCrypto ? `$${selectedMethod.minDeposit || 4}` : `৳${selectedMethod.minDeposit || 500}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-base md:text-lg font-bold text-emerald-400 break-all">{selectedMethod.accountNumber}</span>
                    <button 
                      type="button"
                      onClick={() => handleCopy(selectedMethod.accountNumber)}
                      className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
                    >
                      <i className="fa-solid fa-copy"></i> কপি
                    </button>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                  {methodConfig.amountLabel}
                </label>
                <input 
                  type="number" 
                  step="any"
                  min="1"
                  placeholder={methodConfig.amountPlaceholder}
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) setAmount(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 font-mono"
                  required
                />
                {methodConfig.isCrypto && amount && (
                  <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
                    ≈ ৳{(Number(amount) * 120).toFixed(0)} (Rate: $1 = ৳120)
                  </p>
                )}
              </div>

              {/* Sender Number */}
              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                  {methodConfig.senderLabel}
                </label>
                <input 
                  type="text" 
                  maxLength={methodConfig.senderMaxLength}
                  placeholder={methodConfig.senderPlaceholder}
                  value={senderNumber}
                  onChange={(e) => handleSenderChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {methodConfig.senderOnlyDigits 
                    ? `${methodConfig.senderMinLength}-${methodConfig.senderMaxLength} ডিজিট`
                    : `${methodConfig.senderMinLength}-${methodConfig.senderMaxLength} character`}
                  {' — '}
                  {senderNumber.length}/{methodConfig.senderMaxLength}
                </p>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">ট্রানজেকশন আইডি (TrxID)</label>
                <input 
                  type="text" 
                  placeholder="M4K8..." 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none uppercase font-mono ${
                    trxError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                  required
                />
                {trxError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
                    <i className="fa-solid fa-circle-exclamation"></i> {trxError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                disabled={loading || !!trxError}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    সাবমিট হচ্ছে...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> ডিপোজিট রিকোয়েস্ট পাঠান
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ============ NOWPAYMENTS AUTO CRYPTO ============ */}
        {showNowPayments && (
          <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 p-4 md:p-6 rounded-2xl border border-blue-500/30 shadow-lg space-y-5">
            
            {/* Info Header */}
            <div className="flex items-start gap-3 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                <i className="fa-solid fa-bolt text-xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-bold text-blue-400">NowPayments — Auto Crypto</h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 leading-relaxed">
                  USDT, BTC, ETH, TRX দিয়ে instant deposit করুন। Payment confirm হলেই auto balance add হবে — কোনো admin approve লাগবে না।
                </p>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                পরিমাণ (USD $)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-lg">$</span>
                <input 
                  type="number" 
                  step="any"
                  min="5"
                  value={npAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) setNpAmount(val);
                  }}
                  placeholder="যেমন: 5"
                  className="w-full bg-slate-950 border border-slate-700 p-3 pl-9 rounded-xl text-sm text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">সর্বনিম্ন $5</p>
              {npAmount && (
                <p className="text-[11px] text-emerald-400 mt-1.5 font-semibold">
                  ≈ ৳{(Number(npAmount) * 120).toFixed(0)} (Rate: $1 = ৳120)
                </p>
              )}
            </div>

            {/* Currency Select */}
            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                পেমেন্ট কারেন্সি
              </label>
              <select 
                value={npCurrency}
                onChange={(e) => setNpCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="usdttrc20">USDT (TRC20) — কম ফি</option>
                <option value="usdterc20">USDT (ERC20) — Ethereum</option>
                <option value="btc">Bitcoin (BTC)</option>
                <option value="eth">Ethereum (ETH)</option>
                <option value="trx">TRON (TRX)</option>
                <option value="bnbbsc">Binance Coin (BSC)</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-950/40 border border-blue-500/20 p-3 rounded-xl">
              <p className="text-[10px] md:text-xs text-blue-300 leading-relaxed flex items-start gap-2">
                <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0"></i>
                <span>
                  NowPayments পেজে redirect হবেন। সেখানে payment সম্পন্ন করলে auto আপনার wallet-এ balance যোগ হবে।
                </span>
              </p>
            </div>

            {/* Submit */}
            <button 
              type="button"
              onClick={handleNowPayments}
              disabled={npLoading || !npAmount || Number(npAmount) < 5}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95 text-white"
            >
              {npLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Invoice তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-up-right-from-square"></i> NowPayments এ পেমেন্ট করুন
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}