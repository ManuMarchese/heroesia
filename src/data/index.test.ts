import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorConfiguracion, configSupabase, modoDemo } from "@/supabase/config";
import { USUARIO_DEMO } from "./demo-datos";
import { obtenerRepositorio } from "./index";

afterEach(() => {
  vi.unstubAllEnvs();
});

function sinSupabase() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
}

describe("elección de la fuente de datos", () => {
  it("en la producción de Vercel ignora HEROES_DEMO=1 y exige Supabase", async () => {
    sinSupabase();
    vi.stubEnv("HEROES_DEMO", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(modoDemo()).toBe(false);
    await expect(obtenerRepositorio(USUARIO_DEMO.id)).rejects.toBeInstanceOf(ErrorConfiguracion);
  });

  it("con HEROES_DEMO=1 usa los datos de ejemplo, sin Supabase", async () => {
    sinSupabase();
    vi.stubEnv("HEROES_DEMO", "1");
    vi.stubEnv("VERCEL_ENV", "");
    const repo = await obtenerRepositorio(USUARIO_DEMO.id);
    expect((await repo.miembros()).some((m) => m.id === USUARIO_DEMO.id)).toBe(true);
  });

  it("sin HEROES_DEMO nunca cae en la demostración: sin Supabase configurado, avisa qué falta", async () => {
    sinSupabase();
    vi.stubEnv("HEROES_DEMO", "");
    await expect(obtenerRepositorio("alguien")).rejects.toBeInstanceOf(ErrorConfiguracion);
    await expect(obtenerRepositorio("alguien")).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("lee la URL y la clave publicable, y exige las dos", () => {
    expect(configSupabase({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x" })).toEqual({
      url: "https://x.supabase.co",
      clavePublicable: "sb_publishable_x",
    });
    expect(configSupabase({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" })).toBeNull();
    expect(configSupabase({})).toBeNull();
  });
});
