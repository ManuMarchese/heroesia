// Cambiar el nombre que ve el grupo (U5, D35).
import type { Repositorio } from "@/data/repositorio";
import { validarNombre } from "@/domain/perfil";
import { primerError, respuestaDeError, type Respuesta } from "./resultado";

export async function guardarNombre(repo: Repositorio, texto: unknown): Promise<Respuesta> {
  const valido = validarNombre(texto);
  if (!valido.ok) return { ok: false, error: primerError(valido.errores) };
  try {
    await repo.cambiarNombre(valido.valor);
    return { ok: true, mensaje: `Listo: el grupo te ve como ${valido.valor}.` };
  } catch (error) {
    return respuestaDeError(error);
  }
}
