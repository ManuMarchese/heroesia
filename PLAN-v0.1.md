# PLAN v0.1: Heroes IA, la red privada de amigos para aprender IA de élite

> **Aviso (2026-10-04):** este plan es el original de la v0.1. El estado actual está en `STATE.md` y `docs/PROYECTO.md`; las decisiones posteriores (D40 a D45) cambiaron la entrada (link de invitación, usuario y clave) y sumaron editar, borrar, favoritos y Tecnología.

> **APROBADO por Manu el 2026-10-03 (tamaño M, D21)** · Rama: `claude/heroes-ia-app-planning-tdopih` · Base: repo vacío (no existe `main`)
> Datos externos: `docs/REFERENCIAS-DOC.md` (se crea con el Investigador). Regla: **ningún supuesto**. Todo dato sale del repo, de ese archivo o de una fuente citada; si no, dice "NO VERIFICADO".

## 1. Decisiones de Manu (2026-10-03)
1. **Meta:** una v0.1 que tus amigos usen **hoy** (D19): entrar → publicar → ver el feed → reaccionar → ganar XP (D6), más "Lo probé ✓" (D7), pestaña Explorar por tipo (D12) y botón "Copiar resumen semanal" (D14).
2. **Presupuesto:** horas: hoy (D19) · gasto: lo decidís vos desde Claude Desktop (D16) · saldo y otros límites: no informados.
3. **Prohibido / descartado:** nada prohibido (D17). Fuera de la v0.1: ranking público, búsqueda de texto, avisos automáticos, ficha con IA, poder real en el grupo, insignias y premios (D3, D6, D9, D10, D13).
4. **Producto y estética ya decididos:** D1 a D15 y D22 a D24: grupo de 5 a 15, motor biblioteca viva + progreso, contenido con base común + plantillas, XP mixto, equipo + récord, rango y clase, sin avisos, celular primero, "Base del héroe", link + ficha mínima, resumen copiable, look A · Cómic, entrada por link mágico, capitán rotativo y arranque con misión inicial. Cuentas de partida: Vercel y Supabase (D17).
5. **Agentes:** Investigador en Sonnet, Builder en Opus y Guardián en Sonnet (plantel por defecto del framework: confirmalo o cambialo). Las definiciones no se cargan a mitad de sesión, así que se lanzan como agentes genéricos con el cuerpo de la plantilla como prompt. Con un agente genérico se fija el modelo pero no el `effort`; se registra en DECISIONES al lanzar.

## 2. Estado verificado del repo (2026-10-03)
- Remoto `ManuMarchese/heroesia`: `git ls-remote origin` no devolvió ramas al arrancar. Hoy existe solo la rama de trabajo, con documentación; no hay `main`, y el `HEAD` del remoto apunta al mismo commit que la rama de trabajo.
- Código: ninguno. Tests, typecheck y build: no aplica todavía.
- Diseño: `docs/diseno/TOKENS.md` y `docs/diseno/look-a-comico.dc.html` (prototipo de referencia; nadie lo abrió en un navegador).
- Límites del entorno: no hay Supabase ni Vercel reales (D18). Login, base de datos y deploy no se pueden probar acá y van al checklist manual de Manu. Mobbin no se pudo usar (pide plan pago). Si `npm` funciona desde este entorno: **NO VERIFICADO** (se comprueba antes de construir).

## 3. Backlog (pedido de Manu contra lo que hay en el código)
Repo vacío: no hay `archivo:línea`; la fuente de cada ítem es la decisión.

| ID | Pedido | Fuente |
|---|---|---|
| B1 | Web para celular, instalable, con el look A como variables CSS | D11, D15 |
| B2 | Login privado con Supabase por link mágico por email o código de 6 dígitos. Quién puede entrar: registros públicos apagados; vos invitás desde el panel de Supabase | D22, D32 |
| B3 | Datos: una base común + 5 plantillas (Skill, Repo, Noticia, Oportunidad, Proyecto), con reglas de acceso dentro de la base (RLS) | D5 |
| B4 | XP y niveles: puntos y topes diarios en un solo archivo de configuración | D7 |
| U1 | Pantalla "Base del héroe": tu nivel y XP, tu récord personal, misión del equipo y "Lo nuevo" | D8, D12 |
| U2 | Publicar: pegar link, traer título e imagen si se puede, elegir el tipo y escribir una línea de "por qué sirve"; si la lectura falla, se completa a mano | D13 |
| U3 | Acción por tipo que da XP: "Lo probé ✓" (Skill, Repo), "Lo leí" (Noticia), "Me interesa" (Oportunidad), "Dar feedback" (Proyecto) | D7, propuesta |
| U4 | Explorar: lista por tipo, sin búsqueda de texto | D6, D12 |
| U5 | Perfil: nivel, rango, clase y récord personal | D8, D9 |
| U6 | Misión semanal del equipo: capitán rotativo, misión de reemplazo y progreso automático | D8, D23 |
| U7 | Botón "Copiar resumen semanal" | D14 |
| S1 | Arranque: misión inicial "cada uno suma 2 aportes" y estados vacíos con llamado a sumar el primer aporte. Contenido semilla: opcional | D24 |

**Valores iniciales de XP (propuesta del orquestador, aprobada con el plan en D21; se ajustan con uso real, D7):**

| Acción | XP | Tope diario |
|---|---|---|
| Entrar | 5 | 1 vez |
| Publicar un aporte | 10 | 3 |
| "Lo leí" | 2 | 10 |
| "Lo probé" con tu resultado | 30 | 5 |
| Feedback útil (lo marca el autor del proyecto) | 25 | 5 |

- **Curva de niveles y nombres de rangos:** los propone el Builder (simple y creciente), los anota en el archivo de configuración y vos los revisás en el checklist.
- **Clase (propuesta):** el tipo de aporte donde más XP sumaste en los últimos 30 días. Builder = Proyectos, Scout = Noticias y Oportunidades, Curador = Skills y Repos, Mentor = Feedback dado.
- **Campos de cada aporte (propuesta):** todos llevan link, título, imagen (si hay), "por qué sirve" (una línea, obligatoria), autor y fecha. Extra por tipo: Skill, "cómo se usa" (opcional); Noticia, la fuente (del link); Oportunidad, fecha límite (obligatoria; vencida, se atenúa); Proyecto, "qué querés que miren" (obligatorio).
- **Misión semanal, reglas por defecto (D23; las podés vetar):** el capitán de cada semana se calcula por orden de ingreso y rota; elige qué acción cuenta (probar, leer, dar feedback o publicar) y la meta; si no la define a tiempo, rige una misión de reemplazo de una lista fija; el progreso se cuenta solo; la semana va de lunes a domingo, hora de Buenos Aires (NO VERIFICADO: supuesto).

## 4. Pipeline (tamaño M; puerta de aprobación de Manu entre etapas)
| Paso | Etapa | Entra → Sale | Permisos |
|---|---|---|---|
| 1 | Plan | este archivo → aprobado por Manu (hecho, D21) | n/a |
| 2 | Investigador (mínimo) | Q1…Q8 → `docs/INVESTIGACION-v0.1.md` | Solo lectura + búsqueda web |
| 3 | Builder | plan + decisiones + tokens + investigación → commits en la rama de trabajo | Escribe código; sin deploy, sin push a otra rama |
| 4 | Guardián | diff → APROBADO / RECHAZADO + checklist manual + rollback | Solo lectura + comandos |
| 5 | Deploy | APROBADO + OK de Manu → deploy desde Claude Desktop | Manu |
| 6 | Cierre | STATE, DECISIONES, APRENDIZAJES y traspaso verificado | Orquestador |

**Stack de partida (propuesta del orquestador, NO VERIFICADO):** Next.js con TypeScript sobre Vercel, y Supabase para base de datos y login (D17). El Investigador confirma versiones y forma oficial de integración (Q4).

**Preguntas del Investigador (cada dato con fuente oficial y fecha, o NO VERIFICADO):**
- Q1. **Bloqueante.** Supabase Auth con link mágico: cómo funciona y qué límites tiene el envío de emails en el plan gratis con el servicio de email por defecto (por ejemplo, emails por hora). ¿Alcanza para que 5 a 15 personas entren el mismo día?
- Q2. Supabase plan gratis: límites de base de datos y almacenamiento, y si un proyecto inactivo se pausa.
- Q3. Vercel plan gratis: límites y condiciones de uso, y marca de commit para saltear el deploy automático si el repo se conecta.
- Q4. Forma oficial y versiones actuales para integrar Supabase Auth con Next.js y proteger rutas.
- Q5. Leer título e imagen de un link desde el servidor: qué sitios lo bloquean (por ejemplo X, LinkedIn), qué hacer cuando falla y límites de la API pública de GitHub para repos.
- Q6. Web instalable en celular: pasos exactos para agregarla a la pantalla de inicio en iPhone y Android, y qué exige el manifest.
- Q7. Licencia de las fuentes Lilita One y Nunito, y cómo cargarlas.
- Q8. Cómo restringir el registro a invitados cuando se entra por link mágico (código de invitación, lista de emails permitidos, hooks de Auth) y cuál es compatible con el plan gratis.

**Pasos del Builder (8 commits, 2 pasadas, D33):**
- Pasada 1: 1 Proyecto base y tokens (B1) · 2 Reglas puras con tests: tipos, XP, niveles, misión, resumen (B4, U6, U7) · 3 Datos: SQL, capa de acceso y modo demostración (B3) · 4 Acceso (B2).
- Pasada 2: 5 Pantallas: Base del héroe, Explorar, Perfil (U1, U4, U5, S1) · 6 Publicar con lectura segura de links (U2) · 7 Acciones, XP, misión semanal y resumen (U3, U6, U7) · 8 Verificación en Chromium, checklist manual y guía de configuración.

**Posturas de planeadores:** no aplican en M (D20).

## 5. Riesgos
- Arranque en frío (app vacío, actividad cero, D24) → misión inicial, estados vacíos con llamado a la acción y, si querés, contenido semilla.
- Link mágico: con el email por defecto de Supabase no le llega a tus amigos (Q1, D30) → antes de invitar configurás un SMTP propio con dominio verificado (D32); plan B: email y clave o links por WhatsApp.
- Capitán rotativo: la semana queda sin misión (D23) → misión de reemplazo automática.
- Sin avisos (D10) → botón "Copiar resumen semanal" (D14) y que lo postees en el grupo.
- "Hoy" empuja a recortar pruebas → Guardián independiente del Builder y checklist manual; lo no verificado se declara.
- Look intenso (D15) → tokens en variables CSS para suavizarlo sin rehacer pantallas.
- Reglas de acceso mal puestas (login y SQL) → el Guardián las revisa; las claves nunca van por el chat; el checklist incluye probar con 2 usuarios.
- Límites de los planes gratis desconocidos (D16, D17) → Q1 a Q3 antes de construir; el gasto lo decidís vos en Desktop.
- La lectura de links falla en algunos sitios (D13) → siempre se puede completar a mano.
- XP inflado o tramposo → topes diarios en un archivo de configuración (D7).
- El prototipo no se probó en navegador (D15) → el Builder prueba en Chromium real y deja capturas.
- El alcance crece → todo lo que no esté en este plan va a "después".

## 6. Dudas (estado al 2026-10-03)
1. **Acceso:** resuelta, link mágico por email o código (D22, D32). Quién entra: registros apagados e invitación desde el panel de Supabase. Antes de invitar configurás el SMTP propio. A confirmar: tu respuesta de D32.
2. **Misión semanal:** resuelta, capitán rotativo (D23), con reglas por defecto.
3. **Arranque en frío:** resuelta, misión inicial sin contenido semilla (D24).
4. **Tamaño:** resuelta, M (D21).
5. **Rama `main`:** abierta. Hoy GitHub usa la rama de trabajo como la por defecto. Crear `main` necesita tu OK.
6. **A confirmar en el checklist:** valores de XP, rangos y clases; reglas por defecto de la misión semanal.

## 7. Seguimiento
- [x] Plan aprobado por Manu (D21)
- [x] 2 Investigador (reporte verificado, `docs/INVESTIGACION-v0.1.md`; parada por Q1, D30) · [x] 3 Builder (pasadas 1 y 2 hechas y verificadas, D34, D36) · [ ] 4 Guardián (1.ª revisión: RECHAZADO con 3 bloqueantes, D37; pasada 3 de correcciones, D38) · [ ] 5 Deploy (Manu, Desktop) · [ ] 6 Cierre
