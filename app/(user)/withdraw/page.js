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
      accountOnlyDigits: false
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
      accountOnlyDigits: true
    };
  }
  
  if (upper.includes('BTC') || upper.includes('BITCOIN')) {
    return {
      isCrypto: true,
      currency: 'USD',
      amountLabel: 'উইথড্র পরিমাণ (USD $)',
      amountPlaceholder: 'যেমন: 10',
      accountLabel: 'আপনার Bitcoin Wallet Address',
      accountPlaceholder: 'bc1... or 1...',
      accountLocked: false,
      accountMinLength: 26,
      accountMaxLength: 50,
      accountOnlyDigits: false
    };
  }
  
  // Mobile Banking (default)
  return {
    isCrypto: false,
    currency: 'BDT',
    amountLabel: 'উইথড্র পরিমাণ (৳)',
    amountPlaceholder: 'মিনিমাম ৫০০',
    accountLabel: 'অ্যাকাউন্ট নম্বর (রেজিস্টার্ড)',
    accountPlaceholder: '01700000000',
    accountLocked: true,
    accountMinLength: 11,
    accountMaxLength: 11,
    accountOnlyDigits: true
  };
};

export default function UserWithdrawPage() {
  const [user, setUser] = useState({ balance: 0, turnover: 0, phone: '', uid: '' });
  const [activeMethods, setActiveMethods] = useState([]);
  const [method, setMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [usdToBdtRate, setUsdToBdtRate] = useState(120);
  
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const router = useRouter();

  const methodConfig = getMethodConfig(method);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 4) {
      setPin(val);
    }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!savedUser.uid) {
      router.push('/login');
      return;
    }

    setUser(savedUser);
    
    if (savedUser.phone) {
      setAccountNumber(savedUser.phone);
    }

    // User data fetch
    fetch('/api/user/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          const currentUser = data.user;
          setUser(currentUser);
          
          if (currentUser.phone) {
            setAccountNumber(currentUser.phone);
          }

          localStorage.setItem('user', JSON.stringify({ ...savedUser, ...currentUser }));
        }
      })
      .catch(err => console.error(err));

    // ✅ Dynamic rate fetch
    fetch('/api/admin/exchange-rate', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.rate) {
          setUsdToBdtRate(Number(data.rate) || 120);
        }
      })
      .catch(err => console.error('Rate fetch error:', err));

    // ✅ Payment methods fetch + first method default set
    fetch('/api/admin/payment-methods', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.methods && data.methods.length > 0) {
          const activeList = data.methods.filter(m => m.isActive);
          setActiveMethods(activeList);
          
          if (activeList.length > 0) {
            const firstMethod = activeList[0].methodName;
            setMethod(firstMethod);
            
            // ✅ First method অনুযায়ী accountNumber সেট
            const cfg = getMethodConfig(firstMethod);
            if (cfg.accountLocked) {
              setAccountNumber(savedUser.phone || savedUser.uid || '');
            } else {
              setAccountNumber('');
            }
          }
        }
      })
      .catch(err => console.error('Payment methods fetch error:', err));
  }, [router]);

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    
    const newConfig = getMethodConfig(newMethod);
    
    if (newConfig.accountLocked) {
      setAccountNumber(user.phone || user.uid || '');
    } else {
      setAccountNumber('');
    }
    
    setAmount('');
  };

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

  const handleSubmitWithdraw = async (e) => {
    e.preventDefault();

    if (user.turnover && user.turnover > 0) {
      showToast(`আপনার অ্যাকাউন্টে এখনো ৳${user.turnover} টার্নওভার বাকি!`, 'error');
      return;
    }

    const cleanAccountNumber = accountNumber.trim();
    
    if (methodConfig.accountLocked) {
      const targetNumber = user.phone;
      if (cleanAccountNumber !== targetNumber) {
        showToast('আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!', 'error');
        return;
      }
    } else {
      if (cleanAccountNumber.length < methodConfig.accountMinLength) {
        showToast(
          `${methodConfig.accountLabel} — কমপক্ষে ${methodConfig.accountMinLength} ${
            methodConfig.accountOnlyDigits ? 'ডিজিট' : 'character'
          }!`, 
          'error'
        );
        return;
      }
      if (cleanAccountNumber.length > methodConfig.accountMaxLength) {
        showToast(
          `${methodConfig.accountLabel} — সর্বোচ্চ ${methodConfig.accountMaxLength} ${
            methodConfig.accountOnlyDigits ? 'ডিজিট' : 'character'
          }!`, 
          'error'
        );
        return;
      }
    }

    if (pin.length !== 4) {
      showToast('উইথড্র করার জন্য অবশ্যই ৪ ডিজিটের সঠিক পিন দিতে হবে!', 'error');
      return;
    }

    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      showToast('সঠিক পরিমাণ দিন!', 'error');
      return;
    }

    const minAmount = methodConfig.isCrypto ? 5 : 500;
    if (cleanAmount < minAmount) {
      showToast(
        methodConfig.isCrypto 
          ? `সর্বনিম্ন উইথড্র $${minAmount}!`
          : `সর্বনিম্ন উইথড্র ৳${minAmount}!`, 
        'error'
      );
      return;
    }

    if (cleanAmount > user.balance) {
      showToast('আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/game/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid: user.uid,
          amount: cleanAmount,
          method,
          accountNumber: cleanAccountNumber,
          pin,
          isCrypto: methodConfig.isCrypto,
          currency: methodConfig.currency
        })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast(data.message || 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!', 'success');
        
        setAmount('');
        setPin('');
        
        if (!methodConfig.accountLocked) {
          setAccountNumber('');
        } else {
          setAccountNumber(user.phone || user.uid || '');
        }

        if (data.newBalance !== undefined) {
          setUser(prev => ({ ...prev, balance: Number(data.newBalance) || 0 }));
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
          savedUser.balance = Number(data.newBalance) || 0;
          localStorage.setItem('user', JSON.stringify(savedUser));
        }

        router.refresh();
      } else {
        showToast(data.message || 'কিছু সমস্যা হয়েছে!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('সার্ভার এরর!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans">
      
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
        
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <i className="fa-solid fa-arrow-up-from-bracket"></i> উইথড্র করুন
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold">মূল ব্যালেন্স</p>
            <p className="text-lg md:text-2xl font-black text-amber-400 font-mono mt-1">৳{user.balance || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-center relative overflow-hidden">
            <div className={`absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 ${user.turnover > 0 ? 'bg-rose-500/5' : 'bg-emerald-500/5'} rounded-full blur-2xl pointer-events-none`}></div>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold">টার্নওভার বাকি</p>
            <p className={`text-lg md:text-2xl font-black font-mono mt-1 ${user.turnover > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>৳{user.turnover || 0}</p>
          </div>
        </div>

        {user.turnover > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-400 shadow-lg">
            <i className="fa-solid fa-triangle-exclamation mt-0.5 text-base"></i>
            <p className="text-[11px] md:text-xs font-bold leading-relaxed">
              আপনার টার্নওভার এখনো জিরো (0) হয়নি বিধায় উইথড্র রিকোয়েস্ট বন্ধ রয়েছে। গেম খেলে টার্নওভার শেষ করুন।
            </p>
          </div>
        )}

        <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
          <form onSubmit={handleSubmitWithdraw} className="space-y-4 md:space-y-5">
            
            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">পেমেন্ট মেথড সিলেক্ট করুন</label>
              <select 
                value={method} 
                onChange={(e) => handleMethodChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 cursor-pointer"
                required
              >
                {activeMethods.length === 0 ? (
                  <option value="">কোনো পেমেন্ট মেথড চালু নেই</option>
                ) : (
                  activeMethods.map((m) => (
                    <option key={m._id} value={m.methodName}>{m.methodName}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs md:text-sm text-slate-400 font-semibold">
                  {methodConfig.accountLabel}
                </label>
                {methodConfig.accountLocked ? (
                  <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                    <i className="fa-solid fa-lock"></i> লক করা
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
                className={`w-full bg-slate-950/60 border border-slate-800 p-3 md:p-3.5 rounded-xl text-xs md:text-sm font-mono ${
                  methodConfig.accountLocked 
                    ? 'text-slate-400 cursor-not-allowed select-none' 
                    : 'text-white outline-none focus:border-rose-500'
                }`}
                required
              />
            </div>

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
                className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono"
                required
              />
              {methodConfig.isCrypto && amount && (
                <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
                  ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (Rate: $1 = ৳{usdToBdtRate})
                </p>
              )}
            </div>

            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">৪ ডিজিটের সিকিউরিটি পিন</label>
              <input 
                type="password" 
                maxLength={4}
                placeholder="• • • •" 
                value={pin}
                onChange={handlePinChange}
                className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono tracking-widest text-center"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || (user.turnover && user.turnover > 0) || activeMethods.length === 0}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 md:p-4 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  প্রসেস হচ্ছে...
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
  );
}