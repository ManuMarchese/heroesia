// Nombre visible de cada miembro (U5, D35). Arranca con el prefijo del email y todo el grupo lo ve.
import type { Resultado } from "./tipos";

/** Igual que el check de perfiles.nombre en la migración. */
export const LIMITE_NOMBRE = 40;

export function validarNombre(texto: unknown): Resultado<string> {
  const nombre = typeof texto === "string" ? texto.replace(/[\p{Cc}\p{Cf}]/gu, "").replace(/\s+/g, " ").trim() : "";
  if (!nombre) return { ok: false, errores: { nombre: "Escribí tu nombre." } };
  if (nombre.length > LIMITE_NOMBRE)
    return { ok: false, errores: { nombre: `El nombre puede tener hasta ${LIMITE_NOMBRE} caracteres.` } };
  return { ok: true, valor: nombre };
}
