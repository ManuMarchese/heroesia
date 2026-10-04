import { describe, expect, it } from "vitest";
import { mejoresDeLaSemana, subidasDeNivel, textoResumenSemanal } from "./resumen";
import type { Aporte, Miembro } from "./tipos";
import { asignarXp } from "./xp";

const SEMANA = "2026-10-05";
const AHORA = new Date("2026-10-09T15:00:00Z");
const miembros: Miembro[] = [
  { id: "ana", nombre: "Ana", creadoEn: "2026-09-30T15:00:00Z" },
  { id: "leo", nombre: "Leo", creadoEn: "2026-10-01T15:00:00Z" },
];

function aporte(id: string, autorId: string, tipo: Aporte["tipo"], titulo: string, creadoEn: string): Aporte {
  return {
    id,
    autorId,
    tipo,
    titulo,
    creadoEn,
    link: `https://example.com/${id}`,
    imagenUrl: null,
    porQueSirve: "Sirve",
    comoSeUsa: null,
    fuente: null,
    fechaLimite: tipo === "oportunidad" ? "2026-10-20" : null,
    queMirar: tipo === "proyecto" ? "Todo" : null,
  };
}

const aportes = [
  aporte("a1", "ana", "skill", "Revisar un PR con Claude Code", "2026-10-06T12:00:00Z"),
  aporte("a2", "leo", "repo", "agent-kit: plantillas de agentes", "2026-10-07T12:00:00Z"),
  aporte("a3", "ana", "noticia", "Salió un modelo nuevo", "2026-10-08T12:00:00Z"),
  aporte("a4", "leo", "oportunidad", "Hackathon de agentes", "2026-10-08T13:00:00Z"),
  aporte("a0", "leo", "skill", "De la semana pasada", "2026-10-04T12:00:00Z"),
];
const acciones = [{ aporteId: "a1" }, { aporteId: "a1" }, { aporteId: "a1" }, { aporteId: "a2" }, { aporteId: "a0" }];

describe("lo mejor de la semana", () => {
  it("toma solo aportes de la semana, por acciones recibidas y, si empatan, el más nuevo", () => {
    expect(mejoresDeLaSemana(aportes, acciones, miembros, SEMANA)).toEqual([
      { titulo: "Revisar un PR con Claude Code", tipo: "skill", autor: "Ana", reacciones: 3 },
      { titulo: "agent-kit: plantillas de agentes", tipo: "repo", autor: "Leo", reacciones: 1 },
      { titulo: "Hackathon de agentes", tipo: "oportunidad", autor: "Leo", reacciones: 0 },
    ]);
  });
});

describe("quién subió de nivel", () => {
  it("compara el nivel del lunes con el de ahora", () => {
    // Ana llega al lunes con 90 XP (nivel 1) y suma 30 en la semana (120, nivel 2). Leo no sube.
    const eventos = asignarXp([
      { id: "x0", perfilId: "ana", motivo: "probar", tipoAporte: "skill", creadoEn: "2026-10-01T12:00:00Z" },
      { id: "x1", perfilId: "ana", motivo: "probar", tipoAporte: "skill", creadoEn: "2026-10-02T12:00:00Z" },
      { id: "x2", perfilId: "ana", motivo: "probar", tipoAporte: "skill", creadoEn: "2026-10-03T12:00:00Z" },
      { id: "x3", perfilId: "ana", motivo: "probar", tipoAporte: "skill", creadoEn: "2026-10-06T12:00:00Z" },
      { id: "x4", perfilId: "leo", motivo: "entrar", tipoAporte: null, creadoEn: "2026-10-06T12:00:00Z" },
    ]);
    expect(subidasDeNivel(miembros, eventos, SEMANA, AHORA)).toEqual([{ nombre: "Ana", nivelAntes: 1, nivel: 2 }]);
  });
});

describe("texto del resumen semanal", () => {
  it("arma lo mejor, la misión y quién subió de nivel", () => {
    const texto = textoResumenSemanal({
      semana: SEMANA,
      destacados: mejoresDeLaSemana(aportes, acciones, miembros, SEMANA),
      mision: { titulo: "Probar 5 skills o repos", hecho: 3, meta: 5, completa: false },
      subidas: [
        { nombre: "Ana", nivelAntes: 6, nivel: 7 },
        { nombre: "Leo", nivelAntes: 2, nivel: 3 },
      ],
      url: "https://heroes.example.com",
    });
    expect(texto).toBe(
      [
        "*Heroes IA · Semana del 5/10 al 11/10*",
        "",
        "*Lo mejor de la semana*",
        "1. Revisar un PR con Claude Code (Skill, de Ana) · 3 lo probaron",
        "2. agent-kit: plantillas de agentes (Repo, de Leo) · 1 lo probó",
        "3. Hackathon de agentes (Oportunidad, de Leo)",
        "",
        "*Misión del equipo:* Probar 5 skills o repos · 3/5",
        "Faltan 2 para cumplirla.",
        "",
        "*Subieron de nivel:* Ana (nivel 7) y Leo (nivel 3).",
        "",
        "Entrá y sumá: https://heroes.example.com",
      ].join("\n"),
    );
  });

  it("una semana vacía y sin miembros igual da un texto útil", () => {
    const texto = textoResumenSemanal({ semana: SEMANA, destacados: [], mision: null, subidas: [] });
    expect(texto).toBe(
      ["*Heroes IA · Semana del 5/10 al 11/10*", "", "*Lo mejor de la semana*", "Esta semana no hubo aportes nuevos. ¡Sumá el primero!"].join("\n"),
    );
  });

  it("marca la misión cumplida, usa singular y no lleva emojis", () => {
    const cumplida = textoResumenSemanal({
      semana: SEMANA,
      destacados: [],
      mision: { titulo: "Sumar 6 aportes", hecho: 8, meta: 6, completa: true },
      subidas: [{ nombre: "Ana", nivelAntes: 1, nivel: 2 }],
    });
    expect(cumplida).toContain("Sumar 6 aportes · 6/6\n¡Misión cumplida!");
    expect(cumplida).toContain("*Subieron de nivel:* Ana (nivel 2).");
    const casi = textoResumenSemanal({
      semana: SEMANA,
      destacados: [],
      mision: { titulo: "Leer 10 noticias", hecho: 9, meta: 10, completa: false },
      subidas: [],
    });
    expect(casi).toContain("Falta 1 para cumplirla.");
    expect(/\p{Extended_Pictographic}/u.test(cumplida + casi)).toBe(false);
  });
});
