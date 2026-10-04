import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ZONA_HORARIA } from "@/domain/xp-config";
import { ANA, BETO, SKILL, como, crearBase, crearUsuario, publicar } from "./entorno";

const TABLAS = ["configuracion", "perfiles", "aportes", "acciones", "feedback_util", "eventos_xp", "misiones"];
let db: PGlite;

beforeAll(async () => {
  db = await crearBase();
  await crearUsuario(db, ANA, "ana@example.com", { nombre: "Ana" });
  await crearUsuario(db, BETO, "beto.perez@example.com");
}, 60_000);

afterAll(async () => {
  await db.close();
});

describe("perfiles creados por trigger", () => {
  it("cada usuario nuevo de Auth tiene perfil, con su nombre o la parte local del email", async () => {
    const r = await db.query<{ id: string; nombre: string }>("select id, nombre from public.perfiles order by nombre");
    expect(r.rows).toEqual([
      { id: ANA, nombre: "Ana" },
      { id: BETO, nombre: "beto.perez" },
    ]);
  });
});

describe("sin sesión no se ve nada", () => {
  it.each(TABLAS)("anon no puede leer %s", async (tabla) => {
    await expect(como(db, null, `select * from public.${tabla}`)).rejects.toThrow(/permission denied/);
  });

  it("anon no puede escribir ni usar las funciones", async () => {
    await expect(
      como(db, null, "insert into public.aportes (tipo, link, titulo, por_que_sirve) values ('skill', 'https://a.com', 't', 'p')"),
    ).rejects.toThrow(/permission denied/);
    await expect(como(db, null, "select public.capitan_de(current_date)")).rejects.toThrow(/permission denied/);
    await expect(como(db, null, "select public.semana_de_lanzamiento()")).rejects.toThrow(/permission denied/);
  });
});

describe("los miembros leen todo", () => {
  it.each(TABLAS)("un miembro lee %s", async (tabla) => {
    await expect(como(db, ANA, `select count(*) from public.${tabla}`)).resolves.toMatchObject({ rows: [{}] });
  });

  it("ve lo que publicó otro", async () => {
    const id = await publicar(db, BETO, SKILL);
    const r = await como(db, ANA, "select autor_id from public.aportes where id = $1", [id]);
    expect(r.rows).toEqual([{ autor_id: BETO }]);
  });
});

describe("cada uno crea y edita solo lo suyo", () => {
  it("el autor es siempre quien publica: no se elige autor ni fecha", async () => {
    const id = await publicar(db, ANA, SKILL);
    const r = await db.query("select autor_id from public.aportes where id = $1", [id]);
    expect(r.rows).toEqual([{ autor_id: ANA }]);
    await expect(publicar(db, ANA, { ...SKILL, autor_id: BETO })).rejects.toThrow(/permission denied/);
    await expect(publicar(db, ANA, { ...SKILL, created_at: "2020-01-01T00:00:00Z" })).rejects.toThrow(/permission denied/);
  });

  it("edita y borra su aporte, pero no el de otro", async () => {
    const mio = await publicar(db, ANA, SKILL);
    const ajeno = await publicar(db, BETO, SKILL);
    const editar = "update public.aportes set titulo = 'Nuevo' where id = $1";
    expect((await como(db, ANA, editar, [mio])).afectadas).toBe(1);
    expect((await como(db, ANA, editar, [ajeno])).afectadas).toBe(0);
    expect((await como(db, ANA, "delete from public.aportes where id = $1", [ajeno])).afectadas).toBe(0);
    expect((await como(db, ANA, "delete from public.aportes where id = $1", [mio])).afectadas).toBe(1);
  });

  it("no cambia el tipo, el autor ni la fecha de su aporte", async () => {
    const mio = await publicar(db, ANA, SKILL);
    for (const cambio of ["tipo = 'repo'", `autor_id = '${BETO}'`, "created_at = now()"]) {
      await expect(como(db, ANA, `update public.aportes set ${cambio} where id = $1`, [mio])).rejects.toThrow(
        /permission denied/,
      );
    }
  });

  it("edita solo su nombre y no crea perfiles", async () => {
    expect((await como(db, ANA, "update public.perfiles set nombre = 'Anita' where id = $1", [ANA])).afectadas).toBe(1);
    expect((await como(db, ANA, "update public.perfiles set nombre = 'X' where id = $1", [BETO])).afectadas).toBe(0);
    await expect(como(db, ANA, "update public.perfiles set created_at = now() where id = $1", [ANA])).rejects.toThrow(
      /permission denied/,
    );
    await expect(
      como(db, ANA, "insert into public.perfiles (id, nombre) values ($1, 'Otra')", ["00000000-0000-4000-8000-0000000000ff"]),
    ).rejects.toThrow(/permission denied/);
  });

  it("respeta los campos de cada tipo", async () => {
    await expect(publicar(db, ANA, { ...SKILL, tipo: "oportunidad" })).rejects.toThrow(/check constraint/);
    await expect(publicar(db, ANA, { ...SKILL, que_mirar: "Algo" })).rejects.toThrow(/check constraint/);
    await expect(publicar(db, ANA, { ...SKILL, link: "javascript:alert(1)" })).rejects.toThrow(/check constraint/);
    await expect(publicar(db, ANA, { ...SKILL, titulo: "   " })).rejects.toThrow(/check constraint/);
    await expect(publicar(db, ANA, { ...SKILL, tipo: "oportunidad", fecha_limite: "2030-01-01" })).resolves.toBeTruthy();
  });
});

describe("configuración mínima", () => {
  it("la zona horaria es la misma que usa el dominio", async () => {
    const r = await como(db, ANA, "select zona_horaria from public.configuracion");
    expect(r.rows).toEqual([{ zona_horaria: ZONA_HORARIA }]);
  });

  it("los miembros no la cambian y no hay una segunda fila", async () => {
    await expect(como(db, ANA, "update public.configuracion set zona_horaria = 'UTC'")).rejects.toThrow(/permission denied/);
    await expect(db.query("insert into public.configuracion default values")).rejects.toThrow(/duplicate key/);
  });
});

describe("funciones", () => {
  it("las de security definer son solo los triggers y fijan search_path", async () => {
    const r = await db.query<{ proname: string; proconfig: string[] | null }>(
      "select proname, proconfig from pg_proc where pronamespace = 'public'::regnamespace and prosecdef order by proname",
    );
    expect(r.rows.map((f) => f.proname)).toEqual(["crear_perfil", "xp_por_accion", "xp_por_aporte", "xp_por_feedback_util"]);
    for (const f of r.rows) expect(f.proconfig).toEqual(['search_path=""']);
  });

  it("todas las funciones de public fijan search_path", async () => {
    const r = await db.query<{ proname: string }>(
      "select proname from pg_proc where pronamespace = 'public'::regnamespace and proconfig is null",
    );
    expect(r.rows).toEqual([]);
  });
});
