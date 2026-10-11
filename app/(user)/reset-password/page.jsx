'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // [স্যানিটাইজেশন]: ফোন নম্বরের জন্য শুধু সংখ্যা ও ১১ ডিজিট লিমিট
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 11) {
      setPhone(val);
    }
  };

  // [স্যানিটাইজেশন]: পিনের জন্য শুধু সংখ্যা ও ৪ ডিজিট লিমিট[cite: 10]
  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 4) {
      setPin(val);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');

    // [ভ্যালিডেশন][cite: 10]
    if (phone.length !== 11) {
      setMessage('ফোন নম্বর বা ইউজার আইডি অবশ্যই ১১ ডিজিটের হতে হবে!');
      return;
    }

    if (pin.length !== 4) {
      setMessage('পাসওয়ার্ড রিসেট পিন অবশ্যই ৪ ডিজিটের হতে হবে!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // সিকিউরড কুকি ম্যানেজমেন্টের জন্য
        body: JSON.stringify({ phone, pin, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      }

      setMessage('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! লগইন পেজে রিডাইরেক্ট হচ্ছে...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-slate-900 p-8 rounded-2xl border border-slate-800 text-white shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-emerald-400 text-center">পাসওয়ার্ড রিসেট করুন</h2>

      {message && (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center text-xs text-emerald-400 font-bold">
          {message}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">ফোন নম্বর / ইউজার আইডি (UID)</label>
          <input
            type="text"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={11}
            placeholder="আপনার ১১ ডিজিটের ফোন নম্বর দিন"
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">৪ ডিজিটের রিসেট পিন</label>
          <input
            type="password"
            value={pin}
            onChange={handlePinChange}
            maxLength={4}
            placeholder="আপনার ৪ ডিজিটের পিন দিন..."
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">নতুন পাসওয়ার্ড</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="নতুন শক্তিশালী পাসওয়ার্ড দিন"
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-950/50 disabled:opacity-50"
        >
          {loading ? 'প্রসেসিং হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400">
        পাসওয়ার্ড মনে আছে?{' '}
        <Link href="/login" className="text-emerald-400 font-bold hover:underline">
          লগইন করুন
        </Link>
      </p>
    </div>
  );
}