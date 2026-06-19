# Propuesta 5 — Magazine (estilo *Gates Notes*)

Réplica del *look & feel* de [gatesnotes.com](https://www.gatesnotes.com/) (el blog/revista personal
de Bill Gates) aplicada a Mario Cepeda: una home tipo **blog/revista** centrada en sus notas.

- **Tipografía:** Archivo (grotesque bold) para titulares + Source Sans 3 (humanista) para texto.
- **Paleta:** blanco luminoso, mucho aire, azul optimista de acento y coral para rótulos de categoría.
- **Layout:** historia destacada protagonista, intro personal «Hola, soy Mario», grilla de notas
  («Lo último»), bloques temáticos (trayectoria, reconocimientos, prensa, multimedia, enlaces),
  franja «Insider» de contacto en azul y footer multicolumna oscuro.
- **Animación:** entradas sutiles tipo «fade-up» al hacer scroll (Framer Motion).

> Misma arquitectura, mismo modelo de datos y mismo panel `/admin` que las otras propuestas
> (todo se reutiliza desde `packages/*`); aquí solo cambia el diseño visual. Los rótulos de
> categoría de las notas son decorativos (la BD no tiene categorías).

## Desarrollo

```bash
pnpm install            # desde la raíz del monorepo
pnpm --filter propuesta-5-magazine dev   # http://localhost:3005
```

Sin Supabase configurado, la web usa datos de ejemplo. Ver el README raíz para conectar Supabase
y desplegar en Vercel (Root Directory = `apps/propuesta-5-magazine`).
