# Propuesta 1 — Editorial Premium

Estética de **revista / periódico de alta gama**. Encaja con el mundo periodístico de Mario.

- **Tipografía:** Fraunces (serif display) para titulares + Archivo (grotesque sans) para texto.
- **Paleta:** papel crema, tinta casi negra y acento rojo editorial.
- **Layout:** retícula marcada, secciones numeradas (01–08), rejillas y filetes, gran contraste tipográfico.
- **Animación:** entradas sutiles tipo «fade-up» al hacer scroll (Framer Motion).

## Desarrollo

```bash
pnpm install            # desde la raíz del monorepo
pnpm --filter propuesta-1-editorial dev   # http://localhost:3001
```

Sin Supabase configurado, la web usa datos de ejemplo. Ver el README raíz para conectar Supabase
y desplegar en Vercel (Root Directory = `apps/propuesta-1-editorial`).

## Buscador

La lupa de la cabecera (o `Ctrl/⌘ + K` y `/`) abre el buscador; `/buscar` es la página completa de
resultados. El índice vive en memoria en el servidor y se reconstruye cada minuto, así que no hay
que correr ninguna migración y las notas nuevas aparecen solas.

Para que un contenido nuevo sea buscable, añade su lectura en `getSearchCorpus`
(`packages/database/src/queries.ts`) y conviértelo en documento en `buildDocuments`
(`lib/search/documents.ts`).
