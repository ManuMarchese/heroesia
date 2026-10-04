// Errores de la capa de datos con un mensaje listo para mostrar.

export type CodigoErrorDatos = "no_permitido" | "duplicado" | "invalido" | "no_encontrado" | "desconocido";

const MENSAJES: Record<CodigoErrorDatos, string> = {
  no_permitido: "No tenés permiso para hacer eso.",
  duplicado: "Eso ya está registrado.",
  invalido: "Algún dato no es válido. Revisalo y probá de nuevo.",
  no_encontrado: "No encontramos eso. Puede que lo hayan borrado.",
  desconocido: "No pudimos guardar. Probá de nuevo en un rato.",
};

export class ErrorDatos extends Error {
  constructor(
    readonly codigo: CodigoErrorDatos,
    mensaje: string = MENSAJES[codigo],
  ) {
    super(mensaje);
    this.name = "ErrorDatos";
  }
}

/**
 * Traduce un error de Postgres por su SQLSTATE: 42501 = RLS o falta de permiso, 23505 = duplicado,
 * 23514 / 23502 / 22xxx = dato inválido (códigos comprobados con PGlite en supabase/pruebas).
 */
export function traducirErrorPostgres(error: { code?: string; message?: string }): ErrorDatos {
  const codigo = error.code ?? "";
  if (codigo === "42501") return new ErrorDatos("no_permitido");
  if (codigo === "23505") return new ErrorDatos("duplicado");
  if (codigo === "23514" || codigo === "23502" || codigo === "23503" || codigo.startsWith("22")) {
    return new ErrorDatos("invalido");
  }
  return new ErrorDatos("desconocido");
}
