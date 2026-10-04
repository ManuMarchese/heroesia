import { beforeEach, describe, expect, it } from "vitest";
import { crearRepositorioDemo } from "@/data/demo";
import { USUARIO_DEMO, crearEstadoDemo, type EstadoDemo } from "@/data/demo-datos";
import { APORTES_EN_INICIO, abrirInicio, cargarBase, cargarExplorar, cargarPerfil } from "./cargar";

const AHORA = new Date("2026-10-07T15:00:00Z"); // miércoles 12:00 en Buenos Aires
const VOS = USUARIO_DEMO.id;
let estado: EstadoDemo;
const repo = (usuarioId: string = VOS) => crearRepositorioDemo(estado, usuarioId, () => AHORA);

beforeEach(() => {
  estado = crearEstadoDemo(AHORA);
});

describe("Base del héroe", () => {
  it("abrir Inicio registra la entrada del día una sola vez", async () => {
    const entradasDeHoy = () => estado.eventos.filter((e) => e.perfilId === VOS && e.motivo === "entrar" && e.creadoEn === AHORA.toISOString());
    await abrirInicio(repo(), () => AHORA);
    await abrirInicio(repo(), () => AHORA);
    expect(entradasDeHoy()).toHaveLength(1);
  });

  it("el +5 de Entrar se ve en la primera apertura (el reloj se lee después de registrar) y no sube al recargar", async () => {
    let lecturas = 0;
    // La primera lectura es anterior al instante del evento; el repositorio guarda el evento en AHORA.
    const reloj = () => new Date(AHORA.getTime() - (lecturas++ === 0 ? 5_000 : 0));
    const sinEntrar = (await cargarBase(repo(), AHORA)).heroe.xpTotal;
    const primera = (await abrirInicio(repo(), reloj)).heroe.xpTotal;
    const segunda = (await abrirInicio(repo(), () => AHORA)).heroe.xpTotal;
    expect(primera).toBe(sinEntrar + 5);
    expect(segunda).toBe(primera);
  });

  it("si registrar la entrada falla, la pantalla igual carga", async () => {
    const roto = { ...repo(), registrarEntrada: async () => Promise.reject(new Error("sin red")) };
    await expect(abrirInicio(roto, () => AHORA)).resolves.toMatchObject({ heroe: { nombre: USUARIO_DEMO.nombre } });
  });

  it("muestra el héroe, la misión y lo nuevo, del más nuevo al más viejo", async () => {
    const base = await cargarBase(repo(), AHORA);
    expect(base.heroe.nivel).toBeGreaterThanOrEqual(2);
    expect(base.mision).toMatchObject({ origen: "reemplazo", faltan: "Faltan 5 días" });
    expect(base.loNuevo).toHaveLength(APORTES_EN_INICIO);
    expect(base.loNuevo[0]).toMatchObject({
      id: "demo-a1",
      etiquetaTipo: "Skill",
      autor: "Ana",
      hace: "hace 2 h",
      accion: { tipo: "probar", etiqueta: "Lo probé", cantidad: 2, textoSocial: "2 lo probaron", hecha: false },
    });
  });

  it("arma el resumen para copiar y le ofrece al capitán definir la misión", async () => {
    const base = await cargarBase(repo(), AHORA, "https://heroes.example.com");
    expect(base.mision).toMatchObject({ esCapitan: true, puedeDefinir: true, titulo: "Sumar 6 aportes", hecho: 4, meta: 6 });
    const lineas = base.resumen.split("\n");
    expect(lineas[0]).toBe("*Heroes IA · Semana del 5/10 al 11/10*");
    expect(lineas).toContain("1. Revisar un PR con un agente de código (Skill, de Ana) · 2 lo probaron");
    expect(lineas).toContain("*Misión del equipo:* Sumar 6 aportes · 4/6");
    expect(lineas.at(-1)).toBe("Entrá y sumá: https://heroes.example.com");
  });

  it("marca lo propio y lo ya hecho, con el XP ganado", async () => {
    const base = await cargarBase(repo(), AHORA);
    const propio = base.loNuevo.find((t) => t.id === "demo-a5");
    expect(propio).toMatchObject({ esPropio: true, xpGanado: 10 });
    const probado = base.loNuevo.find((t) => t.id === "demo-a6");
    expect(probado).toMatchObject({ esPropio: false, accion: { hecha: true }, xpGanado: 30 });
  });

  it("sin aportes, Lo nuevo queda vacío (la pantalla muestra el llamado a sumar el primero)", async () => {
    estado.aportes = [];
    estado.acciones = [];
    const base = await cargarBase(repo(), AHORA);
    expect(base.loNuevo).toEqual([]);
    expect(base.mision?.hecho).toBe(0);
  });
});

describe("Explorar", () => {
  it("lista por tipo y atenúa la oportunidad vencida", async () => {
    const tarjetas = await cargarExplorar(repo(), "oportunidad", AHORA);
    expect(tarjetas.map((t) => [t.titulo, t.vencimiento])).toEqual([
      ["Hackathon de agentes", { texto: "Vence en 3 días", vencida: false }],
      ["Becas para un curso de agentes", { texto: "Venció el 5/10", vencida: true }],
    ]);
    expect(tarjetas.every((t) => t.tipo === "oportunidad" && t.accion.etiqueta === "Me interesa")).toBe(true);
  });

  it("cada tipo muestra su acción y su prueba social", async () => {
    const [proyecto] = await cargarExplorar(repo(), "proyecto", AHORA);
    expect(proyecto?.accion).toMatchObject({ etiqueta: "Dar feedback", textoSocial: "1 feedback" });
    const [noticia] = await cargarExplorar(repo(), "noticia", AHORA);
    expect(noticia?.accion).toMatchObject({ etiqueta: "Lo leí", textoSocial: "1 lo leyó" });
    expect(noticia?.fuente).toBe("example.com");
  });
});

describe("Perfil", () => {
  it("trae nombre, nivel, rango, clase, XP y récord", async () => {
    const heroe = await cargarPerfil(repo(), AHORA);
    expect(heroe).toMatchObject({ nombre: USUARIO_DEMO.nombre, rango: "Recluta", record: 1 });
    expect(heroe.clase).not.toBeNull();
    expect(heroe.xpTotal).toBeGreaterThan(0);
  });
});
