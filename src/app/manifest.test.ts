import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { AZUL_HEROE } from "@/styles/colores-marca";
import manifest from "./manifest";

const raiz = (ruta: string) => fileURLToPath(new URL(`../../${ruta}`, import.meta.url));

function medidasPng(ruta: string): { ancho: number; alto: number } {
  const datos = readFileSync(raiz(ruta));
  expect(datos.subarray(1, 4).toString("ascii")).toBe("PNG");
  // El ancho y el alto están en el bloque IHDR, en los bytes 16 a 23.
  return { ancho: datos.readUInt32BE(16), alto: datos.readUInt32BE(20) };
}

describe("manifest de la web instalable", () => {
  const m = manifest();

  it("tiene nombre, inicio y modo app", () => {
    expect(m.name).toBe("Heroes IA");
    expect(m.short_name).toBe("Heroes IA");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.prefer_related_applications).toBeUndefined();
  });

  it("declara íconos de 192 y 512 px que existen con esas medidas", () => {
    const iconos = m.icons ?? [];
    const comunes = iconos.filter((i) => i.purpose === "any").map((i) => i.sizes);
    expect(comunes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    for (const icono of iconos) {
      const [ancho, alto] = (icono.sizes ?? "").split("x").map(Number);
      expect(medidasPng(`public${icono.src}`)).toEqual({ ancho, alto });
    }
  });

  it("el ícono de iPhone mide 180 px", () => {
    expect(medidasPng("src/app/apple-icon.png")).toEqual({ ancho: 180, alto: 180 });
  });

  it("usa el mismo azul que tokens.css", () => {
    const tokens = readFileSync(raiz("src/styles/tokens.css"), "utf8");
    expect(tokens).toMatch(new RegExp(`--azul-heroe:\\s*${AZUL_HEROE};`, "i"));
    expect(m.theme_color).toBe(AZUL_HEROE);
    expect(m.background_color).toBe(AZUL_HEROE);
  });
});
