import type { ReactNode } from "react";
import type { ParticipanteVista, VistaMision } from "@/vista/mision";
import estilos from "./TarjetaMision.module.css";

const COLORES = [estilos.color0, estilos.color1, estilos.color2];
const MAX_AVATARES = 5;

function Avatares({ participantes }: { participantes: readonly ParticipanteVista[] }) {
  if (participantes.length === 0) return <p className={estilos.nadie}>Todavía nadie sumó.</p>;
  const visibles = participantes.slice(0, MAX_AVATARES);
  const resto = participantes.length - visibles.length;
  return (
    <ul className={estilos.avatares} aria-label="Sumaron a la misión">
      {visibles.map((p, i) => (
        <li key={p.id} className={`${estilos.avatar} ${COLORES[i % COLORES.length]}`} title={p.nombre}>
          <span aria-hidden="true">{p.inicial}</span>
          <span className="solo-lectores">{p.nombre}</span>
        </li>
      ))}
      {resto > 0 ? (
        <li className={estilos.avatar}>
          <span aria-hidden="true">+{resto}</span>
          <span className="solo-lectores">y {resto} más</span>
        </li>
      ) : null}
    </ul>
  );
}

/**
 * Misión del equipo: etiqueta, título, segmentos de progreso y quiénes sumaron.
 * `formulario` (el capitán elige la misión) y `pie` (Copiar resumen) los pone la página.
 */
export function TarjetaMision({
  mision,
  formulario,
  pie,
}: {
  mision: VistaMision;
  formulario?: ReactNode;
  pie?: ReactNode;
}) {
  const { total, llenos } = mision.segmentos;
  return (
    <section className="panel" aria-labelledby="titulo-mision">
      <div className={estilos.cabecera}>
        <span className={estilos.etiqueta}>Misión del equipo</span>
        <span className={estilos.faltan}>{mision.faltan}</span>
      </div>
      <h2 id="titulo-mision" className={estilos.titulo}>
        {mision.titulo}
      </h2>
      <p className={estilos.detalle}>{mision.detalle}</p>
      <div className={estilos.progreso}>
        <div className={estilos.segmentos} aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < llenos ? `${estilos.segmento} ${estilos.lleno}` : estilos.segmento} />
          ))}
        </div>
        <p className={estilos.cuenta}>
          <span className="solo-lectores">Progreso: </span>
          {mision.hecho}/{mision.meta}
        </p>
      </div>
      {mision.completa ? <p className={estilos.cumplida}>¡Misión cumplida!</p> : null}
      {formulario}
      <div className={estilos.pie}>
        <Avatares participantes={mision.participantes} />
        {pie}
      </div>
    </section>
  );
}
