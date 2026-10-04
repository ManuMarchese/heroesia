# Checklist manual v0.1 (5 a 8 minutos, 2 personas)

Prueba en un Supabase real, después de seguir `docs/SETUP-MANU.md`. **A** = vos (invitado primero) y **B** = un amigo invitado, cada uno con su celular. Marcá cada punto; si algo falla, anotá qué pantalla y qué mensaje viste.

Lo que ya está probado sin servicios reales: tests (dominio, datos, migración sobre PGlite, lectura segura de links) y el humo en Chromium en modo demostración (`npm run humo`, capturas en `docs/capturas/`). Lo de esta lista **solo** se puede probar con Supabase, Vercel y celulares reales.

## 1. Entrar (2 min)
- [ ] A pide el código con su email y entra **con el link del mail**. Llega a la Base del héroe.
- [ ] B entra **con el código de 6 dígitos** escrito en la pantalla Entrar (sin tocar el link).
- [ ] Un email **no invitado** pide código: ve "Ese email no está invitado. Pedile a Manu que te invite." y no le llega nada.
- [ ] Al abrir Inicio por primera vez en el día, el XP de la tarjeta de héroe sube 5 (entrar), y no vuelve a subir al recargar.

## 2. Publicar y reaccionar (2 a 3 min)
- [ ] A publica el link de un sitio común (un diario o un blog): se completan título e imagen si el sitio los tiene; elige el tipo y escribe "por qué sirve".
- [ ] A pega un link de **X o LinkedIn**: aparece "X y LinkedIn no dejan leer sus links desde un servidor..." y puede completar a mano y publicar igual.
- [ ] A pega un repo de **GitHub**: trae "dueño/repo: descripción", o avisa que se agotó el límite de GitHub y deja completar a mano.
- [ ] B ve el aporte en **Lo nuevo** y en **Explorar** (en su tipo). Hace **Lo probé** con una línea de resultado: ve "¡Listo! Sumaste 30 XP." y "Lo probaste · +30 XP"; la prueba social sube.
- [ ] En su propio aporte, A **no** tiene botón de acción: ve "Tu aporte" (nadie reacciona a lo propio).
- [ ] A publica un **Proyecto**; B toca **Dar feedback** y lo envía; A abre "Feedback (1)" y toca **Marcar útil**; B ve 25 XP más.
- [ ] B toca **Lo leí** en una Noticia (+2 XP) y **Me interesa** en una Oportunidad (sin XP).
- [ ] B cambia su nombre en **Perfil**; A lo ve en las tarjetas de B al recargar.

## 3. Misión y capitán (1 a 2 min)
- [ ] Hasta la semana de lanzamiento incluida, la misión es "Cada uno suma 2 aportes", sin capitán, y el progreso sube al publicar (hasta 2 por persona).
- [ ] La semana siguiente al lanzamiento, A (el primero invitado) ve "Sos el capitán de esta semana", elige qué cuenta y la meta, y queda "La elegiste vos"; B no ve el formulario y, mientras A no la define, ve la misión de reemplazo.
- [ ] (Opcional, para no esperar una semana) Solo sirve si A y B fueron invitados **antes de esta semana**: el capitán sale de quienes entraron antes de la semana. En el SQL Editor fijá el lanzamiento al lunes pasado, probá el punto anterior y después volvé todo a como estaba:

```sql
update public.configuracion set lanzamiento_en = '2026-09-28'; -- lunes de la semana pasada (ejemplo)
-- ...probás en la app...
delete from public.misiones where semana = '2026-10-05';       -- lunes de esta semana (ejemplo)
update public.configuracion set lanzamiento_en = '2026-10-05'; -- tu fecha real, o null
```

## 4. Resumen (30 s)
- [ ] A toca **Copiar resumen** y lo pega en el WhatsApp del grupo: semana, lo mejor de la semana, la misión y quién subió de nivel, con el link de la app.
- [ ] Si el celular no deja copiar, aparece el texto seleccionado para copiarlo a mano.

## 5. Instalar en el celular (1 min)
- [ ] iPhone: en Safari, Compartir > "Agregar a inicio" > "Abrir como app web" > Agregar (en inglés: Share > Add to Home Screen > Open as Web App > Add, Q6; textos en español **NO VERIFICADO**). En la app instalada, entrar con el **código**: el link del mail abre Safari, no la app.
- [ ] Android: en Chrome, menú ⋮ > "Instalar" o "Agregar a la pantalla principal" (Q6; textos **NO VERIFICADO**).
- [ ] La app abre a pantalla completa, con el ícono de Heroes IA. **Salir** desde Perfil vuelve a la pantalla Entrar.

## No verificado (esta prueba lo confirma o lo descarta)
- La migración aplicada en Supabase, el trigger que crea el perfil al invitar, la RLS vía la API y `getClaims()` (solo se probaron sobre PGlite y con clientes falsos).
- SMTP propio, plantillas de mail con `{{ .Token }}` y `{{ .TokenHash }}`, invitaciones, y que el código sirva si la invitación venció.
- Que Vercel cargue `VERCEL_ENV=production` en las funciones (de eso depende que `HEROES_DEMO` se ignore ahí).
- Deploy en Vercel Hobby con commits cuyo autor es "Claude" (Q3).
- Lectura de links en sitios reales: en el entorno de construcción la red los bloquea. Se probó con un DNS y un servidor falsos, y contra un servidor local; la API de GitHub respondió con el límite agotado y la app lo informó bien.
- Tope de filas por pedido de la API de Supabase: los eventos de XP se leen de a páginas igual.
- Copiar al portapapeles en Safari de iPhone y en Chrome de Android (en Chromium de escritorio funcionó).
- Contrastes calculados a mano (TOKENS.md) y la semana de lunes a domingo en hora de Buenos Aires (D23, supuesto).

## Decisiones del Builder que confirmás o cambiás (D34 y pasada 2)
- **XP** (tabla del PLAN, en `src/domain/xp-config.ts`): entrar 5 (1 por día), publicar 10 (3), Lo leí 2 (10), Lo probé 30 (5), feedback útil 25 (5). Me interesa no da XP; el feedback suma recién cuando el autor lo marca útil.
- **Niveles**: pasar del nivel n al n+1 cuesta 100 × n XP. **Rangos**: Recluta, Aprendiz (nivel 3), Héroe (5), Campeón (8) y Leyenda (12).
- **Clase**: donde más XP sumaste en 30 días (Builder = Proyectos, Scout = Noticias y Oportunidades, Curador = Skills y Repos, Mentor = feedback útil); si empatan: Builder, Mentor, Curador, Scout.
- **Misión**: de reemplazo, rotando por semana: probar 5, publicar 6, leer 10, feedback 3. El capitán sale de quienes entraron antes de esa semana, por orden de invitación; la define una vez, solo en su semana, con meta de 1 a 50.
- **Lanzamiento** (D35): hasta la semana de lanzamiento incluida rige la misión inicial (también antes, si la fecha fijada está en el futuro); sin fecha fijada, cuenta la semana del primer perfil.
- **Chips** de los tipos que no estaban en el prototipo: Noticia blanco y Proyecto rosa.
- **Pantallas**: Lo nuevo muestra los 8 aportes más nuevos ("Ver todo" lleva a Explorar); Explorar arranca en Skill; la misión dibuja hasta 10 segmentos y hasta 5 avatares (+N); la oportunidad vencida se ve con borde punteado, chip gris y título gris.
- **Lectura de links**: no se piden X ni LinkedIn (ni t.co ni lnkd.in); solo puertos 80 y 443; plazo de 8 s y 1 MB por respuesta; en GitHub el título es "dueño/repo: descripción" y la imagen, el avatar del dueño.
- **Nombre** visible de 1 a 40 caracteres; la entrada del día se registra al abrir Inicio.
- **Modo demostración**: nunca en la producción de Vercel; en la demostración el usuario de ejemplo es el capitán de la semana.
