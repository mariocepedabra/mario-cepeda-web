'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowUpRight, Menu, X } from 'lucide-react';

import { submitContactMessage } from '@mario/core/actions';
import { PUBLIC_SECTIONS } from '@mario/core/lib';
import { contactSchema, type ContactInput } from '@mario/core/schemas';
import type { SocialLinks } from '@mario/database';

const NAV = PUBLIC_SECTIONS.filter((s) => s.id !== 'inicio');

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-accent to-accent-2"
    />
  );
}

export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-40 -top-40 size-[40rem] rounded-full bg-accent/25 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-40 top-10 size-[36rem] rounded-full bg-accent-2/20 blur-[120px]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--color-bg)_78%)]" />
    </div>
  );
}

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
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#inicio" className="font-display text-lg font-semibold tracking-tight">
          {name}
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#contacto"
          className="hidden rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2 text-sm font-medium text-[#0b0b16] transition-opacity hover:opacity-90 lg:inline-block"
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
            className="glass overflow-hidden lg:hidden"
          >
            <div className="flex flex-col px-5 py-2">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="border-b border-line py-3 text-sm text-muted last:border-0"
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
  const field =
    'w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-base text-fg outline-none transition-colors placeholder:text-muted/70 focus:border-accent';

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-5 rounded-2xl p-6 sm:p-8" noValidate>
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm text-muted">
            Nombre
          </label>
          <input id="nombre" {...register('nombre')} className={field} placeholder="Tu nombre" />
          {errors.nombre ? (
            <p className="mt-1 text-sm text-accent-2">{errors.nombre.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
            Correo
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={field}
            placeholder="tucorreo@ejemplo.com"
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-accent-2">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="mensaje" className="mb-1.5 block text-sm text-muted">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            rows={4}
            {...register('mensaje')}
            className={`${field} resize-none`}
            placeholder="¿En qué podemos ayudarte?"
          />
          {errors.mensaje ? (
            <p className="mt-1 text-sm text-accent-2">{errors.mensaje.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-accent to-accent-2 px-7 py-3 font-medium text-[#0b0b16] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
        </button>

        {status === 'ok' ? (
          <p className="text-sm font-medium text-accent-2" role="status">
            ¡Gracias! Tu mensaje fue enviado correctamente.
          </p>
        ) : null}
        {status === 'demo' ? (
          <p className="text-sm text-muted" role="status">
            Modo demostración: el mensaje no se guarda hasta configurar Supabase.
          </p>
        ) : null}
      </form>

      <div className="glass rounded-2xl p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold">Redes</h3>
        <ul className="mt-4 space-y-1">
          {socialLinks.length === 0 ? (
            <li className="text-sm text-muted">Próximamente.</li>
          ) : (
            socialLinks.map((s) => (
              <li key={s.key}>
                <a
                  href={redes[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border-b border-line py-3 transition-colors hover:text-accent-2"
                >
                  {s.label}
                  <ArrowUpRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-2" />
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
