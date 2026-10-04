# Heroes IA · v1.0: el proyecto en una página

> Documento para Manu, en lenguaje simple. Para lo técnico: `README.md`. Para el estado exacto y lo pendiente: `STATE.md`. Para el porqué de cada decisión: `docs/DECISIONES-v0.1.md` (D1 a D45).

## Qué es
Una web app privada, pensada para el celular, donde un grupo de amigos (5 a 15) comparte **skills, repos, noticias, oportunidades, proyectos y tecnología** para aprender IA juntos. Se gana **XP**, se sube de **nivel**, hay **clases** y una **misión semanal** con un capitán que rota.

## Dónde vive hoy (producción)
| Pieza | Dónde | Detalle |
|---|---|---|
| La app | https://heroesia.vercel.app | Vercel, plan gratis. Se despliega **por la CLI** (`vercel deploy --prod --yes`), no por Git. |
| La base de datos y el login | Supabase, proyecto **"speedcuber…"** | Es un proyecto **compartido** con otras apps tuyas (117 tablas, usuarios y triggers ajenos). |
| El código | GitHub `ManuMarchese/heroesia`, rama `claude/heroes-ia-app-planning-tdopih` | `main` es solo documentación. |

## Cómo entra la gente
- **Vos:** por la opción "Entrar con email" (plegada abajo en `/entrar`). Ya estás dado de alta como héroe.
- **Tus amigos:** con **un solo link de invitación** (`https://heroesia.vercel.app/entrar?invitacion=LA-CLAVE`). Tocan el link, eligen un **usuario y una clave** (mínimo 8 caracteres), y quedan adentro. **No hace falta ningún mail** ni cargar a nadie a mano.
- **Seguridad mínima, a propósito:** sin la clave del link, nadie ve datos de Heroes IA (aunque tenga cuenta en tus otras apps). Cada persona tiene 5 intentos fallidos por hora.
- **Si el link se filtra:** se cambia la clave con SQL (ver `docs/SETUP-MANU.md`, "Link de invitación") y el link viejo deja de servir. Los que ya entraron siguen adentro.
- **Si alguien olvida su clave:** no hay "olvidé mi clave" por mail. Se la cambiás vos con el SQL de `docs/SETUP-MANU.md`.

## Qué puede hacer cada persona
- **Publicar** un aporte (pegar el link y completar: título, por qué sirve, y campos extra según el tipo).
- **Explorar:** aparece **Todos** por defecto, y después Skill, Repo, Noticia, Oportunidad, Proyecto y **Tecnología**.
- **Reaccionar:** "Lo probé" (Skill, Repo y Tecnología), "Lo leí" (Noticia), "Me interesa" (Oportunidad, sin XP) o "Dar feedback" (Proyecto).
- **Editar y borrar** sus propios aportes (borrar pide confirmación y borra también las pruebas y el feedback; el XP ya ganado no se resta).
- **Favoritos:** guardar cualquier aporte en una de **sus** carpetas privadas (una carpeta por aporte). Se ven en **Perfil → Mis favoritos**.
- **Perfil:** nivel, rango, clase, récord, cambiar el nombre y salir.

## Cómo está armada (resumen)
- **Next.js 16 + Supabase.** Las pantallas llaman a "casos" y estos a una capa de datos con dos versiones: Supabase y demostración (`HEROES_DEMO=1`, solo para probar en tu compu).
- **La seguridad real está en la base** (reglas RLS): cada cosa se puede tocar solo si es tuya. Sin perfil de héroe no se lee nada.
- **Migraciones** (`supabase/migrations/`, se aplican en orden, una sola vez cada una; ya están todas aplicadas): 0001 tablas · 0002 una entrada por día · 0003 aislamiento para proyecto compartido · 0004 y 0005 link de invitación · 0006 favoritos · 0007 tipo Tecnología.
- **Tests:** 442 (dominio, datos, y la base completa sobre Postgres en memoria). `npm test`, y la prueba completa en copia limpia con `verificar-copia-limpia.sh`.

## Cosas a saber (límites reales)
- La base es **compartida**: cada alta de un amigo también crea una fila en `oh_profiles` de tu otra app (efecto de un trigger ajeno).
- La **confirmación de email del proyecto está apagada** (por eso el alta con usuario y clave anda sin mails). Si la encendés, el alta falla.
- **Nunca** cargues la clave secreta (service role) en Vercel: en un proyecto compartido abre los datos de todas tus apps.
- No hay respaldo automático: antes de un cambio de base con riesgo, sacá uno (se hizo antes de las migraciones 0006 y 0007, en una carpeta local).

## Cómo seguir
1. Cambios chicos: pedirlos, probarlos en local con `HEROES_DEMO=1 npm run dev`, verificar en copia limpia, aplicar la migración si hay, y **un solo despliegue**.
2. Antes de invitar amigos de verdad: hacer la prueba manual de `docs/CHECKLIST-MANUAL-v0.1.md` con otra persona.
3. Lo pendiente está en `STATE.md`.
