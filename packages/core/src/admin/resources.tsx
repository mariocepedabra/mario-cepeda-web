import type { Award, Experience, Link, Post, Press, Video } from '@mario/database';

import { formatDate, truncate } from '../lib/utils';
import {
  awardSchema,
  experienceSchema,
  linkSchema,
  postSchema,
  pressSchema,
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
    resumen: '',
    contenido: '',
    portada_url: '',
    publicado: false,
    fecha: new Date().toISOString().slice(0, 10),
  },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text' },
    { name: 'slug', label: 'Slug', type: 'text', generateFrom: 'titulo', help: 'URL de la nota.' },
    { name: 'fecha', label: 'Fecha', type: 'date' },
    { name: 'publicado', label: 'Publicada', type: 'switch' },
    { name: 'portada_url', label: 'Imagen de portada (URL)', type: 'url', full: true },
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

export const pressConfig: CrudConfig<Press> = {
  table: 'press',
  title: 'Prensa / Noticias',
  singular: 'aparición',
  description: 'Menciones y apariciones en medios.',
  schema: pressSchema,
  defaultValues: { titulo: '', medio: '', url: '', fecha: '', imagen_url: '' },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text' },
    { name: 'medio', label: 'Medio', type: 'text', placeholder: 'El Tiempo' },
    { name: 'fecha', label: 'Fecha', type: 'date' },
    { name: 'url', label: 'Enlace a la nota', type: 'url' },
    { name: 'imagen_url', label: 'Imagen (URL)', type: 'url', full: true },
  ],
  columns: [
    { key: 'titulo', label: 'Título', render: (r) => truncate(r.titulo, 48) },
    { key: 'medio', label: 'Medio' },
    { key: 'fecha', label: 'Fecha', render: (r) => formatDate(r.fecha) },
  ],
};

export const videosConfig: CrudConfig<Video> = {
  table: 'videos',
  title: 'Multimedia · Videos',
  singular: 'video',
  description: 'Videos insertados de YouTube/Vimeo.',
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
        { value: 'otro', label: 'Otro' },
      ],
    },
    {
      name: 'url_embed',
      label: 'URL del video',
      type: 'text',
      full: true,
      help: 'Pega el enlace normal o de inserción; se normaliza al mostrarse.',
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

export const linksConfig: CrudConfig<Link> = {
  table: 'links',
  title: 'Enlaces / Recursos',
  singular: 'enlace',
  description: 'Proyectos, redes sociales y recursos.',
  schema: linkSchema,
  defaultValues: { titulo: '', url: '', categoria: 'recurso', icono: '', orden: 0 },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text' },
    {
      name: 'categoria',
      label: 'Categoría',
      type: 'select',
      options: [
        { value: 'proyecto', label: 'Proyecto' },
        { value: 'red_social', label: 'Red social' },
        { value: 'recurso', label: 'Recurso' },
      ],
    },
    { name: 'url', label: 'URL', type: 'url', full: true },
    { name: 'icono', label: 'Icono (nombre lucide)', type: 'text', help: 'p. ej. newspaper, globe.' },
    { name: 'orden', label: 'Orden', type: 'number' },
  ],
  columns: [
    { key: 'titulo', label: 'Título' },
    { key: 'categoria', label: 'Categoría', render: (r) => <Badge variant="secondary">{r.categoria}</Badge> },
    { key: 'url', label: 'URL', render: (r) => truncate(r.url, 40) },
  ],
};

export const awardsConfig: CrudConfig<Award> = {
  table: 'awards',
  title: 'Reconocimientos',
  singular: 'reconocimiento',
  description: 'Premios, logros y certificaciones.',
  schema: awardSchema,
  defaultValues: { titulo: '', entidad: '', anio: '', descripcion: '', orden: 0 },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text' },
    { name: 'entidad', label: 'Entidad', type: 'text' },
    { name: 'anio', label: 'Año', type: 'number', placeholder: '2024' },
    { name: 'orden', label: 'Orden', type: 'number' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', full: true },
  ],
  columns: [
    { key: 'titulo', label: 'Título', render: (r) => truncate(r.titulo, 48) },
    { key: 'entidad', label: 'Entidad' },
    { key: 'anio', label: 'Año', className: 'w-20' },
  ],
};
