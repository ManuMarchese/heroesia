// Publicar un aporte (U2): valida con la plantilla del tipo y guarda. La lectura del link es aparte.
import type { Repositorio } from "@/data/repositorio";
import { validarAporte, type AporteNuevo } from "@/domain/aportes";
import { respuestaDeError } from "./resultado";

export const CAMPOS_APORTE = [
  "tipo",
  "link",
  "titulo",
  "porQueSirve",
  "imagenUrl",
  "comoSeUsa",
  "fuente",
  "fechaLimite",
  "queMirar",
] as const;

export type BorradorAporte = Record<(typeof CAMPOS_APORTE)[number], string>;

export type ResultadoPublicar = { ok: true; aporteId: string } | { ok: false; errores: Record<string, string> };

/** Lo que manda el navegador no es confiable: solo se toman los campos conocidos y como texto. */
export function borradorDesde(entrada: unknown): AporteNuevo {
  const objeto = typeof entrada === "object" && entrada !== null ? (entrada as Record<string, unknown>) : {};
  const texto = (campo: (typeof CAMPOS_APORTE)[number]) => {
    const valor = objeto[campo];
    return typeof valor === "string" ? valor : "";
  };
  return {
    tipo: texto("tipo"),
    link: texto("link"),
    titulo: texto("titulo"),
    porQueSirve: texto("porQueSirve"),
    imagenUrl: texto("imagenUrl") || null,
    comoSeUsa: texto("comoSeUsa") || null,
    fuente: texto("fuente") || null,
    fechaLimite: texto("fechaLimite") || null,
    queMirar: texto("queMirar") || null,
  };
}

export async function publicarAporte(repo: Repositorio, entrada: unknown, ahora: Date): Promise<ResultadoPublicar> {
  const valido = validarAporte(borradorDesde(entrada), ahora);
  if (!valido.ok) return { ok: false, errores: valido.errores };
  try {
    const aporte = await repo.publicar(valido.valor);
    return { ok: true, aporteId: aporte.id };
  } catch (error) {
    const respuesta = respuestaDeError(error);
    return { ok: false, errores: { general: respuesta.ok ? respuesta.mensaje : respuesta.error } };
  }
}
