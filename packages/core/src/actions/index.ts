'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

import { isSupabaseConfigured } from '@mario/database';
import { createServerSupabase } from '@mario/database/server';

import { isAllowedAdmin } from '../auth';
import { CONTENT_KEYS } from '../lib';
import {
  contactSchema,
  listSchemas,
  profileSchema,
  seoSettingsSchema,
  siteContentSchema,
  type ListTable,
} from '../schemas';

export type ActionResult = { ok: true; demo?: boolean } | { ok: false; error: string };

const NOT_CONFIGURED = 'Supabase no está configurado. Configura las variables de entorno.';

/** Revalida todas las rutas públicas tras una mutación del contenido. */
function revalidateAll() {
  revalidatePath('/', 'layout');
}

/** Cliente de servidor sin tipado de esquema, para operaciones genéricas. */
async function untypedServer(): Promise<SupabaseClient> {
  return (await createServerSupabase()) as unknown as SupabaseClient;
}

/** Verifica que haya un usuario autenticado Y autorizado (el admin de la allowlist). */
async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sesión no válida. Inicia sesión de nuevo.' };
  if (!isAllowedAdmin(user.email)) {
    return { ok: false, error: 'Tu cuenta no está autorizada para administrar el sitio.' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
//  Público: formulario de contacto
// ---------------------------------------------------------------------------

export async function submitContactMessage(raw: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos.' };
  }

  // En modo demo (sin Supabase) confirmamos sin persistir.
  if (!isSupabaseConfigured) {
    return { ok: true, demo: true };
  }

  const supabase = await untypedServer();
  const { error } = await supabase.from('contact_messages').insert({
    nombre: parsed.data.nombre,
    email: parsed.data.email,
    mensaje: parsed.data.mensaje,
  });
  if (error) return { ok: false, error: 'No se pudo enviar el mensaje. Inténtalo más tarde.' };
  return { ok: true };
}

// ---------------------------------------------------------------------------
//  Admin: CRUD genérico para entidades de lista
// ---------------------------------------------------------------------------

export async function saveRow(
  table: ListTable,
  id: string | null,
  raw: unknown,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };

  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = listSchemas[table].safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos.' };
  }

  const db = await untypedServer();
  const values = parsed.data as Record<string, unknown>;
  const { error } = id
    ? await db.from(table).update(values).eq('id', id)
    : await db.from(table).insert(values);

  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteRow(table: ListTable, id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const db = await untypedServer();
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ---------------------------------------------------------------------------
//  Admin: perfil (fila única — upsert)
// ---------------------------------------------------------------------------

export async function saveProfile(raw: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos.' };
  }

  const supabase = await untypedServer();
  const { data: existing } = await supabase.from('profile').select('id').limit(1).maybeSingle();

  const values = {
    nombre: parsed.data.nombre,
    titular: parsed.data.titular,
    bio: parsed.data.bio,
    foto_url: parsed.data.foto_url || null,
    redes: parsed.data.redes,
    nav_media: parsed.data.nav_media,
  };

  const { error } = existing
    ? await supabase.from('profile').update(values).eq('id', existing.id)
    : await supabase.from('profile').insert(values);

  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ---------------------------------------------------------------------------
//  Admin: bandeja de mensajes
// ---------------------------------------------------------------------------

export async function setMessageRead(id: string, leido: boolean): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await untypedServer();
  const { error } = await supabase.from('contact_messages').update({ leido }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/mensajes');
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createServerSupabase();
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/mensajes');
  return { ok: true };
}

// ---------------------------------------------------------------------------
//  Admin: ajustes SEO / OG
// ---------------------------------------------------------------------------

export async function saveSettings(raw: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = seoSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos.' };
  }

  const supabase = await untypedServer();
  const rows = Object.entries(parsed.data).map(([clave, valor]) => ({
    clave,
    valor: valor ?? '',
  }));
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'clave' });
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ---------------------------------------------------------------------------
//  Admin: textos editables del sitio (clave/valor)
// ---------------------------------------------------------------------------

export async function saveContent(raw: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = siteContentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Datos inválidos.' };

  // Solo claves conocidas (evita escribir claves arbitrarias en `settings`).
  const allowed = new Set(CONTENT_KEYS);
  const rows = Object.entries(parsed.data)
    .filter(([clave]) => allowed.has(clave))
    .map(([clave, valor]) => ({ clave, valor: valor ?? '' }));
  if (rows.length === 0) return { ok: true };

  const supabase = await untypedServer();
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'clave' });
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}
