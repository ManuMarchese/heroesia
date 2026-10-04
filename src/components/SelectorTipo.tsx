import Link from "next/link";
import { ETIQUETA_TIPO } from "@/domain/aportes";
import { TIPOS_APORTE, type TipoAporte } from "@/domain/tipos";
import estilos from "./Pantallas.module.css";

const OPCIONES: readonly { clave: TipoAporte | "todos"; etiqueta: string; href: string }[] = [
  { clave: "todos", etiqueta: "Todos", href: "/explorar" },
  ...TIPOS_APORTE.map((tipo) => ({ clave: tipo, etiqueta: ETIQUETA_TIPO[tipo], href: `/explorar?tipo=${tipo}` })),
];

/** Selector de Explorar: Todos (por defecto) y un link por tipo, sin búsqueda de texto (D6, D44). */
export function SelectorTipo({ actual }: { actual: TipoAporte | "todos" }) {
  return (
    <nav aria-label="Tipos de aporte">
      <ul className={estilos.tipos}>
        {OPCIONES.map((opcion) => (
          <li key={opcion.clave}>
            <Link
              href={opcion.href}
              className={estilos.tipo}
              aria-current={opcion.clave === actual ? "page" : undefined}
              scroll={false}
            >
              {opcion.etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
