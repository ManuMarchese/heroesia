-- Heroes IA v0.1: esquema inicial (B3). Lo aplica Manu en el SQL Editor de Supabase (D18).
-- Acceso: sin sesión no se ve nada; los miembros leen todo; cada uno crea y edita solo lo suyo;
-- solo el autor de un proyecto marca un feedback como útil. La app no usa la clave secreta.

-- 1. Configuración mínima: una sola fila. La zona es la de ZONA_HORARIA en src/domain/xp-config.ts.
create table public.configuracion (
  id boolean primary key default true check (id),
  zona_horaria text not null default 'America/Argentina/Buenos_Aires'
);
insert into public.configuracion default values;

-- 2. Perfiles: uno por usuario de Auth, creado por trigger. created_at es el orden de ingreso.
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null check (btrim(nombre) <> '' and char_length(nombre) <= 40),
  created_at timestamptz not null default now()
);

-- 3. Aportes: base común y campos de cada tipo.
create table public.aportes (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  tipo text not null check (tipo in ('skill', 'repo', 'noticia', 'oportunidad', 'proyecto')),
  link text not null check (link ~* '^https?://' and char_length(link) <= 2048),
  titulo text not null check (btrim(titulo) <> '' and char_length(titulo) <= 140),
  imagen_url text check (imagen_url ~* '^https?://' and char_length(imagen_url) <= 2048),
  por_que_sirve text not null check (btrim(por_que_sirve) <> '' and char_length(por_que_sirve) <= 200),
  como_se_usa text check (char_length(como_se_usa) <= 500),
  fuente text check (char_length(fuente) <= 100),
  fecha_limite date,
  que_mirar text check (btrim(que_mirar) <> '' and char_length(que_mirar) <= 300),
  created_at timestamptz not null default now(),
  check (como_se_usa is null or tipo = 'skill'),
  check (fuente is null or tipo = 'noticia'),
  check ((tipo = 'oportunidad') = (fecha_limite is not null)),
  check ((tipo = 'proyecto') = (que_mirar is not null))
);

-- 4. Acciones: Lo probé (con resultado), Lo leí, Me interesa y Dar feedback. Una por persona, aporte y tipo.
create table public.acciones (
  id uuid primary key default gen_random_uuid(),
  aporte_id uuid not null references public.aportes (id) on delete cascade,
  perfil_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  tipo text not null check (tipo in ('probar', 'leer', 'interes', 'feedback')),
  resultado text check (char_length(btrim(resultado)) >= 3 and char_length(resultado) <= 200),
  texto text check (char_length(btrim(texto)) >= 3 and char_length(texto) <= 1000),
  created_at timestamptz not null default now(),
  unique (aporte_id, perfil_id, tipo),
  check ((tipo = 'probar') = (resultado is not null)),
  check ((tipo = 'feedback') = (texto is not null))
);

-- 5. Marca de feedback útil: la pone el autor del proyecto, una vez, y no se borra.
create table public.feedback_util (
  accion_id uuid primary key references public.acciones (id) on delete cascade,
  marcado_por uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 6. Eventos de XP: solo se agregan. Los valores y topes diarios los aplica la app (xp-config.ts).
-- aporte_id no tiene clave foránea para que el evento quede aunque se borre el aporte.
create table public.eventos_xp (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  motivo text not null check (motivo in ('entrar', 'publicar', 'leer', 'probar', 'feedback_util')),
  tipo_aporte text check (tipo_aporte in ('skill', 'repo', 'noticia', 'oportunidad', 'proyecto')),
  aporte_id uuid,
  created_at timestamptz not null default now(),
  unique (perfil_id, motivo, aporte_id)
);

-- 7. Misión definida por el capitán: una por semana (la clave es el lunes).
create table public.misiones (
  semana date primary key check (extract(isodow from semana) = 1),
  accion text not null check (accion in ('probar', 'leer', 'feedback', 'publicar')),
  meta integer not null check (meta between 1 and 50),
  definida_por uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index aportes_fecha on public.aportes (created_at desc);
create index aportes_tipo_fecha on public.aportes (tipo, created_at desc);
create index aportes_autor on public.aportes (autor_id);
create index acciones_perfil on public.acciones (perfil_id);
create index acciones_fecha on public.acciones (created_at);
create index feedback_util_marcado_por on public.feedback_util (marcado_por);
create index eventos_xp_fecha on public.eventos_xp (created_at);
create index misiones_definida_por on public.misiones (definida_por);

-- Semana (lunes) de un instante en la zona del grupo. Igual que semanaDe() en src/domain/tiempo.ts.
create function public.semana_de(instante timestamptz) returns date
language sql stable set search_path = '' as $$
  select date_trunc('week', instante at time zone (select c.zona_horaria from public.configuracion c))::date
$$;

-- Capitán de una semana: rota por orden de ingreso desde la semana siguiente al lanzamiento y solo
-- cuentan quienes entraron antes de esa semana. Igual que capitanDeSemana() en src/domain/mision.ts.
create function public.capitan_de(semana date) returns uuid
language sql stable set search_path = '' as $$
  with lanzamiento as (
    select public.semana_de(min(p.created_at)) as semana from public.perfiles p
  ), elegibles as (
    select p.id, row_number() over (order by p.created_at, p.id) - 1 as posicion
    from public.perfiles p
    where public.semana_de(p.created_at) < capitan_de.semana
  )
  select e.id
  from elegibles e, lanzamiento l
  where capitan_de.semana > l.semana
    and e.posicion = ((capitan_de.semana - l.semana) / 7 - 1) % nullif((select count(*) from elegibles), 0)
$$;

-- Triggers con security definer: escriben donde el usuario no puede (perfiles y eventos de XP),
-- así nadie inventa XP desde el navegador. search_path fijo y nombres calificados.
create function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nombre'), ''),
                                nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Héroe'), 40));
  return new;
end $$;

create function public.xp_por_aporte() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.eventos_xp (perfil_id, motivo, tipo_aporte, aporte_id, created_at)
  values (new.autor_id, 'publicar', new.tipo, new.id, new.created_at)
  on conflict do nothing;
  return null;
end $$;

-- "Me interesa" no da XP y el feedback suma recién cuando lo marcan útil. El evento usa el aporte
-- como referencia: borrar y repetir la acción no da XP de nuevo.
create function public.xp_por_accion() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.tipo in ('probar', 'leer') then
    insert into public.eventos_xp (perfil_id, motivo, tipo_aporte, aporte_id, created_at)
    select new.perfil_id, new.tipo, a.tipo, a.id, new.created_at from public.aportes a where a.id = new.aporte_id
    on conflict do nothing;
  end if;
  return null;
end $$;

create function public.xp_por_feedback_util() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.eventos_xp (perfil_id, motivo, tipo_aporte, aporte_id, created_at)
  select ac.perfil_id, 'feedback_util', 'proyecto', ac.aporte_id, new.created_at
  from public.acciones ac where ac.id = new.accion_id
  on conflict do nothing;
  return null;
end $$;

create trigger crear_perfil after insert on auth.users for each row execute function public.crear_perfil();
create trigger xp_por_aporte after insert on public.aportes for each row execute function public.xp_por_aporte();
create trigger xp_por_accion after insert on public.acciones for each row execute function public.xp_por_accion();
create trigger xp_por_feedback_util after insert on public.feedback_util
  for each row execute function public.xp_por_feedback_util();

revoke all on function public.crear_perfil(), public.xp_por_aporte(), public.xp_por_accion(),
  public.xp_por_feedback_util() from public, anon, authenticated;
revoke all on function public.semana_de(timestamptz), public.capitan_de(date) from public, anon;
grant execute on function public.semana_de(timestamptz), public.capitan_de(date) to authenticated;

-- Permisos por columna: nadie elige su autor, sus fechas ni el XP de otro.
revoke all on table public.configuracion, public.perfiles, public.aportes, public.acciones,
  public.feedback_util, public.eventos_xp, public.misiones from anon, authenticated;
grant select on table public.configuracion, public.perfiles, public.aportes, public.acciones,
  public.feedback_util, public.eventos_xp, public.misiones to authenticated;
grant update (nombre) on public.perfiles to authenticated;
grant insert (tipo, link, titulo, imagen_url, por_que_sirve, como_se_usa, fuente, fecha_limite, que_mirar)
  on public.aportes to authenticated;
grant update (link, titulo, imagen_url, por_que_sirve, como_se_usa, fuente, fecha_limite, que_mirar)
  on public.aportes to authenticated;
grant insert (aporte_id, tipo, resultado, texto) on public.acciones to authenticated;
grant update (resultado, texto) on public.acciones to authenticated;
grant delete on public.aportes, public.acciones to authenticated;
grant insert (accion_id) on public.feedback_util to authenticated;
grant insert (motivo) on public.eventos_xp to authenticated;
grant insert (semana, accion, meta) on public.misiones to authenticated;

alter table public.configuracion enable row level security;
alter table public.perfiles enable row level security;
alter table public.aportes enable row level security;
alter table public.acciones enable row level security;
alter table public.feedback_util enable row level security;
alter table public.eventos_xp enable row level security;
alter table public.misiones enable row level security;

create policy "miembros leen" on public.configuracion for select to authenticated using (true);
create policy "miembros leen" on public.perfiles for select to authenticated using (true);
create policy "miembros leen" on public.aportes for select to authenticated using (true);
create policy "miembros leen" on public.acciones for select to authenticated using (true);
create policy "miembros leen" on public.feedback_util for select to authenticated using (true);
create policy "miembros leen" on public.eventos_xp for select to authenticated using (true);
create policy "miembros leen" on public.misiones for select to authenticated using (true);

create policy "edito mi perfil" on public.perfiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "publico lo mío" on public.aportes for insert to authenticated with check (autor_id = auth.uid());
create policy "edito lo mío" on public.aportes for update to authenticated
  using (autor_id = auth.uid()) with check (autor_id = auth.uid());
create policy "borro lo mío" on public.aportes for delete to authenticated using (autor_id = auth.uid());

-- Cada tipo tiene una sola acción (ACCION_DEL_TIPO en src/domain/aportes.ts) y nadie reacciona a lo propio.
create policy "reacciono a lo de otros" on public.acciones for insert to authenticated with check (
  perfil_id = auth.uid() and exists (
    select 1 from public.aportes a
    where a.id = acciones.aporte_id and a.autor_id <> auth.uid()
      and acciones.tipo = case a.tipo when 'skill' then 'probar' when 'repo' then 'probar'
        when 'noticia' then 'leer' when 'oportunidad' then 'interes' else 'feedback' end
  )
);
create policy "edito mi acción" on public.acciones for update to authenticated
  using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());
create policy "borro mi acción" on public.acciones for delete to authenticated using (perfil_id = auth.uid());

create policy "el autor del proyecto marca útil" on public.feedback_util for insert to authenticated with check (
  marcado_por = auth.uid() and exists (
    select 1 from public.acciones ac join public.aportes a on a.id = ac.aporte_id
    where ac.id = feedback_util.accion_id and ac.tipo = 'feedback' and a.autor_id = auth.uid()
  )
);

create policy "registro mi entrada" on public.eventos_xp for insert to authenticated
  with check (perfil_id = auth.uid() and motivo = 'entrar' and tipo_aporte is null and aporte_id is null);

create policy "el capitán define la misión de esta semana" on public.misiones for insert to authenticated
  with check (definida_por = auth.uid() and semana = public.semana_de(now()) and public.capitan_de(semana) = auth.uid());
