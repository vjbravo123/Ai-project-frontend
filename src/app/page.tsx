'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  ScanEye,
  Newspaper,
  GraduationCap,
  ArrowRight,
  Activity,
  Shield,
  Database,
  Cpu,
} from 'lucide-react';

export default function HomePage() {
  const cards = [
    {
      title: 'Conversations',
      description: 'Multi-turn dialogue sessions with persistent thread history and context tracking.',
      href: '/chat',
      icon: MessageSquare,
      accent: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500',
      tag: 'Dialogue',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Image Analysis',
      description: 'Visual inspection, scene parsing, alt-text generation, and structural metadata extraction.',
      href: '/vision',
      icon: ScanEye,
      accent: 'from-violet-500 to-violet-600',
      iconBg: 'bg-violet-500',
      tag: 'Perception',
      tagColor: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      title: 'Newsletter Agent',
      description: 'Automated editorial pipeline: topic research, summarization, HTML rendering, and dispatch.',
      href: '/news-agent',
      icon: Newspaper,
      accent: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-500',
      tag: 'Automation',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Study Deck',
      description: 'Knowledge logging with audio dictation and SM-2 spaced-repetition interval scheduling.',
      href: '/revision',
      icon: GraduationCap,
      accent: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500',
      tag: 'Retention',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  const stats = [
    { label: 'Active Modules', value: '4', icon: Cpu, color: 'text-blue-600 bg-blue-50' },
    { label: 'Backend', value: 'NestJS API', icon: Database, color: 'text-violet-600 bg-violet-50' },
    { label: 'Security', value: '2FA + JWT', icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Status', value: 'Online', icon: Activity, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 sm:p-6 text-white">
        <p className="text-blue-200 text-xs font-medium mb-1">Intelligence Platform</p>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">
          Welcome to your Workspace
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
          Centralized tools for conversational AI, visual perception, content automation, and knowledge retention.
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] text-blue-200 font-medium">{stat.label}</p>
                  <p className="text-xs font-bold text-white truncate">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-xl p-4 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${card.tagColor}`}>
                    {card.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-4 pt-3 border-t border-slate-100">
                <span>Open</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}