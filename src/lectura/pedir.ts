// Pedido seguro (Q5 y OWASP): resuelve el DNS y valida todas las IP antes de cada pedido y de cada
// redirección (máximo 3), con plazo total y tope de tamaño. Los tests inyectan resolvedor y transporte.
import { lookup } from "node:dns/promises";
import { esIpBloqueada, esNombreBloqueado } from "./ip";
import type { RespuestaHttp, Transporte } from "./transporte";
import { esSitioQueNoDejaLeer, hostDe, validarUrlParaLeer } from "./url";

export type Resolvedor = (host: string) => Promise<readonly { address: string; family: number }[]>;

export const resolvedorDns: Resolvedor = (host) => lookup(host, { all: true, verbatim: true });

export const MAX_REDIRECCIONES = 3;

export type MotivoLectura =
  | "formato"
  | "bloqueada"
  | "dns"
  | "tiempo"
  | "red"
  | "redirecciones"
  | "estado"
  | "no_html"
  | "terminos"
  | "limite_github"
  | "no_encontrado";

export class ErrorLectura extends Error {
  constructor(readonly motivo: MotivoLectura) {
    super(`Lectura de link: ${motivo}`);
    this.name = "ErrorLectura";
  }
}

/** Espera la promesa, salvo que se venza el plazo: ahí corta con "tiempo" aunque la promesa siga. */
export function conPlazo<T>(promesa: PromiseLike<T>, senal: AbortSignal): Promise<T> {
  if (senal.aborted) return Promise.reject(new ErrorLectura("tiempo"));
  return new Promise<T>((resolver, rechazar) => {
    const cortar = () => rechazar(new ErrorLectura("tiempo"));
    senal.addEventListener("abort", cortar, { once: true });
    Promise.resolve(promesa).then(
      (valor) => {
        senal.removeEventListener("abort", cortar);
        resolver(valor);
      },
      (error: unknown) => {
        senal.removeEventListener("abort", cortar);
        rechazar(error);
      },
    );
  });
}

async function ipValidada(url: URL, resolver: Resolvedor, senal: AbortSignal): Promise<{ address: string; family: number }> {
  const host = hostDe(url);
  if (esNombreBloqueado(host)) throw new ErrorLectura("bloqueada");
  let direcciones: readonly { address: string; family: number }[];
  try {
    direcciones = await conPlazo(resolver(host), senal);
  } catch (error) {
    throw error instanceof ErrorLectura ? error : new ErrorLectura("dns");
  }
  const primera = direcciones[0];
  if (!primera) throw new ErrorLectura("dns");
  // Si alguna de las IP es local o privada, no se pide nada (evita mezclar una pública con una privada).
  if (direcciones.some((d) => esIpBloqueada(d.address))) throw new ErrorLectura("bloqueada");
  return primera;
}

export interface OpcionesPedido {
  resolver: Resolvedor;
  transporte: Transporte;
  senal: AbortSignal;
  encabezados: Readonly<Record<string, string>>;
}

/** GET siguiendo a mano hasta MAX_REDIRECCIONES redirecciones, validando cada destino. */
export async function pedirSeguro(inicial: URL, opciones: OpcionesPedido): Promise<{ url: URL; respuesta: RespuestaHttp }> {
  const { resolver, transporte, senal } = opciones;
  let url = inicial;
  let encabezados = { ...opciones.encabezados };
  for (let salto = 0; ; salto++) {
    const ip = await ipValidada(url, resolver, senal);
    let respuesta: RespuestaHttp;
    try {
      respuesta = await conPlazo(transporte({ url, ip: ip.address, familia: ip.family, encabezados, senal }), senal);
    } catch (error) {
      throw error instanceof ErrorLectura ? error : new ErrorLectura(senal.aborted ? "tiempo" : "red");
    }
    if (respuesta.estado < 300 || respuesta.estado >= 400 || respuesta.estado === 304) return { url, respuesta };

    const destino = respuesta.encabezados.location;
    respuesta.cerrar();
    if (!destino) throw new ErrorLectura("estado");
    if (salto >= MAX_REDIRECCIONES) throw new ErrorLectura("redirecciones");
    let siguiente: URL;
    try {
      siguiente = new URL(destino, url);
    } catch {
      throw new ErrorLectura("formato");
    }
    const validada = validarUrlParaLeer(siguiente.href);
    if (!validada.ok) throw new ErrorLectura(validada.motivo);
    if (esSitioQueNoDejaLeer(validada.url)) throw new ErrorLectura("terminos");
    // Una credencial (el token de GitHub) nunca viaja a otro sitio.
    if (validada.url.origin !== inicial.origin) {
      encabezados = Object.fromEntries(Object.entries(encabezados).filter(([clave]) => clave.toLowerCase() !== "authorization"));
    }
    url = validada.url;
  }
}

/**
 * Lee el cuerpo hasta `tope` bytes (lo demás no se baja) y, si se pide, hasta el fin de <head>,
 * que es donde están el título y la imagen. Respeta el plazo total.
 */
export async function leerCuerpo(
  cuerpo: AsyncIterable<Uint8Array>,
  tope: number,
  senal: AbortSignal,
  hastaFinDeHead: boolean,
): Promise<Buffer> {
  const partes: Buffer[] = [];
  let total = 0;
  const iterador = cuerpo[Symbol.asyncIterator]();
  try {
    for (;;) {
      const paso = await conPlazo(iterador.next(), senal);
      if (paso.done) break;
      const parte = Buffer.from(paso.value.buffer, paso.value.byteOffset, paso.value.byteLength);
      const resto = tope - total;
      partes.push(parte.length > resto ? parte.subarray(0, resto) : parte);
      total += Math.min(parte.length, resto);
      if (total >= tope) break;
      if (hastaFinDeHead && /<\/head\s*>/i.test(parte.toString("latin1"))) break;
    }
  } finally {
    // Corta la descarga sin esperar: el resto del cuerpo no se baja.
    Promise.resolve(iterador.return?.()).catch(() => undefined);
  }
  return Buffer.concat(partes);
}
