import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { requireUser, refresh } = vi.hoisted(() => ({
  requireUser: vi.fn(async () => ({ id: "demo-vos", email: null })),
  refresh: vi.fn(),
}));

vi.mock("@/auth/sesion", () => ({ requireUser }));
vi.mock("next/cache", () => ({ refresh }));

import { definirMision, hacerAccion, marcarUtil } from "./aportes";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("HEROES_DEMO", "1");
  vi.stubEnv("VERCEL_ENV", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("acciones sobre aportes y misión", () => {
  it("exigen sesión y refrescan la pantalla solo si salió bien", async () => {
    expect(await hacerAccion(null, { aporteId: "demo-a1", tipo: "probar", resultado: "" })).toMatchObject({ ok: false });
    expect(requireUser).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();
    expect(await hacerAccion(null, { aporteId: "demo-a2", tipo: "probar", resultado: "Lo usé en un bot" })).toMatchObject({ ok: true });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("marcar útil y definir la misión también pasan por la sesión", async () => {
    expect(await marcarUtil(null, "no-existe")).toMatchObject({ ok: false });
    expect(await definirMision(null, { accion: "bailar", meta: 3 })).toMatchObject({ ok: false });
    expect(requireUser).toHaveBeenCalledTimes(2);
    expect(refresh).not.toHaveBeenCalled();
  });
});
