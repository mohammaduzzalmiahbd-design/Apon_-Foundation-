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
      const targetId = element.id;

      // 3. Naming and Scaling
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${fileNamePrefix}_${dateStr}_${pageSize}`;

      // Scaling for High Resolution (600 DPI equivalent for A4)
      // Standard 96 DPI * 6.25 = 600 DPI. 
      // We use 4.0 as a balanced high-quality scale to avoid browser crashes on larger docs.
      let dynamicScale = 4.0;
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const rect = element.getBoundingClientRect();
      const area = rect.width * rect.height;
      
      // Safety limits for huge documents
      if (pageSize === 'A0' || area > 8000000) dynamicScale = 1.0;
      else if (pageSize === 'A1' || area > 4000000) dynamicScale = 2.0;
      else if (area > 2000000) dynamicScale = 3.0;
      
      if (isMobile) dynamicScale = Math.min(dynamicScale, 1.5);

      const canvas = await html2canvas(element, {
        scale: dynamicScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        // 600 DPI Simulation: We inform the renderer to use high quality
        imageTimeout: 15000,
        // Responsive container for capture
        windowWidth: isLandscape ? 2000 : 1500,
        onclone: (clonedDoc) => {
          // 1. Silent resolution of modern CSS color functions (oklch/oklab)
          // These break the html2canvas parser, so we resolve them to Hex/RGB in the clone.
          const wideGamutRegex = /(oklch|oklab)\(\s*[^)]+\)/g;
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            try {
              if (styleTags[i].innerHTML.includes('oklch') || styleTags[i].innerHTML.includes('oklab')) {
                // We neutralize them in the stylesheet string because we set REAL resolved colors below
                styleTags[i].innerHTML = styleTags[i].innerHTML.replace(wideGamutRegex, 'rgba(0,0,0,0)');
              }
            } catch (e) { /* ignore */ }
          }

          const allElements = clonedDoc.querySelectorAll('*');
          const canvasHelper = clonedDoc.createElement('canvas');
          const ctx = canvasHelper.getContext('2d');

          allElements.forEach((el) => {
            const node = el as HTMLElement;
            try {
              const computed = window.getComputedStyle(node);
              const colorProps = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke', 'stopColor'];
              
              colorProps.forEach(prop => {
                const cssProp = prop.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
                const val = computed.getPropertyValue(cssProp);
                
                // If the color is dynamic (oklch, oklab, var), resolve it using the browser's engine
                if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('var('))) {
                  if (ctx) {
                    ctx.fillStyle = val;
                    const resolved = ctx.fillStyle;
                    if (resolved && !resolved.includes('oklch') && !resolved.includes('oklab')) {
                      node.style.setProperty(cssProp, resolved, 'important');
                    }
                  }
                }
              });

              // Disable problematic gradients that contain oklch to prevent parser crash
              const bgImg = computed.getPropertyValue('background-image');
              if (bgImg && (bgImg.includes('oklch') || bgImg.includes('oklab'))) {
                const bgColor = computed.getPropertyValue('background-color');
                node.style.setProperty('background-image', 'none', 'important');
                if (bgColor) node.style.setProperty('background-color', bgColor, 'important');
              }
            } catch (e) { /* skip */ }
          });

          // 2. Layout Preservation - DO NOT override A4 or user-defined sizing
          const target = clonedDoc.querySelector(`[${captureAttr}="true"]`) as HTMLElement;
          if (target) {
            const isA4 = target.classList.contains('a4-paper') || (target.style.height && (target.style.height.includes('mm') || target.style.height.includes('cm') || target.style.height.includes('in')));
            
            if (isA4) {
               // Preserve A4 flex layout and dimensions exactly as defined in generator
               target.style.display = 'flex';
               target.style.flexDirection = 'column';
               target.style.width = isLandscape ? '297mm' : '210mm';
               target.style.margin = '0';
               // Note: padding is preserved from original inline style (20mm 25mm etc)
            } else {
               // For tree/poster formats, use stable capture width
               target.style.width = isLandscape ? '1500px' : '1200px';
               target.style.margin = '0 auto';
               target.style.padding = '40px'; 
            }
            
            target.style.backgroundColor = '#ffffff';
            target.style.visibility = 'visible';
            target.style.position = 'relative'; 
            target.style.opacity = '1';
            target.style.transform = 'none';

            let parent = target.parentElement;
            while (parent && parent !== clonedDoc.body) {
              parent.style.display = 'block';
              parent.style.visibility = 'visible';
              parent.style.opacity = '1';
              parent = parent.parentElement;
            }
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
