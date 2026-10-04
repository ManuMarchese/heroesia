// Solo para tests: un DNS falso y un transporte falso que anota cada pedido. Sin red.
import type { Resolvedor } from "./pedir";
import type { PedidoHttp, RespuestaHttp, Transporte } from "./transporte";

export function resolvedorFalso(tabla: Record<string, readonly string[]>): Resolvedor & { consultas: string[] } {
  const consultas: string[] = [];
  const resolver = async (host: string) => {
    consultas.push(host);
    const ips = tabla[host];
    if (!ips) throw Object.assign(new Error(`getaddrinfo ENOTFOUND ${host}`), { code: "ENOTFOUND" });
    return ips.map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
  };
  return Object.assign(resolver, { consultas });
}

export interface RespuestaFalsa {
  estado?: number;
  encabezados?: Record<string, string>;
  cuerpo?: string | AsyncIterable<Uint8Array>;
}

const HTML = { "content-type": "text/html; charset=utf-8" };

async function* unaParte(texto: string): AsyncGenerator<Uint8Array> {
  yield Buffer.from(texto);
}

/** Responde según `guion`; si devuelve una promesa que nunca termina, simula un servidor colgado. */
export function transporteFalso(guion: (pedido: PedidoHttp, numero: number) => RespuestaFalsa | Promise<RespuestaFalsa>) {
  const pedidos: PedidoHttp[] = [];
  let cerradas = 0;
  const transporte: Transporte = async (pedido) => {
    pedidos.push(pedido);
    const r = await guion(pedido, pedidos.length);
    const cuerpo = typeof r.cuerpo === "string" || r.cuerpo === undefined ? unaParte(r.cuerpo ?? "") : r.cuerpo;
    const respuesta: RespuestaHttp = {
      estado: r.estado ?? 200,
      encabezados: r.encabezados ?? HTML,
      cuerpo,
      cerrar: () => {
        cerradas += 1;
      },
    };
    return respuesta;
  };
  return { transporte, pedidos, cerradas: () => cerradas };
}

export const pagina = (head: string): RespuestaFalsa => ({ cuerpo: `<!doctype html><html><head>${head}</head><body></body></html>` });

export const redireccion = (destino: string, estado = 302): RespuestaFalsa => ({ estado, encabezados: { location: destino } });

/** Un cuerpo sin fin: cuenta cuánto se llegó a bajar. */
export function cuerpoInfinito(primera: string, tamanoParte = 65_536) {
  const leido = { bytes: 0 };
  async function* generar(): AsyncGenerator<Uint8Array> {
    const inicio = Buffer.from(primera);
    leido.bytes += inicio.length;
    yield inicio;
    const relleno = Buffer.alloc(tamanoParte, "a");
    for (;;) {
      leido.bytes += relleno.length;
      yield relleno;
    }
  }
  return { cuerpo: generar(), leido };
}

/** Un cuerpo que manda algo y después se cuelga. */
export async function* cuerpoColgado(primera: string): AsyncGenerator<Uint8Array> {
  yield Buffer.from(primera);
  await new Promise(() => undefined);
}
