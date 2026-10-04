// El capitán define la misión de su semana (U6, D23): qué acción cuenta y la meta, una sola vez.
import type { Repositorio } from "@/data/repositorio";
import { tituloMision, validarDefinicionMision } from "@/domain/mision";
import { semanaDe } from "@/domain/tiempo";
import { primerError, respuestaDeError, type Respuesta } from "./resultado";

export async function definirMisionSemanal(repo: Repositorio, entrada: unknown, ahora: Date): Promise<Respuesta> {
  const objeto = typeof entrada === "object" && entrada !== null ? (entrada as Record<string, unknown>) : {};
  const semana = semanaDe(ahora);
  try {
    const [miembros, lanzamientoEn, definida] = await Promise.all([
      repo.miembros(),
      repo.lanzamientoEn(),
      repo.misionDefinida(semana),
    ]);
    const valida = validarDefinicionMision(
      { accion: typeof objeto.accion === "string" ? objeto.accion : "", meta: objeto.meta },
      { semana, usuarioId: repo.usuarioId, grupo: { miembros, lanzamientoEn }, definida },
    );
    if (!valida.ok) return { ok: false, error: primerError(valida.errores) };
    await repo.definirMision(semana, valida.valor);
    return { ok: true, mensaje: `Listo: la misión de esta semana es "${tituloMision(valida.valor.accion, valida.valor.meta)}".` };
  } catch (error) {
    return respuestaDeError(error);
  }
}
