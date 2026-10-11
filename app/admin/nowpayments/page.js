'use client';
import { useState, useEffect } from 'react';

export default function NowPaymentsManagementPage() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');   // 🆕 Search state

  const loadDeposits = async () => {
    try {
      const res = await fetch('/api/admin/deposits');
      const data = await res.json();
      if (data.success) {
        const nowPaymentsOnly = (data.deposits || [])
          .filter(d => d.method === 'NowPayments')
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setDeposits(nowPaymentsOnly);
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    loadDeposits(); 
  }, []);

  // 🆕 Filter + Search একসাথে
  const filteredDeposits = deposits.filter(d => {
    // Status filter
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;

    // Search filter (transactionId, uid, amount)
    if (searchQuery.trim()) {
      const search = searchQuery.trim().toLowerCase();
      return (
        d.transactionId?.toLowerCase().includes(search) ||
        d.uid?.toLowerCase().includes(search) ||
        String(d.amount).includes(search) ||
        String(d.originalAmount).includes(search)
      );
    }

    return true;
  });

  const countByStatus = (status) => {
    if (status === 'all') return deposits.length;
    return deposits.filter(d => d.status === status).length;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-bold">✅ সফল</span>;
      case 'partial':
        return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-lg text-xs font-bold">⚠️ কম পাঠিয়েছে</span>;
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-lg text-xs font-bold">⏳ পেন্ডিং</span>;
      case 'rejected':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-lg text-xs font-bold">❌ ব্যর্থ</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  const filterBtnClass = (filterValue) => {
    const isActive = statusFilter === filterValue;
    return `px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
      isActive
        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
    }`;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">₿ NowPayments ডিপোজিট</h1>
          <p className="text-xs text-slate-500 mt-1">Crypto পেমেন্ট (auto-verified)</p>
        </div>
        <button
          onClick={loadDeposits}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95"
        >
          🔄 রিফ্রেশ
        </button>
      </div>

      {/* 🆕 Search Box */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 mb-4">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-1">
          🔍 ট্রানজেকশন / ইউজার / পরিমাণ খুঁজুন
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="DEP-01222222222-... অথবা 01222222222"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-emerald-500 transition-all pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-800 transition-all"
              title="Clear"
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

      {/* Filter Buttons */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 mb-5">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-1">ফিল্টার করুন</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter('all')} className={filterBtnClass('all')}>
            📋 সব ({countByStatus('all')})
          </button>
          <button onClick={() => setStatusFilter('approved')} className={filterBtnClass('approved')}>
            ✅ সফল ({countByStatus('approved')})
          </button>
          <button onClick={() => setStatusFilter('partial')} className={filterBtnClass('partial')}>
            ⚠️ কম পাঠিয়েছে ({countByStatus('partial')})
          </button>
          <button onClick={() => setStatusFilter('pending')} className={filterBtnClass('pending')}>
            ⏳ পেন্ডিং ({countByStatus('pending')})
          </button>
          <button onClick={() => setStatusFilter('rejected')} className={filterBtnClass('rejected')}>
            ❌ ব্যর্থ ({countByStatus('rejected')})
          </button>
        </div>
      </div>

      {/* Deposit List */}
      <div className="space-y-3">
        {filteredDeposits.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-slate-400 text-sm">
              {searchQuery 
                ? `"${searchQuery}" দিয়ে কোনো ফলাফল পাওয়া যায়নি`
                : statusFilter === 'all' 
                ? 'কোনো NowPayments ডিপোজিট নেই' 
                : `"${statusFilter}" স্ট্যাটাসে কোনো ডিপোজিট নেই`}
            </p>
          </div>
        ) : (
          filteredDeposits.map((item) => {
            const invoiceUsd = Number(item.originalAmount) || 0;
            const rate = Number(item.exchangeRate) || 120;
            const isPartial = item.status === 'partial';
            const isOverpaid = item.adminNote && item.adminNote.includes('বেশি');
            const isUnderpaid = item.adminNote && item.adminNote.includes('কম');

            return (
              <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 hover:border-slate-700 transition-all">
                
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-2xl font-black text-emerald-400 font-mono">
                      ৳{Number(item.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">≈ ${invoiceUsd} USD</p>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-500">👤 ইউজার:</span>
                      <span className="font-mono text-cyan-400 font-bold">{item.uid}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-500">🔑 ট্রানজেকশন:</span>
                      <span className="font-mono text-amber-400 font-bold text-[11px] break-all">{item.transactionId}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-500">📊 Rate:</span>
                      <span className="font-mono text-slate-300">$1 = ৳{rate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-500">🕐 সময়:</span>
                      <span className="font-mono text-slate-300">{formatDateTime(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* কম/বেশি পাঠানোর তথ্য */}
                {(isPartial || isOverpaid || isUnderpaid) && (
                  <div className={`mt-3 p-3 rounded-xl border ${
                    isPartial 
                      ? 'bg-orange-500/10 border-orange-500/30' 
                      : isOverpaid
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <p className={`text-xs font-bold ${
                      isPartial ? 'text-orange-400' 
                        : isOverpaid ? 'text-blue-400' 
                        : 'text-amber-400'
                    }`}>
                      {isPartial && '⚠️ কম পাঠিয়েছে'}
                      {isOverpaid && '💡 বেশি পাঠিয়েছে'}
                      {isUnderpaid && '⚠️ কম পাঠিয়েছে'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Invoice ছিল: <span className="font-mono font-bold text-white">${invoiceUsd}</span>
                      {' | '}
                      পেয়েছেন: <span className="font-mono font-bold text-white">৳{Number(item.amount).toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                )}

                {/* Admin Note */}
                {item.adminNote && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">📝 নোট</p>
                    <p className="text-xs text-slate-400 italic break-words">{item.adminNote}</p>
                  </div>
                )}

                {/* Auto-handled info */}
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <p className="text-[10px] text-slate-500">
                    NowPayments auto-verified — ম্যানুয়াল অ্যাকশনের প্রয়োজন নেই
                  </p>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}