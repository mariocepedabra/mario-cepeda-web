/**
 * Reglas ESLint compartidas por todas las apps del monorepo.
 *
 * Se exportan como objetos planos (sin FlatCompat) para que cada app las
 * combine con su propia configuración `next/core-web-vitals` + `next/typescript`,
 * que sí depende de la ruta local de la app.
 */

/** @type {import('eslint').Linter.RulesRecord} */
export const sharedRules = {
  // No permitimos `any` explícito: el código debe ir bien tipado.
  '@typescript-eslint/no-explicit-any': 'error',
  // Variables sin usar -> aviso (no rompe el build). Permite prefijo `_`.
  '@typescript-eslint/no-unused-vars': [
    'warn',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
  ],
  // En español usamos comillas y signos sin escapar dentro del JSX.
  'react/no-unescaped-entities': 'off',
  // Usamos <Link> para rutas internas; los <a> apuntan a externos.
  '@next/next/no-html-link-for-pages': 'off',
};

/** Carpetas que ESLint debe ignorar en todas las apps. */
export const sharedIgnores = ['.next/**', 'node_modules/**', 'next-env.d.ts'];
