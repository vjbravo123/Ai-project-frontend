'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, registerUser, setAuthModalOpen, setAuthModalMode, clearAuthError } from '@/store/features/auth-slice';
import { X, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';

export const AuthModal = () => {
  const dispatch = useAppDispatch();
  const { authModalOpen, authModalMode, isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test User');

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authModalMode === 'register') {
      dispatch(registerUser({ email, password, name }));
    } else {
      dispatch(loginUser({ email, password }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#0e1424] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6">
        <button
          onClick={() => {
            dispatch(clearAuthError());
            dispatch(setAuthModalOpen(false));
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-wide">
            {authModalMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'login'
              ? 'Authenticate to unlock Chat, Vision, and Agents'
              : 'Register to start exploring NestJS AI services'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 mt-6 transition-all"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{authModalMode === 'login' ? 'Sign In' : 'Register Now'}</span>
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          {authModalMode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  dispatch(clearAuthError());
                  dispatch(setAuthModalMode('register'));
                }}
                className="text-cyan-400 hover:underline font-medium"
              >
                Register
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={() => {
                  dispatch(clearAuthError());
                  dispatch(setAuthModalMode('login'));
                }}
                className="text-cyan-400 hover:underline font-medium"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};