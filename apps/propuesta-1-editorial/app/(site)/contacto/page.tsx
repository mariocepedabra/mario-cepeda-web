import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

import { ContactForm } from '@/components/contact-form';
import { Reveal } from '@/components/interactive';

export const metadata: Metadata = {
  title: 'Hablemos',
  description:
    'Escríbele a Mario Cepeda: propuestas, colaboraciones, columnas o cualquier idea que quieras compartir.',
};

export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Hablemos</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] sm:text-6xl">
            Escríbele a Mario
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            ¿Una propuesta, una colaboración, una columna o una idea para la región? Déjale un
            mensaje y te responderá directamente a tu correo.
          </p>
        </header>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Contexto */}
        <Reveal>
          <div className="space-y-8">
            <Feature
              icon={MessageCircle}
              title="Conversemos"
              text="Medios, región, política pública, docencia o proyectos: cuéntale en qué estás pensando."
            />
            <Feature
              icon={Mail}
              title="Respuesta directa"
              text="Tu mensaje llega al correo de Mario y él te responde a la dirección que dejes."
            />
            <Feature
              icon={MapPin}
              title="Desde Nariño"
              text="Pasto, Nariño · Colombia. Con la mirada puesta en el territorio y sus ideas."
            />
          </div>
        </Reveal>

        {/* Formulario */}
        <Reveal delay={0.08}>
          <ContactForm />
        </Reveal>
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-1 leading-relaxed text-ink-soft">{text}</p>
      </div>
    </div>
  );
}
