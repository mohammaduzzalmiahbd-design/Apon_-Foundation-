import React, { useState, useMemo, useRef } from 'react';
import { BookOpen, Stethoscope, Snowflake, Trophy, Heart, Image as ImageIcon, FileDown, Calendar, Printer, PieChart, CheckCircle2 } from 'lucide-react';
import { Transaction, AppSettings } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { DownloadDropdown } from './DownloadDropdown';

interface Props {
  transactions: Transaction[];
  logoUrl: string | null;
  settings: AppSettings;
}

const CATEGORIES = [
  { id: 'education', label: 'শিক্ষা উপকরণ বিতরণ', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'winter', label: 'শীতবস্ত্র বিতরণ', icon: Snowflake, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'medical', label: 'চিকিৎসা সহায়তা', icon: Stethoscope, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'sports', label: 'ক্রীড়া সামগ্রী বিতরণ', icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'relief', label: 'ত্রাণ ও অনুদান', icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const toBengali = (num: number | string) => {
  const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const bengali = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const s = typeof num === 'number' ? num.toLocaleString() : String(num);
  
  return s.split('').map(char => {
    const index = english.indexOf(char);
    return index > -1 ? bengali[index] : char;
  }).join('');
};

export const ActivityReports: React.FC<Props> = ({ transactions, logoUrl, settings }) => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[1]); // Default Winter
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [customTitle, setCustomTitle] = useState('');
  const [customCount, setCustomCount] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [docScale, setDocScale] = useState(1);

  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 48;
        if (containerWidth < 794) {
          setDocScale(containerWidth / 794);
        } else {
          setDocScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate stats based on category matching
  const reportData = useMemo(() => {
    const relevantTransactions = transactions.filter(t => 
      t.type === 'EXPENSE' && 
      t.year === year &&
      (t.category.includes(selectedCategory.label) || t.description?.includes(selectedCategory.label))
    );
    
    const totalAmount = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    return { totalAmount, count: relevantTransactions.length, transactions: relevantTransactions };
  }, [transactions, selectedCategory, year]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Controls Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit no-print order-2 lg:order-1">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PieChart className="text-blue-600" /> রিপোর্ট কনফিগারেশন
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">কার্যক্রমের ধরন</label>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat); setCustomTitle(''); }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selectedCategory.id === cat.id 
                      ? `${cat.border} ${cat.bg} ring-1 ring-blue-200` 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-full bg-white shadow-sm`}>
                    <cat.icon size={18} className={cat.color} />
                  </div>
                  <span className={`font-medium ${selectedCategory.id === cat.id ? 'text-slate-900' : 'text-slate-600'}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
             <label className="block text-sm font-medium text-slate-700 mb-1">অর্থবছর</label>
             <select 
               value={year}
               onChange={(e) => setYear(Number(e.target.value))}
               className="w-full p-2 border border-slate-300 rounded-lg"
             >
               {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1">কাস্টম শিরোনাম (অপশনাল)</label>
            <input 
              type="text"
              placeholder={selectedCategory.label}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

           <div className="pt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">উপকারভোগীর সংখ্যা/পরিমাণ (টেক্সট)</label>
            <input 
              type="text"
              placeholder="যেমন: ৫০০টি পরিবার"
              value={customCount}
              onChange={(e) => setCustomCount(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-2">
                 <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest mb-2">ডাউনলোড করার আগে</p>
                 <DownloadDropdown 
                    targetRef={reportRef} 
                    fileNamePrefix={`Report_${selectedCategory.id}_${year}`} 
                    settings={settings} 
                    logoUrl={logoUrl} 
                />
              </div>
              <button 
                onClick={() => window.print()} 
                className="bg-[#004d26] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#003d1e] font-bold shadow-md transition-all active:scale-95"
              >
                  <Printer size={18} /> প্রিভিউ প্রিন্ট ও ডাউনলোড
              </button>
          </div>
        </div>
      </div>

      {/* A4 Report Preview */}
      <div className="lg:col-span-2 order-1 lg:order-2">
         <div ref={containerRef} className="a4-preview-area rounded-xl border border-slate-200 shadow-inner">
             <div 
               ref={reportRef} 
               className="a4-paper shadow-2xl transition-transform duration-300 origin-top"
               style={{ transform: `scale(${docScale})` }}
             >
                 <div className="doc-box flex flex-col h-full bg-white">
                    {/* Watermark in the middle */}
                    {logoUrl && (
                        <div className="watermark-container">
                            <img src={logoUrl} alt="Watermark" crossOrigin="anonymous" />
                        </div>
                    )}
                    <DocumentHeader logoUrl={logoUrl} settings={settings} />
                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="text-center mb-6 border-b-2 border-slate-100 pb-4">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${selectedCategory.bg}`}>
                                <selectedCategory.icon size={24} className={selectedCategory.color} />
                            </div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-wide mb-1">
                                বার্ষিক কার্যক্রম প্রতিবেদন - {toBengali(year)}
                            </h1>
                            <h2 className={`font-bold ${selectedCategory.color} border-b border-dotted border-slate-300 inline-block px-4 pb-1`}>
                                {customTitle || selectedCategory.label}
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">মোট ব্যয়িত অর্থ</p>
                                <p className={`text-2xl font-bold ${selectedCategory.color}`}>
                                    ৳ {toBengali(reportData.totalAmount.toLocaleString())}
                                </p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">সুবিধাভোগী / সংখ্যা</p>
                                <p className="text-xl font-bold text-slate-800">
                                    {toBengali(customCount || 'N/A')}
                                </p>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-700 text-xs mb-2 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500" /> খরচের বিস্তারিত বিবরণ
                            </h3>
                            <table className="doc-table">
                                <thead className="bg-slate-100 text-slate-700">
                                    <tr>
                                        <th className="w-12 text-center">নং</th>
                                        <th className="w-28 text-center">তারিখ</th>
                                        <th className="text-left">বিবরণ</th>
                                        <th className="w-32 text-right">টাকার পরিমাণ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.transactions.length > 0 ? (
                                        reportData.transactions.map((t, idx) => (
                                            <tr key={t.id}>
                                                <td className="text-center text-slate-500">{toBengali(idx + 1)}</td>
                                                <td className="text-center font-mono text-xs">{toBengali(t.date)}</td>
                                                <td className="font-medium text-slate-700">{t.description || t.category}</td>
                                                <td className="text-right font-bold text-slate-900">
                                                    {toBengali(t.amount)}/-
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                                                এই খাতে কোনো খরচের তথ্য পাওয়া যায়নি
                                            </td>
                                        </tr>
                                    )}
                                    {reportData.transactions.length > 0 && (
                                        <tr className="bg-slate-50 font-bold">
                                            <td colSpan={3} className="p-2 text-right pr-4 uppercase text-slate-500 text-xs text-[10px]">সর্বমোট ব্যয়িত অর্থ</td>
                                            <td className="p-2 text-right text-emerald-700 text-lg">
                                                ৳ {toBengali(reportData.totalAmount.toLocaleString())}/-
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Universal Triple Signatures */}
                    <div className="relative z-10 mt-auto pt-16 flex justify-between items-end px-2 pb-8">
                        <div className="text-center w-full">
                            <div className="border-t-2 border-[#004d26] pt-1 pt-2">
                               <p className="font-bold text-[#004d26] text-sm">সভাপতি</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">আপন ফাউন্ডেশন</p>
                            </div>
                        </div>
                        <div className="text-center w-full mx-4">
                            <div className="border-t-2 border-[#004d26] pt-1 pt-2">
                               <p className="font-bold text-[#004d26] text-sm">সাধারণ সম্পাদক</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">আপন ফাউন্ডেশন</p>
                            </div>
                        </div>
                        <div className="text-center w-full">
                            <div className="border-t-2 border-[#004d26] pt-1 pt-2">
                               <p className="font-bold text-[#004d26] text-sm">অর্থ সম্পাদক</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">আপন ফাউন্ডেশন</p>
                            </div>
                        </div>
                    </div>
                    <DocumentFooter settings={settings} />
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
