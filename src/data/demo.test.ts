import { beforeEach, describe, expect, it } from "vitest";
import { validarAporte } from "@/domain/aportes";
import { capitanDeSemana } from "@/domain/mision";
import { semanaDe } from "@/domain/tiempo";
import { asignarXp, calcularNivel, xpDe } from "@/domain/xp";
import { crearRepositorioDemo } from "./demo";
import { USUARIO_DEMO, crearEstadoDemo, type EstadoDemo } from "./demo-datos";
import { ErrorDatos } from "./errores";

const AHORA = new Date("2026-10-07T15:00:00Z"); // miércoles al mediodía en Buenos Aires
const VOS = USUARIO_DEMO.id;
let estado: EstadoDemo;
let reloj: Date;
const repo = (usuarioId: string = VOS) => crearRepositorioDemo(estado, usuarioId, () => reloj);
const codigo = (promesa: Promise<unknown>) =>
  promesa.then(
    () => "ok",
    (e: unknown) => (e instanceof ErrorDatos ? e.codigo : "otro"),
  );

beforeEach(() => {
  estado = crearEstadoDemo(AHORA);
  reloj = AHORA;
});

describe("datos de ejemplo", () => {
  it("tienen 5 miembros, incluido el usuario de ejemplo, y respetan las plantillas", async () => {
    const miembros = await repo().miembros();
    expect(miembros.map((m) => m.nombre)).toEqual(["Ana", "Héroe demo", "Leo", "Sofi", "Tomi"]);
    for (const a of await repo().aportes()) {
      expect(validarAporte({ ...a, tipo: a.tipo }, AHORA).ok, a.titulo).toBe(true);
    }
  });

  it("el usuario de ejemplo ya tiene XP y nivel", async () => {
    const eventos = asignarXp(await repo().eventosXp());
    expect(calcularNivel(xpDe(eventos, VOS)).nivel).toBeGreaterThanOrEqual(2);
  });

  it("cada estado nuevo arranca limpio", async () => {
    await repo().publicar({ ...(await repo().aportes())[0]!, titulo: "Nuevo" });
    expect(crearEstadoDemo(AHORA).aportes).toHaveLength(9);
  });
});

describe("lecturas", () => {
  it("lista aportes del más nuevo al más viejo, con filtro por tipo y límite", async () => {
    const todos = await repo().aportes();
    expect(todos.map((a) => a.creadoEn)).toEqual([...todos.map((a) => a.creadoEn)].sort().reverse());
    expect((await repo().aportes({ tipo: "proyecto" })).every((a) => a.tipo === "proyecto")).toBe(true);
    expect(await repo().aportes({ limite: 2 })).toHaveLength(2);
    expect(await repo().aporte("no-existe")).toBeNull();
  });

  it("filtra acciones por aporte y devuelve copias", async () => {
    const acciones = await repo().acciones({ aporteIds: ["demo-a1"] });
    expect(acciones.map((c) => c.perfilId).sort()).toEqual(["demo-leo", "demo-sofi"]);
    acciones[0]!.texto = "cambiado";
    expect(estado.acciones.some((c) => c.texto === "cambiado")).toBe(false);
  });
});

describe("escrituras con las mismas reglas que la base", () => {
  it("publicar pone autor y fecha y suma el evento de XP", async () => {
    const valido = validarAporte({ tipo: "repo", link: "https://example.com/x", titulo: "X", porQueSirve: "Sirve" }, AHORA);
    if (!valido.ok) throw new Error("aporte inválido");
    const aporte = await repo().publicar(valido.valor);
    expect(aporte).toMatchObject({ autorId: VOS, creadoEn: AHORA.toISOString() });
    expect((await repo().aportes())[0]?.id).toBe(aporte.id);
    expect(estado.eventos.at(-1)).toMatchObject({ perfilId: VOS, motivo: "publicar", tipoAporte: "repo" });
  });

  it("'Lo probé' suma XP una vez; no vale sobre lo propio ni con la acción de otro tipo", async () => {
    const probe = { tipo: "probar" as const, resultado: "Anduvo bárbaro", texto: null };
    expect(await codigo(repo().accionar("demo-a1", probe))).toBe("ok");
    expect(estado.eventos.at(-1)).toMatchObject({ perfilId: VOS, motivo: "probar", aporteId: "demo-a1" });
    expect(await codigo(repo().accionar("demo-a1", probe))).toBe("duplicado");
    expect(await codigo(repo().accionar("demo-a5", { tipo: "feedback", resultado: null, texto: "Bien" }))).toBe("no_permitido");
    expect(await codigo(repo().accionar("demo-a4", probe))).toBe("no_permitido");
    expect(await codigo(repo().accionar("nada", probe))).toBe("no_encontrado");
  });

  it("'Me interesa' no genera XP", async () => {
    const antes = estado.eventos.length;
    await repo().accionar("demo-a3", { tipo: "interes", resultado: null, texto: null });
    expect(estado.eventos).toHaveLength(antes);
  });

  it("solo el autor del proyecto marca útil un feedback, una vez, y suma XP a quien lo dio", async () => {
    expect(await codigo(repo("demo-ana").marcarUtil("demo-c5"))).toBe("no_permitido");
    expect(await codigo(repo().marcarUtil("demo-c5"))).toBe("ok");
    expect(estado.eventos.at(-1)).toMatchObject({ perfilId: "demo-leo", motivo: "feedback_util" });
    expect((await repo().acciones({ aporteIds: ["demo-a5"] }))[0]?.util).toBe(true);
    expect(await codigo(repo().marcarUtil("demo-c5"))).toBe("duplicado");
  });

  it("solo el capitán define la misión de la semana actual, una vez", async () => {
    const semana = semanaDe(AHORA);
    const capitan = capitanDeSemana(semana, estado.miembros);
    if (!capitan) throw new Error("tendría que haber capitán");
    const otro = estado.miembros.find((m) => m.id !== capitan)?.id ?? VOS;
    expect(await codigo(repo(otro).definirMision(semana, { accion: "leer", meta: 5 }))).toBe("no_permitido");
    expect(await codigo(repo(capitan).definirMision("2026-09-28", { accion: "leer", meta: 5 }))).toBe("no_permitido");
    expect(await codigo(repo(capitan).definirMision(semana, { accion: "leer", meta: 0 }))).toBe("invalido");
    expect(await codigo(repo(capitan).definirMision(semana, { accion: "leer", meta: 5 }))).toBe("ok");
    expect(await repo().misionDefinida(semana)).toMatchObject({ accion: "leer", meta: 5, definidaPor: capitan });
    expect(await codigo(repo(capitan).definirMision(semana, { accion: "probar", meta: 2 }))).toBe("duplicado");
  });

  it("registra la entrada una vez por día de Buenos Aires", async () => {
    const entradasDeHoy = () => estado.eventos.filter((e) => e.perfilId === VOS && e.motivo === "entrar" && e.creadoEn.startsWith("2026-10-0"));
    await repo().registrarEntrada();
    await repo().registrarEntrada();
    expect(entradasDeHoy().filter((e) => e.creadoEn === AHORA.toISOString())).toHaveLength(1);
    reloj = new Date("2026-10-08T02:30:00Z"); // todavía miércoles en Buenos Aires
    await repo().registrarEntrada();
    expect(entradasDeHoy().filter((e) => e.creadoEn === reloj.toISOString())).toHaveLength(0);
    reloj = new Date("2026-10-08T03:30:00Z"); // jueves
    await repo().registrarEntrada();
    expect(entradasDeHoy().filter((e) => e.creadoEn === reloj.toISOString())).toHaveLength(1);
  });
});
