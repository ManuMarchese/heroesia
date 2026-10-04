import type { TarjetaAporteVista } from "@/vista/aportes";
import { AccionAporte } from "./AccionAporte";
import { ChipTipo } from "./ChipTipo";
import { Icono } from "./Icono";
import { RespuestasAporte } from "./RespuestasAporte";
import estilos from "./TarjetaAporte.module.css";

/** Tarjeta de aporte del prototipo: chip de tipo, autor, hace cuánto, prueba social y acción. */
export function TarjetaAporte({ tarjeta }: { tarjeta: TarjetaAporteVista }) {
  const vencida = tarjeta.vencimiento?.vencida ?? false;
  return (
    <article className={vencida ? `${estilos.tarjeta} ${estilos.vencida}` : estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <span className={estilos.chip}>
          <ChipTipo tipo={tarjeta.tipo} />
        </span>
        <p className={estilos.meta}>
          {tarjeta.autor} · {tarjeta.hace}
        </p>
      </div>
      <h3 className={estilos.titulo}>
        <a href={tarjeta.link} target="_blank" rel="noopener noreferrer">
          {tarjeta.titulo}
          <span className="solo-lectores"> (se abre en otra pestaña)</span>
        </a>
      </h3>
      <p className={estilos.texto}>{tarjeta.porQueSirve}</p>
      {tarjeta.comoSeUsa ? <p className={estilos.extra}>Cómo se usa: {tarjeta.comoSeUsa}</p> : null}
      {tarjeta.fuente ? <p className={estilos.extra}>Fuente: {tarjeta.fuente}</p> : null}
      {tarjeta.queMirar ? <p className={estilos.extra}>Qué mirar: {tarjeta.queMirar}</p> : null}
      <div className={estilos.pie}>
        <div className={estilos.social}>
          {tarjeta.vencimiento ? <span className={estilos.pastilla}>{tarjeta.vencimiento.texto}</span> : null}
          <span className={estilos.social}>
            {tarjeta.accion.cantidad > 0 ? <Icono nombre="check" tam={16} grosor={3} /> : null}
            {tarjeta.accion.textoSocial}
          </span>
        </div>
        <AccionAporte tarjeta={tarjeta} />
      </div>
      <RespuestasAporte tarjeta={tarjeta} />
    </article>
  );
}

export function ListaAportes({ tarjetas }: { tarjetas: readonly TarjetaAporteVista[] }) {
  return (
    <ul className={estilos.lista}>
      {tarjetas.map((tarjeta) => (
        <li key={tarjeta.id}>
          <TarjetaAporte tarjeta={tarjeta} />
        </li>
      ))}
    </ul>
  );
}
