import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { formatDate, LINK_CATEGORY_LABELS, toEmbed, truncate } from '@mario/core/lib';
import type {
  Award,
  Experience,
  Link as LinkRow,
  Post,
  Press,
  Profile,
  SocialLinks,
  Video,
} from '@mario/database';

import { ContactForm, Reveal } from './interactive';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Rótulos de categoría — son visuales (la BD no tiene categorías de notas). */
const CATEGORIES = ['Columna', 'Opinión', 'Análisis', 'Crónica', 'Entrevista', 'Reportaje'];
function categoryFor(index: number): string {
  return CATEGORIES[index % CATEGORIES.length];
}

function Eyebrow({ index, label }: { index: number; label?: string }) {
  const text = label ?? categoryFor(index);
  const alt = index % 2 === 1;
  return (
    <span
      className={`text-xs font-bold uppercase tracking-[0.14em] ${alt ? 'text-accent-2' : 'text-accent'}`}
    >
      {text}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-ink-soft">{children}</p>;
}

function SectionShell({
  id,
  eyebrow,
  title,
  action,
  soft,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
  soft?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${soft ? 'bg-bg-soft' : 'bg-bg'}`}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent">
                {eyebrow}
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {title}
              </h2>
            </div>
            {action ? (
              <Link
                href={action.href}
                className="inline-flex items-center gap-1.5 font-semibold text-accent transition-colors hover:text-accent-ink"
              >
                {action.label}
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tarjeta de nota (reutilizable)                                             */
/* -------------------------------------------------------------------------- */
export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <Link href={`/notas/${post.slug}`} className="group flex flex-col">
      <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-card bg-bg-soft">
        {post.portada_url ? (
          <Image
            src={post.portada_url}
            alt={`Portada de «${post.titulo}» (imagen de ejemplo)`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <Eyebrow index={index} />
      <h3 className="mt-2 font-display text-xl font-bold leading-snug text-ink transition-colors group-hover:text-accent">
        {post.titulo}
      </h3>
      {post.resumen ? (
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
          {truncate(post.resumen, 110)}
        </p>
      ) : null}
      <p className="mt-3 text-sm font-medium text-ink-soft">{formatDate(post.fecha)}</p>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero — historia destacada                                                  */
/* -------------------------------------------------------------------------- */
export function Hero({ profile, posts }: { profile: Profile; posts: Post[] }) {
  const featured = posts[0];
  const secondary = posts.slice(1, 3);

  return (
    <section id="inicio" className="bg-bg pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
          <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-accent">
            El blog de {profile.nombre.split(' ')[0]}
          </p>
          <p className="hidden text-sm font-medium text-ink-soft sm:block">Nariño · Colombia</p>
        </div>

        {featured ? (
          <Reveal>
            <Link
              href={`/notas/${featured.slug}`}
              className="group mt-8 grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
            >
              <div className="relative order-1 aspect-[16/11] overflow-hidden rounded-card bg-bg-soft lg:order-none">
                {featured.portada_url ? (
                  <Image
                    src={featured.portada_url}
                    alt={`Portada de «${featured.titulo}» (imagen de ejemplo)`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    priority
                  />
                ) : null}
                <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Destacado
                </span>
              </div>

              <div>
                <Eyebrow index={0} />
                <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-ink transition-colors group-hover:text-accent sm:text-5xl lg:text-6xl">
                  {featured.titulo}
                </h1>
                {featured.resumen ? (
                  <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
                    {truncate(featured.resumen, 180)}
                  </p>
                ) : null}
                <div className="mt-6 flex items-center gap-3 text-sm font-medium text-ink-soft">
                  <span>{formatDate(featured.fecha)}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
                    Leer la nota
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ) : (
          <div className="py-16 text-center">
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
              {profile.nombre}
            </h1>
            <p className="mt-4 text-xl text-ink-soft">{profile.titular}</p>
          </div>
        )}

        {secondary.length > 0 ? (
          <div className="mt-12 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
            {secondary.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.08}>
                <PostCard post={post} index={i + 1} />
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Intro personal — "Hola, soy Mario"                                         */
/* -------------------------------------------------------------------------- */
export function PersonalIntro({ profile }: { profile: Profile }) {
  const bio = profile.bio.replace(/^\[.*?\]\s*/, '');
  return (
    <section id="sobre-mi" className="scroll-mt-24 bg-bg-soft">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-14">
          <Reveal>
            <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-full shadow-xl ring-4 ring-bg sm:w-52 lg:w-60">
              {profile.foto_url ? (
                <Image
                  src={profile.foto_url}
                  alt={`Retrato de ${profile.nombre} (imagen de ejemplo)`}
                  fill
                  sizes="(max-width: 1024px) 60vw, 240px"
                  className="object-cover"
                />
              ) : null}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-accent">
                Hola, soy Mario
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
                {profile.titular}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
                {truncate(bio, 280)}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#notas"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-ink"
                >
                  Leer mis notas
                  <ArrowRight className="size-4" />
                </a>
                <a
                  href="#contacto"
                  className="inline-flex items-center rounded-full border border-ink/15 bg-bg px-6 py-3 font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  Escríbeme
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Lo último — grilla de notas                                                */
/* -------------------------------------------------------------------------- */
export function PostsPreview({ posts }: { posts: Post[] }) {
  return (
    <SectionShell
      id="notas"
      eyebrow="El archivo"
      title="Lo último"
      action={{ href: '/notas', label: 'Ver todas las notas' }}
    >
      {posts.length === 0 ? (
        <Empty>Próximamente nuevas columnas.</Empty>
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 0.08}>
              <PostCard post={post} index={i} />
            </Reveal>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trayectoria                                                                */
/* -------------------------------------------------------------------------- */
export function Timeline({ experiences }: { experiences: Experience[] }) {
  return (
    <SectionShell id="trayectoria" eyebrow="Trayectoria" title="Un recorrido por su carrera">
      {experiences.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.05}>
              <div className="grid gap-2 py-7 sm:grid-cols-[180px_1fr] sm:gap-10">
                <p className="font-display text-base font-bold text-accent">{exp.periodo}</p>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">{exp.titulo}</h3>
                  {exp.organizacion ? (
                    <p className="mt-0.5 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                      {exp.organizacion}
                    </p>
                  ) : null}
                  {exp.descripcion ? (
                    <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{exp.descripcion}</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reconocimientos — "by the numbers"                                         */
/* -------------------------------------------------------------------------- */
export function Awards({ awards }: { awards: Award[] }) {
  return (
    <SectionShell id="reconocimientos" eyebrow="Reconocimientos" title="Premios y distinciones" soft>
      {awards.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((award, i) => (
            <Reveal key={award.id} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-card border border-line bg-bg p-7">
                <p className="font-display text-5xl font-extrabold tracking-tight text-accent">
                  {award.anio ?? '—'}
                </p>
                <h3 className="mt-4 font-display text-lg font-bold leading-snug text-ink">
                  {award.titulo}
                </h3>
                {award.entidad ? (
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                    {award.entidad}
                  </p>
                ) : null}
                {award.descripcion ? (
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{award.descripcion}</p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Prensa                                                                     */
/* -------------------------------------------------------------------------- */
export function PressSection({ press }: { press: Press[] }) {
  return (
    <SectionShell id="prensa" eyebrow="En los medios" title="Prensa y menciones">
      {press.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {press.map((item) => (
            <Reveal key={item.id}>
              <a
                href={item.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid items-center gap-2 py-5 sm:grid-cols-[170px_1fr_auto] sm:gap-6"
              >
                <span className="text-sm font-bold uppercase tracking-wide text-accent">
                  {item.medio}
                </span>
                <span className="font-display text-lg font-bold text-ink transition-colors group-hover:text-accent">
                  {item.titulo}
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-ink-soft sm:justify-end">
                  {formatDate(item.fecha)}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Multimedia                                                                 */
/* -------------------------------------------------------------------------- */
export function Multimedia({ videos }: { videos: Video[] }) {
  return (
    <SectionShell id="multimedia" eyebrow="Multimedia" title="Video y entrevistas" soft>
      {videos.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {videos.map((video, i) => {
            const embed = toEmbed(video.url_embed);
            return (
              <Reveal key={video.id} delay={i * 0.08}>
                <div className="overflow-hidden rounded-card border border-line bg-bg">
                  <div className="relative aspect-video overflow-hidden">
                    <iframe
                      src={embed.url}
                      title={video.titulo}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 size-full"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-ink">{video.titulo}</h3>
                    {video.descripcion ? (
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{video.descripcion}</p>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Enlaces y recursos                                                         */
/* -------------------------------------------------------------------------- */
export function LinksSection({ links }: { links: LinkRow[] }) {
  const groups = ['proyecto', 'red_social', 'recurso'] as const;
  return (
    <SectionShell id="enlaces" eyebrow="Directorio" title="Enlaces y recursos">
      {links.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-10 md:grid-cols-3">
          {groups.map((group) => {
            const items = links.filter((l) => l.categoria === group);
            if (items.length === 0) return null;
            return (
              <Reveal key={group}>
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">
                    {LINK_CATEGORY_LABELS[group]}
                  </h3>
                  <ul className="space-y-1">
                    {items.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between border-b border-line py-2.5 font-semibold text-ink transition-colors hover:text-accent"
                        >
                          {link.titulo}
                          <ArrowUpRight className="size-4 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Franja "Insider" — CTA de contacto                                         */
/* -------------------------------------------------------------------------- */
export function InsiderBand({ profile }: { profile: Profile }) {
  return (
    <section id="contacto" className="scroll-mt-24 bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal>
          <div className="overflow-hidden rounded-[24px] bg-accent">
            <div className="grid lg:grid-cols-[0.9fr_1.4fr]">
              <div className="p-8 text-white sm:p-10 lg:p-12">
                <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white/80">
                  Hablemos
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                  ¿Tienes una idea, invitación o consulta?
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-white/85">
                  Escríbele a Mario directamente. Lee todos los mensajes y responde lo antes posible.
                </p>
              </div>
              <div className="bg-bg p-6 sm:p-8 lg:p-10">
                <ContactForm redes={profile.redes} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */
const FOOTER_SOCIALS: { key: keyof SocialLinks; label: string }[] = [
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'website', label: 'Sitio web' },
];

const FOOTER_NAV = [
  { id: 'notas', label: 'Notas' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'trayectoria', label: 'Trayectoria' },
  { id: 'prensa', label: 'Prensa' },
  { id: 'multimedia', label: 'Multimedia' },
  { id: 'reconocimientos', label: 'Reconocimientos' },
];

export function Footer({ profile }: { profile: Profile }) {
  const socials = FOOTER_SOCIALS.filter((s) => profile.redes[s.key]);
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-accent font-display text-sm font-extrabold text-white">
                MC
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">
                {profile.nombre}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{profile.titular}</p>
          </div>

          <nav aria-label="Secciones">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Navegación</h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_NAV.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm font-medium text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Sígueme</h3>
            <ul className="mt-4 space-y-2.5">
              {socials.length === 0 ? (
                <li className="text-sm text-white/60">Próximamente.</li>
              ) : (
                socials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={profile.redes[s.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-white/80 transition-colors hover:text-white"
                    >
                      {s.label}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">¿Conversamos?</h3>
            <a
              href="#contacto"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-white/90"
            >
              Contáctame
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-white/15 pt-6 text-sm text-white/55 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {profile.nombre}. Todos los derechos reservados.
          </p>
          <p>Sitio de demostración · contenido de ejemplo.</p>
        </div>
      </div>
    </footer>
  );
}
