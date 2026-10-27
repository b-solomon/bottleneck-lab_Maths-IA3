// ============================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Whether Supabase is properly configured.
 * When false, the app runs in demo mode.
 */
export const isSupabaseConfigured: boolean =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key-here';

/**
 * Supabase client — only usable when isSupabaseConfigured is true.
 * Exporting the client even in unconfigured state so imports don't
 * crash, but all auth/DB calls must check isSupabaseConfigured first.
 */
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key'
);

export const isCaptchaConfigured: boolean =
  !!import.meta.env.VITE_TURNSTILE_SITE_KEY &&
  import.meta.env.VITE_TURNSTILE_SITE_KEY !== 'your-turnstile-site-key-here';

export const TURNSTILE_SITE_KEY: string =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string) ?? '';
