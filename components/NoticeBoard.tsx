import React, { useState } from 'react';
import { Bell, Send, Printer, Share2, Image as ImageIcon, FileText, RotateCcw, FileDown } from 'lucide-react';
import { Member } from '../types';
import { downloadAsImage, downloadAsPDF } from '../utils/downloadUtils';

interface Props {
  members: Member[];
  logoUrl: string | null;
}

export const NoticeBoard: React.FC<Props> = ({ members, logoUrl }) => {
  // Default Initial State
  const [refNo, setRefNo] = useState(`AF/${new Date().getFullYear()}/001`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Native Browser Print
  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setRefNo(`AF/${new Date().getFullYear()}/001`);
    setDate(new Date().toISOString().split('T')[0]);
    setSubject('');
    setBody('');
  };

  // Improved Word Download Function with Strict CSS
  const handleDownloadWord = () => {
    const element = document.getElementById('notice-doc');
    if (!element) return;

    // Convert styles to standard HTML4 compatible CSS for Word
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${subject}</title>
        <style>
          body { font-family: 'SutonnyMJ', 'Nikosh', sans-serif; font-size: 16px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          td { vertical-align: top; padding: 5px; }
          .header-text { text-align: left; color: #1e3a8a; }
          .title-badge { background-color: #000; color: #fff; padding: 5px 20px; font-weight: bold; border-radius: 20px; display: inline-block; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Notice_${date}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppLink = (phone: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (!cleanPhone.startsWith('880')) cleanPhone = '880' + cleanPhone;
    
    const message = `*নোটিশ: আপন ফাউন্ডেশন*\n\nবিষয়: ${subject}\n\nপ্রিয় সদস্য,\n${body.substring(0, 100)}...\n\nবিস্তারিত জানতে অফিসে যোগাযোগ করুন।`;
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      {/* 1. Editor Section (Left Side) */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit no-print order-2 lg:order-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="text-orange-600" /> নোটিশ তৈরি করুন
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
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">তারিখ</label>
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">বিষয়</label>
            <input 
              type="text" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="নোটিশের বিষয় লিখুন..."
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">বিস্তারিত বিবরণ</label>
            <textarea 
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              placeholder="এখানে বিস্তারিত লিখুন..."
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 border border-blue-100">
            <strong>টিপস:</strong> প্রিভিউতে যা দেখছেন, ডাউনলোডে ঠিক তাই পাবেন। সেরা ফলাফলের জন্য <b>"ওয়ার্ড ফাইল"</b> ব্যবহার করুন।
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 mt-4">
            
            <button 
                onClick={handleDownloadWord}
                className="bg-blue-700 text-white py-2.5 rounded-lg hover:bg-blue-800 font-medium flex items-center justify-center gap-2 shadow-md transition-all"
            >
                <FileText size={18} /> ওয়ার্ড ফাইল ডাউনলোড (Best)
            </button>

            <button 
              onClick={handlePrint}
              className="bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-900 font-medium flex items-center justify-center gap-2"
            >
              <Printer size={18} /> প্রিন্ট করুন
            </button>
            
            <div className="grid grid-cols-2 gap-2">
                <button 
                onClick={() => downloadAsImage('notice-doc', 'Notice_Image')}
                className="bg-emerald-50 text-emerald-700 border border-emerald-200 py-2 rounded-lg hover:bg-emerald-100 font-medium flex items-center justify-center gap-2"
                >
                <ImageIcon size={16} /> ইমেজ
                </button>
                 <button 
                onClick={() => downloadAsPDF('notice-doc', 'Notice_PDF')}
                className="bg-rose-50 text-rose-700 border border-rose-200 py-2 rounded-lg hover:bg-rose-100 font-medium flex items-center justify-center gap-2"
                >
                <FileDown size={16} /> পিডিএফ
                </button>
            </div>
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
      <div className="lg:col-span-2 flex justify-center bg-slate-200 p-4 md:p-8 overflow-auto rounded-xl border border-slate-300 order-1 lg:order-2">
        
        {/* 
           THE FIX:
           We wrap the A4 paper in a scaler div.
           The #notice-doc itself has FIXED width/height in millimeters.
           This ensures reflow never happens on download.
        */}
        <div className="a4-wrapper p-0 bg-transparent shadow-2xl origin-top transform scale-[0.45] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.9] xl:scale-100 transition-transform duration-300">
          <div 
            id="notice-doc" 
            className="bg-white text-black relative"
            style={{ 
              width: '210mm', 
              minHeight: '297mm',
              padding: '20mm 25mm',
              fontFamily: "'Noto Sans Bengali', sans-serif",
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden' // prevents overflow issues in screenshot
            }}
          >
            
            {/* Watermark */}
            {logoUrl && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, pointerEvents: 'none' }}>
                <img 
                  src={logoUrl} 
                  alt="Watermark" 
                  style={{ width: '120mm', opacity: 0.05, filter: 'grayscale(100%)' }}
                />
              </div>
            )}
            
            {/* === CONTENT STARTS HERE (RIGID TABLE LAYOUT) === */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                
                {/* Header Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '3px double #1e3a8a', marginBottom: '25px' }}>
                    <tbody>
                        <tr>
                            {/* Logo Cell - Fixed Width */}
                            <td style={{ width: '140px', verticalAlign: 'middle', paddingBottom: '15px' }}>
                                <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ width: '100px', height: '100px', border: '2px dashed #cbd5e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>লোগো</div>
                                    )}
                                </div>
                            </td>

                            {/* Text Cell */}
                            <td style={{ verticalAlign: 'middle', textAlign: 'left', paddingBottom: '15px', paddingLeft: '20px' }}>
                                 <div style={{ color: '#047857', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
                                    بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                 </div>
                                 
                                 <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 5px 0', lineHeight: 1, color: '#1e3a8a' }}>
                                    আপন ফাউন্ডেশন
                                 </h1>
                                 
                                 <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#334155' }}>
                                    প্রধান কার্যালয়: বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ
                                 </p>
                                 
                                 <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500, lineHeight: 1.5 }}>
                                    <div>মোবাইল: ০১৬০৮-৪২৭১১৫</div>
                                    <div>ইমেইল: aponfoundation@gmail.com</div>
                                    <div>ওয়েবসাইট: aponfoundation-bd.blogspot.com</div>
                                 </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Ref & Date Table */}
                <table style={{ width: '100%', marginBottom: '30px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '50%' }}></td> {/* Spacer */}
                            <td style={{ textAlign: 'right', width: '50%', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
                                <div>স্মারক নং: {refNo}</div>
                                <div style={{ marginTop: '5px' }}>তারিখ: {toBengaliDate(date)}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <span style={{ 
                        fontSize: '22px', 
                        fontWeight: 'bold', 
                        color: '#000', 
                        border: '2px solid #000',
                        padding: '6px 30px',
                        borderRadius: '8px',
                        display: 'inline-block'
                    }}>
                        নোটিশ
                    </span>
                </div>

                {/* Subject */}
                <div style={{ marginBottom: '25px' }}>
                    <p style={{ fontSize: '18px', margin: 0, lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 'bold', borderBottom: '2px dotted #000' }}>বিষয়: {subject || "..........................................................."}</span>
                    </p>
                </div>

                {/* Body Content */}
                <div style={{ minHeight: '400px', marginBottom: '40px' }}>
                    <p style={{ 
                        fontSize: '16px', 
                        lineHeight: '2.0', /* High line height prevents overlap */
                        textAlign: 'justify', 
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        color: '#000'
                    }}>
                        {body || "এখানে নোটিশের বিস্তারিত বিবরণ লিখুন। এই অংশটি ওয়ার্ড ফাইলে বা প্রিন্ট করার সময় সুন্দরভাবে প্রদর্শিত হবে।"}
                    </p>
                </div>

                {/* Footer Signatures Table */}
                <table style={{ width: '100%', marginTop: 'auto' }}>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: 'left', width: '40%', verticalAlign: 'bottom' }}>
                                <div style={{ display: 'inline-block', textAlign: 'center' }}>
                                    <div style={{ width: '180px', borderTop: '2px dashed #000', marginBottom: '5px' }}></div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>সাধারণ সম্পাদক</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>আপন ফাউন্ডেশন</div>
                                </div>
                            </td>

                            <td style={{ width: '20%' }}></td>

                            <td style={{ textAlign: 'right', width: '40%', verticalAlign: 'bottom' }}>
                                 <div style={{ display: 'inline-block', textAlign: 'center' }}>
                                    <div style={{ width: '180px', borderTop: '2px dashed #000', marginBottom: '5px' }}></div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>সভাপতি</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>আপন ফাউন্ডেশন</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};