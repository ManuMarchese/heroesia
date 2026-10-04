// Récord personal (PB, D8): la semana con más pruebas "Lo probé".
import { semanaDe } from "./tiempo";
import type { Dia, FechaIso } from "./tipos";
import { ZONA_HORARIA } from "./xp-config";

export interface RecordPersonal {
  /** Pruebas de la semana actual. */
  estaSemana: number;
  /** La mejor semana hasta hoy, incluida la actual. */
  record: number;
  semanaRecord: Dia | null;
  /** La mejor semana anterior a la actual. */
  recordPrevio: number;
  /** La semana actual supera a todas las anteriores. */
  esNuevoRecord: boolean;
}

/** Recibe las fechas de las pruebas "Lo probé" de una persona. Si dos semanas empatan, queda la primera. */
export function recordPersonal(
  fechasDePruebas: readonly FechaIso[],
  ahora: Date,
  zona: string = ZONA_HORARIA,
): RecordPersonal {
  const actual = semanaDe(ahora, zona);
  const porSemana = new Map<Dia, number>();
  for (const fecha of fechasDePruebas) {
    const semana = semanaDe(fecha, zona);
    if (semana <= actual) porSemana.set(semana, (porSemana.get(semana) ?? 0) + 1);
  }

  let recordPrevio = 0;
  let record = 0;
  let semanaRecord: Dia | null = null;
  for (const [semana, cantidad] of [...porSemana].sort(([a], [b]) => a.localeCompare(b))) {
    if (semana < actual) recordPrevio = Math.max(recordPrevio, cantidad);
    if (cantidad > record) {
      record = cantidad;
      semanaRecord = semana;
    }
  }

  const estaSemana = porSemana.get(actual) ?? 0;
  return { estaSemana, record, semanaRecord, recordPrevio, esNuevoRecord: estaSemana > recordPrevio };
}
