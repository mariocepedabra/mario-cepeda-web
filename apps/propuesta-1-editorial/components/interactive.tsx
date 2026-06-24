'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Menu, X } from 'lucide-react';

import { submitContactMessage } from '@mario/core/actions';
import { PUBLIC_SECTIONS } from '@mario/core/lib';
import { contactSchema, type ContactInput } from '@mario/core/schemas';
import type { SocialLinks } from '@mario/database';

const NAV = PUBLIC_SECTIONS.filter((s) => s.id !== 'inicio');

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
  const reduceMotion = useReducedMotion();

  // Sin animación si el usuario prefiere movimiento reducido.
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
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
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? 'border-line bg-paper/95 backdrop-blur' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#inicio" className="font-display text-xl font-semibold tracking-tight">
          {name}
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#contacto"
          className="hidden rounded-card bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent lg:inline-block"
        >
          Contacto
        </a>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden"
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
            className="overflow-hidden border-t border-line bg-paper lg:hidden"
          >
            <div className="flex flex-col px-5 py-3">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="border-b border-line/60 py-3 text-sm font-medium text-ink-soft last:border-0"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Formulario de contacto                                                     */
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

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium">
            Nombre
          </label>
          <input
            id="nombre"
            {...register('nombre')}
            className="w-full border-b-2 border-line bg-transparent py-2 text-lg outline-none transition-colors focus:border-accent"
            placeholder="Tu nombre"
          />
          {errors.nombre ? <p className="mt-1 text-sm text-accent">{errors.nombre.message}</p> : null}
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Correo
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full border-b-2 border-line bg-transparent py-2 text-lg outline-none transition-colors focus:border-accent"
            placeholder="tucorreo@ejemplo.com"
          />
          {errors.email ? <p className="mt-1 text-sm text-accent">{errors.email.message}</p> : null}
        </div>
        <div>
          <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            rows={4}
            {...register('mensaje')}
            className="w-full resize-none border-b-2 border-line bg-transparent py-2 text-lg outline-none transition-colors focus:border-accent"
            placeholder="¿En qué podemos ayudarte?"
          />
          {errors.mensaje ? (
            <p className="mt-1 text-sm text-accent">{errors.mensaje.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-card bg-ink px-7 py-3 font-medium text-paper transition-colors hover:bg-accent disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
        </button>

        {status === 'ok' ? (
          <p className="text-sm font-medium text-accent" role="status">
            ¡Gracias! Tu mensaje fue enviado correctamente.
          </p>
        ) : null}
        {status === 'demo' ? (
          <p className="text-sm text-ink-soft" role="status">
            Modo demostración: el mensaje no se guarda hasta configurar Supabase.
          </p>
        ) : null}
      </form>

      <div className="border-t-2 border-ink pt-6 lg:border-l-2 lg:border-t-0 lg:pl-10 lg:pt-0">
        <h3 className="font-display text-2xl font-semibold">Sígueme</h3>
        <ul className="mt-5 space-y-3">
          {socialLinks.length === 0 ? (
            <li className="text-sm text-ink-soft">Próximamente.</li>
          ) : (
            socialLinks.map((s) => (
              <li key={s.key}>
                <a
                  href={redes[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border-b border-line py-2 text-lg transition-colors hover:text-accent"
                >
                  {s.label}
                  <span aria-hidden className="text-ink-soft transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
