import { beforeEach, describe, expect, it } from "vitest";
import { crearRepositorioDemo } from "@/data/demo";
import { USUARIO_DEMO, crearEstadoDemo, type EstadoDemo } from "@/data/demo-datos";
import {
  borrarMiCarpeta,
  crearCarpetaNueva,
  guardarEnCarpeta,
  guardarEnCarpetaNueva,
  quitarDeFavoritos,
  renombrarMiCarpeta,
} from "./favoritos";
import { borrarMiAporte, editarMiAporte } from "./mis-aportes";
import { publicarAporte } from "./publicar";

const AHORA = new Date("2026-10-07T15:00:00Z");
const VOS = USUARIO_DEMO.id;
let estado: EstadoDemo;
const repo = (usuarioId: string = VOS) => crearRepositorioDemo(estado, usuarioId, () => AHORA);
const SKILL = { tipo: "skill", link: "https://example.com/s", titulo: "Mi skill", porQueSirve: "Sirve", comoSeUsa: "Así" };

beforeEach(() => {
  estado = crearEstadoDemo(AHORA);
});

async function publicarMio() {
  const r = await publicarAporte(repo(), SKILL, AHORA);
  if (!r.ok) throw new Error("no se publicó");
  return r.aporteId;
}

describe("editar y borrar mi aporte", () => {
  it("edita título y texto, valida con el tipo que ya tiene y no cambia el tipo", async () => {
    const id = await publicarMio();
    const r = await editarMiAporte(repo(), { ...SKILL, aporteId: id, titulo: "Título nuevo", tipo: "repo" }, AHORA);
    expect(r).toEqual({ ok: true, aporteId: id });
    expect(await repo().aporte(id)).toMatchObject({ titulo: "Título nuevo", tipo: "skill" });
  });

  it("devuelve los errores de validación sin guardar", async () => {
    const id = await publicarMio();
    const r = await editarMiAporte(repo(), { ...SKILL, aporteId: id, titulo: "", link: "nada" }, AHORA);
    expect(r).toMatchObject({ ok: false, errores: { titulo: expect.any(String), link: expect.any(String) } });
    expect(await repo().aporte(id)).toMatchObject({ titulo: "Mi skill" });
  });

  it("nadie edita ni borra lo de otro, y un id inexistente avisa", async () => {
    const id = await publicarMio();
    const edicion = await editarMiAporte(repo("demo-a"), { ...SKILL, aporteId: id, titulo: "Hack" }, AHORA);
    expect(edicion).toMatchObject({ ok: false, errores: { general: expect.stringContaining("Solo quien publicó") } });
    expect(await borrarMiAporte(repo("demo-a"), id)).toMatchObject({ ok: false });
    expect(await repo().aporte(id)).toMatchObject({ titulo: "Mi skill" });
    expect(await borrarMiAporte(repo(), "no-existe")).toMatchObject({ ok: false });
    expect(await borrarMiAporte(repo(), 3)).toMatchObject({ ok: false });
  });

  it("borra lo propio", async () => {
    const id = await publicarMio();
    expect(await borrarMiAporte(repo(), id)).toEqual({ ok: true, mensaje: "Aporte borrado." });
    expect(await repo().aporte(id)).toBeNull();
  });
});

describe("favoritos y carpetas", () => {
  it("crear una carpeta nueva y guardar adentro en un paso; después mover a otra", async () => {
    const [aporte] = await repo().aportes({ limite: 1 });
    expect(await guardarEnCarpetaNueva(repo(), { aporteId: aporte!.id, nombre: "Ideas" })).toMatchObject({ ok: true });
    const otra = await crearCarpetaNueva(repo(), "Para probar");
    expect(otra).toMatchObject({ ok: true });
    const carpetas = await repo().carpetas();
    const paraProbar = carpetas.find((c) => c.nombre === "Para probar")!;
    expect(await guardarEnCarpeta(repo(), { aporteId: aporte!.id, carpetaId: paraProbar.id })).toMatchObject({ ok: true });
    expect(await repo().favoritos()).toEqual([{ aporteId: aporte!.id, carpetaId: paraProbar.id }]);
    expect(await quitarDeFavoritos(repo(), aporte!.id)).toMatchObject({ ok: true });
    expect(await repo().favoritos()).toEqual([]);
  });

  it("muestra el error de un nombre repetido o vacío", async () => {
    await crearCarpetaNueva(repo(), "Ideas");
    expect(await crearCarpetaNueva(repo(), "ideas")).toEqual({ ok: false, error: "Ya tenés una carpeta con ese nombre." });
    expect(await crearCarpetaNueva(repo(), " ")).toMatchObject({ ok: false });
    expect(await guardarEnCarpeta(repo(), { aporteId: "x" })).toEqual({ ok: false, error: "Elegí una carpeta." });
  });

  it("renombrar y borrar una carpeta; las ajenas no se tocan", async () => {
    await crearCarpetaNueva(repo(), "Ideas");
    const [c] = await repo().carpetas();
    expect(await renombrarMiCarpeta(repo(), { carpetaId: c!.id, nombre: "Ideas 2" })).toMatchObject({ ok: true });
    expect(await renombrarMiCarpeta(repo("demo-a"), { carpetaId: c!.id, nombre: "Robada" })).toMatchObject({ ok: false });
    expect(await borrarMiCarpeta(repo("demo-a"), c!.id)).toMatchObject({ ok: false });
    expect(await borrarMiCarpeta(repo(), c!.id)).toMatchObject({ ok: true });
    expect(await repo().carpetas()).toEqual([]);
  });
});
