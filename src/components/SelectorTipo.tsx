import Link from "next/link";
import { ETIQUETA_TIPO } from "@/domain/aportes";
import { TIPOS_APORTE, type TipoAporte } from "@/domain/tipos";
import estilos from "./Pantallas.module.css";

/** Selector de tipo de Explorar: un link por tipo, sin búsqueda de texto (D6). */
export function SelectorTipo({ actual }: { actual: TipoAporte }) {
  return (
    <nav aria-label="Tipos de aporte">
      <ul className={estilos.tipos}>
        {TIPOS_APORTE.map((tipo) => (
          <li key={tipo}>
            <Link
              href={`/explorar?tipo=${tipo}`}
              className={estilos.tipo}
              aria-current={tipo === actual ? "page" : undefined}
              scroll={false}
            >
              {ETIQUETA_TIPO[tipo]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
