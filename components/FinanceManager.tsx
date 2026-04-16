import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, ArrowRight, Filter, Search, User, Layers, Calendar, DollarSign, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { Transaction, Member, MONTHS, YEARS, TransactionType } from '../types';
import { analyzeFinancials } from '../services/geminiService';

interface Props {
  transactions: Transaction[];
  members: Member[];
  onAddTransaction: (t: Transaction) => void;
  logoUrl: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b', '#4ecdc4', '#845EC2', '#D65DB1'];

// Default categories
const DEFAULT_CATEGORIES = [
  'মাসিক চাঁদা', 'অনুদান', 'অফিস ভাড়া', 'শীতবস্ত্র বিতরণ', 'চিকিৎসা সহায়তা', 'শিক্ষা উপকরণ', 'আপ্যায়ন', 'বিবিধ'
];

export const FinanceManager: React.FC<Props> = ({ transactions, members, onAddTransaction, logoUrl }) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'MEMBER_STATS' | 'CATEGORY_STATS'>('SUMMARY');
  
  // Summary Tab State
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  
  // Member Search State
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Category Analysis State
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Add Transaction Form State
  const [showForm, setShowForm] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'INCOME',
    year: new Date().getFullYear(),
    month: MONTHS[new Date().getMonth()],
    date: new Date().toISOString().split('T')[0],
    category: 'মাসিক চাঁদা',
    amount: 0,
    description: ''
  });

  // --- Derived Data ---

  // 1. Get all unique categories used in transactions + defaults
  const uniqueCategories = useMemo(() => {
    const used = new Set(transactions.map(t => t.category));
    DEFAULT_CATEGORIES.forEach(c => used.add(c));
    return Array.from(used);
  }, [transactions]);

  // 2. Filtered Data for Summary Tab
  const filteredSummaryData = useMemo(() => {
    return transactions.filter(t => {
      const matchYear = t.year === filterYear;
      const matchMonth = filterMonth === 'all' || t.month === filterMonth;
      return matchYear && matchMonth;
    });
  }, [transactions, filterYear, filterMonth]);

  const summaryStats = useMemo(() => {
    const income = filteredSummaryData.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = filteredSummaryData.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredSummaryData]);

  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredSummaryData.forEach(t => {
      if (t.type === 'EXPENSE') {
        grouped[t.category] = (grouped[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [filteredSummaryData]);

  // 3. Member Stats Logic
  const memberStats = useMemo(() => {
    if (!selectedMember) return null;
    
    const memberTxs = transactions.filter(t => t.memberId === selectedMember.id && t.type === 'INCOME');
    const totalContribution = memberTxs.reduce((sum, t) => sum + t.amount, 0);
    
    const currentYear = new Date().getFullYear();
    const currentYearContribution = memberTxs
      .filter(t => t.year === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by year for chart
    const yearlyData: Record<number, number> = {};
    memberTxs.forEach(t => {
        yearlyData[t.year] = (yearlyData[t.year] || 0) + t.amount;
    });
    const chartData = Object.entries(yearlyData).map(([year, amount]) => ({ year, amount }));

    return { totalContribution, currentYearContribution, transactions: memberTxs, chartData };
  }, [selectedMember, transactions]);

  const filteredMembers = useMemo(() => {
    if (!memberSearchTerm) return [];
    return members.filter(m => 
      m.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      m.phone.includes(memberSearchTerm) ||
      (m.nid && m.nid.includes(memberSearchTerm))
    );
  }, [members, memberSearchTerm]);

  // 4. Category Stats Logic
  const categoryStats = useMemo(() => {
    if (!selectedCategory) return null;
    const catTxs = transactions.filter(t => t.category === selectedCategory && t.type === 'EXPENSE');
    const totalSpent = catTxs.reduce((sum, t) => sum + t.amount, 0);
    
    // Sort by date desc
    catTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { totalSpent, transactions: catTxs };
  }, [selectedCategory, transactions]);


  // --- Handlers ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTx.amount && newTx.category) {
      onAddTransaction({
        id: Date.now().toString(),
        type: newTx.type as TransactionType,
        amount: Number(newTx.amount),
        category: newTx.category,
        date: newTx.date!,
        month: newTx.month!,
        year: Number(newTx.year),
        memberId: newTx.memberId,
        description: newTx.description
      });
      setShowForm(false);
      // Reset form but keep date/year mostly same for convenience
      setNewTx(prev => ({
        ...prev,
        amount: 0,
        description: '',
        memberId: undefined,
        category: prev.type === 'INCOME' ? 'মাসিক চাঁদা' : 'বিবিধ'
      }));
      setIsCustomCategory(false);
    }
  };

  const toBengali = (num: number | string) => {
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const bengali = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const s = typeof num === 'number' ? num.toLocaleString() : String(num);
    return s.split('').map(char => {
      const index = english.indexOf(char);
      return index > -1 ? bengali[index] : char;
    }).join('');
  };

  // --- Render Functions ---

  const renderSummaryTab = () => (
    <div className="animate-fade-in space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center">
         <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-500" />
            <span className="text-sm font-bold text-slate-700">ফিল্টার:</span>
         </div>
         <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
         >
            <option value="all">সব মাস</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
         </select>
         <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
         >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
         </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10"><ArrowUpCircle size={48} className="text-emerald-500" /></div>
          <p className="text-sm text-slate-500 mb-1 font-bold">মোট আয় ({filterMonth === 'all' ? 'পুরো বছর' : filterMonth} {filterYear})</p>
          <h3 className="text-3xl font-bold text-emerald-600">৳ {toBengali(summaryStats.income)}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10"><ArrowDownCircle size={48} className="text-red-500" /></div>
          <p className="text-sm text-slate-500 mb-1 font-bold">মোট ব্যয় ({filterMonth === 'all' ? 'পুরো বছর' : filterMonth} {filterYear})</p>
          <h3 className="text-3xl font-bold text-red-600">৳ {toBengali(summaryStats.expense)}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10"><DollarSign size={48} className="text-blue-500" /></div>
          <p className="text-sm text-slate-500 mb-1 font-bold">উদ্বৃত্ত তহবিল</p>
          <h3 className={`text-3xl font-bold ${summaryStats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
             ৳ {toBengali(summaryStats.balance)}
          </h3>
        </div>
      </div>

      {/* Charts & Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
           <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">ব্যয়ের খাতসমূহ (চার্ট)</h3>
           {pieData.length > 0 ? (
             <div className="h-full pb-8">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip formatter={(value) => `৳ ${value}`} />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-400">কোন ব্যয়ের তথ্য নেই</div>
           )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96 overflow-hidden flex flex-col">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex justify-between items-center">
                <span>সাম্প্রতিক লেনদেন</span>
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">সর্বশেষ ২০টি</span>
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {filteredSummaryData.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 sticky top-0">
                            <tr>
                                <th className="p-2 font-semibold">তারিখ</th>
                                <th className="p-2 font-semibold">খাত</th>
                                <th className="p-2 font-semibold text-right">পরিমাণ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSummaryData.slice().reverse().slice(0, 20).map(t => (
                                <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                    <td className="p-2 text-slate-600">{toBengali(t.date)}</td>
                                    <td className="p-2">
                                        <div className="font-medium text-slate-800">{t.category}</div>
                                        <div className="text-xs text-slate-400">{t.description}</div>
                                    </td>
                                    <td className={`p-2 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {t.type === 'INCOME' ? '+' : '-'} ৳{toBengali(t.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">কোন লেনদেন পাওয়া যায়নি</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );

  const renderMemberStatsTab = () => (
    <div className="animate-fade-in space-y-6">
        {/* Search Box */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Search size={20} className="text-indigo-600" /> সদস্য খুঁজুন
            </h3>
            <div className="relative">
                <input 
                  type="text"
                  placeholder="সদস্যের নাম বা মোবাইল নম্বর লিখুন..."
                  className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={memberSearchTerm}
                  onChange={(e) => {
                      setMemberSearchTerm(e.target.value);
                      setSelectedMember(null); // Clear selection on new search
                  }}
                />
                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            </div>

            {/* Suggestions */}
            {memberSearchTerm && !selectedMember && (
                <div className="mt-2 border border-slate-200 rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg absolute z-10 w-full left-0">
                    {filteredMembers.map(m => (
                        <div 
                            key={m.id}
                            onClick={() => {
                                setSelectedMember(m);
                                setMemberSearchTerm(m.name);
                            }}
                            className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                    <User size={14} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                                    <p className="text-xs text-slate-500">{m.phone}</p>
                                </div>
                            </div>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{m.council}</span>
                        </div>
                    ))}
                    {filteredMembers.length === 0 && (
                        <div className="p-4 text-center text-slate-500">কোন সদস্য পাওয়া যায়নি</div>
                    )}
                </div>
            )}
        </div>

        {/* Member Details */}
        {selectedMember && memberStats && (
            <div className="animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <p className="text-indigo-100 text-sm font-medium mb-1">মোট প্রদত্ত চাঁদা/অনুদান (আজীবন)</p>
                        <h2 className="text-4xl font-bold">৳ {toBengali(memberStats.totalContribution)}</h2>
                     </div>
                     <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm">
                        <p className="text-slate-500 text-sm font-medium mb-1">চলতি বছরে প্রদত্ত ({new Date().getFullYear()})</p>
                        <h2 className="text-3xl font-bold text-indigo-600">৳ {toBengali(memberStats.currentYearContribution)}</h2>
                     </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">লেনদেনের ইতিহাস</h3>
                        <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                           {memberStats.transactions.length} টি লেনদেন
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="p-3 font-semibold">তারিখ</th>
                                    <th className="p-3 font-semibold">বিবরণ/মাস</th>
                                    <th className="p-3 font-semibold">সাল</th>
                                    <th className="p-3 font-semibold text-right">পরিমাণ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberStats.transactions.length > 0 ? (
                                    memberStats.transactions.map(t => (
                                        <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-3 font-mono text-slate-600">{toBengali(t.date)}</td>
                                            <td className="p-3">
                                                <span className="font-medium text-slate-800 block">{t.category}</span>
                                                <span className="text-xs text-slate-500">
                                                    {t.month} {t.year} {t.description && `- ${t.description}`}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-600">{toBengali(t.year)}</td>
                                            <td className="p-3 text-right font-bold text-emerald-600">
                                                ৳ {toBengali(t.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-400">
                                            এই সদস্যের কোনো লেনদেনের তথ্য নেই
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderCategoryStatsTab = () => (
    <div className="animate-fade-in space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold text-slate-700 mb-2">ব্যয়ের খাত নির্বাচন করুন</label>
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none"
                >
                    <option value="">-- একটি খাত নির্বাচন করুন --</option>
                    {uniqueCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
            
            {categoryStats && (
                <div className="bg-purple-50 px-6 py-3 rounded-xl border border-purple-200 text-right w-full md:w-auto">
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">এই খাতে মোট ব্যয়</p>
                    <h3 className="text-3xl font-bold text-purple-900">৳ {toBengali(categoryStats.totalSpent)}</h3>
                </div>
            )}
        </div>

        {selectedCategory && categoryStats && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800">ব্যয়ের বিস্তারিত বিবরণ ({selectedCategory})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="p-3 font-semibold">তারিখ</th>
                                <th className="p-3 font-semibold">বিবরণ</th>
                                <th className="p-3 font-semibold text-right">পরিমাণ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryStats.transactions.length > 0 ? (
                                categoryStats.transactions.map(t => (
                                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-3 font-mono text-slate-600">{toBengali(t.date)}</td>
                                        <td className="p-3 text-slate-700">
                                            {t.description || '-'} 
                                            <span className="text-xs text-slate-400 ml-2">({t.month} {t.year})</span>
                                        </td>
                                        <td className="p-3 text-right font-bold text-red-500">
                                            ৳ {toBengali(t.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-400">
                                        এই খাতে কোনো খরচ পাওয়া যায়নি
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {!selectedCategory && (
            <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Layers size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">খরচের হিসাব দেখতে উপরে একটি খাত নির্বাচন করুন</p>
            </div>
        )}
    </div>
  );

  return (
    <div className="pb-20">
      <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden mb-8">
        {/* Header */}
        <div className="p-6 border-b border-indigo-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white to-indigo-50">
            <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
                <DollarSign className="text-indigo-600" /> আর্থিক ব্যবস্থাপনা
            </h2>
            <button 
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-bold shadow-md transition-all"
            >
                {showForm ? <ArrowRight size={18} /> : <Plus size={18} />} 
                {showForm ? 'বন্ধ করুন' : 'নতুন লেনদেন'}
            </button>
        </div>

        {/* Add Transaction Form */}
        {showForm && (
            <div className="p-6 bg-slate-50 border-b border-indigo-100 animate-slide-down">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">নতুন লেনদেনের তথ্য দিন</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-600 mb-1">লেনদেনের ধরন</label>
                        <div className="flex bg-white rounded-lg border border-slate-300 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setNewTx(prev => ({ ...prev, type: 'INCOME', category: 'মাসিক চাঁদা' }))}
                                className={`flex-1 py-2 text-sm font-bold ${newTx.type === 'INCOME' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                আয় (Income)
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewTx(prev => ({ ...prev, type: 'EXPENSE', category: 'বিবিধ' }))}
                                className={`flex-1 py-2 text-sm font-bold ${newTx.type === 'EXPENSE' ? 'bg-red-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                ব্যয় (Expense)
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">তারিখ</label>
                        <input 
                            type="date"
                            required
                            value={newTx.date}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setNewTx(prev => ({ 
                                    ...prev, 
                                    date: e.target.value,
                                    month: MONTHS[date.getMonth()],
                                    year: date.getFullYear()
                                }));
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">টাকার পরিমাণ</label>
                        <input 
                            type="number"
                            placeholder="0.00"
                            required
                            min="0"
                            value={newTx.amount || ''}
                            onChange={(e) => setNewTx(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Dynamic Category Selection */}
                    <div className="lg:col-span-1">
                         <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-slate-600">খাত/বিবরণ</label>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setIsCustomCategory(!isCustomCategory);
                                    setNewTx(prev => ({ ...prev, category: '' }));
                                }}
                                className="text-[10px] text-indigo-600 font-bold hover:underline"
                            >
                                {isCustomCategory ? 'তালিকায় ফিরুন' : '+ নতুন খাত'}
                            </button>
                         </div>
                         
                         {isCustomCategory ? (
                             <input 
                                type="text"
                                placeholder="নতুন খাতের নাম লিখুন..."
                                required
                                value={newTx.category}
                                onChange={(e) => setNewTx(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-yellow-50"
                             />
                         ) : (
                             <select 
                                value={newTx.category}
                                onChange={(e) => setNewTx(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                             >
                                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                         )}
                    </div>

                    {/* Member Selection (Only for Income) */}
                    {newTx.type === 'INCOME' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">সদস্য (ঐচ্ছিক)</label>
                            <select 
                                value={newTx.memberId || ''}
                                onChange={(e) => setNewTx(prev => ({ ...prev, memberId: e.target.value }))}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">-- নির্বাচন করুন --</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className={newTx.type === 'INCOME' ? '' : 'lg:col-span-2'}>
                        <label className="block text-xs font-bold text-slate-600 mb-1">বর্ণনা (অপশনাল)</label>
                        <input 
                            type="text"
                            placeholder="বিস্তারিত..."
                            value={newTx.description || ''}
                            onChange={(e) => setNewTx(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="lg:col-span-3 flex justify-end gap-3 mt-2">
                         <button 
                            type="button" 
                            onClick={() => setShowForm(false)}
                            className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                         >
                            বাতিল
                         </button>
                         <button 
                            type="submit"
                            className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                         >
                            সংরক্ষণ করুন
                         </button>
                    </div>
                </form>
            </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-indigo-50 bg-white">
            <button
                onClick={() => setActiveTab('SUMMARY')}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'SUMMARY' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:text-indigo-600'
                }`}
            >
                মাসিক/বাৎসরিক সারাংশ
            </button>
            <button
                onClick={() => setActiveTab('MEMBER_STATS')}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'MEMBER_STATS' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:text-indigo-600'
                }`}
            >
                সদস্য অনুসন্ধান (ডোনেশন হিস্ট্রি)
            </button>
            <button
                onClick={() => setActiveTab('CATEGORY_STATS')}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'CATEGORY_STATS' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:text-indigo-600'
                }`}
            >
                খাতওয়ারী ব্যয় (Category Analysis)
            </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6 bg-slate-50/50 min-h-[500px]">
            {activeTab === 'SUMMARY' && renderSummaryTab()}
            {activeTab === 'MEMBER_STATS' && renderMemberStatsTab()}
            {activeTab === 'CATEGORY_STATS' && renderCategoryStatsTab()}
        </div>
      </div>
    </div>
  );
};
