// Direcciones que el servidor nunca pide (Q5, OWASP SSRF): locales, privadas, reservadas y especiales.
// No hay ningún interruptor para apagarlo: en los tests se inyecta un resolvedor falso, no se cambia esto.
import { isIPv4, isIPv6 } from "node:net";

/** Rangos IPv4 bloqueados (dirección base y bits del prefijo). */
const IPV4_BLOQUEADAS: readonly (readonly [string, number])[] = [
  ["0.0.0.0", 8], // "esta red"
  ["10.0.0.0", 8], // privada
  ["100.64.0.0", 10], // compartida (CGNAT)
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // enlace local (incluye la metadata de las nubes)
  ["172.16.0.0", 12], // privada
  ["192.0.0.0", 24], // asignaciones del IETF
  ["192.0.2.0", 24], // documentación
  ["192.88.99.0", 24], // relay 6to4
  ["192.168.0.0", 16], // privada
  ["198.18.0.0", 15], // pruebas de rendimiento
  ["198.51.100.0", 24], // documentación
  ["203.0.113.0", 24], // documentación
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reservada y broadcast
];

function numeroIpv4(ip: string): number | null {
  const partes = ip.split(".");
  if (partes.length !== 4) return null;
  let numero = 0;
  for (const parte of partes) {
    if (!/^\d{1,3}$/.test(parte) || Number(parte) > 255) return null;
    numero = numero * 256 + Number(parte);
  }
  return numero;
}

function ipv4Bloqueada(numero: number): boolean {
  return IPV4_BLOQUEADAS.some(([base, bits]) => {
    const inicio = numeroIpv4(base) ?? 0;
    return numero >= inicio && numero < inicio + 2 ** (32 - bits);
  });
}

/** Los 8 grupos de 16 bits de una IPv6 (acepta "::" y una IPv4 al final), o null si no es válida. */
export function gruposIpv6(ip: string): number[] | null {
  if (!isIPv6(ip)) return null;
  let texto = (ip.split("%")[0] ?? "").toLowerCase();
  let cola: number[] = [];
  const v4 = /(\d+\.\d+\.\d+\.\d+)$/.exec(texto)?.[1];
  if (v4) {
    const numero = numeroIpv4(v4);
    if (numero === null) return null;
    cola = [Math.floor(numero / 65536), numero % 65536];
    texto = texto.slice(0, -v4.length);
    if (texto.endsWith(":") && !texto.endsWith("::")) texto = texto.slice(0, -1);
  }
  const grupos = (parte: string) => (parte === "" ? [] : parte.split(":").map((g) => parseInt(g, 16)));
  const [izquierda, derecha] = texto.includes("::") ? texto.split("::") : [texto, null];
  const antes = grupos(izquierda ?? "");
  const despues = derecha === null || derecha === undefined ? [] : grupos(derecha);
  const ceros = 8 - antes.length - despues.length - cola.length;
  if (ceros < 0 || (derecha === null && ceros !== 0)) return null;
  return [...antes, ...new Array<number>(derecha === null ? 0 : ceros).fill(0), ...despues, ...cola];
}

function ipv6Bloqueada(g: number[]): boolean {
  const [g0 = 0, g1 = 0, g2 = 0, g3 = 0, g4 = 0, g5 = 0, g6 = 0, g7 = 0] = g;
  const v4 = g6 * 65536 + g7;
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0) {
    if (g5 === 0xffff) return ipv4Bloqueada(v4); // IPv4 mapeada (::ffff:a.b.c.d)
    return true; // ::, ::1 y las IPv4 compatibles (::/96)
  }
  if (g0 === 0x64 && g1 === 0xff9b && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0) return ipv4Bloqueada(v4); // NAT64
  if ((g0 & 0xe000) !== 0x2000) return true; // fuera de 2000::/3: local, enlace local, multicast, reservadas
  if (g0 === 0x2001 && g1 < 0x0200) return true; // 2001::/23 del IETF (Teredo, ORCHID, pruebas)
  if (g0 === 0x2001 && g1 === 0x0db8) return true; // documentación
  if (g0 === 0x2002) return true; // 6to4
  if (g0 === 0x3fff && g1 < 0x1000) return true; // documentación (3fff::/20)
  return false;
}

/** true si el servidor no debe conectarse a esa IP. Lo que no se entiende, se bloquea. */
export function esIpBloqueada(ip: string): boolean {
  if (isIPv4(ip)) {
    const numero = numeroIpv4(ip);
    return numero === null || ipv4Bloqueada(numero);
  }
  const grupos = gruposIpv6(ip);
  return grupos === null || ipv6Bloqueada(grupos);
}

/** Nombres que nunca se piden, aunque el DNS dijera otra cosa: localhost y nombres sin punto. */
export function esNombreBloqueado(host: string): boolean {
  const nombre = host.toLowerCase().replace(/\.$/, "");
  if (isIPv4(nombre) || isIPv6(nombre)) return false;
  return nombre === "" || nombre === "localhost" || nombre.endsWith(".localhost") || !nombre.includes(".");
}
