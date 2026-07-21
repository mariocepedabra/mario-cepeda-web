'use client';

import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { socialNetworkOf } from '@mario/core/lib';

import { Reveal } from './interactive';

/**
 * Feed automático de redes sociales que aparece bajo los artículos de
 * Pensamiento (ocupa una fila a todo el ancho). Recibe una lista de URLs de
 * perfil; detecta la red de cada una (X, Facebook o Instagram) y pinta su feed
 * en directo con el widget/embed oficial de cada plataforma:
 *  - X (Twitter): timeline oficial (`platform.twitter.com/widgets.js`).
 *  - Facebook: Page Plugin oficial (iframe, sin SDK) — funciona con Páginas.
 *  - Instagram: embed oficial de una publicación/reel, o tarjeta al perfil.
 *
 * Cada widget carga su propio script del lado del cliente, igual que ya hace el
 * sitio con los embeds de Instagram y los iframes de YouTube.
 */
export function SocialFeed({ urls }: { urls: string[] }) {
  const feeds = React.useMemo(
    () => urls.map((u) => u.trim()).filter(Boolean),
    [urls],
  );
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
  const height = compact ? 520 : 640;

  if (network === 'x') return <XTimeline url={url} height={height} />;
  if (network === 'facebook') return <FacebookPage url={url} height={height} />;
  if (network === 'instagram') return <InstagramFeed url={url} />;
  return <FallbackCard url={url} />;
}

/* -------------------------------------------------------------------------- */
/*  X (Twitter) — timeline oficial                                             */
/* -------------------------------------------------------------------------- */

declare global {
  interface Window {
    twttr?: { widgets?: { load?: (el?: HTMLElement) => void } };
  }
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

function XTimeline({ url, height }: { url: string; height: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const handle = xHandle(url);

  React.useEffect(() => {
    if (!handle) return;
    const load = () => window.twttr?.widgets?.load?.(ref.current ?? undefined);
    if (window.twttr?.widgets) {
      load();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://platform.twitter.com/widgets.js"]',
    );
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener('load', load);
    return () => script?.removeEventListener('load', load);
  }, [handle]);

  if (!handle) return <FallbackCard url={url} />;

  return (
    <div ref={ref} className="overflow-hidden rounded-card">
      {/* widgets.js reemplaza este enlace por el timeline en vivo. */}
      <a
        className="twitter-timeline"
        data-height={height}
        data-theme="light"
        data-chrome="noheader nofooter transparent"
        data-dnt="true"
        href={`https://twitter.com/${handle}?ref_src=twsrc%5Etfw`}
      >
        Publicaciones de @{handle}
      </a>
      <SocialLink href={`https://x.com/${handle}`} label={`Ver @${handle} en X`} />
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
 * perfil. Para incrustar un feed en vivo hay que pegar el enlace de una
 * publicación/reel concreto.
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
