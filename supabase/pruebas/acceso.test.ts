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

describe("perfiles creados al invitar (sumar_heroe)", () => {
  it("cada héroe dado de alta tiene perfil, con su nombre o la parte local del email", async () => {
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

const OTRA_APP = "00000000-0000-4000-8000-0000000000f1";

describe("proyecto compartido: un usuario de otra app no entra a Heroes IA (0003)", () => {
  it("sin perfil no lee nada, ni puede llamar a sumar_heroe, y el registro en Auth no crea perfil", async () => {
    await db.query("insert into auth.users (id, email) values ($1, 'otra@app.com')", [OTRA_APP]);
    const perfiles = await db.query("select 1 from public.perfiles where id = $1", [OTRA_APP]);
    expect(perfiles.rows).toEqual([]);
    for (const tabla of TABLAS) {
      expect((await como(db, OTRA_APP, `select * from public.${tabla}`)).rows, tabla).toEqual([]);
    }
    await expect(como(db, OTRA_APP, "select public.sumar_heroe('ana@example.com')")).rejects.toThrow(/permission denied/);
    await expect(como(db, ANA, "select public.sumar_heroe('ana@example.com')")).rejects.toThrow(/permission denied/);
    expect((await como(db, ANA, "select * from public.perfiles")).rows.length).toBeGreaterThan(0);
  });

  it("sumar_heroe falla si el email no existe y es idempotente", async () => {
    await expect(db.query("select public.sumar_heroe('nadie@x.com')")).rejects.toThrow(/No hay un usuario/);
    await db.query("select public.sumar_heroe('ana@example.com')");
    expect((await db.query("select 1 from public.perfiles where id = $1", [ANA])).rows).toHaveLength(1);
  });
});

describe("link de invitación: unirme(clave) (0004)", () => {
  const NUEVA = "00000000-0000-4000-8000-0000000000f2";
  const hash = (clave: string) => `encode(sha256(convert_to('${clave}', 'UTF8')), 'hex')`;

  it("la clave es correcta: crea el perfil; es idempotente; la app no lee la tabla de claves", async () => {
    await db.query(`insert into public.invitacion (clave_hash) values (${hash("clave-buena")})`);
    await db.query("insert into auth.users (id, email) values ($1, 'nueva.persona@app.com')", [NUEVA]);
    expect((await como(db, NUEVA, "select public.unirme('clave-buena') as ok")).rows).toEqual([{ ok: true }]);
    expect((await db.query("select nombre from public.perfiles where id = $1", [NUEVA])).rows).toEqual([{ nombre: "nueva.persona" }]);
    expect((await como(db, NUEVA, "select public.unirme('lo-que-sea') as ok")).rows).toEqual([{ ok: true }]);
    await expect(como(db, NUEVA, "select * from public.invitacion")).rejects.toThrow(/permission denied/);
    await expect(como(db, null, "select public.unirme('clave-buena')")).rejects.toThrow(/permission denied/);
  });

  it("clave incorrecta: no crea perfil y a los 5 fallos en una hora bloquea hasta con la clave buena", async () => {
    const OTRA = "00000000-0000-4000-8000-0000000000f3";
    await db.query("insert into auth.users (id, email) values ($1, 'otra.persona@app.com')", [OTRA]);
    for (let i = 0; i < 5; i++) {
      expect((await como(db, OTRA, "select public.unirme('mala') as ok")).rows).toEqual([{ ok: false }]);
    }
    await expect(como(db, OTRA, "select public.unirme('clave-buena')")).rejects.toThrow(/demasiados_intentos/);
    expect((await db.query("select 1 from public.perfiles where id = $1", [OTRA])).rows).toEqual([]);
  });
});

describe("invitacion_valida (0005): sí o no, también sin sesión", () => {
  it("responde true solo con la clave del link y no deja leer la tabla de claves", async () => {
    const hash = "encode(sha256(convert_to('otra-clave', 'UTF8')), 'hex')";
    await db.exec(`delete from public.invitacion; insert into public.invitacion (clave_hash) values (${hash})`);
    expect((await como(db, null, "select public.invitacion_valida('otra-clave') as ok")).rows).toEqual([{ ok: true }]);
    expect((await como(db, null, "select public.invitacion_valida('mala') as ok")).rows).toEqual([{ ok: false }]);
    expect((await como(db, null, "select public.invitacion_valida(null) as ok")).rows).toEqual([{ ok: false }]);
    await expect(como(db, null, "select * from public.invitacion")).rejects.toThrow(/permission denied/);
  });
});

describe("funciones", () => {
  it("las de security definer son los triggers, es_heroe y sumar_heroe, y fijan search_path", async () => {
    const r = await db.query<{ proname: string; proconfig: string[] | null }>(
      "select proname, proconfig from pg_proc where pronamespace = 'public'::regnamespace and prosecdef order by proname",
    );
    expect(r.rows.map((f) => f.proname)).toEqual(["es_heroe", "invitacion_valida", "sumar_heroe", "unirme", "xp_por_accion", "xp_por_aporte", "xp_por_feedback_util"]);
    for (const f of r.rows) expect(f.proconfig).toEqual(['search_path=""']);
  });

  it("todas las funciones de public fijan search_path", async () => {
    const r = await db.query<{ proname: string }>(
      "select proname from pg_proc where pronamespace = 'public'::regnamespace and proconfig is null",
    );
    expect(r.rows).toEqual([]);
  });
});
