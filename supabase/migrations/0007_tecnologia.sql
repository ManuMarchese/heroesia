-- Heroes IA · v1.0 · 0007: nuevo tipo de aporte "tecnologia" (D44). Se aplica DESPUÉS de 0006, una sola vez.
-- Funciona como Skill: su acción es 'probar' y admite 'como_se_usa'.
-- Los checks de 0001 no tienen nombre fijo en todos los casos: se buscan por su definición (la lista de tipos tiene
-- 'noticia' y 'proyecto' a la vez; los checks de fuente, fecha límite y qué mirar no se tocan) y se recrean con nombre.
do $$
declare
  restriccion record;
begin
  for restriccion in
    select c.conrelid::regclass as tabla, c.conname
    from pg_constraint c
    where c.contype = 'c'
      and c.conrelid in ('public.aportes'::regclass, 'public.eventos_xp'::regclass)
      and ((pg_get_constraintdef(c.oid) like '%''noticia''%' and pg_get_constraintdef(c.oid) like '%''proyecto''%')
           or pg_get_constraintdef(c.oid) like '%como_se_usa IS NULL%')
  loop
    execute format('alter table %s drop constraint %I', restriccion.tabla, restriccion.conname);
  end loop;
end $$;

alter table public.aportes
  add constraint aportes_tipo_valido check (tipo in ('skill', 'repo', 'noticia', 'oportunidad', 'proyecto', 'tecnologia')),
  add constraint aportes_como_se_usa_por_tipo check (como_se_usa is null or tipo in ('skill', 'tecnologia'));
alter table public.eventos_xp
  add constraint eventos_xp_tipo_aporte_valido
  check (tipo_aporte in ('skill', 'repo', 'noticia', 'oportunidad', 'proyecto', 'tecnologia'));

drop policy "reacciono a lo de otros" on public.acciones;
create policy "reacciono a lo de otros" on public.acciones for insert to authenticated with check (
  perfil_id = auth.uid() and exists (
    select 1 from public.aportes a
    where a.id = acciones.aporte_id and a.autor_id <> auth.uid()
      and acciones.tipo = case a.tipo when 'skill' then 'probar' when 'repo' then 'probar' when 'tecnologia' then 'probar'
        when 'noticia' then 'leer' when 'oportunidad' then 'interes' else 'feedback' end
  )
);
