# STATE: v0.1 etapa 4, Guardián rechazó una vez; pasada 3 de correcciones en curso (2026-10-04)

**Estado en una línea:** las dos pasadas del Builder están hechas y verificadas (D34, D36), pero el Guardián rechazó `5ef6499` con 3 bloqueantes (D37: redirección abierta, mensaje del invitado sin aceptar, XP de "Entrar" que tarda una apertura). El Builder corrige en la pasada 3 (D38); después, segunda revisión del Guardián. Si rechaza otra vez, parada de D25. Producción: no hay.

## Si retomás esta sesión (leer en este orden)
1. Este archivo. 2. `PLAN-v0.1.md`. 3. `docs/DECISIONES-v0.1.md` (D34 a D36 son lo último). 4. `docs/SETUP-MANU.md` y `docs/CHECKLIST-MANUAL-v0.1.md`. 5. `docs/INVESTIGACION-v0.1.md`. 6. `docs/diseno/TOKENS.md`. 7. `README.md` (cómo correr, probar y el humo).
Preparación del clon: `git fetch origin main && git remote set-head origin main` (ya hecho en esta sesión).

## Datos clave
- Repo `ManuMarchese/heroesia` · producción: no hay · rama de trabajo `claude/heroes-ia-app-planning-tdopih` · `main` en `40ad754` (solo documentación, D26) · rama por defecto en GitHub: la de trabajo (D31) · PR: no hay
- Código: Next.js 16.3.8 + React 19.3.0 + Supabase (`@supabase/supabase-js` 2.117.2, `@supabase/ssr` 0.12.7), TypeScript 5.9, Vitest, `playwright-core` para el humo. Último commit de código verificado: `dcba8f6`.
- Capturas del estado actual: `docs/capturas/` (8 PNG, modo demostración).
- Look elegido: A · Cómic (D15). Prototipo: https://claude.ai/artifact/Jt48RNP9nibJrKxnxWVTSD (privado, solo Manu); copia en `docs/diseno/`.
- Hosting y base: cuentas de Manu en Vercel y Supabase (D17, sin ver). Manu las configura y despliega desde Claude Desktop antes de invitar (D16, D18, D32). Saldo: sin informar.
- Entrada: link mágico o código de 6 dígitos; registros públicos apagados y Manu invita desde el panel de Supabase (D22, D32). Misión: capitán rotativo (D23, D35). Arranque: misión inicial (D24). Autonomía hasta el Guardián con paradas (D25).
- Hoy es domingo 2026-10-04: para que la misión inicial no se pierda, Manu fija `lanzamiento_en` en el lunes 2026-10-05 (paso 8 de `SETUP-MANU.md`).
- Rollback: no hay producción previa; el freno real es quitar `NEXT_PUBLIC_SUPABASE_*` y redesplegar (falla cerrado), pausar Supabase o borrar el proyecto de Vercel; con la base vacía, el SQL de vaciado de D38 (va a `SETUP-MANU.md`).

## Próximos pasos (con costo)
1. Builder pasada 3 (en curso, Opus, agente genérico): correcciones de D38 con tests y guías corregidas → yo verifico en copia limpia y con el humo, y hago `git push`. Costo: 0 créditos de hosting.
2. Segunda revisión del Guardián (agente nuevo, independiente): verifica los arreglos y repasa el diff contra `main` → `VEREDICTO: APROBADO | RECHAZADO`. Si rechaza otra vez, parada de D25 y le pregunto a Manu.
3. Si APROBADO: Manu, desde Claude Desktop, sigue `docs/SETUP-MANU.md` (SMTP propio con dominio verificado, apagar registros públicos, aplicar el SQL, invitar amigos, variables en Vercel, deploy) y prueba con `docs/CHECKLIST-MANUAL-v0.1.md`. Costo: lo decide Manu (D16).
4. Cierre: STATE, DECISIONES, APRENDIZAJES y `verificar-traspaso.sh`.
**Paradas de la autonomía (D25):** una decisión de Manu cambia, el Guardián rechaza dos veces, o hace falta gasto, merge o deploy.

## NO verificado (va a la prueba manual)
- Nada se probó contra un Supabase real: migración aplicada, trigger sobre `auth.users`, permisos por columna vía PostgREST, `getClaims`, SMTP, plantillas de mail, invitaciones.
- Mi interpretación de la respuesta de Manu en D32 ("Antes de darselo ya si ponemos supabase y vercel. Deja solo eso sin hacer").
- Todo lo de `docs/INVESTIGACION-v0.1.md` marcado [WS] o [repo] es de segunda mano (páginas oficiales bloqueadas por la red del entorno).
- Lectura de links en sitios reales (la red del entorno los bloquea); portapapeles e instalación en celulares reales; textos de los menús de iPhone y Android.
- Cuentas y planes de Vercel y Supabase; que el uso encaje en Vercel Hobby (no comercial); que Vercel cargue `VERCEL_ENV=production` en las funciones.
- Vercel Hobby puede no desplegar commits de un autor que no es el dueño ("Claude <noreply@anthropic.com>"): depende de cómo despliegue Manu (D29).
- Contrastes calculados a mano; semana de lunes a domingo en hora de Buenos Aires (supuesto de D23).

## Pendiente / fuera de esta versión
- Fuera de la v0.1 (D3, D6, D9, D10, D13): búsqueda de texto, ranking público, poder real en el grupo, insignias, premios, avisos automáticos y ficha automática con IA.
- A confirmar por Manu en el checklist: valores de XP, rangos y clases, y demás decisiones del Builder (D34, D36); reglas de la misión semanal (D23, D35); decisiones técnicas derivadas de D32.
- Decidir en el cierre si se versiona un `CLAUDE.md` propio (`next dev` genera uno solo; el Builder lo borró).
- Mejoras opcionales: "Me interesa" en oportunidades vencidas; cabeceras de seguridad en `next.config.ts`; migración llena (248 de 250 líneas): lo nuevo va en `0002`.
- Deuda técnica: TypeScript 5.9 y ESLint 9 (npm marca ESLint 9 como sin soporte).
- Opcional: habilitar en Network access del entorno los dominios de documentación (supabase.com, vercel.com, nextjs.org, docs.github.com, support.apple.com, support.google.com, web.dev, webkit.org) para revalidar con la fuente primaria.
- Opcional: instalar las definiciones de agentes del framework en `.claude/agents/` del repo para sesiones futuras (Desktop).

## Vence (revisar en cada arranque)
| Qué | Fecha | Qué hacer |
|---|---|---|
| Reporte del Builder, pasada 3 | Al terminar el agente | Verificar en copia limpia y con el humo, `git push`, registrar en DECISIONES y lanzar la 2.ª revisión del Guardián |
| `lanzamiento_en` = 2026-10-05 | Antes de invitar | Que Manu lo fije si lanza en fin de semana (SETUP-MANU, paso 8) |

## Reglas que no se negocian
Cero supuestos. Sin secretos por el chat (las claves de Supabase las carga Manu en Vercel). Código solo en la rama designada. Sin merge, deploy ni gasto sin el OK de Manu. No se toca Vercel ni Supabase desde esta sesión (D18).

## Perfil de Manu
No técnico, escribe en español, speedcuber y ajedrecista: pasos simples, el porqué en una línea y analogías. Aprueba entre etapas, salvo la autonomía de D25. Prefiere respuestas al grano, con bullets y el siguiente paso marcado.

## Efímero (se pierde al compactar)
El scratchpad con las copias de los tres looks, los logs de las copias limpias y las copias `vista` y `vista2` de la app. Todo lo importante está en el repo.
