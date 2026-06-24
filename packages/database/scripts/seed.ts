/**
 * Script de seed vía `service_role` (alternativa programática a seed.sql).
 *
 *   Uso:  pnpm --filter @mario/database seed
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.
 * Reutiliza exactamente los DATOS DE EJEMPLO de `placeholder.ts`.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { createAdminSupabase } from '../src/admin';
import {
  placeholderAwards,
  placeholderBooks,
  placeholderExperiences,
  placeholderLinks,
  placeholderNarinoProfiles,
  placeholderPosts,
  placeholderPress,
  placeholderProfile,
  placeholderProjects,
  placeholderSettings,
  placeholderVideos,
} from '../src/placeholder';

/** Quita columnas autogeneradas para construir payloads de INSERT. */
function stripAuto<T>(rows: readonly T[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = row as Record<string, unknown>;
    return rest;
  });
}

async function main() {
  // Cliente sin tipado de esquema para inserciones genéricas en el seed.
  const supabase = createAdminSupabase() as unknown as SupabaseClient;
  console.log('› Limpiando tablas de contenido…');

  const tables = [
    'profile',
    'experiences',
    'posts',
    'press',
    'videos',
    'links',
    'awards',
    'settings',
    'projects',
    'books',
    'narino_profiles',
  ] as const;

  for (const table of tables) {
    // Borra todo (el cliente service_role salta RLS).
    await supabase.from(table).delete().neq('clave', '___nunca___').neq('id', '___nunca___');
  }

  console.log('› Insertando datos de EJEMPLO…');

  const ops: Array<{ name: string; error: { message: string } | null }> = [];

  ops.push({
    name: 'profile',
    error: (await supabase.from('profile').insert(stripAuto([placeholderProfile]))).error,
  });
  ops.push({
    name: 'experiences',
    error: (await supabase.from('experiences').insert(stripAuto(placeholderExperiences))).error,
  });
  ops.push({
    name: 'posts',
    error: (await supabase.from('posts').insert(stripAuto(placeholderPosts))).error,
  });
  ops.push({
    name: 'press',
    error: (await supabase.from('press').insert(stripAuto(placeholderPress))).error,
  });
  ops.push({
    name: 'videos',
    error: (await supabase.from('videos').insert(stripAuto(placeholderVideos))).error,
  });
  ops.push({
    name: 'links',
    error: (await supabase.from('links').insert(stripAuto(placeholderLinks))).error,
  });
  ops.push({
    name: 'awards',
    error: (await supabase.from('awards').insert(stripAuto(placeholderAwards))).error,
  });
  ops.push({
    name: 'projects',
    error: (await supabase.from('projects').insert(stripAuto(placeholderProjects))).error,
  });
  ops.push({
    name: 'books',
    error: (await supabase.from('books').insert(stripAuto(placeholderBooks))).error,
  });
  ops.push({
    name: 'narino_profiles',
    error: (await supabase.from('narino_profiles').insert(stripAuto(placeholderNarinoProfiles)))
      .error,
  });
  ops.push({
    name: 'settings',
    error: (await supabase.from('settings').insert(placeholderSettings.map(({ updated_at: _u, ...r }) => r)))
      .error,
  });

  let ok = true;
  for (const op of ops) {
    if (op.error) {
      ok = false;
      console.error(`  ✗ ${op.name}: ${op.error.message}`);
    } else {
      console.log(`  ✓ ${op.name}`);
    }
  }

  if (!ok) {
    console.error('\nSeed finalizó con errores.');
    process.exit(1);
  }
  console.log('\n✓ Seed completado con datos de EJEMPLO.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
