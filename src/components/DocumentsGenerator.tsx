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

  const [docScale, setDocScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 48; // Account for padding
        if (containerWidth < 794) { // 210mm in pixels approx
          setDocScale(containerWidth / 794);
        } else {
          setDocScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- RENDERERS ---

  const renderPad = () => (
    <div id="official-pad" className="a4-paper relative bg-white text-black">
        {/* Watermark in the middle */}
        {logoUrl && (
            <div className="watermark-container">
                <img src={logoUrl} alt="Watermark" crossOrigin="anonymous" />
            </div>
        )}
        
        <div className="doc-box flex flex-col h-full">
            <DocumentHeader logoUrl={logoUrl} settings={settings} />

            <div className="relative z-10 flex-1 flex flex-col mt-4">
                <div className="flex justify-between items-start mb-8 font-bold text-sm text-slate-800 font-bengali">
                    <div className="flex items-center gap-2">
                        স্মারক নং: <span className="border-b-2 border-[#004d26] min-w-[150px] pb-1"></span>
                    </div>
                    <div className="flex items-center gap-2">
                        তারিখ: <span className="border-b-2 border-[#004d26] min-w-[150px] pb-1 text-right">{new Date().toLocaleDateString('bn-BD')}</span>
                    </div>
                </div>

                {/* Professional Content Area */}
                <div className="flex-1 min-h-[500px] flex flex-col">
                    <div 
                      className="w-full text-lg leading-relaxed text-black font-serif whitespace-pre-wrap outline-none flex-1" 
                      contentEditable 
                      style={{ verticalAlign: 'middle' }}
                      dangerouslySetInnerHTML={{ __html: padContent ? padContent : '' }}
                    >
                    </div>
                    {!padContent && (
                       <div className="flex flex-col gap-8 opacity-5 mt-4">
                          {[...Array(10)].map((_, i) => (
                              <div key={i} className="border-b-2 border-[#004d26] w-full h-10"></div>
                          ))}
                       </div>
                    )}
                </div>

                {/* Universal Signature Section ( President, Gen Secretary, Treasurer ) */}
                <div className="mt-auto pt-16 flex justify-between items-end px-2 pb-8">
                    <div className="text-center w-48">
                        <div className="border-t-2 border-[#004d26] pt-1 pt-2">
                           <p className="font-bold text-[#004d26] text-sm">সভাপতি</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">আপন ফাউন্ডেশন</p>
                        </div>
                    </div>
                    <div className="text-center w-48">
                        <div className="border-t-2 border-[#004d26] pt-1 pt-2">
                           <p className="font-bold text-[#004d26] text-sm">সাধারণ সম্পাদক</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">আপন ফাউন্ডেশন</p>
                        </div>
                    </div>
                    <div className="text-center w-48">
                        <div className="border-t-2 border-[#004d26] pt-1 pt-2">
                           <p className="font-bold text-[#004d26] text-sm">অর্থ সম্পাদক</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">আপন ফাউন্ডেশন</p>
                        </div>
                    </div>
                </div>
            </div>

            <DocumentFooter settings={settings} />
        </div>
    </div>
  );

  // Height fixed to ~140mm to fit two on A4 with spacing
  const ReceiptCard = ({ title, copyName }: { title: string, copyName: string }) => (
    <div className="border-4 border-double border-[#004d26] rounded-sm px-6 py-4 relative overflow-hidden h-[138mm] flex flex-col bg-white box-border shrink-0">
        {/* Centered Watermark */}
        {logoUrl && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                <img src={logoUrl} className="w-52 opacity-[0.05] grayscale" />
            </div>
        )}

        <div className="relative z-10 w-full mb-1">
            <DocumentHeader 
                logoUrl={logoUrl} 
                settings={settings} 
                isCompact={true}
                rightElement={(
                    <div className="flex flex-col items-end gap-1">
                        <div className="bg-[#004d26] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase text-center w-full">{title}</div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">{copyName}</p>
                    </div>
                )}
            />
        </div>

        <div className="relative z-10 flex-1 flex flex-col gap-3 text-sm font-medium text-slate-900 pt-2 justify-center">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-600 mr-2 w-16">রসিদ নং:</span>
                    <span className="font-mono font-bold text-sm border-b border-dotted border-slate-400 px-2 min-w-[80px] text-center">{receiptData.no || '................'}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-600 mr-2">তারিখ:</span>
                    <span className="font-mono font-bold text-sm border-b border-dotted border-slate-400 px-2 min-w-[100px] text-center">{receiptData.date}</span>
                </div>
            </div>
            
            <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">গ্রহীতার নাম:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 font-bold text-base leading-none pb-1">{receiptData.receivedFrom || '......................................................................................................'}</div>
            </div>

            <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">টাকার পরিমাণ:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 font-bold font-mono text-lg leading-none pb-1 flex items-center">
                    <span className="mr-1">৳</span> {receiptData.amount || '................'} <span className="ml-1">/-</span>
                </div>
            </div>

            <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">কথায়:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 italic text-xs leading-none pb-1">{receiptData.amountInWords || '......................................................................................................'}</div>
            </div>

            <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-32 text-xs font-bold text-slate-600">বাবদ/খরচের খাত:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 text-sm leading-none pb-1">{receiptData.purpose || '......................................................................................................'}</div>
            </div>
             <div className="flex items-end gap-2 w-full">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">পেমেন্ট মাধ্যম:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 text-xs leading-none pb-1">{receiptData.paymentMethod}</div>
            </div>
        </div>

        <div className="relative z-10 mt-auto pt-8 flex justify-between items-end px-4">
            <div className="text-center">
                <div className="w-32 border-t-2 border-[#004d26] pt-1"></div>
                <p className="text-[10px] text-[#004d26] font-bold">গ্রহীতার স্বাক্ষর</p>
            </div>
            <div className="text-center">
                <div className="w-32 border-t-2 border-[#004d26] pt-1"></div>
                <p className="text-[10px] text-[#004d26] font-bold">আদায়কারীর স্বাক্ষর</p>
            </div>
        </div>
        
        <div className="text-center mt-2 opacity-50 px-8">
            <div className="border-t border-slate-200"></div>
            <p className="text-[7px] font-bold uppercase tracking-widest pt-1">Apon Foundation Management System</p>
        </div>
    </div>
  );

  const renderReceipt = () => (
    <div id="money-receipt" className="a4-paper flex flex-col justify-between relative bg-white text-black" style={{ padding: '5mm' }}>
        {/* TOP: DONOR COPY */}
        <ReceiptCard title="টাকা জমার রসিদ" copyName="সদস্য/দাতা কপি" />

        {/* CUTTING LINE */}
        <div className="flex items-center justify-center relative h-6">
             <div className="w-full border-t-2 border-dashed border-slate-200"></div>
             <div className="absolute bg-white px-4 text-[9px] font-bold text-slate-300 flex items-center gap-1">
                <Scissors size={10} /> এখান থেকে কাটুন
             </div>
        </div>

        {/* BOTTOM: OFFICE COPY */}
        <ReceiptCard title="টাকা জমার রসিদ" copyName="অফিস কপি" />
    </div>
  );

  const VoucherCard = ({ copyName }: { copyName: string }) => (
    <div className="border-4 border-double border-[#cc0000] rounded-sm px-6 py-4 relative overflow-hidden h-[138mm] flex flex-col bg-white box-border shrink-0">
          {/* Centered Watermark */}
          {logoUrl && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                <img src={logoUrl} className="w-52 opacity-[0.05] grayscale" />
            </div>
        )}

        <div className="relative z-10 w-full mb-1">
            <DocumentHeader 
                logoUrl={logoUrl} 
                settings={settings} 
                isCompact={true}
                rightElement={(
                    <div className="flex flex-col items-end gap-1">
                        <div className="bg-[#cc0000] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase text-center w-full">ভাউচার</div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">{copyName}</p>
                    </div>
                )}
            />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-start gap-3 text-sm font-medium text-slate-900 pt-2">
             <div className="flex justify-between mb-2">
                <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-600 mr-2 w-16">ভাউচার নং:</span>
                    <span className="font-mono font-bold text-sm border-b border-dotted border-slate-400 px-2 min-w-[80px] text-center">{voucherData.no || '................'}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs font-bold text-slate-600 mr-2">তারিখ:</span>
                    <span className="font-mono font-bold text-sm border-b border-dotted border-slate-400 px-2 min-w-[100px] text-center">{voucherData.date}</span>
                </div>
            </div>

            <div className="flex items-end gap-2">
                <span className="whitespace-nowrap w-24 text-xs font-bold text-slate-600">প্রদান করা হলো:</span>
                <div className="border-b border-dotted border-slate-400 flex-1 px-2 font-bold leading-none pb-1">{voucherData.paidTo || '......................................................................................................'}</div>
            </div>

            <div className="border border-slate-300 rounded overflow-hidden">
                <div className="flex w-full bg-slate-50 border-b border-slate-300 text-center font-bold py-1.5 text-[11px] text-slate-700">
                    <div className="flex-1 border-r border-slate-300">খরচের বিবরণ</div>
                    <div className="w-32 shrink-0">টাকা</div>
                </div>
                
                <div className="flex w-full h-[100px]">
                     <div className="flex-1 border-r border-slate-300 p-2 text-xs leading-loose whitespace-pre-wrap">
                        {voucherData.description || '................................................................................................................................................................................................................................................................................................................................................................'}
                     </div>
                     <div className="w-32 shrink-0 p-2 text-right font-bold font-mono text-lg flex justify-end items-start pt-4">
                        {voucherData.amount ? <span>৳ {voucherData.amount} /-</span> : '................'}
                     </div>
                </div>
                
                <div className="flex w-full border-t border-slate-300 bg-slate-50 py-1 px-3 items-center">
                     <div className="flex-1 text-right font-bold pr-4 text-[11px] text-slate-600">সর্বমোট (অঙ্কে)</div>
                     <div className="w-32 text-right font-bold font-mono border-l border-slate-300 pl-4">
                        ৳ {voucherData.amount || '................'}/-
                     </div>
                </div>
            </div>

            <div className="flex items-end gap-2 w-full">
                 <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">সর্বমোট (কথায়):</span>
                 <div className="border-b border-dotted border-slate-300 flex-1 text-xs italic text-slate-600 leading-none pb-1">...................................................................................................... টাকা মাত্র</div>
            </div>
        </div>

        <div className="relative z-10 mt-auto pt-8 flex justify-between items-end gap-4 px-2">
            <div className="text-center flex-1">
                <div className="border-t-2 border-[#cc0000] pt-1"></div>
                <p className="text-[9px] font-bold text-[#cc0000]">প্রস্তুতকারী</p>
            </div>
            <div className="text-center flex-1">
                <div className="border-t-2 border-[#cc0000] pt-1"></div>
                <p className="text-[9px] font-bold text-[#cc0000]">হিসাবরক্ষক</p>
            </div>
            <div className="text-center flex-1">
                <div className="border-t-2 border-[#cc0000] pt-1"></div>
                <p className="text-[9px] font-bold text-[#cc0000]">অনুমোদনকারী</p>
            </div>
            <div className="text-center flex-1">
                <div className="border-t-2 border-[#cc0000] pt-1"></div>
                <p className="text-[9px] font-bold text-[#cc0000]">গ্রহীতার স্বাক্ষর</p>
            </div>
        </div>
        
        <div className="text-center mt-2 opacity-30">
            <p className="text-[7px] font-bold tracking-widest uppercase">System Generated | Apon Foundation</p>
        </div>
    </div>
  );

  const renderVoucher = () => (
    <div id="expense-voucher" className="a4-paper flex flex-col justify-between relative bg-white text-black" style={{ padding: '5mm' }}>
        {/* TOP: MAIN COPY */}
        <VoucherCard copyName="অফিস কপি" />

        {/* CUTTING LINE */}
        <div className="flex items-center justify-center relative h-6">
             <div className="w-full border-t-2 border-dashed border-slate-200"></div>
             <div className="absolute bg-white px-4 text-[9px] font-bold text-slate-300 flex items-center gap-1">
                <Scissors size={10} /> এখান থেকে কাটুন
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
            <div className="flex flex-col gap-4 pt-2">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-1">
                    <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest mb-2">প্রতিটি ডকুমেন্ট ডাউনলোডের আগে প্রিভিউ দেখুন</p>
                    <DownloadDropdown 
                        targetRef={docRef} 
                        fileNamePrefix={`Document_${activeDoc}`} 
                        settings={settings} 
                        logoUrl={logoUrl} 
                    />
                </div>
                
                <button 
                    onClick={() => window.print()} 
                    className="w-full bg-[#004d26] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#003d1e] font-bold shadow-md transition-all active:scale-95"
                >
                    <Printer size={18} /> প্রিভিউ প্রিন্ট ও ডাউনলোড
                </button>
            </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-2 order-1 lg:order-2">
         <div ref={containerRef} className="a4-preview-area rounded-xl border border-slate-200 shadow-inner">
             <div 
               ref={docRef} 
               className="a4-paper shadow-2xl transition-transform duration-300 origin-top"
               style={{ transform: `scale(${docScale})` }}
               id="capture-area"
             >
                 {activeDoc === 'PAD' && renderPad()}
                 {activeDoc === 'RECEIPT' && renderReceipt()}
                 {activeDoc === 'VOUCHER' && renderVoucher()}
             </div>
         </div>
      </div>
    </div>
  );
};