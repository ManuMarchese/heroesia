import { describe, expect, it } from "vitest";
import { haceCuanto, inicial, textoDiasQueFaltan, textoVencimiento } from "./formato";
import { validarNombre } from "./perfil";

const AHORA = new Date("2026-10-07T15:00:00Z"); // miércoles 12:00 en Buenos Aires

describe("hace cuánto", () => {
  it.each([
    ["2026-10-07T14:59:40Z", "recién"],
    ["2026-10-07T14:55:00Z", "hace 5 min"],
    ["2026-10-07T13:00:00Z", "hace 2 h"],
    ["2026-10-06T16:00:00Z", "hace 23 h"],
    ["2026-10-06T15:00:00Z", "ayer"],
    ["2026-10-04T12:00:00Z", "hace 3 días"],
    ["2026-09-28T12:00:00Z", "el 28/9"],
    ["2026-10-08T15:00:00Z", "recién"], // reloj adelantado
  ])("%s → %s", (fecha, texto) => {
    expect(haceCuanto(fecha, AHORA)).toBe(texto);
  });
});

describe("iniciales y textos de fechas", () => {
  it("la inicial es la primera letra o número, en mayúscula", () => {
    expect(inicial("ana")).toBe("A");
    expect(inicial("  élida")).toBe("É");
    expect(inicial("_42")).toBe("4");
    expect(inicial("")).toBe("?");
  });

  it("vencimientos de oportunidades", () => {
    expect(textoVencimiento(3, "2026-10-10")).toBe("Vence en 3 días");
    expect(textoVencimiento(1, "2026-10-08")).toBe("Vence mañana");
    expect(textoVencimiento(0, "2026-10-07")).toBe("Vence hoy");
    expect(textoVencimiento(-2, "2026-10-05")).toBe("Venció el 5/10");
  });

  it("días que faltan de la semana", () => {
    expect(textoDiasQueFaltan(7)).toBe("Faltan 7 días");
    expect(textoDiasQueFaltan(2)).toBe("Faltan 2 días");
    expect(textoDiasQueFaltan(1)).toBe("Último día");
  });
});

describe("nombre visible", () => {
  it("lo deja en una línea, sin espacios de más ni caracteres de control", () => {
    expect(validarNombre("  Ana \n  María ")).toEqual({ ok: true, valor: "Ana María" });
    expect(validarNombre("Beto\u0000​")).toEqual({ ok: true, valor: "Beto" });
  });

  it("exige algo escrito y como máximo 40 caracteres, como la base", () => {
    for (const vacio of ["", "   ", null, 42]) {
      expect(validarNombre(vacio)).toMatchObject({ ok: false, errores: { nombre: "Escribí tu nombre." } });
    }
    expect(validarNombre("x".repeat(40)).ok).toBe(true);
    expect(validarNombre("x".repeat(41))).toMatchObject({ ok: false });
  });
});
