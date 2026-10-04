"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono } from "./Icono";
import { ITEMS_NAVEGACION, estaActivo } from "./navegacion";
import estilos from "./NavegacionInferior.module.css";

export function NavegacionInferior() {
  const rutaActual = usePathname();

  return (
    <nav className={estilos.barra} aria-label="Principal">
      {ITEMS_NAVEGACION.map((item) => {
        const activo = estaActivo(rutaActual, item.href);
        if (item.destacado) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={estilos.mas}
              aria-label={item.etiqueta}
              aria-current={activo ? "page" : undefined}
            >
              <Icono nombre={item.icono} tam={26} grosor={3} />
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={activo ? `${estilos.item} ${estilos.activo}` : estilos.item}
            aria-current={activo ? "page" : undefined}
          >
            <Icono nombre={item.icono} />
            {item.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
