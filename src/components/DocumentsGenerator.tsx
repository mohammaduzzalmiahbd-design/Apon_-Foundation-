import React, { useState, useRef } from 'react';
import { FileText, CreditCard, Receipt, Printer, Image as ImageIcon, FileDown, PenTool, Scissors } from 'lucide-react';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { DownloadDropdown } from './DownloadDropdown';
import { AppSettings } from '../types';

import { BrandText } from './BrandText';

interface Props {
  logoUrl: string | null;
  settings: AppSettings;
}

type DocType = 'PAD' | 'RECEIPT' | 'VOUCHER';

export const DocumentsGenerator: React.FC<Props> = ({ logoUrl, settings }) => {
  const [activeDoc, setActiveDoc] = useState<DocType>('PAD');
  const docRef = useRef<HTMLDivElement>(null);
  
  // Pad State
  const [padContent, setPadContent] = useState('');

  // Receipt State
  const [receiptData, setReceiptData] = useState({
    no: '',
    date: new Date().toISOString().split('T')[0],
    receivedFrom: '',
    amount: '',
    amountInWords: '',
    purpose: 'মাসিক চাঁদা',
    paymentMethod: 'NAGAD/BKASH/CASH'
  });

  // Voucher State
  const [voucherData, setVoucherData] = useState({
    no: '',
    date: new Date().toISOString().split('T')[0],
    paidTo: '',
    amount: '',
    description: '',
  });

  // --- RENDERERS ---

  const renderPad = () => (
    <div id="official-pad" className="a4-paper flex flex-col relative bg-white text-black h-[297mm]" style={{ padding: '20mm 25mm' }}>
        {/* Watermark Centered Properly */}
        {logoUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <img src={logoUrl} alt="Watermark" className="w-[400px] opacity-[0.05] grayscale" />
            </div>
        )}
        
        <DocumentHeader logoUrl={logoUrl} settings={settings} />

        <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-600 mb-6 border-b border-slate-200 pb-2">
                <span>স্মারক নং: ..............................</span>
                <span>তারিখ: ..............................</span>
            </div>

            {/* Editable Content Area or Lines */}
            {padContent ? (
                <div className="whitespace-pre-wrap text-justify leading-loose text-lg font-serif">
                    {padContent}
                </div>
            ) : (
                <div className="flex flex-col gap-8 opacity-10 mt-8 flex-1">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="border-b border-slate-400 w-full h-8"></div>
                    ))}
                </div>
            )}
        </div>

        {/* Unified Footer */}
        <DocumentFooter settings={settings} />
    </div>
  );

  // Height fixed to ~118mm to fit two on A4 with spacing
  const ReceiptCard = ({ title, copyName }: { title: string, copyName: string }) => (
    <div className="border-2 border-[#004d26] rounded-xl px-6 py-4 relative overflow-hidden h-[118mm] flex flex-col bg-white shadow-sm box-border shrink-0">
        {/* Centered Watermark - Absolute Positioning relative to Card */}
        {logoUrl && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                <img src={logoUrl} className="w-40 opacity-[0.06] grayscale" />
            </div>
        )}

        {/* Header - Unified DocumentHeader in compact mode */}
        <div className="relative z-10 w-full mb-2">
            <DocumentHeader 
                logoUrl={logoUrl} 
                settings={settings} 
                isCompact={true}
                rightElement={(
                    <div className="flex flex-col items-end gap-1">
                        <div className="bg-[#004d26] text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase text-center w-full">{title}</div>
                        <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tight">{copyName}</p>
                    </div>
                )}
            />
        </div>

        {/* Fields - Using flex-col with gap to prevent overlap */}
        <div className="relative z-10 flex-1 flex flex-col gap-2 text-sm font-medium text-slate-900 pt-1 justify-center">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-600 mr-2 w-16">রসিদ নং:</span>
                    <span className="font-mono font-bold text-sm border-b border-dotted border-slate-400 px-2 min-w-[80px] text-center">{receiptData.no || ''}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-600 mr-2">তারিখ:</span>
                    <span className="font-mono font-bold text-sm border-b border-dotted border-slate-400 px-2 min-w-[100px] text-center">{receiptData.date}</span>
                </div>
            </div>
            
            <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">গ্রহীতার নাম:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 font-bold text-base leading-none pb-1 truncate">{receiptData.receivedFrom}</div>
            </div>

            <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">টাকার পরিমাণ:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 font-bold font-mono text-lg leading-none pb-1 flex items-center">
                    <span className="mr-1">৳</span> {receiptData.amount} <span className="ml-1">/-</span>
                </div>
            </div>

            <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">কথায়:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 italic text-xs leading-none pb-1 truncate">{receiptData.amountInWords}</div>
            </div>

            <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">বাবদ/খাত:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 text-sm leading-none pb-1 truncate">{receiptData.purpose}</div>
            </div>
             <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">মাধ্যম:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 text-xs leading-none pb-1">{receiptData.paymentMethod}</div>
            </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-4 flex justify-between items-end shrink-0">
            <div className="text-center">
                <div className="w-28 border-t border-dashed border-slate-400 mb-1"></div>
                <p className="text-[10px] text-slate-500 font-bold">জমাদানকারীর স্বাক্ষর</p>
            </div>
            <div className="text-center">
                <div className="w-28 border-t border-dashed border-slate-400 mb-1"></div>
                <p className="text-[10px] text-slate-500 font-bold">আদায়কারীর স্বাক্ষর</p>
            </div>
        </div>
    </div>
  );

  const renderReceipt = () => (
    <div id="money-receipt" className="a4-paper flex flex-col justify-between relative bg-white text-black h-[297mm]" style={{ padding: '15mm 20mm' }}>
        {/* TOP: DONOR COPY */}
        <ReceiptCard title="টাকা জমার রসিদ" copyName="সদস্য/দাতা কপি" />

        {/* CUTTING LINE CENTERED */}
        <div className="flex items-center justify-center relative w-full h-10 shrink-0">
             <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t-2 border-dashed border-slate-300"></div>
             </div>
             <div className="bg-white px-3 relative flex items-center gap-1 text-slate-400">
                <Scissors size={14} className="transform -rotate-90" />
                <span className="text-[10px] font-bold uppercase tracking-wider">এখানে কাটুন</span>
             </div>
        </div>

        {/* BOTTOM: OFFICE COPY */}
        <ReceiptCard title="টাকা জমার রসিদ" copyName="অফিস কপি" />
    </div>
  );

  const VoucherCard = ({ copyName }: { copyName: string }) => (
    <div className="border-2 border-[#cc0000] rounded-xl px-6 py-4 relative overflow-hidden h-[118mm] flex flex-col bg-white shadow-sm box-border shrink-0">
         {/* Centered Watermark */}
         {logoUrl && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                <img src={logoUrl} className="w-40 opacity-[0.06] grayscale" />
            </div>
        )}

        {/* Header - Unified DocumentHeader in compact mode */}
        <div className="relative z-10 w-full mb-2">
            <DocumentHeader 
                logoUrl={logoUrl} 
                settings={settings} 
                isCompact={true}
                rightElement={(
                    <div className="flex flex-col items-end gap-1">
                        <div className="bg-[#cc0000] text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase text-center w-full">ভাউচার</div>
                        <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tight">{copyName}</p>
                    </div>
                )}
            />
        </div>

        {/* Fields */}
        <div className="relative z-10 flex-1 flex flex-col justify-start gap-2 text-sm font-medium text-slate-900 pt-1">
             <div className="flex justify-between mb-1">
                <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-600 mr-2 w-16">ভাউচার নং:</span>
                    <span className="font-mono font-bold text-sm border-b border-dotted border-slate-400 px-2 min-w-[80px] text-center">{voucherData.no || ''}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-600 mr-2">তারিখ:</span>
                    <span className="font-mono font-bold text-sm border-b border-dotted border-slate-400 px-2 min-w-[100px] text-center">{voucherData.date}</span>
                </div>
            </div>

            <div className="flex items-end gap-2">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">প্রদান করা হলো:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 font-bold leading-none pb-1 truncate">{voucherData.paidTo}</div>
            </div>

            {/* Table Area - Fixed Height to prevent overlap */}
            <div className="border border-slate-300 rounded mt-2">
                {/* Header */}
                <div className="flex w-full bg-slate-100 border-b border-slate-300 text-center font-bold py-1.5 text-[10px] text-slate-700 uppercase">
                    <div className="flex-1 border-r border-slate-300">খরচের বিবরণ</div>
                    <div className="w-24 shrink-0">টাকা</div>
                </div>
                
                {/* Body - Fixed height relative to card size */}
                <div className="flex w-full h-[60px] overflow-hidden">
                     <div className="flex-1 border-r border-slate-300 p-2 text-xs whitespace-pre-wrap break-words leading-tight">
                        {voucherData.description}
                     </div>
                     <div className="w-24 shrink-0 p-2 text-right font-bold font-mono text-base flex justify-end items-start">
                        {voucherData.amount && <span className="mr-1">/-</span>}
                     </div>
                </div>
                
                {/* Total Row */}
                <div className="flex w-full border-t border-slate-300 bg-slate-50">
                     <div className="flex-1 border-r border-slate-300 p-1.5 text-right font-bold pr-3 text-[10px] uppercase text-slate-600">
                        মোট টাকা
                     </div>
                     <div className="w-24 shrink-0 p-1.5 text-right font-bold font-mono text-sm">
                        {voucherData.amount}/-
                     </div>
                </div>
            </div>

            <div className="mt-2 flex items-end gap-2">
                 <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">কথায়:</span>
                 <div className="border-b border-dotted border-slate-300 flex-1 text-xs italic text-slate-600 leading-none pb-1 truncate">........................................................................................................... টাকা মাত্র</div>
            </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-4 flex justify-between items-end gap-2 shrink-0">
            <div className="text-center flex-1">
                <div className="border-t border-dashed border-slate-400 mb-1 w-full"></div>
                <p className="text-[8px] font-bold text-slate-500">প্রস্তুতকারী</p>
            </div>
            <div className="text-center flex-1">
                <div className="border-t border-dashed border-slate-400 mb-1 w-full"></div>
                <p className="text-[8px] font-bold text-slate-500">হিসাবরক্ষক</p>
            </div>
            <div className="text-center flex-1">
                <div className="border-t border-dashed border-slate-400 mb-1 w-full"></div>
                <p className="text-[8px] font-bold text-slate-500">অনুমোদনকারী</p>
            </div>
            <div className="text-center flex-1">
                <div className="border-t border-dashed border-slate-400 mb-1 w-full"></div>
                <p className="text-[8px] font-bold text-slate-500">গ্রহীতার স্বাক্ষর</p>
            </div>
        </div>
    </div>
  );

  const renderVoucher = () => (
    <div id="expense-voucher" className="a4-paper flex flex-col justify-between relative bg-white text-black h-[297mm]" style={{ padding: '15mm 20mm' }}>
        {/* TOP: MAIN COPY */}
        <VoucherCard copyName="অফিস কপি" />

        {/* CUTTING LINE CENTERED */}
        <div className="flex items-center justify-center relative w-full h-10 shrink-0">
             <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t-2 border-dashed border-slate-300"></div>
             </div>
             <div className="bg-white px-3 relative flex items-center gap-1 text-slate-400">
                <Scissors size={14} className="transform -rotate-90" />
                <span className="text-[10px] font-bold uppercase tracking-wider">এখানে কাটুন</span>
             </div>
        </div>

        {/* BOTTOM: EXTRA COPY */}
        <VoucherCard copyName="হিসাবরক্ষণ কপি" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Sidebar Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit no-print order-2 lg:order-1">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
           <FileText className="text-blue-600" /> অফিসিয়াল ডকুমেন্টস
        </h2>

        {/* TABS */}
        <div className="flex flex-col gap-2 mb-6">
            <button 
                onClick={() => setActiveDoc('PAD')}
                className={`p-3 rounded-lg text-left flex items-center gap-3 transition-all ${activeDoc === 'PAD' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
            >
                <PenTool size={18} /> অফিসিয়াল প্যাড
            </button>
            <button 
                onClick={() => setActiveDoc('RECEIPT')}
                className={`p-3 rounded-lg text-left flex items-center gap-3 transition-all ${activeDoc === 'RECEIPT' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
            >
                <Receipt size={18} /> চাঁদা/অনুদান রসিদ
            </button>
            <button 
                onClick={() => setActiveDoc('VOUCHER')}
                className={`p-3 rounded-lg text-left flex items-center gap-3 transition-all ${activeDoc === 'VOUCHER' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
            >
                <CreditCard size={18} /> খরচের ভাউচার
            </button>
        </div>

        <div className="border-t border-slate-200 pt-6 space-y-4">
            
            {/* PAD INPUTS */}
            {activeDoc === 'PAD' && (
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">চিঠির বিষয়বস্তু (অপশনাল)</label>
                    <textarea 
                        rows={10}
                        placeholder="খালি প্যাড প্রিন্ট করতে চাইলে এখানে কিছু লেখার প্রয়োজন নেই। চিঠি লিখতে চাইলে এখানে লিখুন..."
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={padContent}
                        onChange={(e) => setPadContent(e.target.value)}
                    />
                </div>
            )}

            {/* RECEIPT INPUTS */}
            {activeDoc === 'RECEIPT' && (
                <div className="space-y-3">
                    <input className="w-full p-2 border rounded" placeholder="রসিদ নং" value={receiptData.no} onChange={e => setReceiptData({...receiptData, no: e.target.value})} />
                    <input className="w-full p-2 border rounded" type="date" value={receiptData.date} onChange={e => setReceiptData({...receiptData, date: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="প্রদানকারীর নাম" value={receiptData.receivedFrom} onChange={e => setReceiptData({...receiptData, receivedFrom: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="টাকার পরিমাণ (সংখ্যায়)" value={receiptData.amount} onChange={e => setReceiptData({...receiptData, amount: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="টাকার পরিমাণ (কথায়)" value={receiptData.amountInWords} onChange={e => setReceiptData({...receiptData, amountInWords: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="বাবদ (যেমন: মাসিক চাঁদা)" value={receiptData.purpose} onChange={e => setReceiptData({...receiptData, purpose: e.target.value})} />
                </div>
            )}

            {/* VOUCHER INPUTS */}
            {activeDoc === 'VOUCHER' && (
                <div className="space-y-3">
                    <input className="w-full p-2 border rounded" placeholder="ভাউচার নং" value={voucherData.no} onChange={e => setVoucherData({...voucherData, no: e.target.value})} />
                    <input className="w-full p-2 border rounded" type="date" value={voucherData.date} onChange={e => setVoucherData({...voucherData, date: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="যাকে প্রদান করা হলো" value={voucherData.paidTo} onChange={e => setVoucherData({...voucherData, paidTo: e.target.value})} />
                    <textarea className="w-full p-2 border rounded" placeholder="খরচের বিবরণ" value={voucherData.description} onChange={e => setVoucherData({...voucherData, description: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="টাকার পরিমাণ" value={voucherData.amount} onChange={e => setVoucherData({...voucherData, amount: e.target.value})} />
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
                <button onClick={() => window.print()} className="bg-slate-800 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 font-medium">
                    <Printer size={18} /> প্রিন্ট করুন
                </button>
                <div className="flex flex-col gap-2">
                    <DownloadDropdown 
                        targetRef={docRef} 
                        fileNamePrefix={`Document_${activeDoc}`} 
                        settings={settings} 
                        logoUrl={logoUrl} 
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-2 flex justify-center bg-slate-100 p-4 md:p-8 overflow-auto rounded-xl border border-slate-200 order-1 lg:order-2">
         <div className="a4-wrapper p-0 bg-transparent shadow-2xl scale-[0.8] md:scale-100 origin-top">
             <div ref={docRef} id="document-capture-wrapper">
                 {activeDoc === 'PAD' && renderPad()}
                 {activeDoc === 'RECEIPT' && renderReceipt()}
                 {activeDoc === 'VOUCHER' && renderVoucher()}
             </div>
         </div>
      </div>
    </div>
  );
};