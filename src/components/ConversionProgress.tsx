'use client';

import React from 'react';
import { Loader2, FileSearch, Languages, FileCheck2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ConversionProgressProps {
  progress: number;
  stage: string;
  currentSnippet?: string;
  targetLangName: string;
}

export const ConversionProgress: React.FC<ConversionProgressProps> = ({
  progress,
  stage,
  currentSnippet,
  targetLangName,
}) => {
  const steps = [
    { title: 'Parsing & Extraction', icon: FileSearch, minProgress: 0, maxProgress: 25 },
    { title: `Translating to ${targetLangName}`, icon: Languages, minProgress: 25, maxProgress: 85 },
    { title: 'Generating Translated PDF', icon: FileCheck2, minProgress: 85, maxProgress: 98 },
    { title: 'Ready to Download', icon: Sparkles, minProgress: 98, maxProgress: 100 },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-indigo-500/10 via-slate-50/90 to-slate-100/60 dark:from-indigo-950/40 dark:via-slate-900/90 dark:to-slate-900/60 border border-indigo-200/80 dark:border-indigo-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Animated Central Loader Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <Loader2 className="w-10 h-10 animate-spin stroke-[2.5]" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-indigo-400/40 dark:border-indigo-500/30 animate-pulse" />
        </div>

        {/* Progress Percentage */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {Math.min(100, Math.max(0, progress))}
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">%</span>
        </div>

        {/* Current Stage Message */}
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
          {stage || 'Converting PDF Document...'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md font-medium mb-6">
          Please wait while our engine processes text blocks, applies neural translations, and builds your formatted PDF file.
        </p>

        {/* Live Snippet Box */}
        {currentSnippet && (
          <div className="w-full mb-6 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-left text-xs font-mono text-slate-600 dark:text-slate-300 truncate shadow-inner">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-2">Live:</span>
            {currentSnippet}
          </div>
        )}

        {/* Custom Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 mb-8 shadow-inner">
          <div
            className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-400 h-full rounded-full transition-all duration-300 ease-out shadow-lg"
            style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
          />
        </div>

        {/* Stage Timeline */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = progress >= step.maxProgress;
            const isActive = progress >= step.minProgress && progress < step.maxProgress;

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : isActive
                    ? 'bg-white dark:bg-slate-800 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin flex-shrink-0" />
                  ) : (
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Step {idx + 1}
                  </span>
                </div>
                <div className="text-xs font-bold truncate">{step.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
