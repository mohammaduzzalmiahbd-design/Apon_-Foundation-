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
              <DownloadDropdown 
                targetRef={reportRef} 
                fileNamePrefix={`Report_${selectedCategory.id}_${year}`} 
                settings={settings} 
                logoUrl={logoUrl} 
              />
              <button 
                onClick={() => window.print()} 
                className="bg-slate-800 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 font-medium shadow-sm"
              >
                  <Printer size={18} /> প্রিন্ট করুন
              </button>
          </div>
        </div>
      </div>

      {/* A4 Report Preview */}
      <div className="lg:col-span-2 flex justify-center bg-slate-100 p-4 md:p-8 overflow-auto rounded-xl border border-slate-200 order-1 lg:order-2">
        <div className="a4-wrapper p-0 bg-transparent shadow-2xl scale-[0.8] md:scale-100 origin-top">
             <div 
                ref={reportRef}
                id="activity-report-a4" 
                className="a4-paper flex flex-col relative bg-white text-black h-[297mm]" 
                style={{ padding: '20mm 25mm' }}
            >
                {/* Watermark */}
                {logoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                        <img src={logoUrl} alt="Watermark" className="w-[400px] opacity-[0.05] grayscale" />
                    </div>
                )}

                <DocumentHeader logoUrl={logoUrl} settings={settings} />

                {/* Report Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                    
                    {/* Title Section */}
                    <div className="text-center mb-8 border-b-2 border-slate-100 pb-6">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${selectedCategory.bg}`}>
                            <selectedCategory.icon size={32} className={selectedCategory.color} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wide mb-1">
                            বার্ষিক কার্যক্রম প্রতিবেদন - {toBengali(year)}
                        </h1>
                        <h2 className={`text-xl font-bold ${selectedCategory.color} border-b border-dotted border-slate-300 inline-block px-4 pb-1`}>
                            {customTitle || selectedCategory.label}
                        </h2>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                             <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">মোট ব্যয়িত অর্থ</p>
                             <p className={`text-3xl font-bold ${selectedCategory.color}`}>
                                ৳ {toBengali(reportData.totalAmount.toLocaleString())}
                             </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                             <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">সুবিধাভোগী / সংখ্যা</p>
                             <p className="text-2xl font-bold text-slate-800">
                                {toBengali(customCount || 'N/A')}
                             </p>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                           <CheckCircle2 size={16} /> খরচের বিস্তারিত বিবরণ
                        </h3>
                        
                        <table className="w-full text-sm border-collapse border border-slate-300">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="border border-slate-300 p-2 w-12 text-center">নং</th>
                                    <th className="border border-slate-300 p-2 w-28 text-center">তারিখ</th>
                                    <th className="border border-slate-300 p-2 text-left">বিবরণ</th>
                                    <th className="border border-slate-300 p-2 w-32 text-right">টাকার পরিমাণ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.transactions.length > 0 ? (
                                    reportData.transactions.map((t, idx) => (
                                        <tr key={t.id}>
                                            <td className="border border-slate-300 p-2 text-center">{toBengali(idx + 1)}</td>
                                            <td className="border border-slate-300 p-2 text-center">{toBengali(t.date)}</td>
                                            <td className="border border-slate-300 p-2">{t.description || t.category}</td>
                                            <td className="border border-slate-300 p-2 text-right font-bold">
                                                {toBengali(t.amount)}/-
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="border border-slate-300 p-8 text-center text-slate-400 italic">
                                            এই খাতে কোনো খরচের তথ্য পাওয়া যায়নি
                                        </td>
                                    </tr>
                                )}
                                {/* Total Row */}
                                {reportData.transactions.length > 0 && (
                                    <tr className="bg-slate-50 font-bold">
                                        <td colSpan={3} className="border border-slate-300 p-2 text-right pr-4 uppercase text-slate-600">সর্বমোট</td>
                                        <td className="border border-slate-300 p-2 text-right text-slate-900">
                                            {toBengali(reportData.totalAmount)}/-
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Signatures */}
                <div className="relative z-10 mt-6 flex justify-between items-end gap-8 mb-6">
                    <div className="text-center flex-1">
                        <div className="border-t border-dashed border-slate-400 mb-1 mx-auto w-32"></div>
                        <p className="text-[10px] font-bold text-slate-600">কোষাধ্যক্ষ</p>
                    </div>
                    <div className="text-center flex-1">
                        <div className="border-t border-dashed border-slate-400 mb-1 mx-auto w-32"></div>
                        <p className="text-[10px] font-bold text-slate-600">সাধারণ সম্পাদক</p>
                    </div>
                    <div className="text-center flex-1">
                        <div className="border-t border-dashed border-slate-400 mb-1 mx-auto w-32"></div>
                        <p className="text-[10px] font-bold text-slate-600">সভাপতি</p>
                    </div>
                </div>
                
                <DocumentFooter settings={settings} />
            </div>
        </div>
      </div>
    </div>
  );
};
