// Validaciones de la entrada por email y de los destinos de redirección.

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BASE_FICTICIA = "https://heroes.invalid";

export function normalizarEmail(texto: unknown): string {
  return typeof texto === "string" ? texto.trim().toLowerCase() : "";
}

export function esEmailValido(email: string): boolean {
  return email.length <= 254 && PATRON_EMAIL.test(email);
}

/** Saca espacios y guiones: "123 456" → "123456". */
export function normalizarCodigo(texto: unknown): string {
  return typeof texto === "string" ? texto.replace(/[\s-]/g, "") : "";
}

/**
 * El mail trae un código de 6 dígitos (D32). Se aceptan hasta 10 por si el proyecto de Supabase
 * tiene configurado otro largo (NO VERIFICADO cuál usa el proyecto de Manu).
 */
export function esCodigoValido(codigo: string): boolean {
  return /^\d{6,10}$/.test(codigo);
}

/** Rutas de acceso: nunca se vuelve a ellas después de entrar (evita bucles). */
export function esRutaDeAcceso(ruta: string): boolean {
  return ruta === "/entrar" || ruta.startsWith("/entrar/") || ruta === "/auth" || ruta.startsWith("/auth/");
}

/** Solo rutas internas: evita redirecciones a otros sitios (//sitio.com, /\sitio.com, https://...). */
export function destinoSeguro(destino: unknown, porDefecto = "/"): string {
  if (typeof destino !== "string" || !destino.startsWith("/")) return porDefecto;
  try {
    const url = new URL(destino, BASE_FICTICIA);
    if (url.origin !== BASE_FICTICIA || esRutaDeAcceso(url.pathname)) return porDefecto;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return porDefecto;
  }
}

/** Origen del sitio según el pedido, para armar el link del mail (Supabase lo valida con su lista de URLs). */
export function origenDelPedido(encabezados: Pick<Headers, "get">): string | null {
  const origen = encabezados.get("origin");
  if (origen && /^https?:\/\/[^/\s]+$/.test(origen)) return origen;
  const host = encabezados.get("x-forwarded-host") ?? encabezados.get("host");
  if (!host || /[\s/]/.test(host)) return null;
  const protocolo = encabezados.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  return `${protocolo === "http" || (!protocolo && local) ? "http" : "https"}://${host}`;
}
