'use client';

import { Toaster as SonnerToaster } from 'sonner';

export { toast } from 'sonner';

/** Toaster preconfigurado para el panel admin. */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{ className: 'text-sm' }}
    />
  );
}
