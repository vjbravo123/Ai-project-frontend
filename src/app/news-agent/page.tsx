'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { runNewsletterAgent, setAgentGoal, setAgentTopic } from '@/store/features/news-agent-slice';
import { FileText, Play, CheckCircle2, CircleDashed, Code2, Loader2, ArrowRight } from 'lucide-react';

export default function NewsAgentPage() {
  const dispatch = useAppDispatch();
  const { goal, topic, currentRun, isLoading, progressStep, error } = useAppSelector((state) => state.newsAgent);

  const [activeTab, setActiveTab] = useState<'markdown' | 'preview'>('preview');

  const handleTriggerAgent = () => {
    dispatch(runNewsletterAgent({ goal, topic }));
  };

  const steps = [
    'Research & Ingestion',
    'Insight Synthesis',
    'Editorial Composition',
    'Subscriber Dispatch',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-[#2563EB] mb-1">
          <FileText className="w-4 h-4" />
          <span>Automated Publishing Workflow</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
          Autonomous Newsletter Agent
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Configurable autonomous agent executing a multi-stage editorial pipeline: topic exploration, document summarization, HTML rendering, and distribution.
        </p>
      </div>

      {/* Control Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Research Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => dispatch(setAgentTopic(e.target.value))}
              placeholder="e.g. Next.js 16 Architecture & Web Standards"
              className="w-full py-2 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Target Audience / Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => dispatch(setAgentGoal(e.target.value))}
              placeholder="e.g. Synthesize a concise technical briefing for engineering leads."
              className="w-full py-2 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
            />
          </div>
        </div>

        {/* Step Pipeline Visualization & Execution */}
        <div className="pt-4 border-t border-[#E2E8F0] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((step, idx) => {
              const isFinished = progressStep > idx;
              const isCurrent = progressStep === idx + 1 && isLoading;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      isFinished
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isCurrent
                        ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                        : 'bg-slate-50 text-[#64748B] border-[#E2E8F0]'
                    }`}
                  >
                    {isFinished ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#2563EB] animate-spin flex-shrink-0" />
                    ) : (
                      <CircleDashed className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                  {idx < steps.length - 1 && <span className="text-slate-300 hidden sm:inline">→</span>}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleTriggerAgent}
            disabled={isLoading}
            className="w-full lg:w-auto px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Execute Pipeline</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}
      </div>

      {/* Generated Results Preview */}
      {currentRun && (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-4 gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB]">
                Dispatch Subject
              </span>
              <h2 className="text-base font-bold text-[#0F172A] mt-0.5">{currentRun.subject}</h2>
              {currentRun.articleCount !== undefined && (
                <p className="text-xs text-[#64748B]">Sources Ingested: {currentRun.articleCount} articles</p>
              )}
            </div>

            {/* Switch Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-[#E2E8F0] text-xs self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all font-medium ${
                  activeTab === 'preview'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>HTML Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all font-medium ${
                  activeTab === 'markdown'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw Markdown</span>
              </button>
            </div>
          </div>

          {activeTab === 'preview' ? (
            <div
              className="p-6 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] overflow-x-auto min-h-[260px] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: currentRun.html }}
            />
          ) : (
            <pre className="p-4 rounded-lg bg-[#F8FAFC] font-mono text-xs text-[#0F172A] overflow-x-auto border border-[#E2E8F0] leading-relaxed whitespace-pre-wrap">
              {currentRun.markdown}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}