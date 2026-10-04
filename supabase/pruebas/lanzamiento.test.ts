import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { capitanDeSemana, semanaDeLanzamiento } from "@/domain/mision";
import { semanaDe, sumarDias } from "@/domain/tiempo";
import { ANA, BETO, CARO, capitanSql, como, crearBase, crearUsuario, miembros } from "./entorno";

async function lanzamientoSql(db: PGlite): Promise<string | null> {
  const r = await db.query<{ semana: string | null }>("select public.semana_de_lanzamiento()::text as semana");
  return r.rows[0]?.semana ?? null;
}

/** Lo que hace Manu en el SQL Editor (docs/SETUP-MANU.md). */
async function fijarLanzamiento(db: PGlite, dia: string | null): Promise<void> {
  await db.query("update public.configuracion set lanzamiento_en = $1::date", [dia]);
}

describe("lanzamiento_en: la base calcula igual que el dominio (D35)", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await crearBase();
  }, 60_000);
  afterAll(async () => {
    await db.close();
  });

  it("arranca vacío; sin fecha ni perfiles no hay lanzamiento", async () => {
    const r = await db.query("select lanzamiento_en from public.configuracion");
    expect(r.rows).toEqual([{ lanzamiento_en: null }]);
    expect(await lanzamientoSql(db)).toBeNull();
  });

  it("con la fecha fijada, el lanzamiento es el lunes de esa semana aunque no haya perfiles", async () => {
    await fijarLanzamiento(db, "2026-10-08");
    expect(await lanzamientoSql(db)).toBe("2026-10-05");
    await fijarLanzamiento(db, null);
  });

  it("semana de lanzamiento y capitán coinciden con el dominio para cada fecha fijada", async () => {
    // El caso de D35: Manu entra un domingo y los amigos el lunes y el martes.
    await crearUsuario(db, ANA, "manu@example.com", { creadoEn: "2026-10-04T18:00:00Z" });
    await crearUsuario(db, BETO, "ana@example.com", { creadoEn: "2026-10-05T13:00:00Z" });
    await crearUsuario(db, CARO, "beto@example.com", { creadoEn: "2026-10-06T13:00:00Z" });
    const lista = await miembros(db);
    for (const lanzamientoEn of [null, "2026-10-05", "2026-10-08", "2026-10-11", "2026-09-14", "2026-11-02"]) {
      await fijarLanzamiento(db, lanzamientoEn);
      const grupo = { miembros: lista, lanzamientoEn };
      expect(await lanzamientoSql(db), String(lanzamientoEn)).toBe(semanaDeLanzamiento(grupo));
      for (let k = -2; k <= 10; k++) {
        const semana = sumarDias("2026-09-28", 7 * k);
        expect(await capitanSql(db, semana), `${lanzamientoEn} · ${semana}`).toBe(capitanDeSemana(semana, grupo));
      }
    }
  });

  it("los miembros no pueden cambiar la fecha de lanzamiento", async () => {
    await expect(como(db, ANA, "update public.configuracion set lanzamiento_en = '2026-10-05'")).rejects.toThrow(
      /permission denied/,
    );
  });
});

describe("misión del capitán según lanzamiento_en", () => {
  let db: PGlite;
  const hace = (dias: number) => new Date(Date.now() - dias * 86_400_000).toISOString();
  const definir = "insert into public.misiones (semana, accion, meta) values ($1, 'leer', 5)";

  beforeAll(async () => {
    db = await crearBase();
    await crearUsuario(db, ANA, "ana@example.com", { creadoEn: hace(22) });
    await crearUsuario(db, BETO, "beto@example.com", { creadoEn: hace(21) });
    await crearUsuario(db, CARO, "caro@example.com", { creadoEn: hace(15) });
  }, 60_000);
  afterAll(async () => {
    await db.close();
  });

  it("si el lanzamiento es esta semana o después, nadie define la misión: rige la inicial", async () => {
    const semana = semanaDe(new Date());
    for (const lanzamiento of [semana, sumarDias(semana, 14)]) {
      await fijarLanzamiento(db, lanzamiento);
      for (const id of [ANA, BETO, CARO]) {
        expect(await capitanSql(db, semana)).toBeNull();
        await expect(como(db, id, definir, [semana])).rejects.toThrow(/row-level security/);
      }
    }
  });

  it("con el lanzamiento la semana pasada, el primero por orden de ingreso es capitán y la define", async () => {
    const semana = semanaDe(new Date());
    await fijarLanzamiento(db, sumarDias(semana, -7));
    expect(await capitanSql(db, semana)).toBe(ANA);
    await expect(como(db, BETO, definir, [semana])).rejects.toThrow(/row-level security/);
    await como(db, ANA, definir, [semana]);
    const r = await db.query("select definida_por from public.misiones where semana = $1", [semana]);
    expect(r.rows).toEqual([{ definida_por: ANA }]);
  });
});
