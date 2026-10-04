import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { requireUser, leerLink, redirect } = vi.hoisted(() => ({
  requireUser: vi.fn(async () => ({ id: "demo-vos", email: null })),
  leerLink: vi.fn(async () => ({ ok: false as const, motivo: "x", fuente: null })),
  redirect: vi.fn((destino: string) => {
    throw new Error(`REDIRECT ${destino}`);
  }),
}));

vi.mock("@/auth/sesion", () => ({ requireUser }));
vi.mock("@/lectura/leer-link", () => ({ leerLink }));
vi.mock("next/navigation", () => ({ redirect }));

import { leerLinkParaPublicar, publicar } from "./publicar";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("HEROES_DEMO", "1");
  vi.stubEnv("VERCEL_ENV", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("acciones de Publicar", () => {
  it("leer un link exige sesión y pasa el GITHUB_TOKEN opcional", async () => {
    vi.stubEnv("GITHUB_TOKEN", " ghp_x ");
    await leerLinkParaPublicar("https://github.com/a/b");
    expect(requireUser).toHaveBeenCalled();
    expect(leerLink).toHaveBeenCalledWith("https://github.com/a/b", { tokenGithub: "ghp_x" });
    vi.stubEnv("GITHUB_TOKEN", "");
    await leerLinkParaPublicar("https://example.com");
    expect(leerLink).toHaveBeenLastCalledWith("https://example.com", { tokenGithub: null });
  });

  it("sin link (o con algo que no es texto) no lee nada", async () => {
    for (const link of [undefined, 42, "   "]) {
      expect(await leerLinkParaPublicar(link)).toEqual({ ok: false, motivo: "Pegá un link para leerlo.", fuente: null });
    }
    expect(leerLink).not.toHaveBeenCalled();
  });

  it("publicar exige sesión, devuelve los errores y, si sale bien, vuelve al inicio", async () => {
    expect(await publicar(null, { tipo: "skill" })).toMatchObject({ ok: false, errores: { link: expect.any(String) } });
    expect(requireUser).toHaveBeenCalled();
    const valido = { tipo: "repo", link: "https://example.com/repo", titulo: "Repo", porQueSirve: "Ahorra tiempo" };
    await expect(publicar(null, valido)).rejects.toThrow("REDIRECT /");
  });
});
