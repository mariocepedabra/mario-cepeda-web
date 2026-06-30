'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Registra (de forma anónima) las notas/secciones que visita un suscriptor del
 * boletín. Solo actúa si existe la cookie pública `mc_sub_on` (la pone la acción
 * de suscripción); el token real va en una cookie httpOnly que lee el servidor.
 * Así no molestamos al resto de visitantes ni exponemos ningún identificador.
 */
export function NewsletterTracker() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const isSubscriber = document.cookie.split('; ').some((c) => c.startsWith('mc_sub_on='));
    if (!isSubscriber) return;

    // Evita registrar las rutas del panel de administración.
    if (pathname.startsWith('/admin') || pathname.startsWith('/panel')) return;

    const payload = JSON.stringify({ path: pathname, title: document.title });
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* best-effort */
    }
  }, [pathname]);

  return null;
}
