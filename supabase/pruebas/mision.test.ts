import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { capitanDeSemana } from "@/domain/mision";
import { semanaDe, sumarDias } from "@/domain/tiempo";
import type { Miembro } from "@/domain/tipos";
import { ANA, BETO, CARO, como, crearBase, crearUsuario } from "./entorno";

const DANI = "00000000-0000-4000-8000-00000000000d";
const EMI = "00000000-0000-4000-8000-00000000000e";

async function miembros(db: PGlite): Promise<Miembro[]> {
  const r = await db.query<{ id: string; nombre: string; created_at: Date }>(
    "select id, nombre, created_at from public.perfiles",
  );
  return r.rows.map((m) => ({ id: m.id, nombre: m.nombre, creadoEn: m.created_at.toISOString() }));
}

async function capitanSql(db: PGlite, semana: string): Promise<string | null> {
  const r = await db.query<{ capitan: string | null }>("select public.capitan_de($1::date) as capitan", [semana]);
  return r.rows[0]?.capitan ?? null;
}

describe("la base calcula semana y capitán igual que el dominio", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await crearBase();
  }, 60_000);
  afterAll(async () => {
    await db.close();
  });

  it("semana_de coincide con semanaDe, también en el cambio de semana de Buenos Aires", async () => {
    const instantes = [
      "2026-10-05T02:59:59Z",
      "2026-10-05T03:00:00Z",
      "2026-01-01T12:00:00Z",
      "2026-12-31T23:30:00Z",
      "2027-03-01T02:00:00Z",
    ];
    for (const instante of instantes) {
      const r = await db.query<{ semana: string }>("select public.semana_de($1::timestamptz)::text as semana", [instante]);
      expect(r.rows[0]?.semana, instante).toBe(semanaDe(instante));
    }
  });

  it("sin miembros no hay capitán", async () => {
    expect(await capitanSql(db, "2026-10-05")).toBeNull();
  });

  it("con un solo miembro, es capitán desde la semana siguiente al lanzamiento", async () => {
    await crearUsuario(db, ANA, "ana@example.com", { creadoEn: "2026-09-30T15:00:00Z" });
    expect(await capitanSql(db, "2026-09-28")).toBeNull();
    expect(await capitanSql(db, "2026-10-05")).toBe(ANA);
    expect(await capitanSql(db, "2026-10-12")).toBe(ANA);
  });

  it("rota igual que capitanDeSemana, con ingresos en el borde de la semana y empates", async () => {
    await crearUsuario(db, BETO, "beto@example.com", { creadoEn: "2026-10-05T02:59:00Z" }); // domingo 23:59
    await crearUsuario(db, CARO, "caro@example.com", { creadoEn: "2026-10-05T03:00:00Z" }); // lunes 00:00
    await crearUsuario(db, EMI, "emi@example.com", { creadoEn: "2026-10-15T12:00:00Z" });
    await crearUsuario(db, DANI, "dani@example.com", { creadoEn: "2026-10-15T12:00:00Z" }); // empata con Emi
    const lista = await miembros(db);
    for (let k = -1; k <= 12; k++) {
      const semana = sumarDias("2026-09-28", 7 * k);
      expect(await capitanSql(db, semana), semana).toBe(capitanDeSemana(semana, lista));
    }
  });
});

describe("misión definida por el capitán", () => {
  let db: PGlite;
  const hace = (dias: number) => new Date(Date.now() - dias * 86_400_000).toISOString();

  beforeAll(async () => {
    db = await crearBase();
    await crearUsuario(db, ANA, "ana@example.com", { creadoEn: hace(22) });
    await crearUsuario(db, BETO, "beto@example.com", { creadoEn: hace(21) });
    await crearUsuario(db, CARO, "caro@example.com", { creadoEn: hace(15) });
  }, 60_000);
  afterAll(async () => {
    await db.close();
  });

  it("solo el capitán define la misión de la semana actual, con datos válidos y una sola vez", async () => {
    const semana = semanaDe(new Date());
    const capitan = capitanDeSemana(semana, await miembros(db));
    if (!capitan) throw new Error("tendría que haber capitán");
    expect(await capitanSql(db, semana)).toBe(capitan);
    const otro = [ANA, BETO, CARO].find((id) => id !== capitan) ?? ANA;
    const definir = "insert into public.misiones (semana, accion, meta) values ($1, $2, $3)";

    await expect(como(db, otro, definir, [semana, "leer", 5])).rejects.toThrow(/row-level security/);
    await expect(como(db, capitan, definir, [sumarDias(semana, -7), "leer", 5])).rejects.toThrow(/row-level security/);
    await expect(como(db, capitan, definir, [sumarDias(semana, 1), "leer", 5])).rejects.toThrow(/check constraint|row-level/);
    await expect(como(db, capitan, definir, [semana, "bailar", 5])).rejects.toThrow(/check constraint/);
    await expect(como(db, capitan, definir, [semana, "leer", 0])).rejects.toThrow(/check constraint/);
    await expect(
      como(db, capitan, "insert into public.misiones (semana, accion, meta, definida_por) values ($1, 'leer', 5, $2)", [
        semana,
        otro,
      ]),
    ).rejects.toThrow(/permission denied/);

    await como(db, capitan, definir, [semana, "leer", 5]);
    const r = await como(db, otro, "select accion, meta, definida_por from public.misiones");
    expect(r.rows).toEqual([{ accion: "leer", meta: 5, definida_por: capitan }]);
    await expect(como(db, capitan, definir, [semana, "probar", 3])).rejects.toThrow(/duplicate key|row-level/);
    await expect(como(db, capitan, "update public.misiones set meta = 1")).rejects.toThrow(/permission denied/);
  });
});
