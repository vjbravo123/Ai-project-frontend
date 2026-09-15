'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkHealth } from '@/store/features/health-slice';
import { setSidebarOpen, logout } from '@/store/features/auth-slice';
import { LogOut, User, PanelLeft } from 'lucide-react';

export const TopHeader = () => {
  const dispatch = useAppDispatch();
  const { status: healthStatus } = useAppSelector((state) => state.health);
  const { isAuthenticated, user, sidebarOpen } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkHealth());
    const interval = setInterval(() => dispatch(checkHealth()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const statusDot =
    healthStatus === 'online'
      ? 'bg-emerald-500'
      : healthStatus === 'checking'
      ? 'bg-amber-400 animate-pulse'
      : 'bg-rose-500';

  const statusLabel =
    healthStatus === 'online'
      ? 'Connected'
      : healthStatus === 'checking'
      ? 'Connecting'
      : 'Offline';

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-5 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile sidebar open button + status */}
      <div className="flex items-center gap-3">
        {/* Mobile-only sidebar open trigger */}
        <button
          onClick={() => dispatch(setSidebarOpen(true))}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
          <span className="font-medium hidden sm:inline">{statusLabel}</span>
        </div>
      </div>

      {/* Right: User */}
      <div className="flex items-center gap-2.5">
        {isAuthenticated && (
          <>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                <User className="w-3 h-3" />
              </div>
              <span className="truncate font-medium max-w-[160px] sm:max-w-[240px]">
                {user?.email || 'Account'}
              </span>
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};