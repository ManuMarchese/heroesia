import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getClaims } = vi.hoisted(() => ({ getClaims: vi.fn() }));

vi.mock("next/server", () => ({ connection: vi.fn(async () => undefined) }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`REDIRECT ${destino}`);
  }),
}));
vi.mock("@/supabase/servidor", () => ({ crearClienteServidor: vi.fn(async () => ({ auth: { getClaims } })) }));

import { USUARIO_DEMO } from "@/data/demo-datos";
import { obtenerUsuario, requireUser } from "./sesion";

function configurar({ demo = false, supabase = true } = {}) {
  vi.stubEnv("HEROES_DEMO", demo ? "1" : "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", supabase ? "https://x.supabase.co" : "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", supabase ? "sb_publishable_x" : "");
}

beforeEach(() => {
  getClaims.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sesión del servidor", () => {
  it("en modo demostración entra el usuario de ejemplo sin tocar Supabase", async () => {
    configurar({ demo: true, supabase: false });
    expect(await requireUser()).toEqual({ id: USUARIO_DEMO.id, email: USUARIO_DEMO.email });
    expect(getClaims).not.toHaveBeenCalled();
  });

  it("con una sesión válida devuelve el id y el email de los claims", async () => {
    configurar();
    getClaims.mockResolvedValue({ data: { claims: { sub: "u-1", email: "ana@example.com" } }, error: null });
    expect(await requireUser()).toEqual({ id: "u-1", email: "ana@example.com" });
  });

  it("sin sesión, con error o sin sub, requireUser manda a /entrar", async () => {
    configurar();
    for (const respuesta of [
      { data: null, error: null },
      { data: null, error: { message: "JWT expired", status: 401 } },
      { data: { claims: { sub: "" } }, error: null },
    ]) {
      getClaims.mockResolvedValue(respuesta);
      expect(await obtenerUsuario()).toBeNull();
      await expect(requireUser()).rejects.toThrow("REDIRECT /entrar");
    }
  });

  it("sin Supabase configurado y sin demo, no hay sesión (la pantalla de entrada avisa)", async () => {
    configurar({ supabase: false });
    expect(await obtenerUsuario()).toBeNull();
    expect(getClaims).not.toHaveBeenCalled();
  });
});
