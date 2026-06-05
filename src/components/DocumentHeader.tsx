import React, { ReactNode } from 'react';
import { AppSettings } from '../types';

import { BrandText } from './BrandText';

interface Props {
  logoUrl: string | null;
  settings?: AppSettings;
  rightElement?: ReactNode;
  isCompact?: boolean;
}

export const DocumentHeader: React.FC<Props> = ({ logoUrl, settings, rightElement, isCompact = false }) => {
  return (
    <div className={`document-header relative z-20 w-full text-center ${isCompact ? 'mb-2' : 'mb-6'}`}>
      {/* 1. Bismillah (Always top center) */}
      <p className="font-amiri text-black mb-1 text-center w-full" dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: isCompact ? '14px' : '22px' }}>
        بسم الله الرحمن الرحيم
      </p>

      <div className="flex items-center justify-center gap-6 w-full">
        {/* 2. Logo (To the left of text) */}
        {logoUrl && (
          <div className={`${isCompact ? 'w-16 h-16' : 'w-28 h-28'} flex items-center justify-center shrink-0`}>
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="max-w-full max-h-full object-contain" 
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* 3. Organization Name and Details */}
        <div className="flex flex-col items-center">
           <h1 className={`${isCompact ? 'text-2xl' : 'text-5xl'} font-black mb-2 tracking-tight`}>
              <span className="text-[#004d26]">আপন</span> <span className="text-[#cc0000]">ফাউন্ডেশন</span>
           </h1>
           <div className={`${isCompact ? 'text-[11px]' : 'text-[14px]'} text-black font-bold flex flex-col items-center gap-1`}>
              <p>ঠিকানা: {settings?.contact?.address || 'বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ, বাংলাদেশ'}</p>
              <div className="flex gap-4">
                <p>ইমেইল: {settings?.contact?.email || 'aponfoundation.baligaw@gmail.com'}</p>
                <p>হোয়াটসঅ্যাপ: {settings?.contact?.whatsapp || '+৮৮০১৬০৮-৪২৭১১৫'}</p>
              </div>
              <p className="text-[#004d26] font-bold">স্থাপিত: {settings?.organization?.foundingYear || '২০২৫'}</p>
           </div>
        </div>
      </div>

      {/* 4. Professional Double Line Border (Full Width) */}
      <div className="w-full mt-3 flex flex-col gap-[3px]">
         <div className="w-full h-[3px] bg-[#004d26]"></div>
         <div className="w-full h-[1px] bg-[#004d26]"></div>
      </div>
      
      {rightElement && (
         <div className="absolute top-0 right-0 no-print">
           {rightElement}
         </div>
      )}
    </div>
  );
};