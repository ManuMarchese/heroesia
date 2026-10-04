import { beforeEach, describe, expect, it } from "vitest";
import { crearRepositorioDemo } from "@/data/demo";
import { USUARIO_DEMO, crearEstadoDemo, type EstadoDemo } from "@/data/demo-datos";
import { validarAporte } from "@/domain/aportes";
import { marcarFeedbackUtil, registrarAccion } from "./aportes";

const AHORA = new Date("2026-10-07T15:00:00Z");
const VOS = USUARIO_DEMO.id;
let estado: EstadoDemo;
const repo = (usuarioId: string = VOS) => crearRepositorioDemo(estado, usuarioId, () => AHORA);

beforeEach(() => {
  estado = crearEstadoDemo(AHORA);
});

describe("Lo probé, Lo leí, Me interesa y Dar feedback", () => {
  it("'Lo probé' pide el resultado y avisa el XP ganado", async () => {
    expect(await registrarAccion(repo(), { aporteId: "demo-a1", tipo: "probar", resultado: " " })).toEqual({
      ok: false,
      error: "Contá en una línea qué resultado te dio.",
    });
    expect(await registrarAccion(repo(), { aporteId: "demo-a1", tipo: "probar", resultado: "Me encontró un bug" })).toEqual({
      ok: true,
      mensaje: "¡Listo! Sumaste 30 XP.",
    });
    expect(estado.acciones.at(-1)).toMatchObject({ aporteId: "demo-a1", perfilId: VOS, resultado: "Me encontró un bug" });
    expect(await registrarAccion(repo(), { aporteId: "demo-a1", tipo: "probar", resultado: "Otra vez" })).toEqual({
      ok: false,
      error: "Eso ya está registrado.",
    });
  });

  it("'Lo leí' suma poco, 'Me interesa' no da XP y el feedback suma cuando lo marcan útil", async () => {
    estado.acciones = estado.acciones.filter((c) => c.aporteId !== "demo-a4");
    expect(await registrarAccion(repo(), { aporteId: "demo-a4", tipo: "leer" })).toEqual({ ok: true, mensaje: "¡Listo! Sumaste 2 XP." });
    expect(await registrarAccion(repo(), { aporteId: "demo-a3", tipo: "interes" })).toEqual({
      ok: true,
      mensaje: "Anotado: te interesa. Me interesa no da XP.",
    });
    expect(await registrarAccion(repo(), { aporteId: "demo-a9", tipo: "feedback", texto: "" })).toMatchObject({ ok: false });
    expect(await registrarAccion(repo("demo-leo"), { aporteId: "demo-a9", tipo: "feedback", texto: "Sumale ejemplos" })).toEqual({
      ok: true,
      mensaje: "Enviado. Si el autor lo marca útil, sumás 25 XP.",
    });
  });

  it("nadie reacciona a lo propio ni con la acción de otro tipo", async () => {
    expect(await registrarAccion(repo(), { aporteId: "demo-a5", tipo: "feedback", texto: "Me gusta" })).toEqual({
      ok: false,
      error: "No podés reaccionar a tu propio aporte.",
    });
    expect(await registrarAccion(repo(), { aporteId: "demo-a4", tipo: "probar", resultado: "Bien" })).toEqual({
      ok: false,
      error: "Esta acción no corresponde a este aporte.",
    });
  });

  it("con el tope diario cumplido la acción queda anotada sin XP", async () => {
    const ana = repo("demo-ana");
    for (let i = 0; i < 6; i++) {
      const valido = validarAporte({ tipo: "skill", link: `https://example.com/s${i}`, titulo: `Skill ${i}`, porQueSirve: "Sirve" }, AHORA);
      if (!valido.ok) throw new Error("aporte inválido");
      await ana.publicar(valido.valor);
    }
    const nuevas = estado.aportes.slice(-6);
    const mensajes = [];
    for (const aporte of nuevas) {
      mensajes.push(await registrarAccion(repo(), { aporteId: aporte.id, tipo: "probar", resultado: "Anduvo" }));
    }
    expect(mensajes.slice(0, 5).every((m) => m.ok && m.mensaje === "¡Listo! Sumaste 30 XP.")).toBe(true);
    expect(mensajes[5]).toEqual({ ok: true, mensaje: 'Listo. Hoy ya llegaste al tope de XP por "Lo probé": esta queda anotada, sin XP.' });
  });

  it("si el aporte no existe o llega cualquier cosa, no se rompe", async () => {
    for (const entrada of [{ aporteId: "no-existe", tipo: "leer" }, null, "hola", { aporteId: 7 }]) {
      expect(await registrarAccion(repo(), entrada)).toMatchObject({ ok: false, error: expect.stringContaining("No encontramos") });
    }
  });
});

describe("feedback útil", () => {
  it("solo el autor del proyecto lo marca, una vez", async () => {
    expect(await marcarFeedbackUtil(repo("demo-ana"), "demo-c5")).toEqual({
      ok: false,
      error: "Solo el autor del proyecto marca un feedback como útil.",
    });
    expect(await marcarFeedbackUtil(repo(), "demo-c5")).toEqual({ ok: true, mensaje: "Marcado como útil: le suma XP a quien te lo dio." });
    expect(estado.eventos.at(-1)).toMatchObject({ perfilId: "demo-leo", motivo: "feedback_util" });
    expect(await marcarFeedbackUtil(repo(), "demo-c5")).toEqual({ ok: false, error: "Ese feedback ya está marcado como útil." });
    expect(await marcarFeedbackUtil(repo(), 42)).toEqual({ ok: false, error: "No encontramos ese feedback." });
  });
});
