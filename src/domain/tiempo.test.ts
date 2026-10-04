import { describe, expect, it } from "vitest";
import {
  diaCorto,
  diaDeSemana,
  diaLocal,
  diasEntre,
  diasQueFaltan,
  esDiaValido,
  lunesDe,
  semanaDe,
  semanasEntre,
  sumarDias,
} from "./tiempo";

// 2026-10-04 es domingo y 2026-10-05 es lunes. Buenos Aires está en UTC−3.
const DOMINGO_2359_BA = "2026-10-05T02:59:59Z";
const LUNES_0000_BA = "2026-10-05T03:00:00Z";

describe("días y semanas en hora de Buenos Aires", () => {
  it("el día cambia a las 00:00 de Buenos Aires, no a medianoche UTC", () => {
    expect(diaLocal(DOMINGO_2359_BA)).toBe("2026-10-04");
    expect(diaLocal(LUNES_0000_BA)).toBe("2026-10-05");
  });

  it("cambio de semana: el domingo 23:59 es de la semana anterior al lunes 00:00", () => {
    expect(semanaDe(DOMINGO_2359_BA)).toBe("2026-09-28");
    expect(semanaDe(LUNES_0000_BA)).toBe("2026-10-05");
    expect(semanaDe("2026-10-11T23:00:00-03:00")).toBe("2026-10-05");
  });

  it("usa la zona IANA: el mismo instante cae en otro día y otra semana en UTC", () => {
    const instante = "2026-10-05T01:00:00Z";
    expect(diaLocal(instante)).toBe("2026-10-04");
    expect(diaLocal(instante, "UTC")).toBe("2026-10-05");
    expect(semanaDe(instante)).toBe("2026-09-28");
    expect(semanaDe(instante, "UTC")).toBe("2026-10-05");
  });

  it("acepta objetos Date además de texto ISO", () => {
    expect(diaLocal(new Date(LUNES_0000_BA))).toBe("2026-10-05");
  });

  it("cruza meses, años y bisiestos", () => {
    expect(semanaDe("2026-01-01T12:00:00Z")).toBe("2025-12-29");
    expect(sumarDias("2026-02-28", 1)).toBe("2026-03-01");
    expect(sumarDias("2028-02-28", 1)).toBe("2028-02-29");
    expect(sumarDias("2026-01-01", -1)).toBe("2025-12-31");
    expect(diasEntre("2026-12-30", "2027-01-02")).toBe(3);
  });

  it("numera los días de lunes (0) a domingo (6)", () => {
    expect(diaDeSemana("2026-10-05")).toBe(0);
    expect(diaDeSemana("2026-10-04")).toBe(6);
  });

  it("el lunes de un día es la clave de su semana", () => {
    expect(lunesDe("2026-10-05")).toBe("2026-10-05");
    expect(lunesDe("2026-10-04")).toBe("2026-09-28");
    expect(lunesDe("2026-10-08")).toBe("2026-10-05");
    expect(lunesDe("2027-01-01")).toBe("2026-12-28");
  });

  it("cuenta semanas y días que faltan", () => {
    expect(semanasEntre("2026-09-28", "2026-10-12")).toBe(2);
    expect(semanasEntre("2026-10-12", "2026-09-28")).toBe(-2);
    expect(diasQueFaltan(new Date(LUNES_0000_BA))).toBe(7);
    expect(diasQueFaltan(new Date(DOMINGO_2359_BA))).toBe(1);
  });

  it("valida días AAAA-MM-DD reales", () => {
    expect(esDiaValido("2028-02-29")).toBe(true);
    expect(esDiaValido("2026-02-29")).toBe(false);
    expect(esDiaValido("2026-13-01")).toBe(false);
    expect(esDiaValido("26-1-1")).toBe(false);
    expect(() => sumarDias("2026-02-30", 1)).toThrow(RangeError);
  });

  it("rechaza fechas inválidas", () => {
    expect(() => diaLocal("no es una fecha")).toThrow(RangeError);
  });

  it("formatea el día corto como día/mes", () => {
    expect(diaCorto("2026-09-28")).toBe("28/9");
    expect(diaCorto("2026-10-04")).toBe("4/10");
  });
});
