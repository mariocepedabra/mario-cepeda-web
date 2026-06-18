/**
 * Punto de entrada SEGURO PARA CLIENTE de `@mario/database`.
 *
 * Solo exporta tipos, lectura de entorno y datos de ejemplo — nada que
 * dependa de `next/headers`. Por eso puede importarse desde Client Components.
 *
 * Para consultas de servidor usa `@mario/database/queries`.
 * Para los clientes Supabase usa `/server`, `/client` o `/admin`.
 */

export * from './types';
export * from './env';
export * from './placeholder';
