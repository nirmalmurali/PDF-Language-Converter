'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES, Language, getLanguageByCode } from '@/lib/languages';
import { ArrowLeftRight, ChevronDown, Search, Globe2, Sparkles, Check } from 'lucide-react';

interface LanguageSelectorProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (langCode: string) => void;
  onTargetChange: (langCode: string) => void;
  onSwap: () => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
  disabled,
}) => {
  const [openSourceDropdown, setOpenSourceDropdown] = useState(false);
  const [openTargetDropdown, setOpenTargetDropdown] = useState(false);
  
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');

  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(event.target as Node)) {
        setOpenSourceDropdown(false);
      }
      if (targetRef.current && !targetRef.current.contains(event.target as Node)) {
        setOpenTargetDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSource = getLanguageByCode(sourceLang);
  const currentTarget = getLanguageByCode(targetLang);

  const filteredSourceLanguages = SOURCE_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredTargetLanguages = TARGET_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(targetSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(targetSearch.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-lg backdrop-blur-xl">
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        {/* Source Language Dropdown */}
        <div className="md:col-span-5 relative" ref={sourceRef}>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-indigo-500" />
            Current Uploaded PDF Content Language
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setOpenSourceDropdown(!openSourceDropdown);
              setOpenTargetDropdown(false);
            }}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border transition-all text-left shadow-sm ${
              openSourceDropdown
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3 truncate">
              <span className="text-xl leading-none">{currentSource.flag}</span>
              <div className="truncate">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {currentSource.name}
                </div>
                <div className="text-xs text-slate-400 truncate">{currentSource.nativeName}</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>

          {/* Source Dropdown Menu */}
          {openSourceDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-2 max-h-80 flex flex-col">
              <div className="relative mb-2 px-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search source language..."
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border-none text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="overflow-y-auto flex-1 space-y-0.5 custom-scrollbar pr-1">
                {filteredSourceLanguages.map((lang) => {
                  const isSelected = lang.code === sourceLang;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onSourceChange(lang.code);
                        setOpenSourceDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                        <span className="text-[10px] text-slate-400">({lang.nativeName})</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex items-center justify-center pt-2 md:pt-6">
          <button
            type="button"
            disabled={disabled || sourceLang === 'auto'}
            onClick={onSwap}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-400 text-indigo-600 dark:text-indigo-400 transition-all duration-200 shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Swap source and target languages"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>

        {/* Target Language Dropdown */}
        <div className="md:col-span-5 relative" ref={targetRef}>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Convert To Which Language
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setOpenTargetDropdown(!openTargetDropdown);
              setOpenSourceDropdown(false);
            }}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border transition-all text-left shadow-sm ${
              openTargetDropdown
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3 truncate">
              <span className="text-xl leading-none">{currentTarget.flag}</span>
              <div className="truncate">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {currentTarget.name}
                </div>
                <div className="text-xs text-slate-400 truncate">{currentTarget.nativeName}</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>

          {/* Target Dropdown Menu */}
          {openTargetDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-2 max-h-80 flex flex-col">
              <div className="relative mb-2 px-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search target language..."
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border-none text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="overflow-y-auto flex-1 space-y-0.5 custom-scrollbar pr-1">
                {filteredTargetLanguages.map((lang) => {
                  const isSelected = lang.code === targetLang;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onTargetChange(lang.code);
                        setOpenTargetDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                        <span className="text-[10px] text-slate-400">({lang.nativeName})</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
