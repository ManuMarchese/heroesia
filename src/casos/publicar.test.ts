import { describe, expect, it } from "vitest";
import { crearRepositorioDemo } from "@/data/demo";
import { USUARIO_DEMO, crearEstadoDemo } from "@/data/demo-datos";
import { borradorDesde, publicarAporte } from "./publicar";

const AHORA = new Date("2026-10-07T15:00:00Z");
const nuevoRepo = () => {
  const estado = crearEstadoDemo(AHORA);
  return { estado, repo: crearRepositorioDemo(estado, USUARIO_DEMO.id, () => AHORA) };
};
const base = { link: "https://example.com/nota", titulo: "Un título", porQueSirve: "Porque sí" };

describe("publicar un aporte", () => {
  it("guarda el aporte con su plantilla y suma el XP de publicar", async () => {
    const { estado, repo } = nuevoRepo();
    const r = await publicarAporte(repo, { ...base, tipo: "noticia", fuente: "" }, AHORA);
    if (!r.ok) throw new Error(JSON.stringify(r.errores));
    expect(estado.aportes.find((a) => a.id === r.aporteId)).toMatchObject({ tipo: "noticia", fuente: "example.com", autorId: USUARIO_DEMO.id });
    expect(estado.eventos.at(-1)).toMatchObject({ motivo: "publicar", aporteId: r.aporteId });
  });

  it("devuelve los errores de cada campo sin guardar nada", async () => {
    const { estado, repo } = nuevoRepo();
    const antes = estado.aportes.length;
    expect(await publicarAporte(repo, { ...base, tipo: "oportunidad", fechaLimite: "2026-10-01" }, AHORA)).toEqual({
      ok: false,
      errores: { fechaLimite: "La fecha límite ya pasó." },
    });
    expect(await publicarAporte(repo, { tipo: "proyecto", link: "javascript:alert(1)", titulo: "", porQueSirve: "" }, AHORA)).toMatchObject({
      ok: false,
      errores: { link: expect.any(String), titulo: expect.any(String), porQueSirve: expect.any(String), queMirar: expect.any(String) },
    });
    expect(estado.aportes).toHaveLength(antes);
  });

  it("de lo que manda el navegador solo toma los campos conocidos y como texto", () => {
    expect(borradorDesde({ tipo: "skill", link: 42, titulo: ["x"], autorId: "otro", creadoEn: "2020-01-01", imagenUrl: "" })).toEqual({
      tipo: "skill",
      link: "",
      titulo: "",
      porQueSirve: "",
      imagenUrl: null,
      comoSeUsa: null,
      fuente: null,
      fechaLimite: null,
      queMirar: null,
    });
    expect(borradorDesde(null)).toMatchObject({ tipo: "", link: "" });
  });
});
