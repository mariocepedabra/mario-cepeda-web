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
  getSubscribers,
  getVideosAdmin,
  hasResendApiKey,
} from '@mario/database/queries';

import { parseMosaic, parseSectionMedia } from '../lib';
import { AdminShell } from './admin-shell';
import { ContentForm } from './content-form';
import { CrudManager } from './crud-manager';
import { Dashboard } from './dashboard';
import { LoginForm } from './login-form';
import { MediaManager } from './media-manager';
import { MessagesInbox } from './messages-inbox';
import { MosaicManager } from './mosaic-manager';
import { NewsletterManager } from './newsletter-manager';
import { PerfilProfesionalManager } from './perfil-profesional-manager';
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
  const [stats, settings] = await Promise.all([getDashboardStats(), getSettings()]);
  return <Dashboard stats={stats} sectionMedia={parseSectionMedia(settings)} />;
}

export async function NewsletterPage() {
  const [settings, subscribers, hasKey] = await Promise.all([
    getSettings(),
    getSubscribers(),
    hasResendApiKey(),
  ]);
  return (
    <div>
      <PageTitle
        title="Boletín"
        description="Configura el envío de correos con Resend y gestiona tus suscriptores."
      />
      <NewsletterManager
        settings={{ ...settings, __hasKey: hasKey ? '1' : '0' }}
        subscribers={subscribers}
      />
    </div>
  );
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
  const [rows, settings] = await Promise.all([getPostsAdmin(), getSettings()]);
  return (
    <div className="space-y-10">
      <CrudManager table="posts" rows={rows} />
      <MosaicManager
        section="pensamiento"
        initial={parseMosaic(settings, 'pensamiento')}
        sectionName="Pensamiento"
        belowName="Ensayos, columnas e ideas"
      />
    </div>
  );
}

export async function ProjectsPage() {
  const [rows, settings] = await Promise.all([getProjectsAdmin(), getSettings()]);
  return (
    <div className="space-y-10">
      <CrudManager table="projects" rows={rows} />
      <MosaicManager
        section="trabajo"
        initial={parseMosaic(settings, 'trabajo')}
        sectionName="Trabajo"
        belowName="Trayectoria"
      />
    </div>
  );
}

export async function BooksPage() {
  const [rows, settings] = await Promise.all([getBooksAdmin(), getSettings()]);
  return (
    <div className="space-y-10">
      <CrudManager table="books" rows={rows} />
      <MosaicManager
        section="libros"
        initial={parseMosaic(settings, 'libros')}
        sectionName="Libros — videos"
        belowName="las reseñas de libros (se intercalan en el mismo mosaico, en este orden)"
      />
    </div>
  );
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

export async function PerfilProfesionalPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-10">
      <div>
        <PageTitle
          title="Perfil Profesional"
          description="Cabecera y media de la página «Perfil profesional». Las listas (formación, experiencia, reconocimientos…) están curadas en la web."
        />
        <PerfilProfesionalManager initial={settings} />
      </div>
      <MosaicManager
        section="perfil"
        initial={parseMosaic(settings, 'perfil')}
        sectionName="Perfil profesional"
        belowName="No todo puede ser perfecto, pero sí Positivo"
      />
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
