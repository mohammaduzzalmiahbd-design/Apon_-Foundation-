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
    // Determine orientation
    const isLandscape = forcedOrientation ? forcedOrientation === 'landscape' : fileNamePrefix.includes('landscape');

    try {
      // 1. Wait for everything to be ready
      await document.fonts.ready;
      
      // 2. Identify or tag the element for reliable retrieval in clonedDoc
      const captureAttr = 'data-capture-target';
      element.setAttribute(captureAttr, 'true');

      // 3. Naming and Scaling
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${fileNamePrefix}_${dateStr}_${pageSize}`;

      // 4. PRE-CAPTURE RESOLUTION (The Big Fix for OKLCH and Blank Pages)
      // Resolve colors on the element tree before passing to html2canvas
      const canvasHelper = document.createElement('canvas');
      canvasHelper.width = 1;
      canvasHelper.height = 1;
      const ctx = canvasHelper.getContext('2d');

      const resolveColors = (el: HTMLElement) => {
        try {
          const style = window.getComputedStyle(el);
          const colorProps = [
            'color', 'backgroundColor', 'borderColor', 'fill', 'stroke', 
            'outlineColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor'
          ];
          
          colorProps.forEach(prop => {
            const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            const val = style.getPropertyValue(cssProp);
            // If it's a modern color or a variable, resolve it using canvas context
            if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('var(') || val.includes('oklch'))) {
              if (ctx) {
                try {
                  ctx.fillStyle = '#000000'; // Reset
                  ctx.fillStyle = val;
                  const resolved = ctx.fillStyle;
                  if (resolved && !resolved.includes('oklch') && !resolved.includes('oklab')) {
                    el.style.setProperty(cssProp, resolved, 'important');
                  }
                } catch (e) {
                  // Fallback for failed resolution
                  if (cssProp === 'color') el.style.setProperty(cssProp, '#000000', 'important');
                }
              }
            }
          });
          
          if (style.backgroundImage && (style.backgroundImage.includes('oklch') || style.backgroundImage.includes('oklab'))) {
              el.style.setProperty('background-image', 'none', 'important');
          }

          // Safety: Directly clean the style attribute if it contains oklch
          const inlineStyle = el.getAttribute('style');
          if (inlineStyle && (inlineStyle.includes('oklch') || inlineStyle.includes('oklab'))) {
            const cleanedStyle = inlineStyle.replace(/(oklch|oklab)\([^)]+\)/g, '#000000');
            el.setAttribute('style', cleanedStyle);
          }
        } catch (e) { /* ignore */ }
      };

      resolveColors(element);
      element.querySelectorAll('*').forEach(el => resolveColors(el as HTMLElement));

      // 5. Scaling (Target 600 DPI for A4)
      // Screen DPI is ~96, so 600/96 ≈ 6.25. Let's use 6.0 for high resolution.
      let dynamicScale = 6.0;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // If the area is massive (like a large family tree), we might need to throttle to prevent crash
      const rect = element.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area > 5000000) dynamicScale = 3.0; // Moderate for large canvases
      if (isMobile) dynamicScale = Math.min(dynamicScale, 2.0);

      const canvas = await html2canvas(element, {
        scale: dynamicScale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const target = clonedDoc.querySelector(`[${captureAttr}="true"]`) as HTMLElement;
          if (target) {
            clonedDoc.head.querySelectorAll('link[rel="stylesheet"], style, script').forEach(n => n.remove());

            const clonedBody = clonedDoc.body;
            clonedBody.innerHTML = '';
            clonedBody.appendChild(target);
            
            clonedBody.style.cssText = 'background: white !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; width: 100% !important; min-height: 100% !important;';
            target.style.cssText = `
              position: relative !important;
              top: 0 !important;
              left: 0 !important;
              margin: 0 !important;
              visibility: visible !important;
              opacity: 1 !important;
              display: block !important;
              transform: none !important;
              width: ${isLandscape ? '297mm' : '210mm'} !important;
              background: white !important;
            `;
            
            const safeStyle = clonedDoc.createElement('style');
            safeStyle.innerHTML = `
              * { box-sizing: border-box !important; }
              .a4-paper { 
                width: ${isLandscape ? '297mm' : '210mm'} !important; 
                height: ${isLandscape ? '210mm' : '297mm'} !important; 
                background: white !important; 
                display: flex !important; 
                flex-direction: column !important;
                margin: 0 auto !important;
                padding: 5mm !important;
                box-shadow: none !important;
                position: relative !important;
                transform: none !important;
                box-sizing: border-box !important;
              }
              .doc-box { 
                border: 4px double #004d26 !important; 
                height: calc(100% - 1px) !important; 
                background: white !important; 
                padding: 10mm !important; 
                flex: 1 !important; 
                position: relative !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
              }
              .document-header { text-align: center !important; display: flex !important; flex-direction: column !important; items-center !important; width: 100% !important; margin-bottom: 25px !important; }
              .font-amiri { text-align: center !important; width: 100% !important; display: block !important; margin-bottom: 10px !important; }
              .opacity-[0.015], .opacity-[0.02], .opacity-[0.03], .opacity-[0.05] { opacity: 0.02 !important; }
              img { max-width: 100% !important; display: block !important; margin: 0 auto !important; }
              h1 { margin-bottom: 5px !important; width: 100% !important; text-align: center !important; }
              .flex { display: flex !important; }
              .flex-col { flex-direction: column !important; }
              .items-center { align-items: center !important; }
              .justify-center { justify-content: center !important; }
              * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
            `;
            clonedDoc.head.appendChild(safeStyle);
            clonedDoc.querySelectorAll('script, link, noscript').forEach(el => el.remove());
          }
        }
      });

      // Cleanup on original
      element.removeAttribute(captureAttr);

      const mimeType = format === 'JPG' ? 'image/jpeg' : 'image/png';
      
      if (format === 'PDF') {
        const imgData = canvas.toDataURL(mimeType, 0.95);
        const isLandscapeMode = forcedOrientation ? forcedOrientation === 'landscape' : isLandscape;
        const pdfOrientation = isLandscapeMode ? 'l' : 'p';
        
        let pdfFormat: any = 'a4';
        if (pageSize === 'A0') pdfFormat = [1189, 841];
        if (pageSize === 'A1') pdfFormat = [841, 594];
        
        const pdf = new jsPDF(pdfOrientation, 'mm', pdfFormat);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imageFormat = mimeType === 'image/jpeg' ? 'JPEG' : 'PNG';
        pdf.addImage(imgData, imageFormat, 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(`${fileName}.pdf`);
      } else if (format === 'SVG') {
         const imgData = canvas.toDataURL(mimeType, 0.95);
         const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${imgData}" width="100%" height="100%"/></svg>`;
         const blob = new Blob([svg], {type: 'image/svg+xml'});
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `${fileName}.svg`;
         link.click();
         setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('ইমেজ তৈরি করতে সমস্যা হয়েছে। দয়া করে রেজোলিউশন কমিয়ে চেষ্টা করুন।');
            setIsDownloading(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${fileName}.${format.toLowerCase()}`;
          link.href = url;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        }, mimeType, 0.95);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('ডাউনলোড ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন অথবা ব্রাউজার রিফ্রেশ করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
        className="flex items-center gap-2 bg-[#004d26] hover:bg-[#006633] text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
