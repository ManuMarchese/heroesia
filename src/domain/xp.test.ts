import { describe, expect, it } from "vitest";
import type { EventoXp, MotivoXp, TipoAporte } from "./tipos";
import { asignarXp, calcularNivel, claseDe, motivoDeAccion, xpDe, xpParaLlegarA, xpPorClase } from "./xp";
import { XP_POR_MOTIVO } from "./xp-config";

let secuencia = 0;
function ev(perfilId: string, motivo: MotivoXp, creadoEn: string, tipoAporte: TipoAporte | null = null): EventoXp {
  secuencia += 1;
  return { id: `e${String(secuencia).padStart(4, "0")}`, perfilId, motivo, tipoAporte, creadoEn };
}
const xps = (eventos: EventoXp[]) => asignarXp(eventos).map((e) => e.xp);
// Mediodía en Buenos Aires del 1 de octubre de 2026, más n minutos.
const hora = (minutos: number) => new Date(Date.parse("2026-10-01T15:00:00Z") + minutos * 60_000).toISOString();

describe("valores y topes diarios", () => {
  it("los valores son los de la tabla del PLAN", () => {
    expect(XP_POR_MOTIVO).toEqual({
      entrar: { xp: 5, topeDiario: 1 },
      publicar: { xp: 10, topeDiario: 3 },
      leer: { xp: 2, topeDiario: 10 },
      probar: { xp: 30, topeDiario: 5 },
      feedback_util: { xp: 25, topeDiario: 5 },
    });
  });

  it("entrar suma una sola vez por día", () => {
    expect(xps([ev("ana", "entrar", hora(0)), ev("ana", "entrar", hora(5))])).toEqual([5, 0]);
  });

  it("cada motivo respeta su tope diario", () => {
    const probar = Array.from({ length: 6 }, (_, i) => ev("ana", "probar", hora(i)));
    expect(xps(probar)).toEqual([30, 30, 30, 30, 30, 0]);
    const publicar = Array.from({ length: 4 }, (_, i) => ev("ana", "publicar", hora(i), "repo"));
    expect(xps(publicar)).toEqual([10, 10, 10, 0]);
    const leer = Array.from({ length: 11 }, (_, i) => ev("ana", "leer", hora(i), "noticia"));
    expect(xps(leer).reduce((a, b) => a + b, 0)).toBe(20);
    const utiles = Array.from({ length: 6 }, (_, i) => ev("ana", "feedback_util", hora(i), "proyecto"));
    expect(xps(utiles).reduce((a, b) => a + b, 0)).toBe(125);
  });

  it("el tope es por persona", () => {
    expect(xps([ev("ana", "entrar", hora(0)), ev("beto", "entrar", hora(1))])).toEqual([5, 5]);
  });

  it("el tope se reinicia a las 00:00 de Buenos Aires, no a medianoche UTC", () => {
    // 23:30 y 02:30 UTC caen el mismo día en Buenos Aires (20:30 y 23:30 del domingo).
    expect(xps([ev("ana", "entrar", "2026-10-04T23:30:00Z"), ev("ana", "entrar", "2026-10-05T02:30:00Z")])).toEqual([5, 0]);
    // 02:30 UTC es domingo y 03:30 UTC ya es lunes en Buenos Aires.
    expect(xps([ev("ana", "entrar", "2026-10-05T02:30:00Z"), ev("ana", "entrar", "2026-10-05T03:30:00Z")])).toEqual([5, 5]);
  });

  it("ordena por fecha aunque los eventos lleguen desordenados", () => {
    const tarde = ev("ana", "entrar", hora(30));
    const temprano = ev("ana", "entrar", hora(0));
    const resultado = asignarXp([tarde, temprano]);
    expect(resultado.map((e) => [e.id, e.xp])).toEqual([
      [temprano.id, 5],
      [tarde.id, 0],
    ]);
  });

  it("'Me interesa' y 'Dar feedback' no generan XP; 'Lo probé' y 'Lo leí' sí", () => {
    expect(motivoDeAccion("interes")).toBeNull();
    expect(motivoDeAccion("feedback")).toBeNull();
    expect(motivoDeAccion("probar")).toBe("probar");
    expect(motivoDeAccion("leer")).toBe("leer");
  });

  it("suma el XP de una persona, opcionalmente hasta un instante", () => {
    const eventos = asignarXp([ev("ana", "entrar", hora(0)), ev("ana", "probar", hora(10), "skill"), ev("beto", "entrar", hora(1))]);
    expect(xpDe(eventos, "ana")).toBe(35);
    expect(xpDe(eventos, "ana", new Date(hora(5)))).toBe(5);
    expect(xpDe(eventos, "nadie")).toBe(0);
  });
});

describe("niveles y rangos", () => {
  it("la curva es creciente: cada nivel pide 100 XP más que el anterior", () => {
    expect([1, 2, 3, 4, 5, 10].map(xpParaLlegarA)).toEqual([0, 100, 300, 600, 1000, 4500]);
    for (let n = 1; n < 30; n++) {
      expect(calcularNivel(xpParaLlegarA(n + 1)).xpDelNivel).toBeGreaterThan(calcularNivel(xpParaLlegarA(n)).xpDelNivel);
    }
  });

  it("calcula nivel, XP dentro del nivel y rango", () => {
    expect(calcularNivel(0)).toEqual({ nivel: 1, rango: "Recluta", xpTotal: 0, xpEnNivel: 0, xpDelNivel: 100 });
    expect(calcularNivel(99).nivel).toBe(1);
    expect(calcularNivel(100)).toMatchObject({ nivel: 2, xpEnNivel: 0, xpDelNivel: 200 });
    expect(calcularNivel(299).nivel).toBe(2);
    expect(calcularNivel(300)).toMatchObject({ nivel: 3, rango: "Aprendiz" });
    expect(calcularNivel(1000)).toMatchObject({ nivel: 5, rango: "Héroe" });
    expect(calcularNivel(2800)).toMatchObject({ nivel: 8, rango: "Campeón" });
    expect(calcularNivel(6600)).toMatchObject({ nivel: 12, rango: "Leyenda" });
  });

  it("no se rompe con valores raros", () => {
    expect(calcularNivel(-50)).toMatchObject({ nivel: 1, xpTotal: 0 });
    expect(calcularNivel(150.9)).toMatchObject({ nivel: 2, xpTotal: 150 });
  });
});

describe("clase de héroe (30 días)", () => {
  const ahora = new Date("2026-10-04T15:00:00Z");
  const haceDias = (d: number) => new Date(ahora.getTime() - d * 86_400_000).toISOString();

  it("sin XP en 30 días no hay clase", () => {
    expect(claseDe([], "ana", ahora)).toBeNull();
    expect(claseDe(asignarXp([ev("ana", "entrar", haceDias(1))]), "ana", ahora)).toBeNull();
  });

  it("gana el tipo de aporte con más XP y el feedback útil cuenta para Mentor", () => {
    const eventos = asignarXp([
      ev("ana", "probar", haceDias(1), "skill"),
      ev("ana", "publicar", haceDias(2), "proyecto"),
      ev("ana", "feedback_util", haceDias(3), "proyecto"),
    ]);
    expect(xpPorClase(eventos, "ana", ahora)).toEqual({ builder: 10, scout: 0, curador: 30, mentor: 25 });
    expect(claseDe(eventos, "ana", ahora)).toBe("curador");
  });

  it("Scout suma Noticias y Oportunidades", () => {
    const eventos = asignarXp([
      ev("ana", "publicar", haceDias(1), "noticia"),
      ev("ana", "publicar", haceDias(2), "oportunidad"),
      ev("ana", "leer", haceDias(3), "noticia"),
      ev("ana", "publicar", haceDias(4), "repo"),
    ]);
    expect(claseDe(eventos, "ana", ahora)).toBe("scout");
  });

  it("solo cuentan los últimos 30 días", () => {
    const eventos = asignarXp([ev("ana", "probar", haceDias(31), "skill"), ev("ana", "publicar", haceDias(29), "noticia")]);
    expect(claseDe(eventos, "ana", ahora)).toBe("scout");
  });

  it("los eventos que pasaron el tope (0 XP) no cuentan y el empate sigue el orden de la configuración", () => {
    const eventos = asignarXp([
      ev("ana", "publicar", haceDias(1), "proyecto"),
      ev("ana", "publicar", haceDias(1), "proyecto"),
      ev("ana", "publicar", haceDias(1), "proyecto"),
      ev("ana", "publicar", haceDias(1), "repo"),
      ev("ana", "publicar", haceDias(2), "skill"),
      ev("ana", "publicar", haceDias(3), "skill"),
      ev("ana", "publicar", haceDias(4), "skill"),
    ]);
    expect(xpPorClase(eventos, "ana", ahora)).toEqual({ builder: 30, scout: 0, curador: 30, mentor: 0 });
    expect(claseDe(eventos, "ana", ahora)).toBe("builder");
  });
});
