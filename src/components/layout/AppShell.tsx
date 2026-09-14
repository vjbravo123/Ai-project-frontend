'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { AuthView } from '@/components/auth/AuthView';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { cn } from '@/lib/utils';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, sidebarOpen } = useAppSelector((state) => state.auth);

  // If unauthenticated, show Register/Login/OTP view first
  if (!isAuthenticated) {
    return <AuthView />;
  }

  // Once authenticated, show full application shell with collapsible sidebar & header
  return (
    <div className="flex min-h-screen bg-[#070b14]">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20',
          'pl-0'
        )}
      >
        <TopHeader />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
