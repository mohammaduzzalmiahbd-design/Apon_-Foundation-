import React from 'react';
import { AppSettings } from '../types';

interface DocumentFooterProps {
  settings?: AppSettings;
  className?: string;
  isAwarenessPost?: boolean;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({ settings, className = "", isAwarenessPost = false }) => {
  return (
    <div className={`document-footer relative z-10 mt-auto pt-2 pb-1 text-center border-t border-slate-100 ${className}`}>
      <div className="footer-content flex flex-col items-center">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">
          System Generated Form, Apon Foundation Management System
        </p>
      </div>
    </div>
  );
};
