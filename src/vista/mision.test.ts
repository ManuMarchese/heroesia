import { describe, expect, it } from "vitest";
import { misionDeSemana, progresoMision } from "@/domain/mision";
import type { Miembro } from "@/domain/tipos";
import { MAX_SEGMENTOS, segmentos, vistaMision } from "./mision";

const AHORA = new Date("2026-10-11T15:00:00Z"); // domingo: último día de la semana del 5/10
const ana: Miembro = { id: "ana", nombre: "Ana", creadoEn: "2026-09-30T15:00:00Z" };
const beto: Miembro = { id: "beto", nombre: "beto.perez", creadoEn: "2026-10-01T15:00:00Z" };
const miembros = [ana, beto];

describe("segmentos de progreso", () => {
  it("uno por punto de la meta, hasta 10; con metas grandes cada uno vale una parte", () => {
    expect(segmentos(3, 5)).toEqual({ total: 5, llenos: 3 });
    expect(segmentos(9, 5)).toEqual({ total: 5, llenos: 5 });
    expect(segmentos(14, 30)).toEqual({ total: MAX_SEGMENTOS, llenos: 4 });
    expect(segmentos(30, 30)).toEqual({ total: MAX_SEGMENTOS, llenos: MAX_SEGMENTOS });
    expect(segmentos(0, 0)).toEqual({ total: 0, llenos: 0 });
  });
});

describe("tarjeta de la misión", () => {
  const grupo = { miembros, lanzamientoEn: null };

  it("de reemplazo: dice quién es el capitán; al capitán le ofrece elegirla", () => {
    const mision = misionDeSemana("2026-10-05", grupo, null);
    if (!mision) throw new Error("falta la misión");
    const progreso = progresoMision(mision, [{ perfilId: "beto", accion: "probar", creadoEn: "2026-10-06T12:00:00Z" }]);
    const paraBeto = vistaMision(mision, progreso, miembros, "beto", AHORA);
    expect(paraBeto).toMatchObject({
      titulo: "Probar 5 skills o repos",
      hecho: 1,
      meta: 5,
      faltan: "Último día",
      capitan: "Ana",
      esCapitan: false,
      puedeDefinir: false,
      detalle: "Misión de reemplazo hasta que Ana elija la de esta semana.",
      participantes: [{ id: "beto", nombre: "beto.perez", inicial: "B" }],
    });
    expect(vistaMision(mision, progreso, miembros, "ana", AHORA)).toMatchObject({ esCapitan: true, puedeDefinir: true });
  });

  it("la que eligió el capitán ya no se puede volver a definir", () => {
    const definida = { semana: "2026-10-05", accion: "leer" as const, meta: 3, definidaPor: "ana", creadaEn: "2026-10-05T12:00:00Z" };
    const mision = misionDeSemana("2026-10-05", grupo, definida);
    if (!mision) throw new Error("falta la misión");
    const vista = vistaMision(mision, progresoMision(mision, []), miembros, "ana", AHORA);
    expect(vista).toMatchObject({ origen: "capitan", puedeDefinir: false, detalle: "La elegiste vos, capitán de esta semana." });
  });

  it("la inicial avisa el tope por persona y no tiene capitán", () => {
    const mision = misionDeSemana("2026-09-28", grupo, null);
    if (!mision) throw new Error("falta la misión");
    const vista = vistaMision(mision, progresoMision(mision, []), miembros, "ana", AHORA);
    expect(vista).toMatchObject({
      titulo: "Cada uno suma 2 aportes",
      capitan: null,
      puedeDefinir: false,
      detalle: "Arranque del equipo: cuentan hasta 2 aportes por persona.",
    });
  });
});
