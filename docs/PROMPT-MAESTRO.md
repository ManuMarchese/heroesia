# Prompt maestro para terminar Heroes IA (pegar en Claude Code Desktop)

Escrito el 2026-10-04 al cortar la sesión en la nube por el límite de uso (D39). Pegá el bloque de abajo en la sesión local, con el repo clonado o con el comando de clonado que incluye.

```text
Sos mi ingeniero para terminar y lanzar Heroes IA. Usá la skill framework-manu (si no la tenés, pedime la carpeta). No soy técnico: hablame en español, con frases cortas, un paso por vez y el porqué en una línea.

QUÉ ES
Heroes IA: web app privada, celular primero, para 5 a 15 amigos que comparten skills, repos, noticias, oportunidades y feedback de proyectos, con XP, niveles, clases y una misión semanal con capitán rotativo. Next.js 16 + Supabase (base y login) para publicar en Vercel. Look A "Cómic".

ARRANQUE (hacelo ya)
0. Cloná https://github.com/ManuMarchese/heroesia y quedate en la rama `claude/heroes-ia-app-planning-tdopih` (es la rama por defecto de GitHub; el último commit de código es `dcba8f6`). `main` es solo documentación (`40ad754`) y es la base del Guardián: corré `git fetch origin main && git remote set-head origin main`.
1. Leé en este orden: STATE.md, PLAN-v0.1.md, docs/DECISIONES-v0.1.md (D1 a D39), docs/INVESTIGACION-v0.1.md, docs/SETUP-MANU.md, docs/CHECKLIST-MANUAL-v0.1.md, docs/diseno/TOKENS.md, README.md y supabase/migrations/0001_init.sql. STATE.md manda sobre cualquier otro documento.
2. Corré la copia limpia como línea base: `bash <carpeta de la skill framework-manu>/scripts/verificar-copia-limpia.sh .` Tiene que dar PASS (36 archivos y 386 tests, al escribir esto).
3. Decime en 5 bullets qué entendiste y seguí sin esperar mi OK hasta el Guardián (autonomía de D25).

ESTADO
La v0.1 está construida y subida. El Guardián la rechazó una vez (D37) por 3 bloqueantes; la pasada de correcciones (D38) no corrió por el límite de uso (D39): siguen sin hacer.

TAREAS, EN ORDEN
A. Corregir. Cada una en su commit y con tests que fallen antes y pasen después:
 1. BLOQUEA, redirección abierta: `src/auth/validacion.ts` (`destinoSeguro`). `next=/.//evil.com` y `/a/../..//evil.com` devuelven `//evil.com`. Que el destino nunca empiece con `//` ni con `/\`. Revisá todos los usos (proxy, rutas, /auth/confirm, /entrar) y probalo por HTTP.
 2. BLOQUEA, mensaje del invitado que no aceptó: `src/auth/errores.ts`. Con los registros apagados, quien fue invitado pero todavía no abrió el mail de invitación recibe `signup_disabled` y la app dice "no está invitado" (según el código de GoTrue, de segunda mano). Un solo mensaje que cubra los dos casos: "No encontramos una cuenta activa con ese email. Si ya te invitaron, abrí el mail de invitación y tocá su link; si no, pedile a Manu que te invite."
 3. BLOQUEA, XP de "Entrar": `src/vista/cargar.ts` toma `ahora` antes de `registrarEntrada()` y `xpDe` (`src/domain/xp.ts`) descarta lo posterior, así que el +5 aparece recién en la 2.ª apertura. Tomá el instante después de registrar, con 1 minuto de tolerancia por desfase de relojes. Test: se ve en la 1.ª apertura y no sube al recargar.
 4. 'entrar' sin límite en la base (`supabase/migrations/0001_init.sql`): limitá a una por persona y por día local de Buenos Aires (índice único parcial con la fecha en esa zona si la expresión es inmutable; si no, un enfriamiento corto en la política). `registrarEntrada()` tiene que tolerar el duplicado. La migración está en 248 de 250 líneas: si no entra, va en `0002_...sql` y se actualiza SETUP-MANU. Tests en PGlite.
 5. `src/auth/acciones.ts`: Salir con `signOut({ scope: "local" })`. `next.config.ts`: cabeceras `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` y `Referrer-Policy: strict-origin-when-cross-origin` (sin CSP todavía).
 6. Guías: (a) CHECKLIST, sección 1: con la invitación recién enviada no se puede pedir código; A y B abren el mail de INVITACIÓN y tocan su link, después A hace Salir y entra por mail, y B escribe el código. (b) SETUP-MANU 9.4: una invitación vencida no se rescata pidiendo código: se reenvía o se sube "Email OTP expiration" (hasta 86400 s) antes de invitar. (c) CHECKLIST: mirar que "Allow new users to sign up" siga apagado y el acceso anónimo también. (d) CHECKLIST: limpiar los datos de prueba al terminar (`delete from public.aportes; delete from public.eventos_xp; delete from public.misiones;`) y reescribir el paso del capitán sin fechas fijas. (e) SETUP-MANU, Vercel: tildar Production al cargar las variables y usar el dominio corto de producción (no la URL con hash) también en Site URL y Redirect URLs. (f) SETUP-MANU, sección "Si algo sale mal": no hay producción previa; el freno real es quitar `NEXT_PUBLIC_SUPABASE_*` y redesplegar (falla cerrado), pausar Supabase o borrar el proyecto de Vercel; con la base vacía este SQL la vacía (sumá los objetos de una 0002 si la hacés; nunca con datos reales sin copia):
    drop trigger if exists crear_perfil on auth.users; drop table if exists public.misiones, public.eventos_xp, public.feedback_util, public.acciones, public.aportes, public.perfiles, public.configuracion cascade;
    drop function if exists public.crear_perfil(), public.xp_por_aporte(), public.xp_por_accion(), public.xp_por_feedback_util(), public.capitan_de(date), public.semana_de_lanzamiento(), public.semana_de(timestamptz);
 No toques: editar un feedback ya marcado útil, el tope de 100 aportes por consulta, detalles menores del code-review ni una CSP.
B. Verificar: typecheck, lint, tests, build, `npm run humo` y `verificar-copia-limpia.sh`, todo en verde. Hacé push a la rama de trabajo cuando esté verificado.
C. Segunda revisión: un agente independiente (no el que programó) sobre el diff contra `main`, con las skills code-review y security-review, que además verifique cada arreglo con una sonda. El Guardián ya rechazó una vez: si rechaza otra, pará y preguntame.
D. Puesta en marcha conmigo, UN paso por vez, con docs/SETUP-MANU.md (tengo cuentas en Vercel y Supabase): SMTP propio con dominio verificado, apagar registros públicos, aplicar el SQL una sola vez, plantillas de mail, Site URL y Redirect URLs, `lanzamiento_en` (al escribir esto era domingo 2026-10-04: para lanzar el lunes 5 va '2026-10-05'; ajustalo a la fecha real), invitar (yo primero: el orden de invitación es el orden de capitanes), variables en Vercel y deploy. Desde Desktop probablemente podés abrir las páginas oficiales: antes de pedirme algo, revalidá con la fuente primaria lo marcado [WS] o [repo] en docs/INVESTIGACION-v0.1.md y los nombres de botones de SETUP-MANU; lo que no puedas verificar, decímelo.
 Variables a cargar: solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (entorno Production) y, opcional, `GITHUB_TOKEN`. Nunca `HEROES_DEMO` ni la clave secreta de Supabase. Cargalas con los tokens y conectores que ya tengo en Claude Desktop, sin imprimirlas ni pegarlas en el chat, en commits ni en archivos.
E. Probar conmigo y con otra persona usando docs/CHECKLIST-MANUAL-v0.1.md, y dejar el rollback listo antes de invitar.
F. Cierre: actualizá STATE.md, docs/DECISIONES-v0.1.md y docs/APRENDIZAJES.md, y corré `bash <carpeta de la skill>/scripts/verificar-traspaso.sh`.

REGLAS (no se negocian)
- Cero supuestos: todo dato externo con fuente oficial y fecha, o NO VERIFICADO. "Hecho" = verificado con la evidencia a la vista; lo que no se pueda probar sin servicios reales va al checklist manual.
- Yo decido: el gasto (dominio, proveedor de email, planes), el merge a `main` y el deploy de producción. Pedime el OK antes de cada uno. Las decisiones D1 a D39 no se reabren sin avisarme.
- Secretos nunca por el chat ni en el repo. No leas archivos `.env*`.
- Quien programa no se revisa: la revisión la hace otro agente. Un commit por paso, sin `git add -A`, y cada decisión nueva va a docs/DECISIONES-v0.1.md.
- A decidir conmigo: si se versiona un CLAUDE.md propio (`next dev` crea uno solo) y los valores de XP, rangos y clases (lista al final de docs/CHECKLIST-MANUAL-v0.1.md).
- Aviso: los commits del repo salen con autor "Claude <noreply@anthropic.com>". Si conecto el repo a Vercel por Git, en el plan Hobby puede no desplegar (fuente secundaria): desplegá por CLI o decime qué prefiero.
```
