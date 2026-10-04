// XP con topes diarios, nivel, rango y clase (B4, D7, D9). Los números viven en xp-config.ts.
import { aFecha, diaLocal } from "./tiempo";
import type { Clase, EventoXp, MotivoXp, TipoAccion } from "./tipos";
import {
  CLASE_POR_TIPO,
  DIAS_CLASE,
  ORDEN_CLASES_EMPATE,
  RANGOS,
  XP_BASE_NIVEL,
  XP_POR_MOTIVO,
  ZONA_HORARIA,
} from "./xp-config";

const DIA_MS = 86_400_000;

export interface EventoConXp extends EventoXp {
  xp: number;
}

/**
 * Qué evento de XP genera cada acción. "Me interesa" no da XP y "Dar feedback" tampoco:
 * el feedback suma recién cuando el autor del proyecto lo marca útil (motivo feedback_util).
 */
export function motivoDeAccion(tipo: TipoAccion): MotivoXp | null {
  if (tipo === "probar") return "probar";
  if (tipo === "leer") return "leer";
  return null;
}

/**
 * Asigna XP a cada evento en orden cronológico. Por persona, motivo y día local, los primeros
 * `topeDiario` eventos valen su XP y el resto vale 0.
 */
export function asignarXp(eventos: readonly EventoXp[], zona: string = ZONA_HORARIA): EventoConXp[] {
  const ordenados = [...eventos].sort(
    (a, b) => aFecha(a.creadoEn).getTime() - aFecha(b.creadoEn).getTime() || a.id.localeCompare(b.id),
  );
  const usados = new Map<string, number>();
  return ordenados.map((evento) => {
    const regla = XP_POR_MOTIVO[evento.motivo];
    const clave = `${evento.perfilId}|${evento.motivo}|${diaLocal(evento.creadoEn, zona)}`;
    const cantidad = (usados.get(clave) ?? 0) + 1;
    usados.set(clave, cantidad);
    return { ...evento, xp: cantidad <= regla.topeDiario ? regla.xp : 0 };
  });
}

/** XP total de una persona, opcionalmente solo hasta un instante (incluido). */
export function xpDe(eventos: readonly EventoConXp[], perfilId: string, hasta?: Date): number {
  const limite = hasta?.getTime() ?? Number.POSITIVE_INFINITY;
  return eventos
    .filter((e) => e.perfilId === perfilId && aFecha(e.creadoEn).getTime() <= limite)
    .reduce((suma, e) => suma + e.xp, 0);
}

/** XP acumulado necesario para llegar a un nivel. */
export function xpParaLlegarA(nivel: number): number {
  return (XP_BASE_NIVEL * nivel * (nivel - 1)) / 2;
}

export function rangoDeNivel(nivel: number): string {
  let nombre = RANGOS[0]?.nombre ?? "";
  for (const rango of RANGOS) if (nivel >= rango.desdeNivel) nombre = rango.nombre;
  return nombre;
}

export interface Nivel {
  nivel: number;
  rango: string;
  xpTotal: number;
  /** XP ganado dentro del nivel actual. */
  xpEnNivel: number;
  /** XP que pide el nivel actual para pasar al siguiente. */
  xpDelNivel: number;
}

export function calcularNivel(xpTotal: number): Nivel {
  const xp = Math.max(0, Math.floor(xpTotal));
  let nivel = 1;
  while (xpParaLlegarA(nivel + 1) <= xp) nivel++;
  const base = xpParaLlegarA(nivel);
  return {
    nivel,
    rango: rangoDeNivel(nivel),
    xpTotal: xp,
    xpEnNivel: xp - base,
    xpDelNivel: xpParaLlegarA(nivel + 1) - base,
  };
}

function claseDelEvento(evento: EventoXp): Clase | null {
  if (evento.motivo === "feedback_util") return "mentor";
  if (evento.motivo === "entrar" || evento.tipoAporte === null) return null;
  return CLASE_POR_TIPO[evento.tipoAporte];
}

/** XP por clase en los últimos DIAS_CLASE días (ventana de instantes: (ahora − 30 días, ahora]). */
export function xpPorClase(eventos: readonly EventoConXp[], perfilId: string, ahora: Date): Record<Clase, number> {
  const fin = ahora.getTime();
  const inicio = fin - DIAS_CLASE * DIA_MS;
  const suma: Record<Clase, number> = { builder: 0, scout: 0, curador: 0, mentor: 0 };
  for (const evento of eventos) {
    const momento = aFecha(evento.creadoEn).getTime();
    if (evento.perfilId !== perfilId || momento <= inicio || momento > fin) continue;
    const clase = claseDelEvento(evento);
    if (clase) suma[clase] += evento.xp;
  }
  return suma;
}

/** La clase es donde más XP se sumó en 30 días. Sin XP en ese período, no hay clase todavía. */
export function claseDe(eventos: readonly EventoConXp[], perfilId: string, ahora: Date): Clase | null {
  const suma = xpPorClase(eventos, perfilId, ahora);
  let mejor: Clase | null = null;
  for (const clase of ORDEN_CLASES_EMPATE) {
    if (suma[clase] > 0 && (mejor === null || suma[clase] > suma[mejor])) mejor = clase;
  }
  return mejor;
}
