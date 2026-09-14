'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Image as ImageIcon, Newspaper, BrainCircuit, Zap, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const cards = [
    {
      title: 'Conversational Intelligence',
      description: 'Persistent multi-turn chat powered by LangChain and Google Gemini with stateful conversation IDs.',
      href: '/chat',
      icon: Bot,
      color: 'from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
    },
    {
      title: 'Multimodal Vision Studio',
      description: 'Zero-shot image analysis, visual alt-text generation, and complex scene descriptions.',
      href: '/vision',
      icon: ImageIcon,
      color: 'from-indigo-500/20 to-purple-500/20',
      border: 'border-indigo-500/30',
      textColor: 'text-indigo-400',
    },
    {
      title: 'Autonomous Newsletter Agent',
      description: 'End-to-end agentic workflow to research current topics, summarize trends, and generate production newsletters.',
      href: '/news-agent',
      icon: Newspaper,
      color: 'from-fuchsia-500/20 to-pink-500/20',
      border: 'border-fuchsia-500/30',
      textColor: 'text-fuchsia-400',
    },
    {
      title: 'Spaced-Repetition Revision',
      description: 'Spoken and text study logging with SM-2 spaced repetition scheduling, understanding analysis, and due tracking.',
      href: '/revision',
      icon: BrainCircuit,
      color: 'from-emerald-500/20 to-cyan-500/20',
      border: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      badge: 'New Module',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#0c1427] via-[#090d1a] to-[#070a14] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Connected to NestJS + Gemini API</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Autonomous AI & Multi-turn Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            All endpoints from your Hoppscotch collection are pre-wired: 2-step OTP authentication, Gemini chat history, vision inspection, autonomous newsletter pipeline, and spaced-repetition revision study studio.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-6 rounded-2xl border ${card.border} bg-gradient-to-b ${card.color} hover:scale-[1.02] transition-all flex flex-col justify-between group shadow-lg`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${card.textColor}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {card.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white text-base group-hover:text-cyan-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 mt-6 group-hover:translate-x-1 transition-transform">
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}