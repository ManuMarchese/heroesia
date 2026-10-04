// Cuándo registrar la entrada del día: hasta el tope diario de "entrar" de xp-config.ts.
import { diaLocal } from "@/domain/tiempo";
import type { FechaIso } from "@/domain/tipos";
import { XP_POR_MOTIVO } from "@/domain/xp-config";

export const TOPE_ENTRADAS = XP_POR_MOTIVO.entrar.topeDiario;

/** Recibe las últimas entradas de la persona (al menos TOPE_ENTRADAS, si hay) y dice si falta registrar hoy. */
export function faltaEntradaHoy(ultimasEntradas: readonly FechaIso[], ahora: Date): boolean {
  const hoy = diaLocal(ahora);
  return ultimasEntradas.filter((fecha) => diaLocal(fecha) === hoy).length < TOPE_ENTRADAS;
}
