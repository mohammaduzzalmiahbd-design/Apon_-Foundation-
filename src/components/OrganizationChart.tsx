import React from 'react';
import { Users, UserCheck, ShieldCheck, ArrowUp, ArrowDown } from 'lucide-react';

export const OrganizationChart: React.FC = () => {
  return (
    <div className="w-full p-8 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">সাংগঠনিক কাঠামো (ইনফোগ্রাফিক)</h2>
      
      <div className="relative flex flex-col items-center gap-12 max-w-4xl mx-auto">
        
        {/* Top Tier: Advisory Council */}
        <div className="relative z-10 w-full md:w-2/3 lg:w-1/2 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 p-6 rounded-xl text-center shadow-md transform hover:scale-105 transition-transform duration-300">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-emerald-600 p-3 rounded-full text-white shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold text-emerald-900 mt-4">উপদেষ্টা পরিষদ</h3>
          <p className="text-emerald-700 text-sm mt-2">নির্বাহী পরিষদকে দিকনির্দেশনা ও পরামর্শ প্রদান করে।</p>
        </div>

        {/* Connector Arrows */}
        <div className="flex w-full justify-center gap-24 relative h-16">
           <div className="flex flex-col items-center text-slate-400 text-xs font-semibold">
              <span className="mb-1">পরামর্শ প্রদান</span>
              <ArrowDown size={24} className="text-slate-400 animate-bounce" />
           </div>
           <div className="flex flex-col items-center text-slate-400 text-xs font-semibold">
              <ArrowUp size={24} className="text-slate-400 animate-bounce" />
              <span className="mt-1">পরামর্শ গ্রহণ</span>
           </div>
        </div>

        {/* Middle Tier: Executive Council */}
        <div className="relative z-10 w-full md:w-2/3 lg:w-1/2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl text-center shadow-md transform hover:scale-105 transition-transform duration-300">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 p-3 rounded-full text-white shadow-lg">
            <UserCheck size={32} />
          </div>
          <h3 className="text-xl font-bold text-blue-900 mt-4">নির্বাহী পরিষদ</h3>
          <p className="text-blue-700 text-sm mt-2">ফাউন্ডেশনের মূল কার্যক্রম পরিচালনা করে এবং সিদ্ধান্ত গ্রহণ করে।</p>
        </div>

        {/* Connector Arrows */}
        <div className="flex w-full justify-center gap-24 relative h-16">
           <div className="flex flex-col items-center text-slate-400 text-xs font-semibold">
              <span className="mb-1">নির্বাচন/ভোট</span>
              <ArrowUp size={24} className="text-slate-400" />
           </div>
        </div>

        {/* Bottom Tier: General Council */}
        <div className="relative z-10 w-full md:w-3/4 lg:w-2/3 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-6 rounded-xl text-center shadow-md transform hover:scale-105 transition-transform duration-300">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-600 p-3 rounded-full text-white shadow-lg">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-4">সাধারণ পরিষদ</h3>
          <p className="text-slate-700 text-sm mt-2">সকল সদস্যদের সমন্বয়ে গঠিত। ভোটের মাধ্যমে নির্বাহী পরিষদ নির্বাচন করে।</p>
        </div>

      </div>
    </div>
  );
};
