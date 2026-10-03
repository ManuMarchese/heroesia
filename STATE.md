# STATE: v0.1 descubrimiento, Ronda 3 (estructura) cerrada (2026-10-03)

**Estado en una línea:** repo sin código; decididos fundamentos (D1 a D6), gamificación (D7 a D10) y estructura de UI/UX (D11 a D14). Faltan la estética (opciones A/B/C con prototipo) y la Ronda 4 (restricciones); después, `PLAN-v0.1.md` para que Manu lo apruebe. Producción: no hay.

## Si retomás esta sesión (leer en este orden)
1. Este archivo. 2. `docs/DECISIONES-v0.1.md`. 3. `PLAN-v0.1.md` (cuando exista).
En GitHub, la rama por defecto es hoy la de trabajo (el remoto estaba vacío en el primer push). Crear `main` requiere el OK de Manu; recién entonces sirve `git remote set-head origin main`.

## Datos clave
- Repo `ManuMarchese/heroesia` · producción: no hay · rama de trabajo `claude/heroes-ia-app-planning-tdopih` · PR: no hay
- Último commit de código: ninguno (solo documentación).
- Hosting: sin decidir. Saldo de créditos: sin informar.
- Rollback: no aplica todavía.

## Próximos pasos (con costo)
1. Estética: prototipo en Artifact con 3 looks (A/B/C) sobre la pantalla "Base del héroe"; Manu elige por letra. Costo: 0 créditos.
2. Ronda 4: restricciones (horas, créditos, stack, qué está prohibido, herramientas) y quién define la misión semanal.
3. `PLAN-v0.1.md` → aprobación de Manu → recién ahí se lanzan agentes.

## NO verificado (va a la prueba manual)
- Todavía no hay código ni datos externos usados.
- Candidatas para el Investigador: qué sitios bloquean la lectura automática de título e imagen de un link (D13); pasos para agregar la web a la pantalla de inicio en iPhone y Android (D11); costo por uso de una API de IA (para la ficha automática, después de la v0.1).

## Pendiente / fuera de esta versión
- Fuera de la v0.1 por D3, D6, D9, D10 y D13 (confirmar en el PLAN): búsqueda de texto, ranking público, poder real en el grupo, insignias, premios reales, avisos automáticos y ficha automática con IA.
- Dentro de la v0.1 (confirmar tamaño en el PLAN): "Lo probé ✓" (D7), pestaña Explorar por tipo (D12) y botón "Copiar resumen semanal" (D14).

## Vence (revisar en cada arranque)
| Qué | Fecha | Qué hacer |
|---|---|---|
| Confirmar tamaño L (D2) | Al aprobar el PLAN | Preguntarle a Manu |
| Crear `main` en GitHub | Cuando Manu lo autorice | Commit inicial en `main` y `git remote set-head origin main` |

## Reglas que no se negocian
Cero supuestos. Sin secretos por el chat. Código solo en la rama designada. Sin merge, deploy ni gasto de créditos sin el OK de Manu.

## Perfil de Manu
No técnico, escribe en español, speedcuber y ajedrecista: pasos simples, el porqué en una línea y analogías. Aprueba entre etapas.

## Efímero (se pierde al compactar)
El prototipo de estética en Artifact (su link queda en DECISIONES al elegir). Todo lo demás está en el repo.
