// Tarjeta de la misión del equipo (U6, S1): título, segmentos, quiénes sumaron y quién la define.
import { inicial, textoDiasQueFaltan } from "@/domain/formato";
import type { Mision, Progreso } from "@/domain/mision";
import { diasQueFaltan } from "@/domain/tiempo";
import type { Miembro } from "@/domain/tipos";

/** Con metas grandes, cada segmento representa una parte de la meta. */
export const MAX_SEGMENTOS = 10;

export interface ParticipanteVista {
  id: string;
  nombre: string;
  inicial: string;
}

export interface VistaMision {
  titulo: string;
  origen: Mision["origen"];
  hecho: number;
  meta: number;
  completa: boolean;
  segmentos: { total: number; llenos: number };
  participantes: ParticipanteVista[];
  faltan: string;
  capitan: string | null;
  esCapitan: boolean;
  /** El capitán todavía no la eligió: ve el formulario (paso 7). */
  puedeDefinir: boolean;
  detalle: string;
}

export function segmentos(hecho: number, meta: number): { total: number; llenos: number } {
  if (meta <= 0) return { total: 0, llenos: 0 };
  const cumplido = Math.min(Math.max(hecho, 0), meta);
  if (meta <= MAX_SEGMENTOS) return { total: meta, llenos: cumplido };
  return { total: MAX_SEGMENTOS, llenos: Math.floor((cumplido * MAX_SEGMENTOS) / meta) };
}

function detalle(mision: Mision, capitan: string | null, esCapitan: boolean): string {
  if (mision.origen === "lanzamiento") return `Arranque del equipo: cuentan hasta ${mision.topePorMiembro ?? 2} aportes por persona.`;
  if (mision.origen === "capitan") return esCapitan ? "La elegiste vos, capitán de esta semana." : `La eligió ${capitan ?? "el capitán"}, capitán de esta semana.`;
  if (esCapitan) return "Sos el capitán de esta semana: elegí la misión del equipo.";
  return capitan ? `Misión de reemplazo hasta que ${capitan} elija la de esta semana.` : "Misión de reemplazo de esta semana.";
}

export function vistaMision(
  mision: Mision,
  progreso: Progreso,
  miembros: readonly Miembro[],
  usuarioId: string,
  ahora: Date,
): VistaMision {
  const nombres = new Map(miembros.map((m) => [m.id, m.nombre]));
  const capitan = mision.capitanId ? (nombres.get(mision.capitanId) ?? null) : null;
  const esCapitan = mision.capitanId !== null && mision.capitanId === usuarioId;
  return {
    titulo: mision.titulo,
    origen: mision.origen,
    hecho: Math.min(progreso.hecho, mision.meta),
    meta: mision.meta,
    completa: progreso.completa,
    segmentos: segmentos(progreso.hecho, mision.meta),
    participantes: progreso.participantes.map((id) => {
      const nombre = nombres.get(id) ?? "Alguien";
      return { id, nombre, inicial: inicial(nombre) };
    }),
    faltan: textoDiasQueFaltan(diasQueFaltan(ahora)),
    capitan,
    esCapitan,
    puedeDefinir: esCapitan && mision.origen === "reemplazo",
    detalle: detalle(mision, capitan, esCapitan),
  };
}
