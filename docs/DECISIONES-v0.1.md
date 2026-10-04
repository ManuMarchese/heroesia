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

## Ronda 4: look y restricciones (2026-10-03)

### D15. Look A · Cómic
- **Qué:** la estética es "A · Cómic": fondo azul héroe, paneles blancos con borde grueso y sombra dura, acentos amarillo, rosa y menta; Lilita One + Nunito. Fuente de verdad: `docs/diseno/TOKENS.md` y `docs/diseno/look-a-comico.dc.html` (copia del prototipo, solo referencia visual).
- **Quién:** [Manu, 2026-10-03]. Eligió la letra A entre A, B y C.
- **Por qué:** lo eligió Manu. Criterio de diseño del orquestador: es el más divertido y el más cansador para el uso diario.
- **Evidencia:** prototipo con datos de ejemplo en https://claude.ai/artifact/Jt48RNP9nibJrKxnxWVTSD (privado). **NO VERIFICADO:** el orquestador no lo abrió en un navegador y los contrastes están calculados a mano. Mobbin no se pudo usar (pide plan pago), así que los tres looks son criterio propio, sin referencias de apps reales. Tropiezo mío: ofrecí Mobbin como disponible sin haberlo probado.
- **Costo / riesgo asumido:** look intenso para el uso diario. Los tokens van como variables CSS para poder suavizarlo después.

### D16. Gasto: sin decidir; lo decide Manu desde Claude Desktop
- **Qué:** esta sesión en la nube no gasta ni decide gastos. El gasto (planes, dominio) lo decide Manu al desplegar, desde Claude Desktop.
- **Quién:** [Manu, 2026-10-03]: "eso luego, lo voy a hacer desde mi claude desktop. ahora estamos en sesion en la nube".
- **Por qué:** separa el diseño y el código (acá) del gasto y el deploy (Desktop).
- **Evidencia:** **NO VERIFICADO.** Supuesto de trabajo del orquestador, no decisión de Manu: el diseño apunta a que alcancen los planes gratis de Vercel y Supabase. Los límites los verifica el Investigador (Q1 a Q3).

### D17. Cuentas de partida: Vercel y Supabase
- **Qué:** Manu ya tiene cuentas en Vercel (publicar) y Supabase (base de datos y login). Son el punto de partida. No declaró nada prohibido.
- **Quién:** [Manu, 2026-10-03]: "ya tengo cuentas en vercel y supabase".
- **Por qué:** aprovecha lo que ya tiene.
- **Evidencia:** **NO VERIFICADO:** las cuentas y sus planes (no se vieron, sin captura). Los secretos (claves de Supabase) los carga Manu en las variables de entorno de Vercel, nunca por el chat.

### D18. El deploy lo hace Manu desde Claude Desktop
- **Qué:** en esta sesión no se despliega ni se crea o cambia nada en Vercel ni en Supabase. El código queda en la rama de trabajo; Manu aplica el SQL en Supabase, carga las variables y despliega desde Desktop. Aunque hay herramientas de Vercel conectadas a la sesión, no se usan salvo pedido de Manu.
- **Quién:** [Manu, 2026-10-03]: "desde desktop deployeo".
- **Por qué:** el deploy es una puerta de Manu en el framework, y así se evitan gastos no decididos (D16).

### D19. Meta de tiempo: la v0.1 hoy
- **Qué:** Manu quiere la v0.1 lista hoy, en una sola sesión.
- **Quién:** [Manu, 2026-10-03]: "hoy, apps asi las hago en una sesion ez".
- **Por qué:** que los amigos la prueben ya.
- **Costo / riesgo asumido:** "hoy" solo es viable si la v0.1 se queda en el alcance de D6 y D12 a D14. Los pasos manuales de Manu (SQL, variables, deploy desde Desktop) corren por su cuenta.

### D20. Tamaño del proceso: propuesta M (reemplaza la propuesta L de D2)
- **Qué:** M en lugar de L: plan breve aprobado → Investigador mínimo → Builder → Guardián → deploy de Manu. D2 queda como historial.
- **Quién:** orquestador (propuesta). **Pendiente de aprobación de Manu** en el PLAN.
- **Por qué:** la meta es hoy (D19) y cuatro rondas de preguntas ya cubren lo que discutirían los dos planeadores y el juez. Como toca login, SQL y claves, se mantienen el Investigador, la separación Builder/Guardián y el checklist manual.
- **Costo / riesgo asumido:** M renuncia al cruce adversarial de dos planeadores; el Guardián y la revisión del orquestador cubren ese riesgo.

## Puerta del PLAN (2026-10-03)

### D21. PLAN-v0.1 aprobado con tamaño M
- **Qué:** se aprueba el `PLAN-v0.1.md` tal como estaba, con tamaño M (D20), incluidas las propuestas de la sección 3 (valores de XP, clases, campos de los aportes) y "Lo probé ✓" dentro de la v0.1. Se revisan en el checklist manual. D2 (L) queda como historial.
- **Quién:** [Manu, 2026-10-03]. Eligió "Aprobado con M".
- **Por qué:** la meta es hoy (D19).

### D22. Acceso: link mágico por email
- **Qué:** los amigos entran con un link mágico por email, sin clave. Manu eligió esta opción en lugar de la recomendada (código de invitación + email y clave).
- **Quién:** [Manu, 2026-10-03]. No dio otro motivo.
- **Costo / riesgo asumido:** depende de que el email llegue y de los límites de envío del plan gratis (**NO VERIFICADO**). Por eso Q1 del Investigador pasa a ser bloqueante: si no alcanza, el plan B es un servicio de email propio (gasto que decide Manu, D16) o volver a email y clave.
- **Pendiente derivado (orquestador):** el plan decía "acceso por invitación". Con link mágico hay que decidir cómo se controla quién entra. Propuesta por defecto: un código de invitación compartido que se pide junto con el email y se puede cambiar. El Investigador verifica qué opciones soporta Supabase (Q8) y Manu confirma con la evidencia.

### D23. Misión semanal: capitán rotativo
- **Qué:** cada semana define la misión una persona distinta del grupo. Manu eligió esta opción en lugar de la recomendada (plantillas rotativas).
- **Quién:** [Manu, 2026-10-03]. No dio otro motivo.
- **Costo / riesgo asumido:** necesita reglas y la semana puede quedar sin misión.
- **Reglas por defecto (propuesta del orquestador; Manu puede vetarlas):** (1) el capitán de cada semana se calcula por orden de ingreso y rota semana a semana, sin tarea programada; (2) el capitán elige qué acción cuenta (probar, leer, dar feedback o publicar) y la meta; (3) si no la define a tiempo, rige una misión de reemplazo de una lista fija; (4) el progreso se cuenta solo; (5) la semana va de lunes a domingo, hora de Buenos Aires (**NO VERIFICADO:** supuesto sobre dónde viven los amigos).

### D24. Arranque sin contenido semilla: misión inicial
- **Qué:** el día 1 la app arranca vacía y la primera misión es "cada uno suma 2 aportes". Manu eligió esta opción en lugar de la recomendada (contenido semilla). El contenido semilla pasa a opcional: si Manu pasa links, se cargan.
- **Quién:** [Manu, 2026-10-03].
- **Costo / riesgo asumido:** la primera pantalla puede verse vacía y depende de que todos entren el primer día. Mitigación: estados vacíos con un llamado a sumar el primer aporte y la misión inicial en la pantalla de inicio.

## Etapa 2: arranque del Investigador (2026-10-03)

### D25. Autonomía hasta el Guardián
- **Qué:** Manu da el "Dale" para el Investigador y autoriza correr Investigador → Builder → Guardián seguidos, con avisos en cada etapa en lugar de puertas. El orquestador se detiene y le pregunta si: (1) el Investigador encuentra algo que cambie una decisión suya (por ejemplo, que el plan gratis no alcance para el link mágico, Q1); (2) el Guardián rechaza dos veces; (3) hace falta gasto, merge o deploy, que siguen siendo puertas de Manu (D16, D18).
- **Quién:** [Manu, 2026-10-03]. Eligió "Dale, con autonomía hasta el Guardián".
- **Por qué:** la meta es hoy (D19).

### D26. Rama `main` creada
- **Qué:** `main` se creó en el remoto apuntando a `40ad754` (solo documentación) para que el Guardián compare el código contra una base. `origin/HEAD` local apunta a `origin/main`. La rama de trabajo sigue siendo `claude/heroes-ia-app-planning-tdopih`; el merge a `main` lo decide Manu.
- **Quién:** [Manu, 2026-10-03]. Eligió "Sí, creá main".
- **Evidencia:** `git push origin 40ad754:refs/heads/main` terminó con exit 0; `git ls-remote origin` muestra `main`, la rama de trabajo y `HEAD` en `40ad754`; `git symbolic-ref refs/remotes/origin/HEAD` devuelve `refs/remotes/origin/main`.
- **Nota:** cuál es la rama por defecto en GitHub no cambió con esto (**NO VERIFICADO**: el `HEAD` del remoto no indica cuál es). Si Manu quiere que sea `main`, se cambia en los ajustes del repo en GitHub; no verifiqué los nombres exactos de los botones.

### D27. Investigador lanzado como agente genérico
- **Qué:** el Investigador corre como agente genérico (Sonnet) con el cuerpo de la plantilla pegado como prompt y las preguntas Q1 a Q8 del PLAN. No se pudo cargar la definición ni fijar el `effort` por estar a mitad de sesión. Es de solo lectura por instrucción; se verifica con `git status` limpio al terminar.
- **Quién:** orquestador, dentro de lo aprobado en D21 y D25.
- **Por qué:** `reference/agentes.md` prevé este caso: las definiciones creadas a mitad de sesión no se cargan.

### D28. npm funciona desde este entorno
- **Qué:** el registro de npm responde desde la sesión en la nube: `npm view next version` devolvió 16.3.8 y `npm view @supabase/supabase-js version` devolvió 2.117.2 (2026-10-03, 23:59 UTC). Node v22.22.0 y npm 10.9.4. Cierra el "NO VERIFICADO" del PLAN sobre `npm`.
- **Quién:** orquestador.
- **Evidencia:** salida de los comandos citados. No prueba que `npm ci` ni el build funcionen: eso lo verifica el Builder en copia limpia.

## Etapa 2: resultado del Investigador (2026-10-04)

### D29. Reporte del Investigador verificado y guardado
- **Qué:** el reporte quedó en `docs/INVESTIGACION-v0.1.md`. Verificado por el orquestador: `git status` limpio tras el agente (no escribió nada); las versiones y fechas de npm (next 16.3.8, supabase-js 2.117.2, @supabase/ssr 0.12.7, react 19.3.0) coinciden con lo que consulté yo; los commits del repo salen con autor "Claude <noreply@anthropic.com>".
- **Quién:** orquestador.
- **Evidencia / límite:** el proxy del entorno bloqueó WebFetch en las páginas oficiales de documentación (supabase.com, vercel.com, nextjs.org y otras). Todo lo marcado [WS] o [repo] es de segunda mano: ninguna página oficial de docs se abrió. Q1 lo corroboré con una búsqueda propia (también de segunda mano).

### D30. Parada de la autonomía por Q1 (condición 1 de D25)
- **Qué:** Q1 cambia una decisión de Manu: con el email por defecto de Supabase, el link mágico (D22) solo le llega a miembros de su organización y con un tope de 2 por hora, así que los amigos no lo recibirían. Para que llegue a terceros hace falta SMTP propio, que según el Investigador exige un dominio verificado (gasto y pasos de Manu, D16). Se detiene el avance al Builder y se consulta a Manu.
- **Quién:** orquestador, por la regla de D25.
- **Alternativa (propuesta del orquestador):** email + clave + código de invitación, con las cuentas creadas desde el servidor (`admin.createUser` con `email_confirm: true`) y los registros públicos apagados. **NO VERIFICADO** con un Supabase real: va al checklist de Manu.

### D31. Corrección sobre la rama por defecto (aclara D26)
- **Qué:** tras el push de `33c18c3`, `git ls-remote origin` mostró `HEAD` en `33c18c3` (igual que la rama de trabajo) y `main` en `40ad754`. Entonces la rama por defecto en GitHub es la de trabajo, no `main`. Corrige la nota "NO VERIFICADO" de D26, que queda como historial.
- **Quién:** orquestador.
- **Evidencia:** salida de `git ls-remote origin` del 2026-10-04.

### D32. Acceso: se mantiene D22; Supabase y Vercel se configuran antes de invitar
- **Qué:** Manu no eligió ninguna de las 3 opciones y respondió con texto libre: "Antes de darselo ya si ponemos supabase y vercel. Deja solo eso sin hacer". Interpretación del orquestador, **a confirmar**: D22 se mantiene (link mágico por email); la configuración real de Supabase (incluido el SMTP propio y el dominio) y de Vercel la hace Manu antes de dárselo a los amigos, y queda sin hacer en esta sesión (coherente con D16 y D18). Se levanta la parada de D30 y arranca el Builder.
- **Quién:** [Manu, 2026-10-04] (texto citado) y orquestador (interpretación).
- **Por qué:** la meta es hoy (D19) y el SMTP, el dominio y la cuenta de email son pasos de Manu en Desktop.
- **Decisiones técnicas derivadas (orquestador, a confirmar en el checklist):** (1) entrada con `signInWithOtp`: el usuario abre el link o escribe el código de 6 dígitos, porque en iPhone el link del mail abre Safari y no la app instalada (Q6); (2) quién puede entrar: registros públicos apagados y Manu invita desde el panel de Supabase (opción A de Q8: más simple que un hook o un código); la app muestra un mensaje claro si el email no está invitado; (3) la app no usa la clave secreta de Supabase; (4) hasta que Manu configure Supabase, la app corre en modo demostración (`HEROES_DEMO=1`, solo para pruebas locales, nunca por defecto).
- **Costo / riesgo asumido:** si "eso" era el login (dejarlo sin hacer), el Builder construye una parte que Manu no quería. Por eso el acceso va aislado en un módulo (`src/auth/`) y es fácil de quitar. Antes de invitar a los amigos, Manu tiene que hacer estos pasos (van al checklist): SMTP propio con dominio verificado, apagar los registros públicos, invitar a cada amigo, aplicar el SQL y cargar las variables en Vercel.

### D33. Builder en 2 pasadas, como agente genérico
- **Qué:** el Builder corre como agente genérico (Opus) con el cuerpo de la plantilla pegado como prompt, en 2 pasadas de 4 pasos cada una (8 commits, ver PLAN sección 4). Hace commits locales; el orquestador verifica y hace el `git push` a la rama de trabajo. Sin marca de skip de hosting: no hay una nativa verificada (Q3) y el repo no está conectado a Vercel (**NO VERIFICADO**). No se pudo cargar la definición ni fijar el `effort`.
- **Quién:** orquestador, dentro de lo aprobado en D21 y D25.
- **Por qué:** una sola pasada con 8 pasos arriesga quedarse sin contexto; dos pasadas permiten verificar en el medio.

## Etapa 3: Builder, pasada 1 (2026-10-04)

### D34. Pasada 1 del Builder verificada
- **Qué:** los commits `deaeb1d` (paso 1), `04a2a28` (paso 2), `a3b3f1a` (paso 3) y `82176c2` (paso 4) quedaron verificados por el orquestador y se suben a la rama de trabajo.
- **Quién:** orquestador.
- **Evidencia:** `git status` limpio; los 4 mensajes llevan los trailers y no nombran ningún modelo; ningún archivo propio pasa de 250 líneas; el único archivo de entorno versionado es `.env.example` (sin valores); `service_role` aparece solo en el entorno de pruebas (`supabase/pruebas/entorno.ts`), no en el código de la app. `verificar-copia-limpia.sh` sobre `82176c2`: `RESULTADO: PASS en copia limpia` (npm ci, typecheck, lint, 19 archivos y 178 tests, build). Leí la migración `0001_init.sql` completa y `proxy.ts`, `sesion.ts`, `flujo.ts`, `validacion.ts` y la ruta `/auth/confirm`: no vi fallas de seguridad en esa lectura. El tope diario de XP se aplica al leer (`asignarXp`), así que insertar eventos de más no da XP.
- **Límite:** nada se probó contra un Supabase real (la migración aplicada, el trigger sobre `auth.users`, los permisos por columna vía PostgREST y `getClaims`): **NO VERIFICADO**, va al checklist de Manu.
- **Decisiones del Builder que acepto (a confirmar en el checklist):** subir del nivel n cuesta 100 × n XP; rangos Recluta, Aprendiz (nivel 3), Héroe (5), Campeón (8) y Leyenda (12); misiones de reemplazo (probar 5, publicar 6, leer 10, feedback 3); el capitán sale solo de quienes entraron antes de esa semana y define la misión una vez, solo la de la semana actual; nadie reacciona a su propio aporte; la marca de feedback útil vive en su propia tabla; `security definer` solo en los triggers; el código del mail acepta de 6 a 10 dígitos; el modo demostración muestra un aviso visible.
- **Librerías:** `@electric-sql/pglite` (solo desarrollo, Apache-2.0) para probar la migración y la RLS sin servicios: aceptada. TypeScript 5.9 y ESLint 9 por compatibilidad con typescript-eslint y eslint-config-next; npm marca ESLint 9 como sin soporte: deuda técnica a revisar.

### D35. Pasada 2: ajustes pedidos y lanzamiento
- **Qué:** antes del paso 5, la pasada 2 hace un ajuste a lo de la pasada 1 y suma tres pedidos: (1) el modo demostración se ignora cuando `VERCEL_ENV` es `production`: hoy, con `HEROES_DEMO=1` cargada por error en Vercel, el login se saltearía; (2) la semana de lanzamiento se puede fijar con `lanzamiento_en` en la configuración: hoy sale del primer perfil (el de Manu) y, si se crea antes de invitar (por ejemplo un domingo), la misión inicial se pierde. Hasta la semana de lanzamiento incluida rige la misión inicial y el capitán rota desde la semana siguiente; se edita `0001_init.sql` en el lugar porque todavía no se aplicó en ningún Supabase; (3) editar el nombre en Perfil, porque los nombres salen del prefijo del email y todo el grupo los ve; y registrar la entrada del día (XP "Entrar") y dejar las licencias OFL de las fuentes en el repo.
- **Quién:** orquestador, dentro de lo aprobado (D21, D25). Precisa D23 (reglas 3 y 5) sin reemplazarlo.
- **Por qué:** son hallazgos de mi revisión de la pasada 1; el de la semana de lanzamiento afecta el día 1 de D24.
- **Nota:** el orden de capitanes es el orden de invitación (el perfil se crea al invitar), no el del primer ingreso; va a la guía de Manu.
