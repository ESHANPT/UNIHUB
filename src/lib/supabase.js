import { createClient } from '@supabase/supabase-js';

function normalizeUrl(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/, '');
}

const supabaseUrl = normalizeUrl(import.meta.env.VITE_SUPABASE_URL);
const publishableKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

/** True when both public environment variables are present. */
export const isSupabaseConfigured = Boolean(supabaseUrl && publishableKey);

/**
 * Browser client using the publishable key only. Every request is subject to
 * Row Level Security; no secret or service-role key may ever be added here.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
