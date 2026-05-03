import React from 'react';
import { AppSettings } from '../types';

interface DocumentFooterProps {
  settings?: AppSettings;
  className?: string;
  isAwarenessPost?: boolean;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({ settings, className = "", isAwarenessPost = false }) => {
  return (
    <div className={`document-footer relative z-10 mt-auto pt-4 pb-4 border-t-2 border-[#004d26] text-center ${className}`}>
      <div className="footer-content flex flex-col items-center gap-1">
        {/* Contact info for reference */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 text-[10px] text-slate-700 font-bold uppercase tracking-tight">
          <p>প্রধান কার্যালয়: {settings?.contact?.address || 'বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ'}</p>
          <span className="hidden md:inline text-slate-300">|</span>
          <p>মোবাইল: {settings?.contact?.phone || '০১৬০৮-৪২৭১১৫'}</p>
        </div>

        {/* Universal Footer Requirement 1: Awareness if applicable */}
        {isAwarenessPost && (
          <p className="text-sm font-black text-[#004d26] mt-1 mb-1">
            জনসচেতনায় আপন ফাউন্ডেশন
          </p>
        )}

        {/* Universal Footer Requirement 2: Permanent System Text */}
        <p className="text-[10px] text-slate-500 font-medium mt-1">
          System generated form, Apon Foundation Management System
        </p>

        <p className="text-[8px] text-slate-400 mt-0.5">
          ওয়েবসাইট: aponfoundation-bd.blogspot.com
        </p>
      </div>
    </div>
  );
};
