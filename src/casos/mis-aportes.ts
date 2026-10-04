// Editar y borrar un aporte propio (D43). Solo su autor: lo exige la base (RLS) y acá se avisa con un mensaje claro.
import type { Repositorio } from "@/data/repositorio";
import { validarAporte } from "@/domain/aportes";
import { borradorDesde } from "./publicar";
import { respuestaDeError, type Respuesta } from "./resultado";

export type ResultadoEditar = { ok: true; aporteId: string } | { ok: false; errores: Record<string, string> };

const NO_ENCONTRADO = "No encontramos ese aporte. Puede que lo hayan borrado.";
const NO_ES_TUYO = "Solo quien publicó un aporte puede editarlo o borrarlo.";

const idDe = (entrada: unknown): string => {
  const valor = typeof entrada === "object" && entrada !== null ? (entrada as Record<string, unknown>).aporteId : entrada;
  return typeof valor === "string" ? valor : "";
};

/** El tipo no se cambia: se valida con el tipo que ya tiene el aporte. */
export async function editarMiAporte(repo: Repositorio, entrada: unknown, ahora: Date): Promise<ResultadoEditar> {
  const id = idDe(entrada);
  try {
    const aporte = id ? await repo.aporte(id) : null;
    if (!aporte) return { ok: false, errores: { general: NO_ENCONTRADO } };
    if (aporte.autorId !== repo.usuarioId) return { ok: false, errores: { general: NO_ES_TUYO } };
    const valido = validarAporte({ ...borradorDesde(entrada), tipo: aporte.tipo }, ahora);
    if (!valido.ok) return { ok: false, errores: valido.errores };
    await repo.editarAporte(id, valido.valor);
    return { ok: true, aporteId: id };
  } catch (error) {
    const respuesta = respuestaDeError(error);
    return { ok: false, errores: { general: respuesta.ok ? respuesta.mensaje : respuesta.error } };
  }
}

export async function borrarMiAporte(repo: Repositorio, aporteId: unknown): Promise<Respuesta> {
  const id = idDe(aporteId);
  try {
    const aporte = id ? await repo.aporte(id) : null;
    if (!aporte) return { ok: false, error: NO_ENCONTRADO };
    if (aporte.autorId !== repo.usuarioId) return { ok: false, error: NO_ES_TUYO };
    await repo.borrarAporte(id);
    return { ok: true, mensaje: "Aporte borrado." };
  } catch (error) {
    return respuestaDeError(error);
  }
}
