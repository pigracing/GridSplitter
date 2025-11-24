import React from 'react';
import { Download, Check } from 'lucide-react';
import { SlicedImage } from '../types';
import { downloadBlob } from '../utils/imageProcessing';

interface ImageGridProps {
  images: SlicedImage[];
  onDownload: (image: SlicedImage) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onDownload }) => {
  const [downloadedIds, setDownloadedIds] = React.useState<Set<number>>(new Set());

  const handleDownload = (img: SlicedImage) => {
    onDownload(img);
    setDownloadedIds(prev => new Set(prev).add(img.id));
    setTimeout(() => {
        setDownloadedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(img.id);
            return newSet;
        });
    }, 2000);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block"></span>
          切图结果 (24 张)
        </h2>
        <span className="text-sm text-zinc-400">
          6 列 &times; 4 行
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4 select-none">
        {images.map((img) => (
          <div 
            key={img.id}
            className="group relative aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700/50 hover:border-indigo-500/50 transition-all duration-300"
          >
            <img 
              src={img.url} 
              alt={`Slice ${img.id}`} 
              className="w-full h-full object-cover"
            />
            
            {/* Number Overlay */}
            <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
              #{img.id}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={() => handleDownload(img)}
                className={`
                  p-2 rounded-full transform scale-90 group-hover:scale-100 transition-all duration-200
                  ${downloadedIds.has(img.id) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-zinc-900 hover:bg-indigo-500 hover:text-white'
                  }
                `}
                title="下载此图片"
              >
                {downloadedIds.has(img.id) ? <Check size={18} /> : <Download size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;