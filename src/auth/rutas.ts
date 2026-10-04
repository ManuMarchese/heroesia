// Qué hace el proxy con cada pedido. Es un chequeo optimista: la verificación fuerte es requireUser().
import { destinoSeguro } from "./validacion";

export const RUTA_ENTRAR = "/entrar";

export type Decision = { tipo: "seguir" } | { tipo: "redirigir"; destino: string };

export function decidirAcceso({
  ruta,
  busqueda = "",
  hayUsuario,
}: {
  ruta: string;
  busqueda?: string;
  hayUsuario: boolean;
}): Decision {
  if (ruta === "/auth" || ruta.startsWith("/auth/")) return { tipo: "seguir" };
  if (ruta === RUTA_ENTRAR) {
    if (!hayUsuario) return { tipo: "seguir" };
    return { tipo: "redirigir", destino: destinoSeguro(new URLSearchParams(busqueda).get("next")) };
  }
  if (hayUsuario) return { tipo: "seguir" };
  const volverA = destinoSeguro(`${ruta}${busqueda}`);
  return { tipo: "redirigir", destino: volverA === "/" ? RUTA_ENTRAR : `${RUTA_ENTRAR}?next=${encodeURIComponent(volverA)}` };
}
