# STATE: v0.1 etapa 3, Builder pasada 2 en curso (2026-10-04)

**Estado en una línea:** pasada 1 del Builder (pasos 1 a 4) hecha, verificada en copia limpia y subida (D34). La pasada 2 (ajustes + pasos 5 a 8) corre en segundo plano; después, Guardián. Producción: no hay.

## Si retomás esta sesión (leer en este orden)
1. Este archivo. 2. `PLAN-v0.1.md`. 3. `docs/DECISIONES-v0.1.md` (D34 y D35 son lo último). 4. `docs/INVESTIGACION-v0.1.md`. 5. `docs/diseno/TOKENS.md`. 6. `README.md` (cómo correr la app).
Preparación del clon: `git fetch origin main && git remote set-head origin main` (ya hecho en esta sesión).
Mientras corre un Builder, el orquestador no edita archivos del repo (el Builder usa `git add`).

## Datos clave
- Repo `ManuMarchese/heroesia` · producción: no hay · rama de trabajo `claude/heroes-ia-app-planning-tdopih` · `main` en `40ad754` (solo documentación, D26) · rama por defecto en GitHub: la de trabajo (D31) · PR: no hay
- Código: Next.js 16.3.8 + React 19.3.0 + Supabase (`@supabase/supabase-js` 2.117.2, `@supabase/ssr` 0.12.7), TypeScript 5.9, Vitest; 178 tests en verde. Último commit de código verificado: `82176c2`.
- Look elegido: A · Cómic (D15). Prototipo: https://claude.ai/artifact/Jt48RNP9nibJrKxnxWVTSD (privado, solo Manu); copia en `docs/diseno/`.
- Hosting y base: cuentas de Manu en Vercel y Supabase (D17, sin ver). Manu las configura y despliega desde Claude Desktop antes de invitar (D16, D18, D32). Saldo: sin informar.
- Entrada: link mágico o código de 6 dígitos; registros públicos apagados y Manu invita desde el panel de Supabase (D22, D32). Misión: capitán rotativo (D23, precisada en D35). Arranque: misión inicial (D24). Autonomía hasta el Guardián con paradas (D25).
- Entorno: Node v22.22.0, npm 10.9.4 y registro de npm accesible (D28). La red bloquea las páginas oficiales de docs (D29).
- Rollback: no aplica todavía.

## Próximos pasos (con costo)
1. Builder pasada 2 (en curso): ajuste de D35 + pasos 5 a 8 → yo verifico en copia limpia, reviso el diff y hago `git push`. Costo: 0 créditos de hosting.
2. Guardián (Sonnet, independiente) → APROBADO o RECHAZADO + checklist manual + rollback; compara contra `main`.
3. Manu desde Claude Desktop, siguiendo `docs/SETUP-MANU.md` (lo escribe la pasada 2): SMTP propio con dominio verificado, apagar registros públicos, invitar amigos, aplicar el SQL en Supabase, cargar las variables en Vercel y desplegar. Costo: lo decide Manu (D16).
4. Cierre: STATE, DECISIONES, APRENDIZAJES y `verificar-traspaso.sh`.
**Paradas de la autonomía (D25):** una decisión de Manu cambia, el Guardián rechaza dos veces, o hace falta gasto, merge o deploy.

## NO verificado (va a la prueba manual)
- Todo lo de `docs/INVESTIGACION-v0.1.md` marcado [WS] o [repo] es de segunda mano (páginas oficiales bloqueadas por la red del entorno).
- Mi interpretación de la respuesta de Manu en D32 ("Antes de darselo ya si ponemos supabase y vercel. Deja solo eso sin hacer").
- Nada se probó contra un Supabase real: migración aplicada, trigger sobre `auth.users`, permisos por columna vía PostgREST, `getClaims`, SMTP, plantillas de mail, invitaciones.
- Cuentas y planes de Vercel y Supabase; que el uso encaje en Vercel Hobby (no comercial).
- Vercel Hobby puede no desplegar commits de un autor que no es el dueño ("Claude <noreply@anthropic.com>"): depende de cómo despliegue Manu (D29, fuente secundaria).
- La API pública de GitHub sin token ya estaba agotada para la IP de este entorno (0 de 60): la app acepta un token opcional y falla con gracia.
- Cómo responden X y LinkedIn a la lectura de título e imagen; textos de los menús de instalación en iPhone y Android.
- El prototipo A no se abrió en un navegador por mí; los contrastes están calculados a mano.
- Zona horaria y semana de lunes a domingo, hora de Buenos Aires (supuesto de D23).

## Pendiente / fuera de esta versión
- Fuera de la v0.1 (D3, D6, D9, D10, D13): búsqueda de texto, ranking público, poder real en el grupo, insignias, premios, avisos automáticos y ficha automática con IA.
- A confirmar por Manu en el checklist: valores de XP, rangos y clases, y demás decisiones del Builder (D34); reglas de la misión semanal (D23, D35); decisiones técnicas derivadas de D32.
- Deuda técnica: TypeScript 5.9 y ESLint 9 (npm marca ESLint 9 como sin soporte); revisar cuando typescript-eslint y eslint-config-next acepten ESLint 10 y TypeScript 7.
- Opcional: habilitar en Network access del entorno los dominios de documentación (supabase.com, vercel.com, nextjs.org, docs.github.com, support.apple.com, support.google.com, web.dev, webkit.org) para revalidar con la fuente primaria.
- Opcional: instalar las definiciones de agentes del framework en `.claude/agents/` del repo para sesiones futuras (Desktop).

## Vence (revisar en cada arranque)
| Qué | Fecha | Qué hacer |
|---|---|---|
| Reporte del Builder, pasada 2 | Al terminar el agente | Verificar en copia limpia, revisar el diff, `git push` y registrar en DECISIONES |

## Reglas que no se negocian
Cero supuestos. Sin secretos por el chat (las claves de Supabase las carga Manu en Vercel). Código solo en la rama designada. Sin merge, deploy ni gasto sin el OK de Manu. No se toca Vercel ni Supabase desde esta sesión (D18).

## Perfil de Manu
No técnico, escribe en español, speedcuber y ajedrecista: pasos simples, el porqué en una línea y analogías. Aprueba entre etapas, salvo la autonomía de D25. Prefiere respuestas al grano, con bullets y el siguiente paso marcado.

## Efímero (se pierde al compactar)
El scratchpad con las copias de los tres looks (el elegido ya está en `docs/diseno/`) y el log de la copia limpia de la pasada 1. Todo lo demás está en el repo.
