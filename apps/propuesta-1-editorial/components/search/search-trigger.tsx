'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';

const SearchDialog = dynamic(() => import('./search-dialog').then((m) => m.SearchDialog), {
  ssr: false,
});

/** ¿El usuario está escribiendo en algún campo? Entonces «/» es solo una barra. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

/**
 * Botón de búsqueda de la cabecera y atajos globales (Ctrl/⌘ + K y «/»).
 *
 * El diálogo se descarga aparte para no pesar en la carga inicial, pero se monta
 * en cuanto el navegador queda libre: así, al pulsar el botón se abre en el mismo
 * gesto y el teclado del móvil aparece de inmediato (iOS no lo abre si el foco
 * llega después de una espera).
 */
export function SearchTrigger() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [shortcut, setShortcut] = React.useState('Ctrl K');

  const show = React.useCallback(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  const hide = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut('⌘ K');

    const mount = () => setMounted(true);
    const idle =
      window.requestIdleCallback?.(mount, { timeout: 2500 }) ?? window.setTimeout(mount, 1500);
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(idle);
  }, []);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const combo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slash =
        event.key === '/' && !event.metaKey && !event.ctrlKey && !isTyping(event.target);
      if (!combo && !slash) return;
      event.preventDefault();
      show();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [show]);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          // Safari no enfoca los botones al hacer clic; el diálogo devuelve el foco aquí.
          event.currentTarget.focus();
          show();
        }}
        aria-label="Buscar en el sitio"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K /"
        className="text-paper/80 hover:text-paper inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-full transition-colors hover:bg-white/10 xl:h-10 xl:w-auto xl:bg-white/5 xl:pl-3.5 xl:pr-2"
      >
        <Search aria-hidden className="size-5 xl:size-4" />
        <span className="hidden text-sm font-medium xl:inline">Buscar</span>
        <kbd className="text-paper/70 hidden rounded-full bg-white/10 px-2 py-0.5 font-sans text-[11px] xl:inline">
          {shortcut}
        </kbd>
      </button>
      {mounted ? <SearchDialog open={open} onClose={hide} /> : null}
    </>
  );
}
