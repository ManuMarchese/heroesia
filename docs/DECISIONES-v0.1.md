# Decisiones v0.1 (registro vivo)

Una entrada por decisión. Solo se agregan entradas: las viejas no se reescriben, porque son el historial de lo que se creía en ese momento. Si un dato estaba mal, la corrección va en una entrada nueva.

## Ronda 1: Fundamentos (2026-10-03)

### D1. Qué es Heroes IA
- **Qué:** app privada para un grupo de amigos que quieren aprender IA de élite compartiendo skills, repos, noticias, oportunidades y feedback de proyectos. Se construye con Framework Manu.
- **Quién:** [Manu, 2026-10-03].
- **Por qué:** pedido inicial. Metas: UI/UX clara, gamificación que mantenga la actividad y la haga divertida, y que sea útil y escalable en volumen de contenido.
- **Evidencia:** mensaje inicial de Manu en la sesión.

### D2. Tamaño del proceso: L (propuesto)
- **Qué:** pipeline completo con aprobación de Manu entre etapas.
- **Quién:** orquestador (propuesta); Manu no objetó el 2026-10-03. **Confirmar al aprobar el PLAN.**
- **Por qué:** app nueva desde cero, no un arreglo chico.

### D3. Grupo de 5 a 15 personas
- **Qué:** se diseña para un círculo íntimo. Sin ranking público; reconocimiento, misiones en equipo y "quién aportó qué". El modelo de datos queda listo para crecer.
- **Quién:** [Manu, 2026-10-03].
- **Por qué:** con pocas personas, un ranking desmotiva a los últimos y el app se apaga (criterio de diseño del orquestador, no un dato verificado).
- **Costo / riesgo asumido:** si el grupo pasa de unos 15, hay que revisar ligas y moderación.

### D4. Motor de retención: Biblioteca viva + Progreso visible
- **Qué:** los dos motores juntos. Biblioteca viva = lo compartido queda ordenado, buscable y con "lo probé / me sirvió". Progreso visible = niveles y skills de IA con XP.
- **Quién:** [Manu, 2026-10-03]. Respondió "1 y 2"; la recomendación del orquestador era solo la biblioteca.
- **Por qué:** el progreso rinde más apoyado en una biblioteca con buen contenido (criterio de diseño, no un dato verificado).
- **Costo / riesgo asumido:** dos motores = más alcance. Se contiene con D6.

### D5. Modelo de contenido: base común + plantillas por tipo
- **Qué:** una base compartida y una plantilla por tipo: Skill, Repo, Noticia, Oportunidad y Proyecto (feedback). Tipo nuevo = plantilla nueva. Los campos exactos se definen en el diseño.
- **Quién:** [Manu, 2026-10-03]. Aceptó la opción recomendada.
- **Por qué:** escala en volumen de contenido y permite filtrar y gamificar por tipo.
- **Costo / riesgo asumido:** más diseño inicial que un post genérico.

### D6. Alcance de la v0.1: ciclo mínimo completo
- **Qué:** entrar → publicar → ver el feed → reaccionar → ganar XP. Cada feature que se defina se etiqueta "v0.1" o "después".
- **Quién:** [Manu, 2026-10-03]. Aceptó la opción recomendada.
- **Por qué:** poco pero redondo; los amigos lo usan pronto y el uso real guía lo demás.
- **Tensión abierta:** D4 elige "biblioteca viva" y D6 deja la búsqueda fuera de la v0.1. Falta decidir qué mínimo de orden entra (tipos, tags, "lo probé") para que el feed no sea otro chat. Se resuelve en las Rondas 2 y 3.

## Ronda 2: Gamificación (2026-10-03)

### D7. XP mixto: la práctica pesa más
- **Qué:** entrar, leer y publicar da poco XP, con tope diario. Marcar "Lo probé ✓" con el resultado propio, o dar feedback útil, da mucho XP. Un solo gesto ("Lo probé ✓") alimenta la biblioteca (señal de calidad) y el progreso (XP). Los valores y el tope se definen en el diseño y se ajustan con uso real.
- **Quién:** [Manu, 2026-10-03]. Aceptó la opción recomendada.
- **Por qué:** premia el hábito y el aprendizaje real, y evita que el XP se infle por volumen (criterio de diseño, no un dato verificado).
- **Implicación (orquestador, a confirmar en el PLAN):** "Lo probé ✓" entra en la v0.1, porque es el gesto que da XP. Eso resuelve en parte la tensión de D6: el orden mínimo de la v0.1 son los tipos de D5 más "Lo probé ✓".
- **Costo / riesgo asumido:** hace falta un tope diario y definir cómo se valida un "feedback útil" (por ejemplo, con el reconocimiento de otro miembro). Queda para el diseño.

### D8. Social: equipo + tu propio récord
- **Qué:** misión semanal compartida (el equipo suma hacia una meta común) y cada persona se mide contra su mejor marca (PB, como en speedcubing). Sin ranking público, coherente con D3.
- **Quién:** [Manu, 2026-10-03]. Aceptó la opción recomendada.
- **Por qué:** con 5 a 15 personas, una tabla desmotiva a los últimos (criterio de diseño, no un dato verificado).
- **Abierto:** quién define la misión semanal. Se pregunta en la Ronda 4.

### D9. Recompensa: rango y clase de héroe
- **Qué:** rangos por nivel y una clase según el estilo de aporte. Los nombres Builder, Scout, Curador y Mentor son solo ejemplos; nombres y reglas se definen en el diseño. "Poder real en el grupo", "Insignias y colección" y "Premios reales" no se eligieron: quedan fuera de la v0.1, sin descartarlas para después.
- **Quién:** [Manu, 2026-10-03]. Marcó solo esta opción.
- **Por qué:** combina con el nombre del app (criterio de diseño).

### D10. Sin avisos en la v0.1
- **Qué:** la v0.1 no envía avisos: ni push, ni resumen automático, ni bot de WhatsApp.
- **Quién:** [Manu, 2026-10-03]. Eligió "Sin avisos en v0.1" en lugar de la recomendada (resumen semanal + push); no dio otro motivo.
- **Por qué:** es lo más simple de construir.
- **Costo / riesgo asumido:** sin avisos ni ranking público (D3, D8), el único empujón para volver es el grupo de WhatsApp. Si nadie se acuerda de abrir el app, la actividad puede caer. Mitigación propuesta por el orquestador, sin decidir: botón "Copiar resumen semanal" para pegar en el grupo. Se pregunta en la Ronda 3.

## Ronda 3: UI/UX, estructura (2026-10-03)

### D11. Celular primero
- **Qué:** se diseña primero para celular, como web que se abre con un link y se agrega a la pantalla de inicio (sin tiendas). En la compu se adapta.
- **Quién:** [Manu, 2026-10-03]. Aceptó la opción recomendada.
- **Por qué:** un solo código para celular y compu, y los amigos lo prueban antes (criterio de diseño).
- **Evidencia:** **NO VERIFICADO**: los pasos exactos para agregarla a la pantalla de inicio en iPhone y en Android. Va al Investigador.

### D12. Pantalla de inicio: "Base del héroe"
- **Qué:** al abrir, cada uno ve en una sola pantalla su nivel y XP, la misión semanal del equipo y "Lo nuevo" (con "✓ n lo probaron"). Navegación inferior: Inicio · Explorar · + · Perfil. "Explorar" muestra los aportes por tipo; la búsqueda por texto sigue pendiente (D6).
- **Quién:** [Manu, 2026-10-03]. Aceptó la opción recomendada.
- **Por qué:** une los dos motores de D4 (biblioteca y progreso).
- **Evidencia:** boceto con datos de ejemplo mostrado en la Ronda 3 de la sesión.

### D13. Publicar: link + ficha mínima
- **Qué:** se pega el link; el app intenta traer título e imagen (sin IA); la persona elige el tipo (D5) y suma una línea de por qué sirve. La ficha automática con IA queda para después de la v0.1.
- **Quién:** [Manu, 2026-10-03]. Aceptó la opción recomendada.
- **Por qué:** menos fricción sin sumar costo por uso, claves ni puntos de falla (criterio de diseño).
- **Evidencia:** **NO VERIFICADO**: qué sitios bloquean la lectura automática de título e imagen. Si falla, la persona completa a mano. Va al Investigador.

### D14. Botón "Copiar resumen semanal"
- **Qué:** un botón arma el texto "lo mejor de la semana + misión + quién subió de nivel" para pegarlo en el WhatsApp del grupo. No envía nada solo. Mitiga el riesgo de D10.
- **Quién:** [Manu, 2026-10-03]. Aceptó la opción recomendada.
- **Por qué:** el chat que ya usan hace de aviso, sin costo ni integraciones.
- **Costo / riesgo asumido:** suma una pieza chica al alcance de D6. Confirmar el tamaño en el PLAN.
