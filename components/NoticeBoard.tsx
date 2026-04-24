import React, { useState, useRef } from 'react';
import { Bell, Send, RotateCcw, Share2, Eye, Trash2, Plus, Download, Save, ArrowRight } from 'lucide-react';
import { Member, AppSettings, Notice } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DownloadDropdown } from './DownloadDropdown';

interface Props {
  members: Member[];
  logoUrl: string | null;
  settings: AppSettings;
  notices: Notice[];
  onSaveNotice: (notice: Notice) => void;
  onDeleteNotice: (id: string) => void;
  isAdmin?: boolean;
}

export const NoticeBoard: React.FC<Props> = ({ 
  members, 
  logoUrl, 
  settings, 
  notices, 
  onSaveNotice, 
  onDeleteNotice,
  isAdmin 
}) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [refNo, setRefNo] = useState(`AF/${new Date().getFullYear()}/001`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    setRefNo(`AF/${new Date().getFullYear()}/${(notices.length + 1).toString().padStart(3, '0')}`);
    setDate(new Date().toISOString().split('T')[0]);
    setSubject('');
    setBody('');
    setSelectedNotice(null);
  };

  const handleSave = () => {
    if (!subject || !body) return;
    
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: subject,
      content: body,
      date,
      refNo
    };
    
    onSaveNotice(newNotice);
    setView('LIST');
    handleReset();
  };

  const handleViewNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setRefNo(notice.refNo);
    setDate(notice.date);
    setSubject(notice.title);
    setBody(notice.content);
    setView('CREATE');
  };

  const getWhatsAppLink = (phone: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (!cleanPhone.startsWith('880')) cleanPhone = '880' + cleanPhone;
    
    const message = `*নোটিশ: ${settings.organization.name}*\n\nবিষয়: ${subject}\n\nপ্রিয় সদস্য,\n${body.substring(0, 100)}...\n\nবিস্তারিত জানতে অফিসে যোগাযোগ করুন।`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const toBengaliDate = (dateStr: string) => {
    if (!dateStr) return '';
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const bengali = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return dateStr.split('').map(char => {
      const index = english.indexOf(char);
      return index > -1 ? bengali[index] : char;
    }).join('');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 no-print w-fit">
        <button 
          onClick={() => setView('LIST')}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${view === 'LIST' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Bell size={16} /> নোটিশ তালিকা
        </button>
        <button 
          onClick={() => { setView('CREATE'); handleReset(); }}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${view === 'CREATE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Plus size={16} /> নতুন নোটিশ
        </button>
      </div>

      {view === 'LIST' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {notices.length > 0 ? notices.map(notice => (
            <div key={notice.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-bold uppercase">{notice.date}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleViewNotice(notice)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Eye size={14} /></button>
                   {isAdmin && <button onClick={() => onDeleteNotice(notice.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{notice.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3 mb-6 bg-slate-50 p-3 rounded-lg leading-relaxed">{notice.content}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-[10px] font-mono text-slate-400">Ref: {notice.refNo}</span>
                <button onClick={() => handleViewNotice(notice)} className="text-orange-600 text-xs font-bold flex items-center gap-1">
                  দেখুন <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Bell size={48} className="mb-4 opacity-20" />
              <p className="font-bold">বর্তমানে কোনো নোটিশ নেই</p>
              <button onClick={() => setView('CREATE')} className="mt-4 text-orange-600 font-bold hover:underline">নতুন নোটিশ তৈরি করুন</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* 1. Editor Section (Left Side) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit no-print order-2 lg:order-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="text-orange-600" /> {selectedNotice ? 'নোটিশ ভিউ' : 'নতুন নোটিশ'}
              </h2>
              <button onClick={handleReset} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                <RotateCcw size={12} /> রিসেট
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">স্মারক নং</label>
                <input 
                  type="text" 
                  value={refNo}
                  onChange={e => setRefNo(e.target.value)}
                  disabled={!!selectedNotice}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">তারিখ</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  disabled={!!selectedNotice}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">বিষয়</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  disabled={!!selectedNotice}
                  placeholder="নোটিশের বিষয় লিখুন..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">বিস্তারিত বিবরণ</label>
                <textarea 
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  disabled={!!selectedNotice}
                  rows={8}
                  placeholder="এখানে বিস্তারিত লিখুন..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-50"
                />
              </div>

              {!selectedNotice && (
                <button 
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg transition-all"
                >
                   <Save size={18} /> সিস্টেমে সেভ করুন
                </button>
              )}

              <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 border border-blue-100">
                <strong>টিপস:</strong> নোটিশটি A4 সাইজের PDF হিসেবে রেন্ডার হবে। প্রিভিউতে যা দেখছেন ঠিক তাই পাবেন।
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 mt-4">
                 <DownloadDropdown 
                   targetRef={printRef} 
                   fileNamePrefix={`Notice_${date}`} 
                   settings={settings} 
                   logoUrl={logoUrl} 
                 />
              </div>
            </div>

            {/* WhatsApp Share List */}
            <div className="mt-8 pt-6 border-t border-slate-200">
               <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                 <Share2 size={16} className="text-green-600" /> হোয়াটসঅ্যাপে পাঠান
               </h3>
               <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                 {members.map(member => (
                   <div key={member.id} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100">
                     <div>
                       <p className="text-xs font-bold text-slate-800">{member.name}</p>
                       <p className="text-[10px] text-slate-500">{member.council}</p>
                     </div>
                     <a 
                       href={getWhatsAppLink(member.phone)}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                       title="Send via WhatsApp"
                     >
                       <Send size={12} />
                     </a>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* 2. Preview Section (Right Side) */}
          <div className="lg:col-span-2 flex justify-center bg-slate-200 p-2 sm:p-4 rounded-xl border border-slate-300 order-1 lg:order-2 overflow-x-auto">
            <div className="a4-wrapper p-0 bg-transparent shadow-2xl transition-transform duration-300" style={{ transformOrigin: 'top center', zoom: 'min(1, 100% / 794)' }} ref={printRef}>
              <div 
                id="notice-doc" 
                className="a4-paper flex flex-col relative"
                style={{ 
                  fontFamily: "'Noto Sans Bengali', sans-serif"
                }}
              >
                
                {/* Watermark */}
                {logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                    <img src={logoUrl} alt="Watermark" className="w-[500px] opacity-[0.06] grayscale" />
                  </div>
                )}
                
                <DocumentHeader logoUrl={logoUrl} settings={settings} />
                
                {/* === CONTENT STARTS HERE === */}
                <div className="relative z-10 flex-1 flex flex-col">
                    
                    {/* Ref & Date Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
                        <div>স্মারক নং: <span style={{ color: '#1e3a8a' }}>{refNo}</span></div>
                        <div>তারিখ: <span style={{ color: '#1e3a8a' }}>{toBengaliDate(date)}</span></div>
                    </div>

                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <span style={{ 
                            fontSize: '22px', 
                            fontWeight: 'bold', 
                            color: '#d97706', 
                            borderBottom: '2px solid #d97706',
                            padding: '2px 10px',
                            display: 'inline-block'
                        }}>
                            নোটিশ
                        </span>
                    </div>

                    {/* Subject */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '18px', margin: 0, lineHeight: 1.4, fontWeight: 'bold', color: '#1e3a8a' }}>
                            বিষয়: {subject}
                        </p>
                    </div>

                    {/* Body Content */}
                    <div style={{ flexGrow: 1, marginBottom: '40px' }}>
                        <p style={{ 
                            fontSize: '16px', 
                            lineHeight: '1.8', 
                            textAlign: 'justify', 
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            color: '#1e293b'
                        }}>
                            {body || "এখানে নোটিশের বিস্তারিত বিবরণ লিখুন।"}
                        </p>
                    </div>

                    {/* Footer Signatures Area */}
                    <div className="mt-16 flex justify-between pt-8" style={{ pageBreakInside: 'avoid' }}>
                        <div className="text-center">
                            <div className="w-40 border-t-2 border-dotted border-slate-800 mb-2 mx-auto"></div>
                            <div className="font-bold text-slate-800">সাধারণ সম্পাদক</div>
                            <div className="text-xs text-slate-500">{settings.organization.name || "আপন ফাউন্ডেশন"}</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-40 border-t-2 border-dotted border-slate-800 mb-2 mx-auto"></div>
                            <div className="font-bold text-slate-800">সভাপতি</div>
                            <div className="text-xs text-slate-500">{settings.organization.name || "আপন ফাউন্ডেশন"}</div>
                        </div>
                    </div>
                </div>
                
                {/* System Generated Footer string */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-[9px] text-slate-400 border-t border-slate-100 pt-2 tracking-wider">
                     SYSTEM GENERATED FORM, APON FOUNDATION MANAGEMENT SYSTEM
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
