import { describe, expect, it } from "vitest";
import { LIMITE_CARPETA, validarNombreCarpeta } from "./carpetas";

describe("nombre de carpeta", () => {
  it("limpia espacios y acepta un nombre normal", () => {
    expect(validarNombreCarpeta("  Para   probar ")).toEqual({ ok: true, valor: "Para probar" });
  });

  it("rechaza vacío, muy largo y no texto", () => {
    for (const malo of ["", "   ", null, 3]) expect(validarNombreCarpeta(malo).ok, String(malo)).toBe(false);
    expect(validarNombreCarpeta("x".repeat(LIMITE_CARPETA + 1)).ok).toBe(false);
    expect(validarNombreCarpeta("x".repeat(LIMITE_CARPETA)).ok).toBe(true);
  });

  it("no repite un nombre (sin mayúsculas) salvo al renombrar la misma carpeta", () => {
    const existentes = [{ id: "c1", nombre: "Ideas" }];
    expect(validarNombreCarpeta("ideas", existentes).ok).toBe(false);
    expect(validarNombreCarpeta("ideas", existentes, "c1")).toEqual({ ok: true, valor: "ideas" });
  });
});
