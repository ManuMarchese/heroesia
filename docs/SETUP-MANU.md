# Guía de configuración para Manu (Supabase y Vercel)

Pasos para poner Heroes IA en marcha antes de invitar a tus amigos (D16, D18, D32). Van en el orden que funciona: cada paso usa algo del anterior. No hace falta pasar ninguna clave por el chat.

**Fuentes:** `docs/INVESTIGACION-v0.1.md` (casi todo es de segunda mano: la red del entorno bloqueó las páginas oficiales). Todo nombre de botón o pantalla de Supabase o Vercel que no salió de una fuente oficial dice **NO VERIFICADO**: si no lo encontrás con ese nombre, buscá el equivalente.

## 1. Crear el proyecto de Supabase
1. En supabase.com, creá un proyecto nuevo (plan gratis alcanza para 5 a 15 personas, Q2). Anotá la región que elijas.
2. Por qué: ahí viven la base de datos y el login.
3. Ojo: un proyecto gratis se pausa después de 1 semana sin actividad y se reactiva a mano (Q2, segunda mano).

## 2. Aplicar la migración (una sola vez)
1. Abrí el **SQL Editor** del proyecto (nombre **NO VERIFICADO**).
2. Pegá todo el contenido de `supabase/migrations/0001_init.sql` y ejecutalo. Después, en ese orden, `0002_entrada_diaria.sql` y `0003_proyecto_compartido.sql` (la misma carpeta).
3. Una sola vez cada una: si las corrés de nuevo dan error, porque las tablas y el índice ya existen.
4. Por qué: la 0001 crea las tablas, las reglas de acceso (RLS) y el trigger que crea el perfil de cada persona invitada; la 0002 limita a una "entrada" (+5 XP) por persona y por día; la 0003 hace que solo los héroes lean los datos y que el perfil se cree al invitar (`select public.sumar_heroe('mail@ejemplo.com');` en el SQL Editor, después de invitar), no por cada usuario nuevo de Auth (D40: sirve si el proyecto de Supabase lo comparten otras apps).

## 3. Apagar los registros públicos
1. En la configuración de Auth, apagá **"Allow new users to sign up"** (nombre según la guía de Supabase leída en el repo oficial, Q8).
2. Por qué: así solo entran las personas que vos invitás. Un email no invitado ve "No encontramos una cuenta activa con ese email. Si ya te invitaron, abrí el mail de invitación y tocá su link; si no, pedile a Manu que te invite."

## 4. Configurar tu SMTP propio
1. Con el email por defecto de Supabase el link mágico solo llega a miembros de tu organización y con un tope de 2 por hora (Q1, D30): para tus amigos hace falta un SMTP propio.
2. Necesitás un **dominio propio verificado** y una cuenta en un proveedor de email (la investigación nombra Resend, Brevo, AWS SES, Postmark, SendGrid y ZeptoMail; Resend y Brevo piden dominio verificado). El gasto lo decidís vos (D16).
3. En la configuración de SMTP de Auth (nombre **NO VERIFICADO**) cargá host, puerto, usuario, clave y remitente que te da el proveedor (Q1).
4. Con SMTP propio el tope arranca en 30 mails por hora y se puede subir en los límites de Auth (Q1, segunda mano). Para 15 personas alcanza.

## 5. Plantillas de mail
Con SMTP propio se pueden editar las plantillas (Q1). La app recibe el link en `/auth/confirm` y también acepta el código de 6 dígitos que se escribe en la pantalla de entrada (útil en iPhone con la app instalada, Q6).

En cada plantilla poné el código y el link así (nombres de plantilla y variables según el plan del orquestador y la guía de Supabase leída de segunda mano: **NO VERIFICADO** en un proyecto real):

| Plantilla | Código | Link |
|---|---|---|
| Magic Link | `{{ .Token }}` | `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` |
| Invite | `{{ .Token }}` | `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite` |
| Confirm signup | `{{ .Token }}` | `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup` |

Texto sugerido (sin emojis): "Tu código para entrar a Heroes IA es {{ .Token }}. También podés tocar este link: …". El código vence en 1 hora por defecto (Q1).

## 6. Variables en Vercel y primer deploy
1. Creá el proyecto en Vercel desde Claude Desktop (D18). Cómo lo conectás lo decidís vos; ver el punto 6.4.
2. Cargá estas variables de entorno (pantalla de variables del proyecto, nombre **NO VERIFICADO**):
   - `NEXT_PUBLIC_SUPABASE_URL`: la URL del proyecto de Supabase.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: la clave publicable (`sb_publishable_...`, Q4).
   - `GITHUB_TOKEN` (opcional): si al pegar repos de GitHub aparece "GitHub no deja leer más repos por ahora", cargá un token personal de GitHub que no tenga permisos sobre tus repos (sin token son 60 pedidos por hora por IP, Q5). Cómo crearlo en GitHub: **NO VERIFICADO**.
3. **Nunca** cargues `HEROES_DEMO` (es el modo demostración con datos de ejemplo) ni la clave secreta de Supabase (`sb_secret_...`): la app no la usa. Aunque `HEROES_DEMO=1` quedara cargada por error, la app la ignora en la producción de Vercel (D35, `VERCEL_ENV=production`, comportamiento de Vercel **NO VERIFICADO**).
4. **Cómo desplegar (lo elegís vos):**
   - Si conectás el repo de GitHub a Vercel: los commits de este repo tienen como autor "Claude <noreply@anthropic.com>", y según una guía de Vercel (Q3, segunda mano) en un repo privado con plan Hobby solo se despliegan commits cuyo autor es el dueño. Puede que el deploy no arranque solo: en ese caso hacé vos un commit (o desplegá a mano) y revisalo.
   - Si desplegás sin conectar Git (por ejemplo, subiendo el proyecto desde Desktop), ese riesgo no aplica.
   - Node: el `package.json` pide Node 22 o más (Q3).
5. Anotá la dirección que te da Vercel (por ejemplo `https://tu-app.vercel.app`).

## 7. Site URL y Redirect URLs en Supabase
1. En la configuración de URLs de Auth (nombres **NO VERIFICADO**): **Site URL** = la dirección de Vercel del punto 6.5.
2. En **Redirect URLs**, agregá `https://tu-app.vercel.app/auth/confirm` (con tu dirección real).
3. Por qué: el link del mail usa `{{ .SiteURL }}` y Supabase solo acepta destinos de esa lista.

## 8. Fijar la semana de lanzamiento (si lanzás en fin de semana)
La semana va de lunes a domingo, hora de Buenos Aires. Hasta la semana de lanzamiento incluida rige la misión inicial ("Cada uno suma 2 aportes"); desde la semana siguiente rota el capitán (D24, D35).

- Si no hacés nada, la semana de lanzamiento es la del **primer perfil**, que se crea cuando invitás a la primera persona. Si invitás un domingo y tus amigos entran el lunes, la misión inicial se pierde: el lunes ya rige la de reemplazo.
- Para evitarlo, antes de invitar, en el SQL Editor fijá el lunes en que querés arrancar (ejemplo: lunes 5 de octubre de 2026):

```sql
update public.configuracion set lanzamiento_en = '2026-10-05';
-- Para revisar: devuelve la fecha y el lunes de esa semana.
select lanzamiento_en, public.semana_de_lanzamiento() from public.configuracion;
-- Para volver a "la semana del primer perfil":
update public.configuracion set lanzamiento_en = null;
```

Si ponés un día que no es lunes, cuenta la semana de ese día. Los miembros no pueden cambiar esta fecha.

## 9. Invitar (vos primero)
1. En **Dashboard > Authentication > Users > Add user > Send invitation** (camino según la guía de Supabase leída en el repo oficial, Q8) invitá tu email y después el de cada amigo.
2. **El orden de invitación es el orden de los capitanes:** el perfil se crea al invitar y el capitán rota por orden de ingreso. Invitá en el orden en que querés que sean capitanes.
3. El nombre de cada uno arranca con la parte de su email antes de la @; cada uno lo cambia en Perfil y todo el grupo lo ve.
4. La invitación vence en 1 hora por defecto (Q8). Si a alguien se le venció, que pida el código desde la pantalla de entrada con su email; si no le llega, reenviale la invitación (**NO VERIFICADO**: que el código sirva para una invitación vencida).

## 10. Probar antes de pasarlo
Seguí `docs/CHECKLIST-MANUAL-v0.1.md` con otra persona (5 a 8 minutos).

## Proyecto compartido con otras apps (D40)
- Si el proyecto de Supabase tiene otras apps: **no apagues "Allow new users to sign up"** (rompería el alta de las otras) y no cambies Site URL, SMTP ni las plantillas sin revisar qué rompen. Heroes IA nunca crea usuarios (`shouldCreateUser: false`) y sin perfil no se ve ningún dato (0003).
- Solo sumá la URL de Heroes IA a **Redirect URLs** (agregar, no reemplazar).
- La plantilla de mail es única por proyecto: para el código de 6 números tiene que incluir `{{ .Token }}`. Revisala sin borrar nada.
- Para dar de alta a alguien: invitalo desde el panel y corré `select public.sumar_heroe('su@mail.com');`. El orden de alta es el orden de capitanes.
