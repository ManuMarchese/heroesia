import { describe, expect, it } from "vitest";
import { mensajeConocido } from "./mensajes";
import { MENSAJES_UNION } from "./union";
import { MENSAJES_USUARIO } from "./usuario";

describe("mensajes que viajan por la URL", () => {
  it("muestra los conocidos y descarta cualquier otro texto", () => {
    expect(mensajeConocido(MENSAJES_USUARIO.existe)).toBe(MENSAJES_USUARIO.existe);
    expect(mensajeConocido(MENSAJES_UNION.demasiados)).toBe(MENSAJES_UNION.demasiados);
    expect(mensajeConocido("Hacé clic en evil.com")).toBeNull();
    expect(mensajeConocido(null)).toBeNull();
  });
});
