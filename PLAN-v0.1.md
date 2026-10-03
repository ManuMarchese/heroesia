# PLAN v0.1: Heroes IA, la red privada de amigos para aprender IA de élite

> **BORRADOR para aprobar** · 2026-10-03 · Rama: `claude/heroes-ia-app-planning-tdopih` · Base: repo vacío (no existe `main`)
> Datos externos: `docs/REFERENCIAS-DOC.md` (se crea con el Investigador). Regla: **ningún supuesto**. Todo dato sale del repo, de ese archivo o de una fuente citada; si no, dice "NO VERIFICADO".

## 1. Decisiones de Manu (2026-10-03)
1. **Meta:** una v0.1 que tus amigos usen **hoy** (D19): entrar → publicar → ver el feed → reaccionar → ganar XP (D6), más "Lo probé ✓" (D7, a confirmar), pestaña Explorar por tipo (D12) y botón "Copiar resumen semanal" (D14).
2. **Presupuesto:** horas: hoy (D19) · gasto: lo decidís vos desde Claude Desktop (D16) · saldo y otros límites: no informados.
3. **Prohibido / descartado:** nada prohibido (D17). Fuera de la v0.1: ranking público, búsqueda de texto, avisos automáticos, ficha con IA, poder real en el grupo, insignias y premios (D3, D6, D9, D10, D13).
4. **Producto y estética ya decididos:** D1 a D15: grupo de 5 a 15, motor biblioteca viva + progreso, contenido con base común + plantillas, XP mixto, equipo + récord, rango y clase, sin avisos, celular primero, "Base del héroe", link + ficha mínima, resumen copiable y look A · Cómic. Cuentas de partida: Vercel y Supabase (D17).
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
| B2 | Login privado con Supabase y acceso por invitación | Duda 1 |
| B3 | Datos: una base común + 5 plantillas (Skill, Repo, Noticia, Oportunidad, Proyecto), con reglas de acceso dentro de la base (RLS) | D5 |
| B4 | XP y niveles: puntos y topes diarios en un solo archivo de configuración | D7 |
| U1 | Pantalla "Base del héroe": tu nivel y XP, tu récord personal, misión del equipo y "Lo nuevo" | D8, D12 |
| U2 | Publicar: pegar link, traer título e imagen si se puede, elegir el tipo y escribir una línea de "por qué sirve"; si la lectura falla, se completa a mano | D13 |
| U3 | Acción por tipo que da XP: "Lo probé ✓" (Skill, Repo), "Lo leí" (Noticia), "Me interesa" (Oportunidad), "Dar feedback" (Proyecto) | D7, propuesta |
| U4 | Explorar: lista por tipo, sin búsqueda de texto | D6, D12 |
| U5 | Perfil: nivel, rango, clase y récord personal | D8, D9 |
| U6 | Misión semanal del equipo con progreso compartido | D8, Duda 2 |
| U7 | Botón "Copiar resumen semanal" | D14 |
| S1 | Contenido semilla: 10 a 15 aportes cargados antes de invitar | Duda 3 |

**Valores iniciales de XP (propuesta del orquestador; se ajustan con uso real, D7):**

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

## 4. Pipeline (tamaño M propuesto; puerta de aprobación de Manu entre etapas)
| Paso | Etapa | Entra → Sale | Permisos |
|---|---|---|---|
| 1 | Plan | este archivo → aprobado por Manu | n/a |
| 2 | Investigador (mínimo) | Q1…Q7 → `docs/INVESTIGACION-v0.1.md` | Solo lectura + búsqueda web |
| 3 | Builder | plan + decisiones + tokens + investigación → commits en la rama de trabajo | Escribe código; sin deploy, sin push a otra rama |
| 4 | Guardián | diff → APROBADO / RECHAZADO + checklist manual + rollback | Solo lectura + comandos |
| 5 | Deploy | APROBADO + OK de Manu → deploy desde Claude Desktop | Manu |
| 6 | Cierre | STATE, DECISIONES, APRENDIZAJES y traspaso verificado | Orquestador |

**Stack de partida (propuesta del orquestador, NO VERIFICADO):** Next.js con TypeScript sobre Vercel, y Supabase para base de datos y login (D17). El Investigador confirma versiones y forma oficial de integración (Q4).

**Preguntas del Investigador (cada dato con fuente oficial y fecha, o NO VERIFICADO):**
- Q1. Supabase Auth: ¿qué métodos de acceso ofrece (email y clave, link mágico, Google) y qué límites tiene el plan gratis (por ejemplo, emails por hora)?
- Q2. Supabase plan gratis: límites de base de datos y almacenamiento, y si un proyecto inactivo se pausa.
- Q3. Vercel plan gratis: límites y condiciones de uso, y marca de commit para saltear el deploy automático si el repo se conecta.
- Q4. Forma oficial y versiones actuales para integrar Supabase Auth con Next.js y proteger rutas.
- Q5. Leer título e imagen de un link desde el servidor: qué sitios lo bloquean (por ejemplo X, LinkedIn), qué hacer cuando falla y límites de la API pública de GitHub para repos.
- Q6. Web instalable en celular: pasos exactos para agregarla a la pantalla de inicio en iPhone y Android, y qué exige el manifest.
- Q7. Licencia de las fuentes Lilita One y Nunito, y cómo cargarlas.

**Posturas de planeadores:** no aplican en M (D20).

## 5. Riesgos
- Arranque en frío (app vacío, actividad cero) → contenido semilla antes de invitar (S1).
- Sin avisos (D10) → botón "Copiar resumen semanal" (D14) y que lo postees en el grupo.
- "Hoy" empuja a recortar pruebas → Guardián independiente del Builder y checklist manual; lo no verificado se declara.
- Look intenso (D15) → tokens en variables CSS para suavizarlo sin rehacer pantallas.
- Reglas de acceso mal puestas (login y SQL) → el Guardián las revisa; las claves nunca van por el chat; el checklist incluye probar con 2 usuarios.
- Límites de los planes gratis desconocidos (D16, D17) → Q1 a Q3 antes de construir; el gasto lo decidís vos en Desktop.
- La lectura de links falla en algunos sitios (D13) → siempre se puede completar a mano.
- XP inflado o tramposo → topes diarios en un archivo de configuración (D7).
- El prototipo no se probó en navegador (D15) → el Builder prueba en Chromium real y deja capturas.
- El alcance crece → todo lo que no esté en este plan va a "después".

## 6. Dudas abiertas (para Manu)
1. **Acceso:** ¿cómo entran tus amigos? (Propuesta: código de invitación + email y clave; Google queda para después.)
2. **Misión semanal:** ¿quién la define? (Propuesta: plantillas rotativas que armás vos.)
3. **Arranque en frío:** ¿quién carga los primeros aportes? (Propuesta: pasás 10 a 15 links y quedan cargados como contenido semilla.)
4. **Tamaño:** ¿M (propuesto) o L?
5. **Rama `main`:** hoy GitHub usa la rama de trabajo como la por defecto. Crear `main` necesita tu OK.
6. **A confirmar:** "Lo probé ✓" dentro de la v0.1 (D7); valores de XP, rangos y clases de arriba.

## 7. Seguimiento
- [ ] Plan aprobado por Manu
- [ ] 2 Investigador · [ ] 3 Builder · [ ] 4 Guardián · [ ] 5 Deploy (Manu, Desktop) · [ ] 6 Cierre
