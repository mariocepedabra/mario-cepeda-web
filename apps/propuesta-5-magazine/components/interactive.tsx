'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowRight, Menu, X } from 'lucide-react';

import { submitContactMessage } from '@mario/core/actions';
import { contactSchema, type ContactInput } from '@mario/core/schemas';
import type { SocialLinks } from '@mario/database';

/** Enlaces del menú superior (anclas que existen en la home). */
const NAV = [
  { id: 'notas', label: 'Notas' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'trayectoria', label: 'Trayectoria' },
  { id: 'prensa', label: 'Prensa' },
  { id: 'multimedia', label: 'Multimedia' },
];

/* -------------------------------------------------------------------------- */
/*  Monograma "MC" — guiño al logotipo de Gates Notes                          */
/* -------------------------------------------------------------------------- */
export function Monogram({ className = '' }: { className?: string }) {
  return (
    <span
      className={`grid size-9 place-items-center rounded-lg bg-accent font-display text-sm font-extrabold tracking-tight text-white ${className}`}
      aria-hidden
    >
      MC
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reveal: animación de entrada al hacer scroll                               */
/* -------------------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                     */
/* -------------------------------------------------------------------------- */
export function Navbar({ name }: { name: string }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-bg/90 backdrop-blur transition-shadow duration-300 ${
        scrolled ? 'border-b border-line shadow-[0_1px_0_rgba(0,0,0,0.02)]' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#inicio" className="flex items-center gap-2.5">
          <Monogram />
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">{name}</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-[0.95rem] font-semibold text-ink-soft transition-colors hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#contacto"
          className="hidden items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-ink lg:inline-flex"
        >
          Contacto
          <ArrowRight className="size-4" />
        </a>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-ink lg:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line bg-bg lg:hidden"
          >
            <div className="flex flex-col px-5 py-2">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="border-b border-line/70 py-3 font-semibold text-ink-soft last:border-0"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={() => setOpen(false)}
                className="mt-3 mb-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-semibold text-white"
              >
                Contacto
                <ArrowRight className="size-4" />
              </a>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Formulario de contacto (dentro de la franja "Insider")                     */
/* -------------------------------------------------------------------------- */
const SOCIALS: { key: keyof SocialLinks; label: string }[] = [
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'website', label: 'Sitio web' },
];

export function ContactForm({ redes }: { redes: SocialLinks }) {
  const [status, setStatus] = React.useState<'idle' | 'ok' | 'demo'>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactInput) => {
    const res = await submitContactMessage(values);
    if (res.ok) {
      setStatus(res.demo ? 'demo' : 'ok');
      reset();
    }
  };

  const socialLinks = SOCIALS.filter((s) => redes[s.key]);
  const inputCls =
    'w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-accent focus:ring-4 focus:ring-accent/10';

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="mb-1.5 block text-sm font-semibold text-ink">
              Nombre
            </label>
            <input id="nombre" {...register('nombre')} className={inputCls} placeholder="Tu nombre" />
            {errors.nombre ? (
              <p className="mt-1 text-sm text-accent-2">{errors.nombre.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
              Correo
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={inputCls}
              placeholder="tucorreo@ejemplo.com"
            />
            {errors.email ? <p className="mt-1 text-sm text-accent-2">{errors.email.message}</p> : null}
          </div>
        </div>
        <div>
          <label htmlFor="mensaje" className="mb-1.5 block text-sm font-semibold text-ink">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            rows={4}
            {...register('mensaje')}
            className={`${inputCls} resize-none`}
            placeholder="¿En qué podemos ayudarte?"
          />
          {errors.mensaje ? (
            <p className="mt-1 text-sm text-accent-2">{errors.mensaje.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 font-semibold text-white transition-colors hover:bg-accent-ink disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
          <ArrowRight className="size-4" />
        </button>

        {status === 'ok' ? (
          <p className="text-sm font-semibold text-accent" role="status">
            ¡Gracias! Tu mensaje fue enviado correctamente.
          </p>
        ) : null}
        {status === 'demo' ? (
          <p className="text-sm text-ink-soft" role="status">
            Modo demostración: el mensaje no se guarda hasta configurar Supabase.
          </p>
        ) : null}
      </form>

      <div className="rounded-card border border-line bg-bg-soft p-6">
        <h3 className="font-display text-xl font-bold text-ink">Sígueme</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Mantente al día con las columnas y proyectos de Mario.
        </p>
        <ul className="mt-5 space-y-1">
          {socialLinks.length === 0 ? (
            <li className="text-sm text-ink-soft">Próximamente.</li>
          ) : (
            socialLinks.map((s) => (
              <li key={s.key}>
                <a
                  href={redes[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border-b border-line py-2.5 font-semibold text-ink transition-colors last:border-0 hover:text-accent"
                >
                  {s.label}
                  <ArrowRight className="size-4 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
