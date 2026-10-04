# Aprendizajes de Heroes IA (v0.1 a v1.0)

Trampas y lecciones para el próximo proyecto. Solo se agrega.

## Supabase y proyectos compartidos
- **Mirar antes de aplicar SQL en un proyecto que no es nuevo:** tablas, usuarios y triggers de `auth.users`. En este caso había 117 tablas ajenas y un trigger de otra app que se dispara en cada alta.
- **El login y sus ajustes son de todo el proyecto:** apagar registros, cambiar SMTP, plantillas o Site URL rompe las otras apps. Se evita tocarlos.
- **Políticas "para cualquier usuario con sesión" dejan leer a los de otras apps.** En un proyecto compartido el acceso se ata a pertenecer (`es_heroe()`).
- **El mail por defecto de Supabase solo manda a miembros de la organización** (2 por hora). Para amigos hace falta SMTP propio (30 por hora al configurarlo) o evitar el mail.
- **Login sin mails:** con "Confirm email" apagado, `signUp` con usuario y clave devuelve sesión al instante. Se usa un email inventado (`usuario@dominio-falso`). Costo: no hay recuperación de clave por mail.
- **Un link de mail se usa una sola vez**, y si se abre dos veces (vista previa y app) el segundo intento falla. Por eso el código de 6 números es mejor en el celular; pero la plantilla tiene que incluir `{{ .Token }}`.
- **Nunca cargar la service role en el hosting** de una app que comparte proyecto: abre los datos de todas.

## Base de datos y migraciones
- Los `check` sin nombre de una migración vieja no se pueden soltar por nombre fijo. Buscarlos por su **definición** (`pg_get_constraintdef`) y ser **muy específico**: un patrón demasiado amplio se llevó por delante otro check (lo cazó un test existente).
- Aplicar cada migración **en una sola transacción** (`begin; ...; commit;`) con la CLI: si algo falla, no queda nada a medias.
- Las pruebas con **PGlite** sobre las migraciones reales cazan errores que los tests de la app no ven (RLS, permisos por columna, cascadas).
- La clave de una invitación no va en el repo: se guarda como hash y se carga aparte.

## Proceso y herramientas
- **Lo más fácil para Manu manda:** si pide "lo más fácil posible", buscar primero la solución que no le pida pasos manuales, y avisarle de los costos reales (por ejemplo, sin recuperación de clave).
- **Un solo despliegue por tanda**, con copia limpia en verde y migración aplicada antes. Desplegar por CLI evita depender de Git en Vercel.
- **Backup de tablas antes de cambios de base con riesgo** (se hizo antes de 0006 y 0007).
- **Windows:** el clon necesita `core.longpaths=true` si la carpeta de la sesión tiene una ruta larguísima.
- **Shell:** los scripts con muchas comillas o heredocs anidados fallan; usar la herramienta de escritura de archivos.
- **`next dev` crea `AGENTS.md` y `CLAUDE.md`** solos: borrarlos antes de commitear si no se decidió versionarlos.
- **Contraseñas:** no se escriben en sitios reales, ni de prueba. La prueba de login real la hace Manu.
- Un test que fallaba por **lentitud de la máquina** (timeouts de 5 s en PGlite) pasó al repetir: no confundirlo con una regresión.

## Producto
- El **reloj** de una pantalla se toma **después** de registrar un evento: si no, el +5 de "Entrar" aparece recién en la segunda apertura.
- Los **errores que viajan por la URL** se muestran solo si son mensajes conocidos de la app (evita que alguien arme un link con texto inventado).
- Una **redirección segura** debe validar el resultado ya normalizado (`/.//sitio` termina como `//sitio`).
