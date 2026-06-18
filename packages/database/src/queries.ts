/**
 * Consultas de LECTURA para las webs públicas y el panel admin.
 *
 * Patrón de degradación: si Supabase no está configurado (o la consulta
 * falla), se devuelven los datos de ejemplo de `placeholder.ts`. Así las
 * webs públicas nunca quedan vacías y siguen siendo desplegables sin backend.
 *
 * Las MUTACIONES (crear/editar/borrar) viven en `@mario/core` como Server
 * Actions, porque requieren autenticación y revalidación de caché.
 */

import { isSupabaseConfigured } from './env';
import {
  placeholderAwards,
  placeholderExperiences,
  placeholderLinks,
  placeholderMedia,
  placeholderMessages,
  placeholderPosts,
  placeholderPress,
  placeholderProfile,
  placeholderSettingsMap,
  placeholderVideos,
} from './placeholder';
import { createServerSupabase } from './server';
import type {
  Award,
  ContactMessage,
  Experience,
  Link,
  Media,
  Post,
  Press,
  Profile,
  Setting,
  Video,
} from './types';

// ---------------------------------------------------------------------------
//  Lecturas públicas
// ---------------------------------------------------------------------------

export async function getProfile(): Promise<Profile> {
  if (!isSupabaseConfigured) return placeholderProfile;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('profile').select('*').limit(1).maybeSingle();
  if (error || !data) return placeholderProfile;
  return data;
}

export async function getExperiences(): Promise<Experience[]> {
  if (!isSupabaseConfigured) return placeholderExperiences;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('orden', { ascending: true });
  if (error || !data?.length) return placeholderExperiences;
  return data;
}

/** Notas publicadas (orden descendente por fecha). */
export async function getPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured) return placeholderPosts;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('publicado', true)
    .order('fecha', { ascending: false });
  if (error || !data?.length) return placeholderPosts;
  return data;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!isSupabaseConfigured) {
    return placeholderPosts.find((p) => p.slug === slug) ?? null;
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('publicado', true)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function getPress(): Promise<Press[]> {
  if (!isSupabaseConfigured) return placeholderPress;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('press')
    .select('*')
    .order('fecha', { ascending: false });
  if (error || !data?.length) return placeholderPress;
  return data;
}

export async function getVideos(): Promise<Video[]> {
  if (!isSupabaseConfigured) return placeholderVideos;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('orden', { ascending: true });
  if (error || !data?.length) return placeholderVideos;
  return data;
}

export async function getLinks(): Promise<Link[]> {
  if (!isSupabaseConfigured) return placeholderLinks;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('orden', { ascending: true });
  if (error || !data?.length) return placeholderLinks;
  return data;
}

export async function getAwards(): Promise<Award[]> {
  if (!isSupabaseConfigured) return placeholderAwards;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('awards')
    .select('*')
    .order('orden', { ascending: true });
  if (error || !data?.length) return placeholderAwards;
  return data;
}

/** Ajustes SEO/OG como mapa clave/valor. */
export async function getSettings(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured) return placeholderSettingsMap;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('settings').select('*');
  if (error || !data?.length) return placeholderSettingsMap;
  // El inferidor de tipos de postgrest-js no resuelve el Row de un esquema
  // escrito a mano; casteamos al tipo correcto (los datos sí son Setting).
  const rows = data as unknown as Setting[];
  return Object.fromEntries(rows.map((s) => [s.clave, s.valor ?? '']));
}

// ---------------------------------------------------------------------------
//  Lecturas del panel admin (requieren sesión; sin fallback a placeholder
//  salvo cuando Supabase no está configurado, para poder previsualizar la UI)
// ---------------------------------------------------------------------------

/** Todas las notas (incluye borradores). */
export async function getPostsAdmin(): Promise<Post[]> {
  if (!isSupabaseConfigured) return placeholderPosts;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('fecha', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured) return placeholderMessages;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getMedia(): Promise<Media[]> {
  if (!isSupabaseConfigured) return placeholderMedia;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export interface DashboardStats {
  mensajesTotales: number;
  mensajesNoLeidos: number;
  notasPublicadas: number;
  notasBorrador: number;
  videos: number;
  prensa: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured) {
    return {
      mensajesTotales: placeholderMessages.length,
      mensajesNoLeidos: placeholderMessages.filter((m) => !m.leido).length,
      notasPublicadas: placeholderPosts.filter((p) => p.publicado).length,
      notasBorrador: placeholderPosts.filter((p) => !p.publicado).length,
      videos: placeholderVideos.length,
      prensa: placeholderPress.length,
    };
  }
  const supabase = await createServerSupabase();
  const count = (table: 'contact_messages' | 'posts' | 'videos' | 'press') =>
    supabase.from(table).select('*', { count: 'exact', head: true });

  const [mensajes, noLeidos, publicadas, borradores, videos, prensa] = await Promise.all([
    count('contact_messages'),
    count('contact_messages').eq('leido', false),
    count('posts').eq('publicado', true),
    count('posts').eq('publicado', false),
    count('videos'),
    count('press'),
  ]);

  return {
    mensajesTotales: mensajes.count ?? 0,
    mensajesNoLeidos: noLeidos.count ?? 0,
    notasPublicadas: publicadas.count ?? 0,
    notasBorrador: borradores.count ?? 0,
    videos: videos.count ?? 0,
    prensa: prensa.count ?? 0,
  };
}
