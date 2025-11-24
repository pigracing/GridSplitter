import { SlicedImage } from '../types';
import JSZip from 'jszip';

export const sliceImage = (
  file: File,
  cols: number,
  rows: number
): Promise<SlicedImage[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // Clean up memory
      URL.revokeObjectURL(objectUrl);

      const pieceWidth = img.width / cols;
      const pieceHeight = img.height / rows;
      const images: SlicedImage[] = [];
      let processedCount = 0;
      const totalPieces = cols * rows;

      // Iterate through grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = pieceWidth;
          canvas.height = pieceHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('无法获取 Canvas 上下文'));
            return;
          }

          // Draw the specific section
          ctx.drawImage(
            img,
            c * pieceWidth, // source x
            r * pieceHeight, // source y
            pieceWidth, // source width
            pieceHeight, // source height
            0, // dest x
            0, // dest y
            pieceWidth, // dest width
            pieceHeight // dest height
          );

          // Convert to Blob
          canvas.toBlob((blob) => {
            if (blob) {
              const id = r * cols + c + 1;
              images.push({
                id,
                url: URL.createObjectURL(blob),
                blob,
                row: r,
                col: c,
                fileName: `split_${id}_${file.name}`
              });
            }

            processedCount++;
            if (processedCount === totalPieces) {
              // Sort by ID to ensure correct order
              images.sort((a, b) => a.id - b.id);
              resolve(images);
            }
          }, file.type);
        }
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('图片加载失败，请尝试上传有效的图片文件。'));
    };

    img.src = objectUrl;
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadZip = async (images: SlicedImage[], zipFilename: string) => {
  const zip = new JSZip();
  
  images.forEach((img) => {
    zip.file(img.fileName, img.blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, zipFilename);
};