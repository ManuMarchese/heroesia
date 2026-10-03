# STATE: v0.1 plan aprobado (tamaño M), falta lanzar el Investigador (2026-10-03)

**Estado en una línea:** repo sin código; descubrimiento cerrado (D1 a D24) y `PLAN-v0.1.md` aprobado por Manu con tamaño M. Sigue el paso 2 (Investigador, Q1 a Q8), que espera el "Dale" de Manu. Producción: no hay.

## Si retomás esta sesión (leer en este orden)
1. Este archivo. 2. `PLAN-v0.1.md`. 3. `docs/DECISIONES-v0.1.md`. 4. `docs/diseno/TOKENS.md`.
En GitHub, la rama por defecto es hoy la de trabajo (el remoto estaba vacío en el primer push). Crear `main` requiere el OK de Manu; recién entonces sirve `git remote set-head origin main`.

## Datos clave
- Repo `ManuMarchese/heroesia` · producción: no hay · rama de trabajo `claude/heroes-ia-app-planning-tdopih` · PR: no hay
- Último commit de código: ninguno (solo documentación).
- Look elegido: A · Cómic (D15). Prototipo: https://claude.ai/artifact/Jt48RNP9nibJrKxnxWVTSD (privado, solo Manu); copia en `docs/diseno/`.
- Hosting y base: cuentas de Manu en Vercel y Supabase (D17, sin ver). El deploy y el gasto los hace Manu desde Claude Desktop (D16, D18). Saldo: sin informar.
- Entrada: link mágico por email (D22). Misión: capitán rotativo (D23). Arranque: misión inicial, sin contenido semilla (D24).
- Rollback: no aplica todavía.

## Próximos pasos (con costo)
1. Manu da el "Dale" para lanzar el Investigador (Q1 a Q8) → `docs/INVESTIGACION-v0.1.md`. Costo: 0 créditos de hosting; usa búsqueda web.
2. Builder → commits en la rama de trabajo. Costo: 0 créditos de hosting.
3. Guardián → APROBADO o RECHAZADO + checklist manual + rollback.
4. Manu desde Claude Desktop: aplicar el SQL en Supabase, cargar las variables en Vercel y desplegar. Costo: lo decide Manu (D16).
5. Cierre: STATE, DECISIONES, APRENDIZAJES y `verificar-traspaso.sh`.

## NO verificado (va a la prueba manual)
- Cuentas y planes de Vercel y Supabase; límites de los planes gratis (Q1 a Q3). Q1 es bloqueante: link mágico y límite de emails.
- Cómo se restringe el registro a invitados con link mágico (Q8).
- El prototipo A no se abrió en un navegador; los contrastes están calculados a mano.
- Si `npm` funciona desde este entorno.
- Login, base de datos y deploy reales: no se pueden probar en esta sesión.
- Zona horaria y semana de lunes a domingo, hora de Buenos Aires (supuesto de D23).

## Pendiente / fuera de esta versión
- Fuera de la v0.1 (D3, D6, D9, D10, D13): búsqueda de texto, ranking público, poder real en el grupo, insignias, premios, avisos automáticos y ficha automática con IA.
- A confirmar por Manu en el checklist: valores de XP, rangos y clases; reglas por defecto de la misión semanal (D23); cómo se controla quién entra (D22).

## Vence (revisar en cada arranque)
| Qué | Fecha | Qué hacer |
|---|---|---|
| "Dale" para lanzar el Investigador | Ahora | Preguntarle a Manu (con o sin autonomía) |
| Crear `main` en GitHub | Cuando Manu lo autorice | Commit inicial en `main` y `git remote set-head origin main` |

## Reglas que no se negocian
Cero supuestos. Sin secretos por el chat (las claves de Supabase las carga Manu en Vercel). Código solo en la rama designada. Sin merge, deploy ni gasto sin el OK de Manu. No se toca Vercel ni Supabase desde esta sesión (D18).

## Perfil de Manu
No técnico, escribe en español, speedcuber y ajedrecista: pasos simples, el porqué en una línea y analogías. Aprueba entre etapas. Prefiere respuestas al grano, con bullets y el siguiente paso marcado.

## Efímero (se pierde al compactar)
El scratchpad con las copias de los tres looks (el elegido ya está en `docs/diseno/`). Todo lo demás está en el repo.
