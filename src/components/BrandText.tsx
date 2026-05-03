import React from 'react';

/**
 * BrandText Component
 * Universal rules:
 * - "আপন" or "APON" -> Dark Green (#1B4332)
 * - "ফাউন্ডেশন" or "FOUNDATION" -> Dark Red (#7F1D1D)
 * - "বিসমিল্লাহির রাহমানির রাহিম" -> Dark Green
 * - Arabic Bismillah -> Dark Green
 */
export const BrandText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => {
  if (!text) return null;
  // Regex to match specific brand patterns
  // We use a broad match for Bismillah to cover variations in marks
  const regex = /(আপন|ফাউন্ডেশন|APON|FOUNDATION|বিসমিল্লাহির\s+রাহমানির\s+রাহিম|বিসমিল্লাহির\s+রাহমানির\s+রাহীম|بِسْمِ\s+ٱللَّٰهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ|بِسْمِ\s+اللهِ\s+الرَّحْمٰنِ\s+الرَّحِيمِ|بِسْمِ\s+اللهِ\s+الرَّحْمٰনِ\s+الরَّহীম)/gi;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        
        const upperPart = part.toUpperCase();
        
        // Dark Green Rule: "আপন", "APON", "বিসমিল্লাহির...", or any Arabic Bismillah
        if (
          part === "আপন" || 
          upperPart === "APON" || 
          part.includes("বিসমিল্লাহির") ||
          part.includes("بِسْمِ")
        ) {
          return (
            <span key={i} className="text-[#004d26] font-bold">
              {part}
            </span>
          );
        }
        
        // Dark Red Rule: "ফাউন্ডেশন", "FOUNDATION"
        if (part === "ফাউন্ডেশন" || upperPart === "FOUNDATION") {
          return (
            <span key={i} className="text-[#cc0000] font-bold">
              {part}
            </span>
          );
        }
        
        return part;
      })}
    </span>
  );
};

export const BrandName: React.FC<{ className?: string }> = ({ className }) => (
  <BrandText text="আপন ফাউন্ডেশন" className={className} />
);

export const BrandNameEn: React.FC<{ className?: string }> = ({ className }) => (
  <BrandText text="APON FOUNDATION" className={className} />
);
