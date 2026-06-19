import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
// from supabase.com → your project → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 10;

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
