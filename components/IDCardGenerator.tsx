import React, { useState, useEffect, useRef } from 'react';
import { Search, Image as ImageIcon, CreditCard, Droplet, User, Phone, Calendar, CheckSquare, Square, Download, Trash2, LayoutGrid, X } from 'lucide-react';
import { Member, AppSettings } from '../types';
import QRCode from 'qrcode';
import { DownloadDropdown } from './DownloadDropdown';

interface Props {
  members: Member[];
  logoUrl: string | null;
  settings: AppSettings;
}

export const IDCardGenerator: React.FC<Props> = ({ members, logoUrl, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter members
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm) ||
    (m.nid && m.nid.includes(searchTerm))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allFilteredIds = filteredMembers.map(m => m.id);
    setSelectedIds(allFilteredIds);
  };

  const clearSelection = () => setSelectedIds([]);

  // Generate QR Codes for selected members
  useEffect(() => {
    const generateQRs = async () => {
      const newQRs: Record<string, string> = { ...qrCodes };
      for (const id of selectedIds) {
        if (!newQRs[id]) {
          const m = members.find(member => member.id === id);
          if (m) {
            const qrData = `Name: ${m.name}\nID: ${m.id}\nPhone: ${m.phone}`;
            try {
              const url = await QRCode.toDataURL(qrData, { 
                width: 100, 
                margin: 1,
                color: { dark: '#143d27', light: '#ffffff' }
              });
              newQRs[id] = url;
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
      setQrCodes(newQRs);
    };
    generateQRs();
  }, [selectedIds, members]);

  const toBengali = (str: string | undefined) => {
    if (!str) return '';
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const bengali = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.split('').map(char => {
      const index = english.indexOf(char);
      return index > -1 ? bengali[index] : char;
    }).join('');
  };

  const selectedMembers = members.filter(m => selectedIds.includes(m.id));

  // Single Card Component (ID-1 Standard: 54mm x 85.6mm)
  const IDCard = ({ member }: { member: Member, key?: any }) => (
    <div 
      className="card-item bg-white shadow-xl overflow-hidden relative border border-slate-300"
      style={{ 
        width: '54mm', 
        height: '85.6mm', 
        borderRadius: '3mm',
        background: 'linear-gradient(145deg, #091220 0%, #1c0f4f 40%, #0d381c 80%, #05140b 100%)', // Corporate dark gradient with deep greens/blues
        boxSizing: 'border-box'
      }}
    >
      {/* Lanyard Slot area (Visual only) */}
      <div className="absolute top-[2mm] left-1/2 -translate-x-1/2 w-[10mm] h-[1.2mm] bg-black/40 rounded-full z-20"></div>

      {/* Content wrapper */}
      <div className="relative z-10 h-full flex flex-col pt-[1mm]">
        
        {/* Header - Circular Logo + Balanced Text */}
        <div className="flex items-center gap-[2mm] px-[2.5mm] py-[1mm] mb-[0.5mm] bg-white/95 shadow-sm">
          <div className="w-[11mm] h-[11mm] bg-white rounded-full shrink-0 flex items-center justify-center p-[0.6mm] border border-slate-200">
             {logoUrl ? (
               <img src={logoUrl} className="w-full h-full object-contain rounded-full" referrerPolicy="no-referrer" />
             ) : (
               <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-[3px] text-slate-400 uppercase">Logo</div>
             )}
          </div>
          <div className="flex flex-col flex-1 leading-[1]">
            <h2 className="text-[14px] font-bold font-bengali tracking-tight transform translate-y-[-1.2mm]">
              <span className="text-[#143d27]">আপন</span> <span className="text-[#991b1b]">ফাউন্ডেশন</span>
            </h2>
            <p className="text-[7px] text-slate-600 font-bold font-bengali leading-none">বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ</p>
          </div>
        </div>

        {/* Profile Photo (Circular 16mm) - Centered Exactly above Name */}
        <div className="flex justify-center -mt-[0.5mm] mb-[0.2mm]">
          <div className="w-[16mm] h-[16mm] bg-slate-800 border-[1.2mm] border-white/50 rounded-full overflow-hidden shadow-xl ring-2 ring-black/10">
            {member.profileImage ? (
              <img src={member.profileImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-200">
                <User size={13} />
              </div>
            )}
          </div>
        </div>

        {/* Member Identity - Visual Hierarchy */}
        <div className="text-center px-[2mm] mb-[1mm] transform translate-y-[-2mm]">
          <h3 className="text-[16px] font-black text-white font-bengali leading-[1.1] mb-[0.5mm] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{member.name}</h3>
          <div className="inline-flex items-center gap-1.5 bg-green-500/25 border border-green-500/40 px-3 py-0.5 rounded-full mb-[0.8mm]">
            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-[10px] font-bold text-green-400 font-mono tracking-widest leading-none transform translate-y-[-1.5px]">ID: {toBengali(member.id.slice(-5))}</p>
          </div>
          <p className="text-[10px] text-slate-300 font-bold font-bengali uppercase tracking-wider block leading-none opacity-90">
            {member.designation || (member.council === 'GENERAL' ? 'সাধারণ সদস্য' : 'সদস্য')}
          </p>
        </div>

        {/* Info Grid - Boxed Layout (10px-11px font per request) */}
        <div className="px-[3mm] grid grid-cols-2 gap-[1.5mm] mb-[1.2mm]">
          <div className="bg-black/30 border border-white/10 p-[1mm] rounded-lg flex flex-col items-center justify-center min-h-[10mm] text-center overflow-hidden">
            <span className="text-[5.5px] text-slate-500 font-bold uppercase leading-none mb-1 tracking-tighter transform translate-y-[-2.5px]">রক্তের গ্রুপ</span>
            <div className="flex items-center justify-center">
              <span className="text-[11px] font-black text-red-500 leading-none drop-shadow-sm transform translate-y-[-1.5px]">{member.bloodGroup || 'N/A'}</span>
            </div>
          </div>
          <div className="bg-black/30 border border-white/10 p-[1mm] rounded-lg flex flex-col items-center justify-center min-h-[10mm] text-center overflow-hidden">
             <span className="text-[5.5px] text-slate-500 font-bold uppercase leading-none mb-1 tracking-tighter transform translate-y-[-2.5px]">যোগদানকাল</span>
             <div className="flex items-center justify-center">
               <span className="text-[11px] font-bold text-slate-200 leading-none font-bengali transform translate-y-[-1.5px]">{toBengali(member.joinDate)}</span>
             </div>
          </div>
        </div>

        {/* Middle Mobile Box */}
        <div className="px-[3mm] mb-[2mm]">
          <div className="bg-black/40 border border-white/10 h-[8mm] px-3 rounded-lg flex items-center justify-center gap-2 overflow-hidden">
            <Phone size={10} className="text-green-500 shrink-0" />
            <p className="text-[11px] text-slate-100 font-bold font-mono tracking-widest leading-none transform translate-y-[-2mm]">{toBengali(member.phone)}</p>
          </div>
        </div>

        {/* Footer Area - Shifts everything up via mt-auto, ensuring 4mm margin */}
        <div className="mt-auto px-[3.5mm] pb-[4mm]">
          <div className="flex justify-between items-end mb-1.5">
            {/* Signature Area */}
            <div className="flex flex-col items-center">
               <div className="w-[20mm] border-t border-dashed border-slate-500/60"></div>
               <p className="text-[6px] text-slate-500 uppercase font-bold tracking-widest mt-1 whitespace-nowrap">Authorized Signature</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-[0.8mm] rounded shadow-lg border border-slate-300 ring-2 ring-black/5">
               {qrCodes[member.id] && <img src={qrCodes[member.id]} className="w-[10mm] h-[10mm]" referrerPolicy="no-referrer" />}
            </div>
          </div>

          <p className="text-[5px] text-[#808080] font-medium font-bengali text-center leading-tight opacity-90 uppercase tracking-tight">
            ID card generated by Apon Foundation management system
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* Filters and Selection Control */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="নাম, ফোন বা আইডি দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
           <button onClick={selectAll} className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors">সকলকে নির্বাচন</button>
           <button onClick={clearSelection} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-red-600 transition-colors"><Trash2 size={16}/></button>
        </div>
        <div className="flex justify-end">
           {selectedIds.length > 0 && (
             <DownloadDropdown 
               targetRef={gridRef}
               fileNamePrefix={`Apon_ID_Cards_${selectedIds.length}`}
               settings={settings}
               logoUrl={logoUrl}
             />
           )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Member Select List */}
        <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden no-print">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-sm">সদস্য তালিকা ({filteredMembers.length})</h3>
            <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">{selectedIds.length} নির্বাচিত</span>
          </div>
          <div className="max-h-[600px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredMembers.map(member => {
              const isSelected = selectedIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => toggleSelect(member.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left border ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className={`shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                    {member.profileImage ? <img src={member.profileImage} className="w-full h-full object-cover" /> : <User className="w-full h-full p-1.5 text-slate-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{member.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{toBengali(member.phone)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Grid Preview */}
        <div className="flex-1 bg-slate-200 p-8 rounded-2xl border border-slate-300 overflow-auto min-h-[600px]">
          <div className="flex flex-col items-center gap-4 mb-4 no-print text-slate-500 italic text-sm">
             <LayoutGrid size={24} />
             <span>প্রিভিউ: A4 পৃষ্ঠায় কার্ডগুলোর সজ্জা</span>
          </div>

          <div className="flex justify-center">
            {/* The printable A4 Container */}
            <div 
              ref={gridRef}
              className="a4-grid-container bg-white shadow-2xl relative overflow-hidden"
              style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '10mm',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 54mm)',
                gridAutoRows: '85.6mm',
                gap: '5mm',
                justifyContent: 'center',
                alignContent: 'start',
                backgroundColor: 'white'
              }}
            >
              {/* Dummy header/footer to block DownloadDropdown from injecting global ones */}
              <div className="document-header hidden"></div>
              <div className="document-footer hidden"></div>

              {selectedMembers.length > 0 ? (
                selectedMembers.map(m => <IDCard key={m.id} member={m} />)
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none col-span-2">
                  <CreditCard size={120} className="opacity-10 mb-4" />
                  <p className="text-xl font-bold opacity-20">নির্বাচন করুন কার্ড জেনারেট হবে</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 no-print">
         <h4 className="font-bold text-blue-900 mb-2">প্রিন্টিং গাইড:</h4>
         <ul className="text-sm text-blue-800 space-y-1 opacity-90 list-disc pl-5">
           <li>একসাথে সর্বোচ্চ ৮-১০টি কার্ড একটি A4 পাতায় প্রিন্ট করা সম্ভব।</li>
           <li>কার্ডগুলোর চারপাশে ৫ মিমি মার্জিন রাখা হয়েছে যেন কাটার সময় সুবিধা হয়।</li>
           <li>সেরা রেজুলেশনের জন্য PDF ফাইল ডাউনলোড করে প্রিন্ট করুন।</li>
           <li>ISO/IEC 7810 ID-1 স্ট্যান্ডার্ড (৫৪মিমি × ৮৫.৬মিমি) ব্যবহার করা হয়েছে।</li>
         </ul>
      </div>
    </div>
  );
};
