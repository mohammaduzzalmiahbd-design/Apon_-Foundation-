import React, { useMemo } from 'react';
import { 
  Heart, Users, TrendingUp, Calendar, ArrowRight, 
  MapPin, Mail, Phone, MessageCircle, Info, 
  ExternalLink, Bell, CreditCard, ShieldCheck, Globe,
  PieChart as PieChartIcon, BarChart as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Member, Transaction, AppSettings } from '../types';
import { OrganizationChart } from './OrganizationChart';

interface HomepageProps {
  settings: AppSettings;
  members: Member[];
  transactions: Transaction[];
  notices: any[];
  logoUrl: string | null;
  onNavigate: (view: any) => void;
}

export const Homepage: React.FC<HomepageProps> = ({ 
  settings, 
  members, 
  transactions, 
  notices, 
  logoUrl,
  onNavigate 
}) => {
  // 1. Data Processing for Charts
  const chartData = useMemo(() => {
    // Member Council Distribution
    const counts = {
      ADVISORY: 0,
      EXECUTIVE: 0,
      GENERAL: 0
    };
    members.forEach(m => {
      if (m.council === 'ADVISORY') counts.ADVISORY++;
      else if (m.council === 'EXECUTIVE') counts.EXECUTIVE++;
      else counts.GENERAL++;
    });

    const pieData = [
      { name: 'উপদেষ্টা পরিষদ', value: counts.ADVISORY, color: '#f59e0b' },
      { name: 'কার্যনির্বাহী পরিষদ', value: counts.EXECUTIVE, color: '#2563eb' },
      { name: 'সাধারণ সদস্য', value: counts.GENERAL, color: '#143d27' }
    ];

    // Transaction summary (Income vs Expense)
    const summary = {
      income: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
      expense: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
    };

    const barData = [
      { name: 'মোট আয়', amount: summary.income, fill: '#10b981' },
      { name: 'মোট ব্যয়', amount: summary.expense, fill: '#ef4444' }
    ];

    return { pieData, barData, summary };
  }, [members, transactions]);

  // 2. Recent Notices (Top 3)
  const recentNotices = useMemo(() => {
    return [...notices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  }, [notices]);

  // 3. Goals Highlights
  const defaultGoals = [
    'শিক্ষা ও দক্ষতা উন্নয়ন কর্মসূচি পরিচালনা',
    'দরিদ্র ও মেহনতী মানুষদের স্বাবলম্বী করা',
    'পরিবেশ রক্ষায় বৃক্ষরোপণ ও জনসচেতনতা সৃষ্টি',
    'মা ও শিশু স্বাস্থ্য সেবায় অবদান রাখা',
    'রক্তদান ও জরুরি স্বাস্থ্য সেবা নিশ্চিত করা'
  ];
  const goals = settings.organization.objectives || defaultGoals;

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#143d27] via-[#1a4f33] to-[#0f2d1d] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12">
          {logoUrl ? (
            <img src={logoUrl} className="w-64 h-64 object-contain grayscale blur-sm" />
          ) : (
            <ShieldCheck size={200} />
          )}
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-inner flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <ShieldCheck size={80} className="text-yellow-500" />
            )}
          </div>
          
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-4xl md:text-6xl font-black font-bengali tracking-tight">
              আপন <span className="text-yellow-500">ফাউন্ডেশন</span>
            </h1>
            <p className="text-lg md:text-2xl text-green-100 font-medium font-bengali opacity-90 italic">
              — {settings.organization.slogan || 'মানব সেবায় আমরা'}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
               <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 text-sm">
                  <Calendar size={16} className="text-yellow-400" />
                  <span>প্রতিষ্ঠা: {settings.organization.foundingYear || '২০২৫'}</span>
               </div>
               <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 text-sm">
                  <MapPin size={16} className="text-yellow-400" />
                  <span>{settings.organization.hqLocation || 'বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ'}</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Welcome & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Intro & Goals (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 text-[#143d27] rounded-xl">
                <Info size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 font-bengali">সংক্ষিপ্ত পরিচিতি ও লক্ষ্য</h2>
            </div>
            
            <p className="text-slate-600 leading-relaxed font-bengali mb-8">
              "আপন ফাউন্ডেশন" একটি অরাজনৈতিক ও অলাভজনক সামাজিক সংগঠন। এটি মূলত মানবিক সহায়তা, সমাজ সংস্কার এবং তৃণমূল পর্যায়ের মানুষদের জীবনমান উন্নয়নে কাজ করে। সংগঠনের প্রধান কার্যালয় বালীগাঁও, অষ্টগ্রাম এ অবস্থিত। আমাদের লক্ষ্য একটি আদর্শ ও বৈষম্যমুক্ত সমাজ গঠন করা।
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 transition-hover hover:border-[#143d27]/30 hover:bg-[#143d27]/5 group">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#143d27] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium text-slate-700 font-bengali group-hover:text-[#143d27]">{goal}</p>
                </div>
              ))}
            </div>

            <div className="pt-8 flex flex-wrap gap-4">
               <button 
                onClick={() => onNavigate('ABOUT_US')}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all text-sm"
               >
                 বিস্তারিত জানুন <ArrowRight size={18} />
               </button>
            </div>
          </div>
        </div>

        {/* Quick Actions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex-1">
             <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
               <TrendingUp size={24} className="text-blue-500" /> কার্যক্রমের সারাংশ
             </h2>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 text-white rounded-lg"><Users size={20}/></div>
                      <span className="text-sm font-bold text-blue-900">মোট সদস্য</span>
                   </div>
                   <span className="text-2xl font-black text-blue-600">{members.length}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-600 text-white rounded-lg"><TrendingUp size={20}/></div>
                      <span className="text-sm font-bold text-emerald-900">গড় উপস্থিতি</span>
                   </div>
                   <span className="text-2xl font-black text-emerald-600">৮৫%</span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">অ্যাকশন</p>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => onNavigate('FINANCE')}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95"
                    >
                      <Heart size={20} /> অনুদান দিন
                    </button>
                    <button 
                      onClick={() => onNavigate('FORM')}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95"
                    >
                      <Users size={20} /> সদস্য হোন
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 3. Visual Highlights (Charts) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChartIcon size={24} className="text-amber-500" /> সদস্য বন্টন
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {chartData.pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChartIcon size={24} className="text-emerald-500" /> আর্থিক পরিসংখ্যান
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <ChartTooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs font-medium text-slate-400 mt-4 italic">লাইভ ট্রানজিশন ডাটা (তহবিল ব্যবস্থাপনা)</p>
        </div>
      </section>

      {/* 4. Organizational Structure */}
      <section className="animate-fade-in">
        <OrganizationChart />
      </section>

      {/* 5. Recent News / Notices */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 font-bengali flex items-center gap-3">
               <Bell className="text-orange-500 animate-bounce" size={28} /> সাম্প্রতিক খবর ও নোটিশ
            </h2>
            <button 
              onClick={() => onNavigate('NOTICE')}
              className="text-[#143d27] font-bold text-sm flex items-center gap-1 hover:underline underline-offset-4"
            >
              সবগুলো দেখুন <ArrowRight size={16} />
            </button>
         </div>

         {recentNotices.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {recentNotices.map((notice, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-orange-200 transition-all shadow-sm">
                   <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-bold uppercase tracking-wider">Update</span>
                      <span className="text-[10px] font-bold text-slate-400">{notice.date}</span>
                   </div>
                   <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{notice.title}</h3>
                   <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">{notice.content}</p>
                   <button 
                    onClick={() => onNavigate('NOTICE')}
                    className="text-orange-600 font-bold text-[10px] flex items-center gap-1"
                   >
                     অধিক জানুন <ArrowRight size={12} />
                   </button>
                </div>
             ))}
           </div>
         ) : (
           <div className="text-center py-12 text-slate-400 italic bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
             বর্তমানে কোনো নতুন নোটিশ নেই
           </div>
         )}
      </section>

      {/* 5. Footer Contact Info */}
      <footer className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 p-8 opacity-5">
           <ShieldCheck size={120} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
           <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                 <ShieldCheck className="text-yellow-500" size={32} />
                 <h3 className="text-xl font-black tracking-tighter">APON FOUNDATION</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed italic">
                 আমাদের লক্ষ্য মানবতার সেবায় একতাবদ্ধ হয়ে কাজ করা এবং সমাজ থেকে দারিদ্র্য ও অন্ধকার দূর করা।
              </p>
           </div>

           <div className="space-y-4">
              <h4 className="font-bold text-sm text-yellow-500 uppercase tracking-widest">ঠিকানা</h4>
              <div className="flex items-start gap-3">
                 <MapPin className="text-blue-400 shrink-0" size={18} />
                 <p className="text-xs text-slate-300">{settings.contact.address}</p>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="font-bold text-sm text-yellow-500 uppercase tracking-widest">যোগাযোগ</h4>
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <Mail className="text-red-400 shrink-0" size={16} />
                    <span className="text-xs text-slate-300">{settings.contact.email}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Phone className="text-green-400 shrink-0" size={16} />
                    <span className="text-xs text-slate-300">{settings.contact.phone}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <MessageCircle className="text-emerald-400 shrink-0" size={16} />
                    <span className="text-xs text-slate-300">{settings.contact.whatsapp}</span>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <h4 className="font-bold text-sm text-yellow-500 uppercase tracking-widest">সংযুক্ত থাকুন</h4>
              <div className="flex gap-3">
                 {settings.socialLinks?.facebook && (
                   <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-xl hover:bg-blue-600 transition-colors">
                     <Globe size={18} />
                   </a>
                 )}
                 <button onClick={() => onNavigate('ABOUT_US')} className="p-3 bg-white/10 rounded-xl hover:bg-slate-700 transition-colors">
                   <Info size={18} />
                 </button>
              </div>
           </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              © 2025 APON FOUNDATION • ALL RIGHTS RESERVED
           </p>
           <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase">
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Digital Management</span>
           </div>
        </div>
      </footer>

    </div>
  );
};
