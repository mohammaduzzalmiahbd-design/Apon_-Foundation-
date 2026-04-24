import React, { useState } from 'react';
import { LogIn, ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import { signInWithGoogle, clearAuthCache } from '../services/firebase';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTroubleshoot = async () => {
    if (window.confirm("লগইন সমস্যা সমাধানের জন্য অ্যাপের ক্যাশ পরিষ্কার করা হবে এবং পেজটি রিলোড হবে। আপনি কি নিশ্চিত?")) {
      await clearAuthCache();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      console.error("Login error details:", err);
      const errorCode = err.code || "";
      const errorMessage = err.message || "";
      
      if (errorCode === 'auth/popup-closed-by-user' || errorMessage.includes('popup-closed-by-user')) {
        setError('লগইন পপ-আপ উইন্ডোটি বন্ধ হয়ে গেছে। আপনি যদি মোবাইল থেকে ব্যবহার করেন, তবে নিশ্চিত করুন যে ব্রাউজারের পপ-আপ ব্লক করা নেই। আবার চেষ্টা করুন।');
      } else if (errorCode === 'auth/cancelled-by-user' || errorMessage.includes('cancelled-by-user')) {
        setError('লগইন বাতিল করা হয়েছে।');
      } else if (errorCode === 'auth/popup-blocked' || errorMessage.includes('popup-blocked')) {
        setError('আপনার ব্রাউজার পপ-আপ বন্ধ করে দিয়েছে। ব্রাউজার সেটিং থেকে পপ-আপ এলাউ করুন।');
      } else {
        setError(errorMessage || 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg mb-6 transform rotate-3">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white font-bengali tracking-tight mb-2">
            আপন <span className="text-blue-400">ফাউন্ডেশন</span>
          </h1>
          <p className="text-slate-300 font-medium">ম্যানেজমেন্ট সিস্টেম লগইন</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {/* Proactive Frame Detection for AI Studio Users */}
            {window.self !== window.top && (
              <div className="mb-8 p-5 bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="text-amber-400" size={24} />
                  <h3 className="text-amber-200 font-bold text-sm">লগইন সমস্যার স্থায়ী সমাধান</h3>
                </div>
                <p className="text-amber-100/80 text-xs leading-relaxed mb-4">
                  গুগল সিকিউরিটি পলিসির কারণে আইফ্রেমের (এই উইন্ডোর) ভেতর থেকে লগইন করা সম্ভব নয়। নিচে ক্লিক করে এটি সরাসরি ব্রাউজারে ওপেন করুন।
                </p>
                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  সরাসরি ব্রাউজারে ওপেন করুন
                </button>
              </div>
            )}

            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <Heart className="text-red-400" size={18} /> মানবসেবায় আমরা
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              সিস্টেমে প্রবেশ করতে আপনার গুগল অ্যাকাউন্ট ব্যবহার করুন। ইউজার রোল অনুযায়ী আপনি অ্যাক্সেস পাবেন।
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-400 shrink-0" size={18} />
                <p className="text-red-200 text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
              {loading ? 'লোড হচ্ছে...' : 'গুগল দিয়ে লগইন'}
            </button>
            
            <button 
              onClick={handleTroubleshoot}
              className="w-full mt-4 text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest font-bold"
            >
              লগইন সমস্যা হচ্ছে? ক্যাশ ক্লিন করুন
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Secure Role Based Access System
          </p>
        </div>
      </div>

      <div className="fixed bottom-8 text-slate-400 text-sm font-medium flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        System Online • Production v2.0
      </div>
    </div>
  );
};
