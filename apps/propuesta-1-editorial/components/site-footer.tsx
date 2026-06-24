'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';

import { LEGAL_LINKS, MAIN_SECTIONS, NEWSLETTER } from '@mario/core/lib';
import type { SocialLinks } from '@mario/database';

const SOCIAL: { key: keyof SocialLinks; label: string; Icon: LucideIcon }[] = [
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'twitter', label: 'X (Twitter)', Icon: Twitter },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
  { key: 'website', label: 'Sitio web', Icon: Globe },
];

/* -------------------------------------------------------------------------- */
/*  Bloque de boletín (franja sobre papel)                                     */
/*  Envío en modo demostración hasta conectar un proveedor real (fase later).  */
/* -------------------------------------------------------------------------- */
function NewsletterBand() {
  const [done, setDone] = React.useState(false);

  return (
    <section
      id="newsletter"
      className="scroll-mt-24 border-t border-line bg-paper-2 py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {NEWSLETTER.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {NEWSLETTER.title}
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
            {NEWSLETTER.description}
          </p>
        </div>

        {done ? (
          <p
            role="status"
            className="rounded-card border border-line bg-paper p-6 text-lg text-ink-soft shadow-soft"
          >
            ¡Gracias por suscribirte! (Modo demostración: el boletín se conectará
            a un proveedor real más adelante.)
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="space-y-3"
            aria-label="Suscripción al boletín"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                name="nombre"
                required
                aria-label="Tu nombre"
                placeholder={NEWSLETTER.placeholderName}
                className="w-full rounded-full border border-line bg-paper px-5 py-3 outline-none transition-colors focus:border-accent"
              />
              <input
                type="email"
                name="email"
                required
                aria-label="Tu correo"
                placeholder={NEWSLETTER.placeholderEmail}
                className="w-full rounded-full border border-line bg-paper px-5 py-3 outline-none transition-colors focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-accent px-6 py-3 font-semibold text-paper transition-colors hover:bg-accent-deep sm:w-auto"
            >
              {NEWSLETTER.cta}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer del sitio                                                           */
/* -------------------------------------------------------------------------- */
export function SiteFooter({
  brand,
  tagline,
  redes,
}: {
  brand: string;
  tagline: string;
  redes: SocialLinks;
}) {
  const socials = SOCIAL.filter((s) => redes[s.key]);

  return (
    <>
      <NewsletterBand />

      <footer className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            {/* Marca */}
            <div>
              <p className="font-display text-3xl font-semibold">{brand}</p>
              <p className="mt-2 max-w-xs text-paper/60">{tagline}</p>

              {socials.length > 0 ? (
                <ul className="mt-6 flex flex-wrap gap-3">
                  {socials.map(({ key, label, Icon }) => (
                    <li key={key}>
                      <a
                        href={redes[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-paper/20 text-paper/80 transition-colors hover:border-accent hover:bg-accent hover:text-paper"
                      >
                        <Icon className="size-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* Navegación */}
            <nav aria-label="Secciones">
              <p className="text-sm font-semibold uppercase tracking-widest text-paper/50">
                Explorar
              </p>
              <ul className="mt-4 space-y-2.5">
                {MAIN_SECTIONS.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={s.href}
                      className="text-paper/80 transition-colors hover:text-paper"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legales */}
            <nav aria-label="Legal">
              <p className="text-sm font-semibold uppercase tracking-widest text-paper/50">
                Legal
              </p>
              <ul className="mt-4 space-y-2.5">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-paper/80 transition-colors hover:text-paper"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Barra inferior: copyright + acceso discreto al panel */}
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-paper/15 pt-6 text-sm text-paper/50 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {brand}. Todos los derechos reservados.
            </p>
            <Link
              href="/panel"
              className="text-xs text-paper/30 transition-colors hover:text-paper/60"
            >
              Panel
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
