// ============================================================
// AUTHENTICATION HOOK
// Wraps Supabase auth with demo-mode fallback.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { AuthState } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null; needsVerification: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
} {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ isAuthenticated: false, isLoading: false, user: null, error: null });
      return;
    }

    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: session.user.id,
            email: session.user.email ?? '',
            displayName:
              (session.user.user_metadata?.display_name as string) ||
              session.user.email?.split('@')[0] ||
              'User',
            createdAt: session.user.created_at ?? '',
          },
          error: null,
        });
      } else {
        setState({ isAuthenticated: false, isLoading: false, user: null, error: null });
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: session.user.id,
            email: session.user.email ?? '',
            displayName:
              (session.user.user_metadata?.display_name as string) ||
              session.user.email?.split('@')[0] ||
              'User',
            createdAt: session.user.created_at ?? '',
          },
          error: null,
        });
      } else {
        setState({ isAuthenticated: false, isLoading: false, user: null, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication is not configured. Running in demo mode.' };
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setState((s) => ({ ...s, isLoading: false }));
      // Generic error — do not reveal whether email exists
      return { error: 'Incorrect email or password. Please try again.' };
    }

    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: 'Authentication is not configured. Running in demo mode.',
        needsVerification: false,
      };
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    setState((s) => ({ ...s, isLoading: false }));

    if (error) {
      if (error.message.includes('already registered')) {
        return {
          error: 'An account with this email may already exist. Try logging in.',
          needsVerification: false,
        };
      }
      return { error: error.message, needsVerification: false };
    }

    // Supabase returns a session immediately if email confirmation is disabled,
    // or returns a user without a session if confirmation is enabled.
    const needsVerification = !data.session && !!data.user;
    return { error: null, needsVerification };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setState({ isAuthenticated: false, isLoading: false, user: null, error: null });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication is not configured.' };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication is not configured.' };
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  return { ...state, signIn, signUp, signOut, resetPassword, resendVerification };
}
