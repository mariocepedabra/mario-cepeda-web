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
