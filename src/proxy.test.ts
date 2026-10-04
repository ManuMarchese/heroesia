import { getRedirectUrl, unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Cookies = { getAll: () => unknown; setAll: (c: { name: string; value: string; options: object }[], h: Record<string, string>) => void };
const { getClaims, ultimo } = vi.hoisted(() => ({ getClaims: vi.fn(), ultimo: { cookies: null as Cookies | null } }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url: string, _clave: string, opciones: { cookies: Cookies }) => {
    ultimo.cookies = opciones.cookies;
    return { auth: { getClaims } };
  }),
}));

import { config, proxy } from "./proxy";

const pedido = (ruta: string) => new NextRequest(`https://heroes.example.com${ruta}`);
const sigue = (r: Response) => r.headers.get("x-middleware-next") === "1";
const conSesion = () => getClaims.mockResolvedValue({ data: { claims: { sub: "u-1" } }, error: null });
const sinSesion = () => getClaims.mockResolvedValue({ data: null, error: null });

beforeEach(() => {
  getClaims.mockReset();
  vi.stubEnv("HEROES_DEMO", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_x");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("proxy", () => {
  it("sin sesión manda a /entrar recordando la ruta", async () => {
    sinSesion();
    const r = await proxy(pedido("/perfil?x=1"));
    expect(r.status).toBe(307);
    expect(getRedirectUrl(r)).toBe("https://heroes.example.com/entrar?next=%2Fperfil%3Fx%3D1");
  });

  it("con sesión deja pasar, y desde /entrar lleva al inicio", async () => {
    conSesion();
    expect(sigue(await proxy(pedido("/perfil")))).toBe(true);
    expect(getRedirectUrl(await proxy(pedido("/entrar")))).toBe("https://heroes.example.com/");
  });

  it("deja pasar /entrar y /auth/confirm sin sesión", async () => {
    sinSesion();
    expect(sigue(await proxy(pedido("/entrar")))).toBe(true);
    expect(sigue(await proxy(pedido("/auth/confirm?token_hash=abc&type=email")))).toBe(true);
  });

  it("si getClaims renueva la sesión, la respuesta lleva las cookies nuevas y no se guarda en caché", async () => {
    getClaims.mockImplementation(async () => {
      ultimo.cookies?.setAll([{ name: "sb-token", value: "nuevo", options: { path: "/" } }], { "Cache-Control": "private, no-store" });
      return { data: null, error: null };
    });
    const r = await proxy(pedido("/perfil"));
    expect(r.status).toBe(307);
    expect(r.headers.get("set-cookie")).toContain("sb-token=nuevo");
    expect(r.headers.get("cache-control")).toBe("private, no-store");
  });

  it("en la producción de Vercel exige sesión aunque HEROES_DEMO=1 esté cargada (D35)", async () => {
    sinSesion();
    vi.stubEnv("HEROES_DEMO", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(getRedirectUrl(await proxy(pedido("/perfil")))).toBe("https://heroes.example.com/entrar?next=%2Fperfil");
  });

  it("en modo demostración o sin Supabase configurado no consulta nada", async () => {
    vi.stubEnv("HEROES_DEMO", "1");
    expect(sigue(await proxy(pedido("/perfil")))).toBe(true);
    vi.stubEnv("HEROES_DEMO", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(sigue(await proxy(pedido("/perfil")))).toBe(true);
    expect(getClaims).not.toHaveBeenCalled();
  });

  it("no corre en archivos estáticos, íconos, manifest ni licencias; sí en las páginas", () => {
    const corre = (url: string) => unstable_doesMiddlewareMatch({ config, url });
    for (const url of ["/", "/perfil", "/entrar", "/auth/confirm"]) expect(corre(url), url).toBe(true);
    for (const url of [
      "/_next/static/chunks/a.js",
      "/manifest.webmanifest",
      "/icons/icon-192.png",
      "/apple-icon.png",
      "/icon.svg",
      "/licencias/Nunito-OFL.txt",
    ]) {
      expect(corre(url), url).toBe(false);
    }
  });
});
