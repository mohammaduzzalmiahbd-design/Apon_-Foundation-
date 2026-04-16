import React, { useState, useMemo } from 'react';
import { Search, Plus, ArrowLeft, Download, Share2, CheckCircle, Droplet, UserPlus, Phone, MapPin, AlertCircle, FileText } from 'lucide-react';
import { BloodDonor } from '../types';
import { jsPDF } from 'jspdf';

interface BloodDonorsProps {
  donors: BloodDonor[];
  setDonors: React.Dispatch<React.SetStateAction<BloodDonor[]>>;
  onBack: () => void;
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

export const BloodDonors: React.FC<BloodDonorsProps> = ({ donors, setDonors, onBack }) => {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'REGISTER'>('SEARCH');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.bloodGroup || !formData.address) {
      alert('অনুগ্রহ করে নাম, মোবাইল নম্বর, ঠিকানা এবং রক্তের গ্রুপ প্রদান করুন।');
      return;
    }

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

    setDonors([...donors, newDonor]);
    alert('রক্তদাতা হিসেবে সফলভাবে নিবন্ধন সম্পন্ন হয়েছে!');
    setFormData({ healthIssues: [] });
    setActiveTab('SEARCH');
    setSelectedGroup(newDonor.bloodGroup);
  };

  const handleHealthIssueToggle = (issue: string) => {
    const currentIssues = formData.healthIssues || [];
    if (currentIssues.includes(issue)) {
      setFormData({ ...formData, healthIssues: currentIssues.filter(i => i !== issue) });
    } else {
      setFormData({ ...formData, healthIssues: [...currentIssues, issue] });
    }
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    
    pdf.addFont('https://raw.githubusercontent.com/shunjid/Siyam-Rupali-ANSI/master/Siyamrupali_ANSI.ttf', 'SiyamRupali', 'normal');
    pdf.setFont('SiyamRupali');
    
    pdf.setFontSize(20);
    pdf.text('Apon Foundation - Blood Donors', 105, 20, { align: 'center' });
    
    pdf.setFontSize(14);
    if (selectedGroup) {
      pdf.text(`Blood Group: ${selectedGroup}`, 105, 30, { align: 'center' });
    } else {
      pdf.text('All Blood Groups', 105, 30, { align: 'center' });
    }

    pdf.setFontSize(10);
    let yPos = 45;
    
    pdf.text('Name', 20, yPos);
    pdf.text('Phone', 80, yPos);
    pdf.text('Group', 130, yPos);
    pdf.text('Address', 150, yPos);
    
    pdf.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;

    filteredDonors.forEach((donor, index) => {
      if (yPos > 280) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Basic transliteration for PDF compatibility if Bengali font fails
      pdf.text(donor.name || '-', 20, yPos);
      pdf.text(donor.phone || '-', 80, yPos);
      pdf.text(donor.bloodGroup || '-', 130, yPos);
      
      const address = pdf.splitTextToSize(donor.address || '-', 40);
      pdf.text(address, 150, yPos);
      
      yPos += 10 * address.length;
    });

    pdf.save(`blood-donors-${selectedGroup || 'all'}.pdf`);
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'blood_donors');
    if (selectedGroup) {
      url.searchParams.set('group', selectedGroup);
    }
    navigator.clipboard.writeText(url.toString());
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#143d27] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Droplet size={100} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-[#1a4f33] rounded-lg text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className="p-3 bg-[#1a4f33] rounded-lg border border-[#2a6f43] hidden md:block">
              <Droplet className="text-red-500" size={32} />
            </div>
            <div>
              <p className="text-yellow-500 text-sm font-medium">আপন ফাউন্ডেশন — মানবসেবায় আমরা</p>
              <h2 className="text-2xl font-bold text-white">রক্তদাতা গ্রুপ</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
        <button 
          onClick={() => setActiveTab('SEARCH')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-colors ${activeTab === 'SEARCH' ? 'bg-[#143d27] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Search size={18} /> রক্তদাতা অনুসন্ধান করুন
        </button>
        <button 
          onClick={() => setActiveTab('REGISTER')}
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
                <button onClick={handleDownloadPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors">
                  <FileText size={16} /> PDF ডাউনলোড
                </button>
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
                      <div className="absolute top-0 right-0 bg-red-100 text-red-700 font-bold px-3 py-1 rounded-bl-lg text-sm">
                        {donor.bloodGroup}
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
          </div>
        )}

        {activeTab === 'REGISTER' && (
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
                  setActiveTab('SEARCH');
                }}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
              >
                বাতিল
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 bg-[#143d27] text-white rounded-lg font-bold hover:bg-[#1a4f33] transition-colors shadow-md"
              >
                নিবন্ধন করুন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
