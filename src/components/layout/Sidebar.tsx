'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Image as ImageIcon,
  Newspaper,
  LayoutDashboard,
  Sparkles,
  Terminal,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, setSidebarOpen } from '@/store/features/auth-slice';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/chat', label: 'Gemini Chat', icon: Bot },
  { href: '/vision', label: 'Vision Studio', icon: ImageIcon },
  { href: '/news-agent', label: 'Newsletter Agent', icon: Newspaper },
  { href: '/revision', label: 'Revision Studio', icon: BrainCircuit, badge: 'New' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.auth);

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {sidebarOpen && (
        <div
          onClick={() => dispatch(setSidebarOpen(false))}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Aside container */}
      <aside
        className={cn(
          'border-r border-cyan-500/20 bg-[#090d16]/95 backdrop-blur-xl flex flex-col justify-between p-4 fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out',
          sidebarOpen
            ? 'w-64 translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-20'
        )}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-cyan-500/25">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              {sidebarOpen && (
                <div className="transition-opacity duration-200">
                  <h1 className="font-bold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                    NEO AI
                  </h1>
                  <p className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest truncate">
                    NestJS + Gemini
                  </p>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
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
                  onClick={() => {
                    // Auto-close on mobile upon navigation
                    if (window.innerWidth < 1024) {
                      dispatch(setSidebarOpen(false));
                    }
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-300 border-l-2 border-cyan-400 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-cyan-400' : 'text-slate-500'
                    )}
                  />
                  {sidebarOpen && (
                    <div className="flex items-center justify-between flex-1 truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls: Desktop collapse toggle & API info */}
        <div className="space-y-3">
          {/* Desktop Toggle Button */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:flex items-center justify-center w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 text-xs font-mono transition-colors gap-2"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate">Collapse Sidebar</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* API Info */}
          {sidebarOpen ? (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
              <div className="flex items-center gap-2 text-cyan-400 text-[11px]">
                <Terminal className="w-3.5 h-3.5" />
                <span>v1.0.0 NestJS API</span>
              </div>
              <p className="truncate text-slate-500 text-[10px]">
                http://localhost:3000/api/v1
              </p>
            </div>
          ) : (
            <div className="hidden lg:flex justify-center p-2 text-cyan-400 text-xs">
              <Terminal className="w-4 h-4" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};