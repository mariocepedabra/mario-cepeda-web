'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowUpRight, Menu, X } from 'lucide-react';

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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Navbar({ name }: { name: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6 lg:px-10">
        <a href="#inicio" className="text-sm font-semibold tracking-tight">
          {name}
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
            >
              <span className="font-mono text-xs text-line transition-colors group-hover:text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden"
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
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="flex flex-col px-6 py-2">
              {NAV.map((item, i) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-line py-3 text-sm text-muted last:border-0"
                >
                  <span className="font-mono text-xs text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
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
    'w-full rounded-none border-0 border-b border-line bg-transparent py-3 text-base outline-none transition-colors focus:border-accent';

  return (
    <div className="grid gap-12 md:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div>
          <label htmlFor="nombre" className="font-mono text-xs uppercase tracking-widest text-muted">
            Nombre
          </label>
          <input id="nombre" {...register('nombre')} className={field} placeholder="Tu nombre" />
          {errors.nombre ? (
            <p className="mt-1 text-sm text-accent">{errors.nombre.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-muted">
            Correo
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={field}
            placeholder="tucorreo@ejemplo.com"
          />
          {errors.email ? <p className="mt-1 text-sm text-accent">{errors.email.message}</p> : null}
        </div>
        <div>
          <label htmlFor="mensaje" className="font-mono text-xs uppercase tracking-widest text-muted">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            rows={3}
            {...register('mensaje')}
            className={`${field} resize-none`}
            placeholder="¿En qué podemos ayudarte?"
          />
          {errors.mensaje ? (
            <p className="mt-1 text-sm text-accent">{errors.mensaje.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group inline-flex items-center gap-2 bg-fg px-6 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        {status === 'ok' ? (
          <p className="text-sm font-medium text-accent" role="status">
            ¡Gracias! Tu mensaje fue enviado correctamente.
          </p>
        ) : null}
        {status === 'demo' ? (
          <p className="text-sm text-muted" role="status">
            Modo demostración: el mensaje no se guarda hasta configurar Supabase.
          </p>
        ) : null}
      </form>

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Redes</p>
        <ul className="mt-4">
          {socialLinks.length === 0 ? (
            <li className="text-sm text-muted">Próximamente.</li>
          ) : (
            socialLinks.map((s) => (
              <li key={s.key}>
                <a
                  href={redes[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border-b border-line py-3 text-base transition-colors hover:text-accent"
                >
                  {s.label}
                  <ArrowUpRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
