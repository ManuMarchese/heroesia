# STATE: v0.1 etapa 2, Investigador en curso con autonomía hasta el Guardián (2026-10-03)

**Estado en una línea:** repo sin código; `PLAN-v0.1.md` aprobado (tamaño M) y el Investigador (Q1 a Q8) corriendo en segundo plano. Manu dio autonomía hasta el Guardián (D25). Producción: no hay.

## Si retomás esta sesión (leer en este orden)
1. Este archivo. 2. `PLAN-v0.1.md`. 3. `docs/DECISIONES-v0.1.md`. 4. `docs/diseno/TOKENS.md`. 5. `docs/INVESTIGACION-v0.1.md` (cuando exista).
Preparación del clon: `git fetch origin main && git remote set-head origin main` (ya hecho en esta sesión).

## Datos clave
- Repo `ManuMarchese/heroesia` · producción: no hay · rama de trabajo `claude/heroes-ia-app-planning-tdopih` · `main` creada en `40ad754` (solo documentación, D26) · PR: no hay
- Último commit de código: ninguno (solo documentación).
- Look elegido: A · Cómic (D15). Prototipo: https://claude.ai/artifact/Jt48RNP9nibJrKxnxWVTSD (privado, solo Manu); copia en `docs/diseno/`.
- Hosting y base: cuentas de Manu en Vercel y Supabase (D17, sin ver). El deploy y el gasto los hace Manu desde Claude Desktop (D16, D18). Saldo: sin informar.
- Entrada: link mágico por email (D22). Misión: capitán rotativo (D23). Arranque: misión inicial, sin contenido semilla (D24).
- Entorno: Node v22.22.0, npm 10.9.4 y registro de npm accesible (D28).
- Rollback: no aplica todavía.

## Próximos pasos (con costo)
1. Investigador (en curso) → yo verifico su reporte (`git status` limpio, fuentes) y lo guardo en `docs/INVESTIGACION-v0.1.md`. Costo: 0 créditos de hosting.
2. Builder (Opus, agente genérico con la plantilla como prompt) → commits en la rama de trabajo, sin deploy ni SQL remoto. Costo: 0 créditos de hosting.
3. Guardián (Sonnet, independiente) → APROBADO o RECHAZADO + checklist manual + rollback; compara contra `main`.
4. Manu desde Claude Desktop: aplicar el SQL en Supabase, cargar las variables en Vercel y desplegar. Costo: lo decide Manu (D16).
5. Cierre: STATE, DECISIONES, APRENDIZAJES y `verificar-traspaso.sh`.
**Paradas de la autonomía (D25):** el Investigador cambia una decisión de Manu (Q1 bloqueante), el Guardián rechaza dos veces, o hace falta gasto, merge o deploy.

## NO verificado (va a la prueba manual)
- Cuentas y planes de Vercel y Supabase; límites de los planes gratis (Q1 a Q3).
- Cómo se restringe el registro a invitados con link mágico (Q8).
- El prototipo A no se abrió en un navegador; los contrastes están calculados a mano.
- Cuál es la rama por defecto en GitHub (D26).
- Login, base de datos y deploy reales: no se pueden probar en esta sesión.
- Zona horaria y semana de lunes a domingo, hora de Buenos Aires (supuesto de D23).

## Pendiente / fuera de esta versión
- Fuera de la v0.1 (D3, D6, D9, D10, D13): búsqueda de texto, ranking público, poder real en el grupo, insignias, premios, avisos automáticos y ficha automática con IA.
- A confirmar por Manu en el checklist: valores de XP, rangos y clases; reglas por defecto de la misión semanal (D23); cómo se controla quién entra (D22).
- Opcional: instalar las definiciones de agentes del framework en `.claude/agents/` del repo para sesiones futuras (Desktop).

## Vence (revisar en cada arranque)
| Qué | Fecha | Qué hacer |
|---|---|---|
| Reporte del Investigador | Al terminar el agente | Verificar, guardar en `docs/INVESTIGACION-v0.1.md` y registrar en DECISIONES |

## Reglas que no se negocian
Cero supuestos. Sin secretos por el chat (las claves de Supabase las carga Manu en Vercel). Código solo en la rama designada. Sin merge, deploy ni gasto sin el OK de Manu. No se toca Vercel ni Supabase desde esta sesión (D18).

## Perfil de Manu
No técnico, escribe en español, speedcuber y ajedrecista: pasos simples, el porqué en una línea y analogías. Aprueba entre etapas, salvo la autonomía de D25. Prefiere respuestas al grano, con bullets y el siguiente paso marcado.

## Efímero (se pierde al compactar)
El scratchpad con las copias de los tres looks (el elegido ya está en `docs/diseno/`) y el reporte del Investigador hasta que yo lo guarde en el repo.
