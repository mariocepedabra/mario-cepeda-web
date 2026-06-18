/**
 * Componentes de página del admin (Server Components).
 *
 * Cada app expone sus rutas `/admin/**` re-exportando estos componentes,
 * de modo que la lógica del panel se escribe una sola vez.
 */

import * as React from 'react';

import {
  getAwards,
  getContactMessages,
  getDashboardStats,
  getExperiences,
  getLinks,
  getMedia,
  getPostsAdmin,
  getPress,
  getProfile,
  getSettings,
  getVideos,
} from '@mario/database/queries';

import { AdminShell } from './admin-shell';
import { CrudManager } from './crud-manager';
import { Dashboard } from './dashboard';
import { LoginForm } from './login-form';
import { MediaManager } from './media-manager';
import { MessagesInbox } from './messages-inbox';
import { ProfileForm } from './profile-form';
import {
  awardsConfig,
  experiencesConfig,
  linksConfig,
  postsConfig,
  pressConfig,
  videosConfig,
} from './resources';
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
  const rows = await getExperiences();
  return <CrudManager config={experiencesConfig} rows={rows} />;
}

export async function PostsPage() {
  const rows = await getPostsAdmin();
  return <CrudManager config={postsConfig} rows={rows} />;
}

export async function PressPage() {
  const rows = await getPress();
  return <CrudManager config={pressConfig} rows={rows} />;
}

export async function VideosPage() {
  const rows = await getVideos();
  return <CrudManager config={videosConfig} rows={rows} />;
}

export async function LinksPage() {
  const rows = await getLinks();
  return <CrudManager config={linksConfig} rows={rows} />;
}

export async function AwardsPage() {
  const rows = await getAwards();
  return <CrudManager config={awardsConfig} rows={rows} />;
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
