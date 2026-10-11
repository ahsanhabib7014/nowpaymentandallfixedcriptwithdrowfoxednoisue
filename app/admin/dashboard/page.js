'use client';
import { useState, useEffect } from 'react';

export default function DepositManagementPage() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // প্রতিটি ডিপোজিট কার্ডের নিজস্ব নোট ধরার জন্য স্টেট
  const [notes, setNotes] = useState({});
  
  // সুন্দর টোস্ট নোটিফিকেশনের জন্য স্টেট
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const loadDeposits = async () => {
    try {
      const res = await fetch('/api/admin/deposits');

      if (res.status === 401 || res.status === 403) {
        showToast('অনুমোদিত নয়! দয়া করে আবার লগইন করুন।', 'error');
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        // ফ্রন্টএন্ডে দ্বিগুণ নিশ্চিত করার জন্য নিরাপদ সর্টিং লজিক
        const sortedDeposits = (data.deposits || []).sort((a, b) => {
          const getTime = (item) => {
            if (item.createdAt) {
              const t = new Date(item.createdAt).getTime();
              if (!isNaN(t)) return t;
            }
            if (item._id) {
              try {
                return parseInt(item._id.toString().substring(0, 8), 16) * 1000;
              } catch (e) {
                return 0;
              }
            }
            return 0;
          };

          const timeA = getTime(a);
          const timeB = getTime(b);
          return timeB - timeA; // বড় টাইমস্ট্যাম্প (নতুন) সবার আগে আসবে
        });

        setDeposits(sortedDeposits);
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

  const handleUpdate = async (id, status) => {
    try {
      const adminNote = notes[id] || ''; // নির্দিষ্ট কার্ডের নোট নেওয়া হচ্ছে (ফাঁকা থাকলেও সমস্যা নেই)
      
      const res = await fetch('/api/admin/deposits', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ depositId: id, status, adminNote })
      });
      
      const data = await res.json();
      if (data.success) {
        showToast(status === 'approved' ? 'ডিপোজিট সফলভাবে কনফার্ম করা হয়েছে!' : 'ডিপোজিট সফলভাবে বাতিল করা হয়েছে!', status === 'approved' ? 'success' : 'error');
        loadDeposits();
      } else {
        showToast(data.message || 'কিছু সমস্যা হয়েছে!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('সার্ভার এরর!', 'error');
    }
  };

  if (loading) return <div className="p-8 text-white bg-gray-950 min-h-screen">লোড হচ্ছে...</div>;

  return (
    <div className="p-8 text-white bg-gray-950 min-h-screen relative">
      
      {/* টোস্ট নোটিফিকেশন পপআপ */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl transition-all animate-bounce ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">ডিপোজিট ম্যানেজমেন্ট</h1>
      
      <div className="space-y-4">
        {deposits.length === 0 ? (
          <p className="text-gray-400">কোনো রিকোয়েস্ট নেই</p>
        ) : (
          deposits.map((item) => (
            <div key={item._id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-emerald-400">পরিমাণ: ৳{item.amount}</p>
                  <p className="text-sm text-gray-400">ইউজার: {item.uid || item.userId}</p>
                  <p className="text-xs text-yellow-500">স্ট্যাটাস: {item.status || 'pending'}</p>
                  {item.adminNote && <p className="text-xs text-slate-400 mt-1 italic">নোট: {item.adminNote}</p>}
                </div>

                {(!item.status || item.status === 'pending') && (
                  <div className="space-x-2">
                    <button onClick={() => handleUpdate(item._id, 'approved')} className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-xs font-bold transition">কনফার্ম</button>
                    <button onClick={() => handleUpdate(item._id, 'rejected')} className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-xs font-bold transition">বাতিল</button>
                  </div>
                )}
              </div>

              {/* পেন্ডিং অবস্থায় নোট লেখার ইনপুট ফিল্ড (ফাঁকা রাখলেও কাজ করবে) */}
              {(!item.status || item.status === 'pending') && (
                <div className="pt-2 border-t border-gray-800/80">
                  <input 
                    type="text" 
                    placeholder="নোট লিখুন (ঐচ্ছিক)..." 
                    value={notes[item._id] || ''}
                    onChange={(e) => setNotes({ ...notes, [item._id]: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-green-500 transition"
                  />
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ...............................................................................

