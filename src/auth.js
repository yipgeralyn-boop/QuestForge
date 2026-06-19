import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
// from supabase.com → your project → Settings → API
const SUPABASE_URL = 'https://REPLACE.supabase.co';
const SUPABASE_ANON_KEY = 'REPLACE_WITH_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}
