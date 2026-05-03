import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { BrandText } from './BrandText';

interface ReadingModeWrapperProps {
  children: React.ReactNode;
  title?: string;
}

export const ReadingModeWrapper: React.FC<ReadingModeWrapperProps> = ({ children, title = "Reading Mode" }) => {
  const [mode, setMode] = useState<'MOBILE' | 'DESKTOP'>('DESKTOP');

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setMode('MOBILE');
      } else {
        setMode('DESKTOP');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 text-slate-800 px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-40">
        <h2 className="text-xl font-bold tracking-wide">
          <BrandText text="আপন ফাউন্ডেশন" /> — {title}
        </h2>
        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => setMode('MOBILE')}
            className={`p-2 rounded-md transition-colors ${mode === 'MOBILE' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
            title="মোবাইল ভিউ"
          >
            <Smartphone size={20} />
          </button>
          <button 
            onClick={() => setMode('DESKTOP')}
            className={`p-2 rounded-md transition-colors ${mode === 'DESKTOP' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
            title="ডেস্কটপ ভিউ"
          >
            <Monitor size={20} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-8 flex justify-center ${mode === 'MOBILE' ? 'bg-slate-100' : 'bg-slate-100'}`}>
        <div className={`bg-white shadow-xl transition-all duration-500 ease-in-out overflow-hidden ${
          mode === 'MOBILE' 
            ? 'w-full max-w-[400px] rounded-3xl border-[12px] border-slate-800 min-h-[800px] p-6 text-lg leading-relaxed' 
            : 'w-full max-w-6xl rounded-xl p-10 text-base'
        }`}>
          {children}
        </div>
      </div>
    </div>
  );
};
