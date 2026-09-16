'use client';

import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Languages,
  RotateCcw,
  Sparkles,
  Eye,
  Globe,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TARGET_LANGUAGES, getLanguageByCode } from '@/lib/languages';

interface DownloadSectionProps {
  pdfUrl: string;
  fileName: string;
  originalText: string;
  translatedText: string;
  sourceLangName: string;
  targetLangName: string;
  targetLang: string;
  onReset: () => void;
  onReconvert?: (newTargetLang: string) => void;
  onChangeLanguageStep?: () => void;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({
  pdfUrl,
  fileName,
  originalText,
  translatedText,
  sourceLangName,
  targetLangName,
  targetLang,
  onReset,
  onReconvert,
  onChangeLanguageStep,
}) => {
  const [activeTab, setActiveTab] = useState<'translated' | 'original' | 'split'>('split');
  const [copied, setCopied] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [selectedNewTarget, setSelectedNewTarget] = useState(targetLang);

  const handleDownload = () => {
    // Trigger festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // optional
    }

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Reset the page after initiating download
    setTimeout(() => {
      onReset();
    }, 800);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Download Header Box */}
      <div className="w-full border border-emerald-300 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-500/10 via-slate-50/90 to-emerald-50/40 dark:from-emerald-950/40 dark:via-slate-900/90 dark:to-slate-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 flex-shrink-0">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Translation Complete!
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> Ready for Download
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Your PDF has been converted into{' '}
                <strong className="text-slate-900 dark:text-white">{targetLangName}</strong>. You can download the file, change target language, or inspect the translated text below.
              </p>
            </div>
          </div>

          {/* Download CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-wrap">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download Converted PDF</span>
            </button>

            <button
              onClick={() => setShowLanguagePicker(!showLanguagePicker)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-sm transition-all"
            >
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>Change Target Language</span>
            </button>

            <button
              onClick={onReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Convert Another File</span>
            </button>
          </div>
        </div>

        {/* Inline Target Language Selector Panel */}
        {showLanguagePicker && (
          <div className="mt-6 pt-6 border-t border-emerald-200/60 dark:border-emerald-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 backdrop-blur-md">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-indigo-500" /> Select New Convert-To Language
              </label>
              <select
                value={selectedNewTarget}
                onChange={(e) => setSelectedNewTarget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TARGET_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-5">
              <button
                type="button"
                onClick={() => {
                  if (onReconvert && selectedNewTarget) {
                    onReconvert(selectedNewTarget);
                  }
                }}
                disabled={selectedNewTarget === targetLang}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-Convert PDF</span>
              </button>

              {onChangeLanguageStep && (
                <button
                  type="button"
                  onClick={onChangeLanguageStep}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Step 2 View
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Text Preview & Viewer Section */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-500" /> Document Content Preview
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compare original extracted text with target translated text
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'split'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setActiveTab('translated')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'translated'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Translated Only
              </button>
              <button
                onClick={() => setActiveTab('original')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'original'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Original Text
              </button>
            </div>

            {/* Copy Translated Text Button */}
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-500" /> Copy Text
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Viewer Windows */}
        {activeTab === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Box */}
            <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Original ({sourceLangName})
                </span>
                <span className="text-[10px] text-slate-400">Extracted PDF Text</span>
              </div>
              <pre className="p-4 text-xs font-sans text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                {originalText || 'No text extracted.'}
              </pre>
            </div>

            {/* Translated Box */}
            <div className="flex flex-col border border-indigo-200 dark:border-indigo-900/60 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/20 overflow-hidden">
              <div className="px-4 py-2.5 bg-indigo-100/60 dark:bg-indigo-900/50 border-b border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-indigo-500" /> Translated ({targetLangName})
                </span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold">
                  Converted Output
                </span>
              </div>
              <pre className="p-4 text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                {translatedText || 'No translated text available.'}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'translated' && (
          <div className="border border-indigo-200 dark:border-indigo-900/60 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/20 overflow-hidden">
            <div className="px-4 py-2.5 bg-indigo-100/60 dark:bg-indigo-900/50 border-b border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-indigo-500" /> Full Translated Text ({targetLangName})
              </span>
            </div>
            <pre className="p-5 text-sm font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
              {translatedText}
            </pre>
          </div>
        )}

        {activeTab === 'original' && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Original Extracted Text ({sourceLangName})
              </span>
            </div>
            <pre className="p-5 text-sm font-sans text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
              {originalText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
