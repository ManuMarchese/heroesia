import { describe, expect, it } from "vitest";
import { MENSAJES_UNION, normalizarClave, unirseAlGrupo, type ClienteRpc } from "./union";

const cliente = (respuesta: { data: boolean | null; error: { message?: string } | null }) => {
  const llamadas: unknown[] = [];
  const rpc: ClienteRpc = {
    async rpc(nombre, argumentos) {
      llamadas.push([nombre, argumentos]);
      return respuesta;
    },
  };
  return { rpc, llamadas };
};

describe("unirse al grupo con la clave del link", () => {
  it("clave correcta: ok, y manda la clave recortada", async () => {
    const { rpc, llamadas } = cliente({ data: true, error: null });
    expect(await unirseAlGrupo(rpc, "  abc123 ")).toEqual({ ok: true });
    expect(llamadas).toEqual([["unirme", { p_clave: "abc123" }]]);
  });

  it("clave vacía no llama a la base", async () => {
    const { rpc, llamadas } = cliente({ data: true, error: null });
    expect(await unirseAlGrupo(rpc, "  ")).toEqual({ ok: false, error: MENSAJES_UNION.claveVacia });
    expect(await unirseAlGrupo(rpc, null)).toEqual({ ok: false, error: MENSAJES_UNION.claveVacia });
    expect(llamadas).toEqual([]);
  });

  it("clave incorrecta, bloqueo por intentos y otros fallos tienen su mensaje", async () => {
    expect(await unirseAlGrupo(cliente({ data: false, error: null }).rpc, "x")).toEqual({
      ok: false,
      error: MENSAJES_UNION.claveIncorrecta,
    });
    expect(await unirseAlGrupo(cliente({ data: null, error: { message: "demasiados_intentos" } }).rpc, "x")).toEqual({
      ok: false,
      error: MENSAJES_UNION.demasiados,
    });
    expect(await unirseAlGrupo(cliente({ data: null, error: { message: "boom" } }).rpc, "x")).toEqual({
      ok: false,
      error: MENSAJES_UNION.fallo,
    });
  });

  it("normaliza y corta claves larguísimas", () => {
    expect(normalizarClave(3)).toBe("");
    expect(normalizarClave("a".repeat(500))).toHaveLength(200);
  });
});
