import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { ErrorDatos, traducirErrorPostgres } from "./errores";
import { crearRepositorioSupabase } from "./supabase";
import type { FilaAccion, FilaAporte } from "./supabase-filas";

type Respuesta = { data: unknown; error: { code?: string; message?: string } | null; count?: number | null };

/** Cliente falso: anota cada cadena de llamadas y responde, por tabla, en orden. Sin red. */
function clienteFalso(respuestas: Record<string, Respuesta[]>) {
  const cadenas: string[] = [];
  const from = (tabla: string) => {
    const pasos = [tabla];
    const constructor: object = new Proxy(
      {},
      {
        get(_objetivo, propiedad) {
          if (propiedad === "then") {
            cadenas.push(pasos.join("."));
            const respuesta = respuestas[tabla]?.shift() ?? { data: null, error: { message: "sin respuesta" } };
            return (resolver: (r: Respuesta) => unknown) => resolver(respuesta);
          }
          return (...argumentos: unknown[]) => {
            pasos.push(`${String(propiedad)}(${JSON.stringify(argumentos)})`);
            return constructor;
          };
        },
      },
    );
    return constructor;
  };
  return { cliente: { from } as unknown as SupabaseClient, cadenas };
}

const filaAporte: FilaAporte = {
  id: "a1",
  autor_id: "ana",
  tipo: "oportunidad",
  link: "https://example.com",
  titulo: "Hackathon",
  imagen_url: null,
  por_que_sirve: "Premios",
  como_se_usa: null,
  fuente: null,
  fecha_limite: "2026-10-20",
  que_mirar: null,
  created_at: "2026-10-04T12:00:00.123456+00:00",
};
const filaAccion = (id: string): FilaAccion => ({
  id,
  aporte_id: "p1",
  perfil_id: "beto",
  tipo: "feedback",
  resultado: null,
  texto: "Bien",
  created_at: "2026-10-04T13:00:00+00:00",
});

describe("repositorio de Supabase (con cliente falso)", () => {
  it("lee aportes con filtros y pasa las filas al formato del dominio", async () => {
    const { cliente, cadenas } = clienteFalso({ aportes: [{ data: [filaAporte], error: null }] });
    const aportes = await crearRepositorioSupabase(cliente, "ana").aportes({ tipo: "oportunidad", limite: 5 });
    expect(aportes).toEqual([
      expect.objectContaining({ id: "a1", autorId: "ana", fechaLimite: "2026-10-20", porQueSirve: "Premios" }),
    ]);
    expect(cadenas[0]).toContain('eq(["tipo","oportunidad"])');
    expect(cadenas[0]).toContain('order(["created_at",{"ascending":false}])');
    expect(cadenas[0]).toContain("limit([5])");
  });

  it("marca como útiles las acciones que están en feedback_util", async () => {
    const { cliente } = clienteFalso({
      acciones: [{ data: [filaAccion("c1"), filaAccion("c2")], error: null }],
      feedback_util: [{ data: [{ accion_id: "c2" }], error: null }],
    });
    const acciones = await crearRepositorioSupabase(cliente, "ana").acciones({ aporteIds: ["p1"] });
    expect(acciones.map((a) => [a.id, a.util])).toEqual([
      ["c1", false],
      ["c2", true],
    ]);
  });

  it("no consulta si se piden acciones de una lista vacía de aportes", async () => {
    const { cliente, cadenas } = clienteFalso({});
    expect(await crearRepositorioSupabase(cliente, "ana").acciones({ aporteIds: [] })).toEqual([]);
    expect(cadenas).toEqual([]);
  });

  it("traduce los errores de la base a mensajes claros", async () => {
    const { cliente } = clienteFalso({
      acciones: [{ data: null, error: { code: "42501", message: "new row violates row-level security policy" } }],
      feedback_util: [{ data: null, error: { code: "23505", message: "duplicate key" } }],
    });
    const repo = crearRepositorioSupabase(cliente, "ana");
    await expect(repo.accionar("a1", { tipo: "probar", resultado: "Bien", texto: null })).rejects.toMatchObject({
      codigo: "no_permitido",
      message: "No tenés permiso para hacer eso.",
    });
    await expect(repo.marcarUtil("c1")).rejects.toMatchObject({ codigo: "duplicado" });
  });

  it("lee lanzamiento_en de la configuración (o null si Manu no lo fijó)", async () => {
    const { cliente, cadenas } = clienteFalso({
      configuracion: [
        { data: { lanzamiento_en: "2026-10-05" }, error: null },
        { data: { lanzamiento_en: null }, error: null },
      ],
    });
    const repo = crearRepositorioSupabase(cliente, "ana");
    expect(await repo.lanzamientoEn()).toBe("2026-10-05");
    expect(await repo.lanzamientoEn()).toBeNull();
    expect(cadenas[0]).toBe('configuracion.select(["lanzamiento_en"]).maybeSingle([])');
  });

  it("lee todos los eventos de XP de a páginas, con el aporte de cada uno", async () => {
    const evento = (i: number) => ({
      id: `e${i}`,
      perfil_id: "ana",
      motivo: "publicar",
      tipo_aporte: "skill",
      aporte_id: `a${i}`,
      created_at: "2026-10-04T12:00:00+00:00",
    });
    const { cliente, cadenas } = clienteFalso({
      eventos_xp: [
        { data: Array.from({ length: 1000 }, (_, i) => evento(i)), error: null, count: 1002 },
        { data: [evento(1000), evento(1001)], error: null, count: 1002 },
      ],
    });
    const eventos = await crearRepositorioSupabase(cliente, "ana").eventosXp();
    expect(eventos).toHaveLength(1002);
    expect(eventos[1001]).toEqual({
      id: "e1001",
      perfilId: "ana",
      motivo: "publicar",
      tipoAporte: "skill",
      aporteId: "a1001",
      creadoEn: "2026-10-04T12:00:00+00:00",
    });
    expect(cadenas[0]).toContain('select(["id, perfil_id, motivo, tipo_aporte, aporte_id, created_at",{"count":"exact"}])');
    expect(cadenas[0]).toContain("range([0,999])");
    expect(cadenas[1]).toContain("range([1000,1999])");
  });

  it("cambia solo el nombre propio; si la base no actualiza ninguna fila, no tiene permiso", async () => {
    const { cliente, cadenas } = clienteFalso({
      perfiles: [
        { data: [{ id: "ana" }], error: null },
        { data: [], error: null },
      ],
    });
    const repo = crearRepositorioSupabase(cliente, "ana");
    await repo.cambiarNombre("Anita");
    expect(cadenas[0]).toBe('perfiles.update([{"nombre":"Anita"}]).eq(["id","ana"]).select(["id"]).overrideTypes([])');
    await expect(repo.cambiarNombre("Anita")).rejects.toMatchObject({ codigo: "no_permitido" });
  });

  it("aporte inexistente devuelve null", async () => {
    const { cliente } = clienteFalso({ aportes: [{ data: null, error: null }] });
    expect(await crearRepositorioSupabase(cliente, "ana").aporte("x")).toBeNull();
  });

  it("registra la entrada solo si todavía no entró hoy (hora de Buenos Aires)", async () => {
    const ahora = () => new Date("2026-10-05T02:00:00Z"); // domingo 23:00 en Buenos Aires
    const yaEntro = clienteFalso({ eventos_xp: [{ data: [{ created_at: "2026-10-04T12:00:00+00:00" }], error: null }] });
    await crearRepositorioSupabase(yaEntro.cliente, "ana", ahora).registrarEntrada();
    expect(yaEntro.cadenas).toHaveLength(1);

    const ayer = clienteFalso({
      eventos_xp: [
        { data: [{ created_at: "2026-10-03T12:00:00+00:00" }], error: null },
        { data: null, error: null },
      ],
    });
    await crearRepositorioSupabase(ayer.cliente, "ana", ahora).registrarEntrada();
    expect(ayer.cadenas[1]).toBe('eventos_xp.insert([{"motivo":"entrar"}])');
  });
});

describe("traducción de errores de Postgres", () => {
  it.each([
    ["42501", "no_permitido"],
    ["23505", "duplicado"],
    ["23514", "invalido"],
    ["22P02", "invalido"],
    ["PGRST000", "desconocido"],
    [undefined, "desconocido"],
  ])("SQLSTATE %s → %s", (code, esperado) => {
    const error = traducirErrorPostgres({ code });
    expect(error).toBeInstanceOf(ErrorDatos);
    expect(error.codigo).toBe(esperado);
  });
});
