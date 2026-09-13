'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkHealth } from '@/store/features/health-slice';
import { setAuthModalOpen, setAuthModalMode, logout } from '@/store/features/auth-slice';
import { LogIn, LogOut, User, Activity } from 'lucide-react';

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
    <header className="h-16 border-b border-slate-800/80 bg-[#0b101c]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Backend Status Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Backend API:</span>
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
                  ? 'text-emerald-400 font-medium'
                  : healthStatus === 'checking'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }
            >
              {healthStatus.toUpperCase()}
            </span>
          </span>
        </div>
      </div>

      {/* User Controls */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{user?.email || 'Authenticated User'}</span>
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                dispatch(setAuthModalMode('login'));
                dispatch(setAuthModalOpen(true));
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                dispatch(setAuthModalMode('register'));
                dispatch(setAuthModalOpen(true));
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};