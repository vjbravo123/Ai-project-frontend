'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
  setAuthViewMode,
  clearAuthMessages,
} from '@/store/features/auth-slice';
import {
  Lock,
  Mail,
  User,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const AuthView = () => {
  const dispatch = useAppDispatch();
  const {
    authViewMode,
    isLoading,
    error,
    successMessage,
    pendingOtpEmail,
  } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sync pending OTP email if set by registration
  useEffect(() => {
    if (pendingOtpEmail) {
      setEmail(pendingOtpEmail);
    }
  }, [pendingOtpEmail]);

  // Handle resend countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUser({ email, password, name }));
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(verifyOtp({ email, otp: otp.trim() }));
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0 || !email) return;
    dispatch(resendOtp({ email }));
    setResendCooldown(60);
  };

  const fillDemoCredentials = () => {
    setEmail('test@example.com');
    setPassword('password123');
    setName('Test User');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#2563EB] text-white shadow-sm mb-1">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Nexus Enterprise Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Sign in to access your intelligence and research platform
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 sm:p-7 shadow-sm">
          {/* Mode Tabs */}
          {authViewMode !== 'otp' ? (
            <div className="flex bg-slate-100 p-1 rounded-lg border border-[#E2E8F0] mb-6">
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuthMessages());
                  dispatch(setAuthViewMode('login'));
                }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  authViewMode === 'login'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuthMessages());
                  dispatch(setAuthViewMode('register'));
                }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  authViewMode === 'register'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Register
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2 text-[#2563EB] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Two-Factor Email Verification</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuthMessages());
                  dispatch(setAuthViewMode('login'));
                }}
                className="text-xs text-[#64748B] hover:text-[#2563EB] hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {error.toLowerCase().includes('verif') && authViewMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearAuthMessages());
                      dispatch(setAuthViewMode('otp'));
                    }}
                    className="block mt-1 font-semibold text-[#2563EB] underline hover:text-[#1D4ED8]"
                  >
                    Enter 6-digit verification code
                  </button>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Login Form */}
          {authViewMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#0F172A]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 mt-5 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. Register Form */}
          {authViewMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#EFF6FF] border border-blue-100 text-[11px] text-[#1E40AF] leading-relaxed">
                A 6-digit confirmation code will be delivered to your email to verify your identity.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 mt-5 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing registration...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Send Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. Verify OTP Form */}
          {authViewMode === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <p className="text-xs text-[#64748B]">
                  Enter the 6-digit code sent to:
                </p>
                <p className="text-xs font-semibold text-[#0F172A] font-mono">{email}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-base tracking-widest text-center font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#64748B]">Didn't receive code?</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={handleResendOtp}
                  className="flex items-center gap-1.5 text-[#2563EB] hover:text-[#1D4ED8] disabled:text-slate-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 mt-5 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Testing Environment:</span>
            </span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] text-xs font-medium transition-colors"
            >
              <span>Auto-fill Demo</span>
            </button>
          </div>
        </div>

        {/* Security & Architecture Badges */}
        <div className="flex items-center justify-center gap-6 text-center text-xs text-[#64748B]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Session</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
            <span>Strict Verification</span>
          </span>
        </div>
      </div>
    </div>
  );
};
