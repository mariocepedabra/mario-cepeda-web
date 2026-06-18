import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';
import type { Database } from './types';

/**
 * Cliente Supabase para el servidor (Server Components, Route Handlers y
 * Server Actions). Lee/escribe la sesión desde las cookies de la petición.
 *
 * En Next.js 15 `cookies()` es asíncrono, por eso esta función es `async`.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Invocado desde un Server Component: ignoramos. El middleware
          // (`@mario/core/auth`) se encarga de refrescar la sesión.
        }
      },
    },
  });
}
