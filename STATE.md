# STATE: v1.0 desplegada en producción; falta la prueba con login real y con amigos (2026-10-04)

**Estado en una línea:** Heroes IA v1.0 está **desplegada** en https://heroesia.vercel.app con las migraciones 0001 a 0007 aplicadas en el Supabase compartido de Manu; entran los amigos con un link de invitación (usuario y clave, sin mails), se puede editar, borrar y guardar favoritos, y existe la categoría Tecnología con Explorar en "Todos". **Nada se probó todavía con un login real en producción**, y el Guardián no hizo su segunda revisión.

## Si retomás esta sesión (leer en este orden)
1. Este archivo. 2. `docs/PROYECTO.md` (resumen simple de todo). 3. `docs/DECISIONES-v0.1.md` (D40 a D45 son lo último). 4. `docs/SETUP-MANU.md` y `docs/CHECKLIST-MANUAL-v0.1.md`. 5. `docs/APRENDIZAJES.md`. 6. `README.md` (cómo correr y probar). El estado viejo (v0.1, antes del despliegue) está en `docs/archivo/STATE-2026-10-04-v0.1.md`.
Preparación del clon: `git config core.longpaths true` (Windows) y `git fetch origin main && git remote set-head origin main`.

## Datos clave
- **Producción:** https://heroesia.vercel.app (Vercel, equipo `manumarchese123-5200s-projects`, proyecto `heroesia`). Se despliega **por CLI** desde el clon: `vercel deploy --prod --yes` (el proyecto no está conectado a Git). Variables en Production: solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. No hay `GITHUB_TOKEN`, ni `HEROES_DEMO`, ni clave secreta.
- **Base y login:** Supabase proyecto "speedcuber…" (ref `xetojlrziahdcrjpojtr`), **compartido** con otras apps (117 tablas ajenas, 4 usuarios y el trigger `oh_on_auth_user_created`). CLI de Supabase con la sesión de Manu: `supabase db query --linked -f archivo.sql`.
- **Repo:** `ManuMarchese/heroesia`, rama de trabajo `claude/heroes-ia-app-planning-tdopih` (también la de GitHub por defecto). `main` = solo documentación (`40ad754`). No hay PR.
- **Código:** Next.js 16.3.8, React 19.3, Supabase JS/SSR, TypeScript 5.9, Vitest (442 tests) y `playwright-core` para el humo.
- **Migraciones aplicadas (en orden):** 0001 init · 0002 entrada diaria · 0003 proyecto compartido (lectura solo de héroes, perfil con `sumar_heroe`) · 0004 invitación (`unirme`) · 0005 `invitacion_valida` · 0006 carpetas y favoritos · 0007 tipo Tecnología.
- **Entrada:** Manu por email (opción plegada en `/entrar`; ya es héroe). Amigos por el link `/entrar?invitacion=CLAVE` → crean usuario y clave → `unirme` crea su perfil. La clave vive solo como hash en la tabla `invitacion`; **el link vigente lo tiene Manu** (no está en el repo). Cambiar la clave: SQL en `docs/SETUP-MANU.md`.
- **Respaldos locales de la base** (fuera del repo, carpeta `respaldo/` junto al clon): antes de 0006 y de 0007. Se pierden si se borra la sesión.
- **Rollback:** no hay producción previa a la v1.0. Freno real: quitar `NEXT_PUBLIC_SUPABASE_*` en Vercel y redesplegar (la app falla cerrada), o `vercel rollback`/promover un despliegue anterior. Con datos reales: nunca vaciar la base sin copia.
- Look A · Cómic (D15). Fuentes y tokens en `src/styles/tokens.css`.

## Próximos pasos (con costo)
1. **Manu prueba con login real** (0 costo): entrar con su email, crear un usuario de prueba con el link de invitación en una ventana privada, publicar, editar, guardar en carpeta, borrar. Después se borra el usuario de prueba y su fila en `oh_profiles` (el trigger de la otra app la crea).
2. **Checklist manual con otra persona** (`docs/CHECKLIST-MANUAL-v0.1.md`): hay que actualizarlo a la v1.0 (usuario y clave, favoritos, Tecnología).
3. **Segunda revisión del Guardián** (agente independiente, sobre el diff contra `main`) **nunca se hizo** (D45). Si rechaza, se frena y se le pregunta a Manu (D25).
4. Guías de D38 6a–6f: **parcialmente hechas** (SETUP ya incluye 0001–0007, proyecto compartido, link de invitación y cambio de clave). Faltan revisar el resto de pasos de SETUP/CHECKLIST contra la realidad (por ejemplo, ya no se usa mail ni SMTP para los amigos).
5. `npm run humo` (recorrido en Chromium) **no se corrió** desde la v0.1: actualizarlo a Explorar con "Todos" y a Tecnología antes de correrlo.

## NO verificado (va a la prueba manual)
- El alta completa de un amigo y el login de Manu **en producción con sesión real** (no se pueden escribir contraseñas en un sitio real desde acá).
- Que la confirmación de email del proyecto siga apagada: el alta con usuario y clave depende de eso (se probó con `signUp` una vez, el 2026-10-04).
- Que la plantilla de mail y las URLs de Auth del proyecto sirvan para el login por email de Manu (la plantilla de Magic Link trae solo el link, sin código; no se cambió).
- Textos y botones de la UI de Supabase y Vercel citados en SETUP-MANU (páginas oficiales no revalidadas).
- Rendimiento con 15 personas y con más de 100 aportes (Explorar "Todos" muestra los 100 más nuevos).
- Contrastes calculados a mano; instalación como app en celulares reales.

## Pendiente / fuera de esta versión
- Fuera de la v1.0 (D3, D6, D9, D10, D13): búsqueda de texto, ranking público, poder real en el grupo, insignias, premios, avisos automáticos, ficha automática con IA.
- Un post en **varias carpetas** (decidido: una sola, D43). Compartir carpetas: no (privadas).
- Recuperar la clave por mail: no existe; la cambia Manu por SQL.
- Decidir si se versiona un `CLAUDE.md` propio (`next dev` genera `AGENTS.md` y `CLAUDE.md` solos: se borran antes de commitear).
- Deuda técnica: TypeScript 5.9 y ESLint 9; las URLs de Redirect de Auth (agregar `https://heroesia.vercel.app/**`) si Manu quiere seguir entrando por email.
- Línea `[PRUEBA MOD - borrar]` en el `CLAUDE.md` **global** de Manu (`~/.claude/CLAUDE.md`): no es de este repo; Manu decide si se borra.

## Vence (revisar en cada arranque)
| Qué | Fecha | Qué hacer |
|---|---|---|
| `lanzamiento_en` = 2026-10-05 | Ya fijado en la base | La misión inicial rige hasta esa semana; el capitán rota desde la siguiente |
| Prueba con login real | Antes de pasarle el link a los amigos | Seguir "Próximos pasos" 1 y 2 |

## Reglas que no se negocian
Cero supuestos (todo dato externo con fuente o NO VERIFICADO). Sin secretos por el chat ni en el repo; la clave secreta de Supabase nunca va a Vercel. No escribir contraseñas en sitios reales. Un solo despliegue por tanda de cambios, con copia limpia en verde antes. Backup de las tablas antes de un cambio de base con riesgo. Merge a `main`, gasto y cambios de ajustes compartidos de Supabase (Auth, SMTP, plantillas) los decide Manu.

## Perfil de Manu
No técnico, escribe en español, speedcuber y ajedrecista: pasos simples, con emojis, el porqué en una línea y el siguiente paso marcado. Quiere lo más fácil posible y no hacer pasos manuales; avisar apenas algo falle (límite de uso). Aprueba entre etapas.

## Efímero (se pierde al compactar)
La carpeta `respaldo/` (copias de las tablas) y los servidores de prueba locales. El resto está en el repo.
