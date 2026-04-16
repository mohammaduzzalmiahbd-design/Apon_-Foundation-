import React, { useState } from 'react';
import { FileText, Edit3, Save, FileStack, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { generateConstitutionContent } from '../services/geminiService';
import { ConstitutionSection } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { generateLongPDFFromSections } from '../utils/downloadUtils';

interface Props {
  logoUrl: string | null;
  sections: ConstitutionSection[];
  onUpdateSections: (sections: ConstitutionSection[]) => void;
}

export const Constitution: React.FC<Props> = ({ logoUrl, sections, onUpdateSections }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState('');

  // Update existing content function
  const handleUpdate = (idx: number, key: keyof ConstitutionSection, value: string) => {
    const newSections = [...sections];
    newSections[idx] = { ...newSections[idx], [key]: value };
    onUpdateSections(newSections);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress('প্রস্তুত হচ্ছে...');
    
    // We use the stitching method to capture the full length of content without cutoff
    setTimeout(async () => {
        await generateLongPDFFromSections('constitution-page-section', 'Apon_Foundation_Constitution', '#ffffff', (curr, total) => {
            setProgress(`পিডিএফ প্রসেসিং: ${curr}/${total}`);
        });
        setIsDownloading(false);
        setProgress('');
    }, 500);
  };

  const handleCopyFullText = () => {
    const fullText = sections.map(s => {
      if (s.id === 'cover_page') return `--- ${s.title} ---\n${s.content}\n`;
      return `--- ${s.title} ---\n${s.content}\n`;
    }).join('\n----------------------------------------\n\n');

    navigator.clipboard.writeText(fullText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('কপি করতে সমস্যা হয়েছে।');
    });
  };

  // Helper to render text with basic styling
  const renderFormattedContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('ধারা')) {
        return <p key={i} className="font-bold text-slate-900 mt-4 mb-2 text-lg border-b border-slate-200 pb-1 inline-block">{line}</p>;
      }
      if (trimmed.startsWith('উপধারা')) {
        return <p key={i} className="font-semibold text-slate-800 ml-4 mt-2 mb-1">{line}</p>;
      }
      
      // Bullets
      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
         return <div key={i} className="flex gap-2 ml-6 mb-1"><span className="mt-2 w-1.5 h-1.5 bg-slate-800 rounded-full shrink-0"></span><p>{trimmed.replace(/^[\•\*\-]\s*/, '')}</p></div>;
      }

      // Bengali List items (ক), খ), etc) OR Roman Numerals (i), ii))
      // Matches "ক)", "ক.", "i)", "i.", "1.", "1)" at start
      const listMatch = trimmed.match(/^([ক-হa-z0-9ivx]+)[\)\.]\s/);
      if (listMatch) {
         return (
            <div key={i} className="flex gap-2 ml-8 mb-2 items-baseline">
                <span className="font-bold text-slate-700 shrink-0 min-w-[20px]">{listMatch[1]})</span>
                <p className="text-slate-700 text-justify">{trimmed.substring(listMatch[0].length)}</p>
            </div>
         );
      }

      if (!trimmed) return <br key={i}/>;
      
      return <p key={i} className="text-justify leading-relaxed mb-2 text-slate-700">{line}</p>;
    });
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Loading Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center text-white backdrop-blur-sm">
           <Loader2 size={64} className="animate-spin mb-4 text-blue-400" />
           <h3 className="text-2xl font-bold mb-2">পিডিএফ তৈরি হচ্ছে...</h3>
           <p className="text-blue-200 font-mono text-lg">{progress}</p>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <FileText className="text-blue-600" /> গঠনতন্ত্র (দাপ্তরিক)
           </h2>
           <p className="text-xs text-slate-500">অফিসিয়াল ব্যবহারের জন্য সাধারণ ভিউ</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center md:justify-end">
          <button 
            onClick={handleCopyFullText}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
              isCopied ? 'bg-green-600 text-white border-green-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isCopied ? <CheckCircle2 size={16}/> : <Copy size={16}/>} 
            {isCopied ? 'কপি হয়েছে!' : 'সম্পূর্ণ টেক্সট কপি করুন'}
          </button>
          
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-medium"
          >
            {isEditing ? <Save size={16}/> : <Edit3 size={16}/>} {isEditing ? 'সেভ করুন' : 'এডিট করুন'}
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={16} className="animate-spin"/> : <FileStack size={16}/>} পিডিএফ ডাউনলোড
          </button>
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
           {sections.map((section, idx) => (
             <div key={section.id} className="mb-8 border-b pb-8 last:border-0">
                <div className="mb-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">অধ্যায়/সেকশন শিরোনাম</label>
                   <input 
                    value={section.title}
                    onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                    className="w-full p-2 border rounded font-bold"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">বিস্তারিত</label>
                   <textarea 
                    value={section.content}
                    onChange={(e) => handleUpdate(idx, 'content', e.target.value)}
                    className="w-full p-2 border rounded h-96 font-serif text-sm leading-relaxed"
                   />
                </div>
             </div>
           ))}
        </div>
      )}

      {/* VIEW MODE: Standard Pages */}
      {!isEditing && (
        <div className="flex flex-col items-center gap-8 bg-slate-100 p-4 md:p-8 rounded-xl border border-slate-200">
           
           {/* Cover Page */}
           <div id="const-cover" className="constitution-page-section a4-paper relative flex flex-col items-center justify-between text-center bg-white" style={{ minHeight: '297mm', width: '210mm', padding: '20mm', height: 'auto' }}>
                <DocumentHeader logoUrl={logoUrl} />
                <div className="flex-1 flex flex-col justify-center items-center py-10">
                    <div className="mb-4 text-emerald-800 font-serif">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
                    <h1 className="text-5xl font-black text-slate-900 mb-4">গঠনতন্ত্র ও নীতিমালা</h1>
                    <div className="w-32 h-1 bg-slate-800 mb-6"></div>
                    <h2 className="text-3xl font-bold text-slate-700">আপন ফাউন্ডেশন</h2>
                    
                    <div className="mt-12 text-slate-600 font-medium">
                        <p>সংকলন ও সম্পাদনায়:</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">মুহাম্মদ উজ্জল মিয়া</p>
                    </div>
                </div>
                <div className="text-sm font-bold text-slate-900 border-t border-slate-300 pt-4 w-full mt-auto">
                    স্থাপিত: ২০২৫
                </div>
           </div>

           {/* Content Pages */}
           {sections.map((section, idx) => {
             if (section.id === 'cover_page') return null;
             
             return (
               <div key={section.id} className="constitution-page-section a4-paper bg-white text-black relative" style={{ minHeight: '297mm', width: '210mm', padding: '25mm', height: 'auto' }}>
                  {/* Page Header */}
                  <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4 mb-8">
                     <span className="text-xs font-bold text-slate-400 uppercase">আপন ফাউন্ডেশন গঠনতন্ত্র</span>
                     <span className="text-xs font-bold text-slate-400">পরিচ্ছেদ {idx}</span>
                  </div>

                  <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase border-l-4 border-blue-600 pl-4">
                    {section.title}
                  </h2>

                  <div className="text-sm font-serif leading-loose text-slate-800 text-justify">
                     {renderFormattedContent(section.content)}
                  </div>
                  
                  {/* Page Number (Visual only, actual pagination happens via PDF generator) */}
                  <div className="absolute bottom-4 right-8 text-[10px] text-slate-300">
                    Page {idx + 1}
                  </div>
               </div>
             );
           })}
        </div>
      )}

    </div>
  );
};