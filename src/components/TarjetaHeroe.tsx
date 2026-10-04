import { textoRecord, type VistaHeroe } from "@/vista/heroe";
import estilos from "./TarjetaHeroe.module.css";

/** Tarjeta de héroe del prototipo: nivel, rango, clase, XP del nivel y récord personal. */
export function TarjetaHeroe({ heroe }: { heroe: VistaHeroe }) {
  const porcentaje = heroe.xpDelNivel > 0 ? Math.round((heroe.xpEnNivel / heroe.xpDelNivel) * 100) : 0;
  return (
    <section className={estilos.tarjeta} aria-label="Tu héroe">
      <p className={estilos.nivel}>
        <span className={estilos.etiqueta}>Nivel</span> <span className={estilos.numero}>{heroe.nivel}</span>
      </p>
      <div className={estilos.cuerpo}>
        <p className={estilos.etiqueta}>
          <span className="solo-lectores">Rango: </span>
          {heroe.rango}
        </p>
        <div className={estilos.fila}>
          <p className={estilos.clase}>
            <span className="solo-lectores">Clase: </span>
            {heroe.clase ?? "Sin clase"}
          </p>
          <p className={estilos.xp}>
            {heroe.xpEnNivel} / {heroe.xpDelNivel} XP
          </p>
        </div>
        <div
          className={estilos.barra}
          role="progressbar"
          aria-label={`XP para el nivel ${heroe.nivel + 1}`}
          aria-valuemin={0}
          aria-valuemax={heroe.xpDelNivel}
          aria-valuenow={heroe.xpEnNivel}
        >
          <div className={estilos.relleno} style={{ width: `${porcentaje}%` }} />
        </div>
        <p className={estilos.record}>{textoRecord(heroe)}</p>
      </div>
    </section>
  );
}
