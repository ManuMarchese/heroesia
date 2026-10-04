import { describe, expect, it, vi } from "vitest";
import { crearRepositorioDemo } from "@/data/demo";
import { USUARIO_DEMO, crearEstadoDemo } from "@/data/demo-datos";
import { ErrorDatos } from "@/data/errores";
import { guardarNombre } from "./perfil";
import { MENSAJE_FALLA } from "./resultado";

const AHORA = new Date("2026-10-07T15:00:00Z");

describe("cambiar el nombre que ve el grupo", () => {
  it("guarda el nombre limpio y lo confirma", async () => {
    const estado = crearEstadoDemo(AHORA);
    const repo = crearRepositorioDemo(estado, USUARIO_DEMO.id, () => AHORA);
    expect(await guardarNombre(repo, "  Manu  ")).toEqual({ ok: true, mensaje: "Listo: el grupo te ve como Manu." });
    expect(estado.miembros.find((m) => m.id === USUARIO_DEMO.id)?.nombre).toBe("Manu");
  });

  it("explica el error sin tocar la base", async () => {
    const repo = crearRepositorioDemo(crearEstadoDemo(AHORA), USUARIO_DEMO.id, () => AHORA);
    const cambiar = vi.spyOn(repo, "cambiarNombre");
    expect(await guardarNombre(repo, " ")).toEqual({ ok: false, error: "Escribí tu nombre." });
    expect(await guardarNombre(repo, "x".repeat(41))).toMatchObject({ ok: false });
    expect(cambiar).not.toHaveBeenCalled();
  });

  it("traduce los errores de la base y resume los inesperados", async () => {
    const repo = crearRepositorioDemo(crearEstadoDemo(AHORA), USUARIO_DEMO.id, () => AHORA);
    vi.spyOn(repo, "cambiarNombre").mockRejectedValueOnce(new ErrorDatos("no_permitido"));
    expect(await guardarNombre(repo, "Ana")).toEqual({ ok: false, error: "No tenés permiso para hacer eso." });
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    vi.spyOn(repo, "cambiarNombre").mockRejectedValueOnce(new Error("se cortó la red"));
    expect(await guardarNombre(repo, "Ana")).toEqual({ ok: false, error: MENSAJE_FALLA });
  });
});
