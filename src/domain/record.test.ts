import { describe, expect, it } from "vitest";
import { recordPersonal } from "./record";

// "Ahora": miércoles 2026-10-07 al mediodía de Buenos Aires (semana del lunes 2026-10-05).
const AHORA = new Date("2026-10-07T15:00:00Z");
const repetir = (fecha: string, veces: number) => Array.from({ length: veces }, () => fecha);

describe("récord personal (semana con más pruebas)", () => {
  it("sin pruebas no hay récord", () => {
    expect(recordPersonal([], AHORA)).toEqual({
      estaSemana: 0,
      record: 0,
      semanaRecord: null,
      recordPrevio: 0,
      esNuevoRecord: false,
    });
  });

  it("guarda la mejor semana y cuenta la actual aparte", () => {
    const pruebas = [
      ...repetir("2026-09-16T12:00:00Z", 3), // semana del 14/9
      ...repetir("2026-09-23T12:00:00Z", 5), // semana del 21/9
      ...repetir("2026-10-06T12:00:00Z", 2), // semana actual
    ];
    expect(recordPersonal(pruebas, AHORA)).toEqual({
      estaSemana: 2,
      record: 5,
      semanaRecord: "2026-09-21",
      recordPrevio: 5,
      esNuevoRecord: false,
    });
  });

  it("la semana actual puede ser el nuevo récord", () => {
    const pruebas = [...repetir("2026-09-23T12:00:00Z", 2), ...repetir("2026-10-06T12:00:00Z", 3)];
    expect(recordPersonal(pruebas, AHORA)).toMatchObject({
      estaSemana: 3,
      record: 3,
      semanaRecord: "2026-10-05",
      esNuevoRecord: true,
    });
  });

  it("si empata, el récord sigue siendo la primera semana", () => {
    const pruebas = [...repetir("2026-09-23T12:00:00Z", 3), ...repetir("2026-10-06T12:00:00Z", 3)];
    expect(recordPersonal(pruebas, AHORA)).toMatchObject({ record: 3, semanaRecord: "2026-09-21", esNuevoRecord: false });
  });

  it("respeta el cambio de semana en hora de Buenos Aires", () => {
    const pruebas = ["2026-10-05T02:59:00Z", "2026-10-05T03:00:00Z"]; // domingo 23:59 y lunes 00:00
    expect(recordPersonal(pruebas, AHORA)).toMatchObject({ estaSemana: 1, recordPrevio: 1, record: 1 });
  });

  it("ignora fechas futuras", () => {
    expect(recordPersonal(["2026-10-20T12:00:00Z"], AHORA)).toMatchObject({ estaSemana: 0, record: 0 });
  });
});
