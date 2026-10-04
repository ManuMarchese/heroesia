import { describe, expect, it } from "vitest";
import { pagina, redireccion, resolvedorFalso, transporteFalso } from "./falsos";
import { repoDeGithub } from "./github";
import { leerLink, MENSAJES, USER_AGENT } from "./leer-link";

const dns = resolvedorFalso({
  "api.github.com": ["140.82.112.6"],
  "github.com": ["140.82.112.3"],
  "example.com": ["93.184.216.34"],
  "malicioso.example": ["198.41.0.4"],
});
const json = (cuerpo: unknown, estado = 200, encabezados: Record<string, string> = {}) => ({
  estado,
  encabezados: { "content-type": "application/json", ...encabezados },
  cuerpo: JSON.stringify(cuerpo),
});

describe("repos de GitHub por la API pública", () => {
  it("reconoce repos y descarta las páginas propias de GitHub", () => {
    expect(repoDeGithub(new URL("https://github.com/vercel/next.js"))).toEqual({ dueno: "vercel", repo: "next.js" });
    expect(repoDeGithub(new URL("https://www.github.com/ana/agent-kit.git"))).toEqual({ dueno: "ana", repo: "agent-kit" });
    expect(repoDeGithub(new URL("https://github.com/ana/agent-kit/tree/main/src"))).toEqual({ dueno: "ana", repo: "agent-kit" });
    for (const link of ["https://github.com/ana", "https://github.com/topics/ai", "https://gist.github.com/a/b", "https://example.com/a/b"]) {
      expect(repoDeGithub(new URL(link)), link).toBeNull();
    }
  });

  it("arma título e imagen con la API, con User-Agent y el token si hay", async () => {
    const t = transporteFalso(() =>
      json({ full_name: "ana/agent-kit", description: "Plantillas de agentes", owner: { avatar_url: "https://avatars.githubusercontent.com/u/1" } }),
    );
    const resultado = await leerLink("https://github.com/ana/agent-kit", { resolver: dns, transporte: t.transporte, tokenGithub: "ghp_prueba" });
    expect(resultado).toEqual({
      ok: true,
      titulo: "ana/agent-kit: Plantillas de agentes",
      imagenUrl: "https://avatars.githubusercontent.com/u/1",
      fuente: "github.com",
      tipoSugerido: "repo",
    });
    expect(t.pedidos[0]?.url.href).toBe("https://api.github.com/repos/ana/agent-kit");
    expect(t.pedidos[0]?.encabezados).toMatchObject({ "user-agent": USER_AGENT, authorization: "Bearer ghp_prueba" });
    const sinToken = transporteFalso(() => json({ full_name: "ana/agent-kit" }));
    await leerLink("https://github.com/ana/agent-kit", { resolver: dns, transporte: sinToken.transporte });
    expect(sinToken.pedidos[0]?.encabezados.authorization).toBeUndefined();
  });

  it("con el límite agotado (403 con x-ratelimit-remaining 0, o 429) falla con gracia", async () => {
    for (const respuesta of [json({ message: "API rate limit exceeded" }, 403, { "x-ratelimit-remaining": "0" }), json({}, 429)]) {
      const t = transporteFalso(() => respuesta);
      expect(await leerLink("https://github.com/ana/agent-kit", { resolver: dns, transporte: t.transporte })).toEqual({
        ok: false,
        motivo: MENSAJES.limite_github,
        fuente: "github.com",
      });
    }
    const privado = transporteFalso(() => json({ message: "Not Found" }, 404));
    expect(await leerLink("https://github.com/ana/secreto", { resolver: dns, transporte: privado.transporte })).toMatchObject({
      motivo: MENSAJES.no_encontrado,
    });
  });

  it("el token nunca viaja a otro sitio en una redirección", async () => {
    const t = transporteFalso((_p, n) => (n === 1 ? redireccion("https://malicioso.example/robar", 301) : json({ full_name: "x/y" })));
    await leerLink("https://github.com/ana/agent-kit", { resolver: dns, transporte: t.transporte, tokenGithub: "ghp_secreto" });
    expect(t.pedidos.map((p) => [p.url.host, p.encabezados.authorization])).toEqual([
      ["api.github.com", "Bearer ghp_secreto"],
      ["malicioso.example", undefined],
    ]);
  });
});

describe("X y LinkedIn", () => {
  it.each(["https://x.com/alguien/status/1", "https://twitter.com/a", "https://www.linkedin.com/posts/a", "https://lnkd.in/abc", "https://t.co/xyz"])(
    "%s no se pide: se completa a mano",
    async (link) => {
      const t = transporteFalso(() => pagina("<title>No</title>"));
      expect(await leerLink(link, { resolver: dns, transporte: t.transporte })).toMatchObject({ ok: false, motivo: MENSAJES.terminos });
      expect(t.pedidos).toHaveLength(0);
    },
  );
});

describe("devuelve solo título, imagen http o https y fuente", () => {
  it("la imagen relativa se completa con la página final; las peligrosas o locales se descartan", async () => {
    const casos: [string, string | null][] = [
      ["/img/portada.png", "https://example.com/img/portada.png"],
      ["javascript:alert(1)", null],
      ["data:image/png;base64,AAAA", null],
      ["http://127.0.0.1/x.png", null],
      ["https://usuario:clave@cdn.example.com/x.png", null],
    ];
    for (const [imagen, esperada] of casos) {
      const t = transporteFalso(() => pagina(`<meta property="og:image" content="${imagen}"><title>T</title>`));
      const r = await leerLink("https://example.com/nota", { resolver: dns, transporte: t.transporte });
      expect(r, imagen).toEqual({ ok: true, titulo: "T", imagenUrl: esperada, fuente: "example.com", tipoSugerido: null });
    }
  });

  it("recorta el título a 140 caracteres y usa og:site_name como fuente", async () => {
    const t = transporteFalso(() => pagina(`<meta property="og:title" content="${"Muy largo ".repeat(30)}"><meta property="og:site_name" content="Diario">`));
    const r = await leerLink("https://example.com/", { resolver: dns, transporte: t.transporte });
    expect(r.ok && r.titulo?.length).toBe(140);
    expect(r.ok && r.fuente).toBe("Diario");
  });
});
