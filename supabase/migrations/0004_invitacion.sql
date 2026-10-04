-- Heroes IA · v0.1 · 0004: entrada por link de invitación (D41). Se aplica DESPUÉS de 0003, una sola vez.
-- Quien tiene sesión pero no perfil llama a public.unirme('clave'): si la clave del link es correcta, se crea
-- su perfil de héroe. La clave se guarda como hash en una tabla sin permisos para la app (solo la lee la función).
-- La clave real NO va en este archivo: se carga aparte (docs/SETUP-MANU.md, "Link de invitación").

create table public.invitacion (
  id boolean primary key default true check (id),
  clave_hash text not null
);
create table public.intentos_union (
  id bigint generated always as identity primary key,
  usuario_id uuid not null,
  created_at timestamptz not null default now()
);
create index intentos_union_usuario on public.intentos_union (usuario_id, created_at);
alter table public.invitacion enable row level security;
alter table public.intentos_union enable row level security;
revoke all on table public.invitacion, public.intentos_union from public, anon, authenticated;

-- true: ya es héroe o la clave era correcta. false: clave incorrecta. Error 'demasiados_intentos': más de 5 fallos en 1 hora.
create function public.unirme(p_clave text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  yo uuid := auth.uid();
  usuario auth.users;
begin
  if yo is null then
    raise exception 'sin_sesion';
  end if;
  if exists (select 1 from public.perfiles p where p.id = yo) then
    return true;
  end if;
  if (select count(*) from public.intentos_union i where i.usuario_id = yo and i.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'demasiados_intentos';
  end if;
  if exists (
    select 1 from public.invitacion v
    where v.clave_hash = encode(sha256(convert_to(coalesce(p_clave, ''), 'UTF8')), 'hex')
  ) then
    select * into usuario from auth.users u where u.id = yo;
    insert into public.perfiles (id, nombre)
    values (yo, left(coalesce(nullif(btrim(usuario.raw_user_meta_data ->> 'nombre'), ''),
                              nullif(split_part(coalesce(usuario.email, ''), '@', 1), ''), 'Héroe'), 40))
    on conflict (id) do nothing;
    return true;
  end if;
  insert into public.intentos_union (usuario_id) values (yo);
  return false;
end $$;
revoke all on function public.unirme(text) from public, anon;
grant execute on function public.unirme(text) to authenticated;
