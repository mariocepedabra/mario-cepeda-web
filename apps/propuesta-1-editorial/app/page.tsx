import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { MAIN_SECTIONS, truncate } from '@mario/core/lib';
import { placeholderImage } from '@mario/database';
import { getProfile } from '@mario/database/queries';

import { Reveal } from '@/components/interactive';

export default async function HomePage() {
  const profile = await getProfile();
  const bio = profile.bio.replace(/^\[.*?\]\s*/, '');

  return (
    <main>
      {/* ---------------------------------------------------------------- */}
      {/*  Hero inmersivo                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-28 sm:px-8 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
              Sitio personal · Nariño, Colombia
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">
              Ideas que mueven a <span className="mark-highlight">Nariño</span> y al
              mundo
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              {truncate(bio, 220)}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/pensamiento"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-paper transition-colors hover:bg-accent"
              >
                Explorar Pensamiento
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#newsletter"
                className="inline-flex items-center gap-2 rounded-full border border-ink px-7 py-3.5 font-semibold transition-colors hover:bg-ink hover:text-paper"
              >
                Suscríbete
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-paper-2 shadow-lift">
              {profile.foto_url ? (
                <Image
                  src={profile.foto_url}
                  alt={`Retrato de ${profile.nombre} (imagen de ejemplo)`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              {profile.titular}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Accesos a las 4 secciones principales                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-line py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Explora el sitio
            </h2>
            <p className="mt-3 max-w-xl text-lg text-ink-soft">
              Cuatro miradas a su trabajo, sus ideas, sus lecturas y su tierra.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {MAIN_SECTIONS.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <Link
                  href={s.href}
                  className="group block overflow-hidden rounded-card border border-line bg-paper shadow-soft transition-shadow hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-paper-2">
                    <Image
                      src={placeholderImage(`seccion-${s.id}`, 1200, 750)}
                      alt={`${s.label} (imagen de ejemplo)`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4 p-6 sm:p-8">
                    <div>
                      <h3 className="font-display text-2xl font-semibold group-hover:text-accent">
                        {s.label}
                      </h3>
                      <p className="mt-2 max-w-sm leading-relaxed text-ink-soft">
                        {s.blurb}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 size-6 shrink-0 text-ink-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
