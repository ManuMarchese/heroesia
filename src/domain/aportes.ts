// Plantillas de aporte (base común + campos por tipo, D5) y reglas de las acciones (U3).
import { diaLocal, diasEntre, esDiaValido } from "./tiempo";
import { TIPOS_APORTE, type Aporte, type Accion, type Resultado, type TipoAccion, type TipoAporte } from "./tipos";

export const ETIQUETA_TIPO: Record<TipoAporte, string> = {
  skill: "Skill",
  repo: "Repo",
  noticia: "Noticia",
  oportunidad: "Oportunidad",
  proyecto: "Proyecto",
  tecnologia: "Tecnología",
};

/** Cada tipo tiene una sola acción. */
export const ACCION_DEL_TIPO: Record<TipoAporte, TipoAccion> = {
  skill: "probar",
  repo: "probar",
  noticia: "leer",
  oportunidad: "interes",
  proyecto: "feedback",
  tecnologia: "probar",
};

export const ETIQUETA_ACCION: Record<TipoAccion, string> = {
  probar: "Lo probé",
  leer: "Lo leí",
  interes: "Me interesa",
  feedback: "Dar feedback",
};

export const LIMITES = {
  link: 2048,
  titulo: 140,
  porQueSirve: 200,
  comoSeUsa: 500,
  fuente: 100,
  queMirar: 300,
  resultado: 200,
  feedback: 1000,
  minimoTexto: 3,
} as const;

export interface AporteNuevo {
  tipo: string;
  link: string;
  titulo: string;
  porQueSirve: string;
  imagenUrl?: string | null;
  comoSeUsa?: string | null;
  fuente?: string | null;
  fechaLimite?: string | null;
  queMirar?: string | null;
}

export type AporteValido = Omit<Aporte, "id" | "autorId" | "creadoEn">;

const unaLinea = (texto: string | null | undefined) => (texto ?? "").replace(/\s+/g, " ").trim();
const opcional = (texto: string | null | undefined) => (texto ?? "").trim() || null;

export function esLinkWeb(texto: string): boolean {
  if (texto.length > LIMITES.link) return false;
  try {
    const url = new URL(texto);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/** La fuente de una noticia: el sitio del link, sin "www.". */
export function fuenteDeLink(link: string): string | null {
  try {
    return new URL(link).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

export function esTipoAporte(valor: string): valor is TipoAporte {
  return (TIPOS_APORTE as readonly string[]).includes(valor);
}

export function validarAporte(entrada: AporteNuevo, ahora: Date = new Date()): Resultado<AporteValido> {
  const errores: Record<string, string> = {};
  const tipo = entrada.tipo;
  if (!esTipoAporte(tipo)) errores.tipo = "Elegí un tipo: Skill, Repo, Noticia, Oportunidad o Proyecto.";

  const link = (entrada.link ?? "").trim();
  if (!link) errores.link = "Pegá el link.";
  else if (!esLinkWeb(link)) errores.link = "El link tiene que empezar con http:// o https://.";

  const titulo = unaLinea(entrada.titulo);
  if (!titulo) errores.titulo = "Escribí un título.";
  else if (titulo.length > LIMITES.titulo) errores.titulo = `El título puede tener hasta ${LIMITES.titulo} caracteres.`;

  const imagenUrl = opcional(entrada.imagenUrl);
  if (imagenUrl && !esLinkWeb(imagenUrl)) errores.imagenUrl = "La imagen tiene que ser un link http:// o https://.";

  const porQueSirve = unaLinea(entrada.porQueSirve);
  if (!porQueSirve) errores.porQueSirve = "Contá en una línea por qué sirve.";
  else if (porQueSirve.length > LIMITES.porQueSirve)
    errores.porQueSirve = `Por qué sirve: hasta ${LIMITES.porQueSirve} caracteres.`;

  const comoSeUsa = tipo === "skill" || tipo === "tecnologia" ? opcional(entrada.comoSeUsa) : null;
  if (comoSeUsa && comoSeUsa.length > LIMITES.comoSeUsa)
    errores.comoSeUsa = `Cómo se usa: hasta ${LIMITES.comoSeUsa} caracteres.`;

  const fuente = tipo === "noticia" ? unaLinea(entrada.fuente) || fuenteDeLink(link) : null;
  if (fuente && fuente.length > LIMITES.fuente) errores.fuente = `La fuente puede tener hasta ${LIMITES.fuente} caracteres.`;

  let fechaLimite: string | null = null;
  if (tipo === "oportunidad") {
    fechaLimite = (entrada.fechaLimite ?? "").trim() || null;
    if (!fechaLimite) errores.fechaLimite = "Poné la fecha límite.";
    else if (!esDiaValido(fechaLimite)) errores.fechaLimite = "La fecha límite no es válida.";
    else if (fechaLimite < diaLocal(ahora)) errores.fechaLimite = "La fecha límite ya pasó.";
  }

  const queMirar = tipo === "proyecto" ? opcional(entrada.queMirar) : null;
  if (tipo === "proyecto" && !queMirar) errores.queMirar = "Contá qué querés que miren.";
  else if (queMirar && queMirar.length > LIMITES.queMirar)
    errores.queMirar = `Qué querés que miren: hasta ${LIMITES.queMirar} caracteres.`;

  if (Object.keys(errores).length > 0 || !esTipoAporte(tipo)) return { ok: false, errores };
  return {
    ok: true,
    valor: { tipo, link, titulo, imagenUrl, porQueSirve, comoSeUsa, fuente, fechaLimite, queMirar },
  };
}

/** Oportunidad vencida (se muestra atenuada): la fecha límite ya pasó en la zona del grupo. */
export function estaVencida(fechaLimite: string, ahora: Date): boolean {
  return fechaLimite < diaLocal(ahora);
}

/** Días hasta la fecha límite: 0 = vence hoy; negativo = vencida. */
export function diasParaVencer(fechaLimite: string, ahora: Date): number {
  return diasEntre(diaLocal(ahora), fechaLimite);
}

export interface AccionNueva {
  tipo: string;
  resultado?: string | null;
  texto?: string | null;
}

export type AccionValida = Pick<Accion, "tipo" | "resultado" | "texto">;

export function validarAccion(
  entrada: AccionNueva,
  aporte: Pick<Aporte, "tipo" | "autorId">,
  usuarioId: string,
): Resultado<AccionValida> {
  const esperada = ACCION_DEL_TIPO[aporte.tipo];
  if (entrada.tipo !== esperada) return { ok: false, errores: { tipo: "Esta acción no corresponde a este aporte." } };
  if (aporte.autorId === usuarioId) return { ok: false, errores: { tipo: "No podés reaccionar a tu propio aporte." } };

  if (esperada === "probar") {
    const resultado = unaLinea(entrada.resultado);
    if (resultado.length < LIMITES.minimoTexto)
      return { ok: false, errores: { resultado: "Contá en una línea qué resultado te dio." } };
    if (resultado.length > LIMITES.resultado)
      return { ok: false, errores: { resultado: `El resultado puede tener hasta ${LIMITES.resultado} caracteres.` } };
    return { ok: true, valor: { tipo: esperada, resultado, texto: null } };
  }
  if (esperada === "feedback") {
    const texto = (entrada.texto ?? "").trim();
    if (texto.length < LIMITES.minimoTexto) return { ok: false, errores: { texto: "Escribí tu feedback." } };
    if (texto.length > LIMITES.feedback)
      return { ok: false, errores: { texto: `El feedback puede tener hasta ${LIMITES.feedback} caracteres.` } };
    return { ok: true, valor: { tipo: esperada, resultado: null, texto } };
  }
  return { ok: true, valor: { tipo: esperada, resultado: null, texto: null } };
}

/** Solo el autor del proyecto marca un feedback como útil, y una sola vez. */
export function validarMarcaUtil(
  accion: Pick<Accion, "tipo" | "util">,
  aporte: Pick<Aporte, "tipo" | "autorId">,
  usuarioId: string,
): Resultado<true> {
  if (accion.tipo !== "feedback" || aporte.tipo !== "proyecto")
    return { ok: false, errores: { util: "Solo se marca como útil un feedback de un proyecto." } };
  if (aporte.autorId !== usuarioId)
    return { ok: false, errores: { util: "Solo el autor del proyecto marca un feedback como útil." } };
  if (accion.util) return { ok: false, errores: { util: "Ese feedback ya está marcado como útil." } };
  return { ok: true, valor: true };
}

/** "3 lo probaron", "1 lo leyó", "a 2 les interesa", "1 feedback". */
export function pruebaSocial(tipo: TipoAccion, cantidad: number): string {
  const uno = cantidad === 1;
  switch (tipo) {
    case "probar":
      return uno ? "1 lo probó" : `${cantidad} lo probaron`;
    case "leer":
      return uno ? "1 lo leyó" : `${cantidad} lo leyeron`;
    case "interes":
      return uno ? "A 1 le interesa" : `A ${cantidad} les interesa`;
    case "feedback":
      return uno ? "1 feedback" : `${cantidad} feedbacks`;
  }
}
