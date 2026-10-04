import { ETIQUETA_TIPO } from "@/domain/aportes";
import type { TipoAporte } from "@/domain/tipos";
import estilos from "./ChipTipo.module.css";

export function ChipTipo({ tipo }: { tipo: TipoAporte }) {
  return <span className={`${estilos.chip} ${estilos[tipo]}`}>{ETIQUETA_TIPO[tipo]}</span>;
}
