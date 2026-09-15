'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { AuthView } from '@/components/auth/AuthView';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { cn } from '@/lib/utils';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, sidebarOpen } = useAppSelector((state) => state.auth);

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
