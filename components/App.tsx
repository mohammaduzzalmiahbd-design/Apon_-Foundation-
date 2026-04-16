import React, { useState, useRef } from 'react';
import { LayoutDashboard, Users, BookOpen, Wallet, Upload, Menu, X, Save, DownloadCloud, UploadCloud, AlertTriangle, CheckCircle, PieChart, Bell } from 'lucide-react';
import { OrganizationChart } from './components/OrganizationChart';
import { MemberDirectory } from './components/MemberDirectory';
import { Constitution } from './components/Constitution';
import { FinanceManager } from './components/FinanceManager';
import { ActivityReports } from './components/ActivityReports';
import { NoticeBoard } from './components/NoticeBoard';
import { Member, Transaction, ConstitutionSection } from './types';

function App() {
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'MEMBERS' | 'CONSTITUTION' | 'FINANCE' | 'REPORTS' | 'BACKUP' | 'NOTICE'>('DASHBOARD');
  const [logo, setLogo] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  // --- State Data ---
  const [members, setMembers] = useState<Member[]>([
    { 
      id: '1', 
      name: 'আব্দুল করিম', 
      phone: '01711000000', 
      council: 'ADVISORY', 
      designation: 'প্রধান উপদেষ্টা',
      nid: '1985123456789',
      address: 'ধানমন্ডি, ঢাকা',
      bloodGroup: 'A+',
      joinDate: '2023-01-01' 
    },
    { 
      id: '2', 
      name: 'রহিম উদ্দিন', 
      phone: '01711000001', 
      council: 'EXECUTIVE', 
      designation: 'সভাপতি', 
      nid: '1990123456789',
      address: 'মিরপুর ১০, ঢাকা',
      bloodGroup: 'B+',
      joinDate: '2023-01-15' 
    },
    { 
      id: '3', 
      name: 'করিম বক্স', 
      phone: '01711000002', 
      council: 'EXECUTIVE', 
      designation: 'সাধারণ সম্পাদক', 
      nid: '1992123456789',
      address: 'উত্তরা, ঢাকা',
      bloodGroup: 'O+',
      joinDate: '2023-01-20' 
    },
    { 
      id: '4', 
      name: 'জামাল হোসেন', 
      phone: '01711000003', 
      council: 'GENERAL', 
      designation: 'সদস্য',
      nid: '1995123456789',
      address: 'সাভার, ঢাকা',
      bloodGroup: 'AB-',
      joinDate: '2023-02-01' 
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '101', date: '2024-01-05', month: 'জানুয়ারি', year: 2024, amount: 500, type: 'INCOME', category: 'মাসিক চাঁদা', memberId: '2' },
    { id: '102', date: '2024-01-10', month: 'জানুয়ারি', year: 2024, amount: 500, type: 'INCOME', category: 'মাসিক চাঁদা', memberId: '3' },
    { id: '103', date: '2024-01-15', month: 'জানুয়ারি', year: 2024, amount: 2000, type: 'EXPENSE', category: 'অফিস ভাড়া' },
    { id: '104', date: '2024-02-05', month: 'ফেব্রুয়ারি', year: 2024, amount: 10000, type: 'INCOME', category: 'অনুদান' },
    { id: '105', date: '2024-02-10', month: 'ফেব্রুয়ারি', year: 2024, amount: 5000, type: 'EXPENSE', category: 'শীতবস্ত্র বিতরণ কর্মসূচি' },
  ]);

  const [constitutionSections, setConstitutionSections] = useState<ConstitutionSection[]>([
    { id: '1', title: 'নামকরণ ও কার্যালয়', content: 'এই সংগঠনের নাম হইবে "আপন ফাউন্ডেশন"। এর প্রধান কার্যালয় ঢাকা, বাংলাদেশে অবস্থিত হইবে।' },
    { id: '2', title: 'লক্ষ্য ও উদ্দেশ্য', content: 'দরিদ্র ও অসহায় মানুষের সেবা করা। শিক্ষা ও স্বাস্থ্যের উন্নয়ন ঘটানো।' }
  ]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(URL.createObjectURL(e.target.files[0]));
    }
  };

  // --- Backup Functions ---
  const handleExportData = () => {
    const data = {
      members,
      transactions,
      constitutionSections,
      exportDate: new Date().toISOString(),
      appName: 'FoundationManagerPro'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `foundation_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.appName === 'FoundationManagerPro') {
          if (json.members) setMembers(json.members);
          if (json.transactions) setTransactions(json.transactions);
          if (json.constitutionSections) setConstitutionSections(json.constitutionSections);
          setImportStatus({ msg: 'সফলভাবে ডাটা রিস্টোর করা হয়েছে!', type: 'success' });
        } else {
          setImportStatus({ msg: 'ভুল ফাইল ফরম্যাট! সঠিক ব্যাকআপ ফাইল নির্বাচন করুন।', type: 'error' });
        }
      } catch (error) {
        setImportStatus({ msg: 'ফাইল রিড করতে সমস্যা হয়েছে।', type: 'error' });
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const NavItem = ({ view, icon: Icon, label }: { view: typeof activeView, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveView(view); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-white hover:shadow'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-700">
      
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-white border-r border-slate-200 p-6 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white overflow-hidden relative shadow-md">
            {logo ? <img src={logo} className="w-full h-full object-cover" /> : <Upload size={20} />}
            {!logo && <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />}
          </div>
          <div>
             <h1 className="font-bold text-slate-800 leading-tight">আপন ফাউন্ডেশন</h1>
             <p className="text-xs text-slate-500">ম্যানেজমেন্ট সিস্টেম</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="ড্যাশবোর্ড" />
          <NavItem view="CONSTITUTION" icon={BookOpen} label="গঠনতন্ত্র" />
          <NavItem view="NOTICE" icon={Bell} label="নোটিশ বোর্ড" />
          <NavItem view="MEMBERS" icon={Users} label="সদস্য তালিকা" />
          <NavItem view="FINANCE" icon={Wallet} label="আর্থিক হিসাব" />
          <NavItem view="REPORTS" icon={PieChart} label="রিপোর্ট/ইনফোগ্রাফিক" />
          <NavItem view="BACKUP" icon={Save} label="ডাটা ব্যাকআপ" />
        </nav>

        <div className="mt-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-800 font-semibold mb-1">সদস্য সংখ্যা</p>
          <p className="text-2xl font-bold text-blue-900">{members.length}</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <span className="font-bold text-slate-700">আপন ফাউন্ডেশন</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
           {isMobileMenuOpen ? <X className="text-slate-600" /> : <Menu className="text-slate-600" />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {activeView === 'DASHBOARD' && (
            <div className="animate-fade-in space-y-8">
              <header>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">স্বাগতম!</h1>
                <p className="text-slate-600">এক নজরে ফাউন্ডেশনের সাংগঠনিক কাঠামো।</p>
              </header>
              <OrganizationChart />
            </div>
          )}

          {activeView === 'CONSTITUTION' && (
            <div className="animate-fade-in">
              <Constitution 
                logoUrl={logo} 
                sections={constitutionSections}
                onUpdateSections={setConstitutionSections}
              />
            </div>
          )}

          {activeView === 'NOTICE' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">নোটিশ বোর্ড</h1>
                <p className="text-slate-600">আনুষ্ঠানিক নোটিশ তৈরি করুন এবং সদস্যদের কাছে পাঠান।</p>
              </header>
              <NoticeBoard members={members} logoUrl={logo} />
            </div>
          )}

          {activeView === 'MEMBERS' && (
            <div className="animate-fade-in">
               <MemberDirectory 
                 members={members} 
                 onAddMember={(m) => setMembers([...members, m])}
                 onDeleteMember={(id) => setMembers(members.filter(m => m.id !== id))}
                 logoUrl={logo} // Pass the logo here
               />
            </div>
          )}

          {activeView === 'FINANCE' && (
            <div className="animate-fade-in">
              <FinanceManager 
                transactions={transactions} 
                members={members}
                onAddTransaction={(t) => setTransactions([...transactions, t])}
                logoUrl={logo}
              />
            </div>
          )}

          {activeView === 'REPORTS' && (
            <div className="animate-fade-in">
               <header className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">ইনফোগ্রাফিক রিপোর্ট</h1>
                <p className="text-slate-600">বিভিন্ন কার্যক্রমের রিপোর্ট তৈরি করুন এবং সোশ্যাল মিডিয়ায় শেয়ার করুন।</p>
              </header>
              <ActivityReports transactions={transactions} logoUrl={logo} />
            </div>
          )}

          {activeView === 'BACKUP' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                  <Save className="text-blue-600" /> ডাটা ব্যাকআপ ও রিস্টোর
                </h2>
                
                <div className="space-y-6">
                  {/* Export Section */}
                  <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                    <h3 className="font-bold text-lg text-indigo-800 mb-2 flex items-center gap-2">
                      <DownloadCloud size={20} /> ব্যাকআপ ডাউনলোড করুন
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      মোবাইল ফরম্যাট দেওয়ার আগে বা মোবাইল পরিবর্তন করার আগে অবশ্যই এখান থেকে ব্যাকআপ ফাইলটি ডাউনলোড করে আপনার মেমোরি কার্ডে বা গুগল ড্রাইভে সেভ করে রাখুন।
                    </p>
                    <button 
                      onClick={handleExportData}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition-colors w-full md:w-auto"
                    >
                      ব্যাকআপ ফাইল ডাউনলোড করুন
                    </button>
                  </div>

                  {/* Import Section */}
                  <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                    <h3 className="font-bold text-lg text-emerald-800 mb-2 flex items-center gap-2">
                      <UploadCloud size={20} /> ব্যাকআপ রিস্টোর করুন
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      আপনার সেভ করা ব্যাকআপ ফাইলটি এখানে আপলোড করলে পুরনো সব তথ্য ফিরে আসবে।
                    </p>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImportData}
                      accept=".json"
                      className="hidden"
                    />
                    
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-emerald-700 transition-colors w-full md:w-auto"
                    >
                      ব্যাকআপ ফাইল আপলোড করুন
                    </button>

                    {importStatus && (
                      <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${importStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {importStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        <span className="font-medium">{importStatus.msg}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default App;