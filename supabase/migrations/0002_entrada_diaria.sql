-- Heroes IA · v0.1 · 0002: una "entrada" (XP "Entrar") por persona y por día local de Buenos Aires.
-- Se aplica DESPUÉS de 0001_init.sql, una sola vez, en el SQL Editor de Supabase (docs/SETUP-MANU.md).
-- La zona va fija en el índice porque un índice solo admite expresiones inmutables (no se puede leer
-- configuracion.zona_horaria). Si el grupo cambia de zona, hay que recrear el índice.
create unique index eventos_xp_entrar_por_dia on public.eventos_xp (
  perfil_id,
  ((created_at at time zone 'America/Argentina/Buenos_Aires')::date)
) where motivo = 'entrar';
