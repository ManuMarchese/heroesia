-- Heroes IA · v0.1 · 0005: saber si la clave del link es correcta ANTES de crear la cuenta (D42).
-- Se aplica DESPUÉS de 0004. Sin esto, cada clave mala dejaría un usuario vacío en Auth del proyecto compartido.
-- Solo responde sí o no: no escribe nada ni revela la clave.
create function public.invitacion_valida(p_clave text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.invitacion v
    where v.clave_hash = encode(sha256(convert_to(coalesce(p_clave, ''), 'UTF8')), 'hex')
  )
$$;
revoke all on function public.invitacion_valida(text) from public;
grant execute on function public.invitacion_valida(text) to anon, authenticated;
