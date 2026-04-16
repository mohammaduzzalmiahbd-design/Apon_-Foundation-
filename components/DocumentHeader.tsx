import React from 'react';

interface Props {
  logoUrl: string | null;
}

export const DocumentHeader: React.FC<Props> = ({ logoUrl }) => {
  return (
    <div className="relative w-full mb-10 z-10">
      {/* Header Content Wrapper */}
      <div className="relative border-b-4 border-double border-slate-800 pb-8 mb-6">
        
        {/* Flex container */}
        <div className="flex flex-row items-center justify-between gap-6">
          
          {/* Logo Left - Fixed dimensions */}
          <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-xs text-slate-400">
                লোগো
              </div>
            )}
          </div>

          {/* Center Text */}
          <div className="flex-1 text-center">
            <p className="text-emerald-700 font-semibold mb-2 text-sm">
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            
            <h1 className="text-4xl font-extrabold uppercase tracking-tight leading-tight mb-2 font-serif text-slate-900">
              <span className="text-emerald-800">আপন</span> <span className="text-orange-700">ফাউন্ডেশন</span>
            </h1>
            
            <p className="text-slate-700 font-bold text-lg leading-relaxed mb-2">
              বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ
            </p>
            
            {/* Contact Info - Stacked Vertical */}
            <div className="flex flex-col items-center gap-1 text-slate-600 text-sm font-medium">
              <p>মোবাইল: ০১৬০৮-৪২৭১১৫</p>
              <p>ইমেইল: aponfoundation@gmail.com</p>
              <p>ওয়েবসাইট: aponfoundation-bd.blogspot.com</p>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-3 text-slate-600 text-xs font-medium">
              <span>স্থাপিত: ০২/০৪/২০২৫ ইং</span>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <span>রেজি: ১২৩৪৫</span>
            </div>
          </div>

          {/* Right spacer matches Logo Width */}
          <div className="w-32 flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
};