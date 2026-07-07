'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { isSupabaseConfigured, SUPABASE_SERVICE_ROLE_KEY } from '@mario/database';
import type { SubscriberEvent, SubscriberStatus } from '@mario/database';
import { createAdminSupabase } from '@mario/database/admin';
import { createServerSupabase } from '@mario/database/server';
import { getSubscriberEvents } from '@mario/database/queries';

import { isAllowedAdmin } from '../auth';
import { CONTACT_DEFAULT_TO, CONTACT_KEYS, CONTENT_KEYS, MOSAIC_KEYS, NEWSLETTER_KEYS, PERFIL_ALL_KEYS, RESEND_API_KEY_SECRET, SECTION_MEDIA_KEYS } from '../lib';
import {
  contactSchema,
  listSchemas,
  mosaicSchema,
  newsletterSettingsSchema,
  profileSchema,
  sectionMediaSchema,
  seoSettingsSchema,
  siteContentSchema,
  subscribeSchema,
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

  const { nombre, email, telefono, asunto, mensaje } = parsed.data;

  // En modo demo (sin Supabase) confirmamos sin persistir.
  if (!isSupabaseConfigured) {
    return { ok: true, demo: true };
  }

  // Guardamos el mensaje en «Mensajes» del panel (incluyendo teléfono/asunto).
  const partes = [
    asunto ? `Asunto: ${asunto}` : '',
    telefono ? `Teléfono: ${telefono}` : '',
    mensaje,
  ].filter(Boolean);
  const mensajeCompleto = partes.join('\n\n');

  const supabase = await untypedServer();
  const { error } = await supabase.from('contact_messages').insert({
    nombre,
    email,
    mensaje: mensajeCompleto,
  });
  if (error) return { ok: false, error: 'No se pudo enviar el mensaje. Inténtalo más tarde.' };

  // Aviso por correo a Mario vía Resend (best-effort: si falla, el mensaje ya
  // quedó guardado). El resultado se registra en `settings` para diagnosticarlo
  // desde el panel (Boletín → Formulario de contacto).
  try {
    const sent = await sendContactNotification({ nombre, email, telefono, asunto, mensaje });
    if (!sent.ok) console.error('[contacto] Aviso NO enviado:', sent.error);
  } catch (err) {
    console.error('[contacto] Error enviando el aviso por correo:', err);
    /* el mensaje ya quedó registrado; el correo es secundario */
  }

  return { ok: true };
}

/**
 * Envía el aviso de contacto por Resend y registra el resultado (con hora) en
 * `settings[contact.last_status]` para que el panel muestre qué pasó. Devuelve
 * el error real si algo falla. Se envía siempre que Resend esté configurado,
 * salvo desactivación explícita (`contact.enabled = '0'`).
 */
async function sendContactNotification(d: {
  nombre: string;
  email: string;
  telefono?: string;
  asunto?: string;
  mensaje: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const settings = await readSettingsMap();
  if (settings[CONTACT_KEYS.enabled] === '0') {
    return { ok: false, error: 'El aviso por correo está desactivado en el panel.' };
  }

  const apiKey = await readResendApiKey();
  const fromEmail = (settings[NEWSLETTER_KEYS.fromEmail] ?? '').trim();
  const toEmail = (settings[CONTACT_KEYS.toEmail] ?? '').trim() || CONTACT_DEFAULT_TO;

  let result: { ok: true } | { ok: false; error: string };
  if (!apiKey) {
    result = { ok: false, error: 'Falta la API key de Resend (panel → Boletín).' };
  } else if (!fromEmail) {
    result = { ok: false, error: 'Falta el correo remitente (panel → Boletín).' };
  } else {
    const fromName = (settings[NEWSLETTER_KEYS.fromName] ?? '').trim();
    result = await sendResendEmail(apiKey, {
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      to: [toEmail],
      subject: d.asunto
        ? `Contacto web: ${d.asunto}`
        : `Nuevo mensaje de contacto de ${d.nombre}`,
      html: contactEmailHtml(d),
      reply_to: d.email,
    });
  }

  // Registra el resultado para verlo en el panel (requiere service_role porque
  // el visitante público no puede escribir en `settings`).
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const status = result.ok
    ? `${stamp} · ✅ Enviado a ${toEmail}`
    : `${stamp} · ❌ ${result.error}`;
  try {
    if (SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminSupabase() as unknown as SupabaseClient;
      await admin
        .from('settings')
        .upsert({ clave: CONTACT_KEYS.lastStatus, valor: status }, { onConflict: 'clave' });
    }
  } catch {
    /* el registro es informativo */
  }

  return result;
}

/**
 * Prueba del aviso de contacto desde el panel: recorre EXACTAMENTE el mismo
 * camino que el formulario público y devuelve el error real de Resend si falla.
 */
export async function sendTestContactEmail(): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const res = await sendContactNotification({
    nombre: 'Prueba del panel',
    email: 'prueba@mariocepeda.co',
    asunto: 'Prueba del formulario de contacto',
    mensaje:
      'Este es un mensaje de PRUEBA enviado desde el panel para verificar que los avisos del formulario «Hablemos» llegan a tu correo.',
  });
  if (!res.ok) return res;
  revalidatePath('/admin/boletin');
  return { ok: true };
}

/** Cuerpo HTML del correo que le llega a Mario con un mensaje de contacto. */
function contactEmailHtml(d: {
  nombre: string;
  email: string;
  telefono?: string;
  asunto?: string;
  mensaje: string;
}): string {
  const row = (label: string, value: string) =>
    `<p style="margin:0 0 6px;font-size:15px;color:#4a463f"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
  const cuerpo = escapeHtml(d.mensaje).replace(/\n/g, '<br/>');
  return `<!doctype html><html><body style="margin:0;background:#f5f1e8;padding:24px;font-family:Georgia,'Times New Roman',serif;color:#1c1a17">
  <div style="max-width:560px;margin:0 auto;background:#fffdf8;border:1px solid #e7e0d2;border-radius:16px;overflow:hidden">
    <div style="padding:28px 32px">
      <p style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:#9a7b53;margin:0 0 12px">Formulario de contacto</p>
      ${row('Nombre', d.nombre)}
      ${row('Correo', d.email)}
      ${d.telefono ? row('Teléfono', d.telefono) : ''}
      ${d.asunto ? row('Asunto', d.asunto) : ''}
      <div style="margin-top:18px;padding-top:18px;border-top:1px solid #efe9dc;font-size:16px;line-height:1.6;color:#1c1a17">${cuerpo}</div>
    </div>
  </div>
</body></html>`;
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

  // Aviso automático del boletín al publicar una nota nueva (best-effort: un
  // fallo de correo NUNCA debe romper el guardado de la nota).
  if (table === 'posts') {
    await maybeNotifyNewPost(values as NotifiablePost);
  }

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
    nav_text: parsed.data.nav_text,
  };

  const write = (vals: Record<string, unknown>) =>
    existing
      ? supabase.from('profile').update(vals).eq('id', existing.id)
      : supabase.from('profile').insert(vals);

  let { error } = await write(values);

  // Tolerancia: si las columnas de navegación aún no se han migrado en la base
  // de datos, no rompemos el guardado del perfil. Reintentamos sin esos campos
  // (la media/textos del menú se persistirán en cuanto se aplique la migración).
  if (error && (error.code === 'PGRST204' || /nav_(media|text)/i.test(error.message))) {
    const { nav_media: _m, nav_text: _t, ...base } = values;
    ({ error } = await write(base));
  }

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
//  Admin: mosaico de imágenes/videos de la sección Trabajo
// ---------------------------------------------------------------------------

export async function saveMosaic(section: string, raw: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  // Solo claves conocidas (evita escribir claves arbitrarias en `settings`).
  const clave = MOSAIC_KEYS[section as keyof typeof MOSAIC_KEYS];
  if (!clave) return { ok: false, error: 'Sección de mosaico inválida.' };

  const parsed = mosaicSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Datos inválidos.' };
  const urls = parsed.data.filter((u) => u.length > 0);

  const supabase = await untypedServer();
  const { error } = await supabase
    .from('settings')
    .upsert({ clave, valor: JSON.stringify(urls) }, { onConflict: 'clave' });
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

// ---------------------------------------------------------------------------
//  Admin: media de las tarjetas de «Cuatro miradas» (Dashboard)
// ---------------------------------------------------------------------------

export async function saveSectionMedia(raw: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = sectionMediaSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Datos inválidos.' };

  // Solo claves conocidas (evita escribir claves arbitrarias en `settings`).
  const allowed = new Set<string>(Object.values(SECTION_MEDIA_KEYS));
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

// ---------------------------------------------------------------------------
//  Admin: Perfil profesional (textos + media, en `settings`)
// ---------------------------------------------------------------------------

export async function savePerfilProfesional(raw: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = siteContentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Datos inválidos.' };

  // Solo claves conocidas del perfil (evita escribir claves arbitrarias).
  const allowed = new Set(PERFIL_ALL_KEYS);
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

// ---------------------------------------------------------------------------
//  Boletín — utilidades de servidor (Resend vía API REST, sin dependencias)
// ---------------------------------------------------------------------------

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mariocepeda.co').replace(/\/+$/, '');

type NotifiablePost = {
  slug?: string;
  titulo?: string;
  publicado?: boolean;
  resumen?: string | null;
  bajada?: string | null;
  portada_url?: string | null;
};

type ResendEmail = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  reply_to?: string;
  headers?: Record<string, string>;
};

/** Lee el mapa clave/valor de `settings` (lectura pública). */
async function readSettingsMap(): Promise<Record<string, string>> {
  try {
    const db = await untypedServer();
    const { data } = await db.from('settings').select('clave, valor');
    const rows = (data ?? []) as { clave: string; valor: string | null }[];
    return Object.fromEntries(rows.map((r) => [r.clave, r.valor ?? '']));
  } catch {
    return {};
  }
}

/**
 * Obtiene la API key de Resend probando, en orden: variable de entorno
 * `RESEND_API_KEY`, lectura con service_role y, por último, lectura como admin
 * autenticado. La tabla `app_secrets` no es legible públicamente.
 */
async function readResendApiKey(): Promise<string> {
  const fromEnv = (process.env.RESEND_API_KEY ?? '').trim();
  if (fromEnv) return fromEnv;

  if (SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminSupabase() as unknown as SupabaseClient;
      const { data } = await admin
        .from('app_secrets')
        .select('valor')
        .eq('clave', RESEND_API_KEY_SECRET)
        .maybeSingle();
      const v = (data as { valor: string | null } | null)?.valor;
      if (v && v.trim()) return v.trim();
    } catch {
      /* sigue al siguiente intento */
    }
  }

  try {
    const db = await untypedServer();
    const { data } = await db
      .from('app_secrets')
      .select('valor')
      .eq('clave', RESEND_API_KEY_SECRET)
      .maybeSingle();
    const v = (data as { valor: string | null } | null)?.valor;
    if (v && v.trim()) return v.trim();
  } catch {
    /* no disponible */
  }
  return '';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Envoltura HTML común de los correos del boletín. */
function emailShell(inner: string, unsubUrl: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f1e8;padding:24px;font-family:Georgia,'Times New Roman',serif;color:#1c1a17">
  <div style="max-width:560px;margin:0 auto;background:#fffdf8;border:1px solid #e7e0d2;border-radius:16px;overflow:hidden">
    <div style="padding:28px 32px">${inner}</div>
    <div style="padding:18px 32px;border-top:1px solid #efe9dc;font-family:Arial,sans-serif;font-size:12px;color:#8a8479">
      Recibes este correo porque te suscribiste al boletín de Mario Cepeda.
      <a href="${unsubUrl}" style="color:#9a7b53">Darme de baja</a>.
    </div>
  </div>
</body></html>`;
}

function postEmailHtml(post: NotifiablePost, unsubUrl: string): string {
  const titulo = escapeHtml(post.titulo ?? 'Nueva publicación');
  const dek = escapeHtml((post.bajada || post.resumen || '').toString());
  const url = `${SITE_URL}/pensamiento/${post.slug ?? ''}`;
  const cover =
    post.portada_url && /^https?:\/\//.test(post.portada_url) && !post.portada_url.includes('#loop')
      ? `<img src="${escapeHtml(post.portada_url)}" alt="" style="width:100%;border-radius:12px;margin-bottom:18px" />`
      : '';
  return emailShell(
    `${cover}
     <p style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:#9a7b53;margin:0 0 8px">Nueva publicación</p>
     <h1 style="font-size:26px;line-height:1.2;margin:0 0 12px">${titulo}</h1>
     ${dek ? `<p style="font-size:16px;line-height:1.6;color:#4a463f;margin:0 0 22px">${dek}</p>` : ''}
     <a href="${url}" style="display:inline-block;background:#1c1a17;color:#fffdf8;text-decoration:none;padding:12px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:14px">Leer en el sitio →</a>`,
    unsubUrl,
  );
}

function welcomeEmailHtml(unsubUrl: string): string {
  return emailShell(
    `<p style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:#9a7b53;margin:0 0 8px">Boletín</p>
     <h1 style="font-size:26px;line-height:1.2;margin:0 0 12px">¡Gracias por suscribirte!</h1>
     <p style="font-size:16px;line-height:1.6;color:#4a463f;margin:0 0 8px">A partir de ahora recibirás las nuevas columnas, ideas y crónicas de Nariño directamente en tu correo.</p>
     <p style="font-size:16px;line-height:1.6;color:#4a463f;margin:0"><a href="${SITE_URL}" style="color:#9a7b53">Visitar el sitio</a></p>`,
    unsubUrl,
  );
}

/** Envía correos por la API de Resend en lotes de 100. */
async function sendResendEmails(
  apiKey: string,
  emails: ResendEmail[],
): Promise<{ sent: number; error?: string }> {
  let sent = 0;
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100);
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { sent, error: `Resend respondió ${res.status}. ${text.slice(0, 300)}` };
    }
    sent += chunk.length;
  }
  return { sent };
}

/**
 * Envía UN correo por el endpoint simple de Resend (`/emails`). A diferencia
 * del endpoint por lotes, devuelve el mensaje de error detallado de Resend
 * (dominio sin verificar, modo prueba, remitente inválido…), clave para
 * diagnosticar el formulario de contacto.
 */
async function sendResendEmail(
  apiKey: string,
  email: ResendEmail,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let detail = text.slice(0, 300);
      try {
        const json = JSON.parse(text) as { message?: string };
        if (json.message) detail = json.message;
      } catch {
        /* respuesta no-JSON: usamos el texto plano */
      }
      return { ok: false, error: `Resend respondió ${res.status}: ${detail}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `No se pudo contactar a Resend: ${String(err).slice(0, 200)}` };
  }
}

function unsubUrlFor(token: string): string {
  return `${SITE_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

function parseNotified(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Aviso automático a los suscriptores cuando se publica una nota nueva. */
async function maybeNotifyNewPost(post: NotifiablePost): Promise<void> {
  try {
    if (!post.publicado || !post.slug) return;
    const settings = await readSettingsMap();
    if (settings[NEWSLETTER_KEYS.enabled] !== '1') return;
    if (settings[NEWSLETTER_KEYS.autoSend] !== '1') return;

    const notified = parseNotified(settings[NEWSLETTER_KEYS.notified]);
    if (notified.includes(post.slug)) return;

    const apiKey = await readResendApiKey();
    const fromEmail = (settings[NEWSLETTER_KEYS.fromEmail] ?? '').trim();
    if (!apiKey || !fromEmail) return;

    const fromName = (settings[NEWSLETTER_KEYS.fromName] ?? '').trim();
    const replyTo = (settings[NEWSLETTER_KEYS.replyTo] ?? '').trim();
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    const db = await untypedServer();
    const { data } = await db.from('subscribers').select('email, token').eq('estado', 'activo');
    const list = (data ?? []) as { email: string; token: string }[];

    if (list.length > 0) {
      const emails: ResendEmail[] = list.map((s) => {
        const unsub = unsubUrlFor(s.token);
        return {
          from,
          to: [s.email],
          subject: `Nueva publicación: ${post.titulo ?? ''}`.trim(),
          html: postEmailHtml(post, unsub),
          reply_to: replyTo || undefined,
          headers: { 'List-Unsubscribe': `<${unsub}>` },
        };
      });
      await sendResendEmails(apiKey, emails);
    }

    // Marca la nota como avisada aunque no haya suscriptores: evita reenvíos.
    notified.push(post.slug);
    await db
      .from('settings')
      .upsert({ clave: NEWSLETTER_KEYS.notified, valor: JSON.stringify(notified) }, { onConflict: 'clave' });
  } catch {
    /* nunca rompemos el guardado de la nota por un fallo de correo */
  }
}

// ---------------------------------------------------------------------------
//  Boletín — alta pública
// ---------------------------------------------------------------------------

export async function subscribeNewsletter(raw: unknown): Promise<ActionResult> {
  const parsed = subscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos.' };
  }

  // Modo demostración (sin Supabase): confirmamos sin persistir.
  if (!isSupabaseConfigured) return { ok: true, demo: true };

  const db = await untypedServer();
  let token = '';

  const { data, error } = await db.rpc('newsletter_subscribe', {
    p_email: parsed.data.email,
    p_nombre: parsed.data.nombre ?? '',
  });

  if (error) {
    // Respaldo si el RPC aún no existe: alta directa (sin token recuperable).
    const ins = await db
      .from('subscribers')
      .insert({ email: parsed.data.email.toLowerCase(), nombre: parsed.data.nombre || null });
    if (ins.error) {
      return { ok: false, error: 'No se pudo completar la suscripción. Inténtalo más tarde.' };
    }
  } else {
    token = typeof data === 'string' ? data : '';
  }

  // Cookie para asociar (de forma anónima) las visitas del suscriptor.
  if (token) {
    const jar = await cookies();
    const maxAge = 60 * 60 * 24 * 365;
    const secure = process.env.NODE_ENV === 'production';
    jar.set('mc_sub', token, { httpOnly: true, sameSite: 'lax', secure, maxAge, path: '/' });
    jar.set('mc_sub_on', '1', { httpOnly: false, sameSite: 'lax', secure, maxAge, path: '/' });
  }

  // Correo de bienvenida (best-effort).
  try {
    const settings = await readSettingsMap();
    const fromEmail = (settings[NEWSLETTER_KEYS.fromEmail] ?? '').trim();
    if (settings[NEWSLETTER_KEYS.enabled] === '1' && fromEmail && token) {
      const apiKey = await readResendApiKey();
      if (apiKey) {
        const fromName = (settings[NEWSLETTER_KEYS.fromName] ?? '').trim();
        const replyTo = (settings[NEWSLETTER_KEYS.replyTo] ?? '').trim();
        const unsub = unsubUrlFor(token);
        await sendResendEmails(apiKey, [
          {
            from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
            to: [parsed.data.email],
            subject: '¡Gracias por suscribirte!',
            html: welcomeEmailHtml(unsub),
            reply_to: replyTo || undefined,
            headers: { 'List-Unsubscribe': `<${unsub}>` },
          },
        ]);
      }
    }
  } catch {
    /* la suscripción ya quedó registrada; el correo es secundario */
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
//  Boletín — administración
// ---------------------------------------------------------------------------

export async function saveNewsletterSettings(raw: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = newsletterSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos.' };
  }

  const db = await untypedServer();
  const rows = [
    { clave: NEWSLETTER_KEYS.enabled, valor: parsed.data.enabled ? '1' : '0' },
    { clave: NEWSLETTER_KEYS.autoSend, valor: parsed.data.auto_send ? '1' : '0' },
    { clave: NEWSLETTER_KEYS.fromName, valor: parsed.data.from_name ?? '' },
    { clave: NEWSLETTER_KEYS.fromEmail, valor: parsed.data.from_email ?? '' },
    { clave: NEWSLETTER_KEYS.replyTo, valor: parsed.data.reply_to ?? '' },
    { clave: CONTACT_KEYS.enabled, valor: parsed.data.contact_enabled ? '1' : '0' },
    { clave: CONTACT_KEYS.toEmail, valor: parsed.data.contact_to_email ?? '' },
  ];
  const { error } = await db.from('settings').upsert(rows, { onConflict: 'clave' });
  if (error) return { ok: false, error: error.message };

  // La API key solo se actualiza si se escribió un valor nuevo (no se borra).
  const key = parsed.data.resend_api_key?.trim();
  if (key) {
    const { error: e2 } = await db
      .from('app_secrets')
      .upsert({ clave: RESEND_API_KEY_SECRET, valor: key }, { onConflict: 'clave' });
    if (e2) return { ok: false, error: `Ajustes guardados, pero la API key no: ${e2.message}` };
  }

  revalidatePath('/admin/boletin');
  return { ok: true };
}

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const db = await untypedServer();
  const { error } = await db.from('subscribers').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/boletin');
  return { ok: true };
}

export async function setSubscriberEstado(
  id: string,
  estado: SubscriberStatus,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  if (!['activo', 'baneado', 'baja'].includes(estado)) {
    return { ok: false, error: 'Estado inválido.' };
  }

  const db = await untypedServer();
  const { error } = await db.from('subscribers').update({ estado }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/boletin');
  return { ok: true };
}

/** Carga las visitas de un suscriptor (para el perfil en el panel). */
export async function loadSubscriberEvents(id: string): Promise<SubscriberEvent[]> {
  // En modo demostración devolvemos los ejemplos sin exigir sesión.
  if (!isSupabaseConfigured) return getSubscriberEvents(id);
  const auth = await requireAdmin();
  if (!auth.ok) return [];
  return getSubscriberEvents(id);
}

/** Envía un correo de prueba al propio admin para verificar la configuración. */
export async function sendTestNewsletter(): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sesión no válida. Inicia sesión de nuevo.' };
  if (!isAllowedAdmin(user.email)) {
    return { ok: false, error: 'Tu cuenta no está autorizada.' };
  }
  const to = user.email;
  if (!to) return { ok: false, error: 'No se pudo determinar tu correo.' };

  const apiKey = await readResendApiKey();
  if (!apiKey) {
    return { ok: false, error: 'Falta la API key de Resend. Guárdala arriba y vuelve a intentar.' };
  }
  const settings = await readSettingsMap();
  const fromEmail = (settings[NEWSLETTER_KEYS.fromEmail] ?? '').trim();
  if (!fromEmail) return { ok: false, error: 'Configura primero el correo remitente.' };

  const fromName = (settings[NEWSLETTER_KEYS.fromName] ?? '').trim();
  const replyTo = (settings[NEWSLETTER_KEYS.replyTo] ?? '').trim();
  const res = await sendResendEmails(apiKey, [
    {
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      to: [to],
      subject: 'Prueba del boletín · Mario Cepeda',
      html: emailShell(
        `<h1 style="font-size:24px;margin:0 0 12px">Configuración correcta ✅</h1>
         <p style="font-size:16px;line-height:1.6;color:#4a463f;margin:0">Si recibes este correo, el boletín está listo para enviar a tus suscriptores.</p>`,
        `${SITE_URL}`,
      ),
      reply_to: replyTo || undefined,
    },
  ]);
  if (res.error) return { ok: false, error: res.error };
  return { ok: true };
}
