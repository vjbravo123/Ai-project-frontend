'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Image, Newspaper, LayoutDashboard, Sparkles, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/chat', label: 'Gemini Chat', icon: Bot },
  { href: '/vision', label: 'Vision Studio', icon: Image },
  { href: '/news-agent', label: 'Newsletter Agent', icon: Newspaper },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-cyan-500/20 bg-[#090d16]/95 backdrop-blur-xl flex flex-col justify-between p-4 fixed top-0 bottom-0 left-0 z-30">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-cyan-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              NEO AI
            </h1>
            <p className="text-[11px] font-mono text-cyan-400/60 uppercase tracking-widest">
              Gemini + LangChain
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-300 border-l-2 border-cyan-400 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                )}
              >
                <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-cyan-400' : 'text-slate-500')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* API Base Indicator */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
        <div className="flex items-center gap-2 text-cyan-400 text-[11px]">
          <Terminal className="w-3.5 h-3.5" />
          <span>v1.0.0 NestJS API</span>
        </div>
        <p className="truncate text-slate-500 text-[10px]">http://localhost:3000/api/v1</p>
      </div>
    </aside>
  );
};