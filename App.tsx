import React, { useState, useEffect } from 'react';
import { Layers, RotateCcw, Download, Scissors, Archive, Grid3X3, Grid2X2, LayoutGrid } from 'lucide-react';
import Dropzone from './components/Dropzone';
import ImageGrid from './components/ImageGrid';
import { sliceImage, downloadBlob, downloadZip } from './utils/imageProcessing';
import { SlicedImage, AppStatus, GridOption } from './types';

const GRID_OPTIONS: GridOption[] = [
  { cols: 6, rows: 4, label: '6 x 4', description: '24 张 (横向)' },
  { cols: 5, rows: 5, label: '5 x 5', description: '25 张 (方形)' },
  { cols: 4, rows: 6, label: '4 x 6', description: '24 张 (纵向)' },
];

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [slicedImages, setSlicedImages] = useState<SlicedImage[]>([]);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [currentGrid, setCurrentGrid] = useState<GridOption>(GRID_OPTIONS[0]);

  const handleFileSelect = async (file: File) => {
    setOriginalFile(file);
    setStatus(AppStatus.PROCESSING);
    
    // Artificial delay for better UX feel (optional, but smooths transition)
    try {
      const results = await sliceImage(file, currentGrid.cols, currentGrid.rows);
      setSlicedImages(results);
      setStatus(AppStatus.COMPLETE);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    // Revoke old URLs to prevent memory leaks
    slicedImages.forEach(img => URL.revokeObjectURL(img.url));
    setSlicedImages([]);
    setOriginalFile(null);
    setStatus(AppStatus.IDLE);
  };

  const handleDownloadZip = async () => {
    if (!originalFile || isZipping) return;
    
    setIsZipping(true);
    try {
      const baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name;
      await downloadZip(slicedImages, `${baseName}_${currentGrid.label.replace(/\s/g, '')}.zip`);
    } catch (error) {
      console.error("Failed to create zip", error);
    } finally {
      setIsZipping(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      slicedImages.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, [slicedImages]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Layers size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              GridSplitter 切图工具
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-400 border border-zinc-700 font-mono">
              {currentGrid.label}
            </span>
          </div>
          
          <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium text-zinc-400">
             <a href="#" className="hover:text-white transition-colors">使用说明</a>
             <a href="#" className="hover:text-white transition-colors">隐私政策</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 pb-24">
        
        {/* State: IDLE - Upload Area */}
        {status === AppStatus.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            <div className="text-center mb-10 space-y-4 max-w-lg">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                极速切图 <br />
                <span className="text-indigo-500">一键搞定</span>
              </h2>
              <p className="text-lg text-zinc-400">
                选择切图规格，上传图片，即可自动分割并下载高清大图。
              </p>
            </div>

            {/* Grid Selection */}
            <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-lg">
              {GRID_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setCurrentGrid(option)}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                    ${currentGrid.label === option.label 
                      ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 scale-105' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800'
                    }
                  `}
                >
                  <div className="mb-2">
                    {option.cols === 6 && <LayoutGrid size={24} />}
                    {option.cols === 5 && <Grid3X3 size={24} />}
                    {option.cols === 4 && <Grid2X2 size={24} />}
                  </div>
                  <span className="font-bold text-lg leading-none mb-1">{option.label}</span>
                  <span className="text-xs opacity-60">{option.description}</span>
                </button>
              ))}
            </div>

            <Dropzone onFileSelect={handleFileSelect} isProcessing={false} />
          </div>
        )}

        {/* State: PROCESSING */}
        {status === AppStatus.PROCESSING && (
           <div className="flex flex-col items-center justify-center min-h-[50vh]">
             <div className="relative">
               <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <Scissors size={20} className="text-indigo-400" />
               </div>
             </div>
             <p className="mt-6 text-lg font-medium text-zinc-300 animate-pulse">
               正在进行 {currentGrid.label} 切图...
             </p>
           </div>
        )}

        {/* State: COMPLETE - Results */}
        {status === AppStatus.COMPLETE && (
          <div className="animate-fade-in">
            {/* Action Bar */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-4">
                 <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0">
                    {originalFile && (
                        <img 
                          src={URL.createObjectURL(originalFile)} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover opacity-60"
                        />
                    )}
                 </div>
                 <div>
                    <p className="text-sm font-medium text-white">原始图片</p>
                    <p className="text-xs text-zinc-500">{originalFile?.name}</p>
                    <p className="text-xs text-indigo-400 mt-1">{currentGrid.label} 切割模式</p>
                 </div>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button 
                  onClick={handleReset}
                  className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all font-medium text-sm group"
                >
                  <RotateCcw size={16} className="mr-2 group-hover:-rotate-180 transition-transform duration-500" />
                  重新开始
                </button>
                <button 
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 rounded-xl text-white shadow-lg shadow-indigo-900/20 transition-all font-medium text-sm
                    ${isZipping 
                      ? 'bg-indigo-700 cursor-not-allowed opacity-80' 
                      : 'bg-indigo-600 hover:bg-indigo-500'
                    }
                  `}
                >
                  {isZipping ? (
                    <span className="flex items-center">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                       打包中...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Archive size={16} className="mr-2" />
                      下载 ZIP 压缩包
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Grid */}
            <ImageGrid 
              images={slicedImages} 
              onDownload={(img) => downloadBlob(img.blob, img.fileName)}
              cols={currentGrid.cols}
              rows={currentGrid.rows}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
