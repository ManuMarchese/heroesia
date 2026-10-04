-- Heroes IA · v0.1 · 0003: convivir con otras apps en el mismo proyecto de Supabase (D40).
-- Se aplica DESPUÉS de 0001 y 0002, una sola vez. En un proyecto exclusivo de Heroes IA también es válida.
-- 1) Solo los héroes (quien tiene perfil) leen datos del grupo: las políticas "miembros leen" de 0001
--    dejaban leer a cualquier usuario con sesión del proyecto, también al de otra app.
-- 2) El perfil ya no se crea solo por cada usuario nuevo de Auth (eso sumaría a quien se registre en otra app):
--    se crea a mano al invitar, con public.sumar_heroe('mail@ejemplo.com').

create function public.es_heroe() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfiles p where p.id = auth.uid())
$$;
revoke all on function public.es_heroe() from public, anon;
grant execute on function public.es_heroe() to authenticated;

drop policy "miembros leen" on public.configuracion;
drop policy "miembros leen" on public.perfiles;
drop policy "miembros leen" on public.aportes;
drop policy "miembros leen" on public.acciones;
drop policy "miembros leen" on public.feedback_util;
drop policy "miembros leen" on public.eventos_xp;
drop policy "miembros leen" on public.misiones;
create policy "héroes leen" on public.configuracion for select to authenticated using (public.es_heroe());
create policy "héroes leen" on public.perfiles for select to authenticated using (public.es_heroe());
create policy "héroes leen" on public.aportes for select to authenticated using (public.es_heroe());
create policy "héroes leen" on public.acciones for select to authenticated using (public.es_heroe());
create policy "héroes leen" on public.feedback_util for select to authenticated using (public.es_heroe());
create policy "héroes leen" on public.eventos_xp for select to authenticated using (public.es_heroe());
create policy "héroes leen" on public.misiones for select to authenticated using (public.es_heroe());

drop trigger crear_perfil on auth.users;
drop function public.crear_perfil();

-- Da de alta como héroe a alguien que YA existe en Auth (invitado desde el panel). Solo la corre Manu
-- en el SQL Editor (rol postgres): ni la app ni el navegador pueden llamarla.
create function public.sumar_heroe(p_email text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  usuario auth.users;
begin
  select * into usuario from auth.users u where lower(u.email) = lower(btrim(p_email));
  if usuario.id is null then
    raise exception 'No hay un usuario de Auth con el email %', p_email;
  end if;
  insert into public.perfiles (id, nombre)
  values (usuario.id, left(coalesce(nullif(btrim(usuario.raw_user_meta_data ->> 'nombre'), ''),
                                    nullif(split_part(coalesce(usuario.email, ''), '@', 1), ''), 'Héroe'), 40))
  on conflict (id) do nothing;
  return usuario.id;
end $$;
revoke all on function public.sumar_heroe(text) from public, anon, authenticated;
