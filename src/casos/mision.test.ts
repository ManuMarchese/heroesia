import { beforeEach, describe, expect, it } from "vitest";
import { crearRepositorioDemo } from "@/data/demo";
import { USUARIO_DEMO, crearEstadoDemo, type EstadoDemo } from "@/data/demo-datos";
import { capitanDeSemana } from "@/domain/mision";
import { semanaDe } from "@/domain/tiempo";
import { definirMisionSemanal } from "./mision";

const AHORA = new Date("2026-10-07T15:00:00Z");
let estado: EstadoDemo;
const repo = (usuarioId: string = USUARIO_DEMO.id) => crearRepositorioDemo(estado, usuarioId, () => AHORA);

beforeEach(() => {
  estado = crearEstadoDemo(AHORA);
});

describe("el capitán define la misión de su semana", () => {
  it("en la demostración, el usuario de ejemplo es el capitán de esta semana", () => {
    expect(capitanDeSemana(semanaDe(AHORA), { miembros: estado.miembros, lanzamientoEn: estado.lanzamientoEn })).toBe(USUARIO_DEMO.id);
  });

  it("la define una sola vez, con acción y meta válidas", async () => {
    expect(await definirMisionSemanal(repo(), { accion: "leer", meta: "0" }, AHORA)).toEqual({
      ok: false,
      error: "La meta tiene que ser un número entero entre 1 y 50.",
    });
    expect(await definirMisionSemanal(repo(), { accion: "leer", meta: "8" }, AHORA)).toEqual({
      ok: true,
      mensaje: 'Listo: la misión de esta semana es "Leer 8 noticias".',
    });
    expect(estado.misiones).toEqual([expect.objectContaining({ semana: semanaDe(AHORA), accion: "leer", meta: 8 })]);
    expect(await definirMisionSemanal(repo(), { accion: "probar", meta: 3 }, AHORA)).toEqual({
      ok: false,
      error: "La misión de esta semana ya está definida.",
    });
  });

  it("nadie más la define, y hasta la semana de lanzamiento rige la inicial", async () => {
    expect(await definirMisionSemanal(repo("demo-ana"), { accion: "leer", meta: 3 }, AHORA)).toEqual({
      ok: false,
      error: "Solo el capitán de la semana define la misión.",
    });
    estado.lanzamientoEn = semanaDe(AHORA);
    expect(await definirMisionSemanal(repo(), { accion: "leer", meta: 3 }, AHORA)).toEqual({
      ok: false,
      error: "Hasta la semana de lanzamiento rige la misión inicial.",
    });
    expect(await definirMisionSemanal(repo(), null, AHORA)).toMatchObject({ ok: false });
  });
});
