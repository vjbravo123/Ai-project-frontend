'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { runNewsletterAgent, setAgentGoal, setAgentTopic } from '@/store/features/news-agent-slice';
import { Newspaper, Play, CheckCircle2, CircleDashed, FileText, Code2, Loader2, Sparkles } from 'lucide-react';

export default function NewsAgentPage() {
  const dispatch = useAppDispatch();
  const { goal, topic, currentRun, isLoading, progressStep, error } = useAppSelector((state) => state.newsAgent);

  const [activeTab, setActiveTab] = useState<'markdown' | 'preview'>('preview');

  const handleTriggerAgent = () => {
    dispatch(runNewsletterAgent({ goal, topic }));
  };

  const steps = [
    'Research & Fetch Sources',
    'Summarize Key Insights',
    'Draft Polished Newsletter',
    'Simulated Subscriber Dispatch',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-cyan-400" />
          <span>Autonomous Newsletter Agent</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Executes a four-stage agentic workflow: research articles, summarize, generate styled HTML/Markdown, and dispatch.
        </p>
      </div>

      {/* Control Card */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-[#0c1222] space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => dispatch(setAgentTopic(e.target.value))}
              placeholder="AI agents"
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Goal & Target</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => dispatch(setAgentGoal(e.target.value))}
              placeholder="Create a weekly newsletter on the latest AI agent news and send it to our subscribers."
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          {/* Step Pipeline Visualization */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {steps.map((step, idx) => {
              const isFinished = progressStep > idx;
              const isCurrent = progressStep === idx + 1 && isLoading;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    {isFinished ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
                    ) : (
                      <CircleDashed className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    )}
                    <span className={isFinished ? 'text-slate-200' : isCurrent ? 'text-cyan-400' : 'text-slate-500'}>
                      {step}
                    </span>
                  </div>
                  {idx < steps.length - 1 && <span className="text-slate-700 hidden sm:inline">→</span>}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleTriggerAgent}
            disabled={isLoading}
            className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-cyan-500/25 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Run Pipeline</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
            {error}
          </div>
        )}
      </div>

      {/* Generated Results Preview */}
      {currentRun && (
        <div className="rounded-3xl border border-slate-800 bg-[#0c1222] p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Subject</span>
              <h2 className="text-lg font-bold text-white mt-0.5">{currentRun.subject}</h2>
              {currentRun.articleCount !== undefined && (
                <p className="text-xs text-slate-400">Articles Analyzed: {currentRun.articleCount}</p>
              )}
            </div>

            {/* Switch Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeTab === 'preview' ? 'bg-cyan-500 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>HTML Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeTab === 'markdown' ? 'bg-cyan-500 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Markdown</span>
              </button>
            </div>
          </div>

          {activeTab === 'preview' ? (
            <div
              className="p-6 rounded-2xl bg-white text-slate-900 overflow-x-auto shadow-inner min-h-[300px] prose max-w-none"
              dangerouslySetInnerHTML={{ __html: currentRun.html }}
            />
          ) : (
            <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800 leading-relaxed whitespace-pre-wrap">
              {currentRun.markdown}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}