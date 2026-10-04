import { describe, expect, it } from "vitest";
import { ITEMS_NAVEGACION, estaActivo } from "./navegacion";

describe("navegación inferior", () => {
  it("tiene Inicio, Explorar, + y Perfil en ese orden", () => {
    expect(ITEMS_NAVEGACION.map((i) => i.etiqueta)).toEqual(["Inicio", "Explorar", "Publicar", "Perfil"]);
    expect(ITEMS_NAVEGACION.filter((i) => i.destacado).map((i) => i.href)).toEqual(["/publicar"]);
  });

  it("Inicio solo está activo en la raíz", () => {
    expect(estaActivo("/", "/")).toBe(true);
    expect(estaActivo("/explorar", "/")).toBe(false);
  });

  it("las demás secciones incluyen sus subrutas, sin confundir prefijos", () => {
    expect(estaActivo("/explorar", "/explorar")).toBe(true);
    expect(estaActivo("/explorar/skill", "/explorar")).toBe(true);
    expect(estaActivo("/explorarlo", "/explorar")).toBe(false);
    expect(estaActivo("/perfil", "/explorar")).toBe(false);
  });
});
