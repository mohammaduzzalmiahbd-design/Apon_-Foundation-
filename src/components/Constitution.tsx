import React, { useState, useRef } from 'react';
import { FileText, Edit3, Save, Copy, CheckCircle2 } from 'lucide-react';
import { ConstitutionSection, AppSettings } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { DownloadDropdown } from './DownloadDropdown';
import { ReadingModeWrapper } from './ReadingModeWrapper';

import { BrandText } from './BrandText';

interface Props {
  logoUrl: string | null;
  sections: ConstitutionSection[];
  onUpdateSections: (sections: ConstitutionSection[]) => void;
  settings: AppSettings;
}

export const Constitution: React.FC<Props> = ({ logoUrl, sections, onUpdateSections, settings }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update existing content function
  const handleUpdate = (idx: number, key: keyof ConstitutionSection, value: string) => {
    const newSections = [...sections];
    newSections[idx] = { ...newSections[idx], [key]: value };
    onUpdateSections(newSections);
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
        return <p key={i} className="font-bold text-slate-900 mt-4 mb-2 text-lg border-b border-slate-200 pb-1 inline-block"><BrandText text={line} /></p>;
      }
      if (trimmed.startsWith('উপধারা')) {
        return <p key={i} className="font-semibold text-slate-800 ml-4 mt-2 mb-1"><BrandText text={line} /></p>;
      }
      
      // Bullets
      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
         return <div key={i} className="flex gap-2 ml-6 mb-1"><span className="mt-2 w-1.5 h-1.5 bg-slate-800 rounded-full shrink-0"></span><p><BrandText text={trimmed.replace(/^[\•\*\-]\s*/, '')} /></p></div>;
      }

      // Bengali List items (ক), খ), etc) OR Roman Numerals (i), ii))
      // Matches "ক)", "ক.", "i)", "i.", "1.", "1)" at start
      const listMatch = trimmed.match(/^([ক-হa-z0-9ivx]+)[\)\.]\s/);
      if (listMatch) {
         return (
            <div key={i} className="flex gap-2 ml-8 mb-2 items-baseline">
                <span className="font-bold text-slate-700 shrink-0 min-w-[20px]">{listMatch[1]})</span>
                <p className="text-slate-700 text-justify"><BrandText text={trimmed.substring(listMatch[0].length)} /></p>
            </div>
         );
      }

      if (!trimmed) return <br key={i}/>;
      
      return <p key={i} className="text-justify leading-relaxed mb-2 text-slate-700"><BrandText text={line} /></p>;
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* ... Control Bar code ... */}
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
              isCopied ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
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
          
          <DownloadDropdown 
            targetRef={contentRef} 
            fileNamePrefix="Constitution" 
            settings={settings} 
            logoUrl={logoUrl} 
          />
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

      {/* VIEW MODE: Reading Mode */}
      {!isEditing && (
        <ReadingModeWrapper title="গঠনতন্ত্র ও নীতিমালা">
          <div ref={contentRef} className="flex flex-col gap-0 bg-white">
             {/* Official Header for Export */}
             <div className="mb-10">
                <DocumentHeader logoUrl={logoUrl} settings={settings} />
             </div>

             {/* Cover Page */}
             <div className="flex flex-col items-center justify-center text-center py-16 border-b-2 border-slate-100 mb-10 bg-slate-50/50 rounded-3xl min-h-[150mm]">
                  <div className="mb-6 font-serif text-2xl"><BrandText text="بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" /></div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">গঠনতন্ত্র ও নীতিমালা</h1>
                  <div className="w-40 h-1.5 bg-slate-800 mb-8 rounded-full"></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-700">
                    <BrandText text="আপন ফাউন্ডেশন" />
                  </h2>
                  
                  <div className="mt-16 text-slate-600 font-medium">
                      <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">সংকলন ও সম্পাদনায়:</p>
                      <p className="text-2xl font-bold text-slate-900">মুহাম্মদ উজ্জল মিয়া</p>
                  </div>
                  <div className="text-sm font-bold text-slate-500 mt-16 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm">
                      স্থাপিত: {settings.organization.foundingYear}
                  </div>
             </div>

             {/* Content Pages */}
             {sections.map((section, idx) => {
               if (section.id === 'cover_page') return null;
               
               return (
                 <div key={section.id} className="mb-12 break-inside-avoid px-[10mm]">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase border-l-4 border-[#1B4332] pl-4">
                      {section.title}
                    </h2>
                    <div className="text-base font-serif leading-loose text-slate-800 text-justify">
                       {renderFormattedContent(section.content)}
                    </div>
                 </div>
               );
             })}

             {/* Official Footer for Export */}
             <DocumentFooter settings={settings} />
          </div>
        </ReadingModeWrapper>
      )}

    </div>
  );
};