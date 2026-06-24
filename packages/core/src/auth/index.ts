import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from '@mario/database';

/** Correos autorizados como admin (variable ADMIN_EMAILS, separada por comas). */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * ¿El correo está autorizado como administrador?
 * Si NO hay allowlist configurada, se permite cualquier usuario autenticado
 * (modo de puesta en marcha). En cuanto se define ADMIN_EMAILS, solo esos
 * correos pueden entrar al panel y escribir. Ver §10.3 del brief.
 */
export function isAllowedAdmin(email: string | null | undefined): boolean {
  const allow = getAdminEmails();
  if (allow.length === 0) return true;
  return !!email && allow.includes(email.toLowerCase());
}

/**
 * Middleware de protección de `/admin`.
 *
 * - Refresca la sesión de Supabase en cada petición a `/admin/*`.
 * - Redirige a `/admin/login` si no hay sesión.
 * - Redirige a `/admin` si ya hay sesión y se visita `/admin/login`.
 * - Si Supabase no está configurado, deja pasar (el admin mostrará un aviso).
 */
export async function protectAdmin(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/admin/login';
  // Solo cuenta como acceso válido un usuario autenticado Y autorizado.
  const allowed = !!user && isAllowedAdmin(user.email);

  if (!allowed && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  if (allowed && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return response;
}
