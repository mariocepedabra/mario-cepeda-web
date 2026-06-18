/**
 * Lectura centralizada de las variables de entorno de Supabase.
 *
 * `isSupabaseConfigured` permite que toda la capa de datos degrade con
 * elegancia: si no hay credenciales, las webs públicas usan datos de ejemplo
 * (ver `placeholder.ts`) y siguen siendo desplegables.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** `true` solo si hay URL y anon key disponibles. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
