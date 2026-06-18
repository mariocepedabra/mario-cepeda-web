import { createBrowserClient } from '@supabase/ssr';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';
import type { Database } from './types';

/**
 * Cliente Supabase para el navegador (componentes `'use client'`).
 * Se usa sobre todo en el panel admin (login, subidas, mutaciones en vivo).
 *
 * Debe invocarse solo cuando `isSupabaseConfigured` es `true`.
 */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
