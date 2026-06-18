import { AlertTriangle } from 'lucide-react';

/** Banner superior cuando Supabase no está configurado (modo demo). */
export function ConfigBanner() {
  return (
    <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p>
        <strong>Modo demostración:</strong> Supabase no está configurado. El panel muestra datos de
        ejemplo y las operaciones de guardado están desactivadas. Configura las variables de entorno
        para activarlo.
      </p>
    </div>
  );
}

/** Aviso a pantalla parcial para funciones que requieren Supabase. */
export function ConfigNotice({ feature }: { feature: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="size-5" />
        {feature} requiere Supabase
      </div>
      <p className="mt-2 text-sm">
        Configura <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
        <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> y vuelve a
        intentarlo. Consulta el README para los pasos completos.
      </p>
    </div>
  );
}
