// Carpetas de favoritos (D43): nombre de hasta 40 caracteres, sin repetir (sin distinguir mayúsculas).
import type { Resultado } from "./tipos";

/** Igual que el check de carpetas.nombre en la migración 0006. */
export const LIMITE_CARPETA = 40;

/** `existentes` son las carpetas de la persona; `excepto` es la que se está renombrando. */
export function validarNombreCarpeta(
  texto: unknown,
  existentes: readonly { id: string; nombre: string }[] = [],
  excepto?: string,
): Resultado<string> {
  const nombre = typeof texto === "string" ? texto.replace(/[\p{Cc}\p{Cf}]/gu, "").replace(/\s+/g, " ").trim() : "";
  if (!nombre) return { ok: false, errores: { nombre: "Escribí un nombre para la carpeta." } };
  if (nombre.length > LIMITE_CARPETA) {
    return { ok: false, errores: { nombre: `El nombre puede tener hasta ${LIMITE_CARPETA} caracteres.` } };
  }
  const repetida = existentes.some((c) => c.id !== excepto && c.nombre.toLowerCase() === nombre.toLowerCase());
  if (repetida) return { ok: false, errores: { nombre: "Ya tenés una carpeta con ese nombre." } };
  return { ok: true, valor: nombre };
}
