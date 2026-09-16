'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PdfUploader } from '@/components/PdfUploader';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ConversionProgress } from '@/components/ConversionProgress';
import { DownloadSection } from '@/components/DownloadSection';
import { parsePdfFile } from '@/lib/pdfParser';
import { translatePdfContent } from '@/lib/translator';
import { generateTranslatedPdf } from '@/lib/pdfGenerator';
import { getLanguageByCode } from '@/lib/languages';
import { ArrowRight, Sparkles, FileText, Globe, Layers, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // File state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState('');
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [textReviewed, setTextReviewed] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [originalText, setOriginalText] = useState<string>('');
  const [pagesText, setPagesText] = useState<string[]>([]);

  // Language state
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('es'); // Default Spanish

  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [currentSnippet, setCurrentSnippet] = useState('');

  // Result state
  const [isCompleted, setIsCompleted] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [translatedPdfUrl, setTranslatedPdfUrl] = useState<string | null>(null);
  const [translatedFileName, setTranslatedFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (translatedPdfUrl) URL.revokeObjectURL(translatedPdfUrl); };
  }, [translatedPdfUrl]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle PDF file selection
  const handleFileSelect = async (file: File, forceMalayalamOcr = false) => {
    setUploadedFile(file);
    setIsParsing(true);
    setPagesText([]);
    setOriginalText('');
    setPageCount(0);
    setParseWarnings([]);
    setTextReviewed(false);
    setErrorMessage(null);
    setIsCompleted(false);
    setTranslatedPdfUrl(null);

    try {
      const parsed = await parsePdfFile(file, { forceMalayalamOcr, onProgress: setParseStatus });
      setOriginalText(parsed.text);
      setParseWarnings(parsed.warnings);
      setPagesText(parsed.pagesText);
      setPageCount(parsed.pageCount);
    } catch (err: unknown) {
      console.error('Error parsing PDF:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to read PDF. Please retry.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileClear = () => {
    setUploadedFile(null);
    setOriginalText('');
    setPagesText([]);
    setPageCount(0);
    setIsCompleted(false);
    setTranslatedText('');
    setTranslatedPdfUrl(null);
    setTranslatedFileName('');
    setProgress(0);
    setProgressStage('');
    setCurrentSnippet('');
    setTextReviewed(false);
    setParseWarnings([]);
    setErrorMessage(null);
  };

  const handleSwapLanguages = () => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }
  };

  // Convert PDF Trigger
  const handleConvertPdf = async (overrideTargetLang?: string) => {
    const activeTarget = overrideTargetLang || targetLang;
    if (!uploadedFile || !textReviewed || !pagesText.some(text => text.trim())) return;

    if (overrideTargetLang) {
      setTargetLang(overrideTargetLang);
    }

    setIsConverting(true);
    setProgress(5);
    setProgressStage('Initializing PDF parsing...');
    setErrorMessage(null);
    setIsCompleted(false);

    try {
      // Step 1: Translate content with live progress callback
      const { fullText, translatedPages: translatedPagesResult } = await translatePdfContent(
        pagesText,
        sourceLang,
        activeTarget,
        (percent, stage, snippet) => {
          setProgress(percent);
          setProgressStage(stage);
          if (snippet) setCurrentSnippet(snippet);
        }
      );

      setTranslatedText(fullText);

      // Step 2: Generate translated PDF document
      setProgress(92);
      setProgressStage('Compiling translated PDF document...');

      const { url, fileName } = await generateTranslatedPdf({
        translatedPages: translatedPagesResult,
        sourceLang,
        targetLang: activeTarget,
        originalFileName: uploadedFile.name,
      });

      setTranslatedPdfUrl(url);
      setTranslatedFileName(fileName);

      setProgress(100);
      setProgressStage('Conversion Complete!');
      await new Promise((r) => setTimeout(r, 400));
      setIsCompleted(true);
    } catch (err: unknown) {
      console.error('Conversion failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during PDF conversion.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Navbar Header */}
      <Header isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      {/* Main Hero Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Intro Title & Badges */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-pink-500/10 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Fast, Secure & Smart PDF Translation</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Convert Any PDF Document Into{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              25+ Languages
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Upload your PDF, select the source and target languages, click convert, and download your translated PDF document instantly.
          </p>
        </div>

        {/* Workflow Card Container */}
        <div className="space-y-6">
          {/* Step 1: Upload PDF */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" /> Step 1: Select PDF File
              </span>
            </div>

            <PdfUploader
              selectedFile={uploadedFile}
              onFileSelect={(file) => handleFileSelect(file)}
              onFileClear={handleFileClear}
              pageCount={pageCount}
              isLoading={isParsing || isConverting}
            />
          </section>

          {isParsing && <p role="status" className="text-sm">{parseStatus}</p>}
          {uploadedFile && !isParsing && !isConverting && !isCompleted && (
            <section className="space-y-4 rounded-2xl border border-slate-300 dark:border-slate-700 p-5">
              <h3 className="font-bold">Review extracted text</h3>
              <p className="text-sm">Malayalam pages use Malayalam + English OCR. Check the words before translating; you can correct each page below. OCR downloads language models on first use and runs in your browser.</p>
              <button type="button" className="rounded-lg border px-4 py-2" onClick={() => handleFileSelect(uploadedFile, true)}>
                Read again with Malayalam OCR
              </button>
              <p className="text-sm">Use this if a Malayalam PDF displays scrambled text or Latin letters.</p>
              {parseWarnings.map((warning, i) => <p key={i} role="status" className="text-amber-700 dark:text-amber-300">{warning}</p>)}
              {pagesText.map((text, i) => (
                <label key={i} className="block space-y-2">
                  <span>Page {i + 1}</span>
                  <textarea value={text} rows={8} className="w-full rounded-lg border p-3 bg-white dark:bg-slate-900 leading-loose"
                    onChange={(event) => {
                      const updated = pagesText.map((page, index) => index === i ? event.target.value : page);
                      setPagesText(updated);
                      setOriginalText(updated.map((page, index) => `[Page ${index + 1}]\n${page}`).join('\n\n'));
                      setTextReviewed(false);
                    }} />
                </label>
              ))}
              {pagesText.length > 0 && <label className="flex items-center gap-2">
                <input type="checkbox" checked={textReviewed} onChange={event => setTextReviewed(event.target.checked)} />
                I have checked the extracted text and it is ready to translate.
              </label>}
            </section>
          )}

          {/* Step 2: Language Selection Dropdowns & Convert Button */}
          {uploadedFile && !isConverting && !isCompleted && (
            <section className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-3">
                  <Globe className="w-4 h-4 text-indigo-500" /> Step 2: Choose Languages
                </span>

                <LanguageSelector
                  sourceLang={sourceLang}
                  targetLang={targetLang}
                  onSourceChange={setSourceLang}
                  onTargetChange={setTargetLang}
                  onSwap={handleSwapLanguages}
                  disabled={isConverting || isParsing}
                />
              </div>

              {/* Big Convert Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled={isParsing || isConverting || !uploadedFile || !textReviewed || !pagesText.some(text => text.trim())}
                  onClick={() => handleConvertPdf()}
                  className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-black text-base shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Convert PDF Document</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </section>
          )}

          {/* Step 3: Progress & Loader */}
          {isConverting && (
            <section className="animate-fadeIn">
              <ConversionProgress
                progress={progress}
                stage={progressStage}
                currentSnippet={currentSnippet}
                targetLangName={getLanguageByCode(targetLang).name}
              />
            </section>
          )}

          {/* Step 4: Download Section */}
          {isCompleted && translatedPdfUrl && (
            <section className="animate-fadeIn">
              <DownloadSection
                pdfUrl={translatedPdfUrl}
                fileName={translatedFileName}
                originalText={originalText}
                translatedText={translatedText}
                sourceLangName={getLanguageByCode(sourceLang).name}
                targetLangName={getLanguageByCode(targetLang).name}
                targetLang={targetLang}
                onReset={handleFileClear}
                onReconvert={(newTargetLang) => handleConvertPdf(newTargetLang)}
                onChangeLanguageStep={() => setIsCompleted(false)}
              />
            </section>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        {!uploadedFile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8">
            <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                25+ Global Languages
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Seamlessly translate documents between English, Spanish, French, German, Hindi, Chinese, Japanese, Arabic, and more.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Preserved PDF Layout
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Maintains document structure, headers, multi-page formatting, and page counts in your converted downloadable PDF.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Instant System Download
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Download the freshly generated translated PDF file directly to your device with 1-click native system export.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>Built with Next.js, TypeScript & Tailwind CSS • PDF Language Converter</p>
      </footer>
    </div>
  );
}
