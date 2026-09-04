import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { isSupabaseConfigured } from '@mario/database';
import { createAdminSupabase } from '@mario/database/admin';

/**
 * Ingesta de notas publicadas en Página 10.
 *
 * El plugin «P10 Multipublicación» de pagina10.com envía aquí un JSON pequeño
 * (texto y URLs, nunca archivos) firmado con HMAC-SHA256. Esta ruta descarga
 * las imágenes desde Página 10, las sube al bucket `media` y guarda la nota en
 * `posts`, enlazada por `p10_post_id` para que las ediciones posteriores
 * actualicen la misma fila en vez de duplicarla.
 *
 * Variables necesarias en Vercel:
 *   - P10_INGESTA_SECRET        (el mismo secreto que en el panel de WordPress)
 *   - SUPABASE_SERVICE_ROLE_KEY (ya existente, la usa createAdminSupabase)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'media';
const CARPETA = 'pagina10';
const SITIO = 'https://www.mariocepeda.com';

/** Tolerancia de la marca de tiempo, para que no se pueda reenviar una petición capturada. */
const VENTANA_FIRMA_S = 300;

/**
 * Presupuesto para copiar archivos. Si se agota, la nota se publica igual: lo
 * que falte sigue apuntando a Página 10 y el plugin vuelve a llamar para
 * terminar el trabajo.
 */
const PRESUPUESTO_MS = 8000;

const MAX_IMAGEN_MB = 15;
const MAX_VIDEO_MB_POR_DEFECTO = 25;

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const TIPOS_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];

type Medio = {
  url: string;
  tipo: 'imagen' | 'video';
  alt?: string;
};

type Paquete = {
  version?: number;
  origen?: string;
  accion?: 'publicar' | 'despublicar';
  post_id?: number;
  url_original?: string;
  titulo?: string;
  slug?: string;
  extracto?: string;
  contenido_html?: string;
  autor?: string;
  fecha?: string;
  publicado?: boolean;
  minutos_lectura?: number;
  categoria?: string;
  portada_url?: string;
  medios?: Medio[];
  avisos?: string[];
  max_video_mb?: number;
};

type Admin = ReturnType<typeof createAdminSupabase>;

function error(mensaje: string, estado = 400) {
  return NextResponse.json({ ok: false, error: mensaje }, { status: estado });
}

/** Verifica la firma HMAC sobre el cuerpo tal y como llegó, sin reserializar. */
function firmaValida(cuerpo: string, firma: string | null, fecha: string | null): boolean {
  const secreto = process.env.P10_INGESTA_SECRET;
  if (!secreto || !firma || !fecha) return false;

  const marca = Number(fecha);
  if (!Number.isFinite(marca)) return false;
  if (Math.abs(Date.now() / 1000 - marca) > VENTANA_FIRMA_S) return false;

  const esperada = createHmac('sha256', secreto).update(`${fecha}.${cuerpo}`).digest('hex');
  const recibida = firma.replace(/^sha256=/, '');

  const a = Buffer.from(esperada, 'utf8');
  const b = Buffer.from(recibida, 'utf8');
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

/** Nombre estable del archivo en el bucket: mismo origen, mismo destino. */
function rutaDestino(url: string, contentType: string): string {
  const huella = createHash('sha1').update(url).digest('hex');
  const extensionUrl = (url.split('?')[0]?.split('.').pop() ?? '').toLowerCase();
  const extension = /^[a-z0-9]{2,4}$/.test(extensionUrl)
    ? extensionUrl
    : (contentType.split('/')[1] ?? 'jpg').replace('quicktime', 'mov');

  return `${CARPETA}/${huella}.${extension}`;
}

/** El bucket es público: para saber si el archivo ya está basta un HEAD. */
async function yaExiste(urlPublica: string): Promise<boolean> {
  try {
    const respuesta = await fetch(urlPublica, { method: 'HEAD', cache: 'no-store' });
    return respuesta.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const crudo = await request.text();

  if (!isSupabaseConfigured || !process.env.P10_INGESTA_SECRET) {
    return error('La ingesta no está configurada en el servidor.', 503);
  }

  if (!firmaValida(crudo, request.headers.get('x-p10-firma'), request.headers.get('x-p10-fecha'))) {
    return error('Firma no válida.', 401);
  }

  let paquete: Paquete;
  try {
    paquete = JSON.parse(crudo) as Paquete;
  } catch {
    return error('El cuerpo no es JSON válido.');
  }

  const postId = Number(paquete.post_id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return error('Falta el identificador de la nota de origen.');
  }

  const supabase = createAdminSupabase();

  // -------------------------------------------------------------------------
  //  Retirar: la nota dejó de estar publicada en Página 10 o se desmarcó el
  //  destino. La fila NO se borra nunca, solo se oculta.
  // -------------------------------------------------------------------------
  if (paquete.accion === 'despublicar') {
    const { data, error: fallo } = await supabase
      .from('posts')
      .update({ publicado: false })
      .eq('p10_post_id', postId)
      .select('id, slug')
      .maybeSingle();

    if (fallo) {
      console.error('[ingesta-p10] Error al despublicar:', fallo);
      return error('No se pudo retirar la nota.', 500);
    }

    if (data) revalidar(data.slug);

    return NextResponse.json({
      ok: true,
      id: data?.id ?? '',
      url: '',
      medios_copiados: 0,
      medios_pendientes: 0,
      avisos: [],
    });
  }

  // -------------------------------------------------------------------------
  //  Publicar o actualizar
  // -------------------------------------------------------------------------
  const titulo = (paquete.titulo ?? '').trim();
  if (!titulo) return error('La nota no tiene título.');

  const avisos: string[] = Array.isArray(paquete.avisos) ? [...paquete.avisos] : [];
  const medios = Array.isArray(paquete.medios) ? paquete.medios : [];
  const maxVideoMb =
    Number(paquete.max_video_mb) > 0 ? Number(paquete.max_video_mb) : MAX_VIDEO_MB_POR_DEFECTO;

  let contenido = paquete.contenido_html ?? '';
  let portada = paquete.portada_url ?? '';
  let copiados = 0;
  let pendientes = 0;
  const inicio = Date.now();

  for (const medio of medios) {
    const origen = (medio?.url ?? '').trim();
    if (!origen || !/^https?:\/\//i.test(origen)) continue;

    if (Date.now() - inicio > PRESUPUESTO_MS) {
      // Se acabó el tiempo: lo que queda sigue enlazado a Página 10 y el
      // plugin volverá a llamar para copiarlo.
      pendientes++;
      continue;
    }

    const resultado = await copiar(supabase, origen, medio.tipo === 'video', maxVideoMb);

    if (resultado.aviso) avisos.push(resultado.aviso);

    if (!resultado.url) {
      pendientes++;
      continue;
    }

    if (!resultado.reutilizado) copiados++;

    contenido = contenido.split(origen).join(resultado.url);
    if (portada === origen) portada = resultado.url;
  }

  let existente: { id: string; slug: string } | null = null;
  let slug = '';

  const { data: porOrigen } = await supabase
    .from('posts')
    .select('id, slug')
    .eq('p10_post_id', postId)
    .maybeSingle();

  if (porOrigen) {
    existente = porOrigen;
    slug = porOrigen.slug;
  } else {
    // Adopción: en `posts` ya hay columnas traídas de pagina10.com a mano (el
    // seed de articulos-mario), y esas filas no tienen `p10_post_id`. Si el
    // slug coincide con una de ellas se actualiza ESA fila, en lugar de
    // publicar un duplicado con el slug terminado en "-2".
    const propuesto = baseSlug(paquete.slug ?? '', titulo, postId);
    const { data: porSlug } = await supabase
      .from('posts')
      .select('id, slug, p10_post_id')
      .eq('slug', propuesto)
      .maybeSingle();

    if (porSlug && porSlug.p10_post_id == null) {
      existente = { id: porSlug.id, slug: porSlug.slug };
      slug = porSlug.slug;
      avisos.push('Se actualizó la nota que ya existía con este mismo enlace en lugar de duplicarla.');
    } else {
      slug = await slugLibre(supabase, paquete.slug ?? '', titulo, postId);
    }
  }

  const fila = {
    titulo,
    slug,
    resumen: paquete.extracto ?? null,
    contenido,
    portada_url: portada || null,
    publicado: paquete.publicado !== false,
    // `fecha` es de tipo date: se queda con la parte del día.
    fecha: (paquete.fecha ?? new Date().toISOString()).slice(0, 10),
    autor: (paquete.autor ?? '').trim() || 'Página 10',
    p10_post_id: postId,
    p10_url: paquete.url_original ?? null,
  };

  const { data: guardada, error: falloGuardar } = existente
    ? await supabase.from('posts').update(fila).eq('id', existente.id).select('id, slug').single()
    : await supabase.from('posts').insert(fila).select('id, slug').single();

  if (falloGuardar || !guardada) {
    console.error('[ingesta-p10] Error al guardar:', falloGuardar);
    return error('No se pudo guardar la nota.', 500);
  }

  revalidar(guardada.slug);

  return NextResponse.json({
    ok: true,
    id: guardada.id,
    url: `${SITIO}/pensamiento/${guardada.slug}`,
    medios_copiados: copiados,
    medios_pendientes: pendientes,
    avisos,
  });
}

/** Descarga un archivo de Página 10 y lo sube al bucket propio. */
async function copiar(
  supabase: Admin,
  origen: string,
  esVideo: boolean,
  maxVideoMb: number,
): Promise<{ url: string; reutilizado: boolean; aviso?: string }> {
  const maxBytes = (esVideo ? maxVideoMb : MAX_IMAGEN_MB) * 1024 * 1024;

  try {
    // Si ya se copió en un envío anterior, se reutiliza sin descargar nada.
    const rutaProbable = rutaDestino(origen, esVideo ? 'video/mp4' : 'image/jpeg');
    const { data: publica } = supabase.storage.from(BUCKET).getPublicUrl(rutaProbable);
    if (publica?.publicUrl && (await yaExiste(publica.publicUrl))) {
      return { url: publica.publicUrl, reutilizado: true };
    }

    const respuesta = await fetch(origen, { cache: 'no-store' });
    if (!respuesta.ok) {
      return { url: '', reutilizado: false, aviso: `No se pudo descargar ${origen}` };
    }

    const contentType = (respuesta.headers.get('content-type') ?? '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    const permitidos = esVideo ? TIPOS_VIDEO : TIPOS_IMAGEN;
    if (!permitidos.includes(contentType)) {
      return {
        url: '',
        reutilizado: false,
        aviso: `Formato no admitido (${contentType || 'desconocido'}) en ${origen}`,
      };
    }

    const datos = Buffer.from(await respuesta.arrayBuffer());
    if (datos.byteLength > maxBytes) {
      const mb = Math.round(datos.byteLength / (1024 * 1024));
      return {
        url: '',
        reutilizado: false,
        aviso: `Archivo de ${mb} MB por encima del límite: se dejó enlazado a Página 10.`,
      };
    }

    const ruta = rutaDestino(origen, contentType);
    const { error: falloSubida } = await supabase.storage
      .from(BUCKET)
      .upload(ruta, datos, { contentType, upsert: true, cacheControl: '31536000' });

    if (falloSubida) {
      console.error('[ingesta-p10] Error al subir', ruta, falloSubida);
      return { url: '', reutilizado: false, aviso: `No se pudo guardar ${origen}` };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);

    return { url: data?.publicUrl ?? '', reutilizado: false };
  } catch (e) {
    console.error('[ingesta-p10] Fallo copiando', origen, e);
    return { url: '', reutilizado: false, aviso: `No se pudo copiar ${origen}` };
  }
}

/** Slug base a partir del de Página 10 (o del titular si no lo hay). */
function baseSlug(propuesto: string, titulo: string, postId: number): string {
  return (
    (propuesto || titulo)
      .toLowerCase()
      // NFD separa la letra de su tilde; al quitar lo que no es ASCII quedan
      // solo las letras base («canción» → «cancion»).
      .normalize('NFD')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90) || `nota-p10-${postId}`
  );
}

/** Busca un slug libre, respetando el de Página 10 siempre que se pueda. */
async function slugLibre(
  supabase: Admin,
  propuesto: string,
  titulo: string,
  postId: number,
): Promise<string> {
  const base = baseSlug(propuesto, titulo, postId);

  for (let intento = 0; intento < 20; intento++) {
    const candidato = intento === 0 ? base : `${base}-${intento + 1}`;
    const { data } = await supabase.from('posts').select('id').eq('slug', candidato).maybeSingle();
    if (!data) return candidato;
  }

  return `${base}-p10-${postId}`;
}

/** Refresca la caché de las páginas afectadas. */
function revalidar(slug: string) {
  try {
    revalidatePath(`/pensamiento/${slug}`);
    revalidatePath('/pensamiento');
  } catch {
    // La revalidación es una mejora, no un requisito.
  }
}
