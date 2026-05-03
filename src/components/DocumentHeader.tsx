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
    <div className={`document-header relative w-full z-10 ${isCompact ? 'mb-4' : 'mb-10'}`}>
      {/* Header Content Wrapper */}
      <div className={`relative border-b-4 border-double border-[#004d26] pb-6 mb-6 flex flex-col items-center text-center w-full`}>
        
        {/* Logo - Positioned absolutely to not break centering if needed, but usually better centered at top */}
        {logoUrl && (
          <div className={`${isCompact ? 'w-20 h-20 mb-2' : 'w-28 h-28 mb-4'} flex-shrink-0`}>
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="w-full h-full object-contain" 
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* 1. Bismillah (Top) */}
        <p className={`font-bold mb-2 ${isCompact ? 'text-xs' : 'text-2xl'}`} style={{ fontFamily: "'Amiri', serif" }}>
          بسم الله الرحمن الرحيم
        </p>
        
        {/* 2. Brand Name */}
        <h1 className={`${isCompact ? 'text-3xl' : 'text-5xl'} font-black uppercase tracking-tight leading-none mb-3 font-serif`}>
          <BrandText text="আপন ফাউন্ডেশন" />
        </h1>
        
        {/* 3. Address */}
        <p className={`text-slate-800 font-bold leading-relaxed mb-1 ${isCompact ? 'text-[11px]' : 'text-xl'}`}>
          ঠিকানা: {settings?.contact?.address || 'বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ'}
        </p>
        
        {/* 4. Email & WhatsApp */}
        <div className={`flex flex-col items-center text-slate-700 font-bold ${isCompact ? 'text-[10px] gap-0' : 'text-base gap-1'}`}>
          <p>ইমেইল আইডি: {settings?.contact?.email || 'aponfoundation@gmail.com'}</p>
          <p>হোয়াটসঅ্যাপ নাম্বার: {settings?.contact?.whatsapp || settings?.contact?.phone || '০১৬০৮-৪২৭১১৫'}</p>
        </div>
        
        {/* Registration Info (Optional but good to keep) */}
        <div className={`flex items-center justify-center gap-3 text-slate-500 font-semibold ${isCompact ? 'mt-1 text-[8px]' : 'mt-2 text-xs'}`}>
          <span>স্থাপিত: {settings?.organization?.foundingYear || '২০২৫'}</span>
          {(settings?.organization?.registrationNo) && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>রেজি: {settings?.organization?.registrationNo}</span>
            </>
          )}
        </div>

        {/* Right Element (Overlay if needed, like "Voucher" tag) */}
        {rightElement && (
           <div className="absolute top-0 right-0">
             {rightElement}
           </div>
        )}
      </div>
    </div>
  );
};