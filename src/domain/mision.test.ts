import { describe, expect, it } from "vitest";
import {
  capitanDeSemana,
  hechosDe,
  misionDeSemana,
  ordenDeIngreso,
  progresoMision,
  semanaDeLanzamiento,
  validarDefinicionMision,
  type Hecho,
} from "./mision";
import type { Miembro, MisionDefinida } from "./tipos";
import { MISIONES_REEMPLAZO } from "./xp-config";

// Semana de lanzamiento: lunes 2026-09-28. Ana y Beto entran esa semana; Caro, el jueves 2026-10-08.
const ana: Miembro = { id: "ana", nombre: "Ana", creadoEn: "2026-09-30T15:00:00Z" };
const beto: Miembro = { id: "beto", nombre: "Beto", creadoEn: "2026-10-01T15:00:00Z" };
const caro: Miembro = { id: "caro", nombre: "Caro", creadoEn: "2026-10-08T15:00:00Z" };
const todos = [caro, beto, ana];

describe("cero miembros", () => {
  it("no hay lanzamiento, capitán ni misión, y nadie puede definirla", () => {
    expect(semanaDeLanzamiento([])).toBeNull();
    expect(capitanDeSemana("2026-10-05", [])).toBeNull();
    expect(misionDeSemana("2026-10-05", [], null)).toBeNull();
    const r = validarDefinicionMision(
      { accion: "probar", meta: 3 },
      { semana: "2026-10-05", usuarioId: "ana", miembros: [], definida: null },
    );
    expect(r.ok).toBe(false);
  });
});

describe("un solo miembro", () => {
  it("la semana de lanzamiento tiene la misión fija y meta 2", () => {
    expect(misionDeSemana("2026-09-28", [ana], null)).toEqual({
      semana: "2026-09-28",
      accion: "publicar",
      meta: 2,
      titulo: "Cada uno suma 2 aportes",
      origen: "lanzamiento",
      capitanId: null,
      topePorMiembro: 2,
    });
  });

  it("desde la semana siguiente es capitán todas las semanas", () => {
    for (const semana of ["2026-10-05", "2026-10-12", "2026-10-19"]) {
      expect(capitanDeSemana(semana, [ana])).toBe("ana");
    }
  });
});

describe("capitán rotativo", () => {
  it("ordena por fecha de ingreso y, si empatan, por id", () => {
    const gemela: Miembro = { ...ana, id: "aaa" };
    expect(ordenDeIngreso([caro, ana, gemela, beto]).map((m) => m.id)).toEqual(["aaa", "ana", "beto", "caro"]);
  });

  it("la semana de lanzamiento no tiene capitán; después rota por orden de ingreso", () => {
    expect(semanaDeLanzamiento(todos)).toBe("2026-09-28");
    expect(capitanDeSemana("2026-09-28", todos)).toBeNull();
    expect(capitanDeSemana("2026-10-05", todos)).toBe("ana");
    expect(capitanDeSemana("2026-10-12", todos)).toBe("beto");
    expect(capitanDeSemana("2026-10-19", todos)).toBe("caro");
    expect(capitanDeSemana("2026-10-26", todos)).toBe("ana");
  });

  it("quien entra a mitad de semana no cambia el capitán de esa semana", () => {
    expect(capitanDeSemana("2026-10-05", [ana, beto])).toBe(capitanDeSemana("2026-10-05", todos));
  });

  it("antes del lanzamiento no hay misión", () => {
    expect(misionDeSemana("2026-09-21", todos, null)).toBeNull();
  });
});

describe("misión de cada semana", () => {
  it("la de lanzamiento pide 2 aportes por cada miembro de esa semana", () => {
    expect(misionDeSemana("2026-09-28", todos, null)).toMatchObject({ meta: 4, origen: "lanzamiento" });
  });

  it("mientras el capitán no la define rige la de reemplazo, que rota por semana", () => {
    const primera = misionDeSemana("2026-10-05", todos, null);
    expect(primera).toMatchObject({ origen: "reemplazo", capitanId: "ana", ...MISIONES_REEMPLAZO[0] });
    expect(primera?.titulo).toBe("Probar 5 skills o repos");
    expect(misionDeSemana("2026-10-12", todos, null)).toMatchObject({ ...MISIONES_REEMPLAZO[1], capitanId: "beto" });
  });

  it("la definida por el capitán reemplaza a la de reemplazo solo en su semana", () => {
    const definida: MisionDefinida = {
      semana: "2026-10-05",
      accion: "leer",
      meta: 7,
      definidaPor: "ana",
      creadaEn: "2026-10-07T12:00:00Z",
    };
    expect(misionDeSemana("2026-10-05", todos, definida)).toMatchObject({
      accion: "leer",
      meta: 7,
      titulo: "Leer 7 noticias",
      origen: "capitan",
    });
    expect(misionDeSemana("2026-10-12", todos, definida)?.origen).toBe("reemplazo");
  });
});

describe("progreso automático", () => {
  const hecho = (perfilId: string, accion: Hecho["accion"], creadoEn: string): Hecho => ({ perfilId, accion, creadoEn });

  it("cuenta desde el lunes 00:00 de Buenos Aires y solo la acción de la misión", () => {
    const mision = misionDeSemana("2026-10-05", todos, null);
    if (!mision) throw new Error("falta la misión");
    const progreso = progresoMision(mision, [
      hecho("ana", "probar", "2026-10-05T02:59:00Z"), // domingo 23:59: semana anterior
      hecho("beto", "probar", "2026-10-05T03:00:00Z"), // lunes 00:00: cuenta
      hecho("caro", "probar", "2026-10-09T12:00:00Z"),
      hecho("ana", "leer", "2026-10-06T12:00:00Z"), // otra acción
      hecho("ana", "probar", "2026-10-12T03:00:00Z"), // semana siguiente
    ]);
    expect(progreso).toEqual({ hecho: 2, meta: 5, completa: false, participantes: ["beto", "caro"] });
  });

  it("en el lanzamiento cada persona suma como máximo 2", () => {
    const mision = misionDeSemana("2026-09-28", [ana, beto], null);
    if (!mision) throw new Error("falta la misión");
    const hechos = [
      hecho("ana", "publicar", "2026-09-30T16:00:00Z"),
      hecho("ana", "publicar", "2026-09-30T17:00:00Z"),
      hecho("ana", "publicar", "2026-09-30T18:00:00Z"),
      hecho("beto", "publicar", "2026-10-01T16:00:00Z"),
    ];
    expect(progresoMision(mision, hechos)).toEqual({ hecho: 3, meta: 4, completa: false, participantes: ["ana", "beto"] });
    const completa = progresoMision(mision, [...hechos, hecho("beto", "publicar", "2026-10-02T16:00:00Z")]);
    expect(completa).toMatchObject({ hecho: 4, completa: true });
  });

  it("arma los hechos con aportes y acciones; 'Me interesa' no cuenta", () => {
    const hechos = hechosDe(
      [{ autorId: "ana", creadoEn: "2026-10-05T12:00:00Z" }],
      [
        { perfilId: "beto", tipo: "probar", creadoEn: "2026-10-05T13:00:00Z" },
        { perfilId: "beto", tipo: "interes", creadoEn: "2026-10-05T14:00:00Z" },
        { perfilId: "caro", tipo: "feedback", creadoEn: "2026-10-05T15:00:00Z" },
      ],
    );
    expect(hechos.map((h) => `${h.perfilId}:${h.accion}`)).toEqual(["ana:publicar", "beto:probar", "caro:feedback"]);
  });
});

describe("el capitán define la misión", () => {
  const contexto = { semana: "2026-10-05", usuarioId: "ana", miembros: todos, definida: null };

  it("acepta acción y meta válidas (la meta puede venir como texto de un formulario)", () => {
    expect(validarDefinicionMision({ accion: "feedback", meta: "3" }, contexto)).toEqual({
      ok: true,
      valor: { accion: "feedback", meta: 3 },
    });
  });

  it("rechaza a quien no es capitán, la semana de lanzamiento y una segunda definición", () => {
    expect(validarDefinicionMision({ accion: "leer", meta: 3 }, { ...contexto, usuarioId: "beto" })).toMatchObject({
      ok: false,
      errores: { mision: "Solo el capitán de la semana define la misión." },
    });
    expect(validarDefinicionMision({ accion: "leer", meta: 3 }, { ...contexto, semana: "2026-09-28" })).toMatchObject({
      ok: false,
    });
    const definida: MisionDefinida = { semana: "2026-10-05", accion: "leer", meta: 3, definidaPor: "ana", creadaEn: "x" };
    expect(validarDefinicionMision({ accion: "leer", meta: 3 }, { ...contexto, definida })).toMatchObject({ ok: false });
  });

  it("valida la acción y una meta entera entre 1 y 50", () => {
    for (const meta of [0, 51, 2.5, "", "tres", null]) {
      expect(validarDefinicionMision({ accion: "probar", meta }, contexto)).toMatchObject({ ok: false });
    }
    expect(validarDefinicionMision({ accion: "bailar", meta: 3 }, contexto)).toMatchObject({ ok: false });
    expect(validarDefinicionMision({ accion: "publicar", meta: 50 }, contexto)).toMatchObject({ ok: true });
  });
});
