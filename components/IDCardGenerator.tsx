import React, { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, FileDown, User, Phone, CreditCard, Droplet, Calendar, MapPin, ZoomIn, Move, RotateCcw } from 'lucide-react';
import { Member } from '../types';
import { downloadAsImage, downloadAsPDF } from '../utils/downloadUtils';
import QRCode from 'qrcode';

interface Props {
  members: Member[];
  logoUrl: string | null;
}

export const IDCardGenerator: React.FC<Props> = ({ members, logoUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Image adjustment states
  const [imgScale, setImgScale] = useState<number>(1);
  const [imgPos, setImgPos] = useState<{x: number, y: number}>({ x: 0, y: 0 });

  // Filter members based on search
  const filteredMembers = searchTerm.trim() 
    ? members.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.includes(searchTerm) ||
        (m.nid && m.nid.includes(searchTerm))
      )
    : [];

  // Generate QR Code and Reset Image Settings when member is selected
  useEffect(() => {
    if (selectedMember) {
      // Reset image adjustments
      setImgScale(1);
      setImgPos({ x: 0, y: 0 });

      const qrData = `Name: ${selectedMember.name}\nPhone: ${selectedMember.phone}\nRole: ${selectedMember.designation || (selectedMember.council === 'GENERAL' ? 'General Member' : 'Member')}`;
      
      QRCode.toDataURL(qrData, { 
        width: 150,
        margin: 1,
        color: {
          dark: '#4f46e5', // Indigo-600
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR Gen Error:', err));
    } else {
      setQrCodeUrl('');
    }
  }, [selectedMember]);

  // Helper to convert English digits to Bengali
  const toBengali = (str: string | undefined) => {
    if (!str) return '';
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const bengali = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.split('').map(char => {
      const index = english.indexOf(char);
      return index > -1 ? bengali[index] : char;
    }).join('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      {/* Search & Selection Sidebar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Search className="text-blue-600" /> সদস্য নির্বাচন করুন
        </h2>

        <div className="mb-6 relative">
          <input 
            type="text"
            placeholder="নাম, ফোন বা NID..."
            className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredMembers.map(member => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                selectedMember?.id === member.id
                  ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                  : 'border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-300">
                {member.profileImage ? (
                  <img src={member.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{member.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {member.designation || (member.council === 'GENERAL' ? 'সাধারণ সদস্য' : 'সদস্য')}
                </p>
              </div>
            </button>
          ))}
          
          {searchTerm && filteredMembers.length === 0 && (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
               <User size={32} className="mx-auto mb-2 opacity-50" />
               <p className="text-sm">কোন সদস্য পাওয়া যায়নি</p>
            </div>
          )}
          
          {!searchTerm && (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">অনুসন্ধান করতে টাইপ করুন...</p>
            </div>
          )}
        </div>

        {selectedMember && (
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-4">
             {/* Image Adjustment Controls */}
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                     <ImageIcon size={14} className="text-blue-600" /> ছবির মাপ ঠিক করুন
                   </h3>
                   <button 
                      onClick={() => { setImgScale(1); setImgPos({x:0, y:0}); }}
                      className="text-[10px] text-slate-500 flex items-center gap-1 hover:text-red-500 transition-colors bg-white px-2 py-1 rounded border border-slate-200"
                      title="রিসেট করুন"
                   >
                     <RotateCcw size={10} /> রিসেট
                   </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-medium">
                       <span className="flex items-center gap-1"><ZoomIn size={10} /> জুম (Zoom)</span>
                       <span>{Math.round(imgScale * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="1" max="3" step="0.1" 
                      value={imgScale} onChange={(e) => setImgScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-medium">
                           <span className="flex items-center gap-1"><Move size={10} /> ডানে/বামে</span>
                        </div>
                        <input 
                          type="range" min="-80" max="80" 
                          value={imgPos.x} onChange={(e) => setImgPos({...imgPos, x: parseInt(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-medium">
                           <span className="flex items-center gap-1"><Move size={10} className="rotate-90" /> উপরে/নিচে</span>
                        </div>
                        <input 
                          type="range" min="-80" max="80" 
                          value={imgPos.y} onChange={(e) => setImgPos({...imgPos, y: parseInt(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                  </div>
                </div>
             </div>

             <h3 className="font-bold text-slate-700 text-sm">ডাউনলোড অপশন</h3>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => downloadAsImage('id-card-preview', `ID_${selectedMember.name}`)}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 py-2.5 rounded-lg hover:bg-emerald-100 font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <ImageIcon size={16} /> ছবি
                </button>
                <button 
                  onClick={() => downloadAsPDF('id-card-preview', `ID_${selectedMember.name}`)}
                  className="bg-rose-50 text-rose-700 border border-rose-200 py-2.5 rounded-lg hover:bg-rose-100 font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <FileDown size={16} /> পিডিএফ
                </button>
             </div>
             <p className="text-[10px] text-slate-400 text-center">
               প্রিন্ট করার জন্য ছবিটি সেভ করে ল্যাবে নিয়ে যান।
             </p>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-2 flex justify-center bg-slate-100 p-8 rounded-xl items-center min-h-[750px] border border-slate-200 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        {selectedMember ? (
          <div className="transform transition-transform hover:scale-[1.02] duration-300">
            
            {/* --- NEW INFOGRAPHIC MULTI-COLOR ID CARD --- */}
            <div 
              id="id-card-preview" 
              className="relative bg-white w-[350px] h-[620px] shadow-2xl overflow-hidden flex flex-col rounded-[2rem] border-4 border-white font-sans"
            >
               {/* Decorative Background Blobs */}
               <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
               <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

               {/* Watermark */}
               {logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.05]">
                    <img src={logoUrl} alt="" className="w-72 grayscale" />
                  </div>
               )}

               {/* HEADER SECTION - Organic Shape - Content adjusted up */}
               <div className="relative h-40 bg-slate-50 rounded-b-[40px] overflow-hidden shrink-0 z-10 shadow-sm border-b border-slate-100">
                  {/* Colorful Gradients overlays */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-full w-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  
                  {/* Top Content */}
                  <div className="relative z-20 flex flex-col items-center pt-3 px-4">
                      {/* Logo Area - Slightly smaller */}
                      <div className="w-12 h-12 bg-white rounded-full p-1 shadow-md mb-1 flex items-center justify-center border border-emerald-100">
                          {logoUrl ? (
                              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                              <div className="text-[10px] text-center text-slate-400 font-bold">Logo</div>
                          )}
                      </div>
                      
                      {/* Organization Name - Adjusted Spacing */}
                      <h1 className="text-xl font-black text-center leading-none tracking-tight drop-shadow-sm mb-1">
                        <span className="text-emerald-600">আপন</span> <span className="text-orange-500">ফাউন্ডেশন</span>
                      </h1>
                      <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">স্থাপিত: ২০২৪</p>
                  </div>
               </div>

               {/* PROFILE PHOTO - Floating over header - Adjusted to not overlap text */}
               <div className="relative z-20 -mt-12 flex justify-center mb-2">
                  <div className="p-1.5 rounded-full bg-white shadow-xl ring-1 ring-slate-100">
                      <div className="w-28 h-28 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-200 flex items-center justify-center relative">
                          {selectedMember.profileImage ? (
                            <img 
                              src={selectedMember.profileImage} 
                              alt={selectedMember.name} 
                              className="w-full h-full object-cover transition-transform duration-75"
                              style={{
                                transform: `scale(${imgScale}) translate(${imgPos.x}px, ${imgPos.y}px)`,
                                transformOrigin: 'center'
                              }}
                            />
                          ) : (
                          <User size={40} className="text-slate-300" />
                          )}
                      </div>
                  </div>
               </div>

               {/* NAME & DESIGNATION */}
               <div className="text-center relative z-10 px-4 mb-3">
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 leading-tight mb-1">
                    {selectedMember.name}
                  </h2>
                  <div className="inline-block bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-1 rounded-full border border-orange-200 shadow-sm">
                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                      {selectedMember.designation || (selectedMember.council === 'GENERAL' ? 'সাধারণ সদস্য' : 'সদস্য')}
                    </span>
                  </div>
               </div>

               {/* INFOGRAPHIC DATA GRID - Colorful Boxes */}
               <div className="px-5 mb-3 relative z-10 grid grid-cols-2 gap-3">
                  
                  {/* ID Box */}
                  <div className="bg-cyan-50 border border-cyan-100 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                     <div className="bg-white p-1.5 rounded-full text-cyan-500 mb-1 shadow-sm">
                        <CreditCard size={14} />
                     </div>
                     <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">আইডি নং</span>
                     <span className="text-sm font-bold text-cyan-800 font-mono">
                       {toBengali(selectedMember.nid?.slice(-6) || 'N/A')}
                     </span>
                  </div>

                  {/* Phone Box */}
                  <div className="bg-violet-50 border border-violet-100 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                     <div className="bg-white p-1.5 rounded-full text-violet-500 mb-1 shadow-sm">
                        <Phone size={14} />
                     </div>
                     <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">মোবাইল</span>
                     <span className="text-sm font-bold text-violet-800 font-mono">
                       {toBengali(selectedMember.phone)}
                     </span>
                  </div>

                  {/* Blood Group Box */}
                  <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                     <div className="bg-white p-1.5 rounded-full text-rose-500 mb-1 shadow-sm">
                        <Droplet size={14} />
                     </div>
                     <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">রক্তের গ্রুপ</span>
                     <span className="text-sm font-bold text-rose-800">
                       {selectedMember.bloodGroup || '-'}
                     </span>
                  </div>

                  {/* Validity Box */}
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                     <div className="bg-white p-1.5 rounded-full text-emerald-500 mb-1 shadow-sm">
                        <Calendar size={14} />
                     </div>
                     <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">মেয়াদ</span>
                     <span className="text-sm font-bold text-emerald-800">
                       ৩১/১২/২০২৫
                     </span>
                  </div>
               </div>

               {/* ADDRESS (Full Width) */}
               <div className="px-5 mb-2 relative z-10">
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg flex items-center gap-2 justify-center">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-600 ml-1">
                      {selectedMember.address || 'বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ'}
                    </span>
                  </div>
               </div>

               {/* BOTTOM SECTION: QR & SIGNATURE */}
               <div className="mt-auto px-6 pb-6 flex items-end justify-between relative z-10">
                  {/* QR Code */}
                  <div className="flex flex-col items-center bg-white p-1.5 rounded-lg shadow-md border border-indigo-100">
                     {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR" className="w-14 h-14" />
                     ) : (
                        <div className="w-14 h-14 bg-slate-100 animate-pulse rounded"></div>
                     )}
                  </div>

                  {/* Signature Area */}
                  <div className="flex flex-col items-center mb-1">
                     <div className="w-28 h-8 mb-1">
                        {/* Empty space for manual signature */}
                     </div>
                     <div className="w-32 border-t-2 border-dashed border-slate-400"></div>
                     <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">কর্তৃপক্ষ</p>
                  </div>
               </div>

               {/* Decorative Footer Line */}
               <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400"></div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400">
             <div className="w-64 h-96 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-white/50">
                <User size={64} className="mb-4 opacity-20" />
                <p className="font-medium">কার্ড জেনারেট করতে<br/>বাম পাশ থেকে সদস্য নির্বাচন করুন</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};