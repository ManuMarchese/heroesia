// Respuesta de las acciones de las pantallas: un mensaje para mostrar o un error, sin datos crudos.
import { ErrorDatos } from "@/data/errores";

export type Respuesta = { ok: true; mensaje: string } | { ok: false; error: string };

export const MENSAJE_FALLA = "No pudimos guardar. Probá de nuevo en un rato.";

export function primerError(errores: Record<string, string>): string {
  return Object.values(errores)[0] ?? MENSAJE_FALLA;
}

/** Los errores conocidos de la capa de datos ya traen su mensaje; los demás se anotan y se resumen. */
export function respuestaDeError(error: unknown): Respuesta {
  if (error instanceof ErrorDatos) return { ok: false, error: error.message };
  console.error(error);
  return { ok: false, error: MENSAJE_FALLA };
}
