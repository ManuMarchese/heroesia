// Acciones sobre un aporte (U3): Lo probé (con resultado), Lo leí, Me interesa y Dar feedback; y la marca
// de feedback útil que pone el autor del proyecto. Nadie reacciona a lo propio (también lo exige la base).
import type { Repositorio } from "@/data/repositorio";
import { ETIQUETA_ACCION, validarAccion } from "@/domain/aportes";
import type { TipoAccion } from "@/domain/tipos";
import { asignarXp, motivoDeAccion } from "@/domain/xp";
import { XP_POR_MOTIVO } from "@/domain/xp-config";
import { primerError, respuestaDeError, type Respuesta } from "./resultado";

const texto = (objeto: Record<string, unknown>, campo: string) => {
  const valor = objeto[campo];
  return typeof valor === "string" ? valor : null;
};

const NO_ENCONTRADO: Respuesta = { ok: false, error: "No encontramos ese aporte. Puede que lo hayan borrado." };

/** Qué se le dice a quien acaba de hacer la acción, con el XP que realmente sumó (después de los topes). */
async function mensajeDeXp(repo: Repositorio, aporteId: string, tipo: TipoAccion): Promise<string> {
  const motivo = motivoDeAccion(tipo);
  if (tipo === "interes") return "Anotado: te interesa. Me interesa no da XP.";
  if (!motivo) return `Enviado. Si el autor lo marca útil, sumás ${XP_POR_MOTIVO.feedback_util.xp} XP.`;
  const xp = asignarXp(await repo.eventosXp())
    .filter((e) => e.perfilId === repo.usuarioId && e.motivo === motivo && e.aporteId === aporteId)
    .reduce((suma, e) => suma + e.xp, 0);
  if (xp > 0) return `¡Listo! Sumaste ${xp} XP.`;
  return `Listo. Hoy ya llegaste al tope de XP por "${ETIQUETA_ACCION[tipo]}": esta queda anotada, sin XP.`;
}

export async function registrarAccion(repo: Repositorio, entrada: unknown): Promise<Respuesta> {
  const objeto = typeof entrada === "object" && entrada !== null ? (entrada as Record<string, unknown>) : {};
  const aporteId = texto(objeto, "aporteId");
  if (!aporteId) return NO_ENCONTRADO;
  try {
    const aporte = await repo.aporte(aporteId);
    if (!aporte) return NO_ENCONTRADO;
    const valida = validarAccion(
      { tipo: texto(objeto, "tipo") ?? "", resultado: texto(objeto, "resultado"), texto: texto(objeto, "texto") },
      aporte,
      repo.usuarioId,
    );
    if (!valida.ok) return { ok: false, error: primerError(valida.errores) };
    await repo.accionar(aporteId, valida.valor);
    return { ok: true, mensaje: await mensajeDeXp(repo, aporteId, valida.valor.tipo) };
  } catch (error) {
    return respuestaDeError(error);
  }
}

/** Solo el autor del proyecto marca un feedback como útil, una vez (lo exige la base con RLS). */
export async function marcarFeedbackUtil(repo: Repositorio, accionId: unknown): Promise<Respuesta> {
  if (typeof accionId !== "string" || accionId === "") return { ok: false, error: "No encontramos ese feedback." };
  try {
    await repo.marcarUtil(accionId);
    return { ok: true, mensaje: "Marcado como útil: le suma XP a quien te lo dio." };
  } catch (error) {
    return respuestaDeError(error);
  }
}
