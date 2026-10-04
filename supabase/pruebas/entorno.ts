// Postgres en memoria (PGlite) con lo mínimo de Supabase que usa la migración: esquema auth,
// auth.users, auth.uid() y los roles anon y authenticated. Es un doble de prueba, no Supabase real.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const MIGRACIONES = ["0001_init.sql", "0002_entrada_diaria.sql", "0003_proyecto_compartido.sql", "0004_invitacion.sql", "0005_invitacion_valida.sql", "0006_favoritos.sql"].map((nombre) =>
  fileURLToPath(new URL(`../migrations/${nombre}`, import.meta.url)),
);

const PRELUDIO = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  create schema auth;
  grant usage on schema auth to anon, authenticated, service_role;
  create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant execute on function auth.uid() to anon, authenticated;
  -- Supuesto del doble (NO VERIFICADO): Supabase da todos los permisos de public a estos roles.
  -- Así se prueba el peor caso: la migración tiene que recortarlos.
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

export const ANA = "00000000-0000-4000-8000-00000000000a";
export const BETO = "00000000-0000-4000-8000-00000000000b";
export const CARO = "00000000-0000-4000-8000-00000000000c";

export async function crearBase(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(PRELUDIO);
  for (const archivo of MIGRACIONES) await db.exec(readFileSync(archivo, "utf8"));
  return db;
}

/** Corre una consulta como un usuario con sesión (uid) o sin sesión (null), con RLS activa. */
export async function como<T = Record<string, unknown>>(
  db: PGlite,
  uid: string | null,
  sql: string,
  params: unknown[] = [],
): Promise<{ rows: T[]; afectadas: number }> {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  await db.exec(uid ? "set role authenticated" : "set role anon");
  try {
    const r = await db.query<T>(sql, params);
    return { rows: r.rows, afectadas: r.affectedRows ?? 0 };
  } finally {
    await db.exec("reset role");
  }
}

/** Crea un usuario de Auth y su perfil (public.sumar_heroe) y, si se pide, fija su fecha de ingreso. */
export async function crearUsuario(
  db: PGlite,
  id: string,
  email: string,
  opciones: { creadoEn?: string; nombre?: string } = {},
): Promise<void> {
  const meta = JSON.stringify(opciones.nombre ? { nombre: opciones.nombre } : {});
  await db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3::jsonb)", [id, email, meta]);
  await db.query("select public.sumar_heroe($1)", [email]); // el perfil se crea al invitar (0003), no con un trigger
  if (opciones.creadoEn) {
    await db.query("update public.perfiles set created_at = $2 where id = $1", [id, opciones.creadoEn]);
  }
}

/** Los perfiles como miembros del dominio, para cruzar la base contra src/domain. */
export async function miembros(db: PGlite): Promise<{ id: string; nombre: string; creadoEn: string }[]> {
  const r = await db.query<{ id: string; nombre: string; created_at: Date }>(
    "select id, nombre, created_at from public.perfiles",
  );
  return r.rows.map((m) => ({ id: m.id, nombre: m.nombre, creadoEn: m.created_at.toISOString() }));
}

export async function capitanSql(db: PGlite, semana: string): Promise<string | null> {
  const r = await db.query<{ capitan: string | null }>("select public.capitan_de($1::date) as capitan", [semana]);
  return r.rows[0]?.capitan ?? null;
}

/** Inserta un aporte como su autor y devuelve el id. */
export async function publicar(db: PGlite, uid: string, campos: Record<string, unknown>): Promise<string> {
  const columnas = Object.keys(campos);
  const valores = columnas.map((_, i) => `$${i + 1}`).join(", ");
  const r = await como<{ id: string }>(
    db,
    uid,
    `insert into public.aportes (${columnas.join(", ")}) values (${valores}) returning id`,
    Object.values(campos),
  );
  const id = r.rows[0]?.id;
  if (!id) throw new Error("no se creó el aporte");
  return id;
}

/** Inserta una acción como su autor y devuelve el id. */
export async function accionar(
  db: PGlite,
  uid: string,
  aporteId: string,
  tipo: string,
  extra: { resultado?: string; texto?: string } = {},
): Promise<string> {
  const r = await como<{ id: string }>(
    db,
    uid,
    "insert into public.acciones (aporte_id, tipo, resultado, texto) values ($1, $2, $3, $4) returning id",
    [aporteId, tipo, extra.resultado ?? null, extra.texto ?? null],
  );
  const id = r.rows[0]?.id;
  if (!id) throw new Error("no se creó la acción");
  return id;
}

export const SKILL = { tipo: "skill", link: "https://example.com/skill", titulo: "Skill", por_que_sirve: "Sirve" };
export const PROYECTO = { ...SKILL, tipo: "proyecto", titulo: "Proyecto", que_mirar: "El inicio" };
