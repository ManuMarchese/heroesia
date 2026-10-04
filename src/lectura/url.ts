// Qué links se pueden leer desde el servidor: solo http y https, sin usuario ni clave, puertos 80 y 443,
// y nunca localhost. La IP real se valida después de resolver el DNS (pedir.ts).
import { isIPv4, isIPv6 } from "node:net";
import { esIpBloqueada, esNombreBloqueado } from "./ip";

export const LARGO_MAXIMO_URL = 2048;

export type MotivoUrl = "formato" | "bloqueada";

/** El hostname sin los corchetes de una IPv6 literal. */
export function hostDe(url: URL): string {
  return url.hostname.replace(/^\[|\]$/g, "");
}

export function validarUrlParaLeer(texto: string): { ok: true; url: URL } | { ok: false; motivo: MotivoUrl } {
  if (texto.length === 0 || texto.length > LARGO_MAXIMO_URL) return { ok: false, motivo: "formato" };
  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    return { ok: false, motivo: "formato" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, motivo: "formato" };
  if (url.username || url.password) return { ok: false, motivo: "bloqueada" };
  if (url.port !== "" && url.port !== "80" && url.port !== "443") return { ok: false, motivo: "bloqueada" };
  const host = hostDe(url);
  if (esNombreBloqueado(host)) return { ok: false, motivo: "bloqueada" };
  if ((isIPv4(host) || isIPv6(host)) && esIpBloqueada(host)) return { ok: false, motivo: "bloqueada" };
  return { ok: true, url };
}

/** La imagen se devuelve solo si es un link http o https que no apunta a una red local. */
export function imagenSegura(texto: unknown, base: URL): string | null {
  if (typeof texto !== "string" || texto.trim() === "") return null;
  try {
    const url = new URL(texto.trim(), base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password || url.href.length > LARGO_MAXIMO_URL) return null;
    const host = hostDe(url);
    if (esNombreBloqueado(host) || ((isIPv4(host) || isIPv6(host)) && esIpBloqueada(host))) return null;
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Sitios cuyos términos prohíben leerlos con un programa (Q5: X y LinkedIn, con sus links cortos).
 * No se piden, tampoco al final de una redirección: la persona completa la ficha a mano.
 */
const NO_DEJAN_LEER = ["x.com", "twitter.com", "t.co", "linkedin.com", "lnkd.in"];

export function esSitioQueNoDejaLeer(url: URL): boolean {
  const host = hostDe(url).toLowerCase().replace(/\.$/, "");
  return NO_DEJAN_LEER.some((sitio) => host === sitio || host.endsWith(`.${sitio}`));
}
