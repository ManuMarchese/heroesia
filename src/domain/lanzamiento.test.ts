import { describe, expect, it } from "vitest";
import {
  capitanDeSemana,
  misionDeSemana,
  progresoMision,
  semanaDeLanzamiento,
  validarDefinicionMision,
  type Grupo,
} from "./mision";
import type { Miembro } from "./tipos";

// El caso de D35: Manu crea su perfil el domingo 2026-10-04 y los amigos entran el lunes y el martes.
const manu: Miembro = { id: "manu", nombre: "Manu", creadoEn: "2026-10-04T18:00:00Z" }; // domingo 15:00
const ana: Miembro = { id: "ana", nombre: "Ana", creadoEn: "2026-10-05T13:00:00Z" }; // lunes
const beto: Miembro = { id: "beto", nombre: "Beto", creadoEn: "2026-10-06T13:00:00Z" }; // martes
const miembros = [beto, manu, ana];
const sinFecha: Grupo = { miembros, lanzamientoEn: null };
const conFecha: Grupo = { miembros, lanzamientoEn: "2026-10-05" };

describe("semana de lanzamiento configurable (D35)", () => {
  it("sin lanzamiento_en, la misión inicial se perdería: el lunes ya rige la de reemplazo", () => {
    expect(semanaDeLanzamiento(sinFecha)).toBe("2026-09-28");
    expect(misionDeSemana("2026-10-05", sinFecha, null)).toMatchObject({ origen: "reemplazo", capitanId: "manu" });
  });

  it("con lanzamiento_en, la semana de lanzamiento es la de esa fecha", () => {
    expect(semanaDeLanzamiento(conFecha)).toBe("2026-10-05");
    expect(semanaDeLanzamiento({ miembros, lanzamientoEn: "2026-10-08" })).toBe("2026-10-05"); // jueves
    expect(semanaDeLanzamiento({ miembros: [], lanzamientoEn: "2026-10-11" })).toBe("2026-10-05"); // domingo
  });

  it("hasta la semana de lanzamiento incluida rige la misión inicial, también antes", () => {
    expect(misionDeSemana("2026-09-28", conFecha, null)).toMatchObject({
      origen: "lanzamiento",
      titulo: "Cada uno suma 2 aportes",
      meta: 2, // esa semana solo estaba Manu
      capitanId: null,
      topePorMiembro: 2,
    });
    expect(misionDeSemana("2026-10-05", conFecha, null)).toMatchObject({ origen: "lanzamiento", meta: 6 });
    expect(misionDeSemana("2026-10-12", conFecha, null)).toMatchObject({ origen: "reemplazo", capitanId: "manu" });
  });

  it("el capitán rota desde la semana siguiente, por orden de ingreso", () => {
    const capitanes = ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26", "2026-11-02"].map(
      (semana) => capitanDeSemana(semana, conFecha),
    );
    expect(capitanes).toEqual([null, null, "manu", "ana", "beto", "manu"]);
  });

  it("si la fecha fijada ya pasó, las semanas se cuentan desde ella", () => {
    const pasada: Grupo = { miembros, lanzamientoEn: "2026-09-14" };
    expect(capitanDeSemana("2026-10-05", pasada)).toBe("manu"); // semana 3; solo Manu entró antes
    expect(capitanDeSemana("2026-10-12", pasada)).toBe("manu"); // semana 4: (4 − 1) % 3 = 0
    expect(capitanDeSemana("2026-10-19", pasada)).toBe("ana"); // semana 5: (5 − 1) % 3 = 1
  });

  it("nadie define la misión hasta la semana de lanzamiento incluida", () => {
    for (const semana of ["2026-09-28", "2026-10-05"]) {
      for (const usuarioId of ["manu", "ana", "beto"]) {
        const r = validarDefinicionMision({ accion: "probar", meta: 3 }, { semana, usuarioId, grupo: conFecha, definida: null });
        expect(r).toMatchObject({ ok: false, errores: { mision: "Hasta la semana de lanzamiento rige la misión inicial." } });
      }
    }
    const manuDefine = validarDefinicionMision(
      { accion: "probar", meta: 3 },
      { semana: "2026-10-12", usuarioId: "manu", grupo: conFecha, definida: null },
    );
    expect(manuDefine).toEqual({ ok: true, valor: { accion: "probar", meta: 3 } });
  });

  it("la misión inicial de una semana previa cuenta solo los aportes de esa semana, hasta 2 por persona", () => {
    const mision = misionDeSemana("2026-09-28", conFecha, null);
    if (!mision) throw new Error("falta la misión");
    const progreso = progresoMision(mision, [
      { perfilId: "manu", accion: "publicar", creadoEn: "2026-10-04T19:00:00Z" },
      { perfilId: "manu", accion: "publicar", creadoEn: "2026-10-04T20:00:00Z" },
      { perfilId: "manu", accion: "publicar", creadoEn: "2026-10-04T21:00:00Z" },
      { perfilId: "ana", accion: "publicar", creadoEn: "2026-10-05T14:00:00Z" }, // ya es la semana siguiente
    ]);
    expect(progreso).toEqual({ hecho: 2, meta: 2, completa: true, participantes: ["manu"] });
  });
});
