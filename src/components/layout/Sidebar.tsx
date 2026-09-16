'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  ScanEye,
  Newspaper,
  GraduationCap,
  ChevronLeft,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, setSidebarOpen } from '@/store/features/auth-slice';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard, color: 'text-indigo-600 bg-indigo-50' },
  { href: '/chat', label: 'Conversations', icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
  { href: '/vision', label: 'Image Analysis', icon: ScanEye, color: 'text-violet-600 bg-violet-50' },
  { href: '/news-agent', label: 'Newsletter', icon: Newspaper, color: 'text-emerald-600 bg-emerald-50' },
  { href: '/revision', label: 'Study Deck', icon: GraduationCap, color: 'text-amber-600 bg-amber-50' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.auth);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => dispatch(setSidebarOpen(false))}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'border-r border-slate-200 bg-white flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40 transition-all duration-200 ease-in-out',
          sidebarOpen
            ? 'w-60 translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-[68px]'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 flex-shrink-0">
            {sidebarOpen ? (
              <>
                <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 p-0.5 shadow-2xs group-hover:border-blue-400 transition-colors">
                    <Image
                      src="/logo.png"
                      alt="JoshAi Logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                  <span className="font-bold text-base text-slate-800 tracking-tight truncate group-hover:text-blue-600 transition-colors">
                    JoshAi
                  </span>
                </Link>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Desktop collapse toggle, next to the brand */}
                  <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="hidden lg:flex w-7 h-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-slate-50 transition-colors"
                    aria-label="Collapse sidebar"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Mobile close */}
                  <button
                    onClick={() => dispatch(setSidebarOpen(false))}
                    className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    aria-label="Close sidebar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              // Collapsed (desktop-only rail): logo itself expands the sidebar
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="w-full flex items-center justify-center"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 p-0.5 shadow-2xs hover:border-blue-400 hover:opacity-90 transition-all">
                  <Image
                    src="/logo.png"
                    alt="JoshAi Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
            {sidebarOpen && (
              <p className="px-2.5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Menu
              </p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      dispatch(setSidebarOpen(false));
                    }
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all group',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : item.color
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {sidebarOpen && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};