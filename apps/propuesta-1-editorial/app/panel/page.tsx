import { redirect } from 'next/navigation';

/**
 * Acceso discreto al panel de administración.
 * Por ahora redirige al login del admin existente; en la fase de
 * Auth + Panel, `/panel` pasará a ser el login propio del administrador.
 */
export default function PanelPage() {
  redirect('/admin/login');
}
