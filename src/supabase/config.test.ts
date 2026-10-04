import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { modoDemo } from "./config";

const SRC = fileURLToPath(new URL("..", import.meta.url));

function fuentes(carpeta: string): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) return fuentes(ruta);
    return /\.tsx?$/.test(entrada.name) && !/\.test\.tsx?$/.test(entrada.name) ? [ruta] : [];
  });
}

describe("modo demostración (D35)", () => {
  it("se activa solo con HEROES_DEMO=1", () => {
    expect(modoDemo({ HEROES_DEMO: "1" })).toBe(true);
    for (const valor of [undefined, "", "0", "true", "si", " 1"]) {
      expect(modoDemo({ HEROES_DEMO: valor })).toBe(false);
    }
  });

  it("nunca en la producción de Vercel, aunque HEROES_DEMO=1 esté cargada por error", () => {
    expect(modoDemo({ HEROES_DEMO: "1", VERCEL_ENV: "production" })).toBe(false);
    expect(modoDemo({ VERCEL_ENV: "production" })).toBe(false);
  });

  it("fuera de producción (preview, development o sin Vercel) respeta HEROES_DEMO", () => {
    for (const entorno of ["preview", "development", "", undefined]) {
      expect(modoDemo({ HEROES_DEMO: "1", VERCEL_ENV: entorno }), String(entorno)).toBe(true);
    }
  });

  it("ningún otro archivo del código lee HEROES_DEMO directo", () => {
    const lectores = fuentes(SRC)
      .filter((ruta) => /\.HEROES_DEMO\b|\[\s*["'`]HEROES_DEMO["'`]\s*\]/.test(readFileSync(ruta, "utf8")))
      .map((ruta) => relative(SRC, ruta).split(sep).join("/"));
    expect(lectores).toEqual(["supabase/config.ts"]);
  });
});
