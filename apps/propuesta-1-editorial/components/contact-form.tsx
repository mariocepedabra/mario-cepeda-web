'use client';

import * as React from 'react';
import { Send } from 'lucide-react';

import { submitContactMessage } from '@mario/core/actions';

/* -------------------------------------------------------------------------- */
/*  Formulario de contacto («Hablemos»).                                       */
/*  Envía el mensaje a Mario por correo (vía Resend, configurado en el panel)   */
/*  y lo guarda en «Mensajes». Estilo editorial, coherente con el resto.        */
/* -------------------------------------------------------------------------- */
const inputClass =
  'w-full rounded-2xl border border-line bg-paper px-5 py-3.5 text-ink outline-none transition-colors focus:border-accent';

export function ContactForm() {
  const [done, setDone] = React.useState(false);
  const [demo, setDemo] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      nombre: String(data.get('nombre') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      telefono: String(data.get('telefono') ?? '').trim(),
      asunto: String(data.get('asunto') ?? '').trim(),
      mensaje: String(data.get('mensaje') ?? '').trim(),
    };

    setPending(true);
    const res = await submitContactMessage(payload);
    setPending(false);

    if (res.ok) {
      setDemo(Boolean(res.demo));
      setDone(true);
      form.reset();
    } else {
      setError(res.error);
    }
  };

  if (done) {
    return (
      <div
        role="status"
        className="rounded-card border border-line bg-paper p-8 shadow-soft"
      >
        <p className="font-display text-2xl font-semibold text-ink">¡Mensaje enviado!</p>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          Gracias por escribir. Mario leerá tu mensaje y te responderá al correo que dejaste.
          {demo
            ? ' (Modo demostración: conecta Supabase y Resend para el envío real.)'
            : ''}
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-2"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Formulario de contacto">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c_nombre" className="mb-1.5 block text-sm font-semibold text-ink">
            Nombre <span className="text-accent">*</span>
          </label>
          <input id="c_nombre" name="nombre" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="c_email" className="mb-1.5 block text-sm font-semibold text-ink">
            Correo <span className="text-accent">*</span>
          </label>
          <input id="c_email" name="email" type="email" required className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c_telefono" className="mb-1.5 block text-sm font-semibold text-ink">
            Teléfono <span className="text-ink-muted">(opcional)</span>
          </label>
          <input id="c_telefono" name="telefono" type="tel" className={inputClass} />
        </div>
        <div>
          <label htmlFor="c_asunto" className="mb-1.5 block text-sm font-semibold text-ink">
            Asunto <span className="text-ink-muted">(opcional)</span>
          </label>
          <input id="c_asunto" name="asunto" type="text" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="c_mensaje" className="mb-1.5 block text-sm font-semibold text-ink">
          Mensaje <span className="text-accent">*</span>
        </label>
        <textarea
          id="c_mensaje"
          name="mensaje"
          required
          rows={6}
          className={`${inputClass} resize-y`}
          placeholder="Cuéntale a Mario en qué le puedes ayudar o qué te gustaría proponerle."
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold text-paper transition-colors hover:bg-accent-deep disabled:opacity-60"
      >
        <Send className="size-4" />
        {pending ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
