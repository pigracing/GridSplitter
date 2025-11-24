import React, { useCallback, useState } from 'react';
import { Upload, FileImage, AlertCircle } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请上传有效的图片文件 (JPG, PNG, WebP)。');
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndProcess(file);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcess(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'opacity-100'}
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500/20' : 'bg-zinc-800'}`}>
            <Upload className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-zinc-400'}`} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-zinc-100">
              {isDragging ? '释放图片' : '上传拼图文件'}
            </h3>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              将 6x4 拼图拖拽到此处，或点击浏览文件。
              我们将为您自动切割成 24 张图片。
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-zinc-500 mt-4 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/50">
             <FileImage size={14} />
             <span>支持 JPG, PNG, WebP 格式</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3 text-red-400">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Dropzone;