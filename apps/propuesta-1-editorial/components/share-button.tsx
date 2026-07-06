'use client';

import * as React from 'react';
import { Check, Link2, Share2, X } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Botón «Compartir» de una nota.                                             */
/*  En móvil (y navegadores compatibles) usa la hoja de compartir nativa       */
/*  (`navigator.share`), que incluye WhatsApp; al compartir el ENLACE, WhatsApp */
/*  arma la tarjeta con imagen y título a partir de las etiquetas Open Graph    */
/*  de la página. En escritorio despliega un menú con WhatsApp, redes y copiar. */
/* -------------------------------------------------------------------------- */
export function ShareButton({
  title,
  text,
  path,
}: {
  title: string;
  text?: string;
  path: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // La URL absoluta se resuelve en el cliente para que WhatsApp pueda leer el OG.
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(new URL(path, window.location.origin).toString());
    }
  }, [path]);

  // Cierra el menú al hacer clic fuera o con Escape.
  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function handleClick() {
    if (!url) return;
    if (canNativeShare) {
      try {
        await navigator.share({ title, text: text || title, url });
        return;
      } catch {
        // El usuario canceló o falló: caemos al menú.
      }
    }
    setOpen((v) => !v);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* sin portapapeles disponible */
    }
  }

  const shareText = `${title} — ${url}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-haspopup={!canNativeShare}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-paper-2"
      >
        <Share2 className="size-4" />
        Compartir
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-card border border-line bg-paper shadow-lift"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Compartir
            </span>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              className="inline-flex size-6 items-center justify-center rounded-full text-ink-muted hover:bg-paper-2"
            >
              <X className="size-4" />
            </button>
          </div>
          <a
            role="menuitem"
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-ink transition-colors hover:bg-paper-2"
          >
            <WhatsAppIcon className="size-5 text-[#25D366]" />
            WhatsApp
          </a>
          <a
            role="menuitem"
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-ink transition-colors hover:bg-paper-2"
          >
            <span className="grid size-5 place-items-center font-semibold">𝕏</span>
            X (Twitter)
          </a>
          <a
            role="menuitem"
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-ink transition-colors hover:bg-paper-2"
          >
            <span className="grid size-5 place-items-center font-semibold text-[#1877F2]">f</span>
            Facebook
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-paper-2"
          >
            {copied ? (
              <Check className="size-5 text-accent" />
            ) : (
              <Link2 className="size-5 text-ink-muted" />
            )}
            {copied ? 'Enlace copiado' : 'Copiar enlace'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
