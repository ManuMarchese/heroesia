// Los mensajes de error viajan por la URL entre pantallas: solo se muestran los que la app conoce,
// así nadie arma un link con un texto inventado.
import { MENSAJES_ACCESO } from "./errores";
import { MENSAJES_UNION } from "./union";
import { MENSAJES_USUARIO } from "./usuario";

const CONOCIDOS = new Set<string>([
  ...Object.values(MENSAJES_ACCESO),
  ...Object.values(MENSAJES_UNION),
  ...Object.values(MENSAJES_USUARIO),
]);

export function mensajeConocido(texto: string | null | undefined): string | null {
  return texto && CONOCIDOS.has(texto) ? texto : null;
}
