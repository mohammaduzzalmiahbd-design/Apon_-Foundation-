
/**
 * Compresses and resizes an image (DataURL) to ensure it stays within reasonable size limits.
 * @param dataUrl The source image as a data URL.
 * @param maxWidth The maximum width for the resized image.
 * @param maxHeight The maximum height for the resized image.
 * @param quality The compression quality (0 to 1).
 * @returns A promise that resolves with the compressed data URL.
 */
export const compressImage = (
  dataUrl: string, 
  maxWidth: number = 1200, 
  maxHeight: number = 1200, 
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Get compressed data URL
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = (err) => reject(err);
  });
};

/**
 * Utility to check if a string (especially base64) is over a certain byte size.
 * @param str The string to check.
 * @param maxBytes Maximum bytes allowed.
 */
export const isOverSizeLimit = (str: string, maxBytes: number = 1048576): boolean => {
  const size = new Blob([str]).size;
  return size > maxBytes;
};
