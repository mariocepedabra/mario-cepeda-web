/**
 * Tipos de la base de datos (Supabase / Postgres).
 *
 * El tipo `Database` sigue el formato que espera `supabase-js`
 * (`Database['public']['Tables'][tabla]['Row' | 'Insert' | 'Update']`),
 * de modo que las consultas quedan tipadas de extremo a extremo.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Hace opcionales las columnas con valor por defecto en INSERT. */
type WithDefaults<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ---------------------------------------------------------------------------
//  Modelos de dominio (las filas tal y como las consume la app)
// ---------------------------------------------------------------------------

export type SocialLinks = {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
  website?: string;
}

export type Profile = {
  id: string;
  nombre: string;
  titular: string;
  bio: string;
  foto_url: string | null;
  redes: SocialLinks;
  created_at: string;
  updated_at: string;
}

export type Experience = {
  id: string;
  titulo: string;
  organizacion: string | null;
  periodo: string | null;
  descripcion: string | null;
  orden: number;
  created_at: string;
  updated_at: string;
}

export type Post = {
  id: string;
  titulo: string;
  slug: string;
  resumen: string | null;
  /** HTML producido por el editor Tiptap. */
  contenido: string | null;
  portada_url: string | null;
  publicado: boolean;
  fecha: string;
  created_at: string;
  updated_at: string;
}

export type Press = {
  id: string;
  titulo: string;
  medio: string | null;
  url: string | null;
  fecha: string | null;
  imagen_url: string | null;
  created_at: string;
  updated_at: string;
}

export type VideoPlatform = 'youtube' | 'vimeo' | 'otro';

export type Video = {
  id: string;
  titulo: string;
  url_embed: string;
  plataforma: VideoPlatform;
  descripcion: string | null;
  orden: number;
  created_at: string;
  updated_at: string;
}

export type LinkCategory = 'proyecto' | 'red_social' | 'recurso';

export type Link = {
  id: string;
  titulo: string;
  url: string;
  categoria: LinkCategory;
  icono: string | null;
  orden: number;
  created_at: string;
  updated_at: string;
}

export type Award = {
  id: string;
  titulo: string;
  entidad: string | null;
  anio: number | null;
  descripcion: string | null;
  orden: number;
  created_at: string;
  updated_at: string;
}

export type ContactMessage = {
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
}

export type MediaType = 'imagen' | 'documento' | 'otro';

export type Media = {
  id: string;
  nombre: string;
  url: string;
  tipo: MediaType;
  created_at: string;
}

export type Setting = {
  clave: string;
  valor: string | null;
  updated_at: string;
}

// ---------------------------------------------------------------------------
//  Tipo Database para supabase-js
// ---------------------------------------------------------------------------

type AutoCols = 'id' | 'created_at' | 'updated_at';

/** Las tablas de supabase-js requieren `Relationships`; aquí no hay FKs. */
type Rel = [];

export interface Database {
  public: {
    Tables: {
      profile: {
        Row: Profile;
        Insert: WithDefaults<Profile, AutoCols>;
        Update: Partial<WithDefaults<Profile, AutoCols>>;
        Relationships: Rel;
      };
      experiences: {
        Row: Experience;
        Insert: WithDefaults<Experience, AutoCols>;
        Update: Partial<WithDefaults<Experience, AutoCols>>;
        Relationships: Rel;
      };
      posts: {
        Row: Post;
        Insert: WithDefaults<Post, AutoCols>;
        Update: Partial<WithDefaults<Post, AutoCols>>;
        Relationships: Rel;
      };
      press: {
        Row: Press;
        Insert: WithDefaults<Press, AutoCols>;
        Update: Partial<WithDefaults<Press, AutoCols>>;
        Relationships: Rel;
      };
      videos: {
        Row: Video;
        Insert: WithDefaults<Video, AutoCols>;
        Update: Partial<WithDefaults<Video, AutoCols>>;
        Relationships: Rel;
      };
      links: {
        Row: Link;
        Insert: WithDefaults<Link, AutoCols>;
        Update: Partial<WithDefaults<Link, AutoCols>>;
        Relationships: Rel;
      };
      awards: {
        Row: Award;
        Insert: WithDefaults<Award, AutoCols>;
        Update: Partial<WithDefaults<Award, AutoCols>>;
        Relationships: Rel;
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: WithDefaults<ContactMessage, 'id' | 'created_at' | 'leido'>;
        Update: Partial<WithDefaults<ContactMessage, 'id' | 'created_at'>>;
        Relationships: Rel;
      };
      media: {
        Row: Media;
        Insert: WithDefaults<Media, 'id' | 'created_at'>;
        Update: Partial<WithDefaults<Media, 'id' | 'created_at'>>;
        Relationships: Rel;
      };
      settings: {
        Row: Setting;
        Insert: WithDefaults<Setting, 'updated_at'>;
        Update: Partial<WithDefaults<Setting, 'updated_at'>>;
        Relationships: Rel;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Nombre de tabla válido del esquema público. */
export type TableName = keyof Database['public']['Tables'];
