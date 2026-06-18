'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowRight, Heart, Menu, X } from 'lucide-react';

import { submitContactMessage } from '@mario/core/actions';
import { PUBLIC_SECTIONS } from '@mario/core/lib';
import { contactSchema, type ContactInput } from '@mario/core/schemas';
import type { SocialLinks } from '@mario/database';

const NAV = PUBLIC_SECTIONS.filter((s) => s.id !== 'inicio');

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
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.7, delay, ease: [0.34, 1.3, 0.64, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Blob decorativo flotante. */
export function FloatingBlob({
  className,
  color,
  duration = 16,
}: {
  className?: string;
  color: string;
  duration?: number;
}) {
  return (
    <motion.div
      aria-hidden
      animate={{ y: [0, -22, 0], x: [0, 14, 0], rotate: [0, 8, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={`blob pointer-events-none absolute blur-2xl ${className ?? ''}`}
      style={{ backgroundColor: color }}
    />
  );
}

export function Navbar({ name }: { name: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-line bg-cream/90 px-5 py-3 shadow-sm backdrop-blur">
        <a href="#inicio" className="font-display text-lg font-bold tracking-tight text-ink">
          {name}
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.slice(0, 6).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm font-semibold text-muted transition-colors hover:text-terra"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#contacto"
          className="hidden rounded-full bg-terra px-5 py-2 text-sm font-bold text-white transition-transform hover:scale-105 md:inline-block"
        >
          Hablemos
        </a>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-ink md:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-5xl overflow-hidden rounded-3xl border border-line bg-cream p-2 shadow-lg md:hidden"
          >
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-muted transition-colors hover:bg-cream-2 hover:text-terra"
              >
                {item.label}
              </a>
            ))}
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
    'w-full rounded-2xl border-2 border-line bg-cream px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-terra';

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-[2rem] border border-line bg-white/60 p-6 shadow-sm sm:p-8"
        noValidate
      >
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-bold text-ink">
            Nombre
          </label>
          <input id="nombre" {...register('nombre')} className={field} placeholder="Tu nombre" />
          {errors.nombre ? (
            <p className="mt-1 text-sm font-semibold text-terra">{errors.nombre.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-ink">
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
            <p className="mt-1 text-sm font-semibold text-terra">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="mensaje" className="mb-1.5 block text-sm font-bold text-ink">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            rows={4}
            {...register('mensaje')}
            className={`${field} resize-none`}
            placeholder="Cuéntame en qué puedo ayudarte"
          />
          {errors.mensaje ? (
            <p className="mt-1 text-sm font-semibold text-terra">{errors.mensaje.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group inline-flex items-center gap-2 rounded-full bg-terra px-7 py-3 font-bold text-white transition-transform hover:scale-105 disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>

        {status === 'ok' ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-sage" role="status">
            <Heart className="size-4 fill-sage" /> ¡Gracias! Tu mensaje fue enviado.
          </p>
        ) : null}
        {status === 'demo' ? (
          <p className="text-sm text-muted" role="status">
            Modo demostración: el mensaje no se guarda hasta configurar Supabase.
          </p>
        ) : null}
      </form>

      <div className="rounded-[2rem] border border-line bg-cream-2 p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold text-ink">Conectemos</h3>
        <ul className="mt-4 space-y-2">
          {socialLinks.length === 0 ? (
            <li className="text-sm text-muted">Próximamente.</li>
          ) : (
            socialLinks.map((s) => (
              <li key={s.key}>
                <a
                  href={redes[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 font-semibold transition-colors hover:bg-white hover:text-terra"
                >
                  {s.label}
                  <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-terra" />
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
