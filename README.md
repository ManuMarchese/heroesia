# Heroes IA

Web app privada, pensada primero para el celular, donde un grupo de 5 a 15 amigos comparte skills, repos, noticias, oportunidades y feedback de proyectos, con XP, niveles, clases y una misión semanal del equipo.

El plan y las decisiones están en `PLAN-v0.1.md`, `docs/DECISIONES-v0.1.md` y `docs/diseno/TOKENS.md`. Para ponerla en marcha en Supabase y Vercel: `docs/SETUP-MANU.md`. Para probarla con dos personas: `docs/CHECKLIST-MANUAL-v0.1.md`.

## Requisitos
- Node 22 o más nuevo y npm.
- Para el humo: un Chromium instalado. Por defecto se usa `/opt/pw-browsers/chromium`; en otra compu, `HUMO_CHROMIUM=/ruta/al/chromium`.

## Cómo correrla
```bash
npm install                  # dependencias
HEROES_DEMO=1 npm run dev    # http://localhost:3000 con datos de ejemplo, sin Supabase
npm run dev                  # con Supabase: antes completá .env.local (ver abajo)
```
En el modo demostración entra un usuario de ejemplo que es el capitán de la semana; lo que se publica vive en memoria hasta reiniciar el servidor. La producción de Vercel lo ignora aunque `HEROES_DEMO` esté cargada.

## Cómo probarla
```bash
npm run typecheck   # tipos (genera los tipos de rutas de Next y corre tsc)
npm run lint        # ESLint
npm test            # tests con Vitest: dominio, datos, lectura segura de links y migración sobre PGlite
npm run build       # build de producción (no necesita variables de Supabase)
npm run humo        # build + recorrido en Chromium real a 390 px y en escritorio, en modo demostración
```
El humo (`humo/`) levanta `next start` en un puerto libre, recorre Inicio, Explorar (cada tipo), Perfil (editar el nombre), Publicar, una acción de cada tipo, la misión del capitán y Copiar resumen, falla si hay errores de consola y deja hasta 8 capturas PNG livianas en `docs/capturas/`. No toca Supabase ni la red externa: la lectura de links se prueba con los tests de `src/lectura/`.

## Variables de entorno
Copiá `.env.example` a `.env.local` y completá los valores. `.env.local` nunca se sube al repo.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: proyecto de Supabase (la app no usa la clave secreta).
- `GITHUB_TOKEN` (opcional): para leer repos de GitHub sin agotar el límite público.
- `HEROES_DEMO=1`: solo para probar en tu compu sin Supabase. Nunca en Vercel.

## Estructura
- `src/app/`: pantallas (App Router de Next.js): Inicio, Explorar, Publicar, Perfil, Entrar, y el manifest de la web instalable.
- `src/components/`: tarjetas, formularios e íconos de trazo con el look A · Cómic.
- `src/vista/` y `src/casos/`: arman lo que muestra cada pantalla y lo que hace cada botón, sobre la capa de datos.
- `src/acciones/`: acciones del servidor (cada una exige sesión).
- `src/lectura/`: lectura segura de título e imagen de un link (solo http y https, sin redes locales, DNS validado en cada redirección).
- `src/domain/`: reglas puras (aportes, XP, niveles, misión semanal, récord y resumen). Los números de XP están en `src/domain/xp-config.ts`.
- `src/data/`: acceso a datos con una interfaz y dos implementaciones (Supabase y demostración). Las pantallas usan `obtenerRepositorio()`.
- `src/auth/`, `src/app/entrar/`, `src/app/auth/confirm/` y `src/proxy.ts`: entrada con link mágico o código de 6 dígitos (Supabase Auth, sin registros públicos). Es un módulo aparte, fácil de quitar.
- `src/styles/tokens.css`: todos los valores del look como variables CSS.
- `supabase/migrations/0001_init.sql`: tablas, índices y reglas de acceso (RLS); `0002_entrada_diaria.sql`: una entrada de XP por persona y por día. Se aplican a mano, en ese orden, en el SQL Editor de Supabase.
- `supabase/pruebas/`: tests de la migración sobre Postgres en memoria (PGlite); no tocan ningún Supabase real.
- `humo/`: la prueba de humo en Chromium (`npm run humo`); `docs/capturas/`: sus capturas.
- `public/icons/`: íconos de la app; `public/licencias/`: licencias OFL de Lilita One y Nunito.
