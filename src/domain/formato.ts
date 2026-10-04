// Textos cortos para las pantallas: hace cuánto, iniciales y vencimientos. Sin emojis.
import { diaCorto, diaLocal, diasEntre } from "./tiempo";
import type { FechaIso } from "./tipos";
import { ZONA_HORARIA } from "./xp-config";

const MINUTO = 60_000;

/** "recién", "hace 5 min", "hace 2 h", "ayer", "hace 3 días" o "el 28/9". */
export function haceCuanto(fecha: FechaIso, ahora: Date, zona: string = ZONA_HORARIA): string {
  const minutos = Math.floor((ahora.getTime() - new Date(fecha).getTime()) / MINUTO);
  if (minutos < 1) return "recién";
  if (minutos < 60) return `hace ${minutos} min`;
  if (minutos < 24 * 60) return `hace ${Math.floor(minutos / 60)} h`;
  const dia = diaLocal(fecha, zona);
  const dias = diasEntre(dia, diaLocal(ahora, zona));
  if (dias <= 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return `el ${diaCorto(dia)}`;
}

/** Inicial para el avatar: la primera letra o número del nombre, en mayúscula. */
export function inicial(nombre: string): string {
  const letra = /[\p{L}\p{N}]/u.exec(nombre)?.[0];
  return letra ? letra.toLocaleUpperCase("es-AR") : "?";
}

/** Pastilla de una oportunidad según los días que faltan (0 = vence hoy; negativo = vencida). */
export function textoVencimiento(dias: number, fechaLimite: string): string {
  if (dias < 0) return `Venció el ${diaCorto(fechaLimite)}`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `Vence en ${dias} días`;
}

/** "Faltan 3 días" para la misión de la semana; el domingo es el último día. */
export function textoDiasQueFaltan(dias: number): string {
  return dias <= 1 ? "Último día" : `Faltan ${dias} días`;
}
