import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import { CABECERAS_SEGURIDAD } from "./cabeceras";

describe("cabeceras de seguridad", () => {
  it("next.config las aplica a todas las rutas", async () => {
    const reglas = await nextConfig.headers?.();
    expect(reglas).toEqual([{ source: "/(.*)", headers: [...CABECERAS_SEGURIDAD] }]);
    expect(CABECERAS_SEGURIDAD.map((c) => `${c.key}: ${c.value}`)).toEqual([
      "X-Content-Type-Options: nosniff",
      "X-Frame-Options: DENY",
      "Referrer-Policy: strict-origin-when-cross-origin",
    ]);
  });
});
