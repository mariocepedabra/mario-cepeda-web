import { type NextRequest } from 'next/server';

import { isSupabaseConfigured } from '@mario/database';
import { createServerSupabase } from '@mario/database/server';

/** Cliente con `rpc` genérico (el tipo Database escrito a mano no define Functions). */
type RpcClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');

function page(title: string, message: string): Response {
  const home = SITE_URL || '/';
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#f5f1e8;color:#1c1a17;font-family:Georgia,'Times New Roman',serif}
    .box{max-width:480px;margin:24px;padding:40px;background:#fffdf8;border:1px solid #e7e0d2;
      border-radius:16px;text-align:center}
    h1{font-size:26px;margin:0 0 12px}
    p{font-size:16px;line-height:1.6;color:#4a463f;margin:0 0 20px}
    a{display:inline-block;background:#1c1a17;color:#fffdf8;text-decoration:none;
      padding:12px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:14px}
  </style></head>
  <body><div class="box"><h1>${title}</h1><p>${message}</p>
  <a href="${home}">Volver al sitio</a></div></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

/** Baja del boletín mediante el token del enlace de los correos. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!isSupabaseConfigured || !token) {
    return page('Enlace no válido', 'No pudimos procesar tu baja. El enlace puede haber caducado.');
  }

  try {
    const supabase = (await createServerSupabase()) as unknown as RpcClient;
    const { data, error } = await supabase.rpc('newsletter_unsubscribe', { p_token: token });
    if (error || data === false) {
      return page(
        'No encontramos tu suscripción',
        'Es posible que ya estés dado de baja. Si el problema persiste, escríbenos.',
      );
    }
  } catch {
    return page('Algo salió mal', 'Inténtalo de nuevo más tarde.');
  }

  return page('Te diste de baja', 'Ya no recibirás más correos del boletín. ¡Gracias por leernos!');
}
