import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, PlusCircle, MinusCircle, BookOpen, Wallet, Users, FileDown, Droplet, GitMerge, CreditCard } from 'lucide-react';
import { Transaction } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (view: any) => void;
  isEmbedMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate, isEmbedMode }) => {
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const quickActions = [
    { icon: PlusCircle, label: 'আয় যোগ করুন', desc: 'নতুন আয়ের এন্ট্রি করুন', view: 'FINANCE', color: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100' },
    { icon: MinusCircle, label: 'ব্যয় যোগ করুন', desc: 'ব্যয়ের হিসাব রাখুন', view: 'FINANCE', color: 'text-rose-600', bg: 'bg-rose-50', iconBg: 'bg-rose-100' },
    { icon: BookOpen, label: 'গঠনতন্ত্র', desc: 'ফাউন্ডেশনের নীতিমালা জানুন', view: 'CONSTITUTION', color: 'text-blue-600', bg: 'bg-blue-50', iconBg: 'bg-blue-100' },
    { icon: Wallet, label: 'আর্থিক হিসাব', desc: 'আয়-ব্যয়ের রিপোর্ট দেখুন', view: 'FINANCE', color: 'text-indigo-600', bg: 'bg-indigo-50', iconBg: 'bg-indigo-100' },
    { icon: Users, label: 'সদস্য তালিকা', desc: 'সকল সদস্যদের তথ্য দেখুন', view: 'MEMBERS', color: 'text-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-100' },
    { icon: FileDown, label: 'রিপোর্ট বোর্ড', desc: 'পিডিএফ ও অন্যান্য রিপোর্ট', view: 'REPORTS', color: 'text-cyan-600', bg: 'bg-cyan-50', iconBg: 'bg-cyan-100' },
    { icon: Droplet, label: 'রক্তদাতা গ্রুপ', desc: 'জরুরী রক্তদাতার তালিকা', view: 'BLOOD_DONORS', color: 'text-red-600', bg: 'bg-red-50', iconBg: 'bg-red-100' },
    { icon: GitMerge, label: 'বংশপরম্পরা', desc: 'পারিবারিক কাঠামো দেখুন', view: 'FAMILY_TREE', color: 'text-green-700', bg: 'bg-green-50', iconBg: 'bg-green-100' },
    { icon: CreditCard, label: 'আইডি কার্ড', desc: 'ডিজিটাল আইডি কার্ড তৈরি', view: 'IDCARD', color: 'text-purple-600', bg: 'bg-purple-50', iconBg: 'bg-purple-100' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      {!isEmbedMode && (
        <div className="bg-gradient-to-r from-[#143d27] to-[#1a4f33] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-yellow-500 text-[10px] md:text-xs font-bold tracking-wider uppercase mb-1">স্বাগতম</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">আপন ফাউন্ডেশন ড্যাশবোর্ড</h1>
            <p className="text-green-100 text-xs md:text-sm max-w-xl opacity-90">আপনার ফাউন্ডেশনের কার্যক্রম, আর্থিক হিসাব এবং সদস্যদের তথ্য এক জায়গা থেকে পরিচালনা করুন।</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-emerald-100 relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('FINANCE')}>
          <div className="absolute -right-4 -top-4 bg-emerald-50 w-20 h-20 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">মোট আয়</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">৳ {totalIncome.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
              <ArrowUpRight size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-rose-100 relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('FINANCE')}>
          <div className="absolute -right-4 -top-4 bg-rose-50 w-20 h-20 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">মোট ব্যয়</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">৳ {totalExpense.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200">
              <ArrowDownRight size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-indigo-100 relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('FINANCE')}>
          <div className="absolute -right-4 -top-4 bg-indigo-50 w-20 h-20 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">উদ্বৃত্ত (ব্যালেন্স)</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">৳ {balance.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base md:text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">⚡</span>
          দ্রুত কার্যক্রম ও মেনু
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => onNavigate(action.view)}
                className={`flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 text-left group`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-lg ${action.iconBg} ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-[13px] md:text-sm text-slate-800 leading-tight mb-0.5`}>
                    {action.label}
                  </h3>
                  <p className="text-[11px] md:text-[12px] text-slate-500 leading-tight">
                    {action.desc}
                  </p>
                </div>
                <ArrowUpRight size={14} className="text-slate-300 transition-colors group-hover:text-slate-400 mt-1" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
