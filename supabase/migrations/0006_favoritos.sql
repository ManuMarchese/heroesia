-- Heroes IA · v0.1 · 0006: favoritos privados en carpetas propias (D43). Se aplica DESPUÉS de 0005, una sola vez.
-- Cada persona crea sus carpetas y guarda cada aporte en UNA sola carpeta. Nadie más las ve.
-- Borrar una carpeta saca de ahí lo guardado (no borra los aportes); borrar un aporte lo saca de todos los favoritos.
create table public.carpetas (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  nombre text not null check (btrim(nombre) <> '' and char_length(nombre) <= 40),
  created_at timestamptz not null default now()
);
create unique index carpetas_nombre_unico on public.carpetas (perfil_id, lower(btrim(nombre)));

create table public.favoritos (
  perfil_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  aporte_id uuid not null references public.aportes (id) on delete cascade,
  carpeta_id uuid not null references public.carpetas (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (perfil_id, aporte_id)
);
create index favoritos_carpeta on public.favoritos (carpeta_id);
create index favoritos_aporte on public.favoritos (aporte_id);

alter table public.carpetas enable row level security;
alter table public.favoritos enable row level security;

revoke all on table public.carpetas, public.favoritos from public, anon, authenticated;
grant select on table public.carpetas, public.favoritos to authenticated;
grant insert (nombre) on public.carpetas to authenticated;
grant update (nombre) on public.carpetas to authenticated;
grant delete on public.carpetas, public.favoritos to authenticated;
grant insert (aporte_id, carpeta_id) on public.favoritos to authenticated;
grant update (carpeta_id) on public.favoritos to authenticated;

create policy "veo mis carpetas" on public.carpetas for select to authenticated using (perfil_id = auth.uid());
create policy "creo mis carpetas" on public.carpetas for insert to authenticated with check (perfil_id = auth.uid());
create policy "renombro mis carpetas" on public.carpetas for update to authenticated
  using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());
create policy "borro mis carpetas" on public.carpetas for delete to authenticated using (perfil_id = auth.uid());

create policy "veo mis favoritos" on public.favoritos for select to authenticated using (perfil_id = auth.uid());
create policy "guardo en mis carpetas" on public.favoritos for insert to authenticated with check (
  perfil_id = auth.uid() and exists (select 1 from public.carpetas c where c.id = carpeta_id and c.perfil_id = auth.uid())
);
create policy "muevo mis favoritos" on public.favoritos for update to authenticated
  using (perfil_id = auth.uid())
  with check (perfil_id = auth.uid() and exists (select 1 from public.carpetas c where c.id = carpeta_id and c.perfil_id = auth.uid()));
create policy "quito mis favoritos" on public.favoritos for delete to authenticated using (perfil_id = auth.uid());
