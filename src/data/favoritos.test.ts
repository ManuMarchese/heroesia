import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it } from "vitest";
import { validarAporte } from "@/domain/aportes";
import { crearRepositorioDemo } from "./demo";
import { USUARIO_DEMO, crearEstadoDemo, type EstadoDemo } from "./demo-datos";
import { ErrorDatos } from "./errores";
import { crearRepositorioSupabase } from "./supabase";

const AHORA = new Date("2026-10-07T15:00:00Z");
const VOS = USUARIO_DEMO.id;
let estado: EstadoDemo;
const repo = (usuarioId: string = VOS) => crearRepositorioDemo(estado, usuarioId, () => AHORA);
const codigo = (promesa: Promise<unknown>) =>
  promesa.then(
    () => "ok",
    (e: unknown) => (e instanceof ErrorDatos ? e.codigo : "otro"),
  );
const valido = (titulo: string) => {
  const r = validarAporte({ tipo: "skill", link: "https://example.com/x", titulo, porQueSirve: "Sirve" }, AHORA);
  if (!r.ok) throw new Error("aporte de prueba inválido");
  return r.valor;
};

beforeEach(() => {
  estado = crearEstadoDemo(AHORA);
});

describe("demo: editar y borrar aportes", () => {
  it("el autor edita (menos el tipo) y otro no puede", async () => {
    const mio = await repo().publicar(valido("Original"));
    const editado = await repo().editarAporte(mio.id, { ...valido("Cambiado"), tipo: "repo" });
    expect(editado).toMatchObject({ titulo: "Cambiado", tipo: "skill", autorId: VOS, creadoEn: mio.creadoEn });
    expect(await codigo(repo("demo-a").editarAporte(mio.id, valido("Hackeado")))).toBe("no_permitido");
    expect(await codigo(repo().editarAporte("no-existe", valido("X")))).toBe("no_encontrado");
  });

  it("el autor borra; se van sus acciones y favoritos de todos, y el XP queda", async () => {
    const mio = await repo().publicar(valido("Para borrar"));
    const carpeta = await repo("demo-a").crearCarpeta("Ideas");
    await repo("demo-a").guardarFavorito(mio.id, carpeta.id);
    const xpAntes = estado.eventos.length;
    expect(await codigo(repo("demo-a").borrarAporte(mio.id))).toBe("no_permitido");
    await repo().borrarAporte(mio.id);
    expect(await repo().aporte(mio.id)).toBeNull();
    expect(await repo("demo-a").favoritos()).toEqual([]);
    expect(estado.eventos).toHaveLength(xpAntes);
    expect(await codigo(repo().borrarAporte(mio.id))).toBe("no_encontrado");
  });
});

describe("demo: carpetas y favoritos privados, una carpeta por aporte", () => {
  it("crea, renombra y valida nombres sin repetir", async () => {
    const c = await repo().crearCarpeta("  Para   probar ");
    expect(c.nombre).toBe("Para probar");
    expect(await codigo(repo().crearCarpeta("para PROBAR"))).toBe("invalido");
    expect(await codigo(repo().crearCarpeta(" "))).toBe("invalido");
    await repo().renombrarCarpeta(c.id, "Probar");
    expect((await repo().carpetas()).map((x) => x.nombre)).toEqual(["Probar"]);
    await repo("demo-a").crearCarpeta("Para probar"); // otra persona: puede
  });

  it("guarda, mueve (una sola carpeta) y quita", async () => {
    const [aporte] = await repo().aportes({ limite: 1 });
    const uno = await repo().crearCarpeta("Uno");
    const dos = await repo().crearCarpeta("Dos");
    await repo().guardarFavorito(aporte!.id, uno.id);
    await repo().guardarFavorito(aporte!.id, dos.id);
    expect(await repo().favoritos()).toEqual([{ aporteId: aporte!.id, carpetaId: dos.id }]);
    await repo().quitarFavorito(aporte!.id);
    expect(await repo().favoritos()).toEqual([]);
  });

  it("son privados: nadie guarda en carpetas ajenas ni ve las de otro", async () => {
    const [aporte] = await repo().aportes({ limite: 1 });
    const mia = await repo().crearCarpeta("Mía");
    expect(await repo("demo-a").carpetas()).toEqual([]);
    expect(await codigo(repo("demo-a").guardarFavorito(aporte!.id, mia.id))).toBe("no_permitido");
    expect(await codigo(repo("demo-a").renombrarCarpeta(mia.id, "Robada"))).toBe("no_permitido");
    expect(await codigo(repo("demo-a").borrarCarpeta(mia.id))).toBe("no_permitido");
  });

  it("borrar una carpeta saca lo guardado pero no borra el aporte", async () => {
    const [aporte] = await repo().aportes({ limite: 1 });
    const c = await repo().crearCarpeta("Temporal");
    await repo().guardarFavorito(aporte!.id, c.id);
    await repo().borrarCarpeta(c.id);
    expect(await repo().favoritos()).toEqual([]);
    expect(await repo().aporte(aporte!.id)).not.toBeNull();
  });
});

type Resp = { data: unknown; error: { code?: string } | null };
function clienteFalso(respuestas: Record<string, Resp[]>) {
  const cadenas: string[] = [];
  const from = (tabla: string) => {
    const pasos = [tabla];
    const c: object = new Proxy(
      {},
      {
        get(_o, p) {
          if (p === "then") {
            cadenas.push(pasos.join("."));
            const r = respuestas[tabla]?.shift() ?? { data: null, error: { code: "x" } };
            return (resolver: (r: Resp) => unknown) => resolver(r);
          }
          return (...a: unknown[]) => {
            pasos.push(`${String(p)}(${JSON.stringify(a)})`);
            return c;
          };
        },
      },
    );
    return c;
  };
  return { cliente: { from } as unknown as SupabaseClient, cadenas };
}

describe("Supabase: editar, borrar y favoritos", () => {
  it("editar y borrar: sin filas afectadas es no_permitido (la RLS filtró)", async () => {
    const { cliente } = clienteFalso({ aportes: [{ data: [], error: null }, { data: [], error: null }] });
    const r = crearRepositorioSupabase(cliente, "ana");
    expect(await codigo(r.editarAporte("a1", valido("X")))).toBe("no_permitido");
    expect(await codigo(r.borrarAporte("a1"))).toBe("no_permitido");
  });

  it("guardar mueve si ya estaba y agrega si no", async () => {
    const mueve = clienteFalso({ favoritos: [{ data: [{ aporte_id: "a1" }], error: null }] });
    await crearRepositorioSupabase(mueve.cliente, "ana").guardarFavorito("a1", "c2");
    expect(mueve.cadenas).toHaveLength(1);
    const agrega = clienteFalso({ favoritos: [{ data: [], error: null }, { data: null, error: null }] });
    await crearRepositorioSupabase(agrega.cliente, "ana").guardarFavorito("a1", "c2");
    expect(agrega.cadenas[1]).toBe('favoritos.insert([{"aporte_id":"a1","carpeta_id":"c2"}])');
  });

  it("lee carpetas y favoritos al formato del dominio", async () => {
    const { cliente } = clienteFalso({
      carpetas: [{ data: [{ id: "c1", nombre: "Ideas", created_at: "2026-10-04T12:00:00+00:00" }], error: null }],
      favoritos: [{ data: [{ aporte_id: "a1", carpeta_id: "c1" }], error: null }],
    });
    const r = crearRepositorioSupabase(cliente, "ana");
    expect(await r.carpetas()).toEqual([{ id: "c1", nombre: "Ideas", creadaEn: "2026-10-04T12:00:00+00:00" }]);
    expect(await r.favoritos()).toEqual([{ aporteId: "a1", carpetaId: "c1" }]);
  });
});
