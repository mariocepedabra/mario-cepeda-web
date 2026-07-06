'use client';

import type { Book, Experience, NarinoProfile, Post, Project, Video } from '@mario/database';

import type { ListTable } from '../schemas';
import { formatDate, truncate } from '../lib/utils';
import {
  bookSchema,
  experienceSchema,
  narinoProfileSchema,
  postSchema,
  projectSchema,
  videoSchema,
} from '../schemas';
import { Badge } from '../ui';
import type { CrudConfig } from './crud-manager';

export const experiencesConfig: CrudConfig<Experience> = {
  table: 'experiences',
  title: 'Trayectoria',
  singular: 'experiencia',
  description: 'Hitos y experiencia profesional, ordenados por el campo «orden».',
  schema: experienceSchema,
  defaultValues: { titulo: '', organizacion: '', periodo: '', descripcion: '', orden: 0 },
  fields: [
    { name: 'titulo', label: 'Título / cargo', type: 'text', placeholder: 'Director General' },
    { name: 'organizacion', label: 'Organización', type: 'text' },
    { name: 'periodo', label: 'Periodo', type: 'text', placeholder: '2018 — Presente' },
    { name: 'orden', label: 'Orden', type: 'number', help: 'Menor = aparece antes.' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', full: true },
  ],
  columns: [
    { key: 'titulo', label: 'Título' },
    { key: 'organizacion', label: 'Organización' },
    { key: 'periodo', label: 'Periodo' },
    { key: 'orden', label: 'Orden', className: 'w-16' },
  ],
};

export const postsConfig: CrudConfig<Post> = {
  table: 'posts',
  title: 'Notas / Columnas',
  singular: 'nota',
  description: 'Artículos y columnas. Solo las publicadas se ven en el sitio.',
  schema: postSchema,
  defaultValues: {
    titulo: '',
    slug: '',
    autor: 'Mario Cepeda Bravo',
    categoria: '',
    bajada: '',
    resumen: '',
    contenido: '',
    portada_url: '',
    publicado: false,
    fecha: new Date().toISOString().slice(0, 10),
  },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text' },
    { name: 'slug', label: 'Slug', type: 'text', generateFrom: 'titulo', help: 'URL de la nota.' },
    {
      name: 'autor',
      label: 'Autor / firma',
      type: 'text',
      placeholder: 'Mario Cepeda Bravo',
      help: 'Si la nota habla ACERCA de Mario, usa «Lo que dicen de Mario».',
    },
    { name: 'categoria', label: 'Tema', type: 'text', placeholder: 'Medios, Región, Tecnología…' },
    { name: 'fecha', label: 'Fecha', type: 'date' },
    { name: 'publicado', label: 'Publicada', type: 'switch' },
    { name: 'portada_url', label: 'Portada (imagen o video, con opción GIF)', type: 'media', full: true },
    { name: 'bajada', label: 'Bajada (subtítulo)', type: 'textarea', full: true },
    { name: 'resumen', label: 'Resumen', type: 'textarea', full: true },
    { name: 'contenido', label: 'Contenido', type: 'richtext', full: true },
  ],
  columns: [
    { key: 'titulo', label: 'Título', render: (r) => truncate(r.titulo, 48) },
    { key: 'fecha', label: 'Fecha', render: (r) => formatDate(r.fecha) },
    {
      key: 'publicado',
      label: 'Estado',
      render: (r) =>
        r.publicado ? (
          <Badge variant="success">Publicada</Badge>
        ) : (
          <Badge variant="secondary">Borrador</Badge>
        ),
    },
  ],
};

export const videosConfig: CrudConfig<Video> = {
  table: 'videos',
  title: 'Multimedia · Videos',
  singular: 'video',
  description: 'Videos de YouTube/Vimeo, archivos subidos o elegidos de Medios.',
  schema: videoSchema,
  defaultValues: { titulo: '', url_embed: '', plataforma: 'youtube', descripcion: '', orden: 0 },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text' },
    {
      name: 'plataforma',
      label: 'Plataforma',
      type: 'select',
      options: [
        { value: 'youtube', label: 'YouTube' },
        { value: 'vimeo', label: 'Vimeo' },
        { value: 'otro', label: 'Subido / otro' },
      ],
    },
    {
      name: 'url_embed',
      label: 'Video o imagen (enlace, subida o galería)',
      type: 'media',
      full: true,
      help: 'Pega un enlace de YouTube/Vimeo, sube un archivo o elígelo de «Medios».',
    },
    { name: 'orden', label: 'Orden', type: 'number' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', full: true },
  ],
  columns: [
    { key: 'titulo', label: 'Título', render: (r) => truncate(r.titulo, 48) },
    { key: 'plataforma', label: 'Plataforma', render: (r) => <Badge variant="outline">{r.plataforma}</Badge> },
    { key: 'orden', label: 'Orden', className: 'w-16' },
  ],
};

export const projectsConfig: CrudConfig<Project> = {
  table: 'projects',
  title: 'Trabajo · Proyectos',
  singular: 'proyecto',
  description: 'Proyectos y hitos de la sección Trabajo, ordenados por «orden».',
  schema: projectSchema,
  defaultValues: { titulo: '', subtitulo: '', descripcion: '', imagen_url: '', url: '', orden: 0 },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text', placeholder: 'Página 10' },
    { name: 'subtitulo', label: 'Subtítulo', type: 'text', placeholder: 'Medio digital · Director' },
    { name: 'url', label: 'Enlace (URL)', type: 'url' },
    { name: 'orden', label: 'Orden', type: 'number', help: 'Menor = aparece antes.' },
    { name: 'imagen_url', label: 'Imagen o video (con opción GIF)', type: 'media', full: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', full: true },
  ],
  columns: [
    { key: 'titulo', label: 'Título', render: (r) => truncate(r.titulo, 48) },
    { key: 'subtitulo', label: 'Subtítulo' },
    { key: 'orden', label: 'Orden', className: 'w-16' },
  ],
};

export const booksConfig: CrudConfig<Book> = {
  table: 'books',
  title: 'Libros',
  singular: 'libro',
  description: 'Libros recomendados y reseñados.',
  schema: bookSchema,
  defaultValues: { titulo: '', autor: '', portada_url: '', valoracion: '', resena: '', lista: 'temporada', orden: 0 },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text' },
    { name: 'autor', label: 'Autor', type: 'text' },
    {
      name: 'lista',
      label: 'Lista',
      type: 'select',
      options: [
        { value: 'marcaron', label: 'Lecturas que me marcaron' },
        { value: 'temporada', label: 'Recomendados de la temporada' },
      ],
    },
    { name: 'valoracion', label: 'Valoración (1–5)', type: 'number', placeholder: '5' },
    { name: 'orden', label: 'Orden', type: 'number' },
    { name: 'portada_url', label: 'Portada (imagen o video, con opción GIF)', type: 'media', full: true },
    { name: 'resena', label: 'Reseña', type: 'textarea', full: true },
  ],
  columns: [
    { key: 'titulo', label: 'Título', render: (r) => truncate(r.titulo, 40) },
    { key: 'autor', label: 'Autor' },
    { key: 'lista', label: 'Lista', render: (r) => <Badge variant="secondary">{r.lista}</Badge> },
    { key: 'valoracion', label: '★', className: 'w-12' },
  ],
};

export const narinoConfig: CrudConfig<NarinoProfile> = {
  table: 'narino_profiles',
  title: 'Nariño · Perfiles',
  singular: 'perfil',
  description: 'Gente, lugares y tradiciones de Nariño.',
  schema: narinoProfileSchema,
  defaultValues: { nombre: '', slug: '', lugar: '', foto_url: '', historia: '', orden: 0 },
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text' },
    { name: 'slug', label: 'Slug', type: 'text', generateFrom: 'nombre', help: 'URL del perfil.' },
    { name: 'lugar', label: 'Lugar', type: 'text', placeholder: 'Pasto, Nariño' },
    { name: 'orden', label: 'Orden', type: 'number' },
    { name: 'foto_url', label: 'Foto o video (con opción GIF)', type: 'media', full: true },
    { name: 'historia', label: 'Historia', type: 'richtext', full: true },
  ],
  columns: [
    { key: 'nombre', label: 'Nombre', render: (r) => truncate(r.nombre, 40) },
    { key: 'lugar', label: 'Lugar' },
    { key: 'orden', label: 'Orden', className: 'w-16' },
  ],
};

/**
 * Registro de configuraciones por tabla. Lo consume `CrudManager` (cliente)
 * para evitar pasar funciones (`columns[].render`) a través del límite
 * servidor→cliente: las páginas server solo le pasan `table` + `rows`.
 */
type AnyConfig = CrudConfig<{ id: string }>;
const reg = <T extends { id: string }>(c: CrudConfig<T>): AnyConfig => c as unknown as AnyConfig;

export const crudConfigs: Record<ListTable, AnyConfig> = {
  experiences: reg(experiencesConfig),
  posts: reg(postsConfig),
  projects: reg(projectsConfig),
  books: reg(booksConfig),
  narino_profiles: reg(narinoConfig),
  videos: reg(videosConfig),
};
