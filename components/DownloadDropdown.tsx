import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Image as ImageIcon, FileImage, ChevronDown, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AppSettings } from '../types';

interface DownloadDropdownProps {
  targetRef: React.RefObject<HTMLElement>;
  fileNamePrefix: string;
  settings: AppSettings;
  logoUrl: string | null;
  forcedOrientation?: 'portrait' | 'landscape';
  pageSize?: 'POSTER' | 'A1' | 'A0';
  memberCount?: number;
  generationCount?: number;
}

export const DownloadDropdown: React.FC<DownloadDropdownProps> = ({ 
  targetRef, 
  fileNamePrefix, 
  settings, 
  logoUrl, 
  forcedOrientation,
  pageSize = 'POSTER',
  memberCount = 0,
  generationCount = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = async (format: 'PDF' | 'JPG' | 'PNG' | 'SVG') => {
    if (!targetRef.current) return;
    setIsOpen(false);
    setIsDownloading(true);
    
    const element = targetRef.current;
    // Determine orientation: prefer forced, fallback to fileName detection
    const isLandscape = forcedOrientation ? forcedOrientation === 'landscape' : fileNamePrefix.includes('landscape');
    const orientation = isLandscape ? 'l' : 'p';

    try {
      // 1. Wait for everything to be ready
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 1500));

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `aponfoundation_export_${dateStr}_${pageSize}_${format}`;

      // Calculate dynamic scale for Ultra-High Resolution (Large Format Printing)
      let dynamicScale = 5.2; // Optimized for crisp Poster prints
      if (pageSize === 'A1') dynamicScale = 4.5; // Massive A1 detail boost
      if (pageSize === 'A0') dynamicScale = 4.0; // Mega-size A0 resolution optimization

      // Density Boost for complex trees
      if (memberCount > 100 || generationCount >= 10) {
        dynamicScale += 1.0;
      }

      // 2. High Stability Capture
      const canvas = await html2canvas(element, {
        scale: dynamicScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Reset internal scaling used for preview so captured image is correctly sized
          const transformElements = clonedDoc.querySelectorAll('[style*="transform"]');
          transformElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style.transform.includes('scale')) {
              htmlEl.style.transform = 'scale(1)';
              htmlEl.style.transformOrigin = 'top center';
            }
          });
        }
      });

      const mimeType = format === 'JPG' ? 'image/jpeg' : 'image/png';
      const imgData = canvas.toDataURL(mimeType, 0.95);

      if (format === 'PDF') {
        const isLandscapeMode = forcedOrientation ? forcedOrientation === 'landscape' : isLandscape;
        const pdfOrientation = isLandscapeMode ? 'l' : 'p';
        
        let pdfFormat: any = [800, 600];
        if (pageSize === 'A0') pdfFormat = [1189, 841]; // jsPDF handles [w, h]
        if (pageSize === 'A1') pdfFormat = [841, 594];
        
        // Ensure orientation matches dimensions
        if (!isLandscapeMode && Array.isArray(pdfFormat)) {
          pdfFormat = [pdfFormat[1], pdfFormat[0]];
        }

        const pdf = new jsPDF(pdfOrientation, 'mm', pdfFormat);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Use PNG for higher reliability in PDFs when capturing from canvas
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');
        pdf.save(`${fileName}.pdf`);
      } else if (format === 'SVG') {
         // Basic SVG wrapper for the canvas image for a "vector-like" container
         const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${imgData}" width="100%" height="100%"/></svg>`;
         const blob = new Blob([svg], {type: 'image/svg+xml'});
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `${fileName}.svg`;
         link.click();
      } else {
        const link = document.createElement('a');
        link.download = `${fileName}.${format.toLowerCase()}`;
        link.href = imgData;
        link.click();
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('ফাইল প্রসেস করতে ব্রাউজারে মেমোরি সমস্যা হচ্ছে। অনুগ্রহ করে ক্রোম ব্রাউজার ব্যবহার করুন অথবা ছোট ছোট অংশে ডাউনলোড করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
        className="flex items-center gap-2 bg-gradient-to-r from-[#143d27] to-[#1a4f33] text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <span className="animate-pulse flex items-center gap-2">
            <Download size={18} className="animate-bounce" /> প্রসেসিং...
          </span>
        ) : (
          <>
            <Download size={18} />
            <span>ডাউনলোড</span>
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
          <div className="p-1.5">
            <button onClick={() => handleDownload('PDF')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors text-left">
              <FileText size={18} className="text-red-500" /> PDF ফরম্যাট
            </button>
            <button onClick={() => handleDownload('JPG')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left">
              <ImageIcon size={18} className="text-blue-500" /> JPG ইমেজ
            </button>
            <button onClick={() => handleDownload('PNG')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-green-600 rounded-lg transition-colors text-left">
              <FileImage size={18} className="text-green-500" /> PNG ইমেজ
            </button>
            <button onClick={() => handleDownload('SVG')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-purple-600 rounded-lg transition-colors text-left">
              <FileImage size={18} className="text-purple-500" /> SVG (Vector)
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-[#143d27] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-[100]">
          <CheckCircle className="text-green-400 shrink-0" size={24} />
          <div>
            <h4 className="font-bold">সফল!</h4>
            <p className="text-sm text-slate-200">বংশ তালিকাটি বড় সাইজের হাই-রেজোলিউশন (Large Format) প্রিন্টিং উপযোগী ফরম্যাটে সংরক্ষিত হয়েছে।</p>
          </div>
        </div>
      )}
    </div>
  );
};
