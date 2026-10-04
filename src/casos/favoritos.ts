// Favoritos privados en carpetas propias (D43): crear, renombrar y borrar carpetas; guardar, mover y quitar aportes.
import { ErrorDatos } from "@/data/errores";
import type { Repositorio } from "@/data/repositorio";
import { validarNombreCarpeta } from "@/domain/carpetas";
import { primerError, respuestaDeError, type Respuesta } from "./resultado";

const texto = (entrada: unknown, campo: string): string => {
  const valor = typeof entrada === "object" && entrada !== null ? (entrada as Record<string, unknown>)[campo] : null;
  return typeof valor === "string" ? valor : "";
};

async function conErrores(accion: () => Promise<string>): Promise<Respuesta> {
  try {
    return { ok: true, mensaje: await accion() };
  } catch (error) {
    return respuestaDeError(error);
  }
}

/** Guarda el aporte en una carpeta que ya existe; si ya estaba guardado, lo mueve. */
export async function guardarEnCarpeta(repo: Repositorio, entrada: unknown): Promise<Respuesta> {
  const aporteId = texto(entrada, "aporteId");
  const carpetaId = texto(entrada, "carpetaId");
  if (!aporteId || !carpetaId) return { ok: false, error: "Elegí una carpeta." };
  return conErrores(async () => {
    await repo.guardarFavorito(aporteId, carpetaId);
    return "Guardado en favoritos.";
  });
}

/** Crea la carpeta y guarda el aporte adentro, en un solo paso. */
export async function guardarEnCarpetaNueva(repo: Repositorio, entrada: unknown): Promise<Respuesta> {
  const aporteId = texto(entrada, "aporteId");
  if (!aporteId) return { ok: false, error: "No encontramos ese aporte." };
  return conErrores(async () => {
    const valido = validarNombreCarpeta(texto(entrada, "nombre"), await repo.carpetas());
    if (!valido.ok) throw new ErrorDatos("invalido", primerError(valido.errores));
    const carpeta = await repo.crearCarpeta(valido.valor);
    await repo.guardarFavorito(aporteId, carpeta.id);
    return `Guardado en la carpeta nueva "${carpeta.nombre}".`;
  });
}

export async function quitarDeFavoritos(repo: Repositorio, aporteId: unknown): Promise<Respuesta> {
  if (typeof aporteId !== "string" || aporteId === "") return { ok: false, error: "No encontramos ese aporte." };
  return conErrores(async () => {
    await repo.quitarFavorito(aporteId);
    return "Quitado de favoritos.";
  });
}

export async function crearCarpetaNueva(repo: Repositorio, nombre: unknown): Promise<Respuesta> {
  return conErrores(async () => {
    const valido = validarNombreCarpeta(nombre, await repo.carpetas());
    if (!valido.ok) throw new ErrorDatos("invalido", primerError(valido.errores));
    const carpeta = await repo.crearCarpeta(valido.valor);
    return `Carpeta "${carpeta.nombre}" creada.`;
  });
}

export async function renombrarMiCarpeta(repo: Repositorio, entrada: unknown): Promise<Respuesta> {
  const id = texto(entrada, "carpetaId");
  return conErrores(async () => {
    const valido = validarNombreCarpeta(texto(entrada, "nombre"), await repo.carpetas(), id);
    if (!valido.ok) throw new ErrorDatos("invalido", primerError(valido.errores));
    await repo.renombrarCarpeta(id, valido.valor);
    return "Carpeta renombrada.";
  });
}

export async function borrarMiCarpeta(repo: Repositorio, carpetaId: unknown): Promise<Respuesta> {
  if (typeof carpetaId !== "string" || carpetaId === "") return { ok: false, error: "No encontramos esa carpeta." };
  return conErrores(async () => {
    await repo.borrarCarpeta(carpetaId);
    return "Carpeta borrada. Lo que había adentro ya no está en favoritos.";
  });
}
