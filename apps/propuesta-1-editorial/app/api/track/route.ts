import { NextResponse, type NextRequest } from 'next/server';

import { isSupabaseConfigured } from '@mario/database';
import { createServerSupabase } from '@mario/database/server';

/** Cliente con `rpc` genérico (el tipo Database escrito a mano no define Functions). */
type RpcClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

/**
 * Registra una visita (nota/sección) del suscriptor cuyo token está en la
 * cookie `mc_sub` (httpOnly). Usa el RPC `record_subscriber_visit`, que ignora
 * tokens inválidos o suscriptores no activos. Nunca devuelve datos.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return new NextResponse(null, { status: 204 });

  const token = request.cookies.get('mc_sub')?.value;
  if (!token) return new NextResponse(null, { status: 204 });

  let path = '';
  let title = '';
  try {
    const body = await request.json();
    path = typeof body?.path === 'string' ? body.path : '';
    title = typeof body?.title === 'string' ? body.title : '';
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (!path) return new NextResponse(null, { status: 204 });

  try {
    const supabase = (await createServerSupabase()) as unknown as RpcClient;
    await supabase.rpc('record_subscriber_visit', {
      p_token: token,
      p_path: path,
      p_title: title,
    });
  } catch {
    /* best-effort: nunca afecta la navegación del usuario */
  }
  return new NextResponse(null, { status: 204 });
}
