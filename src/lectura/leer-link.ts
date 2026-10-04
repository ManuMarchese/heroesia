// Leer título e imagen de un link (U2, D13). Si falla o el sitio no deja, la persona completa a mano:
// nunca traba la publicación. Devuelve solo título, imagen (http o https) y fuente.
import { fuenteDeLink, LIMITES } from "@/domain/aportes";
import type { TipoAporte } from "@/domain/tipos";
import { datosDeRepo, encabezadosGithub, esLimiteAgotado, repoDeGithub, urlApiRepo, type RepoGithub } from "./github";
import { decodificar, extraerMeta, limpiar, recortar } from "./html";
import { ErrorLectura, leerCuerpo, pedirSeguro, resolvedorDns, type MotivoLectura, type Resolvedor } from "./pedir";
import { transporteNode, type Transporte } from "./transporte";
import { esSitioQueNoDejaLeer, imagenSegura, validarUrlParaLeer } from "./url";

export const USER_AGENT = "HeroesIA/0.1 (lector de links de un grupo privado)";
/** Plazo total para leer un link, con redirecciones incluidas. */
export const PLAZO_TOTAL_MS = 8000;
/** Tope de lo que se baja de cada respuesta (después de descomprimir). */
export const TOPE_BYTES = 1_048_576;

export type Lectura =
  | { ok: true; titulo: string | null; imagenUrl: string | null; fuente: string | null; tipoSugerido: TipoAporte | null }
  | { ok: false; motivo: string; fuente: string | null };

export const MENSAJES: Record<MotivoLectura, string> = {
  formato: "Ese link no se puede leer: tiene que empezar con http:// o https://.",
  bloqueada: "Ese link apunta a una dirección local o privada: no lo leemos. Completá los datos a mano.",
  dns: "No encontramos ese sitio. Revisá el link o completá los datos a mano.",
  tiempo: "El sitio tardó demasiado en responder. Completá los datos a mano.",
  red: "No pudimos leer el link. Completá los datos a mano.",
  redirecciones: "El link redirige demasiadas veces. Completá los datos a mano.",
  estado: "El sitio no devolvió la página. Completá los datos a mano.",
  no_html: "Ese link no es una página web (por ejemplo, un PDF). Completá los datos a mano.",
  terminos: "X y LinkedIn no dejan leer sus links desde un servidor. Completá los datos a mano.",
  limite_github: "GitHub no deja leer más repos por ahora (límite de su API). Completá los datos a mano.",
  no_encontrado: "GitHub no encuentra ese repo (¿es privado?). Completá los datos a mano.",
};

/** Dependencias que los tests reemplazan. En la app siempre son el DNS y el transporte reales. */
export interface DependenciasLectura {
  resolver?: Resolvedor;
  transporte?: Transporte;
  tokenGithub?: string | null;
  plazoMs?: number;
}

interface Contexto {
  resolver: Resolvedor;
  transporte: Transporte;
  senal: AbortSignal;
}

async function leerPagina(url: URL, ctx: Contexto): Promise<Lectura> {
  const encabezados = {
    "user-agent": USER_AGENT,
    accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
    "accept-language": "es-AR,es;q=0.9,en;q=0.8",
    "accept-encoding": "gzip, deflate, br",
  };
  const { url: final, respuesta } = await pedirSeguro(url, { ...ctx, encabezados });
  try {
    if (respuesta.estado < 200 || respuesta.estado >= 300) throw new ErrorLectura("estado");
    const tipo = respuesta.encabezados["content-type"];
    if (!/^\s*(text\/html|application\/xhtml\+xml)\b/i.test(tipo ?? "")) throw new ErrorLectura("no_html");
    const meta = extraerMeta(decodificar(await leerCuerpo(respuesta.cuerpo, TOPE_BYTES, ctx.senal, true), tipo));
    const sitio = meta.sitio ?? fuenteDeLink(final.href);
    return {
      ok: true,
      titulo: meta.titulo ? recortar(meta.titulo, LIMITES.titulo) : null,
      imagenUrl: imagenSegura(meta.imagen, final),
      fuente: sitio ? recortar(sitio, LIMITES.fuente) : null,
      tipoSugerido: null,
    };
  } finally {
    respuesta.cerrar();
  }
}

async function leerRepo(repo: RepoGithub, token: string | null, ctx: Contexto): Promise<Lectura> {
  const api = urlApiRepo(repo);
  const { respuesta } = await pedirSeguro(api, { ...ctx, encabezados: encabezadosGithub(USER_AGENT, token) });
  try {
    if (esLimiteAgotado(respuesta.estado, respuesta.encabezados)) throw new ErrorLectura("limite_github");
    if (respuesta.estado === 404) throw new ErrorLectura("no_encontrado");
    if (respuesta.estado !== 200) throw new ErrorLectura("estado");
    const cuerpo = await leerCuerpo(respuesta.cuerpo, TOPE_BYTES, ctx.senal, false);
    let json: unknown;
    try {
      json = JSON.parse(cuerpo.toString("utf8"));
    } catch {
      throw new ErrorLectura("red");
    }
    const datos = datosDeRepo(json, repo);
    const descripcion = limpiar(datos.descripcion);
    return {
      ok: true,
      titulo: recortar(descripcion ? `${datos.nombre}: ${descripcion}` : datos.nombre, LIMITES.titulo),
      imagenUrl: imagenSegura(datos.avatar, api),
      fuente: "github.com",
      tipoSugerido: "repo",
    };
  } finally {
    respuesta.cerrar();
  }
}

export async function leerLink(link: string, dependencias: DependenciasLectura = {}): Promise<Lectura> {
  const validada = validarUrlParaLeer(link.trim());
  if (!validada.ok) return { ok: false, motivo: MENSAJES[validada.motivo], fuente: null };
  const url = validada.url;
  const fuente = fuenteDeLink(url.href);
  if (esSitioQueNoDejaLeer(url)) return { ok: false, motivo: MENSAJES.terminos, fuente };

  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), dependencias.plazoMs ?? PLAZO_TOTAL_MS);
  const ctx: Contexto = {
    resolver: dependencias.resolver ?? resolvedorDns,
    transporte: dependencias.transporte ?? transporteNode,
    senal: control.signal,
  };
  try {
    const repo = repoDeGithub(url);
    return repo ? await leerRepo(repo, dependencias.tokenGithub ?? null, ctx) : await leerPagina(url, ctx);
  } catch (error) {
    const motivo: MotivoLectura = error instanceof ErrorLectura ? error.motivo : control.signal.aborted ? "tiempo" : "red";
    return { ok: false, motivo: MENSAJES[motivo], fuente };
  } finally {
    clearTimeout(reloj);
    control.abort();
  }
}
