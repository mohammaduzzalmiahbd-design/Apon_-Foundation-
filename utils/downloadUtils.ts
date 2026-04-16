import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Helper to access libraries from global scope (CDN)
const getHtml2Canvas = () => (window as any).html2canvas as typeof html2canvas;
const getJsPDF = () => (window as any).jspdf.jsPDF;

const canvasConfig = {
  scale: 2, // Balance between quality and file size
  useCORS: true,
  allowTaint: true,
  backgroundColor: '#ffffff',
  logging: false,
};

export const downloadAsImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  const html2canvas = getHtml2Canvas();
  
  if (!element || !html2canvas) {
    alert("উপাদান খুঁজে পাওয়া যায়নি।");
    return;
  }

  try {
    const canvas = await html2canvas(element, { ...canvasConfig, scale: 3 });
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } catch (err) {
    console.error("Image download failed", err);
    alert("ইমেজ ডাউনলোড করতে সমস্যা হয়েছে।");
  }
};

export const downloadAsPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  const html2canvas = getHtml2Canvas();
  const JsPDF = getJsPDF();

  if (!element || !html2canvas || !JsPDF) return;

  try {
    const canvas = await html2canvas(element, canvasConfig);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfWidth = 210; // A4 Width mm
    const pdf = new JsPDF('p', 'mm', 'a4', true);
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfImgHeight, undefined, 'FAST');
    pdf.save(`${fileName}.pdf`);
  } catch (err) {
    console.error("PDF download failed", err);
    alert("পিডিএফ ডাউনলোড সমস্যা হয়েছে।");
  }
};

/**
 * NEW FUNCTION: Stitching Strategy
 * Captures multiple elements individually and stitches them onto a SINGLE custom-height PDF page.
 * This solves the "Blank PDF" issue for long content.
 */
export const generateLongPDFFromSections = async (
  className: string, 
  fileName: string, 
  bgColor: string = '#ffffff',
  onProgress?: (current: number, total: number) => void
) => {
  const html2canvas = getHtml2Canvas();
  const JsPDF = getJsPDF();

  if (!html2canvas || !JsPDF) {
    alert("লাইব্রেরি লোড হয়নি।");
    return;
  }

  // 1. Get all chunks/sections
  const elements = Array.from(document.getElementsByClassName(className)) as HTMLElement[];
  if (elements.length === 0) {
    alert("কোন কন্টেন্ট পাওয়া যায়নি।");
    return;
  }

  try {
    const imgDataList: { data: string, width: number, height: number }[] = [];
    let totalPdfHeight = 0;
    const pdfWidth = 210; // Fixed width (A4 width reference)

    // 2. Capture each section individually
    for (let i = 0; i < elements.length; i++) {
      if (onProgress) onProgress(i + 1, elements.length);
      
      const canvas = await html2canvas(elements[i], {
        scale: 2, // Good quality
        useCORS: true,
        backgroundColor: bgColor,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.90);
      const pxWidth = canvas.width;
      const pxHeight = canvas.height;
      
      // Calculate height in PDF units (maintaining aspect ratio)
      const pdfHeight = (pxHeight * pdfWidth) / pxWidth;
      
      imgDataList.push({ data: imgData, width: pdfWidth, height: pdfHeight });
      totalPdfHeight += pdfHeight;
    }

    // 3. Create a single PDF page with the total height
    // 'p' = portrait, 'mm' = units, Format = [width, totalHeight]
    const pdf = new JsPDF('p', 'mm', [pdfWidth, totalPdfHeight], true);

    // 4. Draw images one after another
    let currentY = 0;
    for (const img of imgDataList) {
      pdf.addImage(img.data, 'JPEG', 0, currentY, img.width, img.height, undefined, 'FAST');
      currentY += img.height;
    }

    pdf.save(`${fileName}.pdf`);

  } catch (err) {
    console.error("Stitched PDF generation failed", err);
    alert("পিডিএফ তৈরিতে সমস্যা হয়েছে। মেমোরি কমাতে পেজ রিফ্রেশ করুন।");
  }
};
