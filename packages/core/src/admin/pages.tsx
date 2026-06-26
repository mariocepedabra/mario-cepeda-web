/**
 * Componentes de página del admin (Server Components).
 *
 * Cada app expone sus rutas `/admin/**` re-exportando estos componentes,
 * de modo que la lógica del panel se escribe una sola vez.
 */

import * as React from 'react';

import {
  getBooksAdmin,
  getContactMessages,
  getDashboardStats,
  getExperiencesAdmin,
  getMedia,
  getNarinoProfilesAdmin,
  getPostsAdmin,
  getProfile,
  getProjectsAdmin,
  getSettings,
  getVideosAdmin,
} from '@mario/database/queries';

import { AdminShell } from './admin-shell';
import { ContentForm } from './content-form';
import { CrudManager } from './crud-manager';
import { Dashboard } from './dashboard';
import { LoginForm } from './login-form';
import { MediaManager } from './media-manager';
import { MessagesInbox } from './messages-inbox';
import { ProfileForm } from './profile-form';
import { SeoForm } from './seo-form';

function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      {description ? <p className="text-sm text-zinc-500">{description}</p> : null}
    </div>
  );
}

/** Layout del panel (envuelve las páginas autenticadas con el AdminShell). */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

export async function DashboardPage() {
  const stats = await getDashboardStats();
  return <Dashboard stats={stats} />;
}

export async function ProfilePage() {
  const profile = await getProfile();
  return (
    <div>
      <PageTitle title="Perfil / Biografía" description="Datos que encabezan el sitio." />
      <ProfileForm initial={profile} />
    </div>
  );
}

export async function ExperiencesPage() {
  const rows = await getExperiencesAdmin();
  return <CrudManager table="experiences" rows={rows} />;
}

export async function PostsPage() {
  const rows = await getPostsAdmin();
  return <CrudManager table="posts" rows={rows} />;
}

export async function ProjectsPage() {
  const rows = await getProjectsAdmin();
  return <CrudManager table="projects" rows={rows} />;
}

export async function BooksPage() {
  const rows = await getBooksAdmin();
  return <CrudManager table="books" rows={rows} />;
}

export async function NarinoProfilesPage() {
  const rows = await getNarinoProfilesAdmin();
  return <CrudManager table="narino_profiles" rows={rows} />;
}

export async function VideosPage() {
  const rows = await getVideosAdmin();
  return <CrudManager table="videos" rows={rows} />;
}

export async function MessagesPage() {
  const messages = await getContactMessages();
  return (
    <div>
      <PageTitle title="Bandeja de mensajes" description="Formulario de contacto del sitio." />
      <MessagesInbox messages={messages} />
    </div>
  );
}

export async function MediaPage() {
  const media = await getMedia();
  return <MediaManager media={media} />;
}

export async function ContentPage() {
  const settings = await getSettings();
  return (
    <div>
      <PageTitle
        title="Textos del sitio"
        description="Edita los textos editoriales de la web pública. Si dejas un campo vacío, se usa el texto por defecto."
      />
      <ContentForm initial={settings} />
    </div>
  );
}

export async function SeoPage() {
  const settings = await getSettings();
  return (
    <div>
      <PageTitle title="Ajustes SEO / Open Graph" />
      <SeoForm initial={settings} />
    </div>
  );
}

export function LoginPage() {
  return <LoginForm />;
}
