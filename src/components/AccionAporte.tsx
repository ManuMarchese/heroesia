import { ETIQUETA_HECHA, type TarjetaAporteVista } from "@/vista/aportes";
import { Icono } from "./Icono";
import estilos from "./TarjetaAporte.module.css";

const conXp = (xp: number) => (xp > 0 ? ` · +${xp} XP` : "");

/** La acción del tipo de aporte. Nadie reacciona a lo propio: el autor ve "Tu aporte". */
export function AccionAporte({ tarjeta }: { tarjeta: TarjetaAporteVista }) {
  const { accion, xpGanado } = tarjeta;
  if (tarjeta.esPropio) return <p className={estilos.estado}>Tu aporte{conXp(xpGanado)}</p>;
  if (accion.hecha) {
    return (
      <p className={`${estilos.estado} ${estilos.hecha}`}>
        <Icono nombre="check" tam={16} grosor={3} />
        {ETIQUETA_HECHA[accion.tipo]}
        {conXp(xpGanado)}
      </p>
    );
  }
  return (
    <button type="button" className="boton" disabled>
      {accion.etiqueta}
    </button>
  );
}
