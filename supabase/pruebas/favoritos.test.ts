import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ANA, BETO, SKILL, como, crearBase, crearUsuario, publicar } from "./entorno";

let db: PGlite;
let aporte: string;
let carpetaAna: string;
let carpetaBeto: string;

beforeAll(async () => {
  db = await crearBase();
  await crearUsuario(db, ANA, "ana@example.com");
  await crearUsuario(db, BETO, "beto@example.com");
  aporte = await publicar(db, BETO, SKILL);
  carpetaAna = (await como<{ id: string }>(db, ANA, "insert into public.carpetas (nombre) values ('Para probar') returning id")).rows[0]!.id;
  carpetaBeto = (await como<{ id: string }>(db, BETO, "insert into public.carpetas (nombre) values ('Mías') returning id")).rows[0]!.id;
}, 60_000);

afterAll(async () => {
  await db.close();
});

describe("carpetas y favoritos: privados y de una sola carpeta por aporte (0006)", () => {
  it("cada uno ve solo sus carpetas", async () => {
    expect((await como(db, ANA, "select nombre from public.carpetas")).rows).toEqual([{ nombre: "Para probar" }]);
    expect((await como(db, BETO, "select nombre from public.carpetas")).rows).toEqual([{ nombre: "Mías" }]);
  });

  it("no repite el nombre de una carpeta (sin distinguir mayúsculas) y valida el nombre", async () => {
    await expect(como(db, ANA, "insert into public.carpetas (nombre) values ('para PROBAR')")).rejects.toThrow(/carpetas_nombre_unico/);
    await expect(como(db, ANA, "insert into public.carpetas (nombre) values ('   ')")).rejects.toThrow(/check/);
    await expect(como(db, ANA, "insert into public.carpetas (nombre) values ($1)", ["x".repeat(41)])).rejects.toThrow(/check/);
    await como(db, BETO, "insert into public.carpetas (nombre) values ('Para probar')"); // otro usuario: puede
  });

  it("no se crea una carpeta a nombre de otro", async () => {
    await expect(como(db, ANA, "insert into public.carpetas (perfil_id, nombre) values ($1, 'X')", [BETO])).rejects.toThrow(/permission denied/);
  });

  it("guarda un aporte en una carpeta propia; en una ajena no", async () => {
    await como(db, ANA, "insert into public.favoritos (aporte_id, carpeta_id) values ($1, $2)", [aporte, carpetaAna]);
    await expect(
      como(db, ANA, "insert into public.favoritos (aporte_id, carpeta_id) values ($1, $2)", [aporte, carpetaBeto]),
    ).rejects.toThrow(/row-level security|duplicate key/);
  });

  it("un aporte va en UNA sola carpeta por persona: repetirlo falla y moverlo cambia la carpeta", async () => {
    const otra = (await como<{ id: string }>(db, ANA, "insert into public.carpetas (nombre) values ('Ideas') returning id")).rows[0]!.id;
    await expect(
      como(db, ANA, "insert into public.favoritos (aporte_id, carpeta_id) values ($1, $2)", [aporte, otra]),
    ).rejects.toThrow(/duplicate key/);
    await como(db, ANA, "update public.favoritos set carpeta_id = $2 where aporte_id = $1", [aporte, otra]);
    expect((await como(db, ANA, "select carpeta_id from public.favoritos")).rows).toEqual([{ carpeta_id: otra }]);
    await expect(
      como(db, ANA, "update public.favoritos set carpeta_id = $2 where aporte_id = $1", [aporte, carpetaBeto]),
    ).rejects.toThrow(/row-level security/);
  });

  it("los favoritos son privados: Beto no ve los de Ana ni los toca", async () => {
    expect((await como(db, BETO, "select * from public.favoritos")).rows).toEqual([]);
    expect((await como(db, BETO, "delete from public.favoritos")).afectadas).toBe(0);
    expect((await como(db, ANA, "select * from public.favoritos")).rows).toHaveLength(1);
  });

  it("quitar de favoritos, borrar una carpeta (saca lo guardado) y borrar el aporte limpian todo", async () => {
    expect((await como(db, ANA, "delete from public.favoritos where aporte_id = $1", [aporte])).afectadas).toBe(1);
    await como(db, ANA, "insert into public.favoritos (aporte_id, carpeta_id) values ($1, $2)", [aporte, carpetaAna]);
    await como(db, ANA, "delete from public.carpetas where id = $1", [carpetaAna]);
    expect((await db.query("select 1 from public.favoritos")).rows).toEqual([]);
    expect((await db.query("select 1 from public.aportes where id = $1", [aporte])).rows).toHaveLength(1);
    const nueva = (await como<{ id: string }>(db, ANA, "insert into public.carpetas (nombre) values ('Otra') returning id")).rows[0]!.id;
    await como(db, ANA, "insert into public.favoritos (aporte_id, carpeta_id) values ($1, $2)", [aporte, nueva]);
    await como(db, BETO, "delete from public.aportes where id = $1", [aporte]);
    expect((await db.query("select 1 from public.favoritos")).rows).toEqual([]);
  });

  it("sin sesión no se ve nada", async () => {
    await expect(como(db, null, "select * from public.carpetas")).rejects.toThrow(/permission denied/);
    await expect(como(db, null, "select * from public.favoritos")).rejects.toThrow(/permission denied/);
  });
});

describe("editar y borrar aportes: solo el autor", () => {
  it("el autor edita y borra lo suyo; otro no puede; el tipo no se edita", async () => {
    const id = await publicar(db, BETO, SKILL);
    await como(db, BETO, "update public.aportes set titulo = 'Nuevo título' where id = $1", [id]);
    expect((await db.query("select titulo from public.aportes where id = $1", [id])).rows).toEqual([{ titulo: "Nuevo título" }]);
    expect((await como(db, ANA, "update public.aportes set titulo = 'Hackeado' where id = $1", [id])).afectadas).toBe(0);
    expect((await como(db, ANA, "delete from public.aportes where id = $1", [id])).afectadas).toBe(0);
    await expect(como(db, BETO, "update public.aportes set tipo = 'repo' where id = $1", [id])).rejects.toThrow(/permission denied/);
    expect((await como(db, BETO, "delete from public.aportes where id = $1", [id])).afectadas).toBe(1);
  });

  it("al borrar un aporte se van sus acciones pero el XP ya ganado queda", async () => {
    const id = await publicar(db, BETO, SKILL);
    await como(db, ANA, "insert into public.acciones (aporte_id, tipo, resultado) values ($1, 'probar', 'Funcionó')", [id]);
    const antes = (await db.query<{ n: number }>("select count(*)::int as n from public.eventos_xp")).rows[0]!.n;
    await como(db, BETO, "delete from public.aportes where id = $1", [id]);
    expect((await db.query("select 1 from public.acciones where aporte_id = $1", [id])).rows).toEqual([]);
    expect((await db.query<{ n: number }>("select count(*)::int as n from public.eventos_xp")).rows[0]!.n).toBe(antes);
  });
});

describe("tipo Tecnología (0007): funciona como Skill", () => {
  it("se publica con 'cómo se usa', la acción es probar y los demás checks siguen firmes", async () => {
    const id = await publicar(db, BETO, { ...SKILL, tipo: "tecnologia", titulo: "Tech", como_se_usa: "Así se usa" });
    await como(db, ANA, "insert into public.acciones (aporte_id, tipo, resultado) values ($1, 'probar', 'Anda')", [id]);
    await expect(como(db, ANA, "insert into public.acciones (aporte_id, tipo, texto) values ($1, 'leer', 'x')", [id])).rejects.toThrow(
      /row-level security|duplicate key/,
    );
    expect((await db.query("select 1 from public.eventos_xp where aporte_id = $1 and tipo_aporte = 'tecnologia'", [id])).rows.length).toBeGreaterThan(0);
    await expect(publicar(db, BETO, { ...SKILL, tipo: "inventado" })).rejects.toThrow(/aportes_tipo_valido/);
    await expect(publicar(db, BETO, { ...SKILL, tipo: "repo", como_se_usa: "No va" })).rejects.toThrow(/aportes_como_se_usa_por_tipo/);
    await expect(publicar(db, BETO, { ...SKILL, tipo: "noticia", fecha_limite: "2026-12-01" })).rejects.toThrow(/check/);
  });
});
