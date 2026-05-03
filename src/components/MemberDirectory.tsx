import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, User, Trash2, CreditCard, MapPin, Droplet, Calendar, Briefcase, Download, Image as ImageIcon, FileDown, FileText, Grid, Printer, Upload, Camera } from 'lucide-react';
import { Member, CouncilType, AppSettings } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DownloadDropdown } from './DownloadDropdown';

interface Props {
  members: Member[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  logoUrl?: string | null;
  settings: AppSettings;
  isAdmin?: boolean;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MemberDirectory: React.FC<Props> = ({ members, onAddMember, onUpdateMember, onDeleteMember, logoUrl, settings, isAdmin }) => {
  const [activeTab, setActiveTab] = useState<CouncilType>('GENERAL');
  const [viewMode, setViewMode] = useState<'GRID' | 'PRINT'>('GRID');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [newMember, setNewMember] = useState<Partial<Member>>({ 
    council: 'GENERAL', 
    joinDate: new Date().toISOString().split('T')[0] 
  });
  
  // Refs for card capture and uploads
  const cardRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMemberId, setUploadingMemberId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    
    return members.filter(m => {
      // First filter by active tab/council
      if (m.council !== activeTab) return false;

      // If no search term, return all members in this council
      if (!term) return true;

      // Search logic: Check Name, Phone, or NID
      const nameMatch = m.name.toLowerCase().includes(term);
      const phoneMatch = m.phone.includes(term);
      const nidMatch = m.nid ? m.nid.includes(term) : false;

      return nameMatch || phoneMatch || nidMatch;
    });
  }, [members, activeTab, searchTerm]);

  // Image Helper: Compress and return base64
  const compressImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handler for New Member Form Image
  const handleNewMemberImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (dataUrl) => {
        setNewMember(prev => ({ ...prev, profileImage: dataUrl }));
    });
  };

  // Handler for Existing Member Table Upload
  const triggerTableUpload = (memberId: string) => {
      setUploadingMemberId(memberId);
      tableFileInputRef.current?.click();
  };

  const handleTableImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !uploadingMemberId) return;

      compressImage(file, (dataUrl) => {
          const member = members.find(m => m.id === uploadingMemberId);
          if (member) {
              onUpdateMember({ ...member, profileImage: dataUrl });
          }
          setUploadingMemberId(null);
          // Reset value to allow re-uploading same file if needed
          if (tableFileInputRef.current) tableFileInputRef.current.value = '';
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.name && newMember.phone) {
      if (editingMemberId) {
        onUpdateMember({
          ...(newMember as Member),
          id: editingMemberId,
        });
      } else {
        onAddMember({
          id: Date.now().toString(),
          name: newMember.name!,
          phone: newMember.phone!,
          council: newMember.council as CouncilType,
          designation: newMember.designation,
          nid: newMember.nid,
          address: newMember.address,
          bloodGroup: newMember.bloodGroup,
          joinDate: newMember.joinDate || new Date().toISOString().split('T')[0],
          profileImage: newMember.profileImage
        });
      }
      setShowForm(false);
      setEditingMemberId(null);
      setNewMember({ council: activeTab, joinDate: new Date().toISOString().split('T')[0] });
    }
  };

  const handleEditMember = (member: Member) => {
    setNewMember(member);
    setEditingMemberId(member.id);
    setShowForm(true);
  };

  const openAddForm = () => {
    setNewMember({ council: activeTab, joinDate: new Date().toISOString().split('T')[0] });
    setEditingMemberId(null);
    setShowForm(true);
  };


  const getCouncilTitle = (type: CouncilType) => {
    switch (type) {
      case 'ADVISORY': return 'উপদেষ্টা পরিষদ';
      case 'EXECUTIVE': return 'নির্বাহী পরিষদ';
      case 'GENERAL': return 'সাধারণ পরিষদ';
      default: return 'সদস্য তালিকা';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
      {/* Hidden input for table row uploads */}
      <input 
        type="file" 
        ref={tableFileInputRef}
        onChange={handleTableImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="p-6 border-b border-indigo-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white to-indigo-50">
        <h2 className="text-2xl font-bold text-indigo-900">সদস্য তালিকা</h2>
        
        {viewMode === 'GRID' && (
          <div className="flex items-center gap-2 bg-white border border-indigo-100 px-3 py-2 rounded-lg w-full md:w-72 shadow-sm focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
            <Search size={18} className="text-indigo-400" />
            <input 
              type="text"
              placeholder="নাম, ফোন বা NID খুঁজুন..."
              className="bg-transparent border-none outline-none text-sm w-full text-indigo-800 placeholder-indigo-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2">
           {isAdmin && viewMode === 'GRID' && (
             <button 
               onClick={openAddForm}
               className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm font-bold text-sm transition-all"
             >
               <Plus size={18} /> সদস্য যোগ করুন
             </button>
           )}
           <div className="flex bg-white rounded-lg border border-indigo-100 p-1">
             <button 
               onClick={() => setViewMode('GRID')}
               className={`p-2 rounded ${viewMode === 'GRID' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
               title="কার্ড ভিউ"
             >
               <Grid size={18} />
             </button>
             <button 
               onClick={() => setViewMode('PRINT')}
               className={`p-2 rounded ${viewMode === 'PRINT' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
               title="রিপোর্ট/তালিকা ভিউ"
             >
               <FileText size={18} />
             </button>
           </div>

           {viewMode === 'PRINT' && (
              <>
                 <DownloadDropdown 
                   targetRef={printRef} 
                   fileNamePrefix={`Member_List_${activeTab}`} 
                   settings={settings} 
                   logoUrl={logoUrl || null} 
                 />
                 <button 
                  onClick={() => window.print()}
                  className="bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-900 flex items-center gap-2 shadow-sm"
                  title="প্রিন্ট করুন"
                >
                  <Printer size={18} />
                </button>
              </>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-indigo-50 bg-white no-print">
        {(['GENERAL', 'EXECUTIVE', 'ADVISORY'] as CouncilType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' 
                : 'border-transparent text-slate-500 hover:text-indigo-500 hover:bg-slate-50'
            }`}
          >
            {tab === 'GENERAL' && 'সাধারণ পরিষদ'}
            {tab === 'EXECUTIVE' && 'নির্বাহী পরিষদ'}
            {tab === 'ADVISORY' && 'উপদেষ্টা পরিষদ'}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="bg-slate-50/50 min-h-[500px]">
        
        {/* === GRID VIEW (Interactive) === */}
        {viewMode === 'GRID' && (
          <div className="p-6">
            {showForm && (
              <div className="mb-8 bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-indigo-900 flex items-center gap-2">
                    <User className="text-purple-600" />
                    {editingMemberId ? 'সদস্যের তথ্য সম্পাদনা করুন' : 'নতুন সদস্যের তথ্য যুক্ত করুন'}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 font-bold p-2">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload Field */}
                  <div className="md:col-span-2 flex justify-center mb-4">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-300 flex items-center justify-center bg-indigo-50 overflow-hidden">
                        {newMember.profileImage ? (
                          <img src={newMember.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-indigo-400">
                            <Camera size={24} />
                            <span className="text-[10px] mt-1">ছবি দিন</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-md">
                        <Upload size={12} />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleNewMemberImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">সদস্যের নাম (NID অনুযায়ী)</label>
                    <input 
                      placeholder="পুরো নাম লিখুন" 
                      className="w-full p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700 bg-indigo-50/30" 
                      value={newMember.name || ''} 
                      onChange={e => setNewMember({...newMember, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">মোবাইল নম্বর</label>
                    <input 
                      placeholder="017xxxxxxxx" 
                      className="w-full p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700 bg-indigo-50/30" 
                      value={newMember.phone || ''} 
                      onChange={e => setNewMember({...newMember, phone: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">জাতীয় পরিচয়পত্র (NID)</label>
                    <input 
                      placeholder="NID নম্বর" 
                      className="w-full p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700 bg-indigo-50/30" 
                      value={newMember.nid || ''} 
                      onChange={e => setNewMember({...newMember, nid: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">রক্তের গ্রুপ</label>
                    <select 
                      className="w-full p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700 bg-indigo-50/30"
                      value={newMember.bloodGroup || ''}
                      onChange={e => setNewMember({...newMember, bloodGroup: e.target.value})}
                    >
                      <option value="">নির্বাচন করুন</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                   <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">ঠিকানা</label>
                    <input 
                      placeholder="বর্তমান ঠিকানা" 
                      className="w-full p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700 bg-indigo-50/30" 
                      value={newMember.address || ''} 
                      onChange={e => setNewMember({...newMember, address: e.target.value})}
                    />
                  </div>
                   <div className="space-y-1">
                    <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">পরিষদ নির্বাচন</label>
                    <select 
                      className="w-full p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700 bg-indigo-50/30"
                      value={newMember.council}
                      onChange={e => setNewMember({...newMember, council: e.target.value as CouncilType})}
                    >
                      <option value="GENERAL">সাধারণ পরিষদ</option>
                      <option value="EXECUTIVE">নির্বাহী পরিষদ</option>
                      <option value="ADVISORY">উপদেষ্টা পরিষদ</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">পদবী (যদি থাকে)</label>
                    <input 
                      placeholder="যেমন: সভাপতি, সাধারণ সদস্য" 
                      className="w-full p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none text-slate-700 bg-indigo-50/30" 
                      value={newMember.designation || ''} 
                      onChange={e => setNewMember({...newMember, designation: e.target.value})}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-indigo-50">
                    <button 
                      type="button" 
                      onClick={() => { setShowForm(false); setEditingMemberId(null); }} 
                      className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                      বাতিল
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg transform active:scale-95 transition-all"
                    >
                      {editingMemberId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Member Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMembers.map(member => (
                <div key={member.id} className="relative group">
                  {/* Actual Card Rendered for View */}
                  <div 
                    ref={(el) => (cardRefs.current[member.id] = el)}
                    className="bg-white rounded-2xl shadow-sm border border-indigo-100 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 overflow-hidden relative"
                  >
                     {/* Top Accent Bar */}
                    <div className={`h-2 w-full ${
                      member.council === 'ADVISORY' ? 'bg-emerald-500' :
                      member.council === 'EXECUTIVE' ? 'bg-purple-500' :
                      'bg-blue-500'
                    }`}></div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {/* Profile Image or Fallback */}
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0">
                            {member.profileImage ? (
                              <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User size={32} />
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <h3 className="font-bold text-lg text-indigo-900 leading-tight truncate">{member.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {member.designation && (
                                <span className="text-[10px] uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                  {member.designation}
                                </span>
                              )}
                              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                                member.council === 'ADVISORY' ? 'bg-emerald-100 text-emerald-700' :
                                member.council === 'EXECUTIVE' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {member.council === 'ADVISORY' ? 'উপদেষ্টা' : member.council === 'EXECUTIVE' ? 'নির্বাহী' : 'সাধারণ'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {member.bloodGroup && (
                          <div className="flex flex-col items-center justify-center bg-rose-50 text-rose-600 w-10 h-10 rounded-full border border-rose-100 shadow-sm flex-shrink-0" title="রক্তের গ্রুপ">
                            <Droplet size={14} className="mb-0.5" />
                            <span className="text-[10px] font-bold">{member.bloodGroup}</span>
                          </div>
                        )}
                      </div>

                      {/* Info Grid - Infographic Style */}
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="bg-white p-1.5 rounded-md text-slate-400 shadow-sm"><CreditCard size={14} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">NID নম্বর</p>
                            <p className="text-sm font-medium text-slate-600 font-mono tracking-wide truncate">{member.nid || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="bg-white p-1.5 rounded-md text-slate-400 shadow-sm"><MapPin size={14} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">ঠিকানা</p>
                            <p className="text-sm font-medium text-slate-600 truncate">{member.address || 'উল্লেখ নেই'}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="bg-white p-1.5 rounded-md text-slate-400 shadow-sm"><Briefcase size={14} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">মোবাইল</p>
                                <p className="text-xs font-medium text-slate-600 truncate">{member.phone}</p>
                            </div>
                          </div>
                          <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                             <div className="bg-white p-1.5 rounded-md text-slate-400 shadow-sm"><Calendar size={14} /></div>
                             <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">যোগদান</p>
                                <p className="text-xs font-medium text-slate-600 truncate">{member.joinDate}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 no-print">
                      <button onClick={() => handleEditMember(member)} className="bg-white text-emerald-600 p-2 rounded-full shadow-md hover:bg-emerald-50 border border-emerald-100 transition-colors" title="সম্পাদনা করুন">
                        <span className="flex items-center justify-center w-4 h-4 text-xs font-bold leading-none">✎</span>
                      </button>
                      <button onClick={() => onDeleteMember(member.id)} className="bg-white text-rose-500 p-2 rounded-full shadow-md hover:bg-rose-50 border border-rose-100 transition-colors" title="মুছে ফেলুন">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {filteredMembers.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <User size={48} className="mb-4 text-slate-300" />
                  <p className="text-lg font-medium text-slate-500">কোন সদস্য পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === PRINT/REPORT VIEW (A4 Table) === */}
        {viewMode === 'PRINT' && (
          <div className="a4-wrapper" ref={printRef}>
              {(() => {
                const ROWS_PER_PAGE = 15;
                const chunks = [];
                let remaining = [...filteredMembers];
                
                while (remaining.length > 0) {
                  chunks.push(remaining.splice(0, ROWS_PER_PAGE));
                }
                
                if (chunks.length === 0) {
                   chunks.push([]);
                }

                return chunks.map((chunk, pageIndex) => (
                  <div key={pageIndex} className="a4-paper flex flex-col relative" style={{ marginBottom: pageIndex < chunks.length - 1 ? '20px' : '0' }}>
                    {logoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                        <img src={logoUrl} alt="Watermark" className="w-[500px] opacity-[0.06] grayscale" />
                      </div>
                    )}
                    
                    {/* Header on Every Page */}
                    <DocumentHeader logoUrl={logoUrl} settings={settings} />

                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="text-center mb-6">
                        <span className="bg-slate-900 text-white px-8 py-2 rounded-full border border-slate-800 font-bold text-lg uppercase tracking-wider shadow-sm">
                          {getCouncilTitle(activeTab)}
                        </span>
                      </div>

                      <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-2 w-10 text-center">নং</th>
                            <th className="border border-slate-300 p-2 w-16 text-center">ছবি</th>
                            <th className="border border-slate-300 p-2">নাম</th>
                            <th className="border border-slate-300 p-2">পদবী/ধরন</th>
                            <th className="border border-slate-300 p-2">মোবাইল</th>
                            <th className="border border-slate-300 p-2 text-center">রক্ত</th>
                            <th className="border border-slate-300 p-2">ঠিকানা</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chunk.map((member, index) => {
                            const globalIndex = index + 1 + (pageIndex * ROWS_PER_PAGE);

                            return (
                              <tr key={member.id} className="even:bg-slate-50/50">
                                <td className="border border-slate-300 p-2 text-center">{globalIndex}</td>
                                <td className="border border-slate-300 p-1 text-center align-middle">
                                  <div className="flex flex-col items-center gap-1">
                                    {member.profileImage ? (
                                      <img src={member.profileImage} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                        <User size={16} />
                                      </div>
                                    )}
                                    
                                    {/* Action Buttons */}
                                    {isAdmin && (
                                      <div className="flex flex-col items-center gap-1 mt-1 no-print">
                                        <button 
                                          onClick={() => triggerTableUpload(member.id)}
                                          className="text-[10px] bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded text-slate-600 flex items-center gap-1"
                                          title="ছবি পরিবর্তন করুন"
                                        >
                                          <Camera size={10} /> ছবি
                                        </button>
                                        <button 
                                          onClick={() => handleEditMember(member)}
                                          className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1"
                                          title="সম্পাদনা করুন"
                                        >
                                          <span className="font-bold">✎</span> এডিট
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="border border-slate-300 p-2 font-bold text-slate-800">{member.name}</td>
                                <td className="border border-slate-300 p-2">
                                  {member.designation || (member.council === 'GENERAL' ? 'সাধারণ সদস্য' : 'সদস্য')}
                                </td>
                                <td className="border border-slate-300 p-2 font-mono">{member.phone}</td>
                                <td className="border border-slate-300 p-2 text-center font-bold text-rose-600">{member.bloodGroup || '-'}</td>
                                <td className="border border-slate-300 p-2">{member.address || '-'}</td>
                              </tr>
                            );
                          })}
                          {chunk.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center p-8 text-slate-400 italic border border-slate-300">
                                এই তালিকায় কোন সদস্য নেই
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="relative z-10 mt-auto pt-10 flex flex-col">
                      {/* Signatures only on the LAST page */}
                      {pageIndex === chunks.length - 1 && (
                        <div className="flex justify-between text-sm font-semibold mb-8">
                          <div className="text-center w-32 border-t border-slate-400 pt-2">
                              সভাপতি
                          </div>
                          <div className="text-center w-32 border-t border-slate-400 pt-2">
                              সাধারণ সম্পাদক
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t border-slate-300 pt-4 text-center text-xs text-slate-500 font-medium">
                        পৃষ্ঠা {pageIndex + 1} / {chunks.length}
                      </div>
                    </div>
                  </div>
                ));
              })()}
          </div>
        )}

      </div>
    </div>
  );
};