'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck, X, Sparkles, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { createSamplePdfFile, createMalayalamSamplePdfFile } from '@/lib/samplePdf';

interface PdfUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
  pageCount?: number;
  isLoading?: boolean;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  selectedFile,
  onFileSelect,
  onFileClear,
  pageCount,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File) => {
    setErrorMessage(null);
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF file (.pdf)');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum limit of 25MB');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleLoadSample = () => {
    const sampleFile = createSamplePdfFile();
    handleFileChange(sampleFile);
  };

  const handleLoadMalayalamSample = () => {
    const sampleFile = createMalayalamSamplePdfFile();
    handleFileChange(sampleFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-xl shadow-indigo-500/10'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-10 h-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cyan-400 animate-ping opacity-75" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Upload your PDF Document
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Drag & drop your PDF file here, or{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-2">
                  browse from system
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
              <span className="px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800">
                Max file size: 25MB
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800">
                Formats: .pdf
              </span>
            </div>

            {/* Instant Demo PDF Buttons */}
            <div className="mt-2 pt-4 border-t border-slate-200/70 dark:border-slate-800/70 w-full flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSample();
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Try English Sample PDF</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadMalayalamSample();
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-300 dark:border-emerald-800 hover:border-emerald-400 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Try Malayalam Sample PDF (മലയാളം)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="relative border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-500/5 via-slate-50/80 to-slate-100/50 dark:from-indigo-950/20 dark:via-slate-900/80 dark:to-slate-900/40 rounded-3xl p-6 sm:p-7 shadow-lg backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <FileText className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatFileSize(selectedFile.size)}
                  </span>
                  <span>•</span>
                  <span>
                    {pageCount ? `${pageCount} ${pageCount === 1 ? 'Page' : 'Pages'} detected` : 'Parsing pages...'}
                  </span>
                  <span>•</span>
                  <span>PDF Document</span>
                </div>
              </div>
            </div>

            <button
              disabled={isLoading}
              onClick={onFileClear}
              className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs font-medium text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
