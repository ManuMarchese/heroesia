# Heroes IA

Web app privada, pensada primero para el celular, donde un grupo de 5 a 15 amigos comparte skills, repos, noticias, oportunidades y feedback de proyectos, con XP, niveles, clases y una misión semanal del equipo.

El plan y las decisiones están en `PLAN-v0.1.md`, `docs/DECISIONES-v0.1.md` y `docs/diseno/TOKENS.md`.

## Requisitos
- Node 22 o más nuevo y npm.

## Comandos
```bash
npm install          # instala dependencias
npm run dev          # servidor local en http://localhost:3000
npm run typecheck    # tipos (genera los tipos de rutas de Next y corre tsc)
npm run lint         # ESLint
npm test             # tests con Vitest
npm run build        # build de producción
```

## Variables de entorno
Copiá `.env.example` a `.env.local` y completá los valores. `.env.local` nunca se sube al repo.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: proyecto de Supabase (la app no usa la clave secreta).
- `GITHUB_TOKEN` (opcional): para leer repos de GitHub sin agotar el límite público.
- `HEROES_DEMO=1`: solo para probar sin Supabase, con datos de ejemplo. Nunca en producción.

## Estructura
- `src/app/`: pantallas (App Router de Next.js) y manifest de la web instalable.
- `src/components/`: componentes compartidos (navegación inferior, íconos de trazo).
- `src/styles/tokens.css`: todos los valores del look A · Cómic como variables CSS.
- `src/domain/`: reglas puras (aportes, XP, niveles, misión semanal, récord y resumen). Los números de XP están en `src/domain/xp-config.ts`.
- `src/data/`: acceso a datos con una interfaz y dos implementaciones (Supabase y demostración).
- `supabase/migrations/0001_init.sql`: tablas, índices y reglas de acceso (RLS). Se aplica a mano en el SQL Editor de Supabase.
- `supabase/pruebas/`: tests de la migración sobre Postgres en memoria (PGlite); no tocan ningún Supabase real.
- `public/icons/`: íconos de la app, exportados de `public/icons/icon.svg`.
