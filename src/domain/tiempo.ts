// Días y semanas en la zona del grupo. El offset sale de Intl (datos IANA), nunca de un número fijo.
import type { Dia, FechaIso } from "./tipos";
import { ZONA_HORARIA } from "./xp-config";

const DIA_MS = 86_400_000;
const formateadores = new Map<string, Intl.DateTimeFormat>();

function formateador(zona: string): Intl.DateTimeFormat {
  let f = formateadores.get(zona);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: zona,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    formateadores.set(zona, f);
  }
  return f;
}

export function aFecha(instante: Date | FechaIso): Date {
  const fecha = typeof instante === "string" ? new Date(instante) : instante;
  if (Number.isNaN(fecha.getTime())) throw new RangeError(`Fecha inválida: ${String(instante)}`);
  return fecha;
}

/** Día local (AAAA-MM-DD) de un instante en la zona indicada. */
export function diaLocal(instante: Date | FechaIso, zona: string = ZONA_HORARIA): Dia {
  const partes = formateador(zona).formatToParts(aFecha(instante));
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

const PATRON_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** true si el texto es un día real con formato AAAA-MM-DD. */
export function esDiaValido(texto: string): boolean {
  const m = PATRON_DIA.exec(texto);
  if (!m) return false;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}

function utcDeDia(dia: Dia): number {
  if (!esDiaValido(dia)) throw new RangeError(`Día inválido: ${dia}`);
  return Date.parse(`${dia}T00:00:00Z`);
}

/** Suma días de calendario a un día local. */
export function sumarDias(dia: Dia, n: number): Dia {
  return new Date(utcDeDia(dia) + n * DIA_MS).toISOString().slice(0, 10);
}

/** Días de calendario entre dos días locales (b − a). */
export function diasEntre(a: Dia, b: Dia): number {
  return Math.round((utcDeDia(b) - utcDeDia(a)) / DIA_MS);
}

/** 0 = lunes … 6 = domingo. */
export function diaDeSemana(dia: Dia): number {
  return (new Date(utcDeDia(dia)).getUTCDay() + 6) % 7;
}

/** Clave de la semana (su lunes) a la que pertenece un instante. La semana va de lunes a domingo. */
export function semanaDe(instante: Date | FechaIso, zona: string = ZONA_HORARIA): Dia {
  const dia = diaLocal(instante, zona);
  return sumarDias(dia, -diaDeSemana(dia));
}

/** Semanas entre dos claves de semana (b − a). */
export function semanasEntre(a: Dia, b: Dia): number {
  return Math.round(diasEntre(a, b) / 7);
}

/** Días que quedan de la semana contando hoy: lunes = 7, domingo = 1. */
export function diasQueFaltan(ahora: Date, zona: string = ZONA_HORARIA): number {
  return 7 - diaDeSemana(diaLocal(ahora, zona));
}

/** "28/9" para un día AAAA-MM-DD. */
export function diaCorto(dia: Dia): string {
  const [, mes, d] = dia.split("-");
  return `${Number(d)}/${Number(mes)}`;
}
