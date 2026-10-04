// Pedido HTTP o HTTPS a una IP ya validada: el DNS no se vuelve a consultar (sin "DNS rebinding").
// No sigue redirecciones (las valida pedir.ts) y no usa el agente global ni proxies.
import http, { type IncomingMessage } from "node:http";
import https from "node:https";
import { isIP, type LookupFunction } from "node:net";
import { pipeline, type Readable } from "node:stream";
import zlib from "node:zlib";
import { hostDe } from "./url";

export interface PedidoHttp {
  url: URL;
  /** La IP validada a la que se conecta (el nombre solo viaja en Host y en el SNI de TLS). */
  ip: string;
  familia: number;
  encabezados: Readonly<Record<string, string>>;
  senal: AbortSignal;
}

export interface RespuestaHttp {
  estado: number;
  /** Encabezados en minúscula. */
  encabezados: Readonly<Record<string, string | undefined>>;
  /** Cuerpo ya descomprimido (gzip, deflate o br). */
  cuerpo: AsyncIterable<Uint8Array>;
  cerrar(): void;
}

export type Transporte = (pedido: PedidoHttp) => Promise<RespuestaHttp>;

/** Sin datos por el socket durante este tiempo, se corta. */
export const PLAZO_SOCKET_MS = 5000;

function descomprimir(respuesta: IncomingMessage): Readable {
  const codificacion = (respuesta.headers["content-encoding"] ?? "").trim().toLowerCase();
  const descompresor =
    codificacion === "gzip" || codificacion === "x-gzip"
      ? zlib.createGunzip()
      : codificacion === "deflate"
        ? zlib.createInflate()
        : codificacion === "br"
          ? zlib.createBrotliDecompress()
          : null;
  if (!descompresor) return respuesta;
  return pipeline(respuesta, descompresor, () => undefined);
}

function aplanar(encabezados: IncomingMessage["headers"]): Record<string, string | undefined> {
  const planos: Record<string, string | undefined> = {};
  for (const [clave, valor] of Object.entries(encabezados)) planos[clave] = Array.isArray(valor) ? valor.join(", ") : valor;
  return planos;
}

export const transporteNode: Transporte = ({ url, ip, familia, encabezados, senal }) =>
  new Promise((resolver, rechazar) => {
    const segura = url.protocol === "https:";
    const host = hostDe(url);
    // Node pide la IP a esta función en lugar de al DNS: siempre devuelve la que ya se validó.
    const fijarIp: LookupFunction = (_nombre, opciones, listo) => {
      if (opciones.all) listo(null, [{ address: ip, family: familia }]);
      else listo(null, ip, familia);
    };
    const pedido = (segura ? https : http).request(
      {
        host,
        port: url.port ? Number(url.port) : segura ? 443 : 80,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: { ...encabezados },
        agent: false,
        lookup: fijarIp,
        signal: senal,
        timeout: PLAZO_SOCKET_MS,
        ...(segura && isIP(host) === 0 ? { servername: host } : {}),
      },
      (respuesta) => {
        const cuerpo = descomprimir(respuesta);
        // Un corte (plazo vencido, tope de tamaño) no puede tirar el proceso: el error lo ve quien lee.
        respuesta.on("error", () => undefined);
        cuerpo.on("error", () => undefined);
        resolver({
          estado: respuesta.statusCode ?? 0,
          encabezados: aplanar(respuesta.headers),
          cuerpo,
          cerrar: () => {
            cuerpo.destroy();
            respuesta.destroy();
          },
        });
      },
    );
    pedido.on("timeout", () => pedido.destroy(new Error("Sin respuesta a tiempo")));
    pedido.on("error", rechazar);
    pedido.end();
  });
