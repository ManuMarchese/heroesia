import type { NombreIcono } from "./Icono";

export type ItemNavegacion = {
  href: string;
  etiqueta: string;
  icono: NombreIcono;
  destacado?: boolean;
};

export const ITEMS_NAVEGACION: readonly ItemNavegacion[] = [
  { href: "/", etiqueta: "Inicio", icono: "inicio" },
  { href: "/explorar", etiqueta: "Explorar", icono: "explorar" },
  { href: "/publicar", etiqueta: "Publicar", icono: "mas", destacado: true },
  { href: "/perfil", etiqueta: "Perfil", icono: "perfil" },
];

export function estaActivo(rutaActual: string, href: string): boolean {
  if (href === "/") return rutaActual === "/";
  return rutaActual === href || rutaActual.startsWith(`${href}/`);
}
