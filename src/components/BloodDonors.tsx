import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, Download, Share2, CheckCircle, Droplet, UserPlus, Phone, MapPin, AlertCircle, FileText, Copy, ArrowRight, Loader2, Trash2, Heart, Handshake, Camera, Upload } from 'lucide-react';
import { BloodDonor, AppSettings } from '../types';
import { DownloadDropdown } from './DownloadDropdown';
import { DocumentHeader } from './DocumentHeader';
import { addBloodDonor } from '../services/firebase';
import { compressImage } from '../lib/imageUtils';

import { generateDeepLink } from '../lib/urlUtils';

interface BloodDonorsProps {
  donors: BloodDonor[];
  setDonors: React.Dispatch<React.SetStateAction<BloodDonor[]>>;
  onDeleteDonor?: (id: string) => Promise<void>;
  onUpdateSettings?: React.Dispatch<React.SetStateAction<AppSettings>>;
  logoUrl?: string | null;
  settings: AppSettings;
  isAdmin?: boolean;
  isPublic?: boolean;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const HEALTH_ISSUES = [
  'HIV/AIDS',
  'হেপাটাইটিস (Hepatitis)',
  'ক্যান্সার (Cancer)',
  'হৃদরোগ (Heart Disease)',
  'কিডনি ব্যর্থতা (Kidney Failure)',
  'হিমোফিলিয়া (Hemophilia)',
  'গুরুতর অ্যানিমিয়া (Severe Anemia)',
  'সংক্রামক রোগ (Infectious Diseases)'
];

export const BloodDonors: React.FC<BloodDonorsProps> = ({ donors, setDonors, onDeleteDonor, onUpdateSettings, logoUrl, settings, isAdmin, isPublic }) => {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'REGISTER'>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'register') return 'REGISTER';
    return 'SEARCH';
  });
  const [selectedGroup, setSelectedGroup] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('group');
  });

  const handleTabChange = (tab: 'SEARCH' | 'REGISTER') => {
    setActiveTab(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab === 'REGISTER' ? 'register' : 'search');
      window.history.replaceState({}, '', url);
    } catch (e) {
      console.warn("URL update skipped", e);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateSettings) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string, 1600, 900, 0.7);
          onUpdateSettings((prev: AppSettings) => ({
            ...prev,
            organization: {
              ...prev.organization,
              bloodDonorBanner: compressed
            }
          }));
        } catch (err) {
          console.error("Compression failed", err);
          // Fallback to original if compression fails, though unlikely
          onUpdateSettings((prev: AppSettings) => ({
            ...prev,
            organization: {
              ...prev.organization,
              bloodDonorBanner: reader.result as string
            }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Form State
  const [formData, setFormData] = useState<Partial<BloodDonor>>({
    healthIssues: []
  });

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    BLOOD_GROUPS.forEach(bg => counts[bg] = 0);
    donors.forEach(d => {
      if (counts[d.bloodGroup] !== undefined) {
        counts[d.bloodGroup]++;
      }
    });
    return counts;
  }, [donors]);

  const filteredDonors = useMemo(() => {
    let filtered = donors;
    if (selectedGroup) {
      filtered = filtered.filter(d => d.bloodGroup === selectedGroup);
    }
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone.includes(searchQuery)
      );
    }
    return filtered;
  }, [donors, selectedGroup, searchQuery]);

  const [isRegisteredSuccessfully, setIsRegisteredSuccessfully] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.bloodGroup || !formData.address) {
      alert('অনুগ্রহ করে নাম, মোবাইল নম্বর, ঠিকানা এবং রক্তের গ্রুপ প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const newDonor: BloodDonor = {
        id: Date.now().toString(),
        name: formData.name,
        fatherName: formData.fatherName || '',
        phone: formData.phone,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        healthIssues: formData.healthIssues || [],
        registrationDate: new Date().toISOString()
      };

      await addBloodDonor(newDonor);
      setDonors([...donors, newDonor]);
      setIsRegisteredSuccessfully(true);
      setFormData({ healthIssues: [] });
    } catch (error) {
      console.error("Registration error:", error);
      alert('নিবন্ধন করার সময় সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHealthIssueToggle = (issue: string) => {
    const currentIssues = formData.healthIssues || [];
    if (currentIssues.includes(issue)) {
      setFormData({ ...formData, healthIssues: currentIssues.filter(i => i !== issue) });
    } else {
      setFormData({ ...formData, healthIssues: [...currentIssues, issue] });
    }
  };

  const handleShare = () => {
    const isRegister = activeTab === 'REGISTER';
    const params: Record<string, string> = {
      tab: isRegister ? 'register' : 'search'
    };
    
    if (selectedGroup) {
      params.group = selectedGroup;
    }
    
    const url = generateDeepLink('BLOOD_DONORS', params);
    
    const shareText = isRegister 
      ? `রক্তদাতা হিসেবে নিবন্ধন করুন: ${url}`
      : `রক্তদাতা অনুসন্ধান করুন: ${url}`;

    navigator.clipboard.writeText(shareText);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl text-red-500 border border-red-100">
            <Droplet size={28} className="fill-red-500" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">রক্তদাতা গ্রুপ</h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">রক্তদান মহৎ কাজ — আপনার রক্তে বাঁচুক প্রাণ</p>
          </div>
        </div>

        {!isPublic && (
          <button 
            onClick={handleShare}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#143d27] hover:bg-[#1a4f33] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 group"
          >
            {linkCopied ? <CheckCircle size={18} className="text-emerald-400" /> : <Share2 size={18} className="group-hover:rotate-12 transition-transform" />}
            {activeTab === 'REGISTER' ? 'নিবন্ধন লিংক শেয়ার' : 'সার্চ লিংক শেয়ার'}
          </button>
        )}
      </div>

      {/* Main Banner Section */}
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl group border-4 border-white">
          <div className={`aspect-[21/9] w-full relative ${!settings.organization.bloodDonorBanner ? 'bg-gradient-to-br from-red-600 via-red-700 to-emerald-800' : ''}`}>
            {settings.organization.bloodDonorBanner ? (
              <img 
                src={settings.organization.bloodDonorBanner} 
                className="w-full h-full object-cover" 
                alt="Blood Donation Banner" 
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8 text-white">
                  <div className="flex -space-x-4">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 animate-pulse">
                      <Droplet size={40} className="text-red-400 fill-red-400" />
                    </div>
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30">
                      <Heart size={40} className="text-pink-400 fill-pink-400" />
                    </div>
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30">
                      <Handshake size={40} className="text-emerald-300" />
                    </div>
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase drop-shadow-lg">
                      রক্তদান <span className="text-yellow-400">জীবন</span> বাঁচায়
                    </h2>
                    <p className="text-white/80 font-medium text-sm md:text-lg max-w-sm drop-shadow-md">
                      আপনার দেওয়া রক্ত একজন মুমূর্ষু রোগীর জীবন বাঁচাতে পারে।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dark Overlay for better text readability if image exists - REMOVED as per user request to show original banner text */}
            {/* {settings.organization.bloodDonorBanner && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 md:p-10">
                <div className="text-white space-y-1">
                  <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">রক্তদান জীবন বাঁচায়</h2>
                  <p className="text-white/80 text-sm md:text-base">আপনার দেওয়া রক্ত একজন মুমূর্ষু রোগীর জীবন বাঁচাতে পারে।</p>
                </div>
              </div>
            )} */}

            {/* Admin Upload Control */}
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2 z-20">
                <input 
                  type="file" 
                  ref={bannerRef}
                  onChange={handleBannerUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    bannerRef.current?.click();
                  }}
                  className="p-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-xl shadow-lg transition-all flex items-center gap-2 font-bold text-xs"
                  title="ব্যানার আপলোড করুন"
                >
                  <Camera size={16} /> <span>ব্যানার পরিবর্তন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-1 flex border-b border-slate-100">
        <button 
          onClick={() => handleTabChange('SEARCH')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-colors ${activeTab === 'SEARCH' ? 'bg-[#143d27] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Search size={18} /> রক্তদাতা অনুসন্ধান করুন
        </button>
        <button 
          onClick={() => handleTabChange('REGISTER')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-colors ${activeTab === 'REGISTER' ? 'bg-[#143d27] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <UserPlus size={18} /> রক্তদাতা হিসেবে নিবন্ধন করুন
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {activeTab === 'SEARCH' && (
          <div className="space-y-6">
            {/* Blood Group Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BLOOD_GROUPS.map(bg => (
                <button 
                  key={bg}
                  onClick={() => setSelectedGroup(selectedGroup === bg ? null : bg)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedGroup === bg ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50 hover:border-red-200 hover:bg-red-50/50'}`}
                >
                  <div className={`text-2xl font-bold ${selectedGroup === bg ? 'text-red-600' : 'text-slate-700'}`}>
                    {bg}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {groupCounts[bg]} জন রক্তদাতা
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="নাম, ঠিকানা বা মোবাইল খুঁজুন..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                {isAdmin && (
                  <DownloadDropdown 
                    targetRef={printRef} 
                    fileNamePrefix={`Blood_Donors_${selectedGroup || 'All'}`} 
                    settings={settings} 
                    logoUrl={logoUrl || null} 
                  />
                )}
                <button onClick={handleShare} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors">
                  {linkCopied ? <CheckCircle size={16} /> : <Share2 size={16} />} 
                  {linkCopied ? 'কপি হয়েছে' : 'শেয়ার করুন'}
                </button>
              </div>
            </div>

            {/* Donor List */}
            <div className="mt-6">
              <h3 className="font-bold text-lg text-slate-800 mb-4">
                {selectedGroup ? `${selectedGroup} গ্রুপের রক্তদাতাগণ` : 'সকল রক্তদাতা'} ({filteredDonors.length} জন)
              </h3>
              
              {filteredDonors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDonors.map(donor => (
                    <div key={donor.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-0 flex">
                        {isAdmin && onDeleteDonor && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('আপনি কি এই রক্তদাতার তথ্য ডিলিট করতে চান?')) {
                                onDeleteDonor(donor.id);
                              }
                            }}
                            className="bg-red-50 text-red-500 p-2 hover:bg-red-500 hover:text-white transition-colors rounded-bl-lg"
                            title="ডিলেট করুন"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-bl-lg text-sm h-full flex items-center">
                          {donor.bloodGroup}
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1 pr-10">{donor.name}</h4>
                      {donor.fatherName && <p className="text-sm text-slate-500 mb-3">পিতা: {donor.fatherName}</p>}
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <Phone size={16} className="text-slate-400" />
                          <a href={`tel:${donor.phone}`} className="hover:text-blue-600 font-medium">{donor.phone}</a>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600 text-sm">
                          <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                          <span>{donor.address}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                  <Droplet size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">কোনো রক্তদাতা পাওয়া যায়নি।</p>
                </div>
              )}
            </div>
            
            {/* Hidden A4 Print View */}
            <div className="hidden">
              <div ref={printRef} className="a4-paper bg-white" style={{ minHeight: '297mm', width: '210mm', padding: '20mm' }}>
                <DocumentHeader logoUrl={logoUrl || null} settings={settings} />
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">
                    {selectedGroup ? `রক্তদাতা তালিকা - ${selectedGroup}` : 'সকল রক্তদাতার তালিকা'}
                  </h2>
                </div>
                <table className="w-full text-sm text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 w-10 text-center">নং</th>
                      <th className="border border-slate-300 p-2">নাম</th>
                      <th className="border border-slate-300 p-2">মোবাইল</th>
                      <th className="border border-slate-300 p-2 text-center">রক্তের গ্রুপ</th>
                      <th className="border border-slate-300 p-2">ঠিকানা</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.map((donor, index) => (
                      <tr key={donor.id} className="even:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center">{index + 1}</td>
                        <td className="border border-slate-300 p-2 font-bold">{donor.name}</td>
                        <td className="border border-slate-300 p-2 font-mono">{donor.phone}</td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-red-600">{donor.bloodGroup}</td>
                        <td className="border border-slate-300 p-2">{donor.address}</td>
                      </tr>
                    ))}
                    {filteredDonors.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-slate-400 italic border border-slate-300">
                          এই তালিকায় কোন রক্তদাতা নেই
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'REGISTER' && (
          <div className="animate-fade-in space-y-8">
            {isRegisteredSuccessfully ? (
              <div className="max-w-xl mx-auto py-12 px-6 text-center space-y-8">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border-2 border-white">
                  <CheckCircle size={48} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-800">নিবন্ধন সফল হয়েছে!</h3>
                  <p className="text-slate-600">আপনি সফলভাবে রক্তদাতা হিসেবে নিবন্ধিত হয়েছেন। আপন ফাউন্ডেশন আপনার এই মহৎ উদ্যোগকে স্বাগত জানায়।</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Heart size={100} className="text-white fill-white" />
                  </div>
                  <div className="flex flex-col items-center gap-3 text-white relative z-10 text-center">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-sm border border-white/30">
                      <Share2 size={32} />
                    </div>
                    <h4 className="font-black text-xl uppercase tracking-tight">আপনার বন্ধুদের জানান</h4>
                    <p className="text-white/80 text-sm font-medium">এই মহৎ কাজে অন্যদের অনুপ্রাণিত করতে আপনার সোশ্যাল মিডিয়ায় লিংকটি শেয়ার করুন।</p>
                  </div>
                  
                  <button 
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-3 bg-white text-red-600 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl"
                  >
                    {linkCopied ? <CheckCircle size={24} /> : <Copy size={24} />}
                    {linkCopied ? 'লিংক কপি হয়েছে!' : 'লিংক কপি করুন'}
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setIsRegisteredSuccessfully(false);
                    setActiveTab('SEARCH');
                  }}
                  className="text-slate-500 font-bold hover:text-slate-800 transition-colors flex items-center gap-2 mx-auto"
                >
                  <ArrowRight size={18} className="rotate-180" /> সার্চ পেজে ফিরে যান
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="max-w-2xl mx-auto space-y-6">
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-800">
                    রক্তদান একটি মহৎ কাজ। দয়া করে সঠিক তথ্য প্রদান করুন। আপনার দেওয়া তথ্য মুমূর্ষু রোগীর জীবন বাঁচাতে সাহায্য করবে।
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">পূর্ণ নাম <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#143d27] outline-none"
                      placeholder="আপনার নাম লিখুন"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">পিতার নাম</label>
                    <input 
                      type="text" 
                      value={formData.fatherName || ''}
                      onChange={e => setFormData({...formData, fatherName: e.target.value})}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#143d27] outline-none"
                      placeholder="পিতার নাম লিখুন"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone || ''}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#143d27] outline-none"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">রক্তের গ্রুপ <span className="text-red-500">*</span></label>
                    <select 
                      required
                      value={formData.bloodGroup || ''}
                      onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#143d27] outline-none bg-white"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">ঠিকানা (গ্রাম, উপজেলা, জেলা) <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      rows={2}
                      value={formData.address || ''}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#143d27] outline-none resize-none"
                      placeholder="বিস্তারিত ঠিকানা লিখুন"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-800 mb-3">স্বাস্থ্য ঘোষণা (Health Declaration)</h3>
                  <p className="text-sm text-slate-600 mb-4">আপনার কি নিচের কোনো রোগ আছে বা কখনো ছিল? (থাকলে টিক দিন)</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {HEALTH_ISSUES.map(issue => (
                      <label key={issue} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={(formData.healthIssues || []).includes(issue)}
                          onChange={() => handleHealthIssueToggle(issue)}
                          className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                        />
                        <span className="text-sm text-slate-700">{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setFormData({ healthIssues: [] });
                      handleTabChange('SEARCH');
                    }}
                    className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                  >
                    বাতিল
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#143d27] text-white rounded-lg font-bold hover:bg-[#1a4f33] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    {isSubmitting ? 'প্রসেস হচ্ছে...' : 'নিবন্ধন করুন'}
                  </button>
                </div>

                {/* Social Share Box */}
                <div className="mt-12 p-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl animate-fade-in shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Heart size={120} className="text-white fill-white" />
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-5 text-white">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl shadow-sm flex items-center justify-center border border-white/30 shrink-0">
                          <Share2 size={28} />
                        </div>
                        <div>
                          <h4 className="font-black text-lg md:text-xl uppercase tracking-tight">নিবন্ধন লিংক শেয়ার করুন</h4>
                          <p className="text-white/80 text-xs md:text-sm font-medium">সোশ্যাল মিডিয়ায় শেয়ার করে অন্যদের রক্তদানে উৎসাহিত করুন</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={handleShare}
                        className="w-full md:w-auto flex items-center justify-center gap-3 bg-white text-red-600 px-8 py-4 rounded-2xl font-black text-base hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-white/20"
                      >
                        {linkCopied ? <CheckCircle size={22} /> : <Copy size={22} />}
                        {linkCopied ? 'লিংক কপি হয়েছে!' : 'লিংক কপি করুন'}
                      </button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden flex items-center gap-3">
                    <div className="bg-yellow-400 text-black px-2.5 py-1 rounded-md text-[10px] font-black uppercase shrink-0">Public Link</div>
                    <div className="text-[10px] md:text-xs text-white/70 truncate font-mono flex-1">
                        {new URL(window.location.href).origin + window.location.pathname + '?view=BLOOD_DONORS&tab=register'}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>

      {isPublic && (
        <div className="pt-12 pb-8 text-center animate-fade-in">
          <div className="inline-flex flex-col items-center gap-2">
            <p className="text-slate-400 text-xs">আপনি কি একজন এডমিন? অথবা ডাটাবেজ এক্সেস করতে চান?</p>
            <button 
              onClick={() => window.location.href = window.location.pathname}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors flex items-center gap-2 shadow-sm border border-slate-200"
            >
              <Droplet size={14} className="text-[#143d27]" /> অফিসিয়াল প্যানেলে লগইন করুন
            </button>
          </div>
          <p className="mt-8 text-[10px] text-slate-300 font-medium tracking-tight">© {new Date().getFullYear()} আপন ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      )}
    </div>
  );
};
