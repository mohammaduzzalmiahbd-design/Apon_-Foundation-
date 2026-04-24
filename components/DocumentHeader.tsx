import React, { ReactNode } from 'react';
import { AppSettings } from '../types';

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
      <div className={`relative border-b-4 border-double border-slate-800 ${isCompact ? 'pb-4 mb-4' : 'pb-8 mb-6'}`}>
        
        {/* Flex container */}
        <div className="flex flex-row items-center justify-between gap-6">
          
          {/* Logo Left - Fixed dimensions */}
          <div className={`${isCompact ? 'w-24 h-24' : 'w-32 h-32'} flex-shrink-0 flex items-center justify-center`}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-xs text-slate-400">
                লোগো
              </div>
            )}
          </div>

          {/* Center Text */}
          <div className="flex-1 text-center">
            <p className={`font-bold mb-1 ${isCompact ? 'text-sm' : 'text-xl'}`} style={{ fontFamily: "'Amiri', serif", color: '#d97706' }}>
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            
            <h1 className={`${isCompact ? 'text-3xl' : 'text-4xl'} font-extrabold uppercase tracking-tight leading-tight mb-1 font-serif text-slate-900`}>
              <span className="text-emerald-800">আপন</span> <span className="text-orange-700">ফাউন্ডেশন</span>
            </h1>
            
            <p className={`text-slate-700 font-bold leading-relaxed mb-1 ${isCompact ? 'text-base' : 'text-lg'}`}>
              {settings?.contact?.address || 'বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ'}
            </p>
            
            {/* Contact Info - Stacked Vertical */}
            <div className={`flex flex-col items-center text-slate-600 font-medium ${isCompact ? 'text-xs gap-0' : 'text-sm gap-1'}`}>
              <p>মোবাইল: {settings?.contact?.phone || '০১৬০৮-৪২৭১১৫'}</p>
              <p>ইমেইল: {settings?.contact?.email || 'aponfoundation@gmail.com'}</p>
              {settings?.contact?.whatsapp && <p>হোয়াটসঅ্যাপ: {settings.contact.whatsapp}</p>}
            </div>
            
            <div className={`flex items-center justify-center gap-4 text-slate-600 font-medium ${isCompact ? 'mt-1 text-[10px]' : 'mt-3 text-xs'}`}>
              <span>স্থাপিত: {settings?.organization?.foundingYear || '২০২৫'}</span>
              {(settings?.organization?.registrationNo || '১২৩৪৫') && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                  <span>রেজি: {settings?.organization?.registrationNo || '১২৩৪৫'}</span>
                </>
              )}
            </div>
          </div>

          {/* Right spacer matches Logo Width, or custom Right Element */}
          <div className={`${isCompact ? 'w-24' : 'w-32'} flex-shrink-0 flex justify-end h-full items-start`}>
            {rightElement ? rightElement : null}
          </div>
        </div>
      </div>
    </div>
  );
};