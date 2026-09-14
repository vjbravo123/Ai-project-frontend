'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { AuthView } from './AuthView';

/**
 * Legacy modal wrapper maintained for backward compatibility.
 * Primary auth gating is handled via AppShell and AuthView.
 */
export const AuthModal = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) return null;
  return null;
};