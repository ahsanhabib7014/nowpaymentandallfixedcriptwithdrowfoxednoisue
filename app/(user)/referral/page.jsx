'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ==========================================
// ✅ Method-specific Config
// ==========================================
const getMethodConfig = (method) => {
  const upper = String(method || '').toUpperCase();

  if (upper.includes('TRX') || upper.includes('TRON')) {
    return {
      isCrypto: true,
      currency: 'USD',
      amountLabel: 'উইথড্র পরিমাণ (USD $)',
      amountPlaceholder: 'যেমন: 5',
      accountLabel: 'আপনার TRX Wallet Address',
      accountPlaceholder: 'TXYZ... (৩৪ character)',
      accountLocked: false,
      accountMinLength: 34,
      accountMaxLength: 34,
      accountOnlyDigits: false,
    };
  }

  if (upper.includes('BINANCE') || upper.includes('USDT')) {
    return {
      isCrypto: true,
      currency: 'USD',
      amountLabel: 'উইথড্র পরিমাণ (USD $)',
      amountPlaceholder: 'যেমন: 5',
      accountLabel: 'আপনার Binance Pay ID',
      accountPlaceholder: '541254656',
      accountLocked: false,
      accountMinLength: 5,
      accountMaxLength: 10,
      accountOnlyDigits: true,
    };
  }

  if (upper.includes('BTC') || upper.includes('BITCOIN')) {
    return {
      isCrypto: true,
      currency: 'USD',
      amountLabel: 'উইথড্র পরিমাণ (USD $)',
      amountPlaceholder: 'যেমন: 5',
      accountLabel: 'আপনার Bitcoin Wallet Address',
      accountPlaceholder: 'bc1... or 1...',
      accountLocked: false,
      accountMinLength: 26,
      accountMaxLength: 50,
      accountOnlyDigits: false,
    };
  }

  // Mobile Banking (default)
  return {
    isCrypto: false,
    currency: 'BDT',
    amountLabel: 'অ্যামাউন্ট (সর্বনিম্ন ৫০০ টাকা)',
    amountPlaceholder: 'সর্বনিম্ন ৫০০ টাকা লিখুন',
    accountLabel: 'একাউন্ট নাম্বার (রেজিস্টার্ড)',
    accountPlaceholder: '01700000000',
    accountLocked: true,
    accountMinLength: 11,
    accountMaxLength: 11,
    accountOnlyDigits: true,
  };
};

export default function ReferralPage() {
  const [user, setUser] = useState({ uid: '', phone: '', referralBalance: 0, referralCode: '' });
  const [amount, setAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]); 
  const [method, setMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, text: '', success: false });
  const [copied, setCopied] = useState(false);
  const [usdToBdtRate, setUsdToBdtRate] = useState(120);
  
  const router = useRouter();
  const methodConfig = getMethodConfig(method);

  const showToast = (text, success = true) => {
    setToast({ show: true, text, success });
    setTimeout(() => {
      setToast({ show: false, text: '', success: false });
    }, 3500);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 4) setPin(val);
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!savedUser.uid && !savedUser.phone) {
      router.push('/login');
      return;
    }

    setUser({
      ...savedUser,
      balance: Number(savedUser.balance) || 0,
      turnover: Number(savedUser.turnover) || 0,
      referralBalance: Number(savedUser.referralBalance) || 0,
    });

    fetch('/api/game/get-user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const freshUser = {
            ...savedUser,
            uid: data.uid,
            phone: data.phone,
            balance: Number(data.balance) || 0,
            turnover: Number(data.turnover) || 0,
            referralBalance: Number(data.referralBalance) || 0,
            referralCode: data.referralCode || data.uid
          };
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          
          if (data.usdToBdtRate) {
            setUsdToBdtRate(Number(data.usdToBdtRate) || 120);
          }
        }
      })
      .catch(err => console.error('Referral fetch error:', err));

    // ✅ Payment methods fetch — প্রথম method default + full reset
    fetch('/api/admin/payment-methods', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.methods && data.methods.length > 0) {
          const activeMethods = data.methods.filter(m => m.isActive);
          setPaymentMethods(activeMethods);
          
          if (activeMethods.length > 0) {
            const firstMethod = activeMethods[0].methodName;
            const cfg = getMethodConfig(firstMethod);
            
            // ✅ সব state একসাথে set
            setMethod(firstMethod);
            setAccountNumber(
              cfg.accountLocked 
                ? (savedUser.phone || savedUser.uid || '') 
                : ''
            );
            setAmount('');
            setPin('');
          }
        } else {
          setPaymentMethods([]);
          setMethod('');
        }
      })
      .catch(err => {
        console.error('❌ Payment methods fetch error:', err);
        setPaymentMethods([]);
        setMethod('');
      });
  }, [router]);

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${user.referralCode || user.uid}` 
    : '';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('রেফারেল লিংক সফলভাবে কপি করা হয়েছে!', true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ Method change → সব reset
  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    const cfg = getMethodConfig(newMethod);

    setAccountNumber(
      cfg.accountLocked 
        ? (user.phone || user.uid || '') 
        : ''
    );
    setAmount('');
    setPin('');
  };

  // ✅ Account input sanitization
  const handleAccountChange = (value) => {
    let sanitized = value;
    if (methodConfig.accountOnlyDigits) {
      sanitized = value.replace(/\D/g, '');
    } else {
      sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
    }
    if (sanitized.length <= methodConfig.accountMaxLength) {
      setAccountNumber(sanitized);
    }
  };

  const handleReferralWithdraw = async (e) => {
    e.preventDefault();

    const cleanAmount = Number(amount);
    const cleanAccountNumber = accountNumber.trim();
    const registeredNumber = user.phone || user.uid;

    // ✅ Account validation
    if (methodConfig.accountLocked) {
      if (cleanAccountNumber !== user.phone) {
        showToast('আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!', false);
        return;
      }
    } else {
      if (cleanAccountNumber.length < methodConfig.accountMinLength) {
        showToast(
          `${methodConfig.accountLabel} — কমপক্ষে ${methodConfig.accountMinLength} ${
            methodConfig.accountOnlyDigits ? 'ডিজিট' : 'character'
          }!`,
          false
        );
        return;
      }
      if (cleanAccountNumber.length > methodConfig.accountMaxLength) {
        showToast(
          `${methodConfig.accountLabel} — সর্বোচ্চ ${methodConfig.accountMaxLength} ${
            methodConfig.accountOnlyDigits ? 'ডিজিট' : 'character'
          }!`,
          false
        );
        return;
      }
    }

    if (pin.length !== 4) {
      showToast('উইথড্র করার জন্য অবশ্যই সঠিক ৪ ডিজিটের পিন দিতে হবে!', false);
      return;
    }

    const minAmount = methodConfig.isCrypto ? 5 : 500;
    if (isNaN(cleanAmount) || cleanAmount < minAmount) {
      showToast(
        methodConfig.isCrypto
          ? `সর্বনিম্ন উইথড্র $${minAmount}!`
          : `সর্বনিম্ন উইথড্র ৳${minAmount}!`,
        false
      );
      return;
    }

    const bdtEquivalent = methodConfig.isCrypto
      ? cleanAmount * usdToBdtRate
      : cleanAmount;

    if (bdtEquivalent > (Number(user.referralBalance) || 0)) {
      showToast(
        methodConfig.isCrypto
          ? `পর্যাপ্ত বোনাস নেই! প্রয়োজন ৳${bdtEquivalent.toFixed(0)} ($${cleanAmount} × ৳${usdToBdtRate}), আছে ৳${user.referralBalance}`
          : 'আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই!',
        false
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/user/referral-withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: cleanAmount,
          method,
          accountNumber: methodConfig.accountLocked ? registeredNumber : cleanAccountNumber,
          pin
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!', true);
        
        // ✅ সব field reset
        setAmount('');
        setPin('');
        
        // Crypto হলে account খালি, mobile হলে registered number
        if (!methodConfig.accountLocked) {
          setAccountNumber('');
        } else {
          setAccountNumber(user.phone || user.uid || '');
        }
        
        // ✅ Backend থেকে সঠিক balance
        if (data.newReferralBalance !== undefined) {
          const updatedUser = {
            ...user,
            referralBalance: Number(data.newReferralBalance)
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          const updatedBalance = (Number(user.referralBalance) || 0) - bdtEquivalent;
          const updatedUser = { ...user, referralBalance: updatedBalance };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        showToast(data.message || 'উইথড্র ব্যর্থ হয়েছে।', false);
      }
    } catch (err) {
      showToast('সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।', false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      
      {toast.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce">
          <div className={`p-3.5 rounded-xl shadow-2xl text-xs md:text-sm font-bold text-center border flex items-center justify-center space-x-2 ${
            toast.success 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 backdrop-blur-md' 
              : 'bg-rose-950/90 text-rose-300 border-rose-500/50 backdrop-blur-md'
          }`}>
            <span>{toast.success ? '✅' : '⚠️'}</span>
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md md:max-w-4xl space-y-4 md:space-y-6">
        
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
            <i className="fa-solid fa-share-nodes"></i> রেফারেল সিস্টেম ও বোনাস
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          <div className="space-y-4 md:space-y-6">
            
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-semibold">উপলব্ধ রেফারেল বোনাস</p>
              <h1 className="text-3xl md:text-4xl font-black text-amber-400 font-mono mt-2">৳{user.referralBalance || 0}</h1>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
              <h3 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-link text-emerald-400"></i> আপনার রেফারেল লিংক
              </h3>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={referralLink} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs md:text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={copyReferralLink}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition shadow-md cursor-pointer flex justify-center items-center gap-2 active:scale-95"
                >
                  <i className="fa-solid fa-copy"></i> {copied ? 'কপি হয়েছে! ✓' : 'কপি করুন'}
                </button>
              </div>
            </div>

          </div>

          <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-lg space-y-5">
            <h3 className="text-sm md:text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <i className="fa-solid fa-money-bill-transfer"></i> রেফারেল বোনাস উইথড্র
            </h3>

            <form onSubmit={handleReferralWithdraw} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">উইথড্র পদ্ধতি</label>
                <select 
                  value={method} 
                  onChange={(e) => handleMethodChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  required
                >
                  {paymentMethods.length === 0 ? (
                    <option value="">কোনো পেমেন্ট মেথড চালু নেই</option>
                  ) : (
                    paymentMethods.map((m) => (
                      <option key={m._id} value={m.methodName}>{m.methodName}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs md:text-sm text-slate-400 font-semibold">
                    {methodConfig.accountLabel}
                  </label>
                  {methodConfig.accountLocked ? (
                    <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                      <i className="fa-solid fa-lock"></i> লক
                    </span>
                  ) : (
                    <span className="text-[9px] md:text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
                      {methodConfig.accountMinLength}-{methodConfig.accountMaxLength} {methodConfig.accountOnlyDigits ? 'ডিজিট' : 'char'}
                    </span>
                  )}
                </div>
                <input 
                  type="text" 
                  value={accountNumber}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  readOnly={methodConfig.accountLocked}
                  maxLength={methodConfig.accountMaxLength}
                  placeholder={methodConfig.accountPlaceholder}
                  className={`w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs md:text-sm font-mono ${
                    methodConfig.accountLocked
                      ? 'text-slate-400 cursor-not-allowed select-none'
                      : 'text-white focus:outline-none focus:border-emerald-500'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">
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
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                {methodConfig.isCrypto && amount && (
                  <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                    ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (Rate: $1 = ৳{usdToBdtRate})
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">৪ ডিজিটের সিকিউরিটি পিন</label>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="আপনার ৪ ডিজিটের পিন দিন" 
                  value={pin}
                  onChange={handlePinChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || paymentMethods.length === 0}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 active:scale-95 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    প্রসেসিং হচ্ছে...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> উইথড্র রিকোয়েস্ট পাঠান
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}