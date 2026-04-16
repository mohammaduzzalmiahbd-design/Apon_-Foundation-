import React, { useState } from 'react';
import { Target, Shield, BookOpen, Crown, FileDown, Loader2, Sparkles, Quote, Award } from 'lucide-react';
import { ConstitutionSection } from '../types';
import { generateLongPDFFromSections } from '../utils/downloadUtils';

interface Props {
  logoUrl: string | null;
  sections: ConstitutionSection[];
}

export const ConstitutionInfographic: React.FC<Props> = ({ logoUrl, sections }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress('শুরু হচ্ছে...');
    
    // Allow UI to update before heavy processing
    setTimeout(async () => {
      await generateLongPDFFromSections(
        'infographic-chunk', 
        'Apon_Foundation_Constitution_Infographic', 
        '#0f172a', // Dark background for PDF
        (curr, total) => {
           setProgress(`পিডিএফ প্রসেসিং: ${curr} / ${total}`);
        }
      );
      
      setIsDownloading(false);
      setProgress('');
    }, 100);
  };

  // Safe renderer that keeps text EXACTLY as is, just adds styling
  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-3" />; // Empty line spacer

    // 1. ধারা (Article) - Highlighting
    if (trimmed.startsWith('ধারা')) {
      return (
        <div key={index} className="mt-4 mb-2 bg-indigo-600 text-white p-3 rounded-lg shadow-md border-l-4 border-yellow-400">
           <h3 className="text-lg font-bold flex items-center gap-2">
             <BookOpen size={20} className="text-yellow-400" />
             {trimmed}
           </h3>
        </div>
      );
    }

    // 2. উপধারা (Sub-Article) - Indented
    if (trimmed.startsWith('উপধারা')) {
      return (
        <div key={index} className="ml-4 md:ml-8 mb-2 bg-slate-700/50 p-2 rounded border-l-2 border-indigo-400">
           <p className="text-slate-200 font-semibold">{trimmed}</p>
        </div>
      );
    }

    // 3. Lists (1., 2., ক., খ.) - Indented List Item
    // Matches: "1.", "১.", "ক)", "ক." etc at start of line
    if (/^([০-৯0-9]+|[ক-হ])[\.|)]/.test(trimmed)) {
       return (
         <div key={index} className="ml-6 md:ml-10 mb-1.5 flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 bg-yellow-500 rounded-full shrink-0"></span>
            <p className="text-slate-300 leading-relaxed text-justify">{trimmed}</p>
         </div>
       );
    }

    // 4. Bullets
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
       return (
         <div key={index} className="ml-8 md:ml-12 mb-1 flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 bg-pink-500 rounded-full shrink-0"></span>
            <p className="text-slate-300 leading-relaxed">{trimmed.substring(1)}</p>
         </div>
       );
    }

    // 5. Special Headings (Mission/Vision)
    if (trimmed.includes('মিশন') || trimmed.includes('ভিশন') || trimmed.includes('MISSION') || trimmed.includes('VISION')) {
        return (
            <h4 key={index} className="mt-6 mb-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 border-b border-slate-700 pb-1">
                {trimmed}
            </h4>
        );
    }

    // 6. Signatures or Names (Usually centered or end of doc)
    if (trimmed.includes('সংকলন') || trimmed.includes('সম্পাদনায়') || trimmed.includes('স্বাক্ষর')) {
        return (
            <p key={index} className="text-center text-indigo-300 font-bold mt-4 italic">{trimmed}</p>
        );
    }

    // 7. Normal Paragraph Text
    return (
      <p key={index} className="text-slate-300 leading-loose mb-2 text-justify">
        {trimmed}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 rounded-xl overflow-hidden shadow-2xl relative">
       
       {/* Background Effects */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-3xl"></div>
       </div>

       {/* Loading Overlay */}
       {isDownloading && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center text-white backdrop-blur-md">
           <Loader2 size={64} className="animate-spin mb-6 text-indigo-400" />
           <h3 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">ইনফোগ্রাফিক তৈরি হচ্ছে...</h3>
           <p className="text-slate-400 font-mono text-lg border border-slate-700 px-4 py-1 rounded-full">{progress}</p>
        </div>
      )}

      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center shadow-lg">
         <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">ইনফোগ্রাফিক ভিউ</h2>
              <p className="text-xs text-indigo-300 font-mono uppercase tracking-widest">ডিজিটাল প্রেজেন্টেশন</p>
            </div>
         </div>
         <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 text-sm md:text-base"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin"/> : <FileDown size={18}/>} 
            <span>ডাউনলোড</span>
          </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 relative z-10">
        
        {/* Title Card */}
        <div className="infographic-chunk text-center py-12 px-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
            
            {logoUrl && (
              <div className="w-24 h-24 mx-auto mb-4 bg-white p-2 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center">
                <img src={logoUrl} className="w-full h-full object-contain" />
              </div>
            )}
            
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
              আপন ফাউন্ডেশন
            </h1>
            <p className="text-lg md:text-xl text-indigo-300 font-bold mb-6">গঠনতন্ত্র ও নীতিমালা</p>
            
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-400 text-xs font-mono tracking-widest">
              <Crown size={12} className="text-yellow-500" />
              স্থাপিত: ২০২৫
              <Crown size={12} className="text-yellow-500" />
            </div>
        </div>

        {/* Dynamic Section Cards */}
        {sections.map((section, idx) => {
          if (section.id === 'cover_page') return null;

          return (
            <div key={section.id} className="infographic-chunk bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                  
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 border-b border-slate-600 flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                       {idx}
                     </div>
                     <h2 className="text-xl md:text-2xl font-bold text-white">
                        {section.title}
                     </h2>
                  </div>

                  {/* Section Content - Rendered Line by Line */}
                  <div className="p-5 md:p-8">
                     {section.content.split('\n').map((line, lineIdx) => renderLine(line, lineIdx))}
                  </div>

                  {/* Footer Dots */}
                  <div className="bg-slate-900/50 p-2 flex justify-center gap-1 opacity-30">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                  </div>
            </div>
          );
        })}

        {/* Footer Card */}
        <div className="infographic-chunk text-center py-8">
            <Quote size={32} className="mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-slate-500 text-xs font-mono">
              এই দলিলটি প্রতিষ্ঠানের অভ্যন্তরীণ শৃঙ্খলার জন্য।
            </p>
            <div className="mt-6 flex justify-center gap-4 text-slate-700">
               <Shield size={20} />
               <Target size={20} />
               <Award size={20} />
            </div>
        </div>

      </div>
    </div>
  );
};