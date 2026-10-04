import { describe, expect, it } from "vitest";
import { cuerpoColgado, cuerpoInfinito, pagina, redireccion, resolvedorFalso, transporteFalso } from "./falsos";
import { leerLink, MENSAJES, TOPE_BYTES, USER_AGENT } from "./leer-link";

const PUBLICA = "93.184.216.34";
const dns = resolvedorFalso({
  "example.com": [PUBLICA],
  "otro.example": ["151.101.1.69"],
  "interno.example": ["10.0.0.5"],
  "mezclado.example": [PUBLICA, "127.0.0.1"],
  "v6.example": ["2606:4700:4700::1111"],
});
const ok = (head: string) => transporteFalso(() => pagina(head));

describe("solo links http y https a sitios públicos (Q5, OWASP)", () => {
  it.each([
    "ftp://example.com/archivo",
    "file:///etc/passwd",
    "javascript:alert(1)",
    "data:text/html,hola",
    "gopher://example.com/",
    "no es un link",
  ])("%s no se lee", async (link) => {
    const t = ok("<title>x</title>");
    expect(await leerLink(link, { resolver: dns, transporte: t.transporte })).toMatchObject({ ok: false, motivo: MENSAJES.formato });
    expect(t.pedidos).toHaveLength(0);
  });

  it.each([
    "http://usuario:clave@example.com/",
    "http://example.com:8080/",
    "http://localhost/",
    "http://app.localhost:80/",
    "http://intranet/",
    "http://127.0.0.1/",
    "http://0x7f.1/", // el parser de URL lo normaliza a 127.0.0.1
    "http://2130706433/",
    "http://[::1]/",
    "http://[::ffff:127.0.0.1]/",
    "http://169.254.169.254/latest/meta-data/",
    "http://10.1.2.3/",
    "http://172.20.0.1/",
    "http://192.168.0.10/",
    "http://0.0.0.0/",
    "http://[fe80::1]/",
    "http://[fd00::1]/",
  ])("%s se bloquea sin pedir nada", async (link) => {
    const t = ok("<title>x</title>");
    const resultado = await leerLink(link, { resolver: dns, transporte: t.transporte });
    expect(resultado).toMatchObject({ ok: false, motivo: MENSAJES.bloqueada });
    expect(t.pedidos).toHaveLength(0);
  });

  it("resuelve el DNS antes de pedir y bloquea si alguna IP es privada", async () => {
    for (const host of ["interno.example", "mezclado.example"]) {
      const t = ok("<title>x</title>");
      expect(await leerLink(`https://${host}/`, { resolver: dns, transporte: t.transporte })).toMatchObject({
        ok: false,
        motivo: MENSAJES.bloqueada,
      });
      expect(t.pedidos).toHaveLength(0);
    }
  });

  it("se conecta a la IP validada, con el nombre en la URL y User-Agent propio", async () => {
    const t = ok('<meta property="og:title" content="Hola">');
    expect(await leerLink("https://example.com/nota?id=1", { resolver: dns, transporte: t.transporte })).toMatchObject({
      ok: true,
      titulo: "Hola",
    });
    expect(t.pedidos[0]).toMatchObject({ ip: PUBLICA, familia: 4 });
    expect(t.pedidos[0]?.url.href).toBe("https://example.com/nota?id=1");
    expect(t.pedidos[0]?.encabezados["user-agent"]).toBe(USER_AGENT);
    const v6 = ok("<title>v6</title>");
    await leerLink("http://v6.example/", { resolver: dns, transporte: v6.transporte });
    expect(v6.pedidos[0]).toMatchObject({ ip: "2606:4700:4700::1111", familia: 6 });
  });

  it("si el DNS falla, avisa y no traba", async () => {
    const t = ok("<title>x</title>");
    expect(await leerLink("https://no-existe.example/", { resolver: dns, transporte: t.transporte })).toEqual({
      ok: false,
      motivo: MENSAJES.dns,
      fuente: "no-existe.example",
    });
  });
});

describe("redirecciones: máximo 3, validando cada destino", () => {
  it("sigue hasta 3, con destinos relativos, y la 4.ª corta", async () => {
    const tres = transporteFalso((_p, n) => (n <= 3 ? redireccion(`/paso-${n}`) : pagina("<title>Llegué</title>")));
    expect(await leerLink("https://example.com/", { resolver: dns, transporte: tres.transporte })).toMatchObject({ ok: true, titulo: "Llegué" });
    expect(tres.pedidos.map((p) => p.url.pathname)).toEqual(["/", "/paso-1", "/paso-2", "/paso-3"]);

    const cuatro = transporteFalso((_p, n) => (n <= 4 ? redireccion(`https://otro.example/${n}`) : pagina("<title>No</title>")));
    expect(await leerLink("https://example.com/", { resolver: dns, transporte: cuatro.transporte })).toMatchObject({
      ok: false,
      motivo: MENSAJES.redirecciones,
    });
    expect(cuatro.pedidos).toHaveLength(4);
  });

  it.each([
    ["http://127.0.0.1/admin", MENSAJES.bloqueada],
    ["http://[::1]:80/", MENSAJES.bloqueada],
    ["https://interno.example/", MENSAJES.bloqueada],
    ["file:///etc/passwd", MENSAJES.formato],
    ["https://x.com/alguien", MENSAJES.terminos],
  ])("una redirección a %s no se sigue", async (destino, motivo) => {
    const t = transporteFalso((_p, n) => (n === 1 ? redireccion(destino) : pagina("<title>No</title>")));
    expect(await leerLink("https://example.com/", { resolver: dns, transporte: t.transporte })).toMatchObject({ ok: false, motivo });
    expect(t.pedidos).toHaveLength(1);
    expect(t.cerradas()).toBe(1);
  });

  it("valida la IP en cada salto: si el DNS cambia a una privada (rebinding), corta", async () => {
    let consultas = 0;
    const cambiante = async () => [{ address: (consultas += 1) === 1 ? PUBLICA : "127.0.0.1", family: 4 }];
    const t = transporteFalso((_p, n) => (n === 1 ? redireccion("/segunda") : pagina("<title>No</title>")));
    expect(await leerLink("https://example.com/", { resolver: cambiante, transporte: t.transporte })).toMatchObject({
      ok: false,
      motivo: MENSAJES.bloqueada,
    });
    expect(t.pedidos).toHaveLength(1);
  });
});

describe("tamaño y plazo", () => {
  it("de una respuesta enorme baja solo hasta el tope y la corta", async () => {
    const { cuerpo, leido } = cuerpoInfinito('<html><head><meta property="og:title" content="Enorme">');
    const t = transporteFalso(() => ({ cuerpo }));
    expect(await leerLink("https://example.com/", { resolver: dns, transporte: t.transporte })).toMatchObject({ ok: true, titulo: "Enorme" });
    expect(leido.bytes).toBeLessThanOrEqual(TOPE_BYTES + 2 * 65_536);
    expect(t.cerradas()).toBe(1);
  });

  it("deja de leer al terminar el <head>", async () => {
    const { cuerpo, leido } = cuerpoInfinito("<head><title>Corto</title></head>");
    const t = transporteFalso(() => ({ cuerpo }));
    expect(await leerLink("https://example.com/", { resolver: dns, transporte: t.transporte })).toMatchObject({ titulo: "Corto" });
    expect(leido.bytes).toBeLessThan(100);
  });

  it("si el servidor no responde o se cuelga a mitad, corta a tiempo", async () => {
    const colgado = transporteFalso(() => new Promise(() => undefined));
    const inicio = Date.now();
    expect(await leerLink("https://example.com/", { resolver: dns, transporte: colgado.transporte, plazoMs: 50 })).toMatchObject({
      ok: false,
      motivo: MENSAJES.tiempo,
    });
    const aMitad = transporteFalso(() => ({ cuerpo: cuerpoColgado("<html><title>Sin fin") }));
    expect(await leerLink("https://example.com/", { resolver: dns, transporte: aMitad.transporte, plazoMs: 50 })).toMatchObject({
      motivo: MENSAJES.tiempo,
    });
    expect(Date.now() - inicio).toBeLessThan(2000);
  });

  it("si no es una página o el sitio responde con error, se completa a mano", async () => {
    const pdf = transporteFalso(() => ({ encabezados: { "content-type": "application/pdf" }, cuerpo: "%PDF" }));
    expect(await leerLink("https://example.com/a.pdf", { resolver: dns, transporte: pdf.transporte })).toMatchObject({
      motivo: MENSAJES.no_html,
    });
    const caido = transporteFalso(() => ({ estado: 503, cuerpo: "<title>Error</title>" }));
    expect(await leerLink("https://example.com/", { resolver: dns, transporte: caido.transporte })).toMatchObject({
      motivo: MENSAJES.estado,
    });
  });
});
