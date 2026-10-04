import { describe, expect, it } from "vitest";
import { decodificar, decodificarEntidades, extraerMeta, limpiar, recortar } from "./html";

describe("título, imagen y sitio de una página", () => {
  it("prefiere Open Graph, en cualquier orden de atributos y con comillas simples o sin comillas", () => {
    const html = `<!doctype html><html><head>
      <title>Título de la pestaña</title>
      <meta content="Revisar PRs con agentes" property="og:title">
      <META PROPERTY='OG:IMAGE' CONTENT='https://cdn.example.com/a.png'>
      <meta property=og:site_name content=Ejemplo>
    </head><body><meta property="og:title" content="No: está en el cuerpo"></body></html>`;
    expect(extraerMeta(html)).toEqual({ titulo: "Revisar PRs con agentes", imagen: "https://cdn.example.com/a.png", sitio: "Ejemplo" });
  });

  it("si no hay Open Graph usa Twitter y después <title>", () => {
    expect(extraerMeta('<meta name="twitter:title" content="De Twitter"><meta name="twitter:image" content="/t.png">')).toEqual({
      titulo: "De Twitter",
      imagen: "/t.png",
      sitio: null,
    });
    expect(extraerMeta("<head><title>\n  Solo   el título \n</title></head>").titulo).toBe("Solo el título");
    expect(extraerMeta("<p>sin nada</p>")).toEqual({ titulo: null, imagen: null, sitio: null });
  });

  it("decodifica entidades con nombre y numéricas, sin inventar caracteres", () => {
    expect(decodificarEntidades("Caf&eacute; &amp; t&#233; &#x27;ya&#39; &iquest;s&iacute;? &copy;")).toBe("Café & té 'ya' ¿sí? ©");
    expect(decodificarEntidades("&#0; &#xD800; &noexiste;")).toBe("&#0; &#xD800; &noexiste;");
  });

  it("limpia espacios y caracteres de control, y recorta sin partir emojis", () => {
    expect(limpiar("  a\u0000b \n\t c​ ")).toBe("a b c");
    expect(limpiar("   ")).toBeNull();
    expect(recortar("corto", 140)).toBe("corto");
    const largo = recortar("a".repeat(200), 140);
    expect(largo).toHaveLength(140);
    expect(largo.endsWith("…")).toBe(true);
    expect(recortar(`${"a".repeat(8)}\u{1F600}\u{1F600}`, 10)).toBe(`${"a".repeat(8)}…`);
  });

  it("una etiqueta armada para trabar el lector se procesa rápido", () => {
    const trampa = `<head><meta ${"a".repeat(200_000)}><meta ${"x=".repeat(1000)}><title>Ok</title></head>`;
    const inicio = performance.now();
    expect(extraerMeta(trampa).titulo).toBe("Ok");
    expect(performance.now() - inicio).toBeLessThan(500);
  });
});

describe("charset", () => {
  const latin1 = Buffer.from("<title>Canción</title>", "latin1");

  it("usa el charset del encabezado", () => {
    expect(extraerMeta(decodificar(latin1, "text/html; charset=ISO-8859-1")).titulo).toBe("Canción");
  });

  it("si el encabezado no lo dice, usa el <meta charset>; si no hay, UTF-8", () => {
    const conMeta = Buffer.concat([Buffer.from('<meta charset="windows-1252">'), latin1]);
    expect(extraerMeta(decodificar(conMeta, "text/html")).titulo).toBe("Canción");
    expect(decodificar(Buffer.from("<title>Canción</title>"), undefined)).toBe("<title>Canción</title>");
    expect(decodificar(Buffer.from("hola"), "text/html; charset=no-existe")).toBe("hola");
  });
});
