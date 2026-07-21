'use client';

import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { socialNetworkOf } from '@mario/core/lib';

import { Reveal } from './interactive';

/**
 * Feed de redes sociales que aparece bajo los artículos de Pensamiento (ocupa
 * una fila a todo el ancho). Recibe una lista de URLs; detecta la red de cada
 * una y la muestra con el mejor método FIABLE de cada plataforma:
 *
 *  - X (Twitter): X ya NO permite incrustar el feed automático de un PERFIL
 *    para visitantes no logueados (lo sirve vacío desde 2023). Por eso:
 *      · URL de perfil (x.com/usuario) → tarjeta «Síguelo en X» (sin script,
 *        siempre funciona).
 *      · URL de un TWEET concreto (x.com/usuario/status/123) → se incrusta ese
 *        tweet con su contenido real (widget oficial de X).
 *  - Facebook: Page Plugin oficial (iframe, sin SDK) — funciona con Páginas.
 *  - Instagram: embed oficial de una publicación/reel, o tarjeta al perfil.
 */
export function SocialFeed({ urls }: { urls: string[] }) {
  const feeds = React.useMemo(() => urls.map((u) => u.trim()).filter(Boolean), [urls]);
  if (feeds.length === 0) return null;

  const single = feeds.length === 1;

  return (
    <section aria-label="Redes sociales" className="mt-20 sm:mt-28">
      <Reveal>
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">En redes</h2>
      </Reveal>
      <div
        className={
          single
            ? 'mx-auto mt-8 w-full max-w-xl'
            : 'mt-8 grid grid-cols-1 items-start gap-6 sm:grid-cols-2 xl:grid-cols-3'
        }
      >
        {feeds.map((url, i) => (
          <SocialFeedItem key={`${url}-${i}`} url={url} compact={!single} />
        ))}
      </div>
    </section>
  );
}

function SocialFeedItem({ url, compact }: { url: string; compact: boolean }) {
  const network = socialNetworkOf(url);

  if (network === 'x') {
    return isTweetUrl(url) ? <XTweet url={url} /> : <XProfileCard url={url} />;
  }
  if (network === 'facebook') return <FacebookPage url={url} height={compact ? 520 : 640} />;
  if (network === 'instagram') return <InstagramFeed url={url} />;
  return <FallbackCard url={url} />;
}

/* -------------------------------------------------------------------------- */
/*  X (Twitter)                                                                 */
/* -------------------------------------------------------------------------- */

declare global {
  interface Window {
    twttr?: { widgets?: { load?: (el?: HTMLElement) => void } };
  }
}

/** ¿La URL apunta a un tweet concreto (…/status/123) y no a un perfil? */
function isTweetUrl(url: string): boolean {
  return /(?:twitter|x)\.com\/(?:[^/?#]+\/status|i\/web\/status)\/\d+/i.test(url);
}

/** Extrae el usuario (@handle) de una URL de perfil de X/Twitter. */
function xHandle(url: string): string | null {
  try {
    const u = new URL(url.includes('://') ? url : `https://${url}`);
    const seg = u.pathname.split('/').filter(Boolean)[0] ?? '';
    const handle = seg.replace(/^@/, '').trim();
    return handle || null;
  } catch {
    return null;
  }
}

/** Ícono de la marca X (Twitter). */
function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * Tarjeta de perfil de X. X no deja incrustar el feed automático de un perfil,
 * así que mostramos una tarjeta fiable (sin scripts de terceros) con enlace
 * directo a las publicaciones de Mario en X.
 */
function XProfileCard({ url }: { url: string }) {
  const handle = xHandle(url);
  const profileUrl = handle ? `https://x.com/${handle}` : url;
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-line bg-ink px-8 py-10 text-center text-paper shadow-soft">
      <XMark className="size-9" />
      <div>
        <p className="font-display text-xl font-semibold">{handle ? `@${handle}` : 'Perfil'}</p>
        <p className="mt-1 text-sm text-paper/70">Sigue la conversación de Mario en X.</p>
      </div>
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
      >
        Ver publicaciones en X <ArrowUpRight className="size-4" />
      </a>
    </div>
  );
}

/**
 * Cargador idempotente del widget de X (`platform.twitter.com/widgets.js`).
 * Se comparte entre todos los tweets de la página para inyectar el script una
 * sola vez y resolver en cuanto esté disponible `twttr.widgets`.
 */
let twitterWidgetsPromise: Promise<void> | null = null;
function loadTwitterWidgets(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.twttr?.widgets) return Promise.resolve();
  if (twitterWidgetsPromise) return twitterWidgetsPromise;
  twitterWidgetsPromise = new Promise<void>((resolve) => {
    const src = 'https://platform.twitter.com/widgets.js';
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const done = () => resolve();
    if (existing) {
      if (window.twttr?.widgets) done();
      else existing.addEventListener('load', done);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.charset = 'utf-8';
    script.addEventListener('load', done);
    document.body.appendChild(script);
  });
  return twitterWidgetsPromise;
}

/** Incrusta un tweet concreto (los tweets sueltos sí se renderizan en X). */
function XTweet({ url }: { url: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    void loadTwitterWidgets().then(() => {
      if (!cancelled) window.twttr?.widgets?.load?.(ref.current ?? undefined);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  // El widget acepta enlaces de x.com y de twitter.com; normalizamos el host.
  const tweetUrl = url.replace(/^http:\/\//, 'https://').replace(/\/\/x\.com/i, '//twitter.com');
  const profileUrl = url.replace(/^http:\/\//, 'https://');

  // Tarjeta con fallback SIEMPRE visible: si X renderiza el tweet, se ve
  // completo dentro; si lo sirve vacío (X degrada los embeds), queda el enlace.
  return (
    <div className="rounded-card border border-line bg-paper-2/60 p-4 shadow-soft">
      <div ref={ref} className="[&_.twitter-tweet]:!my-0">
        <blockquote
          className="twitter-tweet"
          data-dnt="true"
          data-theme="light"
          data-conversation="none"
        >
          <a href={tweetUrl}>Publicación en X</a>
        </blockquote>
      </div>
      <SocialLink href={profileUrl} label="Ver publicación en X" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Facebook — Page Plugin oficial (iframe, sin SDK)                            */
/* -------------------------------------------------------------------------- */

function FacebookPage({ url, height }: { url: string; height: number }) {
  const src =
    'https://www.facebook.com/plugins/page.php?' +
    new URLSearchParams({
      href: url,
      tabs: 'timeline',
      width: '500',
      height: String(height),
      small_header: 'false',
      adapt_container_width: 'true',
      hide_cover: 'false',
      show_facepage: 'true',
    }).toString();

  return (
    <div className="rounded-card border border-line bg-paper-2 p-2 shadow-soft">
      <iframe
        src={src}
        title="Facebook"
        height={height}
        loading="lazy"
        scrolling="no"
        frameBorder={0}
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        className="w-full border-0"
        style={{ overflow: 'hidden' }}
      />
      <SocialLink href={url} label="Ver en Facebook" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Instagram — embed oficial de una publicación/reel, o tarjeta al perfil     */
/* -------------------------------------------------------------------------- */

declare global {
  interface Window {
    instgrm?: { Embeds?: { process?: () => void } };
  }
}

function InstagramFeed({ url }: { url: string }) {
  const post = url.match(/instagram\.com\/(?:[^/?#]+\/)*?(p|reel|reels|tv)\/([\w-]+)/i);
  if (post) {
    const tipo = post[1].toLowerCase() === 'reels' ? 'reel' : post[1].toLowerCase();
    return <InstagramEmbed url={`https://www.instagram.com/${tipo}/${post[2]}/`} />;
  }
  return <InstagramProfileCard url={url} />;
}

/** Embed oficial de Instagram: inyecta embed.js (una vez) y procesa el post. */
function InstagramEmbed({ url }: { url: string }) {
  React.useEffect(() => {
    const process = () => window.instgrm?.Embeds?.process?.();
    if (window.instgrm?.Embeds) {
      process();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.instagram.com/embed.js"]',
    );
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener('load', process);
    return () => script?.removeEventListener('load', process);
  }, [url]);

  return (
    <div className="overflow-hidden rounded-card border border-line bg-white shadow-soft">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ width: '100%', minWidth: 0, margin: 0, border: 0, background: 'transparent' }}
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          Ver en Instagram
        </a>
      </blockquote>
    </div>
  );
}

/** Extrae el usuario de una URL de perfil de Instagram. */
function igHandle(url: string): string | null {
  try {
    const u = new URL(url.includes('://') ? url : `https://${url}`);
    const seg = u.pathname.split('/').filter(Boolean)[0] ?? '';
    const handle = seg.replace(/^@/, '').trim();
    return handle || null;
  } catch {
    return null;
  }
}

/**
 * Instagram no permite incrustar el feed de un PERFIL de forma gratuita (solo
 * publicaciones sueltas), así que mostramos una tarjeta con enlace directo al
 * perfil. Para incrustar contenido, pega el enlace de una publicación/reel.
 */
function InstagramProfileCard({ url }: { url: string }) {
  const handle = igHandle(url);
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-paper-2 p-8 text-center shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Instagram</p>
      <p className="font-display text-xl font-semibold">{handle ? `@${handle}` : 'Perfil'}</p>
      <p className="max-w-xs text-sm text-ink-soft">
        Mira las publicaciones más recientes directamente en Instagram.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        Ver perfil <ArrowUpRight className="size-4" />
      </a>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Auxiliares                                                                  */
/* -------------------------------------------------------------------------- */

/** Enlace discreto «Ver en …» que acompaña a cada feed. */
function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-1 px-1 text-sm font-medium text-accent hover:underline"
    >
      {label} <ArrowUpRight className="size-3.5" />
    </a>
  );
}

/** Enlace/red no reconocida: tarjeta simple con el enlace. */
function FallbackCard({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-paper-2 p-8 text-center shadow-soft">
      <p className="text-sm text-ink-soft">Sigue a Mario en sus redes:</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        Abrir enlace <ArrowUpRight className="size-4" />
      </a>
    </div>
  );
}
