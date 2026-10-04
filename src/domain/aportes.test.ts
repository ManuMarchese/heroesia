import { describe, expect, it } from "vitest";
import {
  ACCION_DEL_TIPO,
  ETIQUETA_TIPO,
  diasParaVencer,
  estaVencida,
  pruebaSocial,
  validarAccion,
  validarAporte,
  validarMarcaUtil,
  type AporteNuevo,
} from "./aportes";

const AHORA = new Date("2026-10-04T15:00:00Z"); // domingo 12:00 en Buenos Aires
const base: AporteNuevo = {
  tipo: "skill",
  link: "https://example.com/skill",
  titulo: "Revisar un PR con Claude Code",
  porQueSirve: "Te ahorra media hora por PR",
};

describe("plantillas de aporte", () => {
  it("acepta una Skill con 'cómo se usa' opcional y normaliza a una línea", () => {
    const r = validarAporte({ ...base, porQueSirve: "  Te ahorra\n media hora  ", comoSeUsa: " Paso 1 \n Paso 2 " }, AHORA);
    expect(r).toEqual({
      ok: true,
      valor: {
        tipo: "skill",
        link: "https://example.com/skill",
        titulo: "Revisar un PR con Claude Code",
        imagenUrl: null,
        porQueSirve: "Te ahorra media hora",
        comoSeUsa: "Paso 1 \n Paso 2",
        fuente: null,
        fechaLimite: null,
        queMirar: null,
      },
    });
  });

  it("ignora los campos que no son del tipo", () => {
    const r = validarAporte({ ...base, tipo: "repo", comoSeUsa: "x", fechaLimite: "2026-10-10", queMirar: "y" }, AHORA);
    expect(r.ok && [r.valor.comoSeUsa, r.valor.fechaLimite, r.valor.queMirar]).toEqual([null, null, null]);
  });

  it("Noticia: la fuente sale del link si no se escribe", () => {
    const r = validarAporte({ ...base, tipo: "noticia", link: "https://www.lanacion.com.ar/nota" }, AHORA);
    expect(r.ok && r.valor.fuente).toBe("lanacion.com.ar");
    const propia = validarAporte({ ...base, tipo: "noticia", fuente: "Blog de Ana" }, AHORA);
    expect(propia.ok && propia.valor.fuente).toBe("Blog de Ana");
  });

  it("Oportunidad: la fecha límite es obligatoria, real y no vencida", () => {
    const op = { ...base, tipo: "oportunidad" };
    expect(validarAporte(op, AHORA)).toMatchObject({ ok: false, errores: { fechaLimite: "Poné la fecha límite." } });
    expect(validarAporte({ ...op, fechaLimite: "2026-02-30" }, AHORA)).toMatchObject({ ok: false });
    expect(validarAporte({ ...op, fechaLimite: "2026-10-03" }, AHORA)).toMatchObject({
      ok: false,
      errores: { fechaLimite: "La fecha límite ya pasó." },
    });
    expect(validarAporte({ ...op, fechaLimite: "2026-10-04" }, AHORA)).toMatchObject({ ok: true });
  });

  it("Proyecto: 'qué querés que miren' es obligatorio", () => {
    const pr = { ...base, tipo: "proyecto" };
    expect(validarAporte(pr, AHORA)).toMatchObject({ ok: false, errores: { queMirar: "Contá qué querés que miren." } });
    expect(validarAporte({ ...pr, queMirar: "El onboarding" }, AHORA)).toMatchObject({ ok: true });
  });

  it("exige tipo, link web, título y por qué sirve", () => {
    const r = validarAporte({ tipo: "meme", link: "javascript:alert(1)", titulo: " ", porQueSirve: "" }, AHORA);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(["link", "porQueSirve", "tipo", "titulo"]);
    expect(validarAporte({ ...base, link: "" }, AHORA)).toMatchObject({ errores: { link: "Pegá el link." } });
    expect(validarAporte({ ...base, link: "ftp://x.com/a" }, AHORA)).toMatchObject({ ok: false });
  });

  it("controla los largos y la imagen", () => {
    expect(validarAporte({ ...base, titulo: "a".repeat(141) }, AHORA)).toMatchObject({ ok: false });
    expect(validarAporte({ ...base, titulo: "a".repeat(140) }, AHORA)).toMatchObject({ ok: true });
    expect(validarAporte({ ...base, imagenUrl: "data:image/png;base64,AAAA" }, AHORA)).toMatchObject({ ok: false });
    expect(validarAporte({ ...base, imagenUrl: "https://example.com/a.png" }, AHORA)).toMatchObject({ ok: true });
  });
});

describe("vencimiento de oportunidades (hora de Buenos Aires)", () => {
  it("vence al terminar el día de la fecha límite", () => {
    expect(estaVencida("2026-10-04", new Date("2026-10-05T02:59:00Z"))).toBe(false);
    expect(estaVencida("2026-10-04", new Date("2026-10-05T03:00:00Z"))).toBe(true);
    expect(diasParaVencer("2026-10-07", AHORA)).toBe(3);
    expect(diasParaVencer("2026-10-04", AHORA)).toBe(0);
  });
});

describe("acciones", () => {
  const skillDeAna = { tipo: "skill" as const, autorId: "ana" };

  it("cada tipo tiene su acción", () => {
    expect(ACCION_DEL_TIPO).toEqual({
      skill: "probar",
      repo: "probar",
      noticia: "leer",
      oportunidad: "interes",
      proyecto: "feedback",
      tecnologia: "probar",
    });
  });

  it("'Lo probé' exige una línea con el resultado", () => {
    expect(validarAccion({ tipo: "probar" }, skillDeAna, "beto")).toMatchObject({ ok: false });
    expect(validarAccion({ tipo: "probar", resultado: "ok" }, skillDeAna, "beto")).toMatchObject({ ok: false });
    expect(validarAccion({ tipo: "probar", resultado: " Me\nsirvió " }, skillDeAna, "beto")).toEqual({
      ok: true,
      valor: { tipo: "probar", resultado: "Me sirvió", texto: null },
    });
  });

  it("rechaza la acción de otro tipo y reaccionar a lo propio", () => {
    expect(validarAccion({ tipo: "leer" }, skillDeAna, "beto")).toMatchObject({ ok: false });
    expect(validarAccion({ tipo: "probar", resultado: "Anduvo" }, skillDeAna, "ana")).toMatchObject({
      ok: false,
      errores: { tipo: "No podés reaccionar a tu propio aporte." },
    });
  });

  it("'Dar feedback' pide texto; 'Lo leí' y 'Me interesa' no piden nada", () => {
    const proyecto = { tipo: "proyecto" as const, autorId: "ana" };
    expect(validarAccion({ tipo: "feedback", texto: "" }, proyecto, "beto")).toMatchObject({ ok: false });
    expect(validarAccion({ tipo: "feedback", texto: "Probá con un video corto" }, proyecto, "beto")).toMatchObject({ ok: true });
    expect(validarAccion({ tipo: "leer", resultado: "x" }, { tipo: "noticia", autorId: "ana" }, "beto")).toEqual({
      ok: true,
      valor: { tipo: "leer", resultado: null, texto: null },
    });
    expect(validarAccion({ tipo: "interes" }, { tipo: "oportunidad", autorId: "ana" }, "beto")).toMatchObject({ ok: true });
  });

  it("solo el autor del proyecto marca un feedback como útil, una vez", () => {
    const proyecto = { tipo: "proyecto" as const, autorId: "ana" };
    const feedback = { tipo: "feedback" as const, util: false };
    expect(validarMarcaUtil(feedback, proyecto, "ana")).toEqual({ ok: true, valor: true });
    expect(validarMarcaUtil(feedback, proyecto, "beto")).toMatchObject({ ok: false });
    expect(validarMarcaUtil({ ...feedback, util: true }, proyecto, "ana")).toMatchObject({ ok: false });
    expect(validarMarcaUtil({ tipo: "leer", util: false }, proyecto, "ana")).toMatchObject({ ok: false });
  });

  it("arma la prueba social en singular y plural", () => {
    expect(pruebaSocial("probar", 3)).toBe("3 lo probaron");
    expect(pruebaSocial("probar", 1)).toBe("1 lo probó");
    expect(pruebaSocial("leer", 2)).toBe("2 lo leyeron");
    expect(pruebaSocial("interes", 1)).toBe("A 1 le interesa");
    expect(pruebaSocial("feedback", 4)).toBe("4 feedbacks");
  });
});

describe("tipo Tecnología (D44): funciona como Skill", () => {
  const base = { tipo: "tecnologia", link: "https://example.com/tech", titulo: "Una herramienta", porQueSirve: "Ahorra tiempo" };

  it("se publica con 'cómo se usa' opcional y sin campos de otros tipos", () => {
    expect(validarAporte({ ...base, comoSeUsa: " Instalar y correr ", fuente: "x", queMirar: "y" })).toEqual({
      ok: true,
      valor: {
        tipo: "tecnologia",
        link: "https://example.com/tech",
        titulo: "Una herramienta",
        imagenUrl: null,
        porQueSirve: "Ahorra tiempo",
        comoSeUsa: "Instalar y correr",
        fuente: null,
        fechaLimite: null,
        queMirar: null,
      },
    });
  });

  it("se muestra como Tecnología y su acción es 'Lo probé'", () => {
    expect(ETIQUETA_TIPO.tecnologia).toBe("Tecnología");
    expect(ACCION_DEL_TIPO.tecnologia).toBe("probar");
  });
});

