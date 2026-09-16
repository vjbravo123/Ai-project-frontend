'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/store/hooks';
import { AuthView } from '@/components/auth/AuthView';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { cn } from '@/lib/utils';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, sidebarOpen } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm p-1.5 flex items-center justify-center animate-pulse">
            <Image
              src="/logo.png"
              alt="JoshAi Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Initializing JoshAi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] text-[#0F172A]">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out',
          sidebarOpen ? 'lg:pl-60' : 'lg:pl-[68px]',
          'pl-0'
        )}
      >
        <TopHeader />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
