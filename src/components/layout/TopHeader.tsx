'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkHealth } from '@/store/features/health-slice';
import { toggleSidebar, logout } from '@/store/features/auth-slice';
import { LogOut, User, Activity, Menu } from 'lucide-react';

export const TopHeader = () => {
  const dispatch = useAppDispatch();
  const { status: healthStatus } = useAppSelector((state) => state.health);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkHealth());
    const interval = setInterval(() => dispatch(checkHealth()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0b101c]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Sidebar Toggle Hamburger + Backend Status Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline text-slate-400">Backend API:</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                healthStatus === 'online'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : healthStatus === 'checking'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
              }`}
            />
            <span
              className={
                healthStatus === 'online'
                  ? 'text-emerald-400 font-medium font-mono text-[11px]'
                  : healthStatus === 'checking'
                  ? 'text-amber-400 font-mono text-[11px]'
                  : 'text-rose-400 font-mono text-[11px]'
              }
            >
              {healthStatus.toUpperCase()}
            </span>
          </span>
        </div>
      </div>

      {/* Right: Authenticated User Controls */}
      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-[200px] sm:max-w-[280px]">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="truncate">{user?.email || 'Authenticated User'}</span>
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};