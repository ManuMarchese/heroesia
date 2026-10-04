// Título, imagen y nombre del sitio de una página (Open Graph, Twitter y <title>). Se busca con indexOf,
// sin expresiones que puedan tardar de más con una página armada para eso.

export interface MetaPagina {
  titulo: string | null;
  imagen: string | null;
  sitio: string | null;
}

const NOMBRADAS: Readonly<Record<string, string>> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—",
  laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", middot: "·", copy: "©", reg: "®",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü", iexcl: "¡", iquest: "¿",
};

export function decodificarEntidades(texto: string): string {
  return texto.replace(/&(#[xX][0-9a-fA-F]{1,6}|#\d{1,7}|[a-zA-Z]{2,8});/g, (todo, cuerpo: string) => {
    if (cuerpo.startsWith("#")) {
      const hexa = cuerpo[1] === "x" || cuerpo[1] === "X";
      const codigo = parseInt(cuerpo.slice(hexa ? 2 : 1), hexa ? 16 : 10);
      const valido = codigo > 0 && codigo <= 0x10ffff && (codigo < 0xd800 || codigo > 0xdfff);
      return valido ? String.fromCodePoint(codigo) : todo;
    }
    return NOMBRADAS[cuerpo] ?? todo;
  });
}

/** Sin caracteres de control, en una línea y sin espacios de más; vacío = null. */
export function limpiar(texto: string | null | undefined): string | null {
  const limpio = (texto ?? "").replace(/[\p{Cc}\p{Cf}]/gu, " ").replace(/\s+/g, " ").trim();
  return limpio === "" ? null : limpio;
}

/** Corta a `maximo` caracteres (como cuenta validarAporte) con "…", sin partir un emoji. */
export function recortar(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto;
  let salida = "";
  for (const caracter of texto) {
    if (salida.length + caracter.length > maximo - 1) break;
    salida += caracter;
  }
  return `${salida.trimEnd()}…`;
}

const esEspacio = (c: string | undefined) => c === " " || c === "\n" || c === "\t" || c === "\r" || c === "\f";
const terminaNombre = (c: string | undefined) => c === undefined || esEspacio(c) || c === "=" || c === "/" || c === '"' || c === "'";

/** Atributos de una etiqueta, en una sola pasada (sin expresiones con retroceso). */
function atributos(etiqueta: string): Map<string, string> {
  const valores = new Map<string, string>();
  const n = etiqueta.length;
  let i = 0;
  while (i < n) {
    while (i < n && (esEspacio(etiqueta[i]) || etiqueta[i] === "/")) i++;
    const inicio = i;
    while (i < n && !terminaNombre(etiqueta[i])) i++;
    const nombre = etiqueta.slice(inicio, i).toLowerCase();
    while (i < n && esEspacio(etiqueta[i])) i++;
    if (etiqueta[i] !== "=") {
      if (i === inicio) i++;
      continue;
    }
    i++;
    while (i < n && esEspacio(etiqueta[i])) i++;
    let valor: string;
    const comilla = etiqueta[i];
    if (comilla === '"' || comilla === "'") {
      const cierre = etiqueta.indexOf(comilla, i + 1);
      const fin = cierre === -1 ? n : cierre;
      valor = etiqueta.slice(i + 1, fin);
      i = fin + 1;
    } else {
      const desde = i;
      while (i < n && !esEspacio(etiqueta[i])) i++;
      valor = etiqueta.slice(desde, i);
    }
    if (nombre && !valores.has(nombre)) valores.set(nombre, valor);
  }
  return valores;
}

/** Minúsculas solo en ASCII: el texto no cambia de largo y los índices siguen sirviendo. */
const minusculasAscii = (texto: string) => texto.replace(/[A-Z]+/g, (letras) => letras.toLowerCase());

/** Las etiquetas <meta> muy largas no son de título ni imagen: se saltean. */
const LARGO_MAXIMO_META = 4000;

/** Recorre las etiquetas <meta> del encabezado: la primera de cada clave gana. */
function metas(html: string, minusculas: string): Map<string, string> {
  const encontradas = new Map<string, string>();
  for (let desde = minusculas.indexOf("<meta"); desde !== -1; desde = minusculas.indexOf("<meta", desde + 5)) {
    const fin = minusculas.indexOf(">", desde);
    if (fin === -1) break;
    if (fin - desde > LARGO_MAXIMO_META) continue;
    const attrs = atributos(html.slice(desde + 5, fin));
    const clave = (attrs.get("property") ?? attrs.get("name") ?? "").toLowerCase();
    const contenido = attrs.get("content");
    if (clave && contenido !== undefined && !encontradas.has(clave)) encontradas.set(clave, decodificarEntidades(contenido));
  }
  return encontradas;
}

function etiquetaTitle(html: string, minusculas: string): string | null {
  const inicio = minusculas.indexOf("<title");
  if (inicio === -1) return null;
  const abre = minusculas.indexOf(">", inicio);
  const cierra = abre === -1 ? -1 : minusculas.indexOf("</title", abre);
  return cierra === -1 ? null : decodificarEntidades(html.slice(abre + 1, cierra));
}

export function extraerMeta(documento: string): MetaPagina {
  const finHead = minusculasAscii(documento).indexOf("</head");
  const html = finHead === -1 ? documento : documento.slice(0, finHead);
  const minusculas = minusculasAscii(html);
  const m = metas(html, minusculas);
  const titulo = limpiar(m.get("og:title")) ?? limpiar(m.get("twitter:title")) ?? limpiar(etiquetaTitle(html, minusculas));
  const imagen =
    m.get("og:image:secure_url") ?? m.get("og:image") ?? m.get("og:image:url") ?? m.get("twitter:image") ?? m.get("twitter:image:src");
  return { titulo, imagen: limpiar(imagen), sitio: limpiar(m.get("og:site_name")) };
}

/** Texto de la respuesta con el charset del encabezado o del <meta charset>; si no, UTF-8. */
export function decodificar(bytes: Buffer, tipoContenido: string | undefined): string {
  const delEncabezado = /charset\s*=\s*["']?([\w.:-]+)/i.exec(tipoContenido ?? "")?.[1];
  const delMeta = delEncabezado ? undefined : /<meta[^>]{0,200}charset\s*=\s*["']?([\w.:-]+)/i.exec(bytes.subarray(0, 4096).toString("latin1"))?.[1];
  try {
    return new TextDecoder(delEncabezado ?? delMeta ?? "utf-8").decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}
